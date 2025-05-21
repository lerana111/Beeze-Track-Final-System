"use client"

import { useState } from "react"
import Image from "next/image"
import { Upload, Camera, X, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

// API configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

interface PackageImageProps {
  deliveryId: string
  imageUrl?: string | null
  onImageUploaded?: (newImageUrl: string) => void
  readOnly?: boolean
}

export function PackageImage({ deliveryId, imageUrl, onImageUploaded, readOnly = false }: PackageImageProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg']
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please select a JPEG, PNG, or GIF image.",
        variant: "destructive",
      })
      return
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be less than 5MB.",
        variant: "destructive",
      })
      return
    }

    setSelectedFile(file)
    
    // Create a preview URL
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    
    try {
      const token = localStorage.getItem("token")
      const formData = new FormData()
      formData.append('image', selectedFile)

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
      
      toast({
        title: "Image uploaded",
        description: "Your package image has been uploaded successfully.",
      })

      if (onImageUploaded) {
        onImageUploaded(data.imageUrl)
      }

      // Reset the form
      setShowUploadForm(false)
      setPreviewUrl(null)
      setSelectedFile(null)
    } catch (error) {
      console.error('Error uploading image:', error)
      toast({
        title: "Upload failed",
        description: "An error occurred while uploading the image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card className="overflow-hidden relative">
      {imageUrl ? (
        <div className="relative aspect-square w-full">
          <Image 
            src={imageUrl} 
            alt="Package image" 
            fill 
            objectFit="cover" 
            className="transition-all duration-200"
          />
          {!readOnly && (
            <Button
              variant="ghost" 
              size="icon" 
              className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full"
              onClick={() => setShowUploadForm(true)}
            >
              <Camera className="h-4 w-4" />
              <span className="sr-only">Replace image</span>
            </Button>
          )}
        </div>
      ) : showUploadForm ? (
        <div className="p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium">Upload Package Image</h3>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => {
                setShowUploadForm(false)
                setPreviewUrl(null)
                setSelectedFile(null)
              }}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Cancel</span>
            </Button>
          </div>
          
          {previewUrl ? (
            <div className="relative aspect-square w-full">
              <Image 
                src={previewUrl} 
                alt="Preview" 
                fill 
                objectFit="cover" 
                className="rounded-md"
              />
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-md border-gray-300 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors duration-200">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="h-8 w-8 text-gray-500 mb-2" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG or GIF (max 5MB)
                </p>
              </div>
              <input 
                type="file" 
                className="hidden" 
                accept="image/png, image/jpeg, image/gif, image/jpg" 
                onChange={handleFileChange}
              />
            </label>
          )}
          
          {previewUrl && (
            <div className="flex justify-end">
              <Button
                onClick={handleUpload}
                disabled={isUploading}
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div 
          className="flex flex-col items-center justify-center h-48 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors duration-200"
          onClick={() => !readOnly && setShowUploadForm(true)}
        >
          <Camera className="h-8 w-8 text-gray-500 mb-2" />
          <p className="text-sm text-gray-500">
            {readOnly ? "No image available" : "Add Package Image"}
          </p>
        </div>
      )}
    </Card>
  )
} 