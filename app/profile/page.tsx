"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { User, Mail, Phone, MapPin, Camera, Save, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/components/ui/use-toast"

export default function ProfilePage() {
  const { user, updateUserProfile } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    bio: "",
  })

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  // Load user data when component mounts
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        city: user.city || "",
        state: user.state || "",
        zipCode: user.zipCode || "",
        bio: user.bio || "",
      })
    }
  }, [user])

  // Handle profile form changes
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setProfileForm((prev) => ({ ...prev, [id]: value }))
  }

  // Handle password form changes
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setPasswordForm((prev) => ({ ...prev, [id]: value }))
  }

  // Handle profile form submission
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update user profile
      updateUserProfile({
        ...user,
        ...profileForm,
      })

      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
        variant: "default",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error updating your profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle password form submission
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Validate passwords
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "New password and confirm password must match.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Reset form
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })

      toast({
        title: "Password updated",
        description: "Your password has been updated successfully.",
        variant: "default",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error updating your password. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!user || !user.name) return "U"
    const nameParts = user.name.split(" ")
    if (nameParts.length > 1) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
    }
    return nameParts[0][0].toUpperCase()
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-muted/30">
      <main className="flex-1">
        <div className="container px-4 py-8 md:px-6 md:py-12">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8 rounded-full">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Button>
              <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-4">
            {/* Profile Sidebar */}
            <Card className="md:col-span-1 border-none shadow-md">
              <CardContent className="p-6 flex flex-col items-center">
                <div className="relative mb-4 group">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src="/placeholder.svg?height=96&width=96" alt={user?.name || "User"} />
                    <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Camera className="h-6 w-6 text-white" />
                  </div>
                </div>
                <h2 className="text-xl font-semibold">{user?.name || "User"}</h2>
                <p className="text-sm text-muted-foreground mb-4">{user?.email || "user@example.com"}</p>

                <div className="w-full space-y-2 mt-4">
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/dashboard">
                      <User className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/settings">
                      <User className="mr-2 h-4 w-4" />
                      Account Settings
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Profile Content */}
            <div className="md:col-span-3">
              <Tabs defaultValue="personal" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="personal">Personal Information</TabsTrigger>
                  <TabsTrigger value="security">Security</TabsTrigger>
                </TabsList>

                <TabsContent value="personal">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="border-none shadow-md">
                      <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>Update your personal information and contact details</CardDescription>
                      </CardHeader>
                      <form onSubmit={handleProfileSubmit}>
                        <CardContent className="space-y-4">
                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                              <Label htmlFor="name">Full Name</Label>
                              <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                  id="name"
                                  placeholder="John Doe"
                                  value={profileForm.name}
                                  onChange={handleProfileChange}
                                  className="pl-10"
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="email">Email</Label>
                              <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                  id="email"
                                  type="email"
                                  placeholder="john@example.com"
                                  value={profileForm.email}
                                  onChange={handleProfileChange}
                                  className="pl-10"
                                  disabled
                                />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="phone"
                                placeholder="(123) 456-7890"
                                value={profileForm.phone}
                                onChange={handleProfileChange}
                                className="pl-10"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="address">Address</Label>
                            <div className="relative">
                              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="address"
                                placeholder="123 Main St"
                                value={profileForm.address}
                                onChange={handleProfileChange}
                                className="pl-10"
                              />
                            </div>
                          </div>

                          <div className="grid gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                              <Label htmlFor="city">City</Label>
                              <Input
                                id="city"
                                placeholder="New York"
                                value={profileForm.city}
                                onChange={handleProfileChange}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="state">State</Label>
                              <Input
                                id="state"
                                placeholder="NY"
                                value={profileForm.state}
                                onChange={handleProfileChange}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="zipCode">ZIP Code</Label>
                              <Input
                                id="zipCode"
                                placeholder="10001"
                                value={profileForm.zipCode}
                                onChange={handleProfileChange}
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="bio">Bio</Label>
                            <Textarea
                              id="bio"
                              placeholder="Tell us a little about yourself"
                              value={profileForm.bio}
                              onChange={handleProfileChange}
                              className="min-h-[100px]"
                            />
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-end">
                          <Button
                            type="submit"
                            disabled={isLoading}
                            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                          >
                            {isLoading ? (
                              <span className="flex items-center gap-2">
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    fill="none"
                                  />
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  />
                                </svg>
                                Saving...
                              </span>
                            ) : (
                              <span className="flex items-center gap-2">
                                <Save className="h-4 w-4" />
                                Save Changes
                              </span>
                            )}
                          </Button>
                        </CardFooter>
                      </form>
                    </Card>
                  </motion.div>
                </TabsContent>

                <TabsContent value="security">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="border-none shadow-md">
                      <CardHeader>
                        <CardTitle>Security</CardTitle>
                        <CardDescription>Update your password and security settings</CardDescription>
                      </CardHeader>
                      <form onSubmit={handlePasswordSubmit}>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="currentPassword">Current Password</Label>
                            <Input
                              id="currentPassword"
                              type="password"
                              placeholder="••••••••"
                              value={passwordForm.currentPassword}
                              onChange={handlePasswordChange}
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="newPassword">New Password</Label>
                            <Input
                              id="newPassword"
                              type="password"
                              placeholder="••••••••"
                              value={passwordForm.newPassword}
                              onChange={handlePasswordChange}
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                            <Input
                              id="confirmPassword"
                              type="password"
                              placeholder="••••••••"
                              value={passwordForm.confirmPassword}
                              onChange={handlePasswordChange}
                              required
                            />
                          </div>

                          <div className="text-sm text-muted-foreground">
                            <p>Password requirements:</p>
                            <ul className="list-disc list-inside pl-4 mt-2 space-y-1">
                              <li>At least 8 characters long</li>
                              <li>Must include at least one uppercase letter</li>
                              <li>Must include at least one number</li>
                              <li>Must include at least one special character</li>
                            </ul>
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-end">
                          <Button
                            type="submit"
                            disabled={isLoading}
                            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                          >
                            {isLoading ? (
                              <span className="flex items-center gap-2">
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    fill="none"
                                  />
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  />
                                </svg>
                                Updating...
                              </span>
                            ) : (
                              <span className="flex items-center gap-2">
                                <Save className="h-4 w-4" />
                                Update Password
                              </span>
                            )}
                          </Button>
                        </CardFooter>
                      </form>
                    </Card>
                  </motion.div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

