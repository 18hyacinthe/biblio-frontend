"use client"

import { useState } from "react"
import { Star, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

interface ReviewFormProps {
  bookId: string
  loanId: string
  bookTitle: string
  onSubmit: (rating: number, comment: string) => Promise<void>
  onCancel: () => void
  existingReview?: {
    id: string
    rating: number
    comment: string
  } | null
  isSubmitting?: boolean
}

export function ReviewForm({ 
  bookId, 
  loanId, 
  bookTitle, 
  onSubmit, 
  onCancel, 
  existingReview, 
  isSubmitting = false 
}: ReviewFormProps) {
  const [rating, setRating] = useState(existingReview?.rating || 0)
  const [comment, setComment] = useState(existingReview?.comment || "")
  const [hoveredStar, setHoveredStar] = useState(0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) return
    
    await onSubmit(rating, comment)
  }

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-lg">
          {existingReview ? "Modifier votre avis" : "Donner votre avis"} sur "{bookTitle}"
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Note *</Label>
            <div className="flex items-center mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  className="p-1 transition-colors"
                  title={`Noter ${star} étoile${star > 1 ? 's' : ''}`}
                >
                  <Star 
                    className={`h-6 w-6 ${
                      star <= (hoveredStar || rating) 
                        ? "fill-yellow-400 text-yellow-400" 
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-gray-600">
                {rating > 0 && `${rating}/5 étoiles`}
              </span>
            </div>
          </div>

          <div>
            <Label htmlFor="comment" className="text-sm font-medium">
              Commentaire (optionnel)
            </Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Partagez votre opinion sur ce livre..."
              className="mt-2"
              rows={3}
            />
          </div>

          <div className="flex space-x-2">
            <Button 
              type="submit" 
              disabled={rating === 0 || isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {existingReview ? "Modification..." : "Publication..."}
                </>
              ) : (
                existingReview ? "Modifier l'avis" : "Publier l'avis"
              )}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
