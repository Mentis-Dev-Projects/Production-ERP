"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Check, ChevronsUpDown } from "lucide-react"
import { CardDescription } from "@/components/ui/card"
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
import { cn } from "@/lib/utils"

type SearchOption = {
  id: string
  salesOrderNumber: string
  clientName: string
  productCode: string | null
}

type ClientOption = {
  id: string
  clientName: string
  orderCount: number
}

interface PipelineSearchFormProps {
  initialOrderNumber?: string
  initialClientName?: string
}

function SelectionBadge({ label }: { label: string }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
      <Check className="h-3.5 w-3.5" />
      {label}
    </div>
  )
}

export function PipelineSearchForm({
  initialOrderNumber = "",
  initialClientName = "",
}: PipelineSearchFormProps) {
  const router = useRouter()

  const [allOrders, setAllOrders] = useState<SearchOption[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [clientPopoverOpen, setClientPopoverOpen] = useState(false)
  const [orderPopoverOpen, setOrderPopoverOpen] = useState(false)
  const [clientSearch, setClientSearch] = useState("")
  const [orderSearch, setOrderSearch] = useState("")
  const [selectedClientName, setSelectedClientName] = useState(initialClientName)
  const [selectedOrderNumber, setSelectedOrderNumber] = useState(initialOrderNumber)

  useEffect(() => {
    setSelectedClientName(initialClientName)
  }, [initialClientName])

  useEffect(() => {
    setSelectedOrderNumber(initialOrderNumber)
  }, [initialOrderNumber])

  useEffect(() => {
    let isMounted = true

    async function loadOrders() {
      setIsLoading(true)
      try {
        const response = await fetch("/api/sales-orders?limit=5000&sortBy=approvalDate&sortDirection=desc")
        const payload = (await response.json()) as { items?: SearchOption[] }
        if (isMounted) {
          setAllOrders(payload.items ?? [])
        }
      } catch {
        if (isMounted) {
          setAllOrders([])
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadOrders()

    return () => {
      isMounted = false
    }
  }, [])

  const clientOptions = useMemo(() => {
    const counts = new Map<string, number>()

    for (const order of allOrders) {
      const name = order.clientName.trim()
      if (!name) continue
      counts.set(name, (counts.get(name) ?? 0) + 1)
    }

    return Array.from(counts.entries())
      .map(([clientName, orderCount]) => ({
        id: clientName,
        clientName,
        orderCount,
      }))
      .sort((left, right) => left.clientName.localeCompare(right.clientName))
  }, [allOrders])

  const filteredClients = useMemo(() => {
    const normalized = clientSearch.trim().toLowerCase()
    if (!normalized) {
      return clientOptions
    }

    return clientOptions.filter((client) => client.clientName.toLowerCase().includes(normalized))
  }, [clientOptions, clientSearch])

  const filteredOrders = useMemo(() => {
    const normalized = orderSearch.trim().toLowerCase()

    return allOrders
      .filter((order) => {
        if (selectedClientName && order.clientName !== selectedClientName) {
          return false
        }

        if (!normalized) {
          return true
        }

        return (
          order.salesOrderNumber.toLowerCase().includes(normalized) ||
          order.clientName.toLowerCase().includes(normalized) ||
          (order.productCode ?? "").toLowerCase().includes(normalized)
        )
      })
      .sort((left, right) => left.salesOrderNumber.localeCompare(right.salesOrderNumber))
  }, [allOrders, orderSearch, selectedClientName])

  const selectedOrder = useMemo(
    () => allOrders.find((order) => order.salesOrderNumber === selectedOrderNumber) ?? null,
    [allOrders, selectedOrderNumber],
  )

  const visibleOrderLabel = selectedOrder?.salesOrderNumber ?? selectedOrderNumber ?? "Select a sales order"
  const visibleClientLabel = selectedClientName || "Select a client"

  const selectClient = (clientName: string) => {
    setSelectedClientName(clientName)
    setClientSearch("")
    setClientPopoverOpen(false)

    const currentOrderBelongsToClient = allOrders.some(
      (order) => order.salesOrderNumber === selectedOrderNumber && order.clientName === clientName,
    )

    if (!currentOrderBelongsToClient) {
      setSelectedOrderNumber("")
      setOrderSearch("")
    }
  }

  const selectOrder = (order: SearchOption) => {
    setSelectedOrderNumber(order.salesOrderNumber)
    setSelectedClientName(order.clientName)
    setOrderSearch("")
    setClientSearch("")
    setOrderPopoverOpen(false)
    setClientPopoverOpen(false)
    router.push(`/pipeline?order=${encodeURIComponent(order.salesOrderNumber)}`)
  }

  return (
    <div className="space-y-4">
      <CardDescription>
        Choose a client and sales order from the live dropdown lists, then narrow them down as you type when needed.
      </CardDescription>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-foreground">Client</p>
          <Popover open={clientPopoverOpen} onOpenChange={setClientPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={clientPopoverOpen}
                className="w-full justify-between font-normal"
              >
                <span className="truncate">{visibleClientLabel}</span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
              <Command shouldFilter={false}>
                <CommandInput
                  placeholder="Search clients..."
                  value={clientSearch}
                  onValueChange={setClientSearch}
                />
                <CommandList>
                  <CommandEmpty>{isLoading ? "Loading clients..." : "No clients found."}</CommandEmpty>
                  <CommandGroup>
                    {filteredClients.map((client) => (
                      <CommandItem
                        key={client.id}
                        value={client.clientName}
                        onSelect={() => selectClient(client.clientName)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedClientName === client.clientName ? "opacity-100" : "opacity-0",
                          )}
                        />
                        <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
                          <span className="truncate">{client.clientName}</span>
                          <span className="text-xs text-muted-foreground">{client.orderCount} orders</span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold text-foreground">Sales Order</p>
          <Popover open={orderPopoverOpen} onOpenChange={setOrderPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={orderPopoverOpen}
                className="w-full justify-between font-normal"
              >
                <span className="truncate">{visibleOrderLabel}</span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
              <Command shouldFilter={false}>
                <CommandInput
                  placeholder={selectedClientName ? "Search this client's orders..." : "Search sales orders..."}
                  value={orderSearch}
                  onValueChange={setOrderSearch}
                />
                <CommandList>
                  <CommandEmpty>
                    {isLoading
                      ? "Loading sales orders..."
                      : selectedClientName
                        ? "No sales orders found for that client."
                        : "No sales orders found."}
                  </CommandEmpty>
                  <CommandGroup>
                    {filteredOrders.map((order) => (
                      <CommandItem
                        key={order.id}
                        value={order.salesOrderNumber}
                        onSelect={() => selectOrder(order)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedOrderNumber === order.salesOrderNumber ? "opacity-100" : "opacity-0",
                          )}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{order.salesOrderNumber}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {order.clientName}
                            {order.productCode ? ` | ${order.productCode}` : ""}
                          </p>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <SelectionBadge
          label={selectedOrderNumber ? `Selected order: ${selectedOrderNumber}` : "Select a sales order to continue"}
        />
        {selectedClientName && <SelectionBadge label={`Client: ${selectedClientName}`} />}
      </div>
    </div>
  )
}
