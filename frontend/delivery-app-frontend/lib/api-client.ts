import axios from "axios"

// API Gateway base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token")
      localStorage.removeItem("userRole")
      localStorage.removeItem("userEmail")
      window.location.href = "/auth/login"
    }
    return Promise.reject(error)
  },
)

// Auth APIs
export const authAPI = {
  login: (email: string, password: string) => apiClient.post("/api/auth/login", { email, password }),

  register: (data: {
    firstName: string
    lastName: string
    email: string
    password: string
    phone: string
    address: string
  }) => apiClient.post("/api/auth/register", data),
}

// User APIs
export const userAPI = {

  getProfile: () => {
  const userEmail = localStorage.getItem("userEmail");
  return apiClient.get(`/api/users/by-email/${userEmail}`);
  },

  updateProfile: (data: any) => apiClient.put("/api/users/profile", data),

  getAllUsers: () => apiClient.get("/api/users"),

  requestCourierRole: () => apiClient.post("/api/users/request-courier"),

  deleteUser: (id: number) => apiClient.delete(`/api/users/${id}`),
}

// Courier APIs
export const courierAPI = {
  getAllCouriers: () => apiClient.get("/api/couriers"),

  getPendingRequests: () => apiClient.get("/api/couriers/admin/requests"),

  approveCourier: (id: number) => apiClient.post(`/api/couriers/admin/approve/${id}`),

  rejectCourier: (id: number) => apiClient.post(`/api/couriers/admin/reject/${id}`),

  getCourierDeliveries: () => apiClient.get("/api/packages/courier/assignments"),
  

  updateDeliveryStatus: (packageId: number, status: string) =>
    apiClient.put(`/api/couriers/deliveries/${packageId}/status`, { status }),


   // Méthode pour postuler comme livreur
  applyForCourier: (data: {
    fullName: string
    phone: string
    cinNumber: string
    vehicleType: string
  }) => apiClient.post("/api/couriers/apply", data),
}

// Package APIs
export const packageAPI = {
  getAllPackages: () => apiClient.get("/api/packages"),

  getPackageById: (id: number) => apiClient.get(`/api/packages/${id}`),

  getMyPackages: () => apiClient.get("/api/packages/my"),

  trackPackage: (trackingNumber: string) => apiClient.get(`/api/packages/tracking/${trackingNumber}`),
  cancelPackage: (id: number) => apiClient.put(`/api/packages/${id}/cancel`),

  createPackage: (data: {
    description: string
    senderAddress: string
    recipientName: string
    recipientPhone: string
    recipientCity: string
    recipientAddress: string
    weight: number
  }) => apiClient.post("/api/packages/create", data),

  assignCourier: (packageId: number, courierId: number) =>
    apiClient.put(`/api/packages/${packageId}/assign`, { courierId }),

  updateStatus: (packageId: number, status: string) => apiClient.put(`/api/packages/${packageId}/status`, { status }),

  deletePackage: (id: number) => apiClient.delete(`/api/packages/${id}`),
}

// Stats APIs
export const statsAPI = {
  getAdminStats: () => apiClient.get("/api/packages/stats"),

  getClientStats: () => apiClient.get("/api/packages/my-stats"),

  getCourierStats: () => apiClient.get("/api/couriers/stats"),
}
