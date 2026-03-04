"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UserCircle, Truck, AlertCircle } from "lucide-react"
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar"
import { userAPI } from "@/lib/api-client"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"  // Ajout de cet import

export default function ProfilePage() {
  const router = useRouter()  // Ajout de cette ligne
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState("")
  const [requestSent, setRequestSent] = useState(false)

  useEffect(() => {
    const role = localStorage.getItem("userRole") || ""
    setUserRole(role)
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await userAPI.getProfile()
      setProfile(response.data)
    } catch (error) {
      console.error("[v0] Failed to fetch profile:", error)
    } finally {
      setLoading(false)
    }
  }

  // Remplacez cette fonction par la nouvelle version
  const handleRequestCourierRole = () => {
    router.push("/dashboard/become-courier")
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="animate-spin h-8 w-8 border-4 border-red-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar
        role={userRole === "ROLE_ADMIN" ? "ADMIN" : userRole === "ROLE_COURIER" ? "COURIER" : "CLIENT"}
      />

      <div className="flex-1">
        <header className="border-b border-gray-200 bg-white">
          <div className="px-8 py-6">
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-600">Manage your account information</p>
          </div>
        </header>

        <div className="p-8 space-y-6">
          {/* Profile Info */}
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center gap-2">
                <UserCircle className="h-5 w-5 text-red-600" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-600">First Name</Label>
                  <Input
                    value={profile?.firstName || ""}
                    disabled
                    className="bg-gray-50 border-gray-300 text-gray-900"
                  />
                </div>
                <div>
                  <Label className="text-gray-600">Last Name</Label>
                  <Input
                    value={profile?.lastName || ""}
                    disabled
                    className="bg-gray-50 border-gray-300 text-gray-900"
                  />
                </div>
              </div>

              <div>
                <Label className="text-gray-600">Email</Label>
                <Input value={profile?.email || ""} disabled className="bg-gray-50 border-gray-300 text-gray-900" />
              </div>

              <div>
                <Label className="text-gray-600">Phone</Label>
                <Input
                  value={profile?.phone || "Not provided"}
                  disabled
                  className="bg-gray-50 border-gray-300 text-gray-900"
                />
              </div>

              <div>
                <Label className="text-gray-600">Address</Label>
                <Input
                  value={profile?.address || "Not provided"}
                  disabled
                  className="bg-gray-50 border-gray-300 text-gray-900"
                />
              </div>

              <div>
                <Label className="text-gray-600">Account Role</Label>
                <div className="mt-2">
                  <Badge className="bg-blue-100 text-blue-800 text-sm">{profile?.role}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Courier Request (Only for CLIENT role) */}
          {userRole === "ROLE_CLIENT" && !requestSent && (
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-gray-900 flex items-center gap-2">
                  <Truck className="h-5 w-5 text-red-600" />
                  Become a Courier
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-900 font-medium">Want to deliver packages?</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Apply to become a courier and start earning by delivering packages in your area.
                    </p>
                  </div>
                </div>

                <Button onClick={handleRequestCourierRole} className="bg-red-600 hover:bg-red-700 text-white w-full">
                  <Truck className="h-4 w-4 mr-2" />
                  Request Courier Role
                </Button>
              </CardContent>
            </Card>
          )}

          {requestSent && (
            <Card className="border-gray-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                    <Truck className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Application Submitted!</h3>
                    <p className="text-sm text-gray-600">Your courier request is pending admin approval.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}