import { Building, Calendar } from "lucide-react"
import { AppHeader } from "@/components/app-header"
import { DataAccessNotice } from "@/components/data-access-notice"
import { MobilePageShell } from "@/components/mobile/mobile-page-shell"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDate, formatNumber } from "@/lib/utils/format"
import { getReferenceData } from "@/lib/services/reference-service"

export default async function DataReferencesPage() {
  const { item, meta } = await getReferenceData()

  return (
    <>
      <MobilePageShell title="Data References" subtitle="Mobile reference lookups for work centres and public holidays.">
        <DataAccessNotice meta={meta} />
        <div className="space-y-3">
          {item.workCenters.slice(0, 12).map((workCenter) => (
            <div key={workCenter.id} className="rounded-3xl border border-border/50 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{workCenter.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {workCenter.code} | {workCenter.streamName ?? "No stream"}
                  </p>
                </div>
                <Badge className={workCenter.isActive ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}>
                  {workCenter.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          ))}
          <div className="rounded-3xl border border-border/50 bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold">Upcoming holidays</p>
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
        <AppHeader title="Data References" />
        <main className="space-y-6 p-6">
          <DataAccessNotice meta={meta} />
          <Card>
            <CardHeader>
              <CardTitle>Reference Data</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="work-centres" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="work-centres" className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Work Centres
                  </TabsTrigger>
                  <TabsTrigger value="holidays" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Holidays
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="work-centres">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Stream</TableHead>
                        <TableHead>Step</TableHead>
                        <TableHead>Capacity</TableHead>
                        <TableHead>Status</TableHead>
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
                          <TableCell>
                            <Badge className={workCenter.isActive ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}>
                              {workCenter.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>

                <TabsContent value="holidays">
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
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </main>
      </div>
    </>
  )
}
