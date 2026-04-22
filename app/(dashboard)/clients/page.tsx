import { AlertTriangle, Building2, ShoppingCart } from "lucide-react"
import { AppHeader } from "@/components/app-header"
import { DataAccessNotice } from "@/components/data-access-notice"
import { MobilePageShell } from "@/components/mobile/mobile-page-shell"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getClients } from "@/lib/services/client-service"

export default async function ClientsPage() {
  const { items, meta } = await getClients()
  const totalActiveOrders = items.reduce((sum, item) => sum + item.activeOrders, 0)
  const totalOverdue = items.reduce((sum, item) => sum + item.overdueOrders, 0)

  return (
    <>
      <MobilePageShell title="Clients" subtitle="A phone-first view of the live client directory and open order exposure.">
        <DataAccessNotice meta={meta} />
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-3xl border border-border/50 bg-white p-4 shadow-sm">
            <Building2 className="mb-3 h-5 w-5 text-primary" />
            <p className="text-2xl font-semibold">{items.length}</p>
            <p className="text-sm text-muted-foreground">Total Clients</p>
          </div>
          <div className="rounded-3xl border border-border/50 bg-white p-4 shadow-sm">
            <ShoppingCart className="mb-3 h-5 w-5 text-blue-600" />
            <p className="text-2xl font-semibold">{totalActiveOrders}</p>
            <p className="text-sm text-muted-foreground">Active Orders</p>
          </div>
        </div>
        <div className="rounded-3xl border border-border/50 bg-white p-4 shadow-sm">
          <AlertTriangle className="mb-3 h-5 w-5 text-red-600" />
          <p className="text-2xl font-semibold">{totalOverdue}</p>
          <p className="text-sm text-muted-foreground">Overdue Orders</p>
        </div>
        <div className="space-y-3">
          {items.map((client) => (
            <div key={client.id} className="rounded-3xl border border-border/50 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold">{client.name}</p>
                  <p className="text-sm text-muted-foreground">{client.clientCode ?? "No client code"}</p>
                </div>
                <Badge variant="outline">{client.activeOrders} active</Badge>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                {client.overdueOrders > 0 ? `${client.overdueOrders} overdue orders` : "No overdue orders"}
              </p>
            </div>
          ))}
        </div>
      </MobilePageShell>

      <div className="hidden min-h-screen lg:block">
        <AppHeader title="Clients" />
        <main className="space-y-6 p-6">
          <DataAccessNotice meta={meta} />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{items.length}</p>
                    <p className="text-sm text-muted-foreground">Total Clients</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-100 p-2">
                    <ShoppingCart className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totalActiveOrders}</p>
                    <p className="text-sm text-muted-foreground">Active Orders</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className={totalOverdue > 0 ? "border-red-200" : ""}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-red-100 p-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className={`text-2xl font-bold ${totalOverdue > 0 ? "text-red-600" : ""}`}>{totalOverdue}</p>
                    <p className="text-sm text-muted-foreground">Overdue Orders</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Client Directory</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Active Orders</TableHead>
                    <TableHead>Overdue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{client.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{client.clientCode ?? "N/A"}</Badge>
                      </TableCell>
                      <TableCell>{client.activeOrders}</TableCell>
                      <TableCell>
                        {client.overdueOrders > 0 ? (
                          <Badge className="bg-red-100 text-red-700">{client.overdueOrders} overdue</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {items.length === 0 && <div className="py-12 text-center text-muted-foreground">No client data found.</div>}
            </CardContent>
          </Card>
        </main>
      </div>
    </>
  )
}
