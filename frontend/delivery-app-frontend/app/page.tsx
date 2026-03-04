"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Package, Truck, MapPin, Clock, Shield, Globe, Search, 
  ChevronRight, User, Phone, Weight, CheckCircle, AlertCircle,
  ArrowRight, Zap, Award, Star, Users, Target, Globe as GlobeIcon,
  ShieldCheck, Navigation, Sparkles
} from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { packageAPI } from "@/lib/api-client"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { motion } from "framer-motion"

export default function HomePage() {
  const [trackingNumber, setTrackingNumber] = useState("")
  const [trackingResult, setTrackingResult] = useState<any>(null)
  const [trackingError, setTrackingError] = useState<string>("")
  const [isTracking, setIsTracking] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("token")
    setIsLoggedIn(!!token)

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleTrackPackage = async () => {
    if (!trackingNumber.trim()) {
      setTrackingError("Please enter a tracking number")
      return
    }

    setIsTracking(true)
    setTrackingError("")
    setTrackingResult(null)

    try {
      const response = await packageAPI.trackPackage(trackingNumber)
      setTrackingResult(response.data)
      setDialogOpen(true)
    } catch (error: any) {
      console.error("Tracking failed:", error)
      setTrackingError(error.response?.data?.message || "Package not found. Please check your tracking number.")
      setDialogOpen(true)
    } finally {
      setIsTracking(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      PREPARATION: "bg-amber-100 text-amber-800 border-amber-300",
      ASSIGNED: "bg-blue-100 text-blue-800 border-blue-300",
      IN_TRANSIT: "bg-indigo-100 text-indigo-800 border-indigo-300",
      DELIVERED: "bg-emerald-100 text-emerald-800 border-emerald-300",
      CANCELLED: "bg-rose-100 text-rose-800 border-rose-300",
    }
    return statusColors[status] || "bg-gray-100 text-gray-800"
  }

  const getStatusIcon = (status: string) => {
    const icons: Record<string, any> = {
      PREPARATION: Clock,
      ASSIGNED: Package,
      IN_TRANSIT: Truck,
      DELIVERED: CheckCircle,
      CANCELLED: AlertCircle,
    }
    return icons[status] || Package
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleTrackPackage()
    }
  }

  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  }

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const scaleIn = {
    initial: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { duration: 0.5 }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header with scroll effect */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg py-3' : 'bg-transparent py-6'
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="bg-gradient-to-br from-red-600 to-red-700 p-3 rounded-xl shadow-lg">
                <Truck className="h-7 w-7 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
                  ColisExpress
                </span>
                <div className="h-1 w-16 bg-gradient-to-r from-red-600 to-red-400 rounded-full mt-1"></div>
              </div>
            </motion.div>
            
            <nav className="hidden md:flex items-center gap-8">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Link href="#services" className="text-gray-700 hover:text-red-600 font-medium transition-all duration-300 hover:scale-105 relative group">
                  Services
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-600 group-hover:w-full transition-all duration-300"></span>
                </Link>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Link href="#track" className="text-gray-700 hover:text-red-600 font-medium transition-all duration-300 hover:scale-105 relative group">
                  Track
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-600 group-hover:w-full transition-all duration-300"></span>
                </Link>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Link href="#about" className="text-gray-700 hover:text-red-600 font-medium transition-all duration-300 hover:scale-105 relative group">
                  About
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-600 group-hover:w-full transition-all duration-300"></span>
                </Link>
              </motion.div>
              
              {isLoggedIn ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <Link href="/dashboard">
                    <Button className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5">
                      Dashboard
                    </Button>
                  </Link>
                </motion.div>
              ) : (
                <>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Link href="/auth/register">
                      <Button variant="outline" className="border-gray-300 hover:border-red-600 hover:text-red-600 bg-white/80 backdrop-blur-sm hover:bg-red-50 transition-all duration-300 shadow-sm hover:shadow-md">
                        Sign Up
                      </Button>
                    </Link>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Link href="/auth/login">
                      <Button className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5">
                        Log In
                      </Button>
                    </Link>
                  </motion.div>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section with gradient background */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-white to-red-50"></div>
        <div className="absolute top-0 left-0 w-72 h-72 bg-red-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-red-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-red-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Badge className="mb-6 bg-gradient-to-r from-red-100 to-red-50 text-red-700 border-red-200 hover:scale-105 transition-transform">
                <Sparkles className="h-4 w-4 mr-2" />
                Trusted by 10,000+ businesses
              </Badge>
              
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                <span className="bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
                  Ship Smarter,
                </span>
                <br />
                <span className="text-gray-800">Deliver Faster</span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Real-time tracking, secure delivery, and logistics solutions that power your business growth. 
                Experience the future of shipping today.
              </p>

              {/* Enhanced Tracking Box */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="border-2 border-gray-200 shadow-2xl hover:shadow-3xl transition-all duration-500 backdrop-blur-sm bg-white/90">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="bg-gradient-to-br from-red-600 to-red-700 p-3 rounded-xl shadow-lg">
                        <Search className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <span className="font-bold text-gray-900 text-xl">Track Your Package</span>
                        <p className="text-sm text-gray-500">Enter tracking number for real-time updates</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          placeholder="Enter tracking number (e.g., TRK-12345678)"
                          value={trackingNumber}
                          onChange={(e) => {
                            setTrackingNumber(e.target.value)
                            setTrackingError("")
                          }}
                          onKeyDown={handleKeyDown}
                          className="flex-1 border-2 border-gray-300 pl-12 h-14 text-base rounded-xl hover:border-red-300 focus:border-red-500 transition-colors"
                        />
                      </div>
                      <Button 
                        onClick={handleTrackPackage}
                        disabled={isTracking}
                        className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 h-14 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                      >
                        {isTracking ? (
                          <div className="flex items-center gap-2">
                            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                            Tracking...
                          </div>
                        ) : (
                          <>
                            <Search className="h-5 w-5 mr-2" />
                            Track Now
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </>
                        )}
                      </Button>
                    </div>
                    
                    {trackingError && (
                      <motion.p 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="text-sm text-red-600 mt-4 flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-200"
                      >
                        <AlertCircle className="h-4 w-4" />
                        {trackingError}
                      </motion.p>
                    )}
                    
                    <p className="text-xs text-gray-500 mt-4 flex items-center">
                      <ShieldCheck className="h-3 w-3 mr-2" />
                      Your tracking information is secure and encrypted
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Quick Stats */}
              <motion.div 
                className="grid grid-cols-3 gap-4 mt-8"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                {[
                  { value: "50K+", label: "Packages Delivered", icon: Package },
                  { value: "100+", label: "Cities Served", icon: MapPin },
                  { value: "24/7", label: "Support", icon: Clock },
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    variants={scaleIn}
                    className="text-center p-4 bg-white rounded-xl border border-gray-200 hover:border-red-200 hover:shadow-lg transition-all duration-300 group hover:-translate-y-1"
                  >
                    <div className="inline-flex p-3 rounded-lg bg-gradient-to-br from-red-50 to-red-100 group-hover:from-red-100 group-hover:to-red-200 mb-3">
                      <stat.icon className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Hero Image with floating elements */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-red-600 to-red-800 rounded-3xl opacity-20 blur-2xl"></div>
                <img 
                  src="/delivery-courier-with-red-uniform-holding-packages.jpg" 
                  alt="Delivery courier" 
                  className="relative rounded-2xl shadow-2xl transform hover:scale-[1.02] transition-transform duration-500"
                />
                
                {/* Floating cards */}
                <motion.div 
                  className="absolute -top-6 -left-6 bg-white p-4 rounded-xl shadow-xl max-w-xs border border-gray-200"
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-100 p-3 rounded-full">
                      <CheckCircle className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">98% On-time Delivery</p>
                      <p className="text-sm text-gray-600">Industry leading rate</p>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="absolute -bottom-6 -right-6 bg-white p-4 rounded-xl shadow-xl max-w-xs border border-gray-200"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <Award className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Award Winning</p>
                      <p className="text-sm text-gray-600">Best logistics 2024</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-4 bg-gradient-to-r from-red-100 to-red-50 text-red-700 border-red-200">
              <Zap className="h-4 w-4 mr-2" />
              Our Services
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Complete Logistics
              <span className="bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent"> Solutions</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              End-to-end delivery solutions designed to scale with your business needs
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Package,
                title: "Send Shipment",
                description: "Start shipping with ease. No registrations required for quick send!",
                color: "from-red-600 to-red-700",
                buttonColor: "red",
                link: "/auth/register"
              },
              {
                icon: Users,
                title: "Become a Courier",
                description: "Join our network and earn money delivering packages in your city",
                color: "from-blue-600 to-blue-700",
                buttonColor: "blue",
                link: "/auth/register?role=courier"
              },
              {
                icon: GlobeIcon,
                title: "Global Reach",
                description: "Delivering to over 100 cities with trusted international partners",
                color: "from-emerald-600 to-emerald-700",
                buttonColor: "emerald",
                link: "/packages"
              }
            ].map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-2 border-gray-200 hover:border-gray-300 hover:shadow-2xl transition-all duration-500 group h-full bg-gradient-to-b from-white to-gray-50">
                  <CardContent className="p-8 h-full flex flex-col">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <service.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">{service.title}</h3>
                    <p className="text-gray-600 mb-8 flex-grow">{service.description}</p>
                    <Link href={service.link}>
                      <Button 
                        variant="outline" 
                        className={`w-full border-${service.buttonColor}-600 text-${service.buttonColor}-600 hover:bg-${service.buttonColor}-50 bg-white group-hover:scale-105 transition-all duration-300`}
                      >
                        Get Started
                        <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-4 bg-gradient-to-r from-red-100 to-red-50 text-red-700 border-red-200">
              <Star className="h-4 w-4 mr-2" />
              Why Choose Us
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Built for
              <span className="bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent"> Modern Logistics</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Cutting-edge technology meets unparalleled service excellence
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Navigation, title: "Real-Time Tracking", description: "Live updates every step of the journey", color: "red" },
              { icon: ShieldCheck, title: "Secure Delivery", description: "Military-grade encryption for your shipments", color: "blue" },
              { icon: Target, title: "Precision Routing", description: "AI-powered optimal delivery paths", color: "emerald" },
              { icon: Zap, title: "Lightning Fast", description: "Express delivery in record time", color: "amber" },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center group"
              >
                <div className={`relative inline-block mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <div className={`absolute inset-0 bg-gradient-to-br from-${feature.color}-600 to-${feature.color}-800 rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity`}></div>
                  <div className={`relative bg-gradient-to-br from-${feature.color}-100 to-${feature.color}-50 w-24 h-24 rounded-full flex items-center justify-center shadow-lg border-2 border-white`}>
                    <feature.icon className={`h-12 w-12 text-${feature.color}-600`} />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
                <div className="h-1 w-12 bg-gradient-to-r from-gray-300 to-transparent mx-auto mt-4 rounded-full group-hover:w-24 transition-all duration-300"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section with gradient */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-600 via-red-700 to-red-800"></div>
        <div className="absolute top-0 left-0 w-64 h-64 bg-red-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-red-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-6 bg-white/20 backdrop-blur-sm text-white border-white/30">
              <Sparkles className="h-4 w-4 mr-2" />
              Ready to Transform Your Logistics?
            </Badge>
            
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Ship Smarter Today
            </h2>
            
            <p className="text-xl text-red-100 mb-10 max-w-2xl mx-auto">
              Join thousands of businesses who trust us with their critical deliveries
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link href="/auth/register">
                <Button 
                  size="lg" 
                  className="bg-white text-red-600 hover:bg-gray-100 px-10 py-6 text-lg rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  Start Free Trial
                  <ArrowRight className="h-5 w-5 ml-3" />
                </Button>
              </Link>
              
              <Link href="/packages">
                <Button 
                  size="lg" 
                  //variant="outline" 
                  className="border-2 border-white text-white hover:bg-white/10 px-10 py-6 text-lg rounded-xl backdrop-blur-sm hover:backdrop-blur-md transition-all duration-300"
                >
                  <Search className="h-5 w-5 mr-3" />
                  Track Package
                </Button>
              </Link>
            </div>
            
            <p className="text-red-200 mt-8 flex items-center justify-center gap-2">
              <CheckCircle className="h-5 w-5" />
              No credit card required • 30-day money back guarantee
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-gray-300 py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-br from-red-600 to-red-700 p-3 rounded-xl">
                  <Truck className="h-6 w-6 text-white" />
                </div>
                <div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                    ColisExpress
                  </span>
                  <div className="h-1 w-16 bg-gradient-to-r from-red-600 to-red-400 rounded-full mt-1"></div>
                </div>
              </div>
              <p className="text-sm text-gray-400">
                Modern logistics solutions powering the future of e-commerce and business delivery.
              </p>
            </div>

            {[
              {
                title: "Services",
                links: [
                  { label: "Package Tracking", href: "/packages" },
                  { label: "Express Delivery", href: "#services" },
                  { label: "Enterprise Solutions", href: "#services" }
                ]
              },
              {
                title: "Company",
                links: [
                  { label: "About Us", href: "#about" },
                  { label: "Careers", href: "#services" },
                  { label: "Contact Sales", href: "#" }
                ]
              },
              {
                title: "Resources",
                links: [
                  { label: "Help Center", href: "#" },
                  { label: "API Documentation", href: "#" },
                  { label: "Status", href: "#" }
                ]
              }
            ].map((column, index) => (
              <div key={index}>
                <h4 className="font-semibold text-white mb-6 text-lg">{column.title}</h4>
                <ul className="space-y-4">
                  {column.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <Link 
                        href={link.href} 
                        className="text-gray-400 hover:text-red-400 transition-all duration-300 hover:translate-x-1 inline-flex items-center gap-2 group"
                      >
                        <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500">&copy; 2025 ColisExpress. All rights reserved.</p>
            <div className="flex items-center gap-6 mt-4 md:mt-0">
              <span className="text-sm text-gray-500 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                SOC 2 Type II Compliant
              </span>
              <div className="flex gap-4">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-emerald-400">System Operational</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Tracking Results Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-white border-gray-200 text-gray-900 max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl">
          <DialogHeader className="border-b border-gray-200 pb-4">
            <DialogTitle className="text-gray-900 flex items-center gap-3">
              <div className="bg-gradient-to-br from-red-600 to-red-700 p-2 rounded-lg">
                <Package className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl">Package Tracking Results</span>
            </DialogTitle>
          </DialogHeader>
          
          {trackingError ? (
            <motion.div 
              className="text-center py-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="inline-flex p-4 rounded-full bg-red-100 mb-4">
                <AlertCircle className="h-12 w-12 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Tracking Failed</h3>
              <p className="text-gray-600 mb-6">{trackingError}</p>
              <Button 
                onClick={() => setDialogOpen(false)}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg"
              >
                Try Again
              </Button>
            </motion.div>
          ) : trackingResult ? (
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {/* Package Header */}
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 font-mono">{trackingResult.trackingNumber}</h3>
                  <p className="text-gray-600">Tracking Information</p>
                </div>
                <Badge className={`${getStatusBadge(trackingResult.status)} text-sm px-4 py-2 rounded-lg`}>
                  {trackingResult.status}
                </Badge>
              </div>

              {/* Status Info */}
              <Card className="border-2 border-gray-200 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-xl ${getStatusBadge(trackingResult.status).split(' ')[0]}`}>
                      {(() => {
                        const Icon = getStatusIcon(trackingResult.status)
                        return <Icon className="h-8 w-8" />
                      })()}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-lg">{trackingResult.status}</p>
                      <p className="text-gray-600">Current package status</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Package Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-2 border-gray-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-gray-900 flex items-center gap-2">
                      <User className="h-5 w-5 text-red-600" />
                      Recipient Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-medium text-gray-900 text-lg">{trackingResult.recipientName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium text-gray-900 flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {trackingResult.recipientPhone}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-gray-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-gray-900 flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-red-600" />
                      Delivery Info
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600">City</p>
                      <p className="font-medium text-gray-900 text-lg">{trackingResult.recipientCity}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Weight</p>
                      <p className="font-medium text-gray-900 flex items-center gap-2">
                        <Weight className="h-4 w-4" />
                        {trackingResult.weight} kg
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Address & Description */}
              <Card className="border-2 border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-gray-900 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-red-600" />
                    Delivery Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium text-gray-900">{trackingResult.recipientAddress}</p>
                </CardContent>
              </Card>

              {trackingResult.description && (
                <Card className="border-2 border-gray-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-gray-900 flex items-center gap-2">
                      <Package className="h-5 w-5 text-red-600" />
                      Description
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-900">{trackingResult.description}</p>
                  </CardContent>
                </Card>
              )}

              <div className="flex justify-end gap-4 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  className="border-gray-300 hover:border-red-600"
                >
                  Close
                </Button>
                {isLoggedIn ? (
                  <Link href="/packages" onClick={() => setDialogOpen(false)}>
                    <Button className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg">
                      View All Packages
                    </Button>
                  </Link>
                ) : (
                  <Link href="/auth/register" onClick={() => setDialogOpen(false)}>
                    <Button className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg">
                      Create Account
                    </Button>
                  </Link>
                )}
              </div>
            </motion.div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Add custom animations to tailwind config */}
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
      `}</style>
    </div>
  )
}