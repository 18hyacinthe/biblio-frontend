"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  BookOpen,
  Search,
  Star,
  Calendar,
  User,
  LogOut,
  MapPin,
  Globe,
  FileText,
  MessageSquare,
  ArrowLeft,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { books, loans, specializations, documentTypes, locations, type Book, type Loan } from "@/lib/data"

export default function StudentDashboard() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [genreFilter, setGenreFilter] = useState("all")
  const [locationFilter, setLocationFilter] = useState("all")
  const [docTypeFilter, setDocTypeFilter] = useState("all")
  const [filteredBooks, setFilteredBooks] = useState<Book[]>(books)
  const [userLoans, setUserLoans] = useState<Loan[]>([])
  const [activeTab, setActiveTab] = useState("catalogue")

  // États pour la notation
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [isRatingDialogOpen, setIsRatingDialogOpen] = useState(false)

  // Livres que l'étudiant peut noter (livres qu'il a empruntés)
  const [booksToRate, setBooksToRate] = useState<Book[]>([])

  useEffect(() => {
    if (!user || user.role !== "student") {
      router.push("/")
      return
    }

    // Filtrer les livres
    let filtered = books.filter(
      (book) =>
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.specialization.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    if (genreFilter !== "all") {
      filtered = filtered.filter((book) => book.specialization === genreFilter)
    }

    if (locationFilter !== "all") {
      filtered = filtered.filter((book) => book.location === locationFilter)
    }

    if (docTypeFilter !== "all") {
      filtered = filtered.filter((book) => book.documentType === docTypeFilter)
    }

    setFilteredBooks(filtered)

    // Récupérer les emprunts de l'utilisateur
    const userLoansList = loans.filter((loan) => loan.userId === user.id)
    setUserLoans(userLoansList)

    // Livres que l'étudiant peut noter (simulation - livres qu'il a déjà empruntés)
    const booksUserCanRate = books.filter(
      (book) =>
        userLoansList.some((loan) => loan.bookId === book.id) ||
        // Ajouter quelques livres pour la démonstration
        ["1", "2", "3", "4", "5"].includes(book.id),
    )
    setBooksToRate(booksUserCanRate)
  }, [searchTerm, genreFilter, locationFilter, docTypeFilter, user, router])

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const handleGoHome = () => {
    router.push("/")
  }

  const handleBorrowBook = (bookId: string) => {
    const book = books.find((b) => b.id === bookId)
    if (book && book.availableCopies > 0) {
      alert(`Livre "${book.title}" emprunté avec succès !`)
    }
  }

  const handleRateBook = (book: Book) => {
    setSelectedBook(book)
    setRating(0)
    setComment("")
    setIsRatingDialogOpen(true)
  }

  const submitRating = () => {
    if (selectedBook && rating > 0) {
      alert(
        `Merci pour votre évaluation !\n\nLivre: ${selectedBook.title}\nNote: ${rating}/5 étoiles\nCommentaire: ${comment || "Aucun commentaire"}`,
      )
      setIsRatingDialogOpen(false)
      setSelectedBook(null)
      setRating(0)
      setComment("")
    } else {
      alert("Veuillez donner une note avant de valider.")
    }
  }

  const getDocumentTypeIcon = (type: string) => {
    switch (type) {
      case "document_electronique":
        return <Globe className="h-4 w-4" />
      case "multimedia":
        return <FileText className="h-4 w-4" />
      default:
        return <BookOpen className="h-4 w-4" />
    }
  }

  const getDocumentTypeLabel = (type: string) => {
    const docType = documentTypes.find((dt) => dt.value === type)
    return docType?.label || type
  }

  const getLocationLabel = (location: string) => {
    const loc = locations.find((l) => l.value === location)
    return loc?.label || location
  }

  const renderStars = (currentRating: number, onStarClick?: (star: number) => void) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 cursor-pointer transition-colors ${
              star <= currentRating ? "fill-yellow-400 text-yellow-400" : "text-gray-300 hover:text-yellow-400"
            }`}
            onClick={() => onStarClick && onStarClick(star)}
          />
        ))}
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img src="/placeholder.svg?height=60&width=120" alt="Logo 2iE" className="h-16" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Bibliothèque en ligne</h1>
                <p className="text-sm text-gray-600">
                  Institut International d'Ingénierie de l'Eau et de l'Environnement
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={handleGoHome}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Accueil
              </Button>
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-600" />
                <div className="text-right">
                  <span className="text-sm font-medium block">{user.name}</span>
                  <span className="text-xs text-gray-600">{user.studentId}</span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="border-red-300 text-red-700 hover:bg-red-50 bg-transparent"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation par onglets */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab("catalogue")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "catalogue"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Catalogue
            </button>
            <button
              onClick={() => setActiveTab("emprunts")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "emprunts"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Mes emprunts
            </button>
            <button
              onClick={() => setActiveTab("notation")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "notation"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Noter des livres
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistiques utilisateur */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Emprunts actifs</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userLoans.filter((l) => l.status === "active").length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En retard</CardTitle>
              <Calendar className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {userLoans.filter((l) => l.status === "overdue").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total emprunts</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userLoans.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Livres à noter</CardTitle>
              <MessageSquare className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{booksToRate.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Contenu selon l'onglet actif */}
        {activeTab === "emprunts" && userLoans.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Mes emprunts en cours</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userLoans.map((loan) => (
                  <div key={loan.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{loan.bookTitle}</h4>
                      <div className="flex items-center space-x-4 mt-1">
                        <p className="text-sm text-gray-600">
                          Emprunté le {new Date(loan.loanDate).toLocaleDateString("fr-FR")}
                        </p>
                        <p className="text-sm text-gray-600">
                          À rendre le {new Date(loan.dueDate).toLocaleDateString("fr-FR")}
                        </p>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-600">{getLocationLabel(loan.location)}</span>
                        </div>
                      </div>
                    </div>
                    <Badge variant={loan.status === "overdue" ? "destructive" : "default"}>
                      {loan.status === "active" ? "En cours" : "En retard"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Section Notation */}
        {activeTab === "notation" && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-yellow-600" />
                <span>Noter et commenter des livres</span>
              </CardTitle>
              <CardDescription>
                Partagez votre avis sur les livres que vous avez lus pour aider les autres étudiants
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {booksToRate.map((book) => (
                  <Card key={book.id} className="border-yellow-200 hover:shadow-lg transition-shadow">
                    <div className="aspect-[3/4] bg-gray-100 relative">
                      <img
                        src={book.coverUrl || "/placeholder.svg"}
                        alt={book.title}
                        className="w-full h-full object-cover rounded-t-lg"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-1 line-clamp-2">{book.title}</h3>
                      <p className="text-gray-600 text-sm mb-2">{book.author}</p>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                          {book.specialization}
                        </Badge>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">{book.rating}</span>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs border-green-300 text-green-700 mb-3">
                        {getLocationLabel(book.location)}
                      </Badge>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{book.description}</p>
                      <Button
                        onClick={() => handleRateBook(book)}
                        className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
                        size="sm"
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Noter ce livre
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {booksToRate.length === 0 && (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Aucun livre à noter pour le moment.</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Empruntez des livres pour pouvoir les noter et laisser des commentaires.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Catalogue (onglet par défaut) */}
        {activeTab === "catalogue" && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Catalogue de la bibliothèque</CardTitle>
              <CardDescription>
                Recherchez parmi divers ouvrages spécialisés en ingénierie, eau et environnement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Rechercher par titre, auteur, spécialisation..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={genreFilter} onValueChange={setGenreFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Spécialisation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes spécialisations</SelectItem>
                    {specializations.map((spec) => (
                      <SelectItem key={spec} value={spec}>
                        {spec}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={locationFilter} onValueChange={setLocationFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Bibliothèque" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes bibliothèques</SelectItem>
                    {locations.map((location) => (
                      <SelectItem key={location.value} value={location.value}>
                        {location.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={docTypeFilter} onValueChange={setDocTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Type de document" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous types</SelectItem>
                    {documentTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Liste des livres */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBooks.map((book) => (
                  <Card key={book.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-[3/4] bg-gray-100 relative">
                      <img
                        src={book.coverUrl || "/placeholder.svg"}
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2">{getDocumentTypeIcon(book.documentType)}</div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-1 line-clamp-2">{book.title}</h3>
                      <p className="text-gray-600 text-sm mb-2">{book.author}</p>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary" className="text-xs">
                          {book.specialization}
                        </Badge>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">{book.rating}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 mb-3">
                        <Badge variant="outline" className="text-xs">
                          {getDocumentTypeLabel(book.documentType)}
                        </Badge>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-600">{getLocationLabel(book.location)}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{book.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          {book.availableCopies}/{book.totalCopies} disponible(s)
                        </span>
                        <Button
                          size="sm"
                          disabled={!book.available || book.availableCopies === 0}
                          onClick={() => handleBorrowBook(book.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {book.available && book.availableCopies > 0 ? "Emprunter" : "Indisponible"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredBooks.length === 0 && (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Aucun ouvrage trouvé pour votre recherche.</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Essayez de modifier vos critères de recherche ou contactez le CDI.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>

      {/* Dialog pour noter un livre */}
      <Dialog open={isRatingDialogOpen} onOpenChange={setIsRatingDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Noter ce livre</DialogTitle>
            <DialogDescription>{selectedBook && `Donnez votre avis sur "${selectedBook.title}"`}</DialogDescription>
          </DialogHeader>
          {selectedBook && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <img
                  src={selectedBook.coverUrl || "/placeholder.svg"}
                  alt={selectedBook.title}
                  className="w-16 h-20 object-cover rounded"
                />
                <div>
                  <h4 className="font-medium">{selectedBook.title}</h4>
                  <p className="text-sm text-gray-600">{selectedBook.author}</p>
                  <Badge variant="secondary" className="text-xs mt-1">
                    {selectedBook.specialization}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Votre note</Label>
                {renderStars(rating, setRating)}
                <p className="text-sm text-gray-600">Cliquez sur les étoiles pour noter</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="comment">Votre commentaire (optionnel)</Label>
                <Textarea
                  id="comment"
                  placeholder="Partagez votre avis sur ce livre..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsRatingDialogOpen(false)}>
                  Annuler
                </Button>
                <Button onClick={submitRating} className="bg-yellow-500 hover:bg-yellow-600">
                  Valider ma note
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
