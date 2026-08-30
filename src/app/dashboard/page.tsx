import { DashboardShell } from "@/components/dashboard/DashboardShell"
import { auth } from "@/lib/auth"

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ projeto?: string }>
}) {
  const session = await auth()
  const { projeto } = await searchParams

  const restrictedProjectId = session?.user?.role !== "admin"
    ? Number(session?.user?.projectId)
    : undefined
  const parsed = projeto ? Number(projeto) : undefined
  const selectedProjectId = restrictedProjectId ?? (parsed && !Number.isNaN(parsed) ? parsed : undefined)

  return <DashboardShell selectedProjectId={selectedProjectId} />
}
