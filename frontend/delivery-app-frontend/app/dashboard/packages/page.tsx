"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, PackageIcon, MapPin, User, Phone, Weight, Clock, Truck, CheckCircle, Filter } from "lucide-react"
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar"
import { packageAPI } from "@/lib/api-client"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function PackagesPage() {
  const [packages, setPackages] = useState<any[]>([])
  const [filteredPackages, setFilteredPackages] = useState<any[]>([])
  const [trackingNumber, setTrackingNumber] = useState("")
  const [trackingResult, setTrackingResult] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const role = localStorage.getItem("userRole") || ""
    setUserRole(role)
    fetchPackages(role)
  }, [])

  useEffect(() => {
    filterPackages()
  }, [packages, statusFilter, searchQuery])

  const fetchPackages = async (role: string) => {
    try {
      let response
      if (role === "ROLE_ADMIN") {
        response = await packageAPI.getAllPackages()
      } else {
        response = await packageAPI.getMyPackages()
      }
      setPackages(response.data || [])
      setFilteredPackages(response.data || [])
    } catch (error: any) {
      console.error("[v1] Failed to fetch packages:", error.response?.data || error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleTrackPackage = async () => {
    if (!trackingNumber.trim()) {
      alert("Please enter a tracking number")
      return
    }

    try {
      const response = await packageAPI.trackPackage(trackingNumber)
      setTrackingResult(response.data)
    } catch (error: any) {
      console.error("[v1] Tracking failed:", error.response?.data || error.message)
      alert(error.response?.data?.message || "Package not found")
      setTrackingResult(null)
    }
  }

  const filterPackages = () => {
    let filtered = [...packages]

    // Filter by status
    if (statusFilter !== "ALL") {
      filtered = filtered.filter(pkg => pkg.status === statusFilter)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(pkg =>
        pkg.trackingNumber?.toLowerCase().includes(query) ||
        pkg.recipientName?.toLowerCase().includes(query) ||
        pkg.recipientCity?.toLowerCase().includes(query) ||
        pkg.description?.toLowerCase().includes(query)
      )
    }

    setFilteredPackages(filtered)
  }

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      PREPARATION: "bg-yellow-100 text-yellow-800 border-yellow-300",
      ASSIGNED: "bg-blue-100 text-blue-800 border-blue-300",
      IN_TRANSIT: "bg-purple-100 text-purple-800 border-purple-300",
      DELIVERED: "bg-green-100 text-green-800 border-green-300",
      CANCELLED: "bg-red-100 text-red-800 border-red-300",
    }
    return statusColors[status] || "bg-gray-100 text-gray-800"
  }

  const getStatusIcon = (status: string) => {
    const icons: Record<string, any> = {
      PREPARATION: Clock,
      ASSIGNED: PackageIcon,
      IN_TRANSIT: Truck,
      DELIVERED: CheckCircle,
      CANCELLED: "x",
    }
    return icons[status] || PackageIcon
  }

  const getStatusDescription = (status: string) => {
    const descriptions: Record<string, string> = {
      PREPARATION: "Package is being prepared for dispatch",
      ASSIGNED: "Package assigned to courier",
      IN_TRANSIT: "Package is on the way to destination",
      DELIVERED: "Package delivered successfully",
      CANCELLED: "Package delivery cancelled",
    }
    return descriptions[status] || "Status unknown"
  }

  const clearFilters = () => {
    setStatusFilter("ALL")
    setSearchQuery("")
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar
        role={userRole === "ROLE_ADMIN" ? "ADMIN" : userRole === "ROLE_COURIER" ? "COURIER" : "CLIENT"}
      />

      <div className="flex-1">
        <header className="border-b border-gray-200 bg-white shadow-sm">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Packages & Tracking</h1>
                <p className="text-gray-600 mt-1">Track and manage all shipments</p>
              </div>
              <PackageIcon className="h-8 w-8 text-red-600" />
            </div>
          </div>
        </header>

        <div className="p-8 space-y-6">
          {/* Tracking Card - Improved Design */}
          <Card className="border-gray-200 hover:shadow-lg transition-shadow">
            <CardHeader className="bg-gradient-to-r from-red-50 to-white border-b">
              <CardTitle className="text-gray-900 flex items-center gap-2">
                <Search className="h-5 w-5 text-red-600" />
                Track Your Package
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">Enter your tracking number to get real-time updates</p>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <Input
                    placeholder="Enter tracking number (e.g., TRK-87822425)"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="bg-white border-gray-300 text-gray-900 h-12 text-base"
                    onKeyDown={(e) => e.key === "Enter" && handleTrackPackage()}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Find your tracking number in your shipment confirmation email
                  </p>
                </div>
                <Button 
                  onClick={handleTrackPackage} 
                  className="bg-red-600 hover:bg-red-700 text-white h-12 px-6"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Track Package
                </Button>
              </div>

              {/* Tracking Results - Improved Design */}
              {trackingResult && (
                <div className="mt-8 space-y-6">
                  <div className="flex items-center justify-between border-b pb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Tracking Details</h3>
                      <p className="text-gray-600">Package: {trackingResult.trackingNumber}</p>
                    </div>
                    <Badge className={`${getStatusBadge(trackingResult.status)} text-sm px-4 py-2`}>
                      {trackingResult.status}
                    </Badge>
                  </div>

                  {/* Status Timeline */}
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Clock className="h-5 w-5 text-gray-600" />
                      Delivery Status
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                        <div className={`p-2 rounded-full ${trackingResult.status === "PREPARATION" ? "bg-yellow-100 text-yellow-600" : "bg-gray-100 text-gray-400"}`}>
                          <Clock className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">Preparation</p>
                          <p className="text-sm text-gray-600">Package is being prepared</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                        <div className={`p-2 rounded-full ${trackingResult.status === "ASSIGNED" ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-400"}`}>
                          <PackageIcon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">Assigned</p>
                          <p className="text-sm text-gray-600">Assigned to a courier</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                        <div className={`p-2 rounded-full ${trackingResult.status === "IN_TRANSIT" ? "bg-purple-100 text-purple-600" : "bg-gray-100 text-gray-400"}`}>
                          <Truck className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">In Transit</p>
                          <p className="text-sm text-gray-600">On the way to destination</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                        <div className={`p-2 rounded-full ${trackingResult.status === "DELIVERED" ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                          <CheckCircle className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">Delivered</p>
                          <p className="text-sm text-gray-600">Package delivered successfully</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Package Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="border-gray-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-gray-900 flex items-center gap-2">
                          <User className="h-5 w-5 text-red-600" />
                          Recipient Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-600">Recipient Name</p>
                          <p className="font-medium text-gray-900 text-lg">{trackingResult.recipientName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Phone Number</p>
                          <p className="font-medium text-gray-900 flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            {trackingResult.recipientPhone}
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-gray-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-gray-900 flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-red-600" />
                          Delivery Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-600">Delivery City</p>
                          <p className="font-medium text-gray-900 text-lg">{trackingResult.recipientCity}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Package Weight</p>
                          <p className="font-medium text-gray-900 flex items-center gap-2">
                            <Weight className="h-4 w-4" />
                            {trackingResult.weight} kg
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Address Card */}
                  <Card className="border-gray-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-gray-900 flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-red-600" />
                        Delivery Address
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="font-medium text-gray-900">{trackingResult.recipientAddress}</p>
                    </CardContent>
                  </Card>

                  {/* Description Card */}
                  {trackingResult.description && (
                    <Card className="border-gray-200">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-gray-900 flex items-center gap-2">
                          <PackageIcon className="h-5 w-5 text-red-600" />
                          Package Description
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-900">{trackingResult.description}</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* All Packages with Filters */}
          <Card className="border-gray-200 hover:shadow-lg transition-shadow">
            <CardHeader className="bg-gradient-to-r from-red-50 to-white border-b">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <CardTitle className="text-gray-900 flex items-center gap-2">
                  <PackageIcon className="h-5 w-5 text-red-600" />
                  {userRole === "ROLE_ADMIN" ? "All Packages" : "My Packages"}
                  <Badge className="ml-2 bg-red-100 text-red-800 border-red-300">
                    {filteredPackages.length} packages
                  </Badge>
                </CardTitle>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Search Input */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search packages..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-white border-gray-300 text-gray-900"
                    />
                  </div>
                  
                  {/* Status Filter */}
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px] bg-white border-gray-300 text-gray-900">
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-gray-500" />
                        <SelectValue placeholder="Filter by status" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Statuses</SelectItem>
                      <SelectItem value="PREPARATION">Preparation</SelectItem>
                      <SelectItem value="ASSIGNED">Assigned</SelectItem>
                      <SelectItem value="IN_TRANSIT">In Transit</SelectItem>
                      <SelectItem value="DELIVERED">Delivered</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {/* Clear Filters Button */}
                  {(statusFilter !== "ALL" || searchQuery) && (
                    <Button
                      variant="outline"
                      onClick={clearFilters}
                      className="border-gray-300 text-gray-700 hover:bg-gray-100"
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-6">
              {/* Quick Status Filter Tabs */}
              <Tabs defaultValue="ALL" value={statusFilter} onValueChange={setStatusFilter}>
                <TabsList className="bg-white border border-gray-200 mb-6">
                  <TabsTrigger value="ALL" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
                    All
                  </TabsTrigger>
                  <TabsTrigger value="PREPARATION" className="data-[state=active]:bg-yellow-600 data-[state=active]:text-white">
                    Preparation
                  </TabsTrigger>
                  <TabsTrigger value="ASSIGNED" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                    Assigned
                  </TabsTrigger>
                  <TabsTrigger value="IN_TRANSIT" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                    In Transit
                  </TabsTrigger>
                  <TabsTrigger value="DELIVERED" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
                    Delivered
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin h-10 w-10 border-4 border-red-600 border-t-transparent rounded-full" />
                </div>
              ) : filteredPackages.length === 0 ? (
                <div className="text-center py-12">
                  <PackageIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No packages found</h3>
                  <p className="text-gray-600">
                    {statusFilter !== "ALL" || searchQuery
                      ? "Try changing your filters or search terms"
                      : "No packages available"}
                  </p>
                  {(statusFilter !== "ALL" || searchQuery) && (
                    <Button onClick={clearFilters} className="mt-4 bg-red-600 hover:bg-red-700 text-white">
                      Clear Filters
                    </Button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-200">
                        <TableHead className="text-gray-600 font-semibold">Tracking #</TableHead>
                        <TableHead className="text-gray-600 font-semibold">Description</TableHead>
                        <TableHead className="text-gray-600 font-semibold">Recipient</TableHead>
                        <TableHead className="text-gray-600 font-semibold">City</TableHead>
                        <TableHead className="text-gray-600 font-semibold">Status</TableHead>
                        <TableHead className="text-gray-600 font-semibold">Price</TableHead>
                        <TableHead className="text-gray-600 font-semibold">Weight</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPackages.map((pkg) => {
                        const StatusIcon = getStatusIcon(pkg.status)
                        return (
                          <TableRow key={pkg.id} className="border-gray-200 hover:bg-gray-50 transition-colors">
                            <TableCell className="text-gray-900 font-mono text-sm font-medium">
                              {pkg.trackingNumber}
                            </TableCell>
                            <TableCell className="text-gray-700">
                              <div className="flex items-center gap-2">
                                <PackageIcon className="h-4 w-4 text-gray-400" />
                                {pkg.description || "No description"}
                              </div>
                            </TableCell>
                            <TableCell className="text-gray-700">{pkg.recipientName}</TableCell>
                            <TableCell className="text-gray-700">
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {pkg.recipientCity}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Badge className={`${getStatusBadge(pkg.status)} flex items-center gap-1`}>
                                  <StatusIcon className="h-3 w-3" />
                                  {pkg.status}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell className="text-gray-700 font-semibold">
                              {pkg.price} MAD
                            </TableCell>
                            <TableCell className="text-gray-700 font-medium">
                              <div className="flex items-center gap-1">
                                <Weight className="h-4 w-4 text-gray-400" />
                                {pkg.weight} kg
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}