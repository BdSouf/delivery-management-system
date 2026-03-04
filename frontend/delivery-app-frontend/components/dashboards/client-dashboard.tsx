"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, MapPin, Package, Truck, CheckCircle, TrendingUp, BarChart3 ,XCircle} from "lucide-react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar"
import { packageAPI, apiClient } from "@/lib/api-client" // Importez les deux si nécessaire
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"


export default function ClientDashboard() {
  const router = useRouter()
  const [packages, setPackages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [chartData, setChartData] = useState<any[]>([])
  const [formData, setFormData] = useState({
    description: "",
    senderAddress: "", 
    recipientName: "",
    recipientPhone: "",
    recipientCity: "", 
    recipientAddress: "",
    weight: "",
  })

  useEffect(() => {
    fetchPackages()
  }, [])

  const fetchPackages = async () => {
    try {
      // Option 1: Utilisez l'API wrapper (vérifiez que packageAPI.getMyPackages() fonctionne)
      // Option 2: Utilisez directement apiClient comme la version fonctionnelle
      const response = await apiClient.get("/api/packages/my") // Conservez le même endpoint
      const data = response.data || []
      setPackages(data)

      // Calcul des statistiques pour le graphique
      const statusCounts = {
        PREPARATION: data.filter((p: any) => p.status === "PREPARATION").length,
        ASSIGNED: data.filter((p: any) => p.status === "ASSIGNED").length,
        IN_TRANSIT: data.filter((p: any) => p.status === "IN_TRANSIT").length,
        DELIVERED: data.filter((p: any) => p.status === "DELIVERED").length,
        CANCELLED: data.filter((p: any) => p.status === "CANCELLED").length,
      }

      setChartData([
        { name: "Preparing", value: statusCounts.PREPARATION, fill: "#FBBF24" },
        { name: "Assigned", value: statusCounts.ASSIGNED, fill: "#3B82F6" },
        { name: "Transit", value: statusCounts.IN_TRANSIT, fill: "#A78BFA" },
        { name: "Delivered", value: statusCounts.DELIVERED, fill: "#10B981" },
        { name: "Cancelled", value: statusCounts.CANCELLED, fill: "#EF4444" },
      ])
    } catch (error: any) {
      console.error(" Failed to fetch packages:", error.response?.status, error.message)
      
      // Fallback: essayez avec l'autre méthode si nécessaire
      if (packageAPI && packageAPI.getMyPackages) {
        try {
          const response = await packageAPI.getMyPackages()
          setPackages(response.data || [])
        } catch (fallbackError) {
          console.error(" Fallback also failed:", fallbackError)
        }
      }
    } finally {
      setLoading(false)
    }
  }

//////////////////
  const handleCancelPackage = async (packageId: number) => {
  if (!window.confirm("Êtes-vous sûr de vouloir annuler ce colis ?")) {
    return;
  }

  try {
    await packageAPI.cancelPackage(packageId);
    alert("Colis annulé avec succès !");
    fetchPackages(); // Rafraîchir la liste des colis
  } catch (error: any) {
    console.error("Échec de l'annulation du colis:", error);
    alert(error.response?.data?.message || "Échec de l'annulation du colis");
  }
};

  const handleCreatePackage = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Vérifiez que weight est un nombre valide
      const weightValue = Number.parseFloat(formData.weight)
      if (isNaN(weightValue) || weightValue <= 0) {
        alert("Please enter a valid weight")
        return
      }

      // Utilisez le même endpoint que la version fonctionnelle
      const response = await apiClient.post("/api/packages/create", {
        ...formData,
        weight: weightValue,
        // Assurez-vous d'envoyer tous les champs requis par l'API
        senderName: "", // Si nécessaire
        senderPhone: "", // Si nécessaire
      })

      // Alternative: si vous voulez utiliser packageAPI
      // await packageAPI.createPackage({
      //   ...formData,
      //   weight: weightValue,
      // })

      setDialogOpen(false)
      // Réinitialisez avec les mêmes champs que la version fonctionnelle
      setFormData({
        description: "",
        senderAddress: "",
        recipientName: "",
        recipientPhone: "",
        recipientCity: "",
        recipientAddress: "",
        weight: "",
      })

            // MODIFICATION : Affichez une confirmation avec le prix
      const createdPackage = response.data;
      alert(`Package created successfully! Total cost: ${createdPackage.price} MAD`);

      
      fetchPackages()
    } catch (error: any) {
      console.error(" Failed to create package:", error.response?.data || error.message)
      alert(error.response?.data?.message || "Failed to create shipment")
    }
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

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin h-8 w-8 border-4 border-red-600 border-t-transparent rounded-full" />
          <p className="text-gray-600">Loading your shipments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar role="CLIENT" />

      <div className="flex-1">
        <header className="border-b border-gray-200 bg-white shadow-sm">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Client Dashboard</h1>
                <p className="text-gray-600 mt-1">Manage your shipments</p>
              </div>
              <Package className="h-8 w-8 text-red-600" />
            </div>
          </div>
        </header>

        <div className="p-8">
          {/* Stats Cards */}
          <div  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="border-gray-200 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Shipments</CardTitle>
                <div className="bg-red-100 p-2 rounded-lg">
                  <Package className="h-5 w-5 text-red-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{packages.length}</div>
                <p className="text-xs text-gray-500 mt-2">All shipments</p>
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
                <div className="text-3xl font-bold text-gray-900">
                  {packages.filter((p) => p.status === "IN_TRANSIT").length}
                </div>
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
                <div className="text-3xl font-bold text-gray-900">
                  {packages.filter((p) => p.status === "DELIVERED").length}
                </div>
                <p className="text-xs text-gray-500 mt-2">Completed</p>
              </CardContent>
            </Card>



            <Card className="border-gray-200 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Cancelled</CardTitle>
                <div className="bg-red-100 p-2 rounded-lg">
                  <XCircle className="h-5 w-5 text-red-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">
                  {packages.filter((p) => p.status === "CANCELLED").length}
                </div>
                <p className="text-xs text-gray-500 mt-2">Cancelled shipments</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-red-600" />
                  Shipment Status Overview
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
                    No shipment data available
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-red-600" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {packages.length > 0 ? (
                  <div className="space-y-4">
                    {packages.slice(0, 5).map((pkg) => (
                      <div key={pkg.id} className="flex items-center justify-between border-b border-gray-200 pb-3">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{pkg.trackingNumber}</p>
                          <p className="text-xs text-gray-500">{pkg.recipientName}</p>
                        </div>
                        <Badge className={getStatusBadge(pkg.status)}>{pkg.status}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No recent shipments
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Packages Table - CORRIGEZ LE FORMULAIRE */}
          <Card className="border-gray-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-gray-900">My Shipments</CardTitle>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-red-600 hover:bg-red-700 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      New Shipment
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-white border-gray-200 text-gray-900 max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-gray-900">Create New Shipment</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreatePackage} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="description" className="text-gray-600">
                          Package Description
                        </Label>
                        <Textarea
                          id="description"
                          placeholder="What are you shipping?"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          required
                          className="bg-white border-gray-300 text-gray-900"
                        />
                      </div>

                      {/* CORRECTION: senderAddress seulement, pas senderName/senderPhone */}
                      <div className="space-y-2">
                        <Label htmlFor="senderAddress" className="text-gray-600">
                          Pickup Address
                        </Label>
                        <Input
                          id="senderAddress"
                          placeholder="Your address"
                          value={formData.senderAddress}
                          onChange={(e) => setFormData({ ...formData, senderAddress: e.target.value })}
                          required
                          className="bg-white border-gray-300 text-gray-900"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="recipientName" className="text-gray-600">
                            Recipient Name
                          </Label>
                          <Input
                            id="recipientName"
                            placeholder="John Doe"
                            value={formData.recipientName}
                            onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                            required
                            className="bg-white border-gray-300 text-gray-900"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="recipientPhone" className="text-gray-600">
                            Recipient Phone
                          </Label>
                          <Input
                            id="recipientPhone"
                            placeholder="+212 XXX-XXXXXX"
                            value={formData.recipientPhone}
                            onChange={(e) => setFormData({ ...formData, recipientPhone: e.target.value })}
                            required
                            className="bg-white border-gray-300 text-gray-900"
                          />
                        </div>
                      </div>

                      {/* CORRECTION: Ajoutez recipientCity */}
                      <div className="space-y-2">
                        <Label htmlFor="recipientCity" className="text-gray-600">
                          Delivery City
                        </Label>
                        <Input
                          id="recipientCity"
                          placeholder="Casablanca, Rabat, etc."
                          value={formData.recipientCity}
                          onChange={(e) => setFormData({ ...formData, recipientCity: e.target.value })}
                          required
                          className="bg-white border-gray-300 text-gray-900"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="recipientAddress" className="text-gray-600">
                          Delivery Address
                        </Label>
                        <Input
                          id="recipientAddress"
                          placeholder="Full delivery address"
                          value={formData.recipientAddress}
                          onChange={(e) => setFormData({ ...formData, recipientAddress: e.target.value })}
                          required
                          className="bg-white border-gray-300 text-gray-900"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="weight" className="text-gray-600">
                          Weight (kg)
                        </Label>
                        <Input
                          id="weight"
                          type="number"
                          step="0.1"
                          placeholder="1.5"
                          value={formData.weight}
                          onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                          required
                          min="0.1"
                          className="bg-white border-gray-300 text-gray-900"
                        />
                      </div>

                      <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white">
                        Create Shipment
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {packages.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-200">
                      <TableHead className="text-gray-600">Tracking #</TableHead>
                      <TableHead className="text-gray-600">Description</TableHead>
                      <TableHead className="text-gray-600">Recipient</TableHead>
                      <TableHead className="text-gray-600">City</TableHead>
                      <TableHead className="text-gray-600">Status</TableHead>
                      <TableHead className="text-gray-600">Price</TableHead> 
                      <TableHead className="text-gray-600">Date</TableHead>
                      <TableHead className="text-gray-600">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {packages.map((pkg) => (
                      <TableRow key={pkg.id} className="border-gray-200 hover:bg-gray-50">
                        <TableCell className="text-gray-900 font-mono text-sm">{pkg.trackingNumber}</TableCell>
                        <TableCell className="text-gray-700">{pkg.description}</TableCell>
                        <TableCell className="text-gray-700">{pkg.recipientName}</TableCell>
                        <TableCell className="text-gray-700">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {pkg.recipientCity}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusBadge(pkg.status)}>{pkg.status}</Badge>
                        </TableCell>
                              
                        <TableCell className="text-gray-700 font-medium">
                          {pkg.price} MAD
                        </TableCell>
                        <TableCell className="text-gray-700">
                          {pkg.pickupDate ? new Date(pkg.pickupDate).toLocaleDateString() : "N/A"}
                        </TableCell>

                        <TableCell>
                          {/* Afficher le bouton Annuler uniquement si le statut le permet */}
                          {(pkg.status === "PREPARATION" || pkg.status === "ASSIGNED") && (
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleCancelPackage(pkg.id)}
                            >
                              Annuler
                            </Button>
                          )}
                      </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No shipments yet. Create your first shipment!
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}