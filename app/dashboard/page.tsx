"use client"

import { useState } from "react"
import {
  Calendar,
  Clock,
  MapPin,
  Package,
  Search,
  Truck,
  TrendingUp,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
} from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/contexts/auth-context"
import { useDelivery } from "@/contexts/delivery-context"
import { PackageImage } from "@/components/ui/package-image"

export default function Dashboard() {
  const { user } = useAuth()
  const { deliveries, statistics, updateDeliveryStatus, updateDeliveryImage } = useDelivery()
  const [searchQuery, setSearchQuery] = useState("")
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string | null>(null)

  const filteredDeliveries = deliveries.filter(
    (delivery) =>
      delivery.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      delivery.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
      delivery.to.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const pendingDeliveries = filteredDeliveries.filter((delivery) => delivery.status === "Pending")
  const inTransitDeliveries = filteredDeliveries.filter((delivery) => delivery.status === "In-Transit")
  const deliveredDeliveries = filteredDeliveries.filter((delivery) => delivery.status === "Delivered")

  // Calculate percentages
  const pendingPercentage =
    statistics.totalDeliveries > 0 ? Math.round((statistics.pendingDeliveries / statistics.totalDeliveries) * 100) : 0
  const inTransitPercentage =
    statistics.totalDeliveries > 0 ? Math.round((statistics.inTransitDeliveries / statistics.totalDeliveries) * 100) : 0
  const deliveredPercentage =
    statistics.totalDeliveries > 0 ? Math.round((statistics.deliveredDeliveries / statistics.totalDeliveries) * 100) : 0

  const handleCancelClick = (id: string) => {
    setSelectedDeliveryId(id)
    setCancelDialogOpen(true)
  }

  const handleCancelConfirm = () => {
    if (selectedDeliveryId) {
      // Update the delivery status to "Cancelled"
      updateDeliveryStatus(selectedDeliveryId, "Cancelled")
      setCancelDialogOpen(false)
    }
  }
  
  const handleImageUploaded = (id: string, imageUrl: string) => {
    updateDeliveryImage(id, imageUrl)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Pending":
        return <Clock className="h-4 w-4 status-pending" />
      case "In-Transit":
        return <Truck className="h-4 w-4 status-in-transit" />
      case "Delivered":
        return <CheckCircle className="h-4 w-4 status-delivered" />
      case "Cancelled":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4 status-delayed"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="m15 9-6 6" />
            <path d="m9 9 6 6" />
          </svg>
        )
      default:
        return <Package className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-amber-100 text-amber-800 hover:bg-amber-200"
      case "In-Transit":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200"
      case "Delivered":
        return "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
      case "Cancelled":
        return "bg-red-100 text-red-800 hover:bg-red-200"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
  }

  const getStatusIconLarge = (status: string) => {
    switch (status) {
      case "Pending":
        return <Clock className="h-8 w-8 status-pending" />
      case "In-Transit":
        return <Truck className="h-8 w-8 status-in-transit" />
      case "Delivered":
        return <CheckCircle className="h-8 w-8 status-delivered" />
      case "Cancelled":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-8 w-8 status-delayed"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="m15 9-6 6" />
            <path d="m9 9 6 6" />
          </svg>
        )
      default:
        return <Package className="h-8 w-8 text-gray-500" />
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-muted/30">
      <main className="flex-1">
        <div className="container px-4 py-6 md:px-6 md:py-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground">
                Welcome back, {user?.name || "User"}! Manage and track your deliveries
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/schedule">
                <Button className="bg-gradient-primary hover:from-primary/90 hover:to-accent/90">
                  <Plus className="mr-2 h-4 w-4" />
                  Schedule a Pickup
                </Button>
              </Link>
              <Link href="/track">
                <Button variant="outline">
                  <Truck className="mr-2 h-4 w-4" />
                  Track Package
                </Button>
              </Link>
            </div>
          </div>

          {/* Statistics Section */}
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <Card className="overflow-hidden border-none shadow-md bg-gradient-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Packages</CardTitle>
                  <Package className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{statistics.totalDeliveries}</div>
                  <p className="text-xs text-muted-foreground">
                    {statistics.totalDeliveries > 0
                      ? `+${statistics.totalDeliveries} from last week`
                      : "No packages yet"}
                  </p>
                  <div className="mt-4 h-1 w-full rounded-full bg-gray-100">
                    <div
                      className="h-1 rounded-full bg-primary"
                      style={{ width: statistics.totalDeliveries > 0 ? "100%" : "0%" }}
                    ></div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card className="overflow-hidden border-none shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">On-Time Delivery Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{statistics.onTimeDeliveryRate}%</div>
                  <p className="text-xs text-muted-foreground">
                    {statistics.onTimeDeliveryRate > 0 ? (
                      <span className="text-green-500 inline-flex items-center">
                        <ArrowUpRight className="mr-1 h-3 w-3" />
                        2%
                      </span>
                    ) : (
                      "No data yet"
                    )}{" "}
                    {statistics.onTimeDeliveryRate > 0 ? "from last month" : ""}
                  </p>
                  <div className="mt-4 h-1 w-full rounded-full bg-gray-100">
                    <div
                      className="h-1 rounded-full bg-green-500"
                      style={{ width: `${statistics.onTimeDeliveryRate}%` }}
                    ></div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card className="overflow-hidden border-none shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Delivery Time</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{statistics.averageDeliveryTime}</div>
                  <p className="text-xs text-muted-foreground">
                    {statistics.deliveredDeliveries > 0 ? (
                      <span className="text-green-500 inline-flex items-center">
                        <ArrowDownRight className="mr-1 h-3 w-3" />
                        0.3 days
                      </span>
                    ) : (
                      "No deliveries completed yet"
                    )}{" "}
                    {statistics.deliveredDeliveries > 0 ? "from last month" : ""}
                  </p>
                  <div className="mt-4 h-1 w-full rounded-full bg-gray-100">
                    <div
                      className="h-1 rounded-full bg-blue-500"
                      style={{ width: statistics.deliveredDeliveries > 0 ? "60%" : "0%" }}
                    ></div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <Card className="overflow-hidden border-none shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Customer Satisfaction</CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
                    <path d="M8.5 8.5v.01" />
                    <path d="M16 15.5v.01" />
                    <path d="M12 12v.01" />
                    <path d="M11 17v.01" />
                    <path d="M7 14v.01" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statistics.customerSatisfaction > 0 ? `${statistics.customerSatisfaction}/5` : "N/A"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {statistics.deliveredDeliveries > 0
                      ? `Based on ${statistics.deliveredDeliveries} reviews`
                      : "No reviews yet"}
                  </p>
                  <div className="mt-4 flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill={star <= Math.floor(statistics.customerSatisfaction) ? "currentColor" : "none"}
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`h-4 w-4 ${star <= Math.floor(statistics.customerSatisfaction) ? "text-yellow-400" : "text-gray-300"}`}
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Delivery Status Overview */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Delivery Status Overview</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <Card className="overflow-hidden border-none shadow-md border-l-4 border-l-yellow-400">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Pending</p>
                        <p className="text-2xl font-bold">{statistics.pendingDeliveries}</p>
                      </div>
                      <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                        <Clock className="h-6 w-6 text-yellow-600" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>{pendingPercentage}% of total</span>
                        <span>
                          {statistics.pendingDeliveries}/{statistics.totalDeliveries}
                        </span>
                      </div>
                      <Progress
                        value={pendingPercentage}
                        className="h-2 bg-yellow-100"
                        indicatorClassName="bg-yellow-500"
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <Card className="overflow-hidden border-none shadow-md border-l-4 border-l-blue-400">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">In Transit</p>
                        <p className="text-2xl font-bold">{statistics.inTransitDeliveries}</p>
                      </div>
                      <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <Truck className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>{inTransitPercentage}% of total</span>
                        <span>
                          {statistics.inTransitDeliveries}/{statistics.totalDeliveries}
                        </span>
                      </div>
                      <Progress
                        value={inTransitPercentage}
                        className="h-2 bg-blue-100"
                        indicatorClassName="bg-blue-500"
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <Card className="overflow-hidden border-none shadow-md border-l-4 border-l-green-400">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Delivered</p>
                        <p className="text-2xl font-bold">{statistics.deliveredDeliveries}</p>
                      </div>
                      <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>{deliveredPercentage}% of total</span>
                        <span>
                          {statistics.deliveredDeliveries}/{statistics.totalDeliveries}
                        </span>
                      </div>
                      <Progress
                        value={deliveredPercentage}
                        className="h-2 bg-green-100"
                        indicatorClassName="bg-green-500"
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <Card className="border-none shadow-md">
              <CardContent className="p-6">
                {deliveries.length > 0 ? (
                  <div className="space-y-8">
                    {deliveries.slice(0, 3).map((delivery, index) => (
                      <div key={delivery.id} className="flex">
                        <div className="mr-4 flex flex-col items-center">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-full 
                            ${
                              delivery.status === "Pending"
                                ? "bg-yellow-100"
                                : delivery.status === "In-Transit"
                                  ? "bg-blue-100"
                                  : delivery.status === "Delivered"
                                    ? "bg-green-100"
                                    : "bg-red-100"
                            }`}
                          >
                            {getStatusIconLarge(delivery.status)}
                          </div>
                          {index < 2 && <div className="h-full w-px bg-border" />}
                        </div>
                        <div className="space-y-1 pb-8">
                          <p className="text-sm font-medium">Package {delivery.trackingNumber}</p>
                          <p className="text-sm text-muted-foreground">
                            Status:{" "}
                            <span
                              className={
                                delivery.status === "Pending"
                                  ? "text-yellow-600"
                                  : delivery.status === "In-Transit"
                                    ? "text-blue-600"
                                    : delivery.status === "Delivered"
                                      ? "text-green-600"
                                      : "text-red-600"
                              }
                            >
                              {delivery.status}
                            </span>
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {delivery.status === "Pending"
                              ? "Scheduled for pickup"
                              : delivery.status === "In-Transit"
                                ? "On its way to destination"
                                : delivery.status === "Delivered"
                                  ? "Successfully delivered"
                                  : "Delivery cancelled"}
                          </p>
                          <p className="text-xs text-muted-foreground">{delivery.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No deliveries yet</h3>
                    <p className="text-muted-foreground mb-4">Schedule your first package pickup to get started</p>
                    <Link href="/schedule">
                      <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
                        <Plus className="mr-2 h-4 w-4" />
                        Schedule a Pickup
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Package List */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Your Packages</h2>
              <div className="flex items-center gap-4">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by tracking number, address..."
                  className="max-w-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            {deliveries.length > 0 ? (
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-6">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                  <TabsTrigger value="in-transit">In Transit</TabsTrigger>
                  <TabsTrigger value="delivered">Delivered</TabsTrigger>
                </TabsList>
                <TabsContent value="all">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredDeliveries.map((delivery) => (
                      <Card key={delivery.id} className="overflow-hidden">
                        <CardHeader className="p-4">
                          <div className="flex items-center justify-between">
                            <Badge className={getStatusColor(delivery.status)}>
                              <span className="flex items-center gap-1">
                                {getStatusIcon(delivery.status)}
                                {delivery.status}
                              </span>
                            </Badge>
                            <span className="text-sm text-muted-foreground">{delivery.date}</span>
                          </div>
                          <CardTitle className="mt-2 text-lg">{delivery.trackingNumber}</CardTitle>
                          <CardDescription>{delivery.packageType}</CardDescription>
                        </CardHeader>
                        <div className="px-4 pb-2">
                          <PackageImage 
                            deliveryId={delivery.id} 
                            imageUrl={delivery.imageUrl} 
                            onImageUploaded={(url) => handleImageUploaded(delivery.id, url)}
                          />
                        </div>
                        <CardContent className="p-4 pt-0">
                          <div className="mt-3 flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <div className="grid gap-0.5">
                              <p className="text-sm leading-none">From: {delivery.from}</p>
                              <p className="text-sm leading-none">To: {delivery.to}</p>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-between p-4 pt-0">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/track?tracking=${delivery.trackingNumber}`}>
                              Track Package
                            </Link>
                          </Button>
                          {delivery.status === "Pending" && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleCancelClick(delivery.id)}
                            >
                              Cancel
                            </Button>
                          )}
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="pending">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {pendingDeliveries.length > 0 ? (
                      pendingDeliveries.map((delivery, index) => (
                        <motion.div
                          key={delivery.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                          <Card className="overflow-hidden border-none shadow-md border-l-4 border-l-yellow-400">
                            <CardHeader className="pb-2">
                              <div className="flex justify-between items-start">
                                <CardTitle className="text-lg">{delivery.packageType}</CardTitle>
                                <Badge className={getStatusColor(delivery.status)}>
                                  <span className="flex items-center gap-1">
                                    {getStatusIcon(delivery.status)}
                                    {delivery.status}
                                  </span>
                                </Badge>
                              </div>
                              <CardDescription>Tracking: {delivery.trackingNumber}</CardDescription>
                            </CardHeader>
                            <CardContent className="pb-2">
                              <div className="grid gap-2">
                                <div className="flex items-start gap-2">
                                  <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                  <div className="grid gap-0.5">
                                    <span className="text-sm font-medium">From</span>
                                    <span className="text-sm text-muted-foreground">{delivery.from}</span>
                                  </div>
                                </div>
                                <div className="flex items-start gap-2">
                                  <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                  <div className="grid gap-0.5">
                                    <span className="text-sm font-medium">To</span>
                                    <span className="text-sm text-muted-foreground">{delivery.to}</span>
                                  </div>
                                </div>
                                <div className="flex items-start gap-2">
                                  <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                  <div className="grid gap-0.5">
                                    <span className="text-sm font-medium">Date</span>
                                    <span className="text-sm text-muted-foreground">{delivery.date}</span>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                            <CardFooter className="pt-2">
                              <div className="flex justify-between w-full">
                                <Link href={`/track?id=${delivery.trackingNumber}`}>
                                  <Button variant="outline" size="sm">
                                    Track
                                  </Button>
                                </Link>
                                <Button variant="destructive" size="sm" onClick={() => handleCancelClick(delivery.id)}>
                                  Cancel
                                </Button>
                              </div>
                            </CardFooter>
                          </Card>
                        </motion.div>
                      ))
                    ) : (
                      <div className="col-span-3 text-center py-12">
                        <Clock className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">No pending deliveries</h3>
                        <p className="text-muted-foreground mb-4">Schedule a pickup to see pending deliveries here</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="in-transit">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {inTransitDeliveries.length > 0 ? (
                      inTransitDeliveries.map((delivery, index) => (
                        <motion.div
                          key={delivery.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                          <Card className="overflow-hidden border-none shadow-md border-l-4 border-l-blue-400">
                            <CardHeader className="pb-2">
                              <div className="flex justify-between items-start">
                                <CardTitle className="text-lg">{delivery.packageType}</CardTitle>
                                <Badge className={getStatusColor(delivery.status)}>
                                  <span className="flex items-center gap-1">
                                    {getStatusIcon(delivery.status)}
                                    {delivery.status}
                                  </span>
                                </Badge>
                              </div>
                              <CardDescription>Tracking: {delivery.trackingNumber}</CardDescription>
                            </CardHeader>
                            <CardContent className="pb-2">
                              <div className="grid gap-2">
                                <div className="flex items-start gap-2">
                                  <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                  <div className="grid gap-0.5">
                                    <span className="text-sm font-medium">From</span>
                                    <span className="text-sm text-muted-foreground">{delivery.from}</span>
                                  </div>
                                </div>
                                <div className="flex items-start gap-2">
                                  <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                  <div className="grid gap-0.5">
                                    <span className="text-sm font-medium">To</span>
                                    <span className="text-sm text-muted-foreground">{delivery.to}</span>
                                  </div>
                                </div>
                                <div className="flex items-start gap-2">
                                  <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                  <div className="grid gap-0.5">
                                    <span className="text-sm font-medium">Date</span>
                                    <span className="text-sm text-muted-foreground">{delivery.date}</span>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                            <CardFooter className="pt-2">
                              <div className="flex justify-between w-full">
                                <Link href={`/track?id=${delivery.trackingNumber}`}>
                                  <Button variant="outline" size="sm">
                                    Track
                                  </Button>
                                </Link>
                                <Button variant="destructive" size="sm" onClick={() => handleCancelClick(delivery.id)}>
                                  Cancel
                                </Button>
                              </div>
                            </CardFooter>
                          </Card>
                        </motion.div>
                      ))
                    ) : (
                      <div className="col-span-3 text-center py-12">
                        <Truck className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">No in-transit deliveries</h3>
                        <p className="text-muted-foreground mb-4">
                          Your packages will appear here when they're on the way
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="delivered">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {deliveredDeliveries.length > 0 ? (
                      deliveredDeliveries.map((delivery, index) => (
                        <motion.div
                          key={delivery.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                          <Card className="overflow-hidden border-none shadow-md border-l-4 border-l-green-400">
                            <CardHeader className="pb-2">
                              <div className="flex justify-between items-start">
                                <CardTitle className="text-lg">{delivery.packageType}</CardTitle>
                                <Badge className={getStatusColor(delivery.status)}>
                                  <span className="flex items-center gap-1">
                                    {getStatusIcon(delivery.status)}
                                    {delivery.status}
                                  </span>
                                </Badge>
                              </div>
                              <CardDescription>Tracking: {delivery.trackingNumber}</CardDescription>
                            </CardHeader>
                            <CardContent className="pb-2">
                              <div className="grid gap-2">
                                <div className="flex items-start gap-2">
                                  <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                  <div className="grid gap-0.5">
                                    <span className="text-sm font-medium">From</span>
                                    <span className="text-sm text-muted-foreground">{delivery.from}</span>
                                  </div>
                                </div>
                                <div className="flex items-start gap-2">
                                  <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                  <div className="grid gap-0.5">
                                    <span className="text-sm font-medium">To</span>
                                    <span className="text-sm text-muted-foreground">{delivery.to}</span>
                                  </div>
                                </div>
                                <div className="flex items-start gap-2">
                                  <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
                                  <div className="grid gap-0.5">
                                    <span className="text-sm font-medium">Date</span>
                                    <span className="text-sm text-muted-foreground">{delivery.date}</span>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                            <CardFooter className="pt-2">
                              <div className="flex justify-between w-full">
                                <Link href={`/track?id=${delivery.trackingNumber}`}>
                                  <Button variant="outline" size="sm">
                                    Track
                                  </Button>
                                </Link>
                              </div>
                            </CardFooter>
                          </Card>
                        </motion.div>
                      ))
                    ) : (
                      <div className="col-span-3 text-center py-12">
                        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">No delivered packages yet</h3>
                        <p className="text-muted-foreground mb-4">Completed deliveries will appear here</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              <Card className="border-none shadow-md">
                <CardContent className="p-12 text-center">
                  <Package className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
                  <h3 className="text-xl font-medium mb-2">No packages yet</h3>
                  <p className="text-muted-foreground max-w-md mx-auto mb-6">
                    You haven't scheduled any deliveries yet. Start by scheduling your first package pickup.
                  </p>
                  <Link href="/schedule">
                    <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
                      <Plus className="mr-2 h-4 w-4" />
                      Schedule a Pickup
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Delivery</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this delivery? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
              No, Keep Delivery
            </Button>
            <Button variant="destructive" onClick={handleCancelConfirm}>
              Yes, Cancel Delivery
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

