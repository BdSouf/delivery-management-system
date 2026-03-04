"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users } from "lucide-react"
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar"
import { userAPI } from "@/lib/api-client"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await userAPI.getAllUsers()
      setUsers(response.data)
    } catch (error) {
      console.error("[v0] Failed to fetch users:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar role="ADMIN" />

      <div className="flex-1">
        <header className="border-b border-gray-200 bg-white">
          <div className="px-8 py-6">
            <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
            <p className="text-gray-600">View and manage all registered users</p>
          </div>
        </header>

        <div className="p-8">
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-gray-900 flex items-center gap-2">
                <Users className="h-5 w-5 text-red-600" />
                All Users ({users.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-red-600 border-t-transparent rounded-full" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-200">
                      <TableHead className="text-gray-600">Name</TableHead>
                      <TableHead className="text-gray-600">Email</TableHead>
                      <TableHead className="text-gray-600">Phone</TableHead>
                      <TableHead className="text-gray-600">Address</TableHead>
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
                        <TableCell className="text-gray-700 max-w-xs truncate">{user.address || "N/A"}</TableCell>
                        <TableCell>
                          <Badge className="bg-blue-100 text-blue-800">{user.role}</Badge>
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
