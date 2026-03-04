"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Truck, AlertCircle, CheckCircle, User, Mail, Lock, ArrowRight, Sparkles, ShieldCheck, Package, Users, Briefcase, Clock, MapPin, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { apiClient } from "@/lib/api-client"
import { motion } from "framer-motion"

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "CLIENT",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      await apiClient.post("/api/auth/register", formData)

      setSuccess(true)
      setTimeout(() => {
        router.push("/auth/login")
      }, 2000)
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  }

  const roleDescriptions = {
    CLIENT: {
      title: "Client Account",
      description: "Send and track your packages",
      icon: Package,
      color: "from-red-600 to-red-700",
      badgeColor: "bg-red-100 text-red-700 border-red-200",
      features: ["Send packages", "Track shipments", "Manage deliveries"]
    },
    COURIER: {
      title: "Courier Account",
      description: "Deliver packages and earn money",
      icon: Truck,
      color: "from-red-600 to-red-700",
      badgeColor: "bg-red-100 text-red-700 border-red-200",
      features: ["Accept deliveries", "Earn money", "Flexible schedule"]
    }
  }

  const RoleIcon = roleDescriptions[formData.role as keyof typeof roleDescriptions]?.icon || Package

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
      {/* Subtle grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(0,0,0,0.02)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px]"></div>
      
      {/* Red gradient overlays */}
      <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-gradient-to-br from-red-100/30 to-transparent pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-gradient-to-tl from-red-50/40 to-transparent pointer-events-none"></div>
      
      {/* Geometric shapes */}
      <div className="absolute top-10 right-10 w-32 h-32 border border-red-100/20 rounded-full"></div>
      <div className="absolute bottom-20 left-20 w-40 h-40 border border-red-100/20 rounded-lg rotate-45"></div>

      {/* Blob animations */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-red-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-red-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute top-1/2 left-1/4 w-56 h-56 bg-red-50 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-blob animation-delay-4000"></div>

      <div className="w-full max-w-6xl z-10">
        <div className="grid lg:grid-cols-12 gap-8 items-center">
          {/* Left side - Brand & Role Info */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="lg:col-span-7 hidden lg:block"
          >
            <div className="relative space-y-8">
              {/* Brand Header */}
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <motion.div 
                    className="relative"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-red-700 rounded-xl blur-xl opacity-60"></div>
                    <div className="relative bg-white p-4 rounded-xl border border-gray-200 shadow-2xl">
                      <Truck className="h-10 w-10 text-red-600" />
                    </div>
                  </motion.div>
                  <div>
                    <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
                      Colis<span className="text-red-600">Express</span>
                    </h1>
                    <p className="text-gray-600 mt-1">Professional Logistics Platform</p>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-50 to-red-100 blur-3xl rounded-2xl"></div>
                  <div className="relative bg-white backdrop-blur-sm border border-red-100 rounded-2xl p-8 shadow-lg">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                      Join Our Growing Network
                    </h2>
                    <p className="text-gray-700 leading-relaxed">
                      Whether you're shipping packages or delivering them, our platform connects businesses 
                      and individuals with reliable logistics solutions powered by cutting-edge technology.
                    </p>
                  </div>
                </div>
              </div>

              {/* Selected Role Card */}
              <motion.div 
                key={formData.role}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 to-red-700/10 rounded-2xl blur-xl"></div>
                <div className="relative bg-white backdrop-blur-sm border border-gray-200 rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="bg-gradient-to-br from-red-600 to-red-700 p-3.5 rounded-xl">
                      <RoleIcon className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{roleDescriptions[formData.role as keyof typeof roleDescriptions].title}</h3>
                      <p className="text-gray-600 text-sm">{roleDescriptions[formData.role as keyof typeof roleDescriptions].description}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {roleDescriptions[formData.role as keyof typeof roleDescriptions].features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                          <CheckCircle className="h-3 w-3 text-red-600" />
                        </div>
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  {formData.role === "COURIER" && (
                    <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          <AlertCircle className="h-4 w-4 text-yellow-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-yellow-800">
                            Courier accounts require admin approval before you can start accepting deliveries.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Benefits Grid */}
              <div className="grid grid-cols-2 gap-4">
                <motion.div 
                  className="bg-white backdrop-blur-sm border border-gray-200 rounded-xl p-5 hover:border-red-300 hover:shadow-lg transition-all group"
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="inline-flex items-center justify-center p-2.5 bg-gradient-to-br from-red-500 to-red-600 rounded-lg mb-4">
                    <ShieldCheck className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Enterprise Security</h3>
                  <p className="text-sm text-gray-600">SOC 2 Type II compliant</p>
                </motion.div>

                <motion.div 
                  className="bg-white backdrop-blur-sm border border-gray-200 rounded-xl p-5 hover:border-red-300 hover:shadow-lg transition-all group"
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="inline-flex items-center justify-center p-2.5 bg-gradient-to-br from-red-500 to-red-600 rounded-lg mb-4">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Real-time Tracking</h3>
                  <p className="text-sm text-gray-600">Live updates & predictive ETAs</p>
                </motion.div>

                <motion.div 
                  className="bg-white backdrop-blur-sm border border-gray-200 rounded-xl p-5 hover:border-red-300 hover:shadow-lg transition-all group"
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="inline-flex items-center justify-center p-2.5 bg-gradient-to-br from-red-500 to-red-600 rounded-lg mb-4">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Growing Community</h3>
                  <p className="text-sm text-gray-600">10,000+ satisfied users</p>
                </motion.div>

                <motion.div 
                  className="bg-white backdrop-blur-sm border border-gray-200 rounded-xl p-5 hover:border-red-300 hover:shadow-lg transition-all group"
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="inline-flex items-center justify-center p-2.5 bg-gradient-to-br from-red-500 to-red-600 rounded-lg mb-4">
                    <Briefcase className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Business Ready</h3>
                  <p className="text-sm text-gray-600">Scalable solutions</p>
                </motion.div>
              </div>

              {/* Stats */}
              <div className="pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">99.8%</div>
                    <div className="text-sm text-gray-600">Uptime</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">500+</div>
                    <div className="text-sm text-gray-600">Enterprise Clients</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">24/7</div>
                    <div className="text-sm text-gray-600">Support</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right side - Registration Form */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
            className="lg:col-span-5"
          >
            <motion.div
              variants={fadeInUp}
              initial="initial"
              animate="animate"
            >
              <Card className="bg-white border border-gray-200 shadow-2xl">
                <CardHeader className="space-y-3 pb-6 pt-8 px-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-br from-red-600 to-red-700 p-2.5 rounded-lg shadow-md">
                        <Truck className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-bold text-gray-900">
                          Create Account
                        </CardTitle>
                        <CardDescription className="text-gray-600">
                          Join our delivery network
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 rounded-full border border-red-100">
                      <div className="h-1.5 w-1.5 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-red-700 font-medium">Secure</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="px-8 pb-6">
                  {success ? (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200 text-emerald-800 p-8 rounded-xl text-center"
                    >
                      <div className="inline-flex p-4 rounded-full bg-emerald-100 mb-5">
                        <CheckCircle className="h-10 w-10 text-emerald-600" />
                      </div>
                      <h3 className="text-xl font-bold text-emerald-900 mb-2">Registration Successful!</h3>
                      <p className="text-emerald-700 mb-4">
                        Your account has been created successfully. Redirecting to login...
                      </p>
                      <div className="flex items-center justify-center gap-2">
                        <div className="h-2 w-2 bg-emerald-600 rounded-full animate-pulse"></div>
                        <div className="h-2 w-2 bg-emerald-600 rounded-full animate-pulse animation-delay-200"></div>
                        <div className="h-2 w-2 bg-emerald-600 rounded-full animate-pulse animation-delay-400"></div>
                      </div>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {error && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 text-red-800 p-4 rounded-xl flex items-start gap-3 text-sm"
                        >
                          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <span className="font-medium">{error}</span>
                          </div>
                        </motion.div>
                      )}

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                            First Name
                          </Label>
                          <div className="relative">
                            <User className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                            <Input
                              id="firstName"
                              placeholder="John"
                              value={formData.firstName}
                              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                              required
                              className="pl-11 pr-3 h-11 bg-white border border-gray-300 text-gray-900 placeholder:text-gray-500 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all duration-200 hover:border-gray-400"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                            Last Name
                          </Label>
                          <div className="relative">
                            <User className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                            <Input
                              id="lastName"
                              placeholder="Doe"
                              value={formData.lastName}
                              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                              required
                              className="pl-11 pr-3 h-11 bg-white border border-gray-300 text-gray-900 placeholder:text-gray-500 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all duration-200 hover:border-gray-400"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                          Email Address
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="name@company.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                            className="pl-11 pr-3 h-11 bg-white border border-gray-300 text-gray-900 placeholder:text-gray-500 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all duration-200 hover:border-gray-400"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                            Password
                          </Label>
                          <span className="text-xs text-gray-500">Min. 6 characters</span>
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                            minLength={6}
                            className="pl-11 pr-11 h-11 bg-white border border-gray-300 text-gray-900 placeholder:text-gray-500 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all duration-200 hover:border-gray-400"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="role" className="text-sm font-medium text-gray-700">
                          Account Type
                        </Label>
                        <Select 
                          value={formData.role} 
                          onValueChange={(value) => setFormData({ ...formData, role: value })}
                        >
                          <SelectTrigger className="h-11 bg-white border border-gray-300 text-gray-900 hover:border-gray-400 focus:border-red-500 rounded-lg transition-all duration-200">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CLIENT" className="flex items-center gap-3">
                              <div className="flex items-center gap-3">
                                <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                                  <Package className="h-4 w-4 text-red-600" />
                                </div>
                                <div>
                                  <div className="font-medium">Client Account</div>
                                  <div className="text-xs text-gray-500">Send and track packages</div>
                                </div>
                              </div>
                            </SelectItem>
                            <SelectItem value="COURIER" className="flex items-center gap-3">
                              <div className="flex items-center gap-3">
                                <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                                  <Truck className="h-4 w-4 text-red-600" />
                                </div>
                                <div>
                                  <div className="font-medium">Courier Account</div>
                                  <div className="text-xs text-gray-500">Deliver packages</div>
                                </div>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        
                        {formData.role === "COURIER" && (
                          <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                              <p className="text-xs text-yellow-800">
                                <span className="font-semibold">Note:</span> Courier accounts require admin approval before you can start accepting deliveries.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      <Button 
                        type="submit" 
                        disabled={loading}
                        className="w-full h-11 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 group relative overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                        {loading ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                            <span className="font-medium">Creating account...</span>
                          </div>
                        ) : (
                          <>
                            <span className="font-medium">Create Account</span>
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </Button>

                      <div className="relative pt-4">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-3 bg-white text-gray-500">
                            By creating an account
                          </span>
                        </div>
                      </div>

                      <div className="text-center">
                        <p className="text-gray-600 text-sm">
                          You agree to our{" "}
                          <Link href="/terms" className="text-red-600 hover:underline font-medium">
                            Terms
                          </Link>{" "}
                          and{" "}
                          <Link href="/privacy" className="text-red-600 hover:underline font-medium">
                            Privacy Policy
                          </Link>
                        </p>
                      </div>
                    </form>
                  )}
                </CardContent>

                <CardFooter className="px-8 pb-8 pt-6 border-t border-gray-200">
                  <div className="w-full text-center">
                    <p className="text-gray-600 text-sm">
                      Already have an account?{" "}
                      <Link 
                        href="/auth/login" 
                        className="font-semibold text-red-600 hover:text-red-700 hover:underline transition-colors inline-flex items-center group"
                      >
                        Sign in
                        <svg className="w-3 h-3 ml-1.5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </p>
                  </div>
                </CardFooter>
              </Card>
            </motion.div>

            {/* Mobile features */}
            <div className="lg:hidden mt-6 grid grid-cols-2 gap-3">
              <div className="bg-white backdrop-blur-sm border border-red-100 rounded-lg p-4">
                <ShieldCheck className="h-4 w-4 text-red-500 mb-2" />
                <p className="text-xs text-gray-700 font-medium">Enterprise Security</p>
              </div>
              <div className="bg-white backdrop-blur-sm border border-red-100 rounded-lg p-4">
                <CheckCircle className="h-4 w-4 text-red-500 mb-2" />
                <p className="text-xs text-gray-700 font-medium">Trusted Platform</p>
              </div>
            </div>

            {/* Mobile brand section */}
            <div className="lg:hidden mt-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div className="bg-gradient-to-br from-red-600 to-red-700 p-3 rounded-xl shadow-md">
                    <Truck className="h-7 w-7 text-white" />
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
                    ColisExpress
                  </h2>
                </div>
                <p className="text-gray-600 text-sm">Professional Logistics Platform</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Security footer */}
      <div className="absolute bottom-4 left-0 right-0 text-center z-20">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white backdrop-blur-sm border border-red-100 rounded-full shadow-sm">
          <ShieldCheck className="h-3 w-3 text-red-600" />
          <span className="text-xs text-gray-600">ISO 27001 Certified • GDPR Compliant • SOC 2 Type II</span>
        </div>
      </div>

      {/* Add custom animations */}
      <style jsx global>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-pulse {
          animation: pulse 1.5s ease-in-out infinite;
        }
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        .animation-delay-400 {
          animation-delay: 0.4s;
        }
      `}</style>
    </div>
  )
}