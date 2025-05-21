"use client"

import { useState } from "react"
import { Bell, Sun, ArrowLeft, Save, Shield, User, Lock, Key, Mail, Phone } from "lucide-react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"

// Form validation schemas
const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  company: z.string().optional(),
})

const securitySchema = z.object({
  currentPassword: z.string().min(6, "Password must be at least 6 characters"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

export default function SettingsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, updateUserProfile } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  // Form handling
  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      company: user?.company || ""
    }
  })

  const securityForm = useForm({
    resolver: zodResolver(securitySchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    }
  })

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    marketingEmails: false,
    deliveryUpdates: true,
    securityAlerts: true,
    promotionalOffers: false,
  })

  // Appearance settings
  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: "system",
    language: "english",
    timezone: "UTC-5",
    fontSize: "medium",
    highContrast: false
  })

  // Privacy settings
  const [privacySettings, setPrivacySettings] = useState({
    shareDeliveryData: false,
    allowLocationTracking: true,
    saveSearchHistory: true,
    dataAnalytics: true,
    twoFactorAuth: false
  })

  // Handle notification toggle
  const handleNotificationToggle = (setting: keyof typeof notificationSettings) => {
    setNotificationSettings((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }))
  }

  // Handle privacy toggle
  const handlePrivacyToggle = (setting: keyof typeof privacySettings) => {
    setPrivacySettings((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }))
  }

  // Handle appearance change
  const handleAppearanceChange = (setting: keyof typeof appearanceSettings, value: string) => {
    setAppearanceSettings((prev) => ({
      ...prev,
      [setting]: value,
    }))
  }

  // Handle profile update
  const onProfileSubmit = async (data: z.infer<typeof profileSchema>) => {
    setIsLoading(true)
    try {
      // Include the user's ID in the update data
      await updateUserProfile({
        ...data,
        id: user?.id || '',
      })
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle security settings update
  const onSecuritySubmit = async (data: z.infer<typeof securitySchema>) => {
    setIsLoading(true)
    try {
      // Here you would typically make an API call to update the password
      // await updatePassword(data)
      toast({
        title: "Password updated",
        description: "Your password has been changed successfully.",
      })
      securityForm.reset()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update password. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle settings save
  const handleSaveSettings = async (type: string) => {
    setIsLoading(true)
    try {
      // Here you would typically make API calls to save the respective settings
      switch(type) {
        case "notification":
          // await saveNotificationSettings(notificationSettings)
          break
        case "appearance":
          // await saveAppearanceSettings(appearanceSettings)
          break
        case "privacy":
          // await savePrivacySettings(privacySettings)
          break
      }
      
      toast({
        title: "Settings saved",
        description: `Your ${type} settings have been updated successfully.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error saving your settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
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
              <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
            </div>
          </div>

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-6">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
              <TabsTrigger value="privacy">Privacy</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <Card className="border-none shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Profile Settings
                    </CardTitle>
                    <CardDescription>Manage your personal information</CardDescription>
                  </CardHeader>
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div className="grid gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                              id="name"
                              placeholder="John Doe"
                              {...profileForm.register("name")}
                            />
                            {profileForm.formState.errors.name && (
                              <p className="text-sm text-red-500">{profileForm.formState.errors.name.message}</p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              placeholder="john@example.com"
                              {...profileForm.register("email")}
                            />
                            {profileForm.formState.errors.email && (
                              <p className="text-sm text-red-500">{profileForm.formState.errors.email.message}</p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                              id="phone"
                              placeholder="+1 (555) 000-0000"
                              {...profileForm.register("phone")}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="company">Company</Label>
                            <Input
                              id="company"
                              placeholder="Company Name"
                              {...profileForm.register("company")}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end">
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                      >
                        {isLoading ? "Saving..." : "Save Changes"}
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="security">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <Card className="border-none shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lock className="h-5 w-5" />
                      Security Settings
                    </CardTitle>
                    <CardDescription>Manage your account security</CardDescription>
                  </CardHeader>
                  <form onSubmit={securityForm.handleSubmit(onSecuritySubmit)}>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <div className="grid gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="currentPassword">Current Password</Label>
                            <Input
                              id="currentPassword"
                              type="password"
                              {...securityForm.register("currentPassword")}
                            />
                            {securityForm.formState.errors.currentPassword && (
                              <p className="text-sm text-red-500">{securityForm.formState.errors.currentPassword.message}</p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="newPassword">New Password</Label>
                            <Input
                              id="newPassword"
                              type="password"
                              {...securityForm.register("newPassword")}
                            />
                            {securityForm.formState.errors.newPassword && (
                              <p className="text-sm text-red-500">{securityForm.formState.errors.newPassword.message}</p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                            <Input
                              id="confirmPassword"
                              type="password"
                              {...securityForm.register("confirmPassword")}
                            />
                            {securityForm.formState.errors.confirmPassword && (
                              <p className="text-sm text-red-500">{securityForm.formState.errors.confirmPassword.message}</p>
                            )}
                          </div>
                        </div>
                        <div className="space-y-4 pt-4">
                          <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label htmlFor="twoFactorAuth">Enable 2FA</Label>
                              <p className="text-sm text-muted-foreground">
                                Add an extra layer of security to your account
                              </p>
                            </div>
                            <Switch
                              id="twoFactorAuth"
                              checked={privacySettings.twoFactorAuth}
                              onCheckedChange={() => handlePrivacyToggle("twoFactorAuth")}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => securityForm.reset()}
                        disabled={isLoading}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                      >
                        {isLoading ? "Saving..." : "Update Password"}
                      </Button>
                    </CardFooter>
                  </form>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="notifications">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <Card className="border-none shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="h-5 w-5" />
                      Notification Settings
                    </CardTitle>
                    <CardDescription>Manage how you receive notifications and updates</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Notification Channels</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="emailNotifications">Email Notifications</Label>
                            <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                          </div>
                          <Switch
                            id="emailNotifications"
                            checked={notificationSettings.emailNotifications}
                            onCheckedChange={() => handleNotificationToggle("emailNotifications")}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="pushNotifications">Push Notifications</Label>
                            <p className="text-sm text-muted-foreground">Receive notifications on your device</p>
                          </div>
                          <Switch
                            id="pushNotifications"
                            checked={notificationSettings.pushNotifications}
                            onCheckedChange={() => handleNotificationToggle("pushNotifications")}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="smsNotifications">SMS Notifications</Label>
                            <p className="text-sm text-muted-foreground">Receive notifications via text message</p>
                          </div>
                          <Switch
                            id="smsNotifications"
                            checked={notificationSettings.smsNotifications}
                            onCheckedChange={() => handleNotificationToggle("smsNotifications")}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Notification Types</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="deliveryUpdates">Delivery Updates</Label>
                            <p className="text-sm text-muted-foreground">Status changes and delivery confirmations</p>
                          </div>
                          <Switch
                            id="deliveryUpdates"
                            checked={notificationSettings.deliveryUpdates}
                            onCheckedChange={() => handleNotificationToggle("deliveryUpdates")}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="securityAlerts">Security Alerts</Label>
                            <p className="text-sm text-muted-foreground">Login attempts and security notifications</p>
                          </div>
                          <Switch
                            id="securityAlerts"
                            checked={notificationSettings.securityAlerts}
                            onCheckedChange={() => handleNotificationToggle("securityAlerts")}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="promotionalOffers">Promotional Offers</Label>
                            <p className="text-sm text-muted-foreground">Discounts and special offers</p>
                          </div>
                          <Switch
                            id="promotionalOffers"
                            checked={notificationSettings.promotionalOffers}
                            onCheckedChange={() => handleNotificationToggle("promotionalOffers")}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="marketingEmails">Marketing Emails</Label>
                            <p className="text-sm text-muted-foreground">Newsletters and marketing communications</p>
                          </div>
                          <Switch
                            id="marketingEmails"
                            checked={notificationSettings.marketingEmails}
                            onCheckedChange={() => handleNotificationToggle("marketingEmails")}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button
                      onClick={() => handleSaveSettings("notification")}
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
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="appearance">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <Card className="border-none shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sun className="h-5 w-5" />
                      Appearance Settings
                    </CardTitle>
                    <CardDescription>Customize how BeezeTrack looks and feels</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="theme">Theme</Label>
                        <Select
                          value={appearanceSettings.theme}
                          onValueChange={(value) => handleAppearanceChange("theme", value)}
                        >
                          <SelectTrigger id="theme" className="w-full">
                            <SelectValue placeholder="Select theme" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="light">Light</SelectItem>
                            <SelectItem value="dark">Dark</SelectItem>
                            <SelectItem value="system">System</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="language">Language</Label>
                        <Select
                          value={appearanceSettings.language}
                          onValueChange={(value) => handleAppearanceChange("language", value)}
                        >
                          <SelectTrigger id="language" className="w-full">
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="english">English</SelectItem>
                            <SelectItem value="spanish">Spanish</SelectItem>
                            <SelectItem value="french">French</SelectItem>
                            <SelectItem value="german">German</SelectItem>
                            <SelectItem value="chinese">Chinese</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="timezone">Timezone</Label>
                        <Select
                          value={appearanceSettings.timezone}
                          onValueChange={(value) => handleAppearanceChange("timezone", value)}
                        >
                          <SelectTrigger id="timezone" className="w-full">
                            <SelectValue placeholder="Select timezone" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="UTC-8">Pacific Time (UTC-8)</SelectItem>
                            <SelectItem value="UTC-7">Mountain Time (UTC-7)</SelectItem>
                            <SelectItem value="UTC-6">Central Time (UTC-6)</SelectItem>
                            <SelectItem value="UTC-5">Eastern Time (UTC-5)</SelectItem>
                            <SelectItem value="UTC+0">Greenwich Mean Time (UTC+0)</SelectItem>
                            <SelectItem value="UTC+1">Central European Time (UTC+1)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button
                      onClick={() => handleSaveSettings("appearance")}
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
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="privacy">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <Card className="border-none shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Privacy Settings
                    </CardTitle>
                    <CardDescription>Control your data and privacy preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="shareDeliveryData">Share Delivery Data</Label>
                          <p className="text-sm text-muted-foreground">
                            Allow sharing anonymized delivery data to improve our services
                          </p>
                        </div>
                        <Switch
                          id="shareDeliveryData"
                          checked={privacySettings.shareDeliveryData}
                          onCheckedChange={() => handlePrivacyToggle("shareDeliveryData")}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="allowLocationTracking">Location Tracking</Label>
                          <p className="text-sm text-muted-foreground">
                            Allow location tracking for better delivery estimates
                          </p>
                        </div>
                        <Switch
                          id="allowLocationTracking"
                          checked={privacySettings.allowLocationTracking}
                          onCheckedChange={() => handlePrivacyToggle("allowLocationTracking")}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="saveSearchHistory">Save Search History</Label>
                          <p className="text-sm text-muted-foreground">Save your search history for faster tracking</p>
                        </div>
                        <Switch
                          id="saveSearchHistory"
                          checked={privacySettings.saveSearchHistory}
                          onCheckedChange={() => handlePrivacyToggle("saveSearchHistory")}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="dataAnalytics">Data Analytics</Label>
                          <p className="text-sm text-muted-foreground">
                            Allow us to collect usage data to improve our service
                          </p>
                        </div>
                        <Switch
                          id="dataAnalytics"
                          checked={privacySettings.dataAnalytics}
                          onCheckedChange={() => handlePrivacyToggle("dataAnalytics")}
                        />
                      </div>
                    </div>

                    <div className="space-y-2 pt-4">
                      <h3 className="text-lg font-medium">Data Management</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Manage your personal data stored with BeezeTrack
                      </p>

                      <div className="flex flex-col gap-2 sm:flex-row">
                        <Button variant="outline" className="flex-1">
                          Download My Data
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 text-red-600 hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-900/20"
                        >
                          Delete My Account
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button
                      onClick={() => handleSaveSettings("privacy")}
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
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

