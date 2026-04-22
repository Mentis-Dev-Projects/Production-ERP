import { Clock3, Layers3, Wrench } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface ModulePlaceholderProps {
  title: string
  description: string
  plannedData: string[]
}

export function ModulePlaceholder({ title, description, plannedData }: ModulePlaceholderProps) {
  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-muted/40 p-4">
          <Layers3 className="mb-3 h-5 w-5 text-primary" />
          <h3 className="font-medium">Foundation ready</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            The route is intentional and aligns with the Mentis production structure.
          </p>
        </div>
        <div className="rounded-xl border bg-muted/40 p-4">
          <Wrench className="mb-3 h-5 w-5 text-primary" />
          <h3 className="font-medium">Planned data cut-in</h3>
          <p className="mt-1 text-sm text-muted-foreground">{plannedData.join(", ")}</p>
        </div>
        <div className="rounded-xl border bg-muted/40 p-4">
          <Clock3 className="mb-3 h-5 w-5 text-primary" />
          <h3 className="font-medium">Current release</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            This module is intentionally staged for after the Rectagrid tracking flow.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
