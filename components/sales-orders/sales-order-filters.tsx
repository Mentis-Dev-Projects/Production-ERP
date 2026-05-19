"use client"

import { useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Check, ChevronsUpDown, Filter, Download } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { formatDate } from "@/lib/utils/format"
import type { SalesOrderListItem } from "@/types/mentis"

interface SalesOrderFiltersProps {
  streams: string[]
  orders: SalesOrderListItem[]
}

type ClientOption = {
  name: string
  orderCount: number
}

function getDueDateTime(value: string | null | undefined) {
  if (!value) {
    return 0
  }

  const time = new Date(value).getTime()
  return Number.isNaN(time) ? 0 : time
}

export function SalesOrderFilters({ streams, orders }: SalesOrderFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [salesOrderOpen, setSalesOrderOpen] = useState(false)
  const [clientOpen, setClientOpen] = useState(false)
  const [salesOrderSearch, setSalesOrderSearch] = useState(searchParams.get("salesOrderNumber") ?? searchParams.get("q") ?? "")
  const [clientSearch, setClientSearch] = useState(searchParams.get("client") ?? "")

  const selectedSalesOrderNumber = searchParams.get("salesOrderNumber") ?? searchParams.get("q") ?? ""
  const selectedClient = searchParams.get("client") ?? ""

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

  const salesOrderOptions = useMemo(
    () =>
      [...orders].sort((left, right) => {
        const dueDateDifference = getDueDateTime(right.dueDate) - getDueDateTime(left.dueDate)
        return dueDateDifference || left.salesOrderNumber.localeCompare(right.salesOrderNumber)
      }),
    [orders],
  )

  const clientOptions = useMemo<ClientOption[]>(() => {
    const counts = new Map<string, number>()

    for (const order of orders) {
      const clientName = order.clientName.trim()
      if (!clientName) continue
      counts.set(clientName, (counts.get(clientName) ?? 0) + 1)
    }

    return Array.from(counts.entries())
      .map(([name, orderCount]) => ({ name, orderCount }))
      .sort((left, right) => left.name.localeCompare(right.name))
  }, [orders])

  const filteredSalesOrders = useMemo(() => {
    const term = salesOrderSearch.trim().toLowerCase()
    if (!term) {
      return salesOrderOptions
    }

    return salesOrderOptions.filter((order) => {
      return (
        order.salesOrderNumber.toLowerCase().includes(term) ||
        order.clientName.toLowerCase().includes(term) ||
        (order.productCode ?? "").toLowerCase().includes(term)
      )
    })
  }, [salesOrderOptions, salesOrderSearch])

  const filteredClients = useMemo(() => {
    const term = clientSearch.trim().toLowerCase()
    if (!term) {
      return clientOptions
    }

    return clientOptions.filter((client) => client.name.toLowerCase().includes(term))
  }, [clientOptions, clientSearch])

  const applySalesOrder = (salesOrderNumber: string) => {
    setSalesOrderSearch(salesOrderNumber)
    setSalesOrderOpen(false)
    updateParams({ salesOrderNumber, q: "" })
  }

  const applyClient = (client: string) => {
    setClientSearch(client)
    setClientOpen(false)
    updateParams({ client, q: "" })
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-wrap gap-4">
          <Popover open={salesOrderOpen} onOpenChange={setSalesOrderOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" role="combobox" aria-expanded={salesOrderOpen} className="min-w-[280px] flex-1 justify-between font-normal">
                <span className="truncate">{selectedSalesOrderNumber || "Search sales order number..."}</span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
              <Command shouldFilter={false}>
                <CommandInput
                  placeholder="Search sales order number..."
                  value={salesOrderSearch}
                  onValueChange={setSalesOrderSearch}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      applySalesOrder(salesOrderSearch)
                    }
                  }}
                />
                <CommandList>
                  <CommandEmpty>No sales orders found.</CommandEmpty>
                  <CommandGroup>
                    {filteredSalesOrders.map((order) => (
                      <CommandItem key={order.id} value={order.salesOrderNumber} onSelect={() => applySalesOrder(order.salesOrderNumber)}>
                        <Check className={cn("mr-2 h-4 w-4", selectedSalesOrderNumber === order.salesOrderNumber ? "opacity-100" : "opacity-0")} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{order.salesOrderNumber}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            Due {formatDate(order.dueDate)} | {order.clientName}
                          </p>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          <Popover open={clientOpen} onOpenChange={setClientOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" role="combobox" aria-expanded={clientOpen} className="min-w-[280px] flex-1 justify-between font-normal">
                <span className="truncate">{selectedClient || "Search client..."}</span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
              <Command shouldFilter={false}>
                <CommandInput
                  placeholder="Search client..."
                  value={clientSearch}
                  onValueChange={setClientSearch}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      applyClient(clientSearch)
                    }
                  }}
                />
                <CommandList>
                  <CommandEmpty>No clients found.</CommandEmpty>
                  <CommandGroup>
                    {filteredClients.map((client) => (
                      <CommandItem key={client.name} value={client.name} onSelect={() => applyClient(client.name)}>
                        <Check className={cn("mr-2 h-4 w-4", selectedClient === client.name ? "opacity-100" : "opacity-0")} />
                        <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
                          <span className="truncate">{client.name}</span>
                          <span className="text-xs text-muted-foreground">{client.orderCount} orders</span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

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
