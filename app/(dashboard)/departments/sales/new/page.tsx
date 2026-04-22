import Link from "next/link"
import { createSalesJobbingOrderAction } from "@/lib/actions/workflow-actions"
import { MobilePageShell } from "@/components/mobile/mobile-page-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SalesNewJobbingOrderForm } from "@/components/workflow/sales-new-jobbing-order-form"

function FormBody() {
  return <SalesNewJobbingOrderForm action={createSalesJobbingOrderAction} />
}

export default function SalesNewJobbingOrderPage() {
  return (
    <>
      <MobilePageShell title="New Jobbing Order" subtitle="Create the order in Sales and hand it over to Drawings immediately.">
        <div className="rounded-3xl border border-border/50 bg-white p-4 shadow-sm">
          <FormBody />
        </div>
      </MobilePageShell>

      <div className="hidden min-h-screen lg:block">
        <main className="space-y-6 p-6">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-primary">Sales</p>
            <h1 className="text-3xl font-semibold">Create New Jobbing Order</h1>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Sales Intake</CardTitle>
            </CardHeader>
            <CardContent>
              <FormBody />
            </CardContent>
          </Card>
        </main>
      </div>
    </>
  )
}
