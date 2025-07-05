"use client"

import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, BookOpen, Clock, Calendar, Star } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

export default function EmpruntPage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user || user.role !== "student") {
      router.push("/")
    }
  }, [user, router])

  // Livres disponibles pour emprunt
  const livresEmprunt = [
    {
      id: "4",
      title: "Traitement des eaux usées urbaines",
      author: "Sylvie Baig",
      specialization: "Eau et Assainissement",
      location: "Kamboinsé",
      rating: 4.3,
      description: "Techniques modernes de traitement des eaux usées.",
      coverUrl: "/placeholder.svg?height=200&width=150",
      availableCopies: 3,
    },
    {
      id: "5",
      title: "Informatique et réseaux",
      author: "Michel Dupont",
      specialization: "Informatique et Télécommunications",
      location: "Ouaga",
      rating: 4.5,
      description: "Systèmes d'information et réseaux modernes.",
      coverUrl: "/placeholder.svg?height=200&width=150",
      availableCopies: 2,
    },
    {
      id: "6",
      title: "Mines et géologie",
      author: "Pierre Martin",
      specialization: "Mines et Géologie",
      location: "Kamboinsé",
      rating: 4.2,
      description: "Exploration minière et géotechnique.",
      coverUrl: "/placeholder.svg?height=200&width=150",
      availableCopies: 4,
    },
    {
      id: "7",
      title: "Électromécanique industrielle",
      author: "Ahmed TRAORE",
      specialization: "Électromécanique",
      location: "Ouaga",
      rating: 4.6,
      description: "Systèmes électriques et maintenance industrielle.",
      coverUrl: "/placeholder.svg?height=200&width=150",
      availableCopies: 1,
    },
    {
      id: "8",
      title: "Environnement et développement durable",
      author: "Fatima KONE",
      specialization: "Environnement",
      location: "Kamboinsé",
      rating: 4.4,
      description: "Gestion environnementale et changement climatique.",
      coverUrl: "/placeholder.svg?height=200&width=150",
      availableCopies: 5,
    },
    {
      id: "9",
      title: "Construction et matériaux",
      author: "Jean OUEDRAOGO",
      specialization: "Génie Civil et BTP",
      location: "Ouaga",
      rating: 4.1,
      description: "Matériaux de construction et techniques modernes.",
      coverUrl: "/placeholder.svg?height=200&width=150",
      availableCopies: 2,
    },
  ]

  const handleEmprunter = (livre: any) => {
    const dateRetour = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    alert(
      `Livre "${livre.title}" emprunté avec succès !\n\nDate de retour : ${dateRetour.toLocaleDateString("fr-FR")} avant 18h00\n\nBibliothèque : ${livre.location}\n\nPensez à respecter la date de retour pour éviter les pénalités.`,
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
                <h1 className="text-2xl font-bold text-gray-900">Emprunt de livres</h1>
                <p className="text-sm text-gray-600">Bibliothèque en ligne - 2iE</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Informations sur l'emprunt */}
        <Card className="mb-8 border-green-300 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center text-green-800">
              <BookOpen className="h-5 w-5 mr-2" />
              Conditions d'emprunt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-green-600" />
                <span>Durée d'emprunt : 14 jours</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-green-600" />
                <span>Retour avant 18h00</span>
              </div>
              <div className="flex items-center space-x-2">
                <BookOpen className="h-4 w-4 text-green-600" />
                <span>Maximum 3 livres simultanément</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Liste des livres disponibles pour emprunt */}
        <Card>
          <CardHeader>
            <CardTitle>Livres disponibles pour emprunt</CardTitle>
            <p className="text-sm text-gray-600">Sélectionnez les ouvrages que vous souhaitez emprunter</p>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {livresEmprunt.map((livre) => (
                <Card key={livre.id} className="border-green-200 hover:shadow-lg transition-shadow">
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
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="outline" className="text-xs border-green-300 text-green-700">
                        Bibliothèque {livre.location}
                      </Badge>
                      <span className="text-xs text-gray-600">{livre.availableCopies} disponible(s)</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{livre.description}</p>
                    <div className="text-xs text-gray-500 mb-3">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        Retour prévu : {new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString("fr-FR")}
                      </div>
                    </div>
                    <Button
                      onClick={() => handleEmprunter(livre)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                      disabled={livre.availableCopies === 0}
                    >
                      {livre.availableCopies > 0 ? "Emprunter ce livre" : "Indisponible"}
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
