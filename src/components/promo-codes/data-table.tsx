"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { AddPromoCode } from "./add-promo-code"
import { supabase } from "@/integrations/supabase/client"

export type PROMO_CODE = {
  id: string
  promo_code: string
  billing_cycle: string
  status: "active" | "inactive" | "expired"
  expiration_date: string
  usage_limit: number
  usage_count: number
  coupon_id: string
  promo_id: string
}

const activateDeactivatePromoCode = async (action: string, promo_id: string) => {
  const status = action === "active" ? "deactivate" : "activate"

  const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.access_token) {
        throw new Error("No session found. Please log in and try again.")
      }

      const accessToken = session.access_token

      const response = await fetch("https://fkdvsxnwpbvahllneusg.supabase.co/functions/v1/create-promo-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({activateCode: true, promo_id, action: status }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }
}

const deleteCoupon = async (coupon_id: string, promo_id: string) => {
  if (!coupon_id || !promo_id) {
        throw new Error("Coupon ID and promo ID are required to delete the promo code.")
      }

  const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.access_token) {
        throw new Error("No session found. Please log in and try again.")
      }

      const accessToken = session.access_token

      const response = await fetch("https://fkdvsxnwpbvahllneusg.supabase.co/functions/v1/create-promo-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({deleteCode: true, coupon_id, promo_id }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }
}

export const columns: ColumnDef<PROMO_CODE>[] = [
  {
    accessorKey: "promo_code",
    header: "Promo Code",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("promo_code")}</div>
    ),
  },
  {
    accessorKey: "billing_cycle",
    header: "Billing Cycle",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("billing_cycle")}</div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("status")}</div>
    ),
  },
  {
    accessorKey: "expiration_date",
    header: "Expiration",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("expiration_date")}</div>
    ),
  },
  {
    accessorKey: "usage_limit",
    header: "Usage Limit",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("usage_limit")}</div>
    ),
  },
  {
    accessorKey: "usage_count",
    header: "Redemption",  // by redemption we mean how many times the promo code has been used bu users
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("usage_count")}</div>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const payment = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuItem onClick={() => activateDeactivatePromoCode(payment.status, payment.promo_id)}>{payment.status === "active" ? "Deactivate" : "Activate"}</DropdownMenuItem>
            <DropdownMenuItem onClick={() => deleteCoupon(payment.coupon_id, payment.promo_id)}>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

export function PromoCodesTable({ data }: { data: PROMO_CODE[] }) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  return (
    <div className="w-full bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-[#fbfaf8]">
      <div className="flex items-center justify-between py-4">
        <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search Promo Codes"
          value={(table.getColumn("promo_code")?.getFilterValue() as string) ?? ""}
          onChange={(event) => table.getColumn("promo_code")?.setFilterValue(event.target.value)}
          className="pl-10"
        />
      </div>
        <div className="flex items-center space-x-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Status <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
           
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Usage <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
           
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Export CSV <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
           
          </DropdownMenuContent>
        </DropdownMenu>
        </div>
      </div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-xl font-bold">PROMO CODE MANAGEMENT</p>
        <AddPromoCode />
      </div>
      <div className="rounded-md">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-b">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-muted/50 cursor-pointer border-0"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}
                    className="border-0 border-b border-border"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="text-muted-foreground flex-1 text-sm">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
