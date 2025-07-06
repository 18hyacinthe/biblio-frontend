"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  BookOpen,
  Search,
  Calendar,
  User,
  LogOut,
  MapPin,
  ArrowLeft,
  AlertCircle,
  Loader2,
} from "lucide-react"
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
  totalCopies: number
  availableCopies: number
  coverUrl?: string
  status?: string
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

export default function StudentDashboard() {
  const { user, logout } = useAuth()
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
  const [activeTab, setActiveTab] = useState("catalogue")

  // États pour les actions
  const [borrowingBook, setBorrowingBook] = useState<string | null>(null)
  const [returningLoan, setReturningLoan] = useState<string | null>(null)

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
    let filtered = books.filter(
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

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const handleGoHome = () => {
    router.push("/")
  }

  const handleBorrowBook = async (bookId: string) => {
    try {
      setBorrowingBook(bookId)
      setError("")

      await loansAPI.create(bookId)
      
      // Recharger les données
      await loadData()
      
      // Message de succès (optionnel: vous pourriez utiliser un toast)
      alert("Livre emprunté avec succès !")
    } catch (error: any) {
      console.error("Erreur lors de l'emprunt:", error)
      setError(error.message || "Erreur lors de l'emprunt")
    } finally {
      setBorrowingBook(null)
    }
  }

  const handleReturnBook = async (loanId: string) => {
    try {
      setReturningLoan(loanId)
      setError("")

      await loansAPI.return(loanId)
      
      // Recharger les données
      await loadData()
      
      // Message de succès
      alert("Livre retourné avec succès !")
    } catch (error: any) {
      console.error("Erreur lors du retour:", error)
      setError(error.message || "Erreur lors du retour")
    } finally {
      setReturningLoan(null)
    }
  }

  const getLocationLabel = (location: string) => {
    const loc = locations.find((l) => l.value === location)
    return loc?.label || location
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default">En cours</Badge>
      case "returned":
        return <Badge variant="secondary">Retourné</Badge>
      case "overdue":
        return <Badge variant="destructive">En retard</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const isBookAvailable = (book: Book) => {
    // Un livre est disponible si :
    // 1. Il a des copies disponibles ET
    // 2. Son statut est "available"
    return book.availableCopies > 0 && book.status === "available"
  }

  // Fonction pour obtenir le badge de statut du livre
  const getBookStatusBadge = (book: Book) => {
    // Si pas de copies disponibles, toujours indisponible
    if (book.availableCopies <= 0) {
      return <Badge variant="destructive" className="text-xs">Indisponible</Badge>
    }
    
    // Sinon, utiliser le statut défini dans la DB
    switch (book.status) {
      case "available":
        return <Badge variant="default" className="text-xs">Disponible</Badge>
      case "unavailable":
        return <Badge variant="destructive" className="text-xs">Indisponible</Badge>
      case "maintenance":
        return <Badge variant="secondary" className="text-xs">Maintenance</Badge>
      case "reserved":
        return <Badge variant="outline" className="text-xs">Réservé</Badge>
      default:
        return <Badge variant="default" className="text-xs">Disponible</Badge>
    }
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
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={handleGoHome}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Accueil
              </Button>
              <div className="flex items-center space-x-2">
                <BookOpen className="h-6 w-6 text-green-600" />
                <h1 className="text-xl font-semibold text-gray-900">Dashboard Étudiant</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">{user.name}</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </Button>
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
                onClick={() => setActiveTab("catalogue")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "catalogue"
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Catalogue des livres
              </button>
              <button
                onClick={() => setActiveTab("emprunts")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "emprunts"
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Mes emprunts ({loans.filter(l => l.status === "active").length})
              </button>
            </nav>
          </div>
        </div>

        {/* Contenu des onglets */}
        {activeTab === "catalogue" && (
          <div className="space-y-6">
            {/* Filtres */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Rechercher des livres</CardTitle>
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

            {/* Liste des livres */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredBooks.map((book) => {
                const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"
                const imageUrl = book.coverUrl 
                  ? `${backendUrl}${book.coverUrl}?t=${Date.now()}`
                  : "/images/image-2iE.jpg"

                // Debug: Log des informations du livre
                console.log(`Livre ${book.title}:`, {
                  availableCopies: book.availableCopies,
                  totalCopies: book.totalCopies,
                  status: book.status,
                  isAvailable: isBookAvailable(book),
                  hasUserBorrowed: hasUserBorrowedBook(book.id)
                })

                return (
                  <Card key={book.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
                    {/* Image de couverture */}
                    <div className="aspect-[3/4] relative bg-gray-100">
                      <img 
                        src={imageUrl}
                        alt={`Couverture de ${book.title}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = "/images/image-2iE.jpg"
                        }}
                      />
                      
                      {/* Overlay avec le titre si on utilise l'image par défaut */}
                      {!book.coverUrl && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-end">
                          <div className="p-3 text-white">
                            <p className="text-sm font-medium line-clamp-2">{book.title}</p>
                          </div>
                        </div>
                      )}
                      
                      {/* Badge de disponibilité */}
                      <div className="absolute top-2 right-2">
                        {getBookStatusBadge(book)}
                      </div>
                    </div>

                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div>
                          <h3 className="font-semibold text-lg line-clamp-2 leading-tight">
                            {book.title}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-1">
                            par {book.author}
                          </p>
                        </div>
                        
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
                          <span className={`font-medium ${isBookAvailable(book) ? "text-green-600" : "text-red-600"}`}>
                            {book.availableCopies} exemplaire(s) disponible(s)
                          </span>
                          <span className="text-gray-500"> sur {book.totalCopies}</span>
                          {book.status && book.status !== "available" && (
                            <div className="text-xs text-gray-500 mt-1">
                              Statut: {book.status === "maintenance" ? "En maintenance" : 
                                      book.status === "reserved" ? "Réservé" : 
                                      book.status === "unavailable" ? "Indisponible" : book.status}
                            </div>
                          )}
                        </div>

                        {book.description && (
                          <p className="text-sm text-gray-600 line-clamp-2">{book.description}</p>
                        )}

                        <div className="pt-2">
                          {hasUserBorrowedBook(book.id) ? (
                            <Badge variant="outline" className="w-full justify-center py-2">
                              Déjà emprunté
                            </Badge>
                          ) : (
                            <Button
                              onClick={() => handleBorrowBook(book.id)}
                              disabled={!isBookAvailable(book) || borrowingBook === book.id}
                              className="w-full"
                              size="sm"
                            >
                              {borrowingBook === book.id ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Emprunt...
                                </>
                              ) : (
                                <>
                                  <BookOpen className="h-4 w-4 mr-2" />
                                  {isBookAvailable(book) ? "Emprunter" : 
                                   book.status === "maintenance" ? "En maintenance" :
                                   book.status === "reserved" ? "Réservé" :
                                   book.availableCopies <= 0 ? "Non disponible" : "Indisponible"}
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {filteredBooks.length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Aucun livre trouvé avec ces critères.</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === "emprunts" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Mes emprunts en cours</CardTitle>
                <CardDescription>
                  Vous avez {loans.filter(l => l.status === "active").length} emprunt(s) en cours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loans.filter(l => l.status === "active").map((loan) => (
                    <div key={loan.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{loan.book_title || `Livre ID: ${loan.book_id}`}</h4>
                        {loan.book_author && (
                          <p className="text-sm text-gray-600">par {loan.book_author}</p>
                        )}
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            Emprunté le {new Date(loan.loan_date).toLocaleDateString("fr-FR")}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            À rendre le {new Date(loan.due_date).toLocaleDateString("fr-FR")}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(loan.status)}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReturnBook(loan.id)}
                          disabled={returningLoan === loan.id}
                        >
                          {returningLoan === loan.id ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Retour...
                            </>
                          ) : (
                            "Retourner"
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}

                  {loans.filter(l => l.status === "active").length === 0 && (
                    <div className="text-center py-8">
                      <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Aucun emprunt en cours.</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Parcourez le catalogue pour emprunter des livres.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Historique des emprunts */}
            {loans.filter(l => l.status === "returned").length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Historique des emprunts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {loans.filter(l => l.status === "returned").slice(0, 5).map((loan) => (
                      <div key={loan.id} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <h5 className="font-medium text-sm">{loan.book_title || `Livre ID: ${loan.book_id}`}</h5>
                          <p className="text-xs text-gray-600">
                            Emprunté le {new Date(loan.loan_date).toLocaleDateString("fr-FR")}
                            {loan.return_date && ` - Retourné le ${new Date(loan.return_date).toLocaleDateString("fr-FR")}`}
                          </p>
                        </div>
                        {getStatusBadge(loan.status)}
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
