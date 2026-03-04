"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Truck, AlertCircle } from "lucide-react"
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar"
import { courierAPI } from "@/lib/api-client"
import { useRouter } from "next/navigation"

export default function BecomeCourierPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    cinNumber: "",
    vehicleType: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await courierAPI.applyForCourier(formData)
      alert("Your courier application has been submitted! An admin will review it soon.")
      router.push("/dashboard/profile")
    } catch (error: any) {
      console.error("[v0] Failed to submit courier application:", error)
      alert(error.response?.data?.message || "Failed to submit application")
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
            <h1 className="text-2xl font-bold text-gray-900">Become a Courier</h1>
            <p className="text-gray-600">Apply to become a courier and start earning</p>
          </div>
        </header>

        <div className="p-8">
          <Card className="border-gray-200 max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center gap-2">
                <Truck className="h-5 w-5 text-red-600" />
                Courier Application
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-900 font-medium">Join our delivery team!</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Fill out the form below to apply for a courier position. Your application will be reviewed by our team.
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 text-lg">Personal Information</h3>

                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      required
                      className="bg-white border-gray-300"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                      className="bg-white border-gray-300"
                      placeholder="e.g., 0612345678"
                    />
                  </div>

                  <div>
                    <Label htmlFor="cinNumber">CIN Number</Label>
                    <Input
                      id="cinNumber"
                      value={formData.cinNumber}
                      onChange={(e) => setFormData({ ...formData, cinNumber: e.target.value })}
                      required
                      className="bg-white border-gray-300"
                      placeholder="e.g., AB123456"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 text-lg">Vehicle Information</h3>

                  <div>
                    <Label htmlFor="vehicleType">Vehicle Type</Label>
                    <select
                      id="vehicleType"
                      value={formData.vehicleType}
                      onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900"
                    >
                      <option value="">Select a vehicle type</option>
                      <option value="MOTO">MOTO</option>
                      <option value="voiture">VOITURE</option>
                    </select>
                  </div>
                </div>

                <Button type="submit" disabled={loading} className="w-full bg-red-600 hover:bg-red-700 text-white">
                  {loading ? "Submitting..." : "Submit Application"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}