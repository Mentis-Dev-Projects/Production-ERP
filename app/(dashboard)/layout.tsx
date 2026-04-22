import { AppSidebar } from "@/components/app-sidebar"
import { MobileBottomNav } from "@/components/mobile/mobile-bottom-nav"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <MobileBottomNav />
      <div className="pb-24 lg:pb-0 lg:pl-64">
        {children}
      </div>
    </div>
  )
}
