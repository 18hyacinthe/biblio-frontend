"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Upload, X, Image as ImageIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { specializations, documentTypes, locations } from "@/lib/data"
import { booksAPI } from "@/lib/api"

export default function AddBookPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    specialization: "",
    isbn: "",
    publishedYear: "",
    description: "",
    totalCopies: "",
    documentType: "",
    location: "",
    language: "Français",
  })

  // États pour la gestion de l'image
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState("")

  if (!user || user.role !== "admin") {
    router.push("/")
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validation des champs requis
      if (!formData.title || !formData.author || !formData.specialization || !formData.totalCopies || !formData.documentType || !formData.location) {
        alert("Veuillez remplir tous les champs obligatoires")
        return
      }

      let coverImageUrl = ""

      // Upload de l'image si une image est sélectionnée
      if (selectedImage) {
        console.log("Upload de l'image en cours...")
        
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

      // Préparer les données pour l'API backend
      const bookData = {
        title: formData.title,
        author: formData.author,
        isbn: formData.isbn,
        specialization: formData.specialization,
        totalCopies: parseInt(formData.totalCopies),
        location: formData.location,
        description: formData.description,
        publishedYear: formData.publishedYear ? parseInt(formData.publishedYear) : undefined,
        documentType: formData.documentType,
        language: formData.language,
        coverUrl: coverImageUrl
      }

      console.log("Données envoyées à l'API:", bookData)

      // Appel de l'API pour créer le livre
      const response = await booksAPI.create(bookData)
      
      if (response.success) {
        alert("Ouvrage ajouté avec succès au catalogue !")
        
        // Réinitialiser le formulaire
        setFormData({
          title: "",
          author: "",
          specialization: "",
          isbn: "",
          publishedYear: "",
          description: "",
          totalCopies: "",
          documentType: "",
          location: "",
          language: "Français",
        })
        
        // Réinitialiser l'image
        handleRemoveImage()
        
        // Rediriger vers le dashboard admin
        router.push("/admin/dashboard")
      } else {
        throw new Error(response.message || "Erreur lors de l'ajout du livre")
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout du livre:", error)
      const errorMessage = error instanceof Error ? error.message : "Impossible d'ajouter le livre"
      alert(`Erreur: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // Fonction pour gérer la sélection d'image
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

  // Fonction pour supprimer l'image sélectionnée
  const handleRemoveImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    setUploadError("")
    // Réinitialiser l'input file
    const fileInput = document.getElementById('cover-image') as HTMLInputElement
    if (fileInput) fileInput.value = ''
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <div className="flex items-center space-x-2">
              <img src="/placeholder.svg?height=40&width=80" alt="Logo 2iE" className="h-12" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Ajouter un ouvrage</h1>
                <p className="text-sm text-gray-600">Bibliothèque en ligne</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Informations de l'ouvrage</CardTitle>
            <CardDescription>Remplissez tous les champs pour ajouter un nouvel ouvrage au catalogue</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Titre *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="author">Auteur *</Label>
                  <Input
                    id="author"
                    value={formData.author}
                    onChange={(e) => handleInputChange("author", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="specialization">Spécialisation *</Label>
                  <Select
                    value={formData.specialization}
                    onValueChange={(value) => handleInputChange("specialization", value)}
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
                </div>
                <div className="space-y-2">
                  <Label htmlFor="isbn">ISBN</Label>
                  <Input
                    id="isbn"
                    value={formData.isbn}
                    onChange={(e) => handleInputChange("isbn", e.target.value)}
                    placeholder="978-2-100-545261"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="publishedYear">Année de publication</Label>
                  <Input
                    id="publishedYear"
                    type="number"
                    value={formData.publishedYear}
                    onChange={(e) => handleInputChange("publishedYear", e.target.value)}
                    placeholder="2024"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalCopies">Nombre d'exemplaires *</Label>
                  <Input
                    id="totalCopies"
                    type="number"
                    value={formData.totalCopies}
                    onChange={(e) => handleInputChange("totalCopies", e.target.value)}
                    required
                    min="1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Langue</Label>
                  <Select value={formData.language} onValueChange={(value) => handleInputChange("language", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une langue" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Français">Français</SelectItem>
                      <SelectItem value="Anglais">Anglais</SelectItem>
                      <SelectItem value="Arabe">Arabe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="documentType">Type de document *</Label>
                  <Select
                    value={formData.documentType}
                    onValueChange={(value) => handleInputChange("documentType", value)}
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
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Bibliothèque *</Label>
                  <Select value={formData.location} onValueChange={(value) => handleInputChange("location", value)}>
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
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={4}
                  placeholder="Description de l'ouvrage, résumé, notes particulières..."
                />
              </div>

              {/* Sélection et prévisualisation de l'image de couverture */}
              <div className="space-y-4">
                <Label>Image de couverture</Label>
                
                {!imagePreview ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                    <div className="flex flex-col items-center space-y-4">
                      <ImageIcon className="h-12 w-12 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600 mb-2">
                          Sélectionnez une image de couverture
                        </p>
                        <p className="text-xs text-gray-500">
                          JPG, PNG ou WebP (max 5MB)
                        </p>
                      </div>
                      <label htmlFor="cover-image">
                        <Button type="button" variant="outline" className="cursor-pointer" asChild>
                          <span>
                            <Upload className="h-4 w-4 mr-2" />
                            Choisir une image
                          </span>
                        </Button>
                      </label>
                      <input
                        id="cover-image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="relative border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <img
                          src={imagePreview}
                          alt="Prévisualisation"
                          className="w-32 h-40 object-cover rounded border"
                        />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div>
                          <p className="font-medium text-sm">Image sélectionnée</p>
                          <p className="text-xs text-gray-600">{selectedImage?.name}</p>
                          <p className="text-xs text-gray-500">
                            {selectedImage && (selectedImage.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <label htmlFor="cover-image-replace">
                            <Button type="button" variant="outline" size="sm" className="cursor-pointer" asChild>
                              <span>
                                <Upload className="h-3 w-3 mr-1" />
                                Remplacer
                              </span>
                            </Button>
                          </label>
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            onClick={handleRemoveImage}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="h-3 w-3 mr-1" />
                            Supprimer
                          </Button>
                        </div>
                        <input
                          id="cover-image-replace"
                          type="file"
                          accept="image/*"
                          onChange={handleImageSelect}
                          className="hidden"
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                {uploadError && (
                  <p className="text-sm text-red-600">{uploadError}</p>
                )}
              </div>

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Annuler
                </Button>
                <Button 
                  type="submit" 
                  className="bg-green-600 hover:bg-green-700"
                  disabled={isLoading}
                >
                  {isLoading ? "Ajout en cours..." : "Ajouter l'ouvrage"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
