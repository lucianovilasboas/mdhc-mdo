import { getCached, setCache } from "./cache"
import { log } from "./logger"

const BASE_URL = process.env.ODK_BASE_URL!
const USERNAME = process.env.ODK_USERNAME!
const PASSWORD = process.env.ODK_PASSWORD!

let _token: string | null = null

async function getToken(): Promise<string> {
  if (_token) return _token
  const res = await fetch(`${BASE_URL}/v1/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: USERNAME, password: PASSWORD }),
  })
  if (!res.ok) throw new Error(`ODK auth failed: ${res.status}`)
  const data = await res.json()
  _token = data.token
  return _token!
}

async function odkFetch(path: string, init?: RequestInit) {
  const cached = getCached(path)
  if (cached) return cached

  const token = await getToken()
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      ...init?.headers,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })
  log("odk", `${res.status} ${path}`)
  if (!res.ok) {
    if (res.status === 401) { _token = null; return odkFetch(path, init) }
    throw new Error(`ODK API error ${res.status}: ${await res.text()}`)
  }
  const data = await res.json()
  setCache(path, data)
  return data
}

export async function queryOData(
  projectId: number,
  formId: string,
  top?: number,
  skip?: number,
  filter?: string
) {
  const params = new URLSearchParams()
  if (top) params.set("$top", String(top))
  if (skip) params.set("$skip", String(skip))
  if (filter) params.set("$filter", filter)
  params.set("$count", "true")
  const qs = params.toString()
  const path = `/v1/projects/${projectId}/forms/${encodeURIComponent(formId)}.svc/Submissions${qs ? `?${qs}` : ""}`
  return odkFetch(path)
}

export async function getEntities(
  projectId: number,
  datasetName: string,
) {
  return odkFetch(`/v1/projects/${projectId}/datasets/${encodeURIComponent(datasetName)}/entities`)
}

export async function getSubmissionsCount(
  projectId: number,
  formId: string
): Promise<number> {
  const data = await queryOData(projectId, formId, 1)
  return data["@odata.count"] ?? 0
}

export async function getAllSubmissions(
  projectId: number,
  formId: string,
  maxResults = 1000
) {
  const all: unknown[] = []
  let skip = 0
  const batch = 200
  while (skip < maxResults) {
    const data = await queryOData(projectId, formId, batch, skip)
    const values = data.value ?? []
    all.push(...values)
    if (values.length < batch) break
    skip += batch
  }
  return all
}

export async function getProjectForms(projectId: number) {
  return odkFetch(`/v1/projects/${projectId}/forms`)
}

export async function getProject(projectId: number) {
  return odkFetch(`/v1/projects/${projectId}`)
}

export async function getProjects() {
  return odkFetch("/v1/projects")
}

export const ACTIVE_PROJECTS = [
  { id: 5, name: "IFMS", uf: "MS" },
  { id: 6, name: "UFMS", uf: "MS" },
  { id: 2, name: "IFMG - João Monlevade", uf: "MG" },
  { id: 3, name: "IFMG - Bom Despacho", uf: "MG" },
  { id: 4, name: "FIOCRUZ", uf: "MT/DF" },
  { id: 7, name: "UFGD", uf: "MS" },
  { id: 8, name: "UFPE", uf: "PE" },
  { id: 9, name: "IFSP - Jundiaí", uf: "SP" },
  { id: 10, name: "IFSP - Guarulhos", uf: "SP" },
  { id: 11, name: "IFSP - Presidente Prudente", uf: "SP" },
  { id: 12, name: "ANADIPS", uf: "AP" },
] as const

export const PROJECT_CITIES: Record<number, { city: string; uf: string }[]> = {
  5: [
    { city: "Corumbá", uf: "MS" },
    { city: "Bela Vista", uf: "MS" },
    { city: "Ivinhema", uf: "MS" },
    { city: "Fátima do Sul", uf: "MS" },
  ],
  6: [
    { city: "Aquidauana", uf: "MS" },
    { city: "Coxim", uf: "MS" },
    { city: "Naviraí", uf: "MS" },
    { city: "Ponta Porã", uf: "MS" },
  ],
  2: [
    { city: "João Monlevade", uf: "MG" },
    { city: "Nova Era", uf: "MG" },
    { city: "Santa Bárbara", uf: "MG" },
    { city: "Rio Piracicaba", uf: "MG" },
  ],
  3: [
    { city: "Pompéu", uf: "MG" },
    { city: "Pitangui", uf: "MG" },
    { city: "Perdigão", uf: "MG" },
    { city: "Martinho Campos", uf: "MG" },
    { city: "Igaratinga", uf: "MG" },
    { city: "São Gonçalo do Pará", uf: "MG" },
  ],
  4: [
    { city: "Cáceres", uf: "MT" },
    { city: "Barra do Garças", uf: "MT" },
    { city: "Fercal", uf: "DF" },
    { city: "Itapoã", uf: "DF" },
    { city: "Paranoá", uf: "DF" },
    { city: "Estrutural", uf: "DF" },
  ],
  7: [{ city: "Dourados", uf: "MS" }],
  8: [{ city: "Vitória de Santo Antônio", uf: "PE" }],
  9: [{ city: "Jundiaí", uf: "SP" }],
  10: [{ city: "Guarulhos", uf: "SP" }],
  11: [
    { city: "Alvares Machado", uf: "SP" },
    { city: "Regente Feijó", uf: "SP" },
    { city: "Presidente Epitácio", uf: "SP" },
    { city: "Pirapozinho", uf: "SP" },
  ],
  12: [{ city: "Macapá", uf: "AP" }],
}
