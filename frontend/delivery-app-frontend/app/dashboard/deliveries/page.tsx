"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Truck, MapPin, CheckCircle } from "lucide-react"
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar"
import { courierAPI } from "@/lib/api-client"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDeliveries()
  }, [])

  const fetchDeliveries = async () => {
    try {
      const response = await courierAPI.getCourierDeliveries()
      setDeliveries(response.data)
    } catch (error) {
      console.error(" Failed to fetch deliveries:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (packageId: number, status: string) => {
    try {
      await courierAPI.updateDeliveryStatus(packageId, status)
      fetchDeliveries()
    } catch (error) {
      console.error("[v0] Failed to update status:", error)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      ASSIGNED: "bg-blue-100 text-blue-800 border-blue-300",
      IN_TRANSIT: "bg-purple-100 text-purple-800 border-purple-300",
      DELIVERED: "bg-green-100 text-green-800 border-green-300",
    }
    return statusColors[status] || "bg-gray-100 text-gray-800"
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar role="COURIER" />

      <div className="flex-1">
        <header className="border-b border-gray-200 bg-white">
          <div className="px-8 py-6">
            <h1 className="text-2xl font-bold text-gray-900">My Deliveries</h1>
            <p className="text-gray-600">Manage your assigned packages</p>
          </div>
        </header>

        <div className="p-8">
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center gap-2">
                <Truck className="h-5 w-5 text-red-600" />
                Active Deliveries ({deliveries.filter((d) => d.status !== "DELIVERED").length})
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
                      <TableHead className="text-gray-600">Tracking #</TableHead>
                      <TableHead className="text-gray-600">Recipient</TableHead>
                      <TableHead className="text-gray-600">Address</TableHead>
                      <TableHead className="text-gray-600">City</TableHead>
                      <TableHead className="text-gray-600">Phone</TableHead>
                      <TableHead className="text-gray-600">Status</TableHead>
                      <TableHead className="text-gray-600">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deliveries.map((delivery) => (
                      <TableRow key={delivery.id} className="border-gray-200">
                        <TableCell className="text-gray-900 font-mono text-sm">{delivery.trackingNumber}</TableCell>
                        <TableCell className="text-gray-700">{delivery.recipientName}</TableCell>
                        <TableCell className="text-gray-700 max-w-xs truncate">{delivery.recipientAddress}</TableCell>
                        <TableCell className="text-gray-700">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {delivery.recipientCity}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-700">{delivery.recipientPhone}</TableCell>
                        <TableCell>
                          <Badge className={getStatusBadge(delivery.status)}>{delivery.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {delivery.status === "ASSIGNED" && (
                              <Button
                                size="sm"
                                onClick={() => handleUpdateStatus(delivery.id, "IN_TRANSIT")}
                                className="bg-purple-600 hover:bg-purple-700 text-white"
                              >
                                Start Delivery
                              </Button>
                            )}
                            {delivery.status === "IN_TRANSIT" && (
                              <Button
                                size="sm"
                                onClick={() => handleUpdateStatus(delivery.id, "DELIVERED")}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Mark Delivered
                              </Button>
                            )}
                          </div>
                        </TableCell>
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
