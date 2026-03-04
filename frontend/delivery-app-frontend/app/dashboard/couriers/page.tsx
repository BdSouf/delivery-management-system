"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Truck } from "lucide-react"
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar"
import { courierAPI } from "@/lib/api-client"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function CouriersPage() {
  const [couriers, setCouriers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCouriers()
  }, [])

  const fetchCouriers = async () => {
    try {
      const response = await courierAPI.getAllCouriers()
      setCouriers(response.data)
    } catch (error) {
      console.error("[v0] Failed to fetch couriers:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar role="ADMIN" />

      <div className="flex-1">
        <header className="border-b border-gray-200 bg-white">
          <div className="px-8 py-6">
            <h1 className="text-2xl font-bold text-gray-900">Couriers Management</h1>
            <p className="text-gray-600">View and manage all active couriers</p>
          </div>
        </header>

        <div className="p-8">
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center gap-2">
                <Truck className="h-5 w-5 text-red-600" />
                Active Couriers ({couriers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-red-600 border-t-transparent rounded-full" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-200">
                      <TableHead className="text-gray-600">Name</TableHead>
                      <TableHead className="text-gray-600">Email</TableHead>
                      <TableHead className="text-gray-600">Phone</TableHead>
                      <TableHead className="text-gray-600">Vehicle</TableHead>
                      <TableHead className="text-gray-600">Status</TableHead>
                      <TableHead className="text-gray-600">Current Load</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {couriers.map((courier) => (
                      <TableRow key={courier.id} className="border-gray-200">
                        <TableCell className="text-gray-900">{courier.fullName}</TableCell>
                        <TableCell className="text-gray-700">{courier.email}</TableCell>
                        <TableCell className="text-gray-700">{courier.phone}</TableCell>
                        <TableCell className="text-gray-700">{courier.vehicleType}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              courier.status === "AVAILABLE"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }
                          >
                            {courier.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-700">{courier.currentLoad || 0} packages</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
