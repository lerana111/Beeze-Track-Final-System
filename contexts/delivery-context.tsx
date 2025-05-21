"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

// API configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

// Enable this to use mock delivery data without a backend
const USE_MOCK_DATA = true

// Sample data for generating realistic mock deliveries
const MOCK_CITIES = [
  "New York, NY", "Los Angeles, CA", "Chicago, IL", "Houston, TX", "Phoenix, AZ",
  "Philadelphia, PA", "San Antonio, TX", "San Diego, CA", "Dallas, TX", "San Jose, CA",
  "Austin, TX", "Jacksonville, FL", "Fort Worth, TX", "Columbus, OH", "Charlotte, NC",
  "San Francisco, CA", "Indianapolis, IN", "Seattle, WA", "Denver, CO", "Boston, MA"
];

const MOCK_PACKAGE_TYPES = [
  "Standard Box", "Large Box", "Small Package", "Envelope", "Tube", "Pallet",
  "Fragile Items", "Electronics", "Clothing", "Documents", "Books", "Perishable Goods"
];

const MOCK_DIMENSIONS = [
  "20cm x 15cm x 10cm", "30cm x 25cm x 20cm", "10cm x 8cm x 5cm", "40cm x 35cm x 30cm",
  "25cm x 20cm x 15cm", "100cm x 80cm x 60cm", "15cm x 12cm x 8cm", "50cm x 40cm x 35cm"
];

const MOCK_WEIGHTS = [
  "0.5kg", "1kg", "2kg", "3kg", "5kg", "7kg", "10kg", "15kg", "20kg", "25kg", "0.2kg"
];

// Define types for our delivery data
type DeliveryUpdate = {
  status: string
  date: string
  time: string
  description: string
  location?: string
}

type Delivery = {
  id: string
  trackingNumber: string
  packageType: string
  weight: string
  dimensions: string
  from: string
  to: string
  date: string
  status: string
  imageUrl?: string
  updates: DeliveryUpdate[]
  estimatedDelivery?: string
  carrier?: string
}

type Statistics = {
  totalDeliveries: number
  pendingDeliveries: number
  inTransitDeliveries: number
  deliveredDeliveries: number
  onTimeDeliveryRate: number
  averageDeliveryTime: string
  customerSatisfaction: number
}

type DeliveryContextType = {
  deliveries: Delivery[]
  statistics: Statistics
  addDelivery: (delivery: Partial<Delivery>) => Promise<Delivery>
  getDeliveryByTrackingNumber: (trackingNumber: string) => Promise<Delivery | null>
  updateDeliveryStatus: (id: string, status: string) => Promise<boolean>
  updateDeliveryImage: (id: string, imageUrl: string) => Promise<void>
  fetchUserDeliveries: () => Promise<void>
  fetchUserStatistics: () => Promise<void>
}

// Create initial statistics
const initialStatistics: Statistics = {
  totalDeliveries: 0,
  pendingDeliveries: 0,
  inTransitDeliveries: 0,
  deliveredDeliveries: 0,
  onTimeDeliveryRate: 0,
  averageDeliveryTime: "0 days",
  customerSatisfaction: 0,
}

// Create the context
const DeliveryContext = createContext<DeliveryContextType | undefined>(undefined)

// Use a stable seed for IDs to prevent hydration mismatches
let stableIdCounter = 1000;

export function DeliveryProvider({ children }: { children: ReactNode }) {
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [statistics, setStatistics] = useState<Statistics>(initialStatistics)

  // Load deliveries and statistics from backend or localStorage on mount
  useEffect(() => {
    // Only run on client-side
    if (typeof window === "undefined") return;

    const loadData = async () => {
      const token = localStorage.getItem("token")
      
      // Always try to load from localStorage first, regardless of token status
      const storedDeliveries = localStorage.getItem("deliveries")
      if (storedDeliveries) {
        const parsedDeliveries = JSON.parse(storedDeliveries);
        setDeliveries(parsedDeliveries);
        // Update statistics based on loaded deliveries
        updateStatisticsFromDeliveries(parsedDeliveries);
        
        // If no token (user logged out), just return after loading from localStorage
        if (!token) return;
      } else if (!token) {
        // If no stored deliveries and no token, create initial mock deliveries
        const initialMockDeliveries = [
          generateMockDelivery("BZ123456", { status: "Pending" }),
          generateMockDelivery("BZ789012", { status: "Pending" }),
          generateMockDelivery("BZ345678", { status: "In-Transit" }),
          generateMockDelivery("BZ901234", { status: "Delivered" }),
        ];
        setDeliveries(initialMockDeliveries);
        localStorage.setItem("deliveries", JSON.stringify(initialMockDeliveries));
        updateStatisticsFromDeliveries(initialMockDeliveries);
        return;
      }
      
      // If we have a token, try to fetch from backend
      if (token) {
        try {
          await fetchUserDeliveries()
          await fetchUserStatistics()
        } catch (error) {
          console.error("Failed to load initial delivery data:", error)
          // No need for fallback here as we already loaded from localStorage above
        }
      }
    }
    
    loadData()
  }, []) // Remove isClientSide dependency

  // Fetch user deliveries from the backend
  const fetchUserDeliveries = async () => {
    if (typeof window === "undefined") return; // Only run on client-side

    const token = localStorage.getItem("token")
    
    // Always try to load from localStorage first
    const storedDeliveries = localStorage.getItem("deliveries")
    if (storedDeliveries) {
      const parsedDeliveries = JSON.parse(storedDeliveries);
      setDeliveries(parsedDeliveries)
      
      // Make sure we update statistics whenever deliveries are loaded
      updateStatisticsFromDeliveries(parsedDeliveries)
      
      // If using mock mode or no token/demo token, just return after loading from localStorage
      if (USE_MOCK_DATA || !token || token.startsWith("mock-token")) {
        return
      }
    } else if (USE_MOCK_DATA || !token || token.startsWith("mock-token")) {
      // If no deliveries in localStorage and using mock mode, create initial mock deliveries
      const initialMockDeliveries = [
        generateMockDelivery("BZ123456", { status: "Pending" }),
        generateMockDelivery("BZ789012", { status: "Pending" }),
        generateMockDelivery("BZ345678", { status: "In-Transit" }),
        generateMockDelivery("BZ901234", { status: "Delivered" }),
      ];
      setDeliveries(initialMockDeliveries);
      localStorage.setItem("deliveries", JSON.stringify(initialMockDeliveries));
      updateStatisticsFromDeliveries(initialMockDeliveries);
      return
    }
    
    // Only try to fetch from API if we have a valid token and not in mock mode
    try {
      const response = await fetch(`${API_URL}/deliveries`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      
      if (!response.ok) {
        throw new Error("Failed to fetch deliveries")
      }
      
      const data = await response.json()
      setDeliveries(data.deliveries)
      updateStatisticsFromDeliveries(data.deliveries)
    } catch (error) {
      console.error("Error fetching user deliveries:", error)
      throw error
    }
  }
  
  // Fetch user statistics from the backend
  const fetchUserStatistics = async () => {
    if (typeof window === "undefined") return; // Only run on client-side

    const token = localStorage.getItem("token")
    
    // If using mock mode or demo token, calculate stats locally
    if (USE_MOCK_DATA || !token || token.startsWith("mock-token")) {
      // If we have deliveries, calculate stats
      if (deliveries.length > 0) {
        updateStatisticsFromDeliveries(deliveries)
      }
      return
    }
    
    try {
      const response = await fetch(`${API_URL}/deliveries/statistics`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      
      if (!response.ok) {
        throw new Error("Failed to fetch statistics")
      }
      
      const data = await response.json()
      setStatistics(data.statistics)
    } catch (error) {
      console.error("Error fetching statistics:", error)
      // If we have deliveries, calculate stats as fallback
      if (deliveries.length > 0) {
        updateStatisticsFromDeliveries(deliveries)
      }
    }
  }
  
  // Calculate statistics from deliveries (for demo/fallback)
  const updateStatisticsFromDeliveries = (deliveryList: Delivery[]) => {
    // Use typeof window check to ensure this only runs on client side
    if (typeof window === "undefined" || deliveryList.length === 0) {
      setStatistics(initialStatistics)
      return
    }

    const pendingCount = deliveryList.filter((d) => d.status === "Pending").length
    const inTransitCount = deliveryList.filter((d) => d.status === "In-Transit").length
    const deliveredCount = deliveryList.filter((d) => d.status === "Delivered").length

    // Use stable values for demo statistics
    const onTimeRate = deliveredCount > 0 ? 95 : 0
    const avgTime = deliveredCount > 0 ? "2.5 days" : "0 days"
    const satisfaction = deliveredCount > 0 ? 4.7 : 0

    setStatistics({
      totalDeliveries: deliveryList.length,
      pendingDeliveries: pendingCount,
      inTransitDeliveries: inTransitCount,
      deliveredDeliveries: deliveredCount,
      onTimeDeliveryRate: onTimeRate,
      averageDeliveryTime: avgTime,
      customerSatisfaction: satisfaction,
    })
  }

  // Helper function to generate random realistic delivery data
  const generateMockDelivery = (trackingNumber: string, customData: Partial<Delivery> = {}): Delivery => {
    // Use a static date format to avoid server/client mismatch
    const staticDate = "January 1, 2023";
    const staticTime = "9:00 AM";
    const staticEstimatedDate = "January 5, 2023";
    
    if (typeof window === "undefined") {
      // Server-side rendering - use completely static data
      return {
        id: `placeholder-${trackingNumber || "BZ100000"}`,
        trackingNumber: trackingNumber || `BZ100000`,
        packageType: "Standard Box",
        weight: "1kg",
        dimensions: "20cm x 15cm x 10cm",
        from: "New York, NY",
        to: "Los Angeles, CA",
        date: staticDate,
        status: "Pending",
        carrier: "BeezeExpress",
        estimatedDelivery: staticEstimatedDate,
        updates: [{
          status: "Pending",
          date: staticDate,
          time: staticTime,
          description: "Your package has been scheduled for pickup.",
          location: "New York, NY"
        }],
      };
    }
    
    // Client-side code can use random values
    const getRandomItem = (array: string[]) => array[Math.floor(Math.random() * array.length)];
    
    const fromCity = customData.from || getRandomItem(MOCK_CITIES);
    let toCity = customData.to || getRandomItem(MOCK_CITIES);
    
    // Make sure source and destination are different
    while (toCity === fromCity) {
      toCity = getRandomItem(MOCK_CITIES);
    }
    
    const packageType = customData.packageType || getRandomItem(MOCK_PACKAGE_TYPES);
    const dimensions = customData.dimensions || getRandomItem(MOCK_DIMENSIONS);
    const weight = customData.weight || getRandomItem(MOCK_WEIGHTS);
    
    // Generate random carrier
    const carriers = ["BeezeExpress", "FastTrack", "GlobalShip", "QuickDeliver"];
    const carrier = customData.carrier || getRandomItem(carriers);
    
    // For client-side, we can use the current date
    const currentDate = new Date();
    
    // Format dates consistently to avoid hydration mismatch
    const formatDate = (date: Date) => {
      const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    };
    
    // Calculate date strings
    const startDate = new Date(currentDate);
    startDate.setDate(currentDate.getDate() - 3); // Use fixed number instead of random
    const formattedStartDate = customData.date || formatDate(startDate);
    
    const deliveryWindow = 3; // Fixed delivery window instead of random
    const estimatedDate = new Date(startDate);
    estimatedDate.setDate(startDate.getDate() + deliveryWindow);
    const formattedEstimatedDate = formatDate(estimatedDate);
    
    // Current progress in the delivery timeline - use fixed logic
    let status = customData.status || "Pending";
    
    // Ensure status is one of the valid values
    if (!["Pending", "In-Transit", "Delivered", "Cancelled"].includes(status)) {
      status = "Pending";
    }
    
    // Create stable ID
    const stableId = customData.id || `del-${trackingNumber || stableIdCounter++}`;
    
    // Create stable tracking number
    const stableTrackingNumber = trackingNumber || `BZ${100000 + stableIdCounter}`;
    
    // Create the delivery object
    const delivery: Delivery = {
      id: stableId,
      trackingNumber: stableTrackingNumber,
      packageType,
      weight,
      dimensions,
      from: fromCity,
      to: toCity,
      date: formattedStartDate,
      status,
      imageUrl: customData.imageUrl,
      carrier,
      estimatedDelivery: formattedEstimatedDate,
      updates: [],
    };
    
    // Generate realistic updates with fixed times to avoid hydration mismatches
    const updates: DeliveryUpdate[] = [];
    
    // Initial pending update
    updates.push({
      status: "Pending",
      date: formattedStartDate,
      time: "9:00 AM",
      description: "Your package has been scheduled for pickup.",
      location: fromCity
    });
    
    // Add In-Transit updates if applicable
    if (status === "In-Transit" || status === "Delivered") {
      const transitDate = new Date(startDate);
      transitDate.setDate(startDate.getDate() + 1);
      const formattedTransitDate = formatDate(transitDate);
      
      updates.push({
        status: "In-Transit",
        date: formattedTransitDate,
        time: "2:30 PM",
        description: "Your package has been picked up and is on its way.",
        location: fromCity
      });
      
      updates.push({
        status: "In-Transit",
        date: formattedTransitDate,
        time: "7:45 PM",
        description: "Your package has arrived at the sorting facility.",
        location: `${fromCity.split(',')[0]} Sorting Center`
      });
      
      // Add out for delivery update if delivered
      if (status === "Delivered") {
        updates.push({
          status: "In-Transit",
          date: formattedEstimatedDate,
          time: "8:30 AM",
          description: "Your package is out for delivery.",
          location: toCity
        });
        
        // Add delivered update
        updates.push({
          status: "Delivered",
          date: formattedEstimatedDate,
          time: "2:15 PM",
          description: "Your package has been delivered.",
          location: toCity
        });
      }
    }
    
    // Add custom updates if any
    if (customData.updates && customData.updates.length > 0) {
      delivery.updates = customData.updates;
    } else {
      delivery.updates = updates;
    }
    
    return delivery;
  };

  // Add a new delivery
  const addDelivery = async (deliveryData: Partial<Delivery>): Promise<Delivery> => {
    if (typeof window === "undefined") {
      // Return a placeholder during server rendering
      return generateMockDelivery("", deliveryData);
    }
    
    const token = localStorage.getItem("token")
    
    // For demo token or mock mode, add delivery to localStorage
    if (USE_MOCK_DATA || !token || token.startsWith("mock-token")) {
      // Generate demo delivery with our new helper function
      const newDelivery = generateMockDelivery("", deliveryData);
      
      const updatedDeliveries = [...deliveries, newDelivery]
      setDeliveries(updatedDeliveries)
      localStorage.setItem("deliveries", JSON.stringify(updatedDeliveries))
      
      // Ensure statistics are updated with the new delivery
      updateStatisticsFromDeliveries(updatedDeliveries)
      
      return newDelivery
    }
    
    // Otherwise, add to backend
    try {
      const response = await fetch(`${API_URL}/deliveries`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(deliveryData),
      })
      
      if (!response.ok) {
        throw new Error("Failed to create delivery")
      }
      
      const data = await response.json()
      
      // Update local state
      setDeliveries((prev) => [...prev, data.delivery])
      
      return data.delivery
    } catch (error) {
      console.error("Error creating delivery:", error)
      throw error
    }
  }

  // Get a delivery by tracking number
  const getDeliveryByTrackingNumber = async (trackingNumber: string): Promise<Delivery | null> => {
    if (typeof window === "undefined") {
      // Return a placeholder during server rendering
      return null;
    }
    
    // First check if we have it locally
    const localDelivery = deliveries.find((d) => d.trackingNumber === trackingNumber)
    if (localDelivery) {
      return localDelivery
    }
    
    // If not found locally and using mock mode, generate a mock delivery
    if (USE_MOCK_DATA) {
      // Use our new helper function
      const mockDelivery = generateMockDelivery(trackingNumber);
      return mockDelivery;
    }
    
    // If not found locally and not using mock mode, try API
    try {
      const response = await fetch(`${API_URL}/deliveries/track`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ trackingNumber }),
      })
      
      if (!response.ok) {
        if (response.status === 404) {
          return null
        }
        throw new Error("Failed to track delivery")
      }
      
      const data = await response.json()
      return data.delivery
    } catch (error) {
      console.error("Error tracking delivery:", error)
      return null
    }
  }

  // Update delivery status
  const updateDeliveryStatus = async (id: string, status: string): Promise<boolean> => {
    if (typeof window === "undefined") return false; // Only run on client-side
    
    const token = localStorage.getItem("token")
    
    // For demo token or mock mode, update in localStorage
    if (USE_MOCK_DATA || !token || token.startsWith("mock-token")) {
      // Find the delivery and update its status
      const updatedDeliveries = deliveries.map((d) => {
        if (d.id === id) {
          const now = new Date()
          const formattedDate = now.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })
          const formattedTime = now.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "numeric",
            hour12: true,
          })
          
          // Add an update for the status change
          const updates = [...(d.updates || []), {
            status,
            date: formattedDate,
            time: formattedTime,
            description: `Package status updated to ${status}.`,
            location: d.status === "In-Transit" ? d.to : d.from,
          }]
          
          return { ...d, status, updates }
        }
        return d
      })
      
      setDeliveries(updatedDeliveries)
      localStorage.setItem("deliveries", JSON.stringify(updatedDeliveries))
      
      // Make sure we update statistics whenever a status changes
      updateStatisticsFromDeliveries(updatedDeliveries)
      
      return true
    }
    
    // Otherwise, update on backend
    try {
      const response = await fetch(`${API_URL}/deliveries/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      })
      
      if (!response.ok) {
        throw new Error("Failed to update delivery status")
      }
      
      // Update local state
      const updatedDeliveries = deliveries.map((d) => (d.id === id ? { ...d, status } : d))
      setDeliveries(updatedDeliveries)
      
      // Also update statistics to reflect the status change
      updateStatisticsFromDeliveries(updatedDeliveries)
      
      return true
    } catch (error) {
      console.error("Error updating delivery status:", error)
      return false
    }
  }

  // Update a delivery's image
  const updateDeliveryImage = async (id: string, imageUrl: string) => {
    if (typeof window === "undefined") return; // Only run on client-side
    
    const token = localStorage.getItem("token")
    
    // For demo token or mock mode, update in localStorage
    if (USE_MOCK_DATA || !token || token.startsWith("mock-token")) {
      const updatedDeliveries = deliveries.map((delivery) =>
        delivery.id === id
          ? {
              ...delivery,
              imageUrl,
            }
          : delivery,
      )
      
      setDeliveries(updatedDeliveries)
      localStorage.setItem("deliveries", JSON.stringify(updatedDeliveries))
      return
    }
    
    // No backend call needed as the image is uploaded through a separate endpoint
    // Just update the local state with the new image URL
    setDeliveries((prev) =>
      prev.map((delivery) => 
        delivery.id === id 
          ? { ...delivery, imageUrl } 
          : delivery
      )
    )
  }

  return (
    <DeliveryContext.Provider
      value={{
        deliveries,
        statistics,
        addDelivery,
        getDeliveryByTrackingNumber,
        updateDeliveryStatus,
        updateDeliveryImage,
        fetchUserDeliveries,
        fetchUserStatistics,
      }}
    >
      {children}
    </DeliveryContext.Provider>
  )
}

export function useDelivery() {
  const context = useContext(DeliveryContext)
  if (context === undefined) {
    throw new Error("useDelivery must be used within a DeliveryProvider")
  }
  return context
}

