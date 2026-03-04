"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Package, Users, Truck, Clock, CheckCircle, XCircle, TrendingUp, 
  BarChart3, Activity, DollarSign, Calendar, MapPin, Target, 
  LineChart as LineChartIcon, BarChart as BarChartIcon
} from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar"
import { 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Legend,
  BarChart, Bar
} from "recharts"

export default function AdminDashboard() {
  const [packages, setPackages] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [couriers, setCouriers] = useState<any[]>([])
  const [courierRequests, setCourierRequests] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalPackages: 0,
    totalUsers: 0,
    totalCouriers: 0,
    pendingRequests: 0,
    totalRevenue: 0,
    avgDeliveryTime: 0,
    weeklyRevenue: 0,
    monthlyRevenue: 0,
  })
  const [chartData, setChartData] = useState<any[]>([])
  const [revenueData, setRevenueData] = useState<any[]>([])
  const [deliveryTrendsData, setDeliveryTrendsData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [packagesRes, usersRes, couriersRes, requestsRes] = await Promise.all([
        apiClient.get("/api/packages/admin/all"),
        apiClient.get("/api/users"),
        apiClient.get("/api/couriers"),
        apiClient.get("/api/couriers/admin/requests"),
      ])

      const packagesData = packagesRes.data || []
      const usersData = usersRes.data || []
      const couriersData = couriersRes.data || []
      const requestsData = requestsRes.data || []

      setPackages(packagesData)
      setUsers(usersData)
      setCouriers(couriersData)
      setCourierRequests(requestsData)

      // Calculate package status distribution
      const delivered = packagesData.filter((p: any) => p.status === "DELIVERED").length
      const inTransit = packagesData.filter((p: any) => p.status === "IN_TRANSIT").length
      const assigned = packagesData.filter((p: any) => p.status === "ASSIGNED").length
      const preparation = packagesData.filter((p: any) => p.status === "PREPARATION").length
      const cancelled = packagesData.filter((p: any) => p.status === "CANCELLED").length

      // Calculate REAL revenue from delivered packages
      const deliveredPackages = packagesData.filter((p: any) => p.status === "DELIVERED")
      const totalRevenue = deliveredPackages.reduce((sum: number, pkg: any) => sum + (pkg.price || 0), 0)
      
      // Calculate weekly revenue (last 7 days from delivered packages)
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      
      const weeklyDeliveries = deliveredPackages.filter((pkg: any) => {
        if (!pkg.deliveryDate) return false
        const deliveryDate = new Date(pkg.deliveryDate)
        return deliveryDate >= oneWeekAgo
      })
      
      const weeklyRevenue = weeklyDeliveries.reduce((sum: number, pkg: any) => sum + (pkg.price || 0), 0)

      // Calculate monthly revenue (last 30 days)
      const oneMonthAgo = new Date()
      oneMonthAgo.setDate(oneMonthAgo.getDate() - 30)
      
      const monthlyDeliveries = deliveredPackages.filter((pkg: any) => {
        if (!pkg.deliveryDate) return false
        const deliveryDate = new Date(pkg.deliveryDate)
        return deliveryDate >= oneMonthAgo
      })
      
      const monthlyRevenue = monthlyDeliveries.reduce((sum: number, pkg: any) => sum + (pkg.price || 0), 0)

      // Calculate average delivery time (in hours) from real data
      let totalDeliveryTime = 0
      let countWithDeliveryTime = 0
      
      deliveredPackages.forEach((pkg: any) => {
        if (pkg.createdAt && pkg.deliveryDate) {
          const createdAt = new Date(pkg.createdAt)
          const deliveryDate = new Date(pkg.deliveryDate)
          const hoursDiff = (deliveryDate.getTime() - createdAt.getTime()) / (1000 * 60 * 60)
          if (hoursDiff > 0) {
            totalDeliveryTime += hoursDiff
            countWithDeliveryTime++
          }
        }
      })
      
      const avgDeliveryTime = countWithDeliveryTime > 0 ? (totalDeliveryTime / countWithDeliveryTime).toFixed(1) : 0

      setStats({
        totalPackages: packagesData.length,
        totalUsers: usersData.length,
        totalCouriers: couriersData.length,
        pendingRequests: requestsData.filter((r: any) => r.status === "PENDING").length,
        totalRevenue,
        weeklyRevenue,
        monthlyRevenue,
        avgDeliveryTime: parseFloat(avgDeliveryTime as string),
      })

      // Package Status Distribution Chart
      setChartData([
        { name: "Preparation", value: preparation, fill: "#F59E0B", color: "text-amber-600" },
        { name: "Assigned", value: assigned, fill: "#3B82F6", color: "text-blue-600" },
        { name: "In Transit", value: inTransit, fill: "#8B5CF6", color: "text-purple-600" },
        { name: "Delivered", value: delivered, fill: "#10B981", color: "text-emerald-600" },
        { name: "Cancelled", value: cancelled, fill: "#EF4444", color: "text-red-600" },
      ])

      // Calculate REAL weekly revenue data from packages
      const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      const weeklyData: any[] = []
      
      // Get data for last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dayName = daysOfWeek[date.getDay() === 0 ? 6 : date.getDay() - 1]
        
        // Find packages delivered on this day
        const dayPackages = deliveredPackages.filter((pkg: any) => {
          if (!pkg.deliveryDate) return false
          const deliveryDate = new Date(pkg.deliveryDate)
          return deliveryDate.toDateString() === date.toDateString()
        })
        
        const dayRevenue = dayPackages.reduce((sum: number, pkg: any) => sum + (pkg.price || 0), 0)
        
        weeklyData.push({
          day: dayName,
          revenue: dayRevenue,
          deliveries: dayPackages.length,
          date: date.toISOString().split('T')[0]
        })
      }
      
      setRevenueData(weeklyData)

      // Calculate REAL delivery trends by city from packages data
      const cityData: { [key: string]: { deliveries: number, revenue: number } } = {}
      
      deliveredPackages.forEach((pkg: any) => {
        const city = pkg.recipientCity || 'Unknown'
        if (!cityData[city]) {
          cityData[city] = { deliveries: 0, revenue: 0 }
        }
        cityData[city].deliveries += 1
        cityData[city].revenue += (pkg.price || 0)
      })
      
      // Convert to array and sort by revenue
      const cityTrends = Object.entries(cityData)
        .map(([city, data]) => ({
          city,
          deliveries: data.deliveries,
          revenue: data.revenue,
          growth: "+0%" // You could calculate real growth if you have historical data
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 6) // Top 6 cities
      
      setDeliveryTrendsData(cityTrends)

    } catch (error: any) {
      console.error("Failed to fetch data:", error.response?.status, error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleApproveRequest = async (requestId: number) => {
    try {
      await apiClient.post(`/api/couriers/admin/approve/${requestId}`)
      fetchData()
    } catch (error: any) {
      console.error("Failed to approve request:", error.response?.status, error.message)
      alert(error.response?.data?.message || "Failed to approve request")
    }
  }

  const handleRejectRequest = async (requestId: number) => {
    try {
      await apiClient.post(`/api/couriers/admin/reject/${requestId}`)
      fetchData()
    } catch (error: any) {
      console.error("Failed to reject request:", error.response?.status, error.message)
      alert(error.response?.data?.message || "Failed to reject request")
    }
  }

  const handleDispatchNext = async () => {
    try {
      await apiClient.post("/api/packages/admin/dispatch-next")
      fetchData()
    } catch (error: any) {
      console.error("Failed to dispatch package:", error.response?.status, error.message)
      alert(error.response?.data?.message || "Failed to dispatch package")
    }
  }

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      PREPARATION: "bg-amber-100 text-amber-800 border-amber-300",
      ASSIGNED: "bg-blue-100 text-blue-800 border-blue-300",
      IN_TRANSIT: "bg-purple-100 text-purple-800 border-purple-300",
      DELIVERED: "bg-emerald-100 text-emerald-800 border-emerald-300",
      PENDING: "bg-orange-100 text-orange-800 border-orange-300",
      CANCELLED: "bg-red-100 text-red-800 border-red-300",
    }
    return statusColors[status] || "bg-gray-100 text-gray-800"
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin h-8 w-8 border-4 border-red-600 border-t-transparent rounded-full" />
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <DashboardSidebar role="ADMIN" />

      <div className="flex-1">
        <header className="border-b border-gray-200 bg-white shadow-sm">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600 mt-1">Manage your delivery operations</p>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-emerald-600 animate-pulse" />
                <span className="text-sm text-gray-600">Live System</span>
              </div>
            </div>
          </div>
        </header>

        <div className="p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
            <Card className="border border-gray-200 hover:border-red-200 hover:shadow-lg transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Packages</CardTitle>
                <div className="bg-red-100 p-2 rounded-lg">
                  <Package className="h-4 w-4 text-red-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stats.totalPackages}</div>
                <p className="text-xs text-gray-500 mt-1">Active shipments</p>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 hover:border-blue-200 hover:shadow-lg transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stats.totalUsers}</div>
                <p className="text-xs text-gray-500 mt-1">Registered clients</p>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 hover:border-emerald-200 hover:shadow-lg transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Active Couriers</CardTitle>
                <div className="bg-emerald-100 p-2 rounded-lg">
                  <Truck className="h-4 w-4 text-emerald-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stats.totalCouriers}</div>
                <p className="text-xs text-gray-500 mt-1">Available for delivery</p>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 hover:border-amber-200 hover:shadow-lg transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Pending Requests</CardTitle>
                <div className="bg-amber-100 p-2 rounded-lg">
                  <Clock className="h-4 w-4 text-amber-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stats.pendingRequests}</div>
                <p className="text-xs text-gray-500 mt-1">Courier applications</p>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 hover:border-red-200 hover:shadow-lg transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Weekly Revenue</CardTitle>
                <div className="bg-red-100 p-2 rounded-lg">
                  <DollarSign className="h-4 w-4 text-red-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{formatCurrency(stats.weeklyRevenue)}</div>
                <p className="text-xs text-gray-500 mt-1">Last 7 days</p>
              </CardContent>
            </Card>

            {/* <Card className="border border-gray-200 hover:border-purple-200 hover:shadow-lg transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Avg Delivery Time</CardTitle>
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Clock className="h-4 w-4 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stats.avgDeliveryTime}h</div>
                <p className="text-xs text-gray-500 mt-1">Average delivery time</p>
              </CardContent>
            </Card> */}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Weekly Revenue Chart - REAL DATA */}
            <Card className="border border-gray-200 lg:col-span-2">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-gray-900 flex items-center gap-2">
                    <LineChartIcon className="h-5 w-5 text-red-600" />
                    Weekly Revenue & Deliveries
                  </CardTitle>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Revenue</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Deliveries</span>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-xs">
                      Total: {formatCurrency(revenueData.reduce((sum, day) => sum + day.revenue, 0))}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis 
                      dataKey="day" 
                      stroke="#6b7280" 
                      fontSize={12}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      stroke="#6b7280" 
                      fontSize={12}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      yAxisId="right"
                      orientation="right"
                      stroke="#6b7280" 
                      fontSize={12}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      formatter={(value, name) => {
                        if (name === 'revenue') return [`${formatCurrency(Number(value))}`, 'Revenue']
                        if (name === 'deliveries') return [`${value}`, 'Deliveries']
                        return [value, name]
                      }}
                    />
                    <Legend />
                    <Bar 
                      dataKey="revenue" 
                      fill="#ef4444" 
                      radius={[4, 4, 0, 0]}
                      name="Revenue"
                      maxBarSize={40}
                    />
                    <Bar 
                      yAxisId="right"
                      dataKey="deliveries" 
                      fill="#3b82f6" 
                      radius={[4, 4, 0, 0]}
                      name="Deliveries"
                      maxBarSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 grid grid-cols-7 gap-2">
                  {revenueData.map((day) => (
                    <div key={day.day} className="text-center">
                      <div className="text-xs text-gray-600">{day.day}</div>
                      <div className="text-sm font-semibold text-gray-900">{formatCurrency(day.revenue)}</div>
                      <div className="text-xs text-gray-500">{day.deliveries} deliveries</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Delivery Trends by City - REAL BAR CHART */}
            <Card className="border border-gray-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-gray-900 flex items-center gap-2">
                    <BarChartIcon className="h-5 w-5 text-red-600" />
                    Top Cities by Revenue
                  </CardTitle>
                  <Badge className="bg-blue-100 text-blue-800 border-blue-300 text-xs">
                    {deliveryTrendsData.length} cities
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart 
                    data={deliveryTrendsData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={true} vertical={false} />
                    <XAxis 
                      type="number"
                      stroke="#6b7280"
                      fontSize={12}
                      tickFormatter={(value) => formatCurrency(value).replace('MAD', '')}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      type="category" 
                      dataKey="city"
                      stroke="#6b7280"
                      fontSize={12}
                      width={70}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      formatter={(value, name) => {
                        if (name === 'revenue') return [`${formatCurrency(Number(value))}`, 'Revenue']
                        if (name === 'deliveries') return [`${value} deliveries`, 'Deliveries']
                        return [value, name]
                      }}
                    />
                    <Bar 
                      dataKey="revenue" 
                      fill="#8b5cf6"
                      radius={[0, 4, 4, 0]}
                      name="Revenue"
                    >
                      {deliveryTrendsData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={index === 0 ? '#ef4444' : 
                                index === 1 ? '#3b82f6' : 
                                index === 2 ? '#10b981' : 
                                '#8b5cf6'} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                
                {/* City Stats Summary */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">Top City</div>
                      <div className="text-lg font-semibold text-gray-900">
                        {deliveryTrendsData[0]?.city || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Total Revenue</div>
                      <div className="text-lg font-semibold text-gray-900">
                        {formatCurrency(deliveryTrendsData.reduce((sum, city) => sum + city.revenue, 0))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Original Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card className="border border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-gray-900 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-red-600" />
                  Package Status Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                {chartData.length > 0 ? (
                  <div className="flex flex-col lg:flex-row items-center gap-6">
                    <div className="w-full lg:w-2/3">
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={(entry) => `${entry.value}`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value, name, props) => [
                              `${value} packages`,
                              props.payload.name
                            ]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="w-full lg:w-1/3 space-y-3">
                      {chartData.map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }}></div>
                            <span className="text-sm text-gray-700">{item.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-900">{item.value}</span>
                            <span className="text-xs text-gray-500">
                              ({stats.totalPackages > 0 ? ((item.value / stats.totalPackages) * 100).toFixed(1) : 0}%)
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-[250px] flex items-center justify-center text-gray-500">
                    No package data available
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-gray-900 flex items-center gap-2">
                  <Truck className="h-5 w-5 text-red-600" />
                  Courier Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                {couriers.length > 0 ? (
                  <div className="space-y-4">
                    {couriers.slice(0, 5).map((courier, index) => {
                      // Calculate REAL metrics for each courier
                      const courierPackages = packages.filter(pkg => pkg.courierId === courier.id)
                      const completedDeliveries = courierPackages.filter(pkg => pkg.status === "DELIVERED").length
                      const totalAssigned = courierPackages.length
                      const performance = totalAssigned > 0 ? (completedDeliveries / totalAssigned) * 100 : 0
                      
                      // Calculate revenue generated by this courier
                      const courierRevenue = courierPackages
                        .filter(pkg => pkg.status === "DELIVERED")
                        .reduce((sum, pkg) => sum + (pkg.price || 0), 0)

                      return (
                        <div key={courier.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              index === 0 ? 'bg-amber-100 text-amber-600' :
                              index === 1 ? 'bg-blue-100 text-blue-600' :
                              index === 2 ? 'bg-emerald-100 text-emerald-600' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              <span className="font-semibold">{courier.fullName?.charAt(0) || 'C'}</span>
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">{courier.fullName || 'Unknown Courier'}</div>
                              <div className="text-xs text-gray-500">{courier.vehicleType || 'No vehicle'}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold text-gray-900">{formatCurrency(courierRevenue)}</div>
                            <div className="flex items-center gap-2">
                              <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full ${
                                    performance > 90 ? 'bg-emerald-500' :
                                    performance > 75 ? 'bg-blue-500' :
                                    'bg-amber-500'
                                  }`}
                                  style={{ width: `${Math.min(performance, 100)}%` }}
                                ></div>
                              </div>
                              <span className="text-xs font-semibold text-gray-700">{performance.toFixed(0)}%</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">{completedDeliveries} deliveries</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No couriers available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>



        <Tabs defaultValue="packages" className="space-y-6">
            <TabsList className="bg-white border border-gray-200">
              <TabsTrigger value="packages" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
                Packages
              </TabsTrigger>
              <TabsTrigger value="couriers" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
                Couriers
              </TabsTrigger>
              <TabsTrigger value="requests" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
                Courier Requests
              </TabsTrigger>
              <TabsTrigger value="users" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
                Users
              </TabsTrigger>
            </TabsList>

            <TabsContent value="packages" className="space-y-4">
              <Card className="border-gray-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-gray-900">All Packages</CardTitle>
                    <Button onClick={handleDispatchNext} className="bg-red-600 hover:bg-red-700 text-white">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Dispatch Next
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-200">
                        <TableHead className="text-gray-600">Tracking #</TableHead>
                        <TableHead className="text-gray-600">Recipient</TableHead>
                        <TableHead className="text-gray-600">City</TableHead>
                        <TableHead className="text-gray-600">Status</TableHead>
                        <TableHead className="text-gray-600">Price</TableHead>
                        <TableHead className="text-gray-600">Weight</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {packages.map((pkg) => (
                        <TableRow key={pkg.id} className="border-gray-200">
                          <TableCell className="text-gray-900 font-mono text-sm">{pkg.trackingNumber}</TableCell>
                          <TableCell className="text-gray-700">{pkg.recipientName}</TableCell>
                          <TableCell className="text-gray-700">{pkg.recipientCity}</TableCell>
                          <TableCell>
                            <Badge className={getStatusBadge(pkg.status)}>{pkg.status}</Badge>
                          </TableCell>
                          <TableCell className="text-gray-700 font-semibold">
                            {pkg.price} MAD
                          </TableCell>
                          <TableCell className="text-gray-700">{pkg.weight} kg</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="couriers">
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="text-gray-900">Active Couriers</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-200">
                        <TableHead className="text-gray-600">Name</TableHead>
                        <TableHead className="text-gray-600">Email</TableHead>
                        <TableHead className="text-gray-600">Phone</TableHead>
                        <TableHead className="text-gray-600">Vehicle</TableHead>
                        <TableHead className="text-gray-600">Status</TableHead>
                        <TableHead className="text-gray-600">Load</TableHead>
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
                          <TableCell className="text-gray-700">{courier.currentLoad || 0}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="requests">
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="text-gray-900">Courier Applications</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-200">
                        <TableHead className="text-gray-600">Name</TableHead>
                        <TableHead className="text-gray-600">Email</TableHead>
                        <TableHead className="text-gray-600">Phone</TableHead>
                        <TableHead className="text-gray-600">Vehicle</TableHead>
                        <TableHead className="text-gray-600">Status</TableHead>
                        <TableHead className="text-gray-600">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {courierRequests.map((request) => (
                        <TableRow key={request.id} className="border-gray-200">
                          <TableCell className="text-gray-900">{request.fullName}</TableCell>
                          <TableCell className="text-gray-700">{request.email}</TableCell>
                          <TableCell className="text-gray-700">{request.phone}</TableCell>
                          <TableCell className="text-gray-700">{request.vehicleType}</TableCell>
                          <TableCell>
                            <Badge
                              className={
                                request.status === "PENDING"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-gray-100 text-gray-800"
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
                                  onClick={() => handleApproveRequest(request.id)}
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="destructive">
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users">
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="text-gray-900">All Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-200">
                        <TableHead className="text-gray-600">Name</TableHead>
                        <TableHead className="text-gray-600">Email</TableHead>
                        <TableHead className="text-gray-600">Phone</TableHead>
                        <TableHead className="text-gray-600">Role</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id} className="border-gray-200">
                          <TableCell className="text-gray-900">
                            {user.firstName} {user.lastName}
                          </TableCell>
                          <TableCell className="text-gray-700">{user.email}</TableCell>
                          <TableCell className="text-gray-700">{user.phone || "N/A"}</TableCell>
                          <TableCell>
                            <Badge className="bg-blue-100 text-blue-800">{user.role}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}