"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft } from "lucide-react"
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
    coverUrl: "",
    documentType: "",
    location: "",
    language: "Français",
  })

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
        coverUrl: formData.coverUrl
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
          coverUrl: "",
          documentType: "",
          location: "",
          language: "Français",
        })
        
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

              <div className="space-y-2">
                <Label htmlFor="coverUrl">URL de la couverture</Label>
                <Input
                  id="coverUrl"
                  value={formData.coverUrl}
                  onChange={(e) => handleInputChange("coverUrl", e.target.value)}
                  placeholder="https://example.com/cover.jpg"
                />
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
