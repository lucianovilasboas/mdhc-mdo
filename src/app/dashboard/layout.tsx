import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { InstallPrompt } from "@/components/InstallPrompt"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  return (
    <>
      <DashboardHeader
        userName={session.user?.name ?? "Usuário"}
        userRole={session.user.role}
        userProjectId={session.user.projectId}
      />
      <div className="pt-[108px] sm:pt-[116px] md:pt-16">{children}</div>
      <InstallPrompt />
    </>
  )
}
