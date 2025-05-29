import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Utility function to merge class names using clsx and tailwind-merge
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper function that converts Blob to Base64 using FileReader
export function convertBlobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      // The result can be a string or ArrayBuffer. We expect string (data URL).
      const result = reader.result
      if (typeof result === 'string') {
        resolve(result)
      } else {
        reject(new Error('Failed to convert blob to base64 string'))
      }
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

// Function used to return a range of numbers to be used for pagination
export function getRange(page: number, limit: number) {
  const from = page * limit
  const to = from + limit - 1
  return [from, to]
}
