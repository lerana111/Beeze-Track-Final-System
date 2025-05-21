"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Package, Search, Truck, CheckCircle, Clock, MapPin, Calendar, ArrowRight, Loader2 } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/contexts/auth-context"
import { useDelivery } from "@/contexts/delivery-context"
import { PackageImage } from "@/components/ui/package-image"

export default function TrackPage() {
  const { user } = useAuth()
  const { deliveries, getDeliveryByTrackingNumber } = useDelivery()
  const searchParams = useSearchParams()
  const trackingId = searchParams.get("id")

  const [trackingNumber, setTrackingNumber] = useState(trackingId || "")
  const [isTracking, setIsTracking] = useState(false)
  const [trackingResult, setTrackingResult] = useState<any>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    if (trackingId) {
      handleTrack()
    }
  }, [trackingId])

  const handleTrack = () => {
    if (!trackingNumber.trim()) {
      setError("Please enter a tracking number")
      return
    }

    setError("")
    setIsTracking(true)

    // Simulate API call with timeout
    setTimeout(() => {
      const result = getDeliveryByTrackingNumber(trackingNumber)

      if (result) {
        setTrackingResult(result)
      } else {
        setError("No package found with this tracking number")
      }

      setIsTracking(false)
    }, 1500)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Pending":
        return <Clock className="h-5 w-5 status-pending" />
      case "In-Transit":
        return <Truck className="h-5 w-5 status-in-transit" />
      case "Delivered":
        return <CheckCircle className="h-5 w-5 status-delivered" />
      case "Cancelled":
      case "Delayed":
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
            className="h-5 w-5 status-delayed"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="m15 9-6 6" />
            <path d="m9 9 6 6" />
          </svg>
        )
      default:
        return <Package className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "status-pending"
      case "In-Transit":
        return "status-in-transit"
      case "Delivered":
        return "status-delivered"
      case "Cancelled":
      case "Delayed":
        return "status-delayed"
      default:
        return "text-gray-500"
    }
  }

  const getStatusDescription = (status: string) => {
    switch (status) {
      case "Pending":
        return "Your package is being prepared for shipment"
      case "In-Transit":
        return "Your package is on its way to the destination"
      case "Delivered":
        return "Your package has been delivered successfully"
      case "Cancelled":
        return "This delivery has been cancelled"
      default:
        return "Status unknown"
    }
  }

  const getProgressPercentage = (status: string) => {
    switch (status) {
      case "Pending":
        return 33
      case "In-Transit":
        return 66
      case "Delivered":
        return 100
      case "Cancelled":
        return 0
      default:
        return 0
    }
  }

  const getBorderColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "border-l-amber-500"
      case "In-Transit":
        return "border-l-blue-500"
      case "Delivered":
        return "border-l-emerald-500"
      case "Cancelled":
      case "Delayed":
        return "border-l-red-500"
      default:
        return "border-l-gray-400"
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-muted/30">
      <main className="flex-1">
        <div className="container px-4 py-12 md:px-6 md:py-24 lg:py-32">
          <div className="mx-auto max-w-3xl space-y-8">
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">Track Your Package</h1>
              <p className="text-muted-foreground md:text-xl">
                Enter your tracking number to get real-time updates on your delivery
              </p>
            </div>
            <Card className="overflow-hidden border-none shadow-lg bg-gradient-card">
              <CardHeader className="bg-muted/50">
                <CardTitle className="text-xl">Package Tracker</CardTitle>
                <CardDescription>Enter your tracking number below</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex flex-col gap-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter tracking number"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      className="flex-1 h-11"
                    />
                    <Button
                      onClick={handleTrack}
                      disabled={isTracking}
                      className="bg-gradient-primary hover:from-primary/90 hover:to-accent/90"
                    >
                      {isTracking ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="animate-spin h-4 w-4" />
                          Tracking...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Search className="h-4 w-4" />
                          Track
                        </span>
                      )}
                    </Button>
                  </div>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-destructive text-sm"
                    >
                      {error}
                    </motion.div>
                  )}
                  {deliveries.length > 0 ? (
                    <div className="text-xs text-muted-foreground mt-2">
                      <span>Try these sample tracking numbers: </span>
                      {deliveries.slice(0, 3).map((delivery, index) => (
                        <span key={delivery.id}>
                          <button
                            type="button"
                            onClick={() => setTrackingNumber(delivery.trackingNumber)}
                            className="text-primary hover:underline"
                          >
                            {delivery.trackingNumber}
                          </button>
                          <span>
                            {" "}
                            ({delivery.status}){index < 2 ? ", " : ""}
                          </span>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground mt-2">
                      <span>No deliveries have been scheduled yet. </span>
                      <Link href="/schedule" className="text-primary hover:underline">
                        Schedule a pickup
                      </Link>
                      <span> to get a tracking number.</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {trackingResult && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <Card
                  className={`overflow-hidden border-none shadow-lg border-l-4 ${getBorderColor(trackingResult.status)}`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-2xl">Tracking Details</CardTitle>
                        <CardDescription>Tracking Number: {trackingResult.trackingNumber}</CardDescription>
                      </div>
                      <div
                        className={`h-16 w-16 rounded-full flex items-center justify-center
                        ${
                          trackingResult.status === "Pending"
                            ? "bg-yellow-100"
                            : trackingResult.status === "In-Transit"
                              ? "bg-blue-100"
                              : trackingResult.status === "Delivered"
                                ? "bg-green-100"
                                : "bg-red-100"
                        }`}
                      >
                        {getStatusIcon(trackingResult.status)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex flex-col items-center justify-center gap-4 md:flex-row bg-muted/30 p-4 rounded-lg">
                      <div className="text-center md:text-left">
                        <h3 className={`text-xl font-bold ${getStatusColor(trackingResult.status)}`}>
                          {trackingResult.status}
                        </h3>
                        <p className="text-muted-foreground">{getStatusDescription(trackingResult.status)}</p>
                      </div>
                      
                      {trackingResult.imageUrl && (
                        <div className="shrink-0 ml-auto">
                          <PackageImage 
                            deliveryId={trackingResult.id} 
                            imageUrl={trackingResult.imageUrl} 
                            readOnly={true}
                          />
                        </div>
                      )}
                    </div>

                    {trackingResult.status !== "Cancelled" && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span
                            className={
                              trackingResult.status === "Pending" ||
                              trackingResult.status === "In-Transit" ||
                              trackingResult.status === "Delivered"
                                ? "font-medium"
                                : ""
                            }
                          >
                            Order Placed
                          </span>
                          <span
                            className={
                              trackingResult.status === "In-Transit" || trackingResult.status === "Delivered"
                                ? "font-medium"
                                : ""
                            }
                          >
                            In Transit
                          </span>
                          <span className={trackingResult.status === "Delivered" ? "font-medium" : ""}>Delivered</span>
                        </div>
                        <Progress
                          value={getProgressPercentage(trackingResult.status)}
                          className="h-2"
                          indicatorClassName={
                            trackingResult.status === "Pending"
                              ? "bg-yellow-500"
                              : trackingResult.status === "In-Transit"
                                ? "bg-blue-500"
                                : trackingResult.status === "Delivered"
                                  ? "bg-green-500"
                                  : "bg-red-500"
                          }
                        />
                      </div>
                    )}

                    <div className="grid gap-4 md:grid-cols-2">
                      <Card className="border border-muted hover:border-primary/20 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 overflow-hidden group">
                        <CardHeader className="pb-2 bg-gradient-to-r from-primary/5 to-transparent">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Package className="h-5 w-5 text-primary" />
                            Package Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <div className="grid gap-3 text-sm">
                            <div className="flex items-center gap-2.5 p-2 rounded-md hover:bg-muted/50 transition-colors group cursor-default">
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
                                <Package className="h-4 w-4" />
                              </div>
                              <div className="flex-1">
                                <div className="text-muted-foreground text-xs">Type</div>
                                <div className="font-medium">{trackingResult.packageType}</div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2.5 p-2 rounded-md hover:bg-muted/50 transition-colors group cursor-default">
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
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
                                  className="h-4 w-4"
                                >
                                  <circle cx="12" cy="12" r="10" />
                                  <path d="M8 12h8" />
                                </svg>
                              </div>
                              <div className="flex-1">
                                <div className="text-muted-foreground text-xs">Weight</div>
                                <div className="font-medium">{trackingResult.weight}</div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2.5 p-2 rounded-md hover:bg-muted/50 transition-colors group cursor-default">
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
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
                                  className="h-4 w-4"
                                >
                                  <rect width="18" height="18" x="3" y="3" rx="2" />
                                  <path d="M3 9h18" />
                                  <path d="M9 21V9" />
                                </svg>
                              </div>
                              <div className="flex-1">
                                <div className="text-muted-foreground text-xs">Dimensions</div>
                                <div className="font-medium">{trackingResult.dimensions}</div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2.5 p-2 rounded-md hover:bg-muted/50 transition-colors group cursor-default">
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
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
                                  className="h-4 w-4"
                                >
                                  <path d="M20 12V8H6a2 2 0 1 1 0-4h12v4" />
                                  <path d="M20 12v4H6a2 2 0 1 0 0 4h12v-4" />
                                </svg>
                              </div>
                              <div className="flex-1">
                                <div className="text-muted-foreground text-xs">Carrier</div>
                                <div className="font-medium">{trackingResult.carrier || "BeezeTrack Express"}</div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border border-muted hover:border-primary/20 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 overflow-hidden group">
                        <CardHeader className="pb-2 bg-gradient-to-r from-primary/5 to-transparent">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Truck className="h-5 w-5 text-primary" />
                            Delivery Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <div className="grid gap-3 text-sm">
                            <div className="flex items-center gap-2.5 p-2 rounded-md hover:bg-muted/50 transition-colors group cursor-default">
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
                                <MapPin className="h-4 w-4" />
                              </div>
                              <div className="flex-1">
                                <div className="text-muted-foreground text-xs">From</div>
                                <div className="font-medium">{trackingResult.from}</div>
                                <div className="text-xs text-muted-foreground">{trackingResult.fromAddress || "Origin facility"}</div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2.5 p-2 rounded-md hover:bg-muted/50 transition-colors group cursor-default">
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
                                <MapPin className="h-4 w-4" />
                              </div>
                              <div className="flex-1">
                                <div className="text-muted-foreground text-xs">To</div>
                                <div className="font-medium">{trackingResult.to}</div>
                                <div className="text-xs text-muted-foreground">{trackingResult.toAddress || "Destination facility"}</div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2.5 p-2 rounded-md hover:bg-muted/50 transition-colors group cursor-default">
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
                                <Calendar className="h-4 w-4" />
                              </div>
                              <div className="flex-1">
                                <div className="text-muted-foreground text-xs">Shipment Date</div>
                                <div className="font-medium">{trackingResult.date}</div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2.5 p-2 rounded-md hover:bg-muted/50 transition-colors group cursor-default">
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
                                <Clock className="h-4 w-4" />
                              </div>
                              <div className="flex-1">
                                <div className="text-muted-foreground text-xs">Estimated Delivery</div>
                                <div className="font-medium">{trackingResult.estimatedDelivery || "Processing"}</div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {trackingResult.updates && (
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">Delivery Updates</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {trackingResult.updates.map((update: any, index: number) => (
                              <div key={index} className="flex gap-4">
                                <div className="flex flex-col items-center">
                                  <div
                                    className={`h-6 w-6 rounded-full flex items-center justify-center
                                    ${index === 0 ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                                  >
                                    {index === 0 ? (
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
                                        className="h-4 w-4"
                                      >
                                        <polyline points="20 6 9 17 4 12" />
                                      </svg>
                                    ) : (
                                      <span className="text-xs">{trackingResult.updates.length - index}</span>
                                    )}
                                  </div>
                                  {index < trackingResult.updates.length - 1 && (
                                    <div className="h-full w-0.5 bg-muted"></div>
                                  )}
                                </div>
                                <div className="space-y-1 pb-4">
                                  <p className="text-sm font-medium">{update.status}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {update.date} - {update.time}
                                  </p>
                                  <p className="text-sm">{update.description}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between border-t p-4">
                    <Button variant="outline" asChild>
                      <Link href="/dashboard">View All Packages</Link>
                    </Button>
                    <Button
                      asChild
                      className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                    >
                      <Link href="/schedule">
                        Schedule Another Pickup
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

