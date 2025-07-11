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
import { ArrowUpDown, ChevronDown, MoreHorizontal, Search, Loader2 } from "lucide-react"

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

import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast";

export type PROMO_CODE = {
  id: string
  promo_code: string
  status: "active" | "inactive" | "expired"
  expiration_date: string
  usage_limit: number
  usage_count: number
  coupon_id: string
  promo_id: string
}

const activateDeactivatePromoCode = async (promo_id: string, action: string) => {
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
      <div>{row.getValue("promo_code")}</div>
    ),
  },
  {
  accessorKey: "status",
  header: "Status",
  cell: ({ row }) => {
    const status = row.getValue("status") as string;
    let colorClass = "";

    if (status === "active") colorClass = "bg-[#6DE96E] text-white";
    else if (status === "inactive") colorClass = "bg-[#F93C65] text-white";
    else if (status === "expired") colorClass = "bg-gray-800 text-white";

    return (
      <span
        className={`capitalize px-3 py-2 min-w-[80px] text-center inline-block rounded-full text-xs font-semibold ${colorClass}`}
      >
        {status}
      </span>
    );
  },
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
            {/* <DropdownMenuItem>Edit</DropdownMenuItem> */}
            <DropdownMenuItem onClick={() => activateDeactivatePromoCode(payment.promo_id, payment.status)}>{payment.status === "active" ? "Deactivate" : "Activate"}</DropdownMenuItem>
            <DropdownMenuItem onClick={() => deleteCoupon(payment.coupon_id, payment.promo_id)}>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

export function PromoCodesTable({
  data,
  onDeletePromoCode,
  onStatusChange,
  statusFilter,
  setStatusFilter,
  usageFilter,
  setUsageFilter,
  AddPromoCodeComponent,
}: {
  data: PROMO_CODE[];
  onDeletePromoCode: (promo_id: string) => void;
  onStatusChange: (promo_id: string, newStatus: PROMO_CODE['status']) => void;
  statusFilter: string | null;
  setStatusFilter: (val: string | null) => void;
  usageFilter: string | null;
  setUsageFilter: (val: string | null) => void;
  AddPromoCodeComponent: React.ReactNode;
}) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const { toast } = useToast();
  
  // Use Set to store loading states for better performance and accuracy
  const [loadingRows, setLoadingRows] = React.useState<Set<string>>(new Set());
  const [statusLoadingRows, setStatusLoadingRows] = React.useState<Set<string>>(new Set());

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

  // Clear loading states when pagination changes
  React.useEffect(() => {
    const currentVisibleIds = table.getRowModel().rows.map(row => row.original.promo_id);
    
    setLoadingRows(prev => {
      const newSet = new Set(prev);
      // Remove loading states for IDs that are no longer visible
      Array.from(newSet).forEach(id => {
        if (!currentVisibleIds.includes(id)) {
          newSet.delete(id);
        }
      });
      return newSet;
    });
    
    setStatusLoadingRows(prev => {
      const newSet = new Set(prev);
      // Remove loading states for IDs that are no longer visible
      Array.from(newSet).forEach(id => {
        if (!currentVisibleIds.includes(id)) {
          newSet.delete(id);
        }
      });
      return newSet;
    });
  }, [table.getState().pagination.pageIndex]);

  // Delete handler
  const handleDelete = async (coupon_id: string, promo_id: string) => {
    setLoadingRows(prev => new Set(prev).add(promo_id));
    try {
      await deleteCoupon(coupon_id, promo_id);
      onDeletePromoCode(promo_id);
      toast({
        title: "Deleted",
        description: "Promo code deleted successfully.",
        variant: "default",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete promo code.",
        variant: "destructive",
      });
    } finally {
      setLoadingRows(prev => {
        const newSet = new Set(prev);
        newSet.delete(promo_id);
        return newSet;
      });
    }
  };

  // Status change handler
  const handleChangeStatus = async (promo_id: string, currentStatus: PROMO_CODE['status']) => {
    setStatusLoadingRows(prev => new Set(prev).add(promo_id));
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await activateDeactivatePromoCode(promo_id, currentStatus);
      onStatusChange(promo_id, newStatus);
      toast({
        title: "Status Updated",
        description: `Promo code status changed to ${newStatus}.`,
        variant: "default",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to change promo code status.",
        variant: "destructive",
      });
    } finally {
      setStatusLoadingRows(prev => {
        const newSet = new Set(prev);
        newSet.delete(promo_id);
        return newSet;
      });
    }
  };

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
            <DropdownMenuItem onClick={() => setStatusFilter(null)}>All</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('active')}>Active</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('inactive')}>Inactive</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('expired')}>Expired</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Usage <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setUsageFilter(null)}>All</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setUsageFilter('used')}>Used</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setUsageFilter('unused')}>Unused</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Export CSV <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
           {/* Export logic here if needed */}
          </DropdownMenuContent>
        </DropdownMenu>
        </div>
      </div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-xl font-bold">PROMO CODE MANAGEMENT</p>
        {AddPromoCodeComponent}
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
                      {cell.column.id === 'actions'
                        ? (() => {
                            const payment = row.original;
                            const isDeleteLoading = loadingRows.has(payment.promo_id);
                            const isStatusLoading = statusLoadingRows.has(payment.promo_id);
                            
                            return (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => handleChangeStatus(payment.promo_id, payment.status)}
                                    disabled={isStatusLoading || isDeleteLoading}
                                  >
                                    {isStatusLoading ? (
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : null}
                                    {payment.status === "active" ? "Deactivate" : "Activate"}
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDelete(payment.coupon_id, payment.promo_id)}
                                    disabled={isDeleteLoading || isStatusLoading}
                                  >
                                    {isDeleteLoading ? (
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : null}
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            );
                          })()
                        : flexRender(
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