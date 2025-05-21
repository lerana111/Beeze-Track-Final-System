"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import {
  Package,
  Home,
  Truck,
  BarChart3,
  LogOut,
  User,
  Menu,
  X,
  Settings,
  HelpCircle,
  Bell,
  ChevronDown,
  Globe,
  Moon,
  Sun,
  Shield,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"

// Define notification type
type Notification = {
  id: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  type: "update" | "delivery" | "system";
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [theme, setTheme] = useState("system")
  
  // Enhanced notifications
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "n1",
      title: "Package status updated",
      message: "Your package BZ123456 is now in transit.",
      time: "2m ago",
      isRead: false,
      type: "update"
    },
    {
      id: "n2",
      title: "Delivery scheduled",
      message: "Your package BZ789012 is scheduled for delivery tomorrow.",
      time: "1h ago",
      isRead: false,
      type: "delivery"
    },
    {
      id: "n3",
      title: "Package delivered",
      message: "Your package BZ456789 has been delivered successfully.",
      time: "1d ago",
      isRead: false,
      type: "delivery"
    }
  ])

  // Get unread notification count
  const unreadCount = notifications.filter(n => !n.isRead).length

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  // Update the AppShell component to handle authentication state properly
  useEffect(() => {
    // Check if we're on the client side
    if (typeof window !== "undefined") {
      // If user is not logged in but trying to access a protected route, redirect to login
      const isProtectedRoute =
        pathname.startsWith("/dashboard") ||
        pathname.startsWith("/track") ||
        pathname.startsWith("/schedule") ||
        pathname.startsWith("/profile") ||
        pathname.startsWith("/settings")

      if (!user && isProtectedRoute && !pathname.startsWith("/login") && !pathname.startsWith("/signup")) {
        router.push("/login")
      }
    }
  }, [user, pathname, router])

  const isActive = (path: string) => pathname === path

  const navItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "Track", path: "/track", icon: Truck },
    { name: "Schedule", path: "/schedule", icon: Package },
    { name: "Dashboard", path: "/dashboard", icon: BarChart3 },
  ]

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!user || !user.name) return "U"
    const nameParts = user.name.split(" ")
    if (nameParts.length > 1) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
    }
    return nameParts[0][0].toUpperCase()
  }

  // Handle navigation to profile page
  const handleProfileClick = () => {
    router.push("/profile")
  }

  // Handle navigation to packages (dashboard) page
  const handlePackagesClick = () => {
    router.push("/dashboard")
  }

  // Handle navigation to settings page
  const handleSettingsClick = () => {
    router.push("/settings")
  }

  // Handle navigation to privacy page
  const handlePrivacyClick = () => {
    router.push("/privacy")
  }
  
  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notification => ({
      ...notification,
      isRead: true
    })))
    
    toast({
      title: "Notifications cleared",
      description: "All notifications have been marked as read."
    })
  }
  
  // Mark a single notification as read
  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(notification => 
      notification.id === id 
        ? { ...notification, isRead: true } 
        : notification
    ))
  }
  
  // Dismiss a notification
  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
    
    toast({
      title: "Notification dismissed",
      description: "The notification has been removed."
    })
  }
  
  // Handle theme change
  const handleThemeChange = (value: string) => {
    setTheme(value)
    
    // You would typically update this in a theme context
    document.documentElement.setAttribute("data-theme", value)
    
    if (value === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
    
    localStorage.setItem("theme", value)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-300",
          scrolled ? "bg-background/90 backdrop-blur-md border-b shadow-sm" : "bg-background",
        )}
      >
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative w-9 h-9 flex items-center justify-center bg-gradient-to-br from-primary to-primary/80 rounded-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-md group-hover:shadow-primary/30">
                <Package className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold bg-white dark:bg-background px-2 py-1 rounded-md text-foreground z-10">
                BeezeTrack
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  "text-sm font-medium transition-all duration-300 flex items-center gap-1.5 px-2 py-1.5 relative rounded-md hover:bg-muted/70 hover:scale-105",
                  isActive(item.path) ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
                {isActive(item.path) && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                  />
                )}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                {/* Theme Toggler */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full hover:bg-muted/70 transition-all duration-300 hover:scale-110 hover:shadow-sm"
                    >
                      {theme === "dark" ? (
                        <Moon className="h-5 w-5" />
                      ) : theme === "light" ? (
                        <Sun className="h-5 w-5" />
                      ) : (
                        <Globe className="h-5 w-5" />
                      )}
                      <span className="sr-only">Toggle theme</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="animate-in fade-in-50 zoom-in-95 duration-200">
                    <DropdownMenuRadioGroup value={theme} onValueChange={handleThemeChange}>
                      <DropdownMenuRadioItem value="light" className="cursor-pointer transition-colors duration-200 hover:bg-muted/80">
                        <Sun className="mr-2 h-4 w-4" />
                        <span>Light</span>
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="dark" className="cursor-pointer transition-colors duration-200 hover:bg-muted/80">
                        <Moon className="mr-2 h-4 w-4" />
                        <span>Dark</span>
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="system" className="cursor-pointer transition-colors duration-200 hover:bg-muted/80">
                        <Globe className="mr-2 h-4 w-4" />
                        <span>System</span>
                      </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                {/* Notifications */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative rounded-full hover:bg-muted/70 transition-all duration-300 hover:scale-110 hover:shadow-sm"
                    >
                      <Bell className="h-5 w-5" />
                      {unreadCount > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white animate-pulse-soft">
                          {unreadCount}
                        </Badge>
                      )}
                      <span className="sr-only">Notifications</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80 animate-in fade-in-50 zoom-in-95 duration-200">
                    <DropdownMenuLabel className="flex items-center justify-between">
                      <span>Notifications</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-auto p-0 text-xs text-primary hover:text-primary/80 transition-colors"
                        onClick={markAllAsRead}
                        disabled={unreadCount === 0}
                      >
                        Mark all as read
                      </Button>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {notifications.length > 0 ? (
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.map((notification) => (
                          <DropdownMenuItem 
                            key={notification.id} 
                            className={cn(
                              "flex flex-col items-start p-3 cursor-pointer relative group transition-all duration-200",
                              notification.isRead ? "opacity-70" : "hover:bg-muted/80"
                            )}
                            onSelect={() => markAsRead(notification.id)}
                          >
                            <div className="flex items-center gap-2 w-full">
                              {!notification.isRead && (
                                <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                              )}
                              {notification.isRead && <div className="h-2 w-2 flex-shrink-0" />}
                              <span className="font-medium">{notification.title}</span>
                              <span className="ml-auto text-xs text-muted-foreground">{notification.time}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 h-6 w-6 p-0 transition-opacity duration-200 hover:bg-muted"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  dismissNotification(notification.id);
                                }}
                              >
                                <X className="h-3 w-3" />
                                <span className="sr-only">Dismiss</span>
                              </Button>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                          </DropdownMenuItem>
                        ))}
                      </div>
                    ) : (
                      <div className="py-6 text-center text-muted-foreground">
                        <p>No notifications</p>
                      </div>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="flex justify-center text-primary hover:text-primary/80 cursor-pointer transition-colors hover:bg-muted/80" 
                      onClick={() => router.push("/notifications")}
                    >
                      View all notifications
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.image} alt={user?.name || "User"} />
                        <AvatarFallback>{getUserInitials()}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user?.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleProfileClick}>
                      <User className="mr-2 h-4 w-4" />
                      <span>My Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handlePackagesClick}>
                      <Package className="mr-2 h-4 w-4" />
                      <span>My Packages</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSettingsClick}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handlePrivacyClick}>
                      <Shield className="mr-2 h-4 w-4" />
                      <span>Privacy & Security</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/20">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="hover:bg-primary/10 transition-colors duration-200">
                    Log in
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-200 hover:shadow-md"
                  >
                    Sign up
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden hover:bg-muted/50 transition-colors duration-200"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              <span className="sr-only">Toggle menu</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-b bg-background"
          >
            <nav className="container flex flex-col gap-2 py-4 px-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium",
                    isActive(item.path) ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              ))}
              {user && (
                <>
                  <div className="h-px bg-border my-2" />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center justify-start gap-2 px-3 py-2"
                    onClick={handleProfileClick}
                  >
                    <User className="h-4 w-4" />
                    <span>My Profile</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center justify-start gap-2 px-3 py-2"
                    onClick={handleSettingsClick}
                  >
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center justify-start gap-2 px-3 py-2 text-red-600"
                    onClick={logout}
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </Button>
                </>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1">{children}</main>

      <footer className="border-t bg-gradient-to-b from-muted/30 to-background py-6">
        <div className="container flex flex-col items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative w-8 h-8 flex items-center justify-center bg-gradient-to-br from-primary/90 to-primary rounded-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-md group-hover:shadow-primary/30">
                <Package className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-sm font-medium transition-colors duration-300 group-hover:text-primary">
                Made with <span className="text-red-500 animate-pulse-soft">❤️</span> by Erana
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="#"
              className="text-muted-foreground hover:text-primary transition-all duration-300 transform hover:scale-125"
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
                className="h-5 w-5"
              >
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
              </svg>
              <span className="sr-only">Facebook</span>
            </Link>
            <Link
              href="#"
              className="text-muted-foreground hover:text-primary transition-all duration-300 transform hover:scale-125"
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
                className="h-5 w-5"
              >
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
              </svg>
              <span className="sr-only">Twitter</span>
            </Link>
            <Link
              href="#"
              className="text-muted-foreground hover:text-primary transition-all duration-300 transform hover:scale-125"
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
                className="h-5 w-5"
              >
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
              </svg>
              <span className="sr-only">Instagram</span>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

