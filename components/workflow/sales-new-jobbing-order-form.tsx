"use client"

import Link from "next/link"
import { ArrowLeft, Eraser, Upload } from "lucide-react"
import { useFormStatus } from "react-dom"
import { usePersistedFormDraft } from "@/hooks/use-persisted-form-draft"
import { workflowStreams } from "@/lib/workflow/constants"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Submitting..." : "Create and Send to Drawings"}
    </Button>
  )
}

export function SalesNewJobbingOrderForm({
  action,
}: {
  action: (formData: FormData) => void | Promise<void>
}) {
  const { values, updateValue, clearDraft } = usePersistedFormDraft("workflow:sales-new-jobbing-order", {
    estimateNumber: "",
    estimateAcceptedAt: "",
    clientName: "",
    createdByName: "Sales Team",
    streamName: "Rectagrid",
    technicalRequirements: "",
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
        Drafts are kept locally in this browser so a refresh or reconnect does not wipe your entries.
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="estimateNumber">Estimate / Quote</Label>
          <Input
            id="estimateNumber"
            name="estimateNumber"
            placeholder="Enter estimate number"
            required
            value={values.estimateNumber}
            onChange={(event) => updateValue("estimateNumber", event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="estimateAcceptedAt">Accepted Date</Label>
          <Input
            id="estimateAcceptedAt"
            name="estimateAcceptedAt"
            type="date"
            required
            value={values.estimateAcceptedAt}
            onChange={(event) => updateValue("estimateAcceptedAt", event.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="clientName">Client</Label>
          <Input
            id="clientName"
            name="clientName"
            placeholder="Client name"
            required
            value={values.clientName}
            onChange={(event) => updateValue("clientName", event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="createdByName">Sales Person</Label>
          <Input
            id="createdByName"
            name="createdByName"
            placeholder="Sales person name"
            value={values.createdByName}
            onChange={(event) => updateValue("createdByName", event.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="streamName">Production Stream</Label>
        <select
          id="streamName"
          name="streamName"
          value={values.streamName}
          onChange={(event) => updateValue("streamName", event.target.value)}
          className="border-input bg-background ring-offset-background flex h-9 w-full rounded-md border px-3 py-2 text-sm"
        >
          {workflowStreams.map((stream) => (
            <option key={stream} value={stream}>
              {stream}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="technicalRequirements">Notes / Requirements</Label>
        <Textarea
          id="technicalRequirements"
          name="technicalRequirements"
          placeholder="Special requests, technical notes, client requirements..."
          rows={6}
          value={values.technicalRequirements}
          onChange={(event) => updateValue("technicalRequirements", event.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="salesNotes">Sales Notes</Label>
        <Textarea
          id="salesNotes"
          name="salesNotes"
          placeholder="Internal sales notes for Drawings..."
          rows={4}
          value={values.salesNotes}
          onChange={(event) => updateValue("salesNotes", event.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="technicalFiles">Technical Drawings / Client Files</Label>
        <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-4">
          <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
            <Upload className="h-4 w-4" />
            Upload the accepted technical spec drawings and supporting documents.
          </div>
          <Input id="technicalFiles" name="technicalFiles" type="file" multiple />
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost">
            <Link href="/departments/sales">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <Button type="button" variant="outline" onClick={clearDraft}>
            <Eraser className="mr-2 h-4 w-4" />
            Clear Draft
          </Button>
        </div>
        <SubmitButton />
      </div>
    </form>
  )
}
