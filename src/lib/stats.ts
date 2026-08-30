import { queryOData, getEntities, getAllSubmissions, fetchActiveProjects, ActiveProject } from "./odk"
import { getCached, setCache } from "./cache"
import { log } from "./logger"
import { RIGHTS_FIELDS } from "@/types"
import type {
  TimelinePoint, CityStat, AgentStat, DemographicProfile,
  RightsIndicator, MultiSelectIndicator, MultiSelectItem,
  CityMultiSelectEntry, CityRightsEntry, MapPoint,
} from "@/types"

/* ------------------------------------------------------------------ */
/* Labels                                                              */
/* ------------------------------------------------------------------ */

const LABEL_MAP: Record<string, Record<string, string>> = {
  genero: {
    masculino: "Masculino", feminino: "Feminino",
    outro: "Outro", nao_binario: "Não binário", "ns_nr": "Não sabe/Não respondeu",
  },
  cor_etnia: {
    branca: "Branca", preta: "Preta", parda: "Parda",
    amarela: "Amarela", indígena: "Indígena", indigena: "Indígena",
    "ns_nr": "Não sabe",
  },
  escolaridade: {
    analfabeto: "Analfabeto", nao_alfabetizado: "Não alfabetizado",
    fundamental_incompleto: "Fund. Incompleto",
    fundamental_completo: "Fund. Completo", medio_incompleto: "Médio Incompleto",
    medio_completo: "Médio Completo", superior_incompleto: "Superior Incompleto",
    superior_completo: "Superior Completo", pos_graduacao_incompleta: "Pós incompleta",
    pos_graduacao_completa: "Pós completa", "ns_nr": "Não sabe",
  },
  avaliacao_saude: {
    muito_boa: "Muito Boa", boa: "Boa", regular: "Regular",
    ruim: "Ruim", muito_ruim: "Muito Ruim", "ns_nr": "Não sabe",
  },
  renda: {
    nenhuma: "Nenhuma", sem_renda: "Sem renda",
    um_sm: "Até 1 SM", ate_meio_sm: "Até meio SM",
    acima_um_ate_dois_sm: "1 a 2 SM", acima_dois_ate_quatro_sm: "2 a 4 SM",
    acima_quatro_sm: "Acima de 4 SM", "ns_nr": "Não sabe",
  },
}

function label(category: string, key: string) {
  return LABEL_MAP[category]?.[key] ?? key
}

/* ------------------------------------------------------------------ */
/* Normalização de município                                           */
/* ------------------------------------------------------------------ */

const MUNICIPIO_CORRECOES: Record<string, string> = {
  invinhema: "Ivinhema",
}

/** Corrige typos/acentos conhecidos nos nomes de município vindos do ODK. */
export function normalizarMunicipio(nome: string): string {
  const key = nome.trim().toLowerCase()
  return MUNICIPIO_CORRECOES[key] ?? nome.trim()
}

interface OdkEntityLabel {
  uuid: string
  currentVersion?: { label?: string } | null
}

/** Extrai cidade/UF do label da entidade (formato "...|Bairro-Cidade/uf|uuid"). */
function cidadeDaEntidade(e: OdkEntityLabel): { cidade: string; uf: string } | null {
  const label = e.currentVersion?.label ?? ""
  const afterPipe = label.split("|")[1] || ""
  const match = afterPipe.match(/.*-([^/]+)\/([a-z]{2,3})$/i)
  if (!match) return null
  return { cidade: normalizarMunicipio(match[1]?.trim() ?? ""), uf: (match[2] ?? "").toUpperCase() }
}

/* ------------------------------------------------------------------ */
/* Tipos das submissões OData                                          */
/* ------------------------------------------------------------------ */

interface SubmissionRow {
  preliminar?: {
    nome_agente?: string
    municipio?: string
    municipio_nome?: string
    uf?: string
    bairro?: string
    nome_pessoa_idosa?: string
    pessoa_idosa?: string
    localizacao?: {
      coordinates?: number[]
      properties?: { accuracy?: number }
    }
  }
  entrevista?: Record<string, unknown>
  __system?: { submissionDate?: string; submitterName?: string; submitterId?: string }
  __id?: string
}

interface SocioDemo {
  idade?: number
  genero?: string
  cor_etnia?: string
  escolaridade?: string
}

interface TrabalhoRenda {
  renda_familiar_mensal?: string
  renda_individual_mensal?: string
}

interface CondicaoSaude {
  avaliacao_saude?: string
}

function socioDemo(v: SubmissionRow): SocioDemo | undefined {
  const s = v.entrevista?.aspectos_sociodemograficos
  return s as SocioDemo | undefined
}

function trabalhoRenda(v: SubmissionRow): TrabalhoRenda | undefined {
  const t = v.entrevista?.trabalho_renda
  return t as TrabalhoRenda | undefined
}

function condicaoSaude(v: SubmissionRow): CondicaoSaude | undefined {
  const c = v.entrevista?.condicao_geral_saude
  return c as CondicaoSaude | undefined
}

/* ------------------------------------------------------------------ */
/* Projetos                                                            */
/* ------------------------------------------------------------------ */

async function getProjects(projectId?: number): Promise<ActiveProject[]> {
  const all = await fetchActiveProjects()
  return projectId
    ? all.filter((p) => p.id === projectId)
    : all
}

/* ------------------------------------------------------------------ */
/* KPIs                                                                */
/* ------------------------------------------------------------------ */

export async function getKPIs(projectId?: number) {
  const projects = await getProjects(projectId)
  let totalIdosos = 0
  let totalParte1 = 0
  let totalParte2 = 0
  let totalAgents = 0
  let lastSubmissionDate: string | null = null
  const citySet = new Set<string>()
  const perProject: Record<number, { submissions: number; parte1: number; parte2: number; agents: number; idosos: number }> = {}

  for (const p of projects) {
    try {
      const [p1, p2, agents, idosos] = await Promise.all([
        queryOData(p.id, "form_parte_1", 1).catch(() => ({ "@odata.count": 0, value: [] as unknown[] })),
        queryOData(p.id, "form_parte_2", 1).catch(() => ({ "@odata.count": 0, value: [] as unknown[] })),
        getEntities(p.id, "Agentes").catch(() => []),
        getEntities(p.id, "pessoas_idosas").catch(() => []),
      ])
      const c1 = p1["@odata.count"] ?? 0
      const c2 = p2["@odata.count"] ?? 0
      const agentCount = agents.length
      const idosoCount = idosos.length || c1
      totalParte1 += c1
      totalParte2 += c2
      totalIdosos += idosoCount
      totalAgents += agentCount
      perProject[p.id] = { submissions: c1 + c2, parte1: c1, parte2: c2, agents: agentCount, idosos: idosoCount }

      for (const e of idosos) {
        const c = cidadeDaEntidade(e)
        if (c) citySet.add(`${p.id}:${c.cidade}`)
      }

      for (const d of [p1, p2]) {
        const value = d.value as unknown[] | undefined
        const sd = (value?.[0] as SubmissionRow | undefined)?.__system?.submissionDate
        if (sd && (!lastSubmissionDate || sd > lastSubmissionDate)) lastSubmissionDate = sd
      }
    } catch {
      perProject[p.id] = { submissions: 0, parte1: 0, parte2: 0, agents: 0, idosos: 0 }
    }
  }

  log("stats", "getKPIs", { projects: projects.length, totalIdosos, totalParte1, totalParte2, totalAgents, lastSubmissionDate, cities: citySet.size })

  return {
    totalIdosos,
    totalSubmissions: totalParte1 + totalParte2,
    totalParte1,
    totalParte2,
    totalProjects: projects.length,
    totalCities: citySet.size,
    totalAgents,
    lastSubmissionDate,
    perProject,
  }
}

/* ------------------------------------------------------------------ */
/* Timeline                                                            */
/* ------------------------------------------------------------------ */

const TIMELINE_CACHE_TTL = 5 * 60 * 1000

export async function getSubmissionsTimeline(projectId?: number, city?: string): Promise<TimelinePoint[]> {
  const cacheKey = `timeline:${projectId ?? "all"}:${city ?? "all"}`
  const cached = getCached(cacheKey)
  if (cached) return cached as TimelinePoint[]

  const projects = await getProjects(projectId)
  const daily: Record<string, TimelinePoint> = {}
  const filterCity = city ? normalizarMunicipio(city) : ""

  for (const p of projects) {
    let cityLookup: Record<string, string> | null = null
    if (filterCity) {
      try {
        const entities = await getEntities(p.id, "pessoas_idosas")
        cityLookup = {}
        for (const e of entities) {
          const c = cidadeDaEntidade(e)
          if (c) cityLookup[e.uuid] = c.cidade
        }
      } catch {
        cityLookup = {}
      }
    }

    for (const form of ["form_parte_1", "form_parte_2"]) {
      try {
        const values = await getAllSubmissions(p.id, form) as SubmissionRow[]
        for (const v of values) {
          if (filterCity) {
            if (form === "form_parte_1") {
              const submissionCity = normalizarMunicipio(v.preliminar?.municipio_nome ?? "")
              if (submissionCity.toLowerCase() !== filterCity.toLowerCase()) continue
            } else {
              const uuid = v.preliminar?.pessoa_idosa ?? ""
              const entityCity = normalizarMunicipio(cityLookup?.[uuid] ?? "")
              if (entityCity.toLowerCase() !== filterCity.toLowerCase()) continue
            }
          }
          const date = v.__system?.submissionDate
          if (!date) continue
          const day = date.slice(0, 10)
          if (!daily[day]) {
            daily[day] = { date: day, parte1: 0, parte2: 0, total: 0 }
          }
          if (form === "form_parte_1") daily[day].parte1++
          else daily[day].parte2++
          daily[day].total++
        }
      } catch {
        /* skip */
      }
    }
  }

  const result = Object.values(daily).sort((a, b) => a.date.localeCompare(b.date))
  setCache(cacheKey, result, TIMELINE_CACHE_TTL)
  return result
}

/* ------------------------------------------------------------------ */
/* Municípios                                                          */
/* ------------------------------------------------------------------ */

export async function getCityStats(projectId?: number): Promise<CityStat[]> {
  const projects = await getProjects(projectId)
  const stats: Record<string, CityStat> = {}

  for (const p of projects) {
    try {
      const entities = await getEntities(p.id, "pessoas_idosas").catch(() => [])
      const cityCount: Record<string, { count: number; uf: string }> = {}
      for (const e of entities) {
        const c = cidadeDaEntidade(e)
        if (!c) continue
        if (!cityCount[c.cidade]) cityCount[c.cidade] = { count: 0, uf: c.uf }
        cityCount[c.cidade].count++
      }
      for (const [city, info] of Object.entries(cityCount)) {
        const key = `${p.id}-${city}`
        stats[key] = {
          projectId: p.id, projectName: p.name,
          city, uf: info.uf,
          submissions: info.count, agents: 0,
        }
      }
    } catch {
      /* skip */
    }
  }

  return Object.values(stats).sort((a, b) => b.submissions - a.submissions)
}

/* ------------------------------------------------------------------ */
/* Agentes                                                             */
/* ------------------------------------------------------------------ */

export async function getAgentRanking(projectId?: number): Promise<AgentStat[]> {
  const projects = await getProjects(projectId)
  const agentMap: Record<string, AgentStat> = {}

  // Build canonical name lookup from Agentes entities for each project
  const entityLookup: Record<number, Record<string, string>> = {}
  for (const p of projects) {
    try {
      const entities = await getEntities(p.id, "Agentes")
      const lookup: Record<string, string> = {}
      for (const e of entities) {
        const name = (e.currentVersion?.label as string | undefined)?.split(" - ")[0]?.trim()
        if (name) lookup[name.toLowerCase()] = name
      }
      entityLookup[p.id] = lookup
    } catch {
      entityLookup[p.id] = {}
    }
  }

  for (const p of projects) {
    for (const form of ["form_parte_1", "form_parte_2"]) {
      try {
        const values = await getAllSubmissions(p.id, form) as SubmissionRow[]
        for (const v of values) {
          const rawName = v.preliminar?.nome_agente || v.__system?.submitterName || "desconhecido"
          const normalized = rawName.trim().toLowerCase()
          const canonicalName = entityLookup[p.id]?.[normalized] || rawName.trim()
          const city = normalizarMunicipio(v.preliminar?.municipio_nome ?? "")
          if (!agentMap[canonicalName]) {
            agentMap[canonicalName] = {
              name: canonicalName, projectId: p.id, projectName: p.name,
              city, submissions: 0, parte1: 0, parte2: 0,
              lastSubmission: v.__system?.submissionDate ?? "",
            }
          }
          agentMap[canonicalName].submissions++
          if (form === "form_parte_1") agentMap[canonicalName].parte1++
          else agentMap[canonicalName].parte2++
          const sd = v.__system?.submissionDate
          if (sd && sd > agentMap[canonicalName].lastSubmission) agentMap[canonicalName].lastSubmission = sd
        }
      } catch {
        /* skip */
      }
    }
  }

  return Object.values(agentMap)
    .sort((a, b) => b.submissions - a.submissions)
}

/* ------------------------------------------------------------------ */
/* Perfil demográfico                                                  */
/* ------------------------------------------------------------------ */

export async function getDemographics(projectId?: number): Promise<DemographicProfile> {
  const projects = await getProjects(projectId)
  const idade: Record<string, number> = { "60-69": 0, "70-79": 0, "80+": 0 }
  const genero: Record<string, number> = {}
  const cor_etnia: Record<string, number> = {}
  const escolaridade: Record<string, number> = {}
  const renda: Record<string, number> = {}
  const rendaFamiliar: Record<string, number> = {}
  const avaliacao_saude: Record<string, number> = {}

  for (const p of projects) {
    try {
      const values = await getAllSubmissions(p.id, "form_parte_1") as SubmissionRow[]
      for (const v of values) {
        const s = socioDemo(v)
        if (s?.idade) {
          if (s.idade < 70) idade["60-69"]++
          else if (s.idade < 80) idade["70-79"]++
          else idade["80+"]++
        }
        if (s?.genero) genero[s.genero] = (genero[s.genero] || 0) + 1
        if (s?.cor_etnia) cor_etnia[s.cor_etnia] = (cor_etnia[s.cor_etnia] || 0) + 1
        if (s?.escolaridade) escolaridade[s.escolaridade] = (escolaridade[s.escolaridade] || 0) + 1

        const tr = trabalhoRenda(v)
        if (tr?.renda_individual_mensal) renda[tr.renda_individual_mensal] = (renda[tr.renda_individual_mensal] || 0) + 1
        if (tr?.renda_familiar_mensal) rendaFamiliar[tr.renda_familiar_mensal] = (rendaFamiliar[tr.renda_familiar_mensal] || 0) + 1

        const cs = condicaoSaude(v)
        if (cs?.avaliacao_saude) avaliacao_saude[cs.avaliacao_saude] = (avaliacao_saude[cs.avaliacao_saude] || 0) + 1
      }
    } catch {
      /* skip */
    }
  }

  return {
    idade: Object.entries(idade).map(([faixa, count]) => ({ faixa, count })),
    genero: Object.entries(genero).map(([k, count]) => ({ label: label("genero", k), count })),
    cor_etnia: Object.entries(cor_etnia).map(([k, count]) => ({ label: label("cor_etnia", k), count })),
    escolaridade: Object.entries(escolaridade).map(([k, count]) => ({ label: label("escolaridade", k), count })),
    renda: Object.entries(renda).map(([k, count]) => ({ label: label("renda", k), count })),
    rendaFamiliar: Object.entries(rendaFamiliar).map(([k, count]) => ({ label: label("renda", k), count })),
    avaliacao_saude: Object.entries(avaliacao_saude).map(([k, count]) => ({ label: label("avaliacao_saude", k), count })),
  }
}

/* ------------------------------------------------------------------ */
/* Direitos (Parte 2)                                                  */
/* ------------------------------------------------------------------ */

type RightsTotals = Record<string, { sim: number; nao: number; total: number }>

function computeRights(values: SubmissionRow[], fields: readonly { key: string; name: string }[]): RightsTotals {
  const rights: RightsTotals = {}
  for (const f of fields) {
    rights[f.key] = { sim: 0, nao: 0, total: 0 }
  }
  for (const v of values) {
    const e = v.entrevista
    if (!e) continue
    for (const f of fields) {
      const val = e[f.key]
      if (val === "sim") rights[f.key].sim++
      else if (val === "nao") rights[f.key].nao++
      rights[f.key].total++
    }
  }
  return rights
}

function rightsFromTotals(totals: RightsTotals, fields: readonly { key: string; name: string }[]): RightsIndicator[] {
  return fields.map((f) => ({
    ...f,
    ...totals[f.key],
    percentual: totals[f.key].total > 0
      ? Math.round((totals[f.key].sim / totals[f.key].total) * 100)
      : 0,
  }))
}

export async function getRightsIndicators(projectId?: number): Promise<RightsIndicator[]> {
  const projects = await getProjects(projectId)
  const rights: RightsTotals = {}
  for (const f of RIGHTS_FIELDS) {
    rights[f.key] = { sim: 0, nao: 0, total: 0 }
  }

  for (const p of projects) {
    try {
      const values = await getAllSubmissions(p.id, "form_parte_2") as SubmissionRow[]
      const pr = computeRights(values, RIGHTS_FIELDS)
      for (const f of RIGHTS_FIELDS) {
        rights[f.key].sim += pr[f.key].sim
        rights[f.key].nao += pr[f.key].nao
        rights[f.key].total += pr[f.key].total
      }
    } catch {
      /* skip */
    }
  }

  return rightsFromTotals(rights, RIGHTS_FIELDS)
}

/* ------------------------------------------------------------------ */
/* Multi-select (desdobramentos)                                       */
/* ------------------------------------------------------------------ */

const MULTI_SELECT_FIELDS = [
  {
    key: "violencia",
    name: "Qual tipo de violência?",
    gateKey: "sofreu_violencia",
    gateName: "Sofreu violência",
    items: [
      { key: "fisica", label: "Violência física" },
      { key: "sexual", label: "Violência sexual" },
      { key: "psicologica", label: "Violência psicológica" },
      { key: "patrimonial_financeira", label: "Violência patrimonial, abuso financeiro ou material" },
      { key: "discriminacao", label: "Discriminação" },
      { key: "negligencia", label: "Negligência" },
      { key: "abandono", label: "Abandono" },
      { key: "institucional", label: "Violência institucional" },
    ],
  },
  {
    key: "educacao_tipos",
    name: "Dificuldade de acesso à educação",
    gateKey: "dificuldade_educacao",
    gateName: "Dificuldade acesso à educação",
    items: [
      { key: "permanencia", label: "Permanência" },
      { key: "acesso", label: "Acesso" },
      { key: "locomocao", label: "Locomoção" },
    ],
  },
  {
    key: "reuniao_tipos",
    name: "Dificuldade de reunião/manifestação",
    gateKey: "impedido_reuniao_manifestacao",
    gateName: "Impedido de reunião/manifestação",
    items: [
      { key: "politico", label: "Político" },
      { key: "sindical", label: "Sindical" },
      { key: "civico", label: "Cívico" },
      { key: "social", label: "Social" },
      { key: "esportivo", label: "Esportivo" },
      { key: "outros", label: "Outro" },
    ],
  },
  {
    key: "dificuldade_cuidados_tipos",
    name: "Dificuldade com cuidados",
    gateKey: "dificuldade_cuidados",
    gateName: "Dificuldade com cuidados",
    items: [
      { key: "saude", label: "Saúde" },
      { key: "assistencia_social", label: "Assistência social" },
      { key: "seguranca", label: "Segurança" },
      { key: "alimentacao", label: "Alimentação" },
      { key: "agua", label: "Água" },
      { key: "vestuario", label: "Vestuário" },
      { key: "habitacao", label: "Habitação" },
    ],
  },
]

type MultiTotals = Record<string, { gateSim: number; items: Record<string, number> }>

function newMultiSelectTotals(): MultiTotals {
  const totals: MultiTotals = {}
  for (const f of MULTI_SELECT_FIELDS) {
    const items: Record<string, number> = {}
    for (const it of f.items) items[it.key] = 0
    totals[f.key] = { gateSim: 0, items }
  }
  return totals
}

function accumulateMultiSelect(values: SubmissionRow[], totals: MultiTotals): void {
  for (const v of values) {
    const e = v.entrevista
    if (!e) continue
    for (const f of MULTI_SELECT_FIELDS) {
      if (e[f.gateKey] === "sim") totals[f.key].gateSim++
      const raw = e[f.key]
      if (typeof raw !== "string" || raw === "") continue
      for (const token of raw.split(" ")) {
        const t = token.trim()
        if (t && totals[f.key].items[t] !== undefined) totals[f.key].items[t]++
      }
    }
  }
}

function multiSelectFromTotals(totals: MultiTotals): MultiSelectIndicator[] {
  return MULTI_SELECT_FIELDS.map((f) => ({
    key: f.key,
    name: f.name,
    gateKey: f.gateKey,
    gateName: f.gateName,
    gateSim: totals[f.key].gateSim,
    items: f.items.map((it): MultiSelectItem => {
      const count = totals[f.key].items[it.key]
      return {
        key: it.key,
        label: it.label,
        count,
        percentual: totals[f.key].gateSim > 0
          ? Math.round((count / totals[f.key].gateSim) * 100)
          : 0,
      }
    }),
  }))
}

export async function getMultiSelectIndicators(projectId?: number): Promise<MultiSelectIndicator[]> {
  const projects = await getProjects(projectId)
  const totals = newMultiSelectTotals()

  for (const p of projects) {
    try {
      const values = await getAllSubmissions(p.id, "form_parte_2") as SubmissionRow[]
      accumulateMultiSelect(values, totals)
    } catch {
      /* skip */
    }
  }

  return multiSelectFromTotals(totals)
}

/* ------------------------------------------------------------------ */
/* Direitos e multi-select por município                               */
/* ------------------------------------------------------------------ */

interface CityAccumulator {
  city: string
  projectName: string
  projectId: number
  totals: MultiTotals
}

interface CityRightsAccumulator {
  city: string
  projectName: string
  projectId: number
  totals: RightsTotals
}

async function buildCityLookup(projectId: number): Promise<Record<string, { cidade: string; uf: string }>> {
  try {
    const entities = await getEntities(projectId, "pessoas_idosas").catch(() => [])
    const lookup: Record<string, { cidade: string; uf: string }> = {}
    for (const e of entities) {
      const c = cidadeDaEntidade(e)
      if (c) lookup[e.uuid] = c
    }
    return lookup
  } catch {
    return {}
  }
}

export async function getMultiSelectIndicatorsByCity(projectId?: number): Promise<CityMultiSelectEntry[]> {
  const projects = await getProjects(projectId)
  const cityMap: Record<string, CityAccumulator> = {}

  for (const p of projects) {
    try {
      const cityLookup = await buildCityLookup(p.id)

      const values = await getAllSubmissions(p.id, "form_parte_2") as SubmissionRow[]
      for (const v of values) {
        const uuid = v.preliminar?.pessoa_idosa
        if (!uuid) continue
        const c = cityLookup[uuid]
        if (!c) continue
        const key = `${p.id}-${c.cidade}`
        if (!cityMap[key]) {
          cityMap[key] = { city: c.cidade, projectName: p.name, projectId: p.id, totals: newMultiSelectTotals() }
        }
        accumulateMultiSelect([v], cityMap[key].totals)
      }
    } catch {
      /* skip */
    }
  }

  return Object.values(cityMap).map((entry) => ({
    city: entry.city,
    projectName: entry.projectName,
    projectId: entry.projectId,
    indicators: multiSelectFromTotals(entry.totals),
  }))
}

export async function getRightsIndicatorsByCity(projectId?: number): Promise<CityRightsEntry[]> {
  const projects = await getProjects(projectId)
  const cityMap: Record<string, CityRightsAccumulator> = {}

  for (const p of projects) {
    try {
      const cityLookup = await buildCityLookup(p.id)

      const values = await getAllSubmissions(p.id, "form_parte_2") as SubmissionRow[]
      for (const v of values) {
        const uuid = v.preliminar?.pessoa_idosa
        if (!uuid) continue
        const c = cityLookup[uuid]
        if (!c) continue
        const key = `${p.id}-${c.cidade}`
        if (!cityMap[key]) {
          const totals: RightsTotals = {}
          for (const f of RIGHTS_FIELDS) {
            totals[f.key] = { sim: 0, nao: 0, total: 0 }
          }
          cityMap[key] = { city: c.cidade, projectName: p.name, projectId: p.id, totals }
        }
        const pr = computeRights([v], RIGHTS_FIELDS)
        for (const f of RIGHTS_FIELDS) {
          cityMap[key].totals[f.key].sim += pr[f.key].sim
          cityMap[key].totals[f.key].nao += pr[f.key].nao
          cityMap[key].totals[f.key].total += pr[f.key].total
        }
      }
    } catch {
      /* skip */
    }
  }

  const result = Object.values(cityMap).map((entry) => ({
    city: entry.city,
    projectName: entry.projectName,
    projectId: entry.projectId,
    indicators: rightsFromTotals(entry.totals, RIGHTS_FIELDS),
  }))

  log("stats", "getRightsIndicatorsByCity", { cities: result.map(r => `${r.city}(${r.indicators.reduce((s, i) => s + i.sim, 0)})`) })

  return result
}

/* ------------------------------------------------------------------ */
/* Mapa de pontos (localização das pessoas idosas)                     */
/* ------------------------------------------------------------------ */

const MAP_POINTS_TTL = 10 * 60 * 1000

const MAP_FORMS = [
  { form: "parte1", formId: "form_parte_1" },
  { form: "parte2", formId: "form_parte_2" },
] as const

/**
 * Pontos geográficos por submissão com localização preenchida.
 * Só entram registros cujo formulário capturou coordenadas (sem viés de cidade).
 */
export async function getMapPoints(projectId?: number): Promise<MapPoint[]> {
  const cacheKey = `map-points:${projectId ?? "all"}`
  const cached = getCached(cacheKey)
  if (cached) return cached as MapPoint[]

  const projects = await getProjects(projectId)
  const points: MapPoint[] = []

  for (const p of projects) {
    let cityLookup: Record<string, { cidade: string; uf: string }> = {}
    try {
      cityLookup = await buildCityLookup(p.id)
    } catch {
      cityLookup = {}
    }

    for (const { form, formId } of MAP_FORMS) {
      try {
        const count = await queryOData(p.id, formId, 1).catch(() => ({ "@odata.count": 0 }))
        if (!count["@odata.count"]) continue
        const values = await getAllSubmissions(p.id, formId) as SubmissionRow[]
        for (const v of values) {
          const coords = v.preliminar?.localizacao?.coordinates
          if (!coords || coords.length < 2) continue
          const lon = coords[0]
          const lat = coords[1]
          if (typeof lon !== "number" || typeof lat !== "number" || !Number.isFinite(lat) || !Number.isFinite(lon)) continue

          let cidade = ""
          let uf = ""
          if (form === "parte1") {
            cidade = normalizarMunicipio(v.preliminar?.municipio_nome ?? "")
            uf = (v.preliminar?.uf ?? "").toUpperCase()
          } else {
            const c = cityLookup[v.preliminar?.pessoa_idosa ?? ""]
            cidade = c?.cidade ?? ""
            uf = c?.uf ?? ""
          }

          points.push({
            lat: Number(lat.toFixed(5)),
            lon: Number(lon.toFixed(5)),
            accuracy: Math.round(v.preliminar?.localizacao?.properties?.accuracy ?? 0),
            cidade,
            uf,
            bairro: (v.preliminar?.bairro ?? "").trim(),
            projectId: p.id,
            projectName: p.name,
            form,
            data: v.__system?.submissionDate?.slice(0, 10) ?? "",
          })
        }
      } catch {
        /* skip */
      }
    }
  }

  setCache(cacheKey, points, MAP_POINTS_TTL)
  log("stats", "getMapPoints", { projects: projects.length, points: points.length })
  return points
}