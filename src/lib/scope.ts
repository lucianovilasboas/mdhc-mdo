import { auth } from "@/lib/auth"

export interface RequestScope {
  userId: string | null
  role: string | null
  /** Projeto permitido para o usuário (null = acesso a todos). */
  projectId: number | null
  restricted: boolean
}

/**
 * Escopo de acesso da requisição a partir da sessão.
 * Admins enxergam tudo; usuários com projeto vinculado ficam restritos a ele.
 */
export async function getRequestScope(): Promise<RequestScope> {
  const session = await auth()
  const role = session?.user?.role ?? null
  const restricted = role !== "admin" && role !== null
  const projectId = restricted ? Number(session?.user?.projectId) || null : null
  return { userId: session?.user?.id ?? null, role, projectId, restricted }
}

/** Resolve o projeto efetivo: força o do usuário quando restrito. */
export function resolveProjectId(scope: RequestScope, requested?: number): number | undefined {
  if (scope.restricted) return scope.projectId ?? undefined
  return requested
}