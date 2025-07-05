"use client"

import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, Clock, BookOpen, Star } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

export default function ReservationPage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user || user.role !== "student") {
      router.push("/")
    }
  }, [user, router])

  // Livres disponibles pour réservation
  const livresReservation = [
    {
      id: "1",
      title: "Hydraulique générale et appliquée",
      author: "André Lencastre",
      specialization: "Eau et Assainissement",
      location: "Kamboinsé",
      rating: 4.6,
      description: "Ouvrage de référence en hydraulique pour les ingénieurs.",
      coverUrl: "/placeholder.svg?height=200&width=150",
    },
    {
      id: "2",
      title: "Génie Civil - Bâtiment et Travaux Publics",
      author: "Jean-Pierre Muzeau",
      specialization: "Génie Civil et BTP",
      location: "Ouaga",
      rating: 4.4,
      description: "Manuel complet pour les étudiants en génie civil.",
      coverUrl: "/placeholder.svg?height=200&width=150",
    },
    {
      id: "3",
      title: "Énergies renouvelables en Afrique",
      author: "Amadou Hama Maiga",
      specialization: "Énergies renouvelables",
      location: "Kamboinsé",
      rating: 4.7,
      description: "Étude des potentiels énergétiques renouvelables en Afrique.",
      coverUrl: "/placeholder.svg?height=200&width=150",
    },
    {
      id: "4",
      title: "Gestion intégrée des ressources en eau",
      author: "Mahamadou KOITA",
      specialization: "Eau et Assainissement",
      location: "Ouaga",
      rating: 4.8,
      description: "Approches modernes de gestion des ressources hydriques.",
      coverUrl: "/placeholder.svg?height=200&width=150",
    },
    {
      id: "5",
      title: "Informatique et Télécommunications",
      author: "Michel Dupont",
      specialization: "Informatique et Télécommunications",
      location: "Kamboinsé",
      rating: 4.5,
      description: "Systèmes d'information et réseaux modernes.",
      coverUrl: "/placeholder.svg?height=200&width=150",
    },
    {
      id: "6",
      title: "Mines et Géologie appliquée",
      author: "Pierre Martin",
      specialization: "Mines et Géologie",
      location: "Ouaga",
      rating: 4.3,
      description: "Exploration minière et géotechnique en Afrique.",
      coverUrl: "/placeholder.svg?height=200&width=150",
    },
  ]

  const handleReserver = (livre: any) => {
    const dateExpiration = new Date(Date.now() + 48 * 60 * 60 * 1000)
    alert(
      `Livre "${livre.title}" réservé avec succès !\n\nRéservation valide jusqu'au ${dateExpiration.toLocaleDateString("fr-FR")} à ${dateExpiration.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}\n\nVeuillez vous présenter à la bibliothèque ${livre.location} pour récupérer votre ouvrage.`,
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-green-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <div className="flex items-center space-x-3">
              <img src="/placeholder.svg?height=60&width=120" alt="Logo 2iE" className="h-16" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Réservation de livres</h1>
                <p className="text-sm text-gray-600">Bibliothèque en ligne - 2iE</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Informations sur la réservation */}
        <Card className="mb-8 border-yellow-300 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center text-yellow-800">
              <Calendar className="h-5 w-5 mr-2" />
              Informations importantes sur la réservation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-yellow-600" />
                <span>Durée de réservation : 48 heures</span>
              </div>
              <div className="flex items-center space-x-2">
                <BookOpen className="h-4 w-4 text-yellow-600" />
                <span>Annulation automatique après expiration</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Liste des livres disponibles pour réservation */}
        <Card>
          <CardHeader>
            <CardTitle>Livres disponibles pour réservation</CardTitle>
            <p className="text-sm text-gray-600">Sélectionnez les ouvrages que vous souhaitez réserver</p>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {livresReservation.map((livre) => (
                <Card key={livre.id} className="border-yellow-200 hover:shadow-lg transition-shadow">
                  <div className="aspect-[3/4] bg-gray-100 relative">
                    <img
                      src={livre.coverUrl || "/placeholder.svg"}
                      alt={livre.title}
                      className="w-full h-full object-cover rounded-t-lg"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-1 line-clamp-2">{livre.title}</h3>
                    <p className="text-gray-600 text-sm mb-2">{livre.author}</p>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                        {livre.specialization}
                      </Badge>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm">{livre.rating}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs border-green-300 text-green-700 mb-3">
                      Bibliothèque {livre.location}
                    </Badge>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{livre.description}</p>
                    <Button
                      onClick={() => handleReserver(livre)}
                      className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
                    >
                      Réserver ce livre
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
