"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, CheckCircle, XCircle } from "lucide-react"
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar"
import { courierAPI } from "@/lib/api-client"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function RequestsPage() {
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const response = await courierAPI.getPendingRequests()
      setRequests(response.data)
    } catch (error) {
      console.error("[v0] Failed to fetch requests:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: number) => {
    try {
      await courierAPI.approveCourier(id)
      alert("Courier approved successfully!")
      fetchRequests()
    } catch (error: any) {
      console.error("[v0] Failed to approve:", error)
      alert(error.response?.data?.message || "Failed to approve request")
    }
  }

  const handleReject = async (id: number) => {
    try {
      await courierAPI.rejectCourier(id)
      alert("Courier request rejected")
      fetchRequests()
    } catch (error: any) {
      console.error("[v0] Failed to reject:", error)
      alert(error.response?.data?.message || "Failed to reject request")
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar role="ADMIN" />

      <div className="flex-1">
        <header className="border-b border-gray-200 bg-white">
          <div className="px-8 py-6">
            <h1 className="text-2xl font-bold text-gray-900">Courier Requests</h1>
            <p className="text-gray-600">Review and approve courier applications</p>
          </div>
        </header>

        <div className="p-8">
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-red-600" />
                Pending Applications ({requests.filter((r) => r.status === "PENDING").length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-red-600 border-t-transparent rounded-full" />
                </div>
              ) : requests.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Requests</h3>
                  <p className="text-gray-600">There are no courier applications awaiting approval.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-200">
                      <TableHead className="text-gray-600">Name</TableHead>
                      <TableHead className="text-gray-600">Email</TableHead>
                      <TableHead className="text-gray-600">Phone</TableHead>
                      <TableHead className="text-gray-600">CIN Number</TableHead>
                      <TableHead className="text-gray-600">Vehicle Type</TableHead>
                      <TableHead className="text-gray-600">Status</TableHead>
                      <TableHead className="text-gray-600">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.map((request) => (
                      <TableRow key={request.id} className="border-gray-200">
                        <TableCell className="text-gray-900">{request.fullName}</TableCell>
                        <TableCell className="text-gray-700">{request.email}</TableCell>
                        <TableCell className="text-gray-700">{request.phone}</TableCell>
                        <TableCell className="text-gray-700">{request.cinNumber || "Not specified"}</TableCell>
                        <TableCell className="text-gray-700">{request.vehicleType || "Not specified"}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              request.status === "PENDING"
                                ? "bg-yellow-100 text-yellow-800"
                                : request.status === "APPROVED"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                            }
                          >
                            {request.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {request.status === "PENDING" && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleApprove(request.id)}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleReject(request.id)}
                                className="bg-red-600 hover:bg-red-700 text-white"
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          )}
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