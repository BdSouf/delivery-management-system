"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import AdminDashboard from "@/components/dashboards/admin-dashboard"
import ClientDashboard from "@/components/dashboards/client-dashboard"
import CourierDashboard from "@/components/dashboards/courier-dashboard"

export default function DashboardPage() {
  const router = useRouter()
  const [userRole, setUserRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    const role = localStorage.getItem("userRole")

    if (!token) {
      router.push("/auth/login")
      return
    }

    setUserRole(role)
    setLoading(false)
  }, [router])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="animate-spin h-8 w-8 border-4 border-[#FF6B35] border-t-transparent rounded-full" />
      </div>
    )
  }

  if (userRole === "ROLE_ADMIN") {
    return <AdminDashboard />
  }

  if (userRole === "ROLE_CLIENT") {
    return <ClientDashboard />
  }

  if (userRole === "ROLE_COURIER") {
    return <CourierDashboard />
  }

  if (userRole === "ROLE_COURIER_PENDING") {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="text-center space-y-4 p-8">
          <h2 className="text-2xl font-bold text-white">Account Pending Approval</h2>
          <p className="text-slate-400">Your courier account is waiting for admin approval.</p>
        </div>
      </div>
    )
  }

  return null
}
