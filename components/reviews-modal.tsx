"use client"

import { useState, useEffect } from "react"
import { Star, MessageCircle, User, Calendar, X } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { reviewsAPI } from "@/lib/api"

interface Review {
  id: string
  user_name: string
  rating: number
  comment: string
  created_at: string
  updated_at: string
}

interface ReviewsModalProps {
  isOpen: boolean
  onClose: () => void
  bookId: string
  bookTitle: string
}

export function ReviewsModal({ isOpen, onClose, bookId, bookTitle }: ReviewsModalProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (isOpen && bookId) {
      loadReviews()
    }
  }, [isOpen, bookId])

  const loadReviews = async () => {
    try {
      setLoading(true)
      setError("")
      const data = await reviewsAPI.getByBookId(bookId)
      setReviews(data)
    } catch (error: any) {
      setError(error.message || "Erreur lors du chargement des avis")
    } finally {
      setLoading(false)
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating 
                ? "fill-yellow-400 text-yellow-400" 
                : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-gray-600">{rating}/5</span>
      </div>
    )
  }

  const getAverageRating = () => {
    if (reviews.length === 0) return 0
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0)
    return Math.round((sum / reviews.length) * 10) / 10
  }

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    reviews.forEach(review => {
      distribution[review.rating as keyof typeof distribution]++
    })
    return distribution
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">
              Avis sur "{bookTitle}"
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">
            {error}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Résumé des notes */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Note moyenne */}
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {getAverageRating()}
                    </div>
                    <div className="mt-2">
                      {renderStars(Math.round(getAverageRating()))}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {reviews.length} avis
                    </div>
                  </div>

                  {/* Distribution des notes */}
                  <div className="space-y-2">
                    {Object.entries(getRatingDistribution())
                      .reverse()
                      .map(([rating, count]) => (
                        <div key={rating} className="flex items-center text-sm">
                          <span className="w-8">{rating}★</span>
                          <div className="flex-1 mx-2 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                              style={{
                                width: reviews.length > 0 
                                  ? `${(count / reviews.length) * 100}%` 
                                  : '0%'
                              }}
                            ></div>
                          </div>
                          <span className="w-8 text-right">{count}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Liste des avis */}
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Aucun avis pour ce livre pour le moment.</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Soyez le premier à donner votre avis !
                    </p>
                  </CardContent>
                </Card>
              ) : (
                reviews.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        {/* En-tête de l'avis */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="bg-green-100 rounded-full p-2">
                              <User className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                              <p className="font-medium">{review.user_name}</p>
                              <div className="flex items-center space-x-2">
                                {renderStars(review.rating)}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center text-xs text-gray-500">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(review.created_at).toLocaleDateString("fr-FR")}
                            {review.updated_at !== review.created_at && (
                              <Badge variant="outline" className="ml-2 text-xs">
                                Modifié
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Commentaire */}
                        {review.comment && (
                          <div className="pl-12">
                            <p className="text-gray-700 leading-relaxed">
                              {review.comment}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
