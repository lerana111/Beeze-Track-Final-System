"use client"

import React, { createContext, useContext, useState, ReactNode } from "react"

// API configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

type UploadContextType = {
  uploadImage: (file: File, deliveryId: string) => Promise<string>
  isUploading: boolean
}

const UploadContext = createContext<UploadContextType | undefined>(undefined)

export function UploadProvider({ children }: { children: ReactNode }) {
  const [isUploading, setIsUploading] = useState(false)
  
  const uploadImage = async (file: File, deliveryId: string): Promise<string> => {
    setIsUploading(true)
    
    try {
      const token = localStorage.getItem("token")
      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch(`${API_URL}/deliveries/${deliveryId}/image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to upload image')
      }

      const data = await response.json()
      return data.imageUrl
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <UploadContext.Provider value={{ uploadImage, isUploading }}>
      {children}
    </UploadContext.Provider>
  )
}

export function useUpload(): UploadContextType {
  const context = useContext(UploadContext)
  
  if (context === undefined) {
    throw new Error("useUpload must be used within an UploadProvider")
  }
  
  return context
} 