"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Search, Filter } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface RectagridFiltersProps {
  steps: string[]
  basePath?: string
}

export function RectagridFilters({ steps, basePath = "/rectagrid" }: RectagridFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateParams = (updates: Record<string, string>) => {
    const next = new URLSearchParams(searchParams.toString())

    Object.entries(updates).forEach(([key, value]) => {
      if (!value || value === "all") {
        next.delete(key)
      } else {
        next.set(key, value)
      }
    })

    router.push(`${basePath}${next.toString() ? `?${next.toString()}` : ""}`)
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-wrap gap-4">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              defaultValue={searchParams.get("q") ?? ""}
              className="pl-9"
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  updateParams({ q: event.currentTarget.value })
                }
              }}
            />
          </div>
          <Select value={searchParams.get("step") ?? "all"} onValueChange={(value) => updateParams({ step: value })}>
            <SelectTrigger className="w-[220px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by step" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Steps</SelectItem>
              {steps.map((step) => (
                <SelectItem key={step} value={step}>
                  {step}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}
