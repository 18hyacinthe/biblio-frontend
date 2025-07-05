"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Calendar, Clock, BookOpen, Star, Search, MapPin, AlertCircle, Loader2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { booksAPI, reservationsAPI } from "@/lib/api"

// Types
interface Book {
  id: string
  title: string
  author: string
  publisher?: string
  isbn?: string
  publication_year?: number
  description?: string
  category?: string
  location: string
  total_copies: number
  available_copies: number
}

interface Reservation {
  id: string
  user_id: string
  book_id: string
  reservation_date: string
  status: "active" | "cancelled" | "fulfilled"
  created_at?: string
  updated_at?: string
  // Informations du livre jointes
  book_title?: string
  book_author?: string
}

const categories = [
  "Eau et Assainissement",
  "Génie Civil et BTP",
  "Énergies renouvelables",
  "Environnement", 
  "Mines et Géologie",
  "Électromécanique",
  "Informatique et Télécommunications",
]

const locations = [
  { value: "kamboinse", label: "Bibliothèque Kamboinsé" },
  { value: "ouaga", label: "Bibliothèque Ouaga" },
]

export default function ReservationPage() {
  const { user } = useAuth()
  const router = useRouter()

  // États pour les données
  const [books, setBooks] = useState<Book[]>([])
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // États pour les filtres
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [locationFilter, setLocationFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("disponibles")

  // États pour les actions
  const [reservingBook, setReservingBook] = useState<string | null>(null)
  const [cancellingReservation, setCancellingReservation] = useState<string | null>(null)

  // Vérification de l'utilisateur
  useEffect(() => {
    if (!user || user.role !== "student") {
      router.push("/auth")
      return
    }
  }, [user, router])

  // Chargement des données
  useEffect(() => {
    loadData()
  }, [])

  // Filtrage des livres
  useEffect(() => {
    // Seuls les livres non disponibles pour emprunt direct peuvent être réservés
    const booksForReservation = books.filter(book => book.available_copies === 0)
    
    let filtered = booksForReservation.filter(
      (book) =>
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (book.category && book.category.toLowerCase().includes(searchTerm.toLowerCase())),
    )

    if (categoryFilter !== "all") {
      filtered = filtered.filter((book) => book.category === categoryFilter)
    }

    if (locationFilter !== "all") {
      filtered = filtered.filter((book) => book.location === locationFilter)
    }

    setFilteredBooks(filtered)
  }, [searchTerm, categoryFilter, locationFilter, books])

  const loadData = async () => {
    try {
      setLoading(true)
      setError("")

      // Charger les livres et les réservations en parallèle
      const [booksData, reservationsData] = await Promise.all([
        booksAPI.getAll(),
        reservationsAPI.getMy()
      ])

      setBooks(booksData)
      setReservations(reservationsData)
    } catch (error: any) {
      console.error("Erreur lors du chargement des données:", error)
      setError(error.message || "Erreur lors du chargement des données")
    } finally {
      setLoading(false)
    }
  }

  const handleReserveBook = async (bookId: string) => {
    try {
      setReservingBook(bookId)
      setError("")

      await reservationsAPI.create(bookId)
      
      // Recharger les données
      await loadData()
      
      alert("Réservation effectuée avec succès !")
    } catch (error: any) {
      console.error("Erreur lors de la réservation:", error)
      setError(error.message || "Erreur lors de la réservation")
    } finally {
      setReservingBook(null)
    }
  }

  const handleCancelReservation = async (reservationId: string) => {
    try {
      setCancellingReservation(reservationId)
      setError("")

      await reservationsAPI.cancel(reservationId)
      
      // Recharger les données
      await loadData()
      
      alert("Réservation annulée avec succès !")
    } catch (error: any) {
      console.error("Erreur lors de l'annulation:", error)
      setError(error.message || "Erreur lors de l'annulation")
    } finally {
      setCancellingReservation(null)
    }
  }

  const getLocationLabel = (location: string) => {
    const loc = locations.find((l) => l.value === location)
    return loc?.label || location
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default">Active</Badge>
      case "cancelled":
        return <Badge variant="secondary">Annulée</Badge>
      case "fulfilled":
        return <Badge variant="outline">Satisfaite</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const hasUserReservedBook = (bookId: string) => {
    return reservations.some(reservation => 
      reservation.book_id === bookId && reservation.status === "active"
    )
  }

  if (!user || user.role !== "student") {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-green-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-green-600" />
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-green-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
              <div className="flex items-center space-x-2">
                <Calendar className="h-6 w-6 text-green-600" />
                <h1 className="text-xl font-semibold text-gray-900">Réservations</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Onglets */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("disponibles")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "disponibles"
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Livres à réserver
              </button>
              <button
                onClick={() => setActiveTab("mesreservations")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "mesreservations"
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Mes réservations ({reservations.filter(r => r.status === "active").length})
              </button>
            </nav>
          </div>
        </div>

        {/* Contenu des onglets */}
        {activeTab === "disponibles" && (
          <div className="space-y-6">
            {/* Filtres */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Rechercher des livres à réserver</CardTitle>
                <p className="text-sm text-gray-600">
                  Seuls les livres non disponibles pour emprunt immédiat peuvent être réservés.
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Rechercher par titre, auteur..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Toutes les catégories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les catégories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={locationFilter} onValueChange={setLocationFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Toutes les localisations" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les localisations</SelectItem>
                      {locations.map((location) => (
                        <SelectItem key={location.value} value={location.value}>
                          {location.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="text-sm text-gray-600 flex items-center">
                    {filteredBooks.length} livre(s) trouvé(s)
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Liste des livres à réserver */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBooks.map((book) => (
                <Card key={book.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-2">{book.title}</CardTitle>
                        <p className="text-sm text-gray-600 mt-1">par {book.author}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {book.category && (
                        <Badge variant="secondary" className="text-xs">
                          {book.category}
                        </Badge>
                      )}
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-1" />
                        {getLocationLabel(book.location)}
                      </div>

                      <div className="text-sm">
                        <span className="text-red-600 font-medium">
                          Tous les exemplaires sont empruntés
                        </span>
                        <span className="text-gray-500"> ({book.total_copies} exemplaires)</span>
                      </div>

                      {book.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">{book.description}</p>
                      )}

                      <div className="pt-2">
                        {hasUserReservedBook(book.id) ? (
                          <Badge variant="outline">Déjà réservé</Badge>
                        ) : (
                          <Button
                            onClick={() => handleReserveBook(book.id)}
                            disabled={reservingBook === book.id}
                            className="w-full"
                            size="sm"
                            variant="outline"
                          >
                            {reservingBook === book.id ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Réservation...
                              </>
                            ) : (
                              <>
                                <Calendar className="h-4 w-4 mr-2" />
                                Réserver
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredBooks.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Aucun livre disponible pour réservation.</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Tous les livres sont actuellement disponibles pour emprunt direct.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === "mesreservations" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Mes réservations actives</CardTitle>
                <p className="text-sm text-gray-600">
                  Vous avez {reservations.filter(r => r.status === "active").length} réservation(s) active(s)
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reservations.filter(r => r.status === "active").map((reservation) => (
                    <div key={reservation.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{reservation.book_title || `Livre ID: ${reservation.book_id}`}</h4>
                        {reservation.book_author && (
                          <p className="text-sm text-gray-600">par {reservation.book_author}</p>
                        )}
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            Réservé le {new Date(reservation.reservation_date).toLocaleDateString("fr-FR")}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            En attente
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(reservation.status)}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelReservation(reservation.id)}
                          disabled={cancellingReservation === reservation.id}
                        >
                          {cancellingReservation === reservation.id ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Annulation...
                            </>
                          ) : (
                            "Annuler"
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}

                  {reservations.filter(r => r.status === "active").length === 0 && (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Aucune réservation active.</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Parcourez les livres disponibles pour réservation.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Historique des réservations */}
            {reservations.filter(r => r.status !== "active").length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Historique des réservations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {reservations.filter(r => r.status !== "active").slice(0, 5).map((reservation) => (
                      <div key={reservation.id} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <h5 className="font-medium text-sm">{reservation.book_title || `Livre ID: ${reservation.book_id}`}</h5>
                          <p className="text-xs text-gray-600">
                            Réservé le {new Date(reservation.reservation_date).toLocaleDateString("fr-FR")}
                          </p>
                        </div>
                        {getStatusBadge(reservation.status)}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
