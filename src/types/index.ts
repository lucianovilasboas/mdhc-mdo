/** Cores de marca institucional (identidade visual). */
export const CORES_MARCA = {
  marrom: "#3E1F0A",
} as const

/**
 * Paleta central de gráficos — fonte única de cores.
 * NUNCA hardcode hex em componentes: importe daqui (ou de CORES_DONUT).
 */
export const PALETA_CORES = {
  azul: "#2563eb",
  verde: "#16a34a",
  vermelho: "#dc2626",
  amarelo: "#ca8a04",
  roxo: "#9333ea",
  teal: "#0891b2",
  rosa: "#be185d",
  laranja: "#ea580c",
  violeta: "#7c3aed",
  fucsia: "#db2777",
} as const

/** Sequência cíclica para donuts / barras com muitas categorias. */
export const CORES_DONUT = [
  PALETA_CORES.azul,
  PALETA_CORES.verde,
  PALETA_CORES.vermelho,
  PALETA_CORES.amarelo,
  PALETA_CORES.roxo,
  PALETA_CORES.teal,
  PALETA_CORES.rosa,
  PALETA_CORES.laranja,
] as const

export interface Project {
  id: number
  name: string
  description: string
  cities: string[]
  status: "ativo" | "implantacao"
  agentsCount: number
}

export interface SubmissionSummary {
  total: number
  parte1: number
  parte2: number
}

export interface KpiOverview {
  totalIdosos: number
  totalSubmissions: number
  totalParte1: number
  totalParte2: number
  totalProjects: number
  totalCities: number
  totalAgents: number
  lastSubmissionDate: string | null
  perProject: Record<number, {
    submissions: number
    parte1: number
    parte2: number
    agents: number
    idosos: number
  }>
}

export interface CityStat {
  projectId: number
  projectName: string
  city: string
  uf: string
  submissions: number
  agents: number
}

export interface AgentStat {
  name: string
  projectId: number
  projectName: string
  city: string
  submissions: number
  parte1: number
  parte2: number
  lastSubmission: string
}

export interface TimelinePoint {
  date: string
  parte1: number
  parte2: number
  total: number
}

export interface DemographicProfile {
  idade: { faixa: string; count: number }[]
  genero: { label: string; count: number }[]
  cor_etnia: { label: string; count: number }[]
  escolaridade: { label: string; count: number }[]
  renda: { label: string; count: number }[]
  rendaFamiliar: { label: string; count: number }[]
  avaliacao_saude: { label: string; count: number }[]
}

/** Indicadores binários de violação de direitos (Parte 2) — fonte única. */
export const RIGHTS_FIELDS = [
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
] as const

export type RightsFieldKey = (typeof RIGHTS_FIELDS)[number]["key"]

/** Ponto geográfico de uma submissão (localização da pessoa idosa). */
export interface MapPoint {
  lat: number
  lon: number
  accuracy: number
  cidade: string
  uf: string
  bairro: string
  projectId: number
  projectName: string
  form: "parte1" | "parte2"
  data: string
}

export interface RightsIndicator {
  name: string
  key: string
  total: number
  sim: number
  nao: number
  percentual: number
}

export interface MultiSelectItem {
  key: string
  label: string
  count: number
  percentual: number
}

export interface MultiSelectIndicator {
  key: string
  name: string
  gateKey: string
  gateName: string
  gateSim: number
  items: MultiSelectItem[]
}

export interface CityMultiSelectEntry {
  city: string
  projectName: string
  projectId: number
  indicators: MultiSelectIndicator[]
}

export interface CityRightsEntry {
  city: string
  projectName: string
  projectId: number
  indicators: RightsIndicator[]
}

export interface ODataSubmission {
  __id: string
  __system: {
    submissionDate: string
    submitterName: string
    submitterId: string
  }
  preliminar: {
    nome_agente: string
    municipio: string
    municipio_nome: string
    uf: string
    bairro: string
    nome_pessoa_idosa: string
  }
  entrevista: Record<string, unknown>
}

export interface Part1Submission extends ODataSubmission {
  entrevista: {
    aspectos_sociodemograficos: {
      idade: number
      genero: string
      cor_etnia: string
      escolaridade: string
      estado_civil: string
      mora_conjuge: string
      povo_tradicional: string
    }
    trabalho_renda: {
      trabalho_remunerado: string
      renda_familiar_mensal: string
      renda_individual_mensal: string
      fonte_renda: string
    }
    moradia_acesso_transporte: {
      acesso_internet: string
      locomocao_diaria: string
    }
    apoio_social: {
      apoio_proximo: string
      cadastro_cras: string
    }
    condicao_geral_saude: {
      avaliacao_saude: string
      pcd: string
      inseguranca_alimentar: string
      avaliacao_saude_mental: string
    }
  }
}

export interface Part2Submission extends ODataSubmission {
  entrevista: {
    discriminacao: string
    sofreu_violencia: string
    impedido_opinar: string
    impedido_decidir: string
    dificuldade_saude: string
    dificuldade_educacao: string
    dificuldade_beneficios: string
    moradia_inadequada: string
    falta_servicos_publicos: string
    dificuldade_acesso_justica: string
    tratado_por_idade: string
    barreiras_acessibilidade: string
    risco_desastre_violencia: string
    injustica_legal: string
    vida_ameacada: string
  }
}
