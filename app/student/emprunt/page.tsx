"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, BookOpen, Clock, Calendar, Star, Search, MapPin, AlertCircle, Loader2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { booksAPI, loansAPI } from "@/lib/api"

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
  created_at?: string
  updated_at?: string
}

interface Loan {
  id: string
  user_id: string
  book_id: string
  loan_date: string
  due_date: string
  return_date?: string
  status: "active" | "returned" | "overdue"
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

export default function EmpruntPage() {
  const { user } = useAuth()
  const router = useRouter()

  // États pour les données
  const [books, setBooks] = useState<Book[]>([])
  const [loans, setLoans] = useState<Loan[]>([])
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // États pour les filtres
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [locationFilter, setLocationFilter] = useState("all")

  // États pour les actions
  const [borrowingBook, setBorrowingBook] = useState<string | null>(null)

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
    // Seuls les livres disponibles pour emprunt
    const availableBooks = books.filter(book => book.available_copies > 0)
    
    let filtered = availableBooks.filter(
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

      // Charger les livres et les emprunts en parallèle
      const [booksData, loansData] = await Promise.all([
        booksAPI.getAll(),
        loansAPI.getMy()
      ])

      setBooks(booksData)
      setLoans(loansData)
    } catch (error: any) {
      console.error("Erreur lors du chargement des données:", error)
      setError(error.message || "Erreur lors du chargement des données")
    } finally {
      setLoading(false)
    }
  }

  const handleBorrowBook = async (bookId: string) => {
    try {
      setBorrowingBook(bookId)
      setError("")

      await loansAPI.create(bookId)
      
      // Recharger les données
      await loadData()
      
      alert("Livre emprunté avec succès !")
    } catch (error: any) {
      console.error("Erreur lors de l'emprunt:", error)
      setError(error.message || "Erreur lors de l'emprunt")
    } finally {
      setBorrowingBook(null)
    }
  }

  const getLocationLabel = (location: string) => {
    const loc = locations.find((l) => l.value === location)
    return loc?.label || location
  }

  const hasUserBorrowedBook = (bookId: string) => {
    return loans.some(loan => loan.book_id === bookId && loan.status === "active")
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
                <BookOpen className="h-6 w-6 text-green-600" />
                <h1 className="text-xl font-semibold text-gray-900">Emprunter des livres</h1>
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

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Livres disponibles</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {books.filter(b => b.available_copies > 0).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Mes emprunts actifs</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loans.filter(l => l.status === "active").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">En retard</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loans.filter(l => l.status === "overdue").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtres */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Rechercher des livres disponibles</CardTitle>
            <p className="text-sm text-gray-600">
              Seuls les livres avec des exemplaires disponibles sont affichés.
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
                {filteredBooks.length} livre(s) disponible(s)
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Liste des livres disponibles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBooks.map((book) => (
            <Card key={book.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2">{book.title}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">par {book.author}</p>
                  </div>
                  <Badge variant="outline" className="ml-2">
                    Disponible
                  </Badge>
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
                    <span className="text-green-600 font-medium">
                      {book.available_copies} exemplaire(s) disponible(s)
                    </span>
                    <span className="text-gray-500"> sur {book.total_copies}</span>
                  </div>

                  {book.description && (
                    <p className="text-sm text-gray-600 line-clamp-3">{book.description}</p>
                  )}

                  {book.publication_year && (
                    <p className="text-xs text-gray-500">Publié en {book.publication_year}</p>
                  )}

                  <div className="pt-3">
                    {hasUserBorrowedBook(book.id) ? (
                      <div className="text-center py-2">
                        <Badge variant="outline">Déjà emprunté par vous</Badge>
                      </div>
                    ) : (
                      <Button
                        onClick={() => handleBorrowBook(book.id)}
                        disabled={borrowingBook === book.id}
                        className="w-full"
                        size="sm"
                      >
                        {borrowingBook === book.id ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Emprunt en cours...
                          </>
                        ) : (
                          <>
                            <BookOpen className="h-4 w-4 mr-2" />
                            Emprunter maintenant
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
            <CardContent className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun livre disponible</h3>
              <p className="text-gray-600 mb-4">
                Aucun livre ne correspond à vos critères de recherche ou tous les exemplaires sont actuellement empruntés.
              </p>
              <p className="text-sm text-gray-500">
                Essayez de modifier vos filtres ou consultez la section réservations pour être notifié du retour d'un livre.
              </p>
              <div className="mt-6 space-x-4">
                <Button variant="outline" onClick={() => router.push("/student/reservation")}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Voir les réservations
                </Button>
                <Button variant="outline" onClick={() => router.push("/student/dashboard")}>
                  <BookOpen className="h-4 w-4 mr-2" />
                  Retour au catalogue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
