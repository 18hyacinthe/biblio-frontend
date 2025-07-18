"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  BookOpen,
  Users,
  FileText,
  AlertTriangle,
  Plus,
  LogOut,
  User,
  Calendar,
  Clock,
  Loader2,
  AlertCircle,
  MapPin,
  Copy,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { booksAPI, loansAPI, reservationsAPI } from "@/lib/api"

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
  coverUrl?: string
  status?: string
  created_at?: string
  updated_at?: string
}

interface Loan {
  id: string
  bookId: string
  userId: string
  loanDate: string
  dueDate: string
  returnDate?: string
  status: "active" | "returned" | "overdue"
  // Informations du livre et utilisateur jointes
  bookTitle?: string
  bookAuthor?: string
  userName?: string
  userEmail?: string
  studentId?: string
}

interface Reservation {
  id: string
  user_id: string
  book_id: string
  reservation_date: string
  status: "active" | "cancelled" | "fulfilled"
  created_at?: string
  updated_at?: string
  // Informations du livre et utilisateur jointes
  book_title?: string
  book_author?: string
  user_name?: string
  user_email?: string
}

// Composant BookCard pour l'affichage moderne des livres
interface BookCardProps {
  book: Book
  onUpdate?: () => void
}

const BookCard = ({ book, onUpdate }: BookCardProps) => {
  const router = useRouter()
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"
  const [imageError, setImageError] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  
  // Reset l'état d'erreur quand l'URL du livre change
  useEffect(() => {
    setImageError(false)
  }, [book.coverUrl])
  
  const handleImageError = () => {
    console.log("Erreur de chargement pour l'image:", book.coverUrl)
    setImageError(true)
  }
  
  // Construire l'URL de l'image avec un timestamp pour éviter le cache
  const imageUrl = book.coverUrl && !imageError 
    ? `${backendUrl}${book.coverUrl}?t=${Date.now()}`
    : "/images/image-2iE.jpg"
  
  console.log("BookCard - Image URL:", imageUrl, "Book:", book.title)
  
  // Fonction pour obtenir le badge de statut
  const getStatusBadge = (status?: string) => {
    // Si pas de copies disponibles, toujours indisponible
    if (book.available_copies <= 0) {
      return <Badge variant="destructive" className="text-xs">Indisponible</Badge>
    }
    
    // Sinon, utiliser le statut défini
    switch (status) {
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

  // Fonction pour voir les détails du livre
  const handleView = () => {
    router.push(`/admin/books/${book.id}`)
  }

  // Fonction pour modifier le livre
  const handleEdit = () => {
    router.push(`/admin/books/${book.id}/edit`)
  }

  // Fonction pour supprimer le livre
  const handleDelete = async () => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le livre "${book.title}" ?`)) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await booksAPI.delete(book.id)
      if (response.success) {
        alert("Livre supprimé avec succès !")
        onUpdate?.() // Rafraîchir la liste
      } else {
        throw new Error(response.message || "Erreur lors de la suppression")
      }
    } catch (error: any) {
      console.error("Erreur lors de la suppression:", error)
      alert(`Erreur: ${error.message || "Impossible de supprimer le livre"}`)
    } finally {
      setIsDeleting(false)
    }
  }
  
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <div className="aspect-[3/4] relative bg-gray-100">
        <img
          src={imageUrl}
          alt={`Couverture de ${book.title}`}
          className="w-full h-full object-cover"
          onError={handleImageError}
          onLoad={() => console.log("Image chargée avec succès:", imageUrl)}
        />
        
        {/* Overlay avec le titre si on utilise l'image par défaut */}
        {(!book.coverUrl || imageError) && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-end">
            <div className="p-3 text-white">
              <p className="text-sm font-medium line-clamp-2">{book.title}</p>
            </div>
          </div>
        )}
        
        {/* Badge de statut unifié */}
        <div className="absolute top-2 right-2">
          {getStatusBadge(book.status)}
        </div>

        {/* Menu d'actions */}
        <div className="absolute top-2 left-2 z-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="secondary" 
                size="sm" 
                className="h-8 w-8 p-0 bg-white/90 hover:bg-white border border-gray-200 shadow-sm"
                disabled={isDeleting}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-40 z-50">
              <DropdownMenuItem onClick={handleView} className="cursor-pointer">
                <Eye className="h-4 w-4 mr-2" />
                Voir détails
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleEdit} className="cursor-pointer">
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleDelete} 
                className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {isDeleting ? "Suppression..." : "Supprimer"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="space-y-2">
          <h3 className="font-semibold text-sm line-clamp-2 leading-tight">
            {book.title}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-1">
            par {book.author}
          </p>
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center">
              <Copy className="h-3 w-3 mr-1" />
              <span>{book.available_copies}/{book.total_copies}</span>
            </div>
            {book.location && (
              <div className="flex items-center">
                <MapPin className="h-3 w-3 mr-1" />
                <span className="line-clamp-1">{book.location}</span>
              </div>
            )}
          </div>
          
          {book.category && (
            <Badge variant="secondary" className="text-xs">
              {book.category}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default function AdminDashboard() {
  const router = useRouter()
  const { user, logout } = useAuth()

  // États pour les données
  const [books, setBooks] = useState<Book[]>([])
  const [loans, setLoans] = useState<Loan[]>([])
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // États pour les actions
  const [activeTab, setActiveTab] = useState("overview")

  // Vérification de l'utilisateur
  useEffect(() => {
    if (!user || user.role !== "admin") {
      router.push("/auth")
      return
    }
  }, [user, router])

  // Chargement des données
  useEffect(() => {
    loadData()
  }, [])

  // Recharger les données quand on revient sur la page (focus)
  useEffect(() => {
    const handleFocus = () => {
      console.log("Page regagne le focus, rechargement des données...")
      loadData()
    }

    window.addEventListener('focus', handleFocus)
    
    // Recharger les données périodiquement (toutes les 30 secondes)
    const interval = setInterval(() => {
      console.log("Rechargement périodique des données...")
      loadData()
    }, 30000)

    return () => {
      window.removeEventListener('focus', handleFocus)
      clearInterval(interval)
    }
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError("")

      // Charger toutes les données en parallèle
      const [booksResponse, loansResponse, reservationsResponse] = await Promise.all([
        booksAPI.getAll(),
        loansAPI.getAll(),
        reservationsAPI.getAll()
      ])

      // Le backend retourne directement les arrays ou dans des propriétés spécifiques
      setBooks(Array.isArray(booksResponse) ? booksResponse : booksResponse.books || [])
      setLoans(Array.isArray(loansResponse) ? loansResponse : loansResponse.loans || [])
      setReservations(Array.isArray(reservationsResponse) ? reservationsResponse : reservationsResponse.reservations || [])
      
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default">Actif</Badge>
      case "returned":
        return <Badge variant="secondary">Retourné</Badge>
      case "overdue":
        return <Badge variant="destructive">En retard</Badge>
      case "cancelled":
        return <Badge variant="outline">Annulé</Badge>
      case "fulfilled":
        return <Badge variant="secondary">Satisfait</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Statistiques
  const stats = {
    totalBooks: books.length,
    availableBooks: books.filter(b => b.available_copies > 0).length,
    totalLoans: loans.filter(l => l.status === "active").length,
    overdueLoans: loans.filter(l => l.status === "overdue").length,
    totalReservations: reservations.filter(r => r.status === "active").length,
  }

  if (!user || user.role !== "admin") {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">Dashboard Administration</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">{user.name}</span>
                <Badge variant="outline" className="text-xs">Admin</Badge>
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
                onClick={() => setActiveTab("overview")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "overview"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Vue d'ensemble
              </button>
              <button
                onClick={() => setActiveTab("books")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "books"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Gestion des livres
              </button>
              <button
                onClick={() => setActiveTab("loans")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "loans"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Emprunts ({stats.totalLoans})
              </button>
            </nav>
          </div>
        </div>

        {/* Contenu des onglets */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <BookOpen className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total livres</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalBooks}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <BookOpen className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Livres disponibles</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.availableBooks}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <FileText className="h-8 w-8 text-orange-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Emprunts actifs</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalLoans}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">En retard</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.overdueLoans}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Actions rapides */}
            <Card>
              <CardHeader>
                <CardTitle>Actions rapides</CardTitle>
                <CardDescription>Gérez votre bibliothèque efficacement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button onClick={() => router.push("/admin/books/add")} className="h-20">
                    <div className="text-center">
                      <Plus className="h-6 w-6 mx-auto mb-2" />
                      <span>Ajouter un livre</span>
                    </div>
                  </Button>
                  <Button variant="outline" onClick={() => setActiveTab("loans")} className="h-20">
                    <div className="text-center">
                      <FileText className="h-6 w-6 mx-auto mb-2" />
                      <span>Gérer les emprunts</span>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Emprunts en retard (s'il y en a) */}
            {stats.overdueLoans > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-red-600">Emprunts en retard</CardTitle>
                  <CardDescription>Ces emprunts nécessitent votre attention</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {loans.filter(l => l.status === "overdue").slice(0, 5).map((loan) => (
                      <div key={loan.id} className="flex items-center justify-between p-3 border rounded border-red-200 bg-red-50">
                        <div>
                          <h5 className="font-medium text-sm">{loan.bookTitle || `Livre ID: ${loan.bookId}`}</h5>
                          <p className="text-xs text-gray-600">
                            Emprunté par {loan.userName || loan.userEmail || `Utilisateur ID: ${loan.userId}`} - 
                            À rendre le {new Date(loan.dueDate).toLocaleDateString("fr-FR")}
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

        {activeTab === "books" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Gestion des livres</h2>
                <p className="text-gray-600">
                  {stats.totalBooks} livre(s) au total, {stats.availableBooks} disponible(s)
                </p>
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={loadData}
                  disabled={loading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Actualiser
                </Button>
                <Button onClick={() => router.push("/admin/books/add")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un livre
                </Button>
              </div>
            </div>

            {books.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun livre</h3>
                  <p className="text-gray-600 mb-4">Commencez par ajouter votre premier livre à la bibliothèque.</p>
                  <Button onClick={() => router.push("/admin/books/add")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un livre
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {books.slice(0, 20).map((book) => (
                  <BookCard key={book.id} book={book} onUpdate={loadData} />
                ))}
              </div>
            )}

            {books.length > 20 && (
              <Card>
                <CardContent className="text-center py-6">
                  <p className="text-sm text-gray-600 mb-4">
                    Affichage des {Math.min(20, books.length)} premiers livres sur {books.length} au total.
                  </p>
                  <Button variant="outline" size="sm">
                    Voir tous les livres
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === "loans" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Emprunts actifs</CardTitle>
                <CardDescription>
                  {stats.totalLoans} emprunt(s) en cours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {loans.filter(l => l.status === "active").map((loan) => (
                    <div key={loan.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{loan.bookTitle || `Livre ID: ${loan.bookId}`}</h4>
                        <p className="text-sm text-gray-600">
                          Emprunté par {loan.userName || loan.userEmail || `Utilisateur ID: ${loan.userId}`}
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(loan.loanDate).toLocaleDateString("fr-FR")}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            À rendre le {new Date(loan.dueDate).toLocaleDateString("fr-FR")}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(loan.status)}
                      </div>
                    </div>
                  ))}

                  {loans.filter(l => l.status === "active").length === 0 && (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Aucun emprunt actif.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "reservations" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Réservations actives</CardTitle>
                <CardDescription>
                  {stats.totalReservations} réservation(s) en attente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reservations.filter(r => r.status === "active").map((reservation) => (
                    <div key={reservation.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{reservation.book_title || `Livre ID: ${reservation.book_id}`}</h4>
                        <p className="text-sm text-gray-600">
                          Réservé par {reservation.user_name || reservation.user_email || `Utilisateur ID: ${reservation.user_id}`}
                        </p>
                        <div className="flex items-center mt-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-1" />
                          Réservé le {new Date(reservation.reservation_date).toLocaleDateString("fr-FR")}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(reservation.status)}
                      </div>
                    </div>
                  ))}

                  {reservations.filter(r => r.status === "active").length === 0 && (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Aucune réservation active.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
