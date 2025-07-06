"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  ArrowLeft, 
  Edit3, 
  Save, 
  X, 
  Trash2, 
  Upload,
  Image as ImageIcon,
  AlertCircle,
  Loader2
} from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { booksAPI } from "@/lib/api"
import { specializations, documentTypes, locations } from "@/lib/data"

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
  document_type?: string
  language?: string
  created_at?: string
  updated_at?: string
}

export default function BookDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const bookId = params.id as string

  const [book, setBook] = useState<Book | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  // États pour l'édition
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    isbn: "",
    category: "",
    location: "",
    description: "",
    total_copies: "",
    document_type: "",
    language: "",
    status: "",
    publication_year: "",
  })

  // États pour la gestion de l'image
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState("")

  useEffect(() => {
    if (!user || user.role !== "admin") {
      router.push("/auth")
      return
    }

    if (bookId) {
      loadBook()
    }
  }, [user, bookId, router])

  const loadBook = async () => {
    try {
      setIsLoading(true)
      setError("")
      
      const response = await booksAPI.getById(bookId)
      const bookData = response.book
      
      setBook(bookData)
      setFormData({
        title: bookData.title || "",
        author: bookData.author || "",
        isbn: bookData.isbn || "",
        category: bookData.category || "",
        location: bookData.location || "",
        description: bookData.description || "",
        total_copies: bookData.total_copies?.toString() || "",
        document_type: bookData.document_type || "",
        language: bookData.language || "Français",
        status: bookData.status || "available",
        publication_year: bookData.publication_year?.toString() || "",
      })
    } catch (error: any) {
      console.error("Erreur lors du chargement du livre:", error)
      setError(error.message || "Erreur lors du chargement du livre")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      setError("")
      setSuccessMessage("")

      let coverImageUrl = book?.coverUrl

      // Upload de l'image si une nouvelle image est sélectionnée
      if (selectedImage) {
        console.log("Upload de la nouvelle image...")
        
        const formDataImage = new FormData()
        formDataImage.append('cover', selectedImage)
        formDataImage.append('bookTitle', formData.title)
        
        const uploadResponse = await fetch('http://localhost:5000/api/upload/book-cover', {
          method: 'POST',
          body: formDataImage,
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        })
        
        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json()
          coverImageUrl = uploadResult.imageUrl
          console.log("Image uploadée avec succès:", coverImageUrl)
        } else {
          const errorResult = await uploadResponse.json()
          throw new Error(errorResult.message || "Erreur lors de l'upload de l'image")
        }
      }

      const updateData = {
        title: formData.title,
        author: formData.author,
        isbn: formData.isbn,
        specialization: formData.category,
        totalCopies: parseInt(formData.total_copies),
        location: formData.location,
        description: formData.description,
        publishedYear: formData.publication_year ? parseInt(formData.publication_year) : undefined,
        documentType: formData.document_type,
        language: formData.language,
        status: formData.status,
        coverUrl: coverImageUrl
      }

      const response = await booksAPI.update(bookId, updateData)
      
      if (response.success) {
        setSuccessMessage("Livre mis à jour avec succès !")
        setIsEditing(false)
        setSelectedImage(null)
        setImagePreview(null)
        await loadBook() // Recharger les données
      } else {
        throw new Error(response.message || "Erreur lors de la mise à jour")
      }
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour:", error)
      setError(error.message || "Erreur lors de la mise à jour du livre")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce livre ? Cette action est irréversible.")) {
      return
    }

    try {
      setIsSaving(true)
      setError("")

      const response = await booksAPI.delete(bookId)
      
      if (response.success) {
        alert("Livre supprimé avec succès !")
        router.push("/admin/dashboard")
      } else {
        throw new Error(response.message || "Erreur lors de la suppression")
      }
    } catch (error: any) {
      console.error("Erreur lors de la suppression:", error)
      setError(error.message || "Erreur lors de la suppression du livre")
      setIsSaving(false)
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setUploadError("")
    
    if (file) {
      // Validation du type de fichier
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        setUploadError("Format d'image non supporté. Utilisez JPG, PNG ou WebP.")
        return
      }
      
      // Validation de la taille (max 5MB)
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        setUploadError("L'image est trop volumineuse. Taille maximum : 5MB.")
        return
      }
      
      setSelectedImage(file)
      
      // Créer la prévisualisation
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    setUploadError("")
    // Réinitialiser l'input file
    const fileInput = document.getElementById('cover-image') as HTMLInputElement
    if (fileInput) fileInput.value = ''
  }

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "available":
        return <Badge variant="default">Disponible</Badge>
      case "unavailable":
        return <Badge variant="destructive">Indisponible</Badge>
      case "maintenance":
        return <Badge variant="secondary">Maintenance</Badge>
      case "reserved":
        return <Badge variant="outline">Réservé</Badge>
      default:
        return <Badge variant="default">Disponible</Badge>
    }
  }

  if (!user || user.role !== "admin") {
    return null
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Livre non trouvé</h2>
          <p className="text-gray-600 mb-4">Le livre demandé n'existe pas ou a été supprimé.</p>
          <Button onClick={() => router.push("/admin/dashboard")}>
            Retour au dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => router.push("/admin/dashboard")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {isEditing ? "Modifier le livre" : "Détails du livre"}
                </h1>
                <p className="text-sm text-gray-600">ID: {book.id}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {!isEditing ? (
                <>
                  <Button variant="outline" onClick={() => setIsEditing(true)}>
                    <Edit3 className="h-4 w-4 mr-2" />
                    Modifier
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleDelete}
                    disabled={isSaving}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsEditing(false)
                      setSelectedImage(null)
                      setImagePreview(null)
                      loadBook() // Recharger les données originales
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Annuler
                  </Button>
                  <Button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    {isSaving ? "Enregistrement..." : "Enregistrer"}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {successMessage && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <AlertCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
          </Alert>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Colonne gauche - Image de couverture */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Couverture</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Affichage de l'image actuelle ou prévisualisation */}
                  <div className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Prévisualisation"
                        className="w-full h-full object-cover"
                      />
                    ) : book.coverUrl ? (
                      <img
                        src={`http://localhost:5000${book.coverUrl}`}
                        alt={`Couverture de ${book.title}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = "/images/image-2iE.jpg"
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                        <div className="text-center p-4">
                          <ImageIcon className="h-12 w-12 text-blue-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600 font-medium">{book.title}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Options d'upload (uniquement en mode édition) */}
                  {isEditing && (
                    <div className="space-y-2">
                      {!imagePreview ? (
                        <label htmlFor="cover-image">
                          <Button variant="outline" className="w-full cursor-pointer" asChild>
                            <span>
                              <Upload className="h-4 w-4 mr-2" />
                              {book.coverUrl ? "Changer l'image" : "Ajouter une image"}
                            </span>
                          </Button>
                        </label>
                      ) : (
                        <div className="flex space-x-2">
                          <label htmlFor="cover-image" className="flex-1">
                            <Button variant="outline" size="sm" className="w-full cursor-pointer" asChild>
                              <span>
                                <Upload className="h-3 w-3 mr-1" />
                                Remplacer
                              </span>
                            </Button>
                          </label>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={handleRemoveImage}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="h-3 w-3 mr-1" />
                            Supprimer
                          </Button>
                        </div>
                      )}
                      
                      <input
                        id="cover-image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                      
                      {uploadError && (
                        <p className="text-sm text-red-600">{uploadError}</p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Colonne droite - Informations du livre */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Informations du livre</CardTitle>
                  {getStatusBadge(book.status)}
                </div>
                <CardDescription>
                  Créé le {new Date(book.created_at || "").toLocaleDateString("fr-FR")}
                  {book.updated_at && book.updated_at !== book.created_at && (
                    <span> • Modifié le {new Date(book.updated_at).toLocaleDateString("fr-FR")}</span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Informations de base */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="title">Titre *</Label>
                      {isEditing ? (
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => handleInputChange("title", e.target.value)}
                          required
                        />
                      ) : (
                        <p className="font-medium">{book.title}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="author">Auteur *</Label>
                      {isEditing ? (
                        <Input
                          id="author"
                          value={formData.author}
                          onChange={(e) => handleInputChange("author", e.target.value)}
                          required
                        />
                      ) : (
                        <p className="font-medium">{book.author}</p>
                      )}
                    </div>
                  </div>

                  {/* ISBN et catégorie */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="isbn">ISBN</Label>
                      {isEditing ? (
                        <Input
                          id="isbn"
                          value={formData.isbn}
                          onChange={(e) => handleInputChange("isbn", e.target.value)}
                        />
                      ) : (
                        <p>{book.isbn || "Non renseigné"}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Spécialisation *</Label>
                      {isEditing ? (
                        <Select
                          value={formData.category}
                          onValueChange={(value) => handleInputChange("category", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner une spécialisation" />
                          </SelectTrigger>
                          <SelectContent>
                            {specializations.map((spec) => (
                              <SelectItem key={spec} value={spec}>
                                {spec}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge variant="secondary">{book.category}</Badge>
                      )}
                    </div>
                  </div>

                  {/* Localisation et copies */}
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="location">Bibliothèque *</Label>
                      {isEditing ? (
                        <Select
                          value={formData.location}
                          onValueChange={(value) => handleInputChange("location", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner une bibliothèque" />
                          </SelectTrigger>
                          <SelectContent>
                            {locations.map((location) => (
                              <SelectItem key={location.value} value={location.value}>
                                {location.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <p>{locations.find(l => l.value === book.location)?.label || book.location}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="total_copies">Total exemplaires *</Label>
                      {isEditing ? (
                        <Input
                          id="total_copies"
                          type="number"
                          value={formData.total_copies}
                          onChange={(e) => handleInputChange("total_copies", e.target.value)}
                          min="1"
                          required
                        />
                      ) : (
                        <p>{book.total_copies}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Exemplaires disponibles</Label>
                      <p className="font-medium text-lg">
                        <span className={book.available_copies > 0 ? "text-green-600" : "text-red-600"}>
                          {book.available_copies}
                        </span>
                        <span className="text-gray-500"> / {book.total_copies}</span>
                      </p>
                    </div>
                  </div>

                  {/* Statut et autres informations */}
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="status">Statut *</Label>
                      {isEditing ? (
                        <Select
                          value={formData.status}
                          onValueChange={(value) => handleInputChange("status", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un statut" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="available">Disponible</SelectItem>
                            <SelectItem value="unavailable">Indisponible</SelectItem>
                            <SelectItem value="maintenance">En maintenance</SelectItem>
                            <SelectItem value="reserved">Réservé</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        getStatusBadge(book.status)
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="language">Langue</Label>
                      {isEditing ? (
                        <Select
                          value={formData.language}
                          onValueChange={(value) => handleInputChange("language", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner une langue" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Français">Français</SelectItem>
                            <SelectItem value="Anglais">Anglais</SelectItem>
                            <SelectItem value="Arabe">Arabe</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <p>{book.language || "Non renseigné"}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="publication_year">Année de publication</Label>
                      {isEditing ? (
                        <Input
                          id="publication_year"
                          type="number"
                          value={formData.publication_year}
                          onChange={(e) => handleInputChange("publication_year", e.target.value)}
                        />
                      ) : (
                        <p>{book.publication_year || "Non renseignée"}</p>
                      )}
                    </div>
                  </div>

                  {/* Type de document */}
                  <div className="space-y-2">
                    <Label htmlFor="document_type">Type de document</Label>
                    {isEditing ? (
                      <Select
                        value={formData.document_type}
                        onValueChange={(value) => handleInputChange("document_type", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un type" />
                        </SelectTrigger>
                        <SelectContent>
                          {documentTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <p>{documentTypes.find(t => t.value === book.document_type)?.label || "Non renseigné"}</p>
                    )}
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    {isEditing ? (
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => handleInputChange("description", e.target.value)}
                        rows={4}
                        placeholder="Description de l'ouvrage, résumé, notes particulières..."
                      />
                    ) : (
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {book.description || "Aucune description disponible."}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
