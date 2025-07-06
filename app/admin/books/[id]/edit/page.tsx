"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  ArrowLeft, 
  Save, 
  Upload,
  Image as ImageIcon,
  AlertCircle,
  Loader2,
  X
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

export default function EditBookPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const bookId = params.id as string

  const [book, setBook] = useState<Book | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  // États pour le formulaire
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
    publisher: "",
  })

  // États pour la gestion de l'image
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null)
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
      
      // Remplir le formulaire avec les données existantes
      setFormData({
        title: bookData.title || "",
        author: bookData.author || "",
        isbn: bookData.isbn || "",
        category: bookData.category || "",
        location: bookData.location || "",
        description: bookData.description || "",
        total_copies: bookData.total_copies?.toString() || "",
        document_type: bookData.document_type || "",
        language: bookData.language || "",
        status: bookData.status || "available",
        publication_year: bookData.publication_year?.toString() || "",
        publisher: bookData.publisher || "",
      })

      // Définir l'image actuelle
      if (bookData.coverUrl) {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"
        setCurrentImageUrl(`${backendUrl}${bookData.coverUrl}`)
      }
      
    } catch (error: any) {
      console.error("Erreur lors du chargement du livre:", error)
      setError(error.message || "Erreur lors du chargement des détails du livre")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Effacer les messages quand l'utilisateur modifie
    if (error) setError("")
    if (successMessage) setSuccessMessage("")
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setUploadError("")

    if (file) {
      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        setUploadError("Veuillez sélectionner un fichier image valide")
        return
      }

      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setUploadError("L'image ne doit pas dépasser 5MB")
        return
      }

      setSelectedImage(file)
      
      // Créer une prévisualisation
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    setUploadError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.author.trim()) {
      setError("Le titre et l'auteur sont obligatoires")
      return
    }

    try {
      setIsSaving(true)
      setError("")

      // Préparer les données du livre
      const bookData = {
        ...formData,
        total_copies: parseInt(formData.total_copies) || 1,
        publication_year: formData.publication_year ? parseInt(formData.publication_year) : undefined,
      }

      let updateResponse
      
      // Si une nouvelle image est sélectionnée, l'uploader d'abord
      if (selectedImage) {
        const imageFormData = new FormData()
        imageFormData.append('image', selectedImage)

        const uploadResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api/upload`, {
          method: 'POST',
          body: imageFormData
        })

        if (!uploadResponse.ok) {
          throw new Error('Erreur lors de l\'upload de l\'image')
        }

        const uploadResult = await uploadResponse.json()
        bookData.coverUrl = uploadResult.filePath

        console.log("Image uploadée:", uploadResult.filePath)
      }

      // Mettre à jour le livre
      updateResponse = await booksAPI.update(bookId, bookData)
      
      if (updateResponse.success) {
        setSuccessMessage("Livre modifié avec succès !")
        
        // Rediriger vers la page de détails après un délai
        setTimeout(() => {
          router.push(`/admin/books/${bookId}`)
        }, 1500)
      } else {
        throw new Error(updateResponse.message || "Erreur lors de la modification")
      }
      
    } catch (error: any) {
      console.error("Erreur lors de la modification:", error)
      setError(error.message || "Erreur lors de la modification du livre")
    } finally {
      setIsSaving(false)
    }
  }

  if (!user || user.role !== "admin") {
    return null
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Chargement des détails du livre...</p>
        </div>
      </div>
    )
  }

  if (error && !book) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button 
            variant="outline" 
            onClick={() => router.push("/admin/dashboard")}
            className="mt-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour au tableau de bord
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              onClick={() => router.push(`/admin/books/${bookId}`)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Modifier le livre</h1>
              <p className="text-gray-600">{book?.title}</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {successMessage && (
          <Alert className="bg-green-50 text-green-800 border-green-200">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}

        {/* Formulaire d'édition */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Image de couverture */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Image de couverture</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Image actuelle ou nouvelle */}
                  <div className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden">
                    {imagePreview ? (
                      <img 
                        src={imagePreview} 
                        alt="Nouvelle couverture" 
                        className="w-full h-full object-cover"
                      />
                    ) : currentImageUrl ? (
                      <img 
                        src={currentImageUrl} 
                        alt="Couverture actuelle" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="h-16 w-16 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Upload de nouvelle image */}
                  <div>
                    <Label htmlFor="image-upload">
                      Changer l'image (optionnel)
                    </Label>
                    <div className="mt-2">
                      <Input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('image-upload')?.click()}
                        className="w-full"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Choisir une nouvelle image
                      </Button>
                    </div>
                    
                    {selectedImage && (
                      <div className="mt-2 flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm text-gray-600 truncate">
                          {selectedImage.name}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={removeImage}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    
                    {uploadError && (
                      <p className="text-sm text-red-600 mt-1">{uploadError}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Formulaire */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informations du livre</CardTitle>
                  <CardDescription>
                    Modifiez les informations du livre
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Titre et Auteur */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Titre *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => handleInputChange("title", e.target.value)}
                        placeholder="Titre du livre"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="author">Auteur *</Label>
                      <Input
                        id="author"
                        value={formData.author}
                        onChange={(e) => handleInputChange("author", e.target.value)}
                        placeholder="Nom de l'auteur"
                        required
                      />
                    </div>
                  </div>

                  {/* ISBN et Éditeur */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="isbn">ISBN</Label>
                      <Input
                        id="isbn"
                        value={formData.isbn}
                        onChange={(e) => handleInputChange("isbn", e.target.value)}
                        placeholder="ISBN"
                      />
                    </div>
                    <div>
                      <Label htmlFor="publisher">Éditeur</Label>
                      <Input
                        id="publisher"
                        value={formData.publisher}
                        onChange={(e) => handleInputChange("publisher", e.target.value)}
                        placeholder="Nom de l'éditeur"
                      />
                    </div>
                  </div>

                  {/* Catégorie et Année */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="category">Catégorie</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => handleInputChange("category", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une catégorie" />
                        </SelectTrigger>
                        <SelectContent>
                          {specializations.map((spec) => (
                            <SelectItem key={spec} value={spec}>
                              {spec}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="publication_year">Année de publication</Label>
                      <Input
                        id="publication_year"
                        type="number"
                        value={formData.publication_year}
                        onChange={(e) => handleInputChange("publication_year", e.target.value)}
                        placeholder="2024"
                        min="1000"
                        max={new Date().getFullYear()}
                      />
                    </div>
                  </div>

                  {/* Emplacement et Nombre d'exemplaires */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="location">Emplacement *</Label>
                      <Select
                        value={formData.location}
                        onValueChange={(value) => handleInputChange("location", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un emplacement" />
                        </SelectTrigger>
                        <SelectContent>
                          {locations.map((location) => (
                            <SelectItem key={location} value={location}>
                              {location}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="total_copies">Nombre d'exemplaires *</Label>
                      <Input
                        id="total_copies"
                        type="number"
                        value={formData.total_copies}
                        onChange={(e) => handleInputChange("total_copies", e.target.value)}
                        placeholder="1"
                        min="1"
                        required
                      />
                    </div>
                  </div>

                  {/* Type de document et Langue */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="document_type">Type de document</Label>
                      <Select
                        value={formData.document_type}
                        onValueChange={(value) => handleInputChange("document_type", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un type" />
                        </SelectTrigger>
                        <SelectContent>
                          {documentTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="language">Langue</Label>
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
                          <SelectItem value="Espagnol">Espagnol</SelectItem>
                          <SelectItem value="Allemand">Allemand</SelectItem>
                          <SelectItem value="Italien">Italien</SelectItem>
                          <SelectItem value="Arabe">Arabe</SelectItem>
                          <SelectItem value="Autre">Autre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Statut */}
                  <div>
                    <Label htmlFor="status">Statut</Label>
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
                  </div>

                  {/* Description */}
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      placeholder="Description du livre..."
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex justify-end space-x-4">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => router.push(`/admin/books/${bookId}`)}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Enregistrer les modifications
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
