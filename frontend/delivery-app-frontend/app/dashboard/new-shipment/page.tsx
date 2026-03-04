"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Package } from "lucide-react"
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar"
import { packageAPI } from "@/lib/api-client"
import { useRouter } from "next/navigation"

export default function NewShipmentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    description: "",
    senderAddress: "",
    recipientName: "",
    recipientPhone: "",
    recipientCity: "", // Ajout de ce champ
    recipientAddress: "",
    weight: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await packageAPI.createPackage({
        ...formData,
        weight: Number.parseFloat(formData.weight),
      })
      alert("Package created successfully!")
      router.push("/dashboard/packages")
    } catch (error: any) {
      console.error("[v0] Failed to create package:", error)
      alert(error.response?.data?.message || "Failed to create package")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar role="CLIENT" />

      <div className="flex-1">
        <header className="border-b border-gray-200 bg-white">
          <div className="px-8 py-6">
            <h1 className="text-2xl font-bold text-gray-900">New Shipment</h1>
            <p className="text-gray-600">Create a new package delivery</p>
          </div>
        </header>

        <div className="p-8">
          <Card className="border-gray-200 max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center gap-2">
                <Package className="h-5 w-5 text-red-600" />
                Shipment Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 text-lg">Sender Information</h3>

                  <div>
                    <Label htmlFor="senderAddress">Pickup Address</Label>
                    <Input
                      id="senderAddress"
                      value={formData.senderAddress}
                      onChange={(e) => setFormData({ ...formData, senderAddress: e.target.value })}
                      required
                      className="bg-white border-gray-300"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 text-lg">Recipient Information</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="recipientName">Recipient Name</Label>
                      <Input
                        id="recipientName"
                        value={formData.recipientName}
                        onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                        required
                        className="bg-white border-gray-300"
                      />
                    </div>
                    <div>
                      <Label htmlFor="recipientPhone">Recipient Phone</Label>
                      <Input
                        id="recipientPhone"
                        value={formData.recipientPhone}
                        onChange={(e) => setFormData({ ...formData, recipientPhone: e.target.value })}
                        required
                        className="bg-white border-gray-300"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="recipientCity">Delivery City</Label>
                    <Input
                      id="recipientCity"
                      value={formData.recipientCity}
                      onChange={(e) => setFormData({ ...formData, recipientCity: e.target.value })}
                      required
                      className="bg-white border-gray-300"
                      placeholder="Casablanca, Rabat, etc."
                    />
                  </div>

                  <div>
                    <Label htmlFor="recipientAddress">Delivery Address</Label>
                    <Input
                      id="recipientAddress"
                      value={formData.recipientAddress}
                      onChange={(e) => setFormData({ ...formData, recipientAddress: e.target.value })}
                      required
                      className="bg-white border-gray-300"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 text-lg">Package Details</h3>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                      className="bg-white border-gray-300"
                      placeholder="What are you shipping?"
                    />
                  </div>

                  <div>
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      required
                      className="bg-white border-gray-300"
                    />
                  </div>
                </div>

                <Button type="submit" disabled={loading} className="w-full bg-red-600 hover:bg-red-700 text-white">
                  {loading ? "Creating..." : "Create Shipment"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}