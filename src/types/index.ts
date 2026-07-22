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
  avaliacao_saude: { label: string; count: number }[]
}

export interface RightsIndicator {
  name: string
  key: string
  total: number
  sim: number
  nao: number
  percentual: number
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
