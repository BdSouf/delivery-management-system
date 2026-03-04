"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText } from "lucide-react"
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar"
import { courierAPI } from "@/lib/api-client"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function HistoryPage() {
  const [deliveries, setDeliveries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      const response = await courierAPI.getCourierDeliveries()
      setDeliveries(response.data.filter((d: any) => d.status === "DELIVERED"))
    } catch (error) {
      console.error("[v0] Failed to fetch history:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar role="COURIER" />

      <div className="flex-1">
        <header className="border-b border-gray-200 bg-white">
          <div className="px-8 py-6">
            <h1 className="text-2xl font-bold text-gray-900">Delivery History</h1>
            <p className="text-gray-600">View your completed deliveries</p>
          </div>
        </header>

        <div className="p-8">
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-red-600" />
                Completed Deliveries ({deliveries.length})
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
                      <TableHead className="text-gray-600">City</TableHead>
                      <TableHead className="text-gray-600">Delivery Date</TableHead>
                      <TableHead className="text-gray-600">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deliveries.map((delivery) => (
                      <TableRow key={delivery.id} className="border-gray-200">
                        <TableCell className="text-gray-900 font-mono text-sm">{delivery.trackingNumber}</TableCell>
                        <TableCell className="text-gray-700">{delivery.recipientName}</TableCell>
                        <TableCell className="text-gray-700">{delivery.recipientCity}</TableCell>
                        <TableCell className="text-gray-700">
                          {new Date(delivery.deliveryDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-800">DELIVERED</Badge>
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
