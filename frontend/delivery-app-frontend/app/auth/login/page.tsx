"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Truck, AlertCircle, Mail, Lock, Eye, EyeOff, Sparkles, ShieldCheck, ArrowRight, Package, Clock, MapPin, Users, CheckCircle } from "lucide-react"
import Link from "next/link"
import { apiClient } from "@/lib/api-client"
import { motion } from "framer-motion"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [isHovering, setIsHovering] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await apiClient.post("/api/auth/login", {
        email,
        password,
      })

      const { token, role } = response.data

      localStorage.setItem("token", token)
      localStorage.setItem("userRole", role)
      localStorage.setItem("userEmail", email)

      router.push("/dashboard")
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed. Please check your credentials.")
    } finally {
      setLoading(false)
    }
  }

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  }

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
          {/* Left side - Brand & Value Proposition */}
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
                      Optimize Your Supply Chain
                    </h2>
                    <p className="text-gray-700 leading-relaxed">
                      Connect with a global network of logistics partners, track shipments in real-time, 
                      and optimize delivery routes with AI-powered analytics.
                    </p>
                  </div>
                </div>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-2 gap-4">
                <motion.div 
                  className="bg-white backdrop-blur-sm border border-gray-200 rounded-xl p-5 hover:border-red-300 hover:shadow-lg transition-all group"
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="inline-flex items-center justify-center p-2.5 bg-gradient-to-br from-red-500 to-red-600 rounded-lg mb-4">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Real-time Tracking</h3>
                  <p className="text-sm text-gray-600">Live updates with predictive ETAs</p>
                </motion.div>

                <motion.div 
                  className="bg-white backdrop-blur-sm border border-gray-200 rounded-xl p-5 hover:border-red-300 hover:shadow-lg transition-all group"
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="inline-flex items-center justify-center p-2.5 bg-gradient-to-br from-red-500 to-red-600 rounded-lg mb-4">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Route Optimization</h3>
                  <p className="text-sm text-gray-600">AI-powered delivery planning</p>
                </motion.div>

                <motion.div 
                  className="bg-white backdrop-blur-sm border border-gray-200 rounded-xl p-5 hover:border-red-300 hover:shadow-lg transition-all group"
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="inline-flex items-center justify-center p-2.5 bg-gradient-to-br from-red-500 to-red-600 rounded-lg mb-4">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Team Collaboration</h3>
                  <p className="text-sm text-gray-600">Multi-user access control</p>
                </motion.div>

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
              </div>

              {/* Trust Indicators */}
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

          {/* Right side - Login Form */}
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
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
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
                          Sign In
                        </CardTitle>
                        <CardDescription className="text-gray-600">
                          Enter your credentials
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
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 text-red-800 p-4 rounded-xl flex items-start gap-3"
                      >
                        <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <span className="text-sm font-medium">{error}</span>
                        </div>
                      </motion.div>
                    )}

                    <div className="space-y-4">
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
                            value={email}
                            onChange={(e) => {
                              setEmail(e.target.value)
                              setError("")
                            }}
                            required
                            className="pl-11 pr-4 h-11 bg-white border border-gray-300 text-gray-900 placeholder:text-gray-500 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all duration-200 hover:border-gray-400"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                            Password
                          </Label>
                          <Link 
                            href="/auth/forgot-password" 
                            className="text-xs text-red-600 hover:text-red-700 hover:underline transition-colors"
                          >
                            Forgot password?
                          </Link>
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => {
                              setPassword(e.target.value)
                              setError("")
                            }}
                            required
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
                          <span className="font-medium">Signing in...</span>
                        </div>
                      ) : (
                        <span className="font-medium">Sign In to Dashboard</span>
                      )}
                    </Button>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-3 bg-white text-gray-500">
                          Or continue with
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-10 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-400 rounded-lg transition-colors"
                      >
                        <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Google
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-10 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-400 rounded-lg transition-colors"
                      >
                        <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.4181.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                        GitHub
                      </Button>
                    </div>
                  </form>
                </CardContent>

                <CardFooter className="px-8 pb-8 pt-6 border-t border-gray-200">
                  <div className="w-full text-center">
                    <p className="text-gray-600 text-sm">
                      Don't have an account?{" "}
                      <Link 
                        href="/auth/register" 
                        className="font-semibold text-red-600 hover:text-red-700 hover:underline transition-colors inline-flex items-center group"
                      >
                        Request access
                        <ArrowRight className="w-3 h-3 ml-1.5 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </p>
                    <p className="text-xs text-gray-500 mt-3">
                      Contact your system administrator for enterprise access
                    </p>
                  </div>
                </CardFooter>
              </Card>
            </motion.div>

            {/* Mobile features */}
            <div className="lg:hidden mt-6 grid grid-cols-2 gap-3">
              <div className="bg-white backdrop-blur-sm border border-red-100 rounded-lg p-4">
                <CheckCircle className="h-4 w-4 text-red-500 mb-2" />
                <p className="text-xs text-gray-700 font-medium">Enterprise Grade</p>
              </div>
              <div className="bg-white backdrop-blur-sm border border-red-100 rounded-lg p-4">
                <ShieldCheck className="h-4 w-4 text-red-500 mb-2" />
                <p className="text-xs text-gray-700 font-medium">Bank-level Security</p>
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
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}