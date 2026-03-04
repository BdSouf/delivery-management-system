"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, CheckCircle, Navigation, Clock, TrendingUp, BarChart3, Truck } from "lucide-react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar"
import { apiClient } from "@/lib/api-client" // Importez apiClient directement
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

export default function CourierDashboard() {
  const router = useRouter()
  const [packages, setPackages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [chartData, setChartData] = useState<any[]>([])
  const [stats, setStats] = useState({
    total: 0,
    inTransit: 0,
    delivered: 0,
    assigned: 0,
  })

  useEffect(() => {
    fetchAssignments()
  }, [])

  const fetchAssignments = async () => {
    try {
      // CORRIGÉ : Utilisez le même endpoint que la version normale
      const response = await apiClient.get("/api/packages/courier/assignments")
      const data = response.data || []
      setPackages(data)

      // Calcul des statistiques
      const assigned = data.filter((p: any) => p.status === "ASSIGNED").length
      const inTransit = data.filter((p: any) => p.status === "IN_TRANSIT").length
      const delivered = data.filter((p: any) => p.status === "DELIVERED").length

      setStats({
        total: data.length,
        assigned,
        inTransit,
        delivered,
      })

      // Données pour le graphique
      setChartData([
        { name: "Assigned", value: assigned, fill: "#3B82F6" },
        { name: "In Transit", value: inTransit, fill: "#A78BFA" },
        { name: "Delivered", value: delivered, fill: "#10B981" },
      ])

      console.log("[v1] Courier data fetched:", {
        total: data.length,
        assigned,
        inTransit,
        delivered,
      })
    } catch (error: any) {
      console.error("[v1] Failed to fetch assignments:", error.response?.status, error.message)
      
      // Fallback pour développement
      if (error.response?.status === 404) {
        console.log("⚠️ Check if endpoint '/api/packages/courier/assignments' exists")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (packageId: number, newStatus: string) => {
    try {
      // CORRIGÉ : Utilisez le même endpoint que la version normale
      await apiClient.put(`/api/packages/${packageId}/status`, { status: newStatus })
      
      // Mise à jour optimiste de l'UI
      setPackages(prev => prev.map(pkg => 
        pkg.id === packageId ? { ...pkg, status: newStatus } : pkg
      ))
      
      // Rafraîchir les données
      fetchAssignments()
    } catch (error: any) {
      console.error("[v1] Failed to update status:", error.response?.data || error.message)
      alert(error.response?.data?.message || "Failed to update status")
    }
  }

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      ASSIGNED: "bg-blue-100 text-blue-800 border-blue-300",
      IN_TRANSIT: "bg-purple-100 text-purple-800 border-purple-300",
      DELIVERED: "bg-green-100 text-green-800 border-green-300",
      PREPARATION: "bg-yellow-100 text-yellow-800 border-yellow-300",
      CANCELLED: "bg-red-100 text-red-800 border-red-300",
    }
    return statusColors[status] || "bg-gray-100 text-gray-800"
  }

  const handleLogout = () => {
    localStorage.clear()
    router.push("/auth/login")
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin h-8 w-8 border-4 border-red-600 border-t-transparent rounded-full" />
          <p className="text-gray-600">Loading your deliveries...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar role="COURIER" />

      <div className="flex-1">
        <header className="border-b border-gray-200 bg-white shadow-sm">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Courier Dashboard</h1>
                <p className="text-gray-600 mt-1">Manage your deliveries</p>
              </div>
              <Navigation className="h-8 w-8 text-red-600" />
            </div>
          </div>
        </header>

        <div className="p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="border-gray-200 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Assignments</CardTitle>
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Navigation className="h-5 w-5 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
                <p className="text-xs text-gray-500 mt-2">Current deliveries</p>
              </CardContent>
            </Card>

            <Card className="border-gray-200 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">In Transit</CardTitle>
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Truck className="h-5 w-5 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{stats.inTransit}</div>
                <p className="text-xs text-gray-500 mt-2">On the way</p>
              </CardContent>
            </Card>

            <Card className="border-gray-200 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Delivered</CardTitle>
                <div className="bg-green-100 p-2 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{stats.delivered}</div>
                <p className="text-xs text-gray-500 mt-2">Completed</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-red-600" />
                  Delivery Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                {chartData.some(item => item.value > 0) ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.name}: ${entry.value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[250px] flex items-center justify-center text-gray-500">
                    No delivery data available
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-red-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-900">Pending Deliveries</p>
                        <p className="text-2xl font-bold text-blue-600 mt-1">{stats.assigned}</p>
                      </div>
                      <Clock className="h-8 w-8 text-blue-400" />
                    </div>
                    {stats.assigned > 0 && (
                      <Button
                        size="sm"
                        className="mt-3 bg-blue-600 hover:bg-blue-700 text-white w-full"
                        onClick={() => {
                          const firstAssigned = packages.find(p => p.status === "ASSIGNED")
                          if (firstAssigned) {
                            handleUpdateStatus(firstAssigned.id, "IN_TRANSIT")
                          }
                        }}
                      >
                        Start Next Delivery
                      </Button>
                    )}
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-900">Completed Today</p>
                        <p className="text-2xl font-bold text-green-600 mt-1">{stats.delivered}</p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-400" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Deliveries Table */}
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900">My Deliveries</CardTitle>
            </CardHeader>
            <CardContent>
              {packages.length > 0 ? (
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
                    {packages.map((pkg) => (
                      <TableRow key={pkg.id} className="border-gray-200 hover:bg-gray-50">
                        <TableCell className="text-gray-900 font-mono text-sm">{pkg.trackingNumber}</TableCell>
                        <TableCell className="text-gray-700">{pkg.recipientName}</TableCell>
                        <TableCell className="text-gray-700 max-w-xs truncate">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {pkg.recipientAddress}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-700">{pkg.recipientCity}</TableCell>
                        <TableCell className="text-gray-700">{pkg.recipientPhone}</TableCell>
                        <TableCell>
                          <Badge className={getStatusBadge(pkg.status)}>{pkg.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {pkg.status === "ASSIGNED" && (
                              <Button
                                size="sm"
                                onClick={() => handleUpdateStatus(pkg.id, "IN_TRANSIT")}
                                className="bg-purple-600 hover:bg-purple-700 text-white"
                              >
                                Start Delivery
                              </Button>
                            )}
                            {pkg.status === "IN_TRANSIT" && (
                              <Button
                                size="sm"
                                onClick={() => handleUpdateStatus(pkg.id, "DELIVERED")}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Mark Delivered
                              </Button>
                            )}
                            {pkg.status === "DELIVERED" && (
                              <Badge className="bg-green-100 text-green-800">Completed</Badge>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Navigation className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-lg font-medium">No deliveries assigned</p>
                  <p className="text-sm mt-1">You'll see your deliveries here when they're assigned to you</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}