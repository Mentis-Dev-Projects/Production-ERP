import { Building, Calendar, Clock, Database, Settings } from "lucide-react"
import { AppHeader } from "@/components/app-header"
import { DataAccessNotice } from "@/components/data-access-notice"
import { MobilePageShell } from "@/components/mobile/mobile-page-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDate, formatNumber } from "@/lib/utils/format"
import { getReferenceData } from "@/lib/services/reference-service"

export default async function SettingsPage() {
  const { item, meta } = await getReferenceData()

  return (
    <>
      <MobilePageShell title="Settings" subtitle="A separate mobile settings surface focused on reference visibility.">
        <DataAccessNotice meta={meta} />
        <div className="space-y-3">
          <div className="rounded-3xl border border-border/50 bg-white p-4 shadow-sm">
            <p className="font-semibold">General</p>
            <p className="mt-2 text-sm text-muted-foreground">Mentis Africa | Rectagrid first release | Operational dashboard baseline</p>
          </div>
          <div className="rounded-3xl border border-border/50 bg-white p-4 shadow-sm">
            <p className="font-semibold">Database contract</p>
            <p className="mt-2 text-sm text-muted-foreground">
              PostgreSQL is configured through `DATABASE_URL` and currently expects `app_core`, `sales`,
              `production_jobbing`, and `data_ref`.
            </p>
          </div>
          <div className="rounded-3xl border border-border/50 bg-white p-4 shadow-sm">
            <p className="font-semibold">Work Centres</p>
            <div className="mt-3 space-y-2">
              {item.workCenters.slice(0, 8).map((workCenter) => (
                <div key={workCenter.id} className="flex items-center justify-between text-sm">
                  <span>{workCenter.name}</span>
                  <span className="text-muted-foreground">{workCenter.code}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-border/50 bg-white p-4 shadow-sm">
            <p className="font-semibold">Public Holidays</p>
            <div className="mt-3 space-y-2">
              {item.publicHolidays.slice(0, 6).map((holiday) => (
                <div key={holiday.id} className="flex items-center justify-between text-sm">
                  <span>{holiday.name}</span>
                  <span className="text-muted-foreground">{formatDate(holiday.holidayDate)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </MobilePageShell>

      <div className="hidden min-h-screen lg:block">
        <AppHeader title="Settings" />
        <main className="space-y-6 p-6">
          <DataAccessNotice meta={meta} />
          <Tabs defaultValue="general" className="space-y-6">
            <TabsList>
              <TabsTrigger value="general" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                General
              </TabsTrigger>
              <TabsTrigger value="work-centres" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Work Centres
              </TabsTrigger>
              <TabsTrigger value="holidays" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Holidays
              </TabsTrigger>
              <TabsTrigger value="database" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Database
              </TabsTrigger>
              <TabsTrigger value="rules" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Due Date Rules
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general">
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                  <CardDescription>
                    The first release keeps settings read-only while the production data contract is stabilized.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-xl border p-4">
                    <h3 className="font-medium">Company</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Mentis Africa</p>
                  </div>
                  <div className="rounded-xl border p-4">
                    <h3 className="font-medium">Primary stream</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Rectagrid</p>
                  </div>
                  <div className="rounded-xl border p-4">
                    <h3 className="font-medium">Mode</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Operational dashboard baseline</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="work-centres">
              <Card>
                <CardHeader>
                  <CardTitle>Work Centres</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Stream</TableHead>
                        <TableHead>Step</TableHead>
                        <TableHead>Capacity</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {item.workCenters.map((workCenter) => (
                        <TableRow key={workCenter.id}>
                          <TableCell className="font-medium">{workCenter.code}</TableCell>
                          <TableCell>{workCenter.name}</TableCell>
                          <TableCell>{workCenter.streamName ?? "-"}</TableCell>
                          <TableCell>{workCenter.stepCode ?? "-"}</TableCell>
                          <TableCell>
                            {formatNumber(workCenter.capacity)} {workCenter.capacityUnit ?? ""}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="holidays">
              <Card>
                <CardHeader>
                  <CardTitle>Public Holidays</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Name</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {item.publicHolidays.map((holiday) => (
                        <TableRow key={holiday.id}>
                          <TableCell className="font-medium">{formatDate(holiday.holidayDate)}</TableCell>
                          <TableCell>{holiday.name}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="database">
              <Card>
                <CardHeader>
                  <CardTitle>Database Contract</CardTitle>
                  <CardDescription>
                    PostgreSQL is configured through `DATABASE_URL` and read via Prisma plus typed repositories.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Expected schemas for this release: `app_core`, `sales`, `production_jobbing`, `data_ref`.
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="rules">
              <Card>
                <CardHeader>
                  <CardTitle>Due Date Rules</CardTitle>
                  <CardDescription>
                    Due date calculation remains database-owned in this release so the frontend stays aligned with the
                    existing PostgreSQL logic.
                  </CardDescription>
                </CardHeader>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </>
  )
}
