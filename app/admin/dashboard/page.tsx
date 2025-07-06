"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
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
  // Informations du livre et utilisateur jointes
  book_title?: string
  book_author?: string
  user_name?: string
  user_email?: string
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
              <button
                onClick={() => setActiveTab("reservations")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "reservations"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Réservations ({stats.totalReservations})
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <Button variant="outline" onClick={() => setActiveTab("reservations")} className="h-20">
                    <div className="text-center">
                      <Calendar className="h-6 w-6 mx-auto mb-2" />
                      <span>Gérer les réservations</span>
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
                          <h5 className="font-medium text-sm">{loan.book_title || `Livre ID: ${loan.book_id}`}</h5>
                          <p className="text-xs text-gray-600">
                            Emprunté par {loan.user_name || loan.user_email || `Utilisateur ID: ${loan.user_id}`} - 
                            À rendre le {new Date(loan.due_date).toLocaleDateString("fr-FR")}
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
            <Card>
              <CardHeader>
                <CardTitle>Gestion des livres</CardTitle>
                <CardDescription>
                  {stats.totalBooks} livre(s) au total, {stats.availableBooks} disponible(s)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {books.slice(0, 6).map((book) => (
                    <div key={book.id} className="border rounded-lg p-4">
                      <h4 className="font-medium line-clamp-1">{book.title}</h4>
                      <p className="text-sm text-gray-600">par {book.author}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className={`text-sm ${book.available_copies > 0 ? "text-green-600" : "text-red-600"}`}>
                          {book.available_copies}/{book.total_copies} disponibles
                        </span>
                        {book.category && (
                          <Badge variant="secondary" className="text-xs">
                            {book.category}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {books.length > 6 && (
                  <div className="text-center mt-4">
                    <p className="text-sm text-gray-600">Et {books.length - 6} autres livres...</p>
                  </div>
                )}
              </CardContent>
            </Card>
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
                        <h4 className="font-medium">{loan.book_title || `Livre ID: ${loan.book_id}`}</h4>
                        <p className="text-sm text-gray-600">
                          Emprunté par {loan.user_name || loan.user_email || `Utilisateur ID: ${loan.user_id}`}
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(loan.loan_date).toLocaleDateString("fr-FR")}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            À rendre le {new Date(loan.due_date).toLocaleDateString("fr-FR")}
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
