"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Package,
  Users,
  Truck,
  Settings,
  LogOut,
  FileText,
  BarChart3,
  Bell,
  UserCircle,
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

interface SidebarProps {
  role: "ADMIN" | "CLIENT" | "COURIER"
}

export function DashboardSidebar({ role }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = () => {
    localStorage.clear()
    router.push("/auth/login")
  }

  const adminLinks = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
    { href: "/dashboard/packages", icon: Package, label: "Packages" },
    { href: "/dashboard/couriers", icon: Truck, label: "Couriers" },
    { href: "/dashboard/users", icon: Users, label: "Users" },
    { href: "/dashboard/requests", icon: FileText, label: "Requests" },
    { href: "/dashboard/analytics", icon: BarChart3, label: "Analytics" },
  ]

  const clientLinks = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/dashboard/packages", icon: Package, label: "My Packages" },
    { href: "/dashboard/new-shipment", icon: Package, label: "New Shipment" },
    { href: "/dashboard/profile", icon: UserCircle, label: "Profile" },
  ]

  const courierLinks = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/dashboard/deliveries", icon: Truck, label: "My Deliveries" },
    { href: "/dashboard/history", icon: FileText, label: "History" },
    { href: "/dashboard/profile", icon: UserCircle, label: "Profile" },
  ]

  const links = role === "ADMIN" ? adminLinks : role === "CLIENT" ? clientLinks : courierLinks

  return (
    <aside className="w-64 bg-gray-50 border-r border-gray-200 min-h-screen flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="bg-red-600 p-2 rounded-lg">
            <Truck className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900"> ColisExpress</h2>
            <p className="text-xs text-gray-500">{role} Portal</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href

          return (
            <Link key={link.href} href={link.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 text-gray-700 hover:bg-red-50 hover:text-red-600",
                  isActive && "bg-red-50 text-red-600 font-medium",
                )}
              >
                <Icon className="h-5 w-5" />
                {link.label}
              </Button>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-200 space-y-1">
        <Button variant="ghost" className="w-full justify-start gap-3 text-gray-700 hover:bg-gray-100">
          <Bell className="h-5 w-5" />
          Notifications
        </Button>
        <Button variant="ghost" className="w-full justify-start gap-3 text-gray-700 hover:bg-gray-100">
          <Settings className="h-5 w-5" />
          Settings
        </Button>
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start gap-3 text-red-600 hover:bg-red-50"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </Button>
      </div>
    </aside>
  )
}
