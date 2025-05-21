"use client"

import type React from "react"

import { useState } from "react"
import { Package, ArrowRight, Check } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/contexts/auth-context"
import { useDelivery } from "@/contexts/delivery-context"

// Generate a stable format for dates to avoid hydration issues
const formatDate = (date: Date) => {
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
};

// Counter for stable IDs
let packageIdCounter = 2000;

export default function SchedulePage() {
  const { user } = useAuth()
  const { addDelivery, fetchUserStatistics } = useDelivery()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [trackingNumber, setTrackingNumber] = useState("")

  // Form state
  const [formData, setFormData] = useState({
    // Pickup details
    pickupName: user?.name || "",
    pickupPhone: "",
    pickupAddress: "",
    pickupCity: "",
    pickupState: "",
    pickupZip: "",
    pickupInstructions: "",

    // Delivery details
    deliveryName: "",
    deliveryPhone: "",
    deliveryAddress: "",
    deliveryCity: "",
    deliveryState: "",
    deliveryZip: "",
    deliveryInstructions: "",

    // Package details
    packageType: "parcel",
    weight: "",
    dimensions: "",
    pickupDate: "",
    pickupTime: "morning",
    packageDescription: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleRadioChange = (value: string) => {
    setFormData((prev) => ({ ...prev, packageType: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    } else {
      // Generate a stable tracking number
      const stableId = `pkg-${packageIdCounter++}`;
      const stableTrackingNumber = `BZ${100000 + packageIdCounter}`;
      setTrackingNumber(stableTrackingNumber)

      // Format current date consistently
      const currentDate = new Date();
      const formattedCurrentDate = formatDate(currentDate);
      
      // Format pickup date consistently
      let pickupDateObj = new Date();
      try {
        if (formData.pickupDate) {
          pickupDateObj = new Date(formData.pickupDate);
        }
      } catch (error) {
        console.error("Invalid date format:", error);
      }
      const formattedPickupDate = formatDate(pickupDateObj);
      
      // Set pickup time based on selection
      const pickupTime = 
        formData.pickupTime === "morning" ? "09:00 AM" : 
        formData.pickupTime === "afternoon" ? "01:00 PM" : "05:00 PM";

      // Create a new delivery
      const newDelivery = {
        id: stableId,
        trackingNumber: stableTrackingNumber,
        packageType: formData.packageType === "parcel" ? "Standard Parcel" : "Express Document",
        weight: `${formData.weight} lbs`,
        dimensions: formData.dimensions || "Standard",
        from: `${formData.pickupCity}, ${formData.pickupState}`,
        to: `${formData.deliveryCity}, ${formData.deliveryState}`,
        date: formattedCurrentDate,
        status: "Pending",
        fromAddress: `${formData.pickupAddress}, ${formData.pickupCity}, ${formData.pickupState} ${formData.pickupZip}`,
        toAddress: `${formData.deliveryAddress}, ${formData.deliveryCity}, ${formData.deliveryState} ${formData.deliveryZip}`,
        updates: [
          {
            status: "Order Placed",
            date: formattedCurrentDate,
            time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
            description: "Your order has been placed and is being processed.",
          },
          {
            status: "Pickup Scheduled",
            date: formattedPickupDate,
            time: pickupTime,
            description: "Pickup has been scheduled for your package.",
            location: `${formData.pickupCity}, ${formData.pickupState}`
          },
        ],
      }

      try {
        // Add the delivery to the context
        await addDelivery(newDelivery);
        
        // Refresh statistics to ensure dashboard is updated
        await fetchUserStatistics();
        
        setFormSubmitted(true);
      } catch (error) {
        console.error("Error creating delivery:", error);
        // Handle error here
      }
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-muted/30">
      <main className="flex-1">
        <div className="container px-4 py-12 md:px-6 md:py-24">
          <div className="mx-auto max-w-3xl space-y-8">
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">Schedule a Pickup</h1>
              <p className="text-muted-foreground md:text-xl">Fill out the form below to schedule a package pickup</p>
            </div>

            {!formSubmitted ? (
              <Card className="border-none shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full ${currentStep >= 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                      >
                        {currentStep > 1 ? <Check className="h-4 w-4" /> : "1"}
                      </div>
                      <div className={`h-0.5 w-8 ${currentStep >= 2 ? "bg-primary" : "bg-muted"}`}></div>
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full ${currentStep >= 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                      >
                        {currentStep > 2 ? <Check className="h-4 w-4" /> : "2"}
                      </div>
                      <div className={`h-0.5 w-8 ${currentStep >= 3 ? "bg-primary" : "bg-muted"}`}></div>
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full ${currentStep >= 3 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                      >
                        3
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">Step {currentStep} of 3</div>
                  </div>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                  <CardContent>
                    {currentStep === 1 && (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-4"
                      >
                        <div className="space-y-2">
                          <h2 className="text-xl font-semibold">Pickup Details</h2>
                          <p className="text-sm text-muted-foreground">
                            Enter the address where we should pick up your package
                          </p>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="pickupName">Full Name</Label>
                            <Input
                              id="pickupName"
                              placeholder="John Doe"
                              required
                              value={formData.pickupName}
                              onChange={handleChange}
                              className="h-11"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="pickupPhone">Phone Number</Label>
                            <Input
                              id="pickupPhone"
                              placeholder="(123) 456-7890"
                              required
                              value={formData.pickupPhone}
                              onChange={handleChange}
                              className="h-11"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="pickupAddress">Address</Label>
                          <Input
                            id="pickupAddress"
                            placeholder="123 Main St"
                            required
                            value={formData.pickupAddress}
                            onChange={handleChange}
                            className="h-11"
                          />
                        </div>
                        <div className="grid gap-4 md:grid-cols-3">
                          <div className="space-y-2">
                            <Label htmlFor="pickupCity">City</Label>
                            <Input
                              id="pickupCity"
                              placeholder="New York"
                              required
                              value={formData.pickupCity}
                              onChange={handleChange}
                              className="h-11"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="pickupState">State</Label>
                            <Input
                              id="pickupState"
                              placeholder="NY"
                              required
                              value={formData.pickupState}
                              onChange={handleChange}
                              className="h-11"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="pickupZip">ZIP Code</Label>
                            <Input
                              id="pickupZip"
                              placeholder="10001"
                              required
                              value={formData.pickupZip}
                              onChange={handleChange}
                              className="h-11"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="pickupInstructions">Special Instructions (Optional)</Label>
                          <Textarea
                            id="pickupInstructions"
                            placeholder="Any special instructions for pickup"
                            value={formData.pickupInstructions}
                            onChange={handleChange}
                            className="min-h-[100px]"
                          />
                        </div>
                      </motion.div>
                    )}

                    {currentStep === 2 && (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-4"
                      >
                        <div className="space-y-2">
                          <h2 className="text-xl font-semibold">Delivery Details</h2>
                          <p className="text-sm text-muted-foreground">
                            Enter the address where we should deliver your package
                          </p>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="deliveryName">Recipient's Full Name</Label>
                            <Input
                              id="deliveryName"
                              placeholder="Jane Smith"
                              required
                              value={formData.deliveryName}
                              onChange={handleChange}
                              className="h-11"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="deliveryPhone">Recipient's Phone Number</Label>
                            <Input
                              id="deliveryPhone"
                              placeholder="(123) 456-7890"
                              required
                              value={formData.deliveryPhone}
                              onChange={handleChange}
                              className="h-11"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="deliveryAddress">Address</Label>
                          <Input
                            id="deliveryAddress"
                            placeholder="456 Oak St"
                            required
                            value={formData.deliveryAddress}
                            onChange={handleChange}
                            className="h-11"
                          />
                        </div>
                        <div className="grid gap-4 md:grid-cols-3">
                          <div className="space-y-2">
                            <Label htmlFor="deliveryCity">City</Label>
                            <Input
                              id="deliveryCity"
                              placeholder="Los Angeles"
                              required
                              value={formData.deliveryCity}
                              onChange={handleChange}
                              className="h-11"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="deliveryState">State</Label>
                            <Input
                              id="deliveryState"
                              placeholder="CA"
                              required
                              value={formData.deliveryState}
                              onChange={handleChange}
                              className="h-11"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="deliveryZip">ZIP Code</Label>
                            <Input
                              id="deliveryZip"
                              placeholder="90001"
                              required
                              value={formData.deliveryZip}
                              onChange={handleChange}
                              className="h-11"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="deliveryInstructions">Special Instructions (Optional)</Label>
                          <Textarea
                            id="deliveryInstructions"
                            placeholder="Any special instructions for delivery"
                            value={formData.deliveryInstructions}
                            onChange={handleChange}
                            className="min-h-[100px]"
                          />
                        </div>
                      </motion.div>
                    )}

                    {currentStep === 3 && (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-4"
                      >
                        <div className="space-y-2">
                          <h2 className="text-xl font-semibold">Package Details</h2>
                          <p className="text-sm text-muted-foreground">
                            Tell us about your package and when you'd like it picked up
                          </p>
                        </div>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Package Type</Label>
                            <RadioGroup
                              defaultValue={formData.packageType}
                              className="grid grid-cols-2 gap-4 pt-2"
                              onValueChange={handleRadioChange}
                            >
                              <div>
                                <RadioGroupItem value="parcel" id="parcel" className="peer sr-only" />
                                <Label
                                  htmlFor="parcel"
                                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-muted hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                >
                                  <Package className="mb-3 h-6 w-6" />
                                  Parcel
                                </Label>
                              </div>
                              <div>
                                <RadioGroupItem value="document" id="document" className="peer sr-only" />
                                <Label
                                  htmlFor="document"
                                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-muted hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                >
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
                                    className="mb-3 h-6 w-6"
                                  >
                                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                                    <polyline points="14 2 14 8 20 8" />
                                  </svg>
                                  Document
                                </Label>
                              </div>
                            </RadioGroup>
                          </div>
                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor="weight">Weight (lbs)</Label>
                              <Input
                                id="weight"
                                type="number"
                                min="0.1"
                                step="0.1"
                                placeholder="2.5"
                                required
                                value={formData.weight}
                                onChange={handleChange}
                                className="h-11"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="dimensions">Dimensions (inches)</Label>
                              <Input
                                id="dimensions"
                                placeholder="12 x 8 x 6"
                                required
                                value={formData.dimensions}
                                onChange={handleChange}
                                className="h-11"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="pickupDate">Pickup Date</Label>
                            <Input
                              id="pickupDate"
                              type="date"
                              required
                              value={formData.pickupDate}
                              onChange={handleChange}
                              className="h-11"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="pickupTime">Preferred Pickup Time</Label>
                            <Select
                              defaultValue={formData.pickupTime}
                              onValueChange={(value) => handleSelectChange("pickupTime", value)}
                            >
                              <SelectTrigger id="pickupTime" className="h-11">
                                <SelectValue placeholder="Select time" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="morning">Morning (8AM - 12PM)</SelectItem>
                                <SelectItem value="afternoon">Afternoon (12PM - 4PM)</SelectItem>
                                <SelectItem value="evening">Evening (4PM - 8PM)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="packageDescription">Package Description</Label>
                            <Textarea
                              id="packageDescription"
                              placeholder="Briefly describe the contents of your package"
                              required
                              value={formData.packageDescription}
                              onChange={handleChange}
                              className="min-h-[100px]"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    {currentStep > 1 ? (
                      <Button type="button" variant="outline" onClick={handlePrevious}>
                        Previous
                      </Button>
                    ) : (
                      <div></div>
                    )}
                    <Button
                      type="submit"
                      className={
                        currentStep < 3
                          ? ""
                          : "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                      }
                    >
                      {currentStep < 3 ? (
                        <span className="flex items-center gap-2">
                          Next
                          <ArrowRight className="h-4 w-4" />
                        </span>
                      ) : (
                        "Schedule Pickup"
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="text-center border-none shadow-lg">
                  <CardHeader>
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                      <Check className="h-10 w-10 text-green-600" />
                    </div>
                    <CardTitle className="text-2xl">Pickup Scheduled Successfully!</CardTitle>
                    <CardDescription>
                      Your package pickup has been scheduled. You can track your package using the tracking number
                      below.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mx-auto max-w-md">
                      <div className="rounded-lg border bg-muted p-4 text-center">
                        <p className="text-sm text-muted-foreground">Tracking Number</p>
                        <p className="text-xl font-bold">{trackingNumber}</p>
                      </div>
                      <div className="mt-6 space-y-4">
                        <p className="text-muted-foreground">
                          We've sent a confirmation email with all the details. Our courier will arrive at the scheduled
                          time.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-center gap-4">
                    <Link href={`/track?id=${trackingNumber}`}>
                      <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
                        Track Package
                      </Button>
                    </Link>
                    <Link href="/dashboard">
                      <Button variant="outline">Go to Dashboard</Button>
                    </Link>
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

