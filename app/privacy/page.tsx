"use client"

import { useState } from "react"
import { Shield, Lock, ArrowLeft } from "lucide-react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"

// Form validation schema for password change
const securitySchema = z.object({
  currentPassword: z.string().min(6, "Password must be at least 6 characters"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

export default function PrivacyAndSecurityPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  // Form handling for password change
  const securityForm = useForm({
    resolver: zodResolver(securitySchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    }
  })

  // Privacy settings state
  const [privacySettings, setPrivacySettings] = useState({
    shareDeliveryData: false,
    allowLocationTracking: true,
    saveSearchHistory: true,
    dataAnalytics: true,
    twoFactorAuth: false,
    loginAlerts: true,
    deviceHistory: true
  })

  // Handle privacy toggle
  const handlePrivacyToggle = (setting: keyof typeof privacySettings) => {
    setPrivacySettings((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }))
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

  // Handle privacy settings save
  const handleSavePrivacySettings = async () => {
    setIsLoading(true)
    try {
      // Here you would typically make an API call to save privacy settings
      // await savePrivacySettings(privacySettings)
      toast({
        title: "Settings saved",
        description: "Your privacy settings have been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save privacy settings. Please try again.",
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
              <h1 className="text-2xl font-bold tracking-tight">Privacy & Security</h1>
            </div>
          </div>

          <div className="grid gap-6">
            {/* Security Settings Card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <Card className="border-none shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Security Settings
                  </CardTitle>
                  <CardDescription>Manage your account security and password</CardDescription>
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
                      {isLoading ? "Updating..." : "Update Password"}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </motion.div>

            {/* Privacy Settings Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.3, delay: 0.1 }}
            >
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
                        <Label htmlFor="twoFactorAuth">Two-Factor Authentication</Label>
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

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="loginAlerts">Login Alerts</Label>
                        <p className="text-sm text-muted-foreground">
                          Get notified of new login attempts
                        </p>
                      </div>
                      <Switch
                        id="loginAlerts"
                        checked={privacySettings.loginAlerts}
                        onCheckedChange={() => handlePrivacyToggle("loginAlerts")}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="deviceHistory">Device History</Label>
                        <p className="text-sm text-muted-foreground">
                          Keep track of devices used to access your account
                        </p>
                      </div>
                      <Switch
                        id="deviceHistory"
                        checked={privacySettings.deviceHistory}
                        onCheckedChange={() => handlePrivacyToggle("deviceHistory")}
                      />
                    </div>

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
                    onClick={handleSavePrivacySettings}
                    disabled={isLoading}
                    className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                  >
                    {isLoading ? "Saving..." : "Save Privacy Settings"}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  )
} 