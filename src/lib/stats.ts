import { queryOData, getEntities, ACTIVE_PROJECTS, PROJECT_CITIES } from "./odk"
import { log } from "./logger"
import type {
  TimelinePoint, CityStat, AgentStat, DemographicProfile,
  RightsIndicator,
} from "@/types"

const LABEL_MAP: Record<string, Record<string, string>> = {
  genero: {
    masculino: "Masculino", feminino: "Feminino",
    outro: "Outro", "ns_nr": "Não sabe/Não respondeu",
  },
  cor_etnia: {
    branca: "Branca", preta: "Preta", parda: "Parda",
    amarela: "Amarela", indígena: "Indígena", "ns_nr": "Não sabe",
  },
  escolaridade: {
    analfabeto: "Analfabeto", fundamental_incompleto: "Fund. Incompleto",
    fundamental_completo: "Fund. Completo", medio_incompleto: "Médio Incompleto",
    medio_completo: "Médio Completo", superior_incompleto: "Superior Incompleto",
    superior_completo: "Superior Completo", "ns_nr": "Não sabe",
  },
  avaliacao_saude: {
    muito_boa: "Muito Boa", boa: "Boa", regular: "Regular",
    ruim: "Ruim", muito_ruim: "Muito Ruim", "ns_nr": "Não sabe",
  },
  renda: {
    nenhuma: "Nenhuma", um_sm: "Até 1 SM",
    acima_um_ate_dois_sm: "1 a 2 SM", acima_dois_ate_quatro_sm: "2 a 4 SM",
    acima_quatro_sm: "Acima de 4 SM", "ns_nr": "Não sabe",
  },
}

function label(category: string, key: string) {
  return LABEL_MAP[category]?.[key] ?? key
}

function getProjects(projectId?: number) {
  return projectId
    ? ACTIVE_PROJECTS.filter((p) => p.id === projectId)
    : [...ACTIVE_PROJECTS]
}

export async function getKPIs(projectId?: number) {
  const projects = getProjects(projectId)
  let totalIdosos = 0
  let totalParte1 = 0
  let totalParte2 = 0
  let totalAgents = 0
  const perProject: Record<number, { submissions: number; parte1: number; parte2: number; agents: number }> = {}

  for (const p of projects) {
    try {
      const [p1, p2, entities] = await Promise.all([
        queryOData(p.id, "form_parte_1", 1),
        queryOData(p.id, "form_parte_2", 1),
        getEntities(p.id, "Agentes").catch(() => []),
      ])
      const c1 = p1["@odata.count"] ?? 0
      const c2 = p2["@odata.count"] ?? 0
      const agentCount = entities.length
      totalParte1 += c1
      totalParte2 += c2
      totalIdosos += c1
      totalAgents += agentCount
      perProject[p.id] = { submissions: c1 + c2, parte1: c1, parte2: c2, agents: agentCount }
    } catch {
      perProject[p.id] = { submissions: 0, parte1: 0, parte2: 0, agents: 0 }
    }
  }

  const totalCities = projects.reduce(
    (acc, p) => acc + (PROJECT_CITIES[p.id]?.length ?? 0), 0
  )

  log("stats", "getKPIs", { projects: projects.length, totalIdosos, totalParte1, totalParte2, totalAgents })

  return {
    totalIdosos,
    totalSubmissions: totalParte1 + totalParte2,
    totalParte1,
    totalParte2,
    totalProjects: projects.length,
    totalCities,
    totalAgents,
    perProject,
  }
}

export async function getSubmissionsTimeline(projectId?: number): Promise<TimelinePoint[]> {
  const projects = getProjects(projectId)
  const daily: Record<string, TimelinePoint> = {}

  for (const p of projects) {
    for (const form of ["form_parte_1", "form_parte_2"]) {
      try {
        const data = await queryOData(p.id, form, 1000)
        const values = data.value ?? []
        for (const v of values) {
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

  return Object.values(daily).sort((a, b) => a.date.localeCompare(b.date))
}

export async function getCityStats(projectId?: number): Promise<CityStat[]> {
  const projects = getProjects(projectId)
  const stats: Record<string, CityStat> = {}

  for (const p of projects) {
    try {
      const data = await queryOData(p.id, "form_parte_1", 500)
      const values = data.value ?? []
      const cityCount: Record<string, number> = {}
      for (const v of values) {
        const city = v.preliminar?.municipio_nome || v.preliminar?.municipio || "desconhecido"
        cityCount[city] = (cityCount[city] || 0) + 1
      }
      for (const [city, count] of Object.entries(cityCount)) {
        const key = `${p.id}-${city}`
        const cityUf = PROJECT_CITIES[p.id]?.find((c) => c.city === city)?.uf || ""
        stats[key] = {
          projectId: p.id, projectName: p.name,
          city, uf: cityUf,
          submissions: count, agents: 0,
        }
      }
    } catch {
      /* skip */
    }
  }

  return Object.values(stats).sort((a, b) => b.submissions - a.submissions)
}

export async function getAgentRanking(projectId?: number): Promise<AgentStat[]> {
  const projects = getProjects(projectId)
  const agentMap: Record<string, AgentStat> = {}

  // Build canonical name lookup from Agentes entities for each project
  const entityLookup: Record<number, Record<string, string>> = {}
  for (const p of projects) {
    try {
      const entities = await getEntities(p.id, "Agentes")
      const lookup: Record<string, string> = {}
      for (const e of entities) {
        const name = (e.currentVersion?.label as string)?.split(" - ")[0]?.trim()
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
        const data = await queryOData(p.id, form, 500)
        const values = data.value ?? []
        for (const v of values) {
          const rawName = v.preliminar?.nome_agente || v.__system?.submitterName || "desconhecido"
          const normalized = rawName.trim().toLowerCase()
          const canonicalName = entityLookup[p.id]?.[normalized] || rawName.trim()
          const city = v.preliminar?.municipio_nome || ""
          if (!agentMap[canonicalName]) {
            agentMap[canonicalName] = {
              name: canonicalName, projectId: p.id, projectName: p.name,
              city, submissions: 0, parte1: 0, parte2: 0,
              lastSubmission: v.__system?.submissionDate || "",
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
    .slice(0, 20)
}

export async function getDemographics(projectId?: number): Promise<DemographicProfile> {
  const projects = getProjects(projectId)
  const idade: Record<string, number> = { "60-69": 0, "70-79": 0, "80+": 0 }
  const genero: Record<string, number> = {}
  const cor_etnia: Record<string, number> = {}
  const escolaridade: Record<string, number> = {}
  const renda: Record<string, number> = {}
  const avaliacao_saude: Record<string, number> = {}

  for (const p of projects) {
    try {
      const data = await queryOData(p.id, "form_parte_1", 500)
      const values = data.value ?? []
      for (const v of values) {
        const s = v.entrevista?.aspectos_sociodemograficos
        if (s?.idade) {
          if (s.idade < 70) idade["60-69"]++
          else if (s.idade < 80) idade["70-79"]++
          else idade["80+"]++
        }
        if (s?.genero) genero[s.genero] = (genero[s.genero] || 0) + 1
        if (s?.cor_etnia) cor_etnia[s.cor_etnia] = (cor_etnia[s.cor_etnia] || 0) + 1
        if (s?.escolaridade) escolaridade[s.escolaridade] = (escolaridade[s.escolaridade] || 0) + 1

        const tr = v.entrevista?.trabalho_renda
        if (tr?.renda_individual_mensal) renda[tr.renda_individual_mensal] = (renda[tr.renda_individual_mensal] || 0) + 1
        if (tr?.renda_familiar_mensal) renda[tr.renda_familiar_mensal] = (renda[tr.renda_familiar_mensal] || 0) + 1

        const cs = v.entrevista?.condicao_geral_saude
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
    avaliacao_saude: Object.entries(avaliacao_saude).map(([k, count]) => ({ label: label("avaliacao_saude", k), count })),
  }
}

const RIGHTS_FIELDS = [
  { key: "discriminacao", name: "Sofreu discriminação" },
  { key: "sofreu_violencia", name: "Sofreu violência" },
  { key: "impedido_opinar", name: "Impedido de opinar" },
  { key: "impedido_decidir", name: "Impedido de decidir" },
  { key: "dificuldade_saude", name: "Dificuldade acesso à saúde" },
  { key: "dificuldade_educacao", name: "Dificuldade acesso à educação" },
  { key: "dificuldade_beneficios", name: "Dificuldade acesso a benefícios" },
  { key: "moradia_inadequada", name: "Moradia inadequada" },
  { key: "falta_servicos_publicos", name: "Falta de serviços públicos" },
  { key: "dificuldade_acesso_justica", name: "Dificuldade acesso à justiça" },
  { key: "tratado_por_idade", name: "Tratado diferente por idade" },
  { key: "barreiras_acessibilidade", name: "Barreiras de acessibilidade" },
  { key: "risco_desastre_violencia", name: "Risco de desastre/violência" },
  { key: "injustica_legal", name: "Injustiça legal" },
  { key: "acamado_domiciliado", name: "Acamado/Domiciliado" },
  { key: "dificuldade_cuidados", name: "Dificuldade com cuidados" },
  { key: "dificuldade_votacao", name: "Dificuldade para votar" },
  { key: "impedido_participacao_atividades", name: "Impedido de participar de atividades" },
  { key: "impedido_reuniao_manifestacao", name: "Impedido de reunião/manifestação" },
  { key: "impedido_utilizar_bem", name: "Impedido de utilizar bem público" },
  { key: "invasao_privacidade", name: "Invasão de privacidade" },
  { key: "preso_ilegal", name: "Preso ilegalmente" },
  { key: "profissionais_nao_explicaram", name: "Profissionais não explicaram" },
  { key: "vida_ameacada", name: "Vida ameaçada" },
]

function computeRights(values: unknown[], fields: typeof RIGHTS_FIELDS): Record<string, { sim: number; nao: number; total: number }> {
  const rights: Record<string, { sim: number; nao: number; total: number }> = {}
  for (const f of fields) {
    rights[f.key] = { sim: 0, nao: 0, total: 0 }
  }
  for (const v of values) {
    const e = (v as any).entrevista
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

function rightsFromTotals(totals: Record<string, { sim: number; nao: number; total: number }>, fields: typeof RIGHTS_FIELDS): RightsIndicator[] {
  return fields.map((f) => ({
    ...f,
    ...totals[f.key],
    percentual: totals[f.key].total > 0
      ? Math.round((totals[f.key].sim / totals[f.key].total) * 100)
      : 0,
  }))
}

export async function getRightsIndicators(projectId?: number): Promise<RightsIndicator[]> {
  const projects = getProjects(projectId)
  const rights: Record<string, { sim: number; nao: number; total: number }> = {}

  for (const f of RIGHTS_FIELDS) {
    rights[f.key] = { sim: 0, nao: 0, total: 0 }
  }

  for (const p of projects) {
    try {
      const data = await queryOData(p.id, "form_parte_2", 500)
      const values = data.value ?? []
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

export async function getRightsIndicatorsByCity(projectId?: number): Promise<{ city: string; projectName: string; projectId: number; indicators: RightsIndicator[] }[]> {
  const projects = getProjects(projectId)
  const cityMap: Record<string, { city: string; projectName: string; projectId: number; totals: Record<string, { sim: number; nao: number; total: number }> }> = {}

  for (const p of projects) {
    try {
      // Build cidade lookup from pessoas_idosas entity labels
      const entities = await getEntities(p.id, "pessoas_idosas").catch(() => [])
      const cityLookup: Record<string, string> = {}
      for (const e of entities) {
        const label = (e.currentVersion?.label as string) || ""
        const afterPipe = label.split("|")[1] || ""
        const match = afterPipe.match(/.*-([^/]+)\/[a-z]{2,3}$/)
        const city = match?.[1]?.trim()
        if (city) cityLookup[e.uuid] = city
      }

      // Process form_parte_2 using pessoa_idosa (entity UUID) to lookup city
      const p2 = await queryOData(p.id, "form_parte_2", 500)
      for (const v of p2.value ?? []) {
        const uuid = (v as any).preliminar?.pessoa_idosa
        if (!uuid) continue
        const city = cityLookup[uuid] || "desconhecido"
        if (city === "desconhecido") continue
        const key = `${p.id}-${city}`
        if (!cityMap[key]) {
          const totals: Record<string, { sim: number; nao: number; total: number }> = {}
          for (const f of RIGHTS_FIELDS) {
            totals[f.key] = { sim: 0, nao: 0, total: 0 }
          }
          cityMap[key] = { city, projectName: p.name, projectId: p.id, totals }
        }
        const e = (v as any).entrevista
        if (!e) continue
        for (const f of RIGHTS_FIELDS) {
          const val = e[f.key]
          if (val === "sim") cityMap[key].totals[f.key].sim++
          else if (val === "nao") cityMap[key].totals[f.key].nao++
          cityMap[key].totals[f.key].total++
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

  log("stats", "getRightsIndicatorsByCity", { cities: result.map(r => `${r.city}(${r.indicators.reduce((s,i) => s + i.sim, 0)})`) })

  return result
}
