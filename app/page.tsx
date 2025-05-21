"use client"

import { ArrowRight, Box, MapPin, Truck, Package, Clock, CheckCircle, Shield } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useAuth } from "@/contexts/auth-context"

import { Button } from "@/components/ui/button"

export default function Home() {
  const { user } = useAuth()
  
  // Determine redirect target based on authentication status
  const authTarget = user ? "/dashboard" : "/login"
  const signupTarget = user ? "/dashboard" : "/signup"

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-background to-muted/30">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
              <motion.div
                className="flex flex-col justify-center space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Fast & Reliable Package Delivery
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    BeezeTrack makes it easy to schedule pickups and track your packages in real-time. Get started
                    today!
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href={authTarget}>
                    <Button className="w-full min-[400px]:w-auto bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href={user ? "/track" : "/login"}>
                    <Button variant="outline" className="w-full min-[400px]:w-auto">
                      Track a Package
                    </Button>
                  </Link>
                </div>
              </motion.div>
              <motion.div
                className="flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="relative w-full max-w-[550px] aspect-square bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-8 shadow-lg flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-full max-w-[450px] max-h-[450px] relative">
                      {/* Decorative elements */}
                      <motion.div 
                        className="absolute top-0 right-1/4 p-5 bg-background rounded-xl shadow-md border"
                        initial={{ y: -20 }}
                        animate={{ y: 0 }}
                        transition={{ 
                          duration: 2, 
                          repeat: Infinity, 
                          repeatType: "reverse" 
                        }}
                      >
                        <Truck className="h-12 w-12 text-primary" />
                      </motion.div>
                      
                      <motion.div 
                        className="absolute bottom-1/4 right-8 p-4 bg-background rounded-xl shadow-md border"
                        initial={{ x: 20 }}
                        animate={{ x: 0 }}
                        transition={{ 
                          duration: 2.5, 
                          repeat: Infinity, 
                          repeatType: "reverse",
                          delay: 0.5
                        }}
                      >
                        <Package className="h-10 w-10 text-primary" />
                      </motion.div>
                      
                      <motion.div 
                        className="absolute top-1/4 left-0 p-4 bg-background rounded-xl shadow-md border"
                        initial={{ x: -20 }}
                        animate={{ x: 0 }}
                        transition={{ 
                          duration: 2, 
                          repeat: Infinity, 
                          repeatType: "reverse",
                          delay: 1
                        }}
                      >
                        <MapPin className="h-10 w-10 text-primary" />
                      </motion.div>
                      
                      <motion.div 
                        className="absolute bottom-0 left-1/4 p-5 bg-background rounded-xl shadow-md border"
                        initial={{ y: 20 }}
                        animate={{ y: 0 }}
                        transition={{ 
                          duration: 2.3, 
                          repeat: Infinity, 
                          repeatType: "reverse",
                          delay: 0.7
                        }}
                      >
                        <Clock className="h-12 w-12 text-primary" />
                      </motion.div>
                      
                      <motion.div 
                        className="absolute top-1/3 right-1/3 p-6 bg-background rounded-full shadow-md border"
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        transition={{ 
                          duration: 3, 
                          repeat: Infinity, 
                          repeatType: "reverse" 
                        }}
                      >
                        <Shield className="h-14 w-14 text-primary" />
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/30">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">How It Works</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl">
                  Our simple 3-step process makes package delivery a breeze
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3">
              <motion.div
                className="flex flex-col items-center space-y-4 rounded-xl border bg-background p-6 shadow-sm"
                whileHover={{ y: -5 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <MapPin className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Schedule Pickup</h3>
                <p className="text-center text-muted-foreground">
                  Enter your pickup and delivery details through our easy-to-use form.
                </p>
              </motion.div>
              <motion.div
                className="flex flex-col items-center space-y-4 rounded-xl border bg-background p-6 shadow-sm"
                whileHover={{ y: -5 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Truck className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">We Deliver</h3>
                <p className="text-center text-muted-foreground">
                  Our professional couriers pick up and deliver your package safely and on time.
                </p>
              </motion.div>
              <motion.div
                className="flex flex-col items-center space-y-4 rounded-xl border bg-background p-6 shadow-sm"
                whileHover={{ y: -5 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Box className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Track Anytime</h3>
                <p className="text-center text-muted-foreground">
                  Monitor your package's journey in real-time with our tracking system.
                </p>
              </motion.div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-muted/30 to-background">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Ready to Get Started?</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl">
                  Join thousands of satisfied customers who trust BeezeTrack for their delivery needs
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href={signupTarget}>
                  <Button
                    size="lg"
                    className="w-full min-[400px]:w-auto bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                  >
                    Sign Up Now
                  </Button>
                </Link>
                <Link href={user ? "/track" : "/login"}>
                  <Button variant="outline" size="lg" className="w-full min-[400px]:w-auto">
                    Track a Package
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

