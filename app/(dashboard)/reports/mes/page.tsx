import Link from "next/link"
import { ArrowRight, Factory, FolderKanban, Layers3 } from "lucide-react"
import { AppHeader } from "@/components/app-header"
import { MobilePageShell } from "@/components/mobile/mobile-page-shell"
import { DataAccessNotice } from "@/components/data-access-notice"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getDashboardSummary } from "@/lib/services/dashboard-service"
import { mesReports, reportingCategories } from "@/lib/reporting"

const mesCategory = reportingCategories.find((category) => category.slug === "mes")

export default async function MesReportsDashboardPage() {
  const { item, meta } = await getDashboardSummary()

  return (
    <>
      <MobilePageShell title="MES Reporting" subtitle="Manufacturing execution reporting categories and report launch points.">
        <DataAccessNotice meta={meta} />

        <div className="rounded-3xl border border-border/50 bg-white p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-primary/10 p-3 text-primary">
              <Factory className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{mesCategory?.name ?? "MES"}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {mesCategory?.description ?? "Manufacturing execution reporting for live production control."}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-3xl border border-border/50 bg-white p-4 shadow-sm">
            <p className="text-2xl font-semibold text-primary">{mesReports.length}</p>
            <p className="text-sm text-muted-foreground">Reports Planned</p>
          </div>
          <div className="rounded-3xl border border-border/50 bg-white p-4 shadow-sm">
            <p className="text-2xl font-semibold text-foreground">{item.currentWorkload}</p>
            <p className="text-sm text-muted-foreground">Live Workload Context</p>
          </div>
        </div>

        <div className="space-y-3">
          {mesReports.map((report) => (
            <div key={report.title} className="rounded-3xl border border-border/50 bg-white p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                  <report.icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold">{report.title}</p>
                    <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                      {report.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{report.description}</p>
                </div>
              </div>
              <div className="mt-4">
                {report.href ? (
                  <Button asChild className="w-full rounded-2xl">
                    <Link href={report.href}>Open report</Link>
                  </Button>
                ) : (
                  <Button variant="outline" className="w-full rounded-2xl" disabled>
                    Report shell ready
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </MobilePageShell>

      <div className="hidden min-h-screen lg:block">
        <AppHeader title="MES Reporting" />
        <main className="space-y-6 p-6">
          <DataAccessNotice meta={meta} />

          <Card>
            <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-primary/10 p-4 text-primary">
                  <Factory className="h-7 w-7" />
                </div>
                <div>
                  <CardTitle className="text-xl">{mesCategory?.name ?? "MES"}</CardTitle>
                  <CardDescription className="mt-2 max-w-3xl">
                    {mesCategory?.description ??
                      "Manufacturing execution reporting for live production control, operational review, and planner visibility."}
                  </CardDescription>
                </div>
              </div>
              <Button asChild variant="outline">
                <Link href="/performance-dashboard">
                  Open Performance Overview
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-primary/10 p-2 text-primary">
                      <FolderKanban className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-2xl font-semibold">{mesReports.length}</p>
                      <p className="text-sm text-muted-foreground">Available MES Report Slots</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-primary/10 p-2 text-primary">
                      <Layers3 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-2xl font-semibold">{item.openOrders}</p>
                      <p className="text-sm text-muted-foreground">Current Open Orders Context</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-primary/10 p-2 text-primary">
                      <Factory className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-2xl font-semibold">{item.currentWorkload}</p>
                      <p className="text-sm text-muted-foreground">Live Workload Context</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">MES Report Catalogue</CardTitle>
              <CardDescription>
                This category dashboard is the launch point for manufacturing execution reports. Each card below is a report slot we can wire next.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {mesReports.map((report) => (
                  <Card key={report.title} className="border-border/70">
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                          <report.icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <CardTitle className="text-base">{report.title}</CardTitle>
                            <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                              {report.status}
                            </span>
                          </div>
                          <CardDescription className="mt-2">{report.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {report.href ? (
                        <Button asChild className="w-full justify-between">
                          <Link href={report.href}>
                            Open report
                            <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : (
                        <Button variant="outline" className="w-full justify-between" disabled>
                          Report shell ready
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </>
  )
}
