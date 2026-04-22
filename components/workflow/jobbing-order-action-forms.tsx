"use client"

import { Eraser } from "lucide-react"
import { useFormStatus } from "react-dom"
import { usePersistedFormDraft } from "@/hooks/use-persisted-form-draft"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus()

  return <Button type="submit" disabled={pending}>{pending ? pendingLabel : label}</Button>
}

export function DrawingsCompletionClientForm({
  id,
  clientName,
  action,
}: {
  id: string
  clientName: string
  action: (formData: FormData) => void | Promise<void>
}) {
  const { values, updateValue, clearDraft } = usePersistedFormDraft(`workflow:drawings-completion:${id}`, {
    salesOrderNumber: "",
    clientName,
    productCode: "",
    sqm: "",
    qty: "",
    drawingNotes: "",
    actionByName: "Drawings Team",
  })

  return (
    <form
      action={action}
      className="space-y-4"
      onKeyDown={(event) => {
        if (event.key === "Enter" && event.target instanceof HTMLInputElement && event.target.type !== "submit") {
          event.preventDefault()
        }
      }}
    >
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        Drafts are kept locally in this browser while you complete the step.
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="salesOrderNumber">Sales Order Number</Label>
          <Input
            id="salesOrderNumber"
            name="salesOrderNumber"
            placeholder="Manual Sage X3 sales order reference"
            required
            value={values.salesOrderNumber}
            onChange={(event) => updateValue("salesOrderNumber", event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="clientName">Client</Label>
          <Input
            id="clientName"
            name="clientName"
            required
            value={values.clientName}
            onChange={(event) => updateValue("clientName", event.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="productCode">Product Code</Label>
          <Input id="productCode" name="productCode" required value={values.productCode} onChange={(event) => updateValue("productCode", event.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sqm">SQM</Label>
          <Input id="sqm" name="sqm" type="number" step="0.01" min="0" required value={values.sqm} onChange={(event) => updateValue("sqm", event.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="qty">Qty</Label>
          <Input id="qty" name="qty" type="number" step="0.01" min="0" required value={values.qty} onChange={(event) => updateValue("qty", event.target.value)} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="drawingNotes">Drawings Notes</Label>
        <Textarea id="drawingNotes" name="drawingNotes" rows={4} placeholder="Completion notes, clarifications, exceptions..." value={values.drawingNotes} onChange={(event) => updateValue("drawingNotes", event.target.value)} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="actionByName">Drawings Person</Label>
        <Input id="actionByName" name="actionByName" value={values.actionByName} onChange={(event) => updateValue("actionByName", event.target.value)} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="drawingFiles">Upload Drawings / Supporting Documents</Label>
        <Input id="drawingFiles" name="drawingFiles" type="file" multiple />
      </div>

      <div className="flex items-center justify-between gap-3">
        <Button type="button" variant="outline" onClick={clearDraft}>
          <Eraser className="mr-2 h-4 w-4" />
          Clear Draft
        </Button>
        <SubmitButton label="Submit Drawings Completion" pendingLabel="Submitting..." />
      </div>
    </form>
  )
}

export function SalesApprovalClientForm({
  id,
  action,
}: {
  id: string
  action: (formData: FormData) => void | Promise<void>
}) {
  const { values, updateValue, clearDraft } = usePersistedFormDraft(`workflow:sales-approval:${id}`, {
    approvalDate: "",
    actionByName: "Sales Team",
    salesNotes: "",
  })

  return (
    <form
      action={action}
      className="space-y-4"
      onKeyDown={(event) => {
        if (event.key === "Enter" && event.target instanceof HTMLInputElement && event.target.type !== "submit") {
          event.preventDefault()
        }
      }}
    >
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        Drafts are kept locally in this browser while approval is being prepared.
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="approvalDate">Approval Date</Label>
          <Input id="approvalDate" name="approvalDate" type="date" required value={values.approvalDate} onChange={(event) => updateValue("approvalDate", event.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="actionByName">Sales Person</Label>
          <Input id="actionByName" name="actionByName" value={values.actionByName} onChange={(event) => updateValue("actionByName", event.target.value)} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="salesNotes">Approval Notes</Label>
        <Textarea id="salesNotes" name="salesNotes" rows={4} placeholder="Client approval notes, special instructions..." value={values.salesNotes} onChange={(event) => updateValue("salesNotes", event.target.value)} />
      </div>

      <div className="flex items-center justify-between gap-3">
        <Button type="button" variant="outline" onClick={clearDraft}>
          <Eraser className="mr-2 h-4 w-4" />
          Clear Draft
        </Button>
        <SubmitButton label="Send to Production Planning" pendingLabel="Submitting..." />
      </div>
    </form>
  )
}
