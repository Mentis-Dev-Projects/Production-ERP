"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Search, Filter, Download } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface SalesOrderFiltersProps {
  streams: string[]
}

export function SalesOrderFilters({ streams }: SalesOrderFiltersProps) {
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

    router.push(`/sales-orders${next.toString() ? `?${next.toString()}` : ""}`)
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-wrap gap-4">
          <div className="relative min-w-[250px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by client or sales order number..."
              defaultValue={searchParams.get("q") ?? ""}
              className="pl-9"
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  updateParams({ q: event.currentTarget.value })
                }
              }}
            />
          </div>
          <Select value={searchParams.get("status") ?? "all"} onValueChange={(value) => updateParams({ status: value })}>
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="not-started">Not Started</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="complete">Complete</SelectItem>
              <SelectItem value="late">Late</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
          <Select value={searchParams.get("stream") ?? "all"} onValueChange={(value) => updateParams({ stream: value })}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Stream" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Streams</SelectItem>
              {streams.map((stream) => (
                <SelectItem key={stream} value={stream}>
                  {stream}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" type="button">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
