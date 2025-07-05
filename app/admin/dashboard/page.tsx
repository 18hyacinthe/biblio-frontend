"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  BookOpen,
  Users,
  FileText,
  AlertTriangle,
  Plus,
  Search,
  Edit,
  Trash2,
  UserPlus,
  Download,
  Clock,
  Eye,
  UserX,
  LogOut,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { books, students, loans, specializations } from "@/lib/data"

export default function AdminDashboard() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSpecialization, setSelectedSpecialization] = useState("all")
  const [showAddStudentForm, setShowAddStudentForm] = useState(false)
  const [newStudent, setNewStudent] = useState({
    name: "",
    email: "",
    studentId: "",
    specialization: "",
  })

  if (!user || user.role !== "admin") {
    router.push("/")
    return null
  }

  // Statistiques
  const totalBooks = books.length
  const availableBooks = books.filter((book) => book.available).length
  const totalStudents = students.length
  const activeLoans = loans.filter((loan) => loan.status === "active").length
  const overdueLoans = loans.filter((loan) => loan.status === "overdue").length

  // Filtrage des étudiants
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSpecialization = selectedSpecialization === "all" || student.specialization === selectedSpecialization
    return matchesSearch && matchesSpecialization
  })

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Nouvel étudiant:", newStudent)
    alert("Étudiant ajouté avec succès !")
    setNewStudent({ name: "", email: "", studentId: "", specialization: "" })
    setShowAddStudentForm(false)
  }

  const generateReport = () => {
    const report = {
      date: new Date().toLocaleDateString("fr-FR"),
      totalBooks,
      availableBooks,
      borrowedBooks: totalBooks - availableBooks,
      totalStudents,
      activeLoans,
      overdueLoans,
      popularBooks: books.sort((a, b) => b.rating - a.rating).slice(0, 5),
      activeStudents: students.filter((s) => s.activeLoans > 0),
    }

    console.log("Rapport généré:", report)
    alert("Rapport généré avec succès ! Consultez la console pour les détails.")
  }

  const handleOverdueManagement = () => {
    const overdueStudents = loans.filter((loan) => loan.status === "overdue").map((loan) => loan.userName)

    alert(`${overdueStudents.length} étudiant(s) en retard détecté(s). Notifications envoyées.`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img src="/images/logo-2ie.jpg" alt="Logo 2iE" className="h-16 w-32 object-cover rounded" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Administration Bibliothèque</h1>
                <p className="text-sm text-gray-600">Gestion complète de la bibliothèque 2iE</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <img
                  src="/images/admin-avatar.jpg"
                  alt="Avatar Admin"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <span className="text-sm text-gray-600">Admin: {user?.name}</span>
              </div>
              <Button
                onClick={() => {
                  logout()
                  router.push("/auth")
                }}
                variant="outline"
                size="sm"
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Livres</p>
                  <p className="text-2xl font-bold text-gray-900">{totalBooks}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Étudiants</p>
                  <p className="text-2xl font-bold text-gray-900">{totalStudents}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Emprunts Actifs</p>
                  <p className="text-2xl font-bold text-gray-900">{activeLoans}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Retards</p>
                  <p className="text-2xl font-bold text-gray-900">{overdueLoans}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <BookOpen className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Disponibles</p>
                  <p className="text-2xl font-bold text-gray-900">{availableBooks}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <Plus className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Ajouter un livre</h3>
              <Button onClick={() => router.push("/admin/books/add")} className="w-full bg-blue-600 hover:bg-blue-700">
                Nouveau livre
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <Download className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Générer un rapport</h3>
              <Button onClick={generateReport} className="w-full bg-green-600 hover:bg-green-700">
                Créer rapport
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <Clock className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Gérer les retards</h3>
              <Button onClick={handleOverdueManagement} className="w-full bg-red-600 hover:bg-red-700">
                Voir retards
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <UserPlus className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Ajouter étudiant</h3>
              <Button onClick={() => setShowAddStudentForm(true)} className="w-full bg-purple-600 hover:bg-purple-700">
                Nouvel étudiant
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Formulaire d'ajout d'étudiant */}
        {showAddStudentForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Ajouter un nouvel étudiant</CardTitle>
              <CardDescription>Remplissez les informations de l'étudiant</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddStudent} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nom complet *</Label>
                    <Input
                      id="name"
                      value={newStudent.name}
                      onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newStudent.email}
                      onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="studentId">ID Étudiant *</Label>
                    <Input
                      id="studentId"
                      value={newStudent.studentId}
                      onChange={(e) => setNewStudent({ ...newStudent, studentId: e.target.value })}
                      placeholder="2iE2024XXX"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="specialization">Spécialisation *</Label>
                    <Select
                      value={newStudent.specialization}
                      onValueChange={(value) => setNewStudent({ ...newStudent, specialization: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir une spécialisation" />
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
                </div>
                <div className="flex justify-end space-x-4">
                  <Button type="button" variant="outline" onClick={() => setShowAddStudentForm(false)}>
                    Annuler
                  </Button>
                  <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                    Ajouter l'étudiant
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Aperçu des livres */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Gestion du catalogue</CardTitle>
                <CardDescription>Aperçu des livres récents</CardDescription>
              </div>
              <Button onClick={() => router.push("/admin/books")} variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                Voir tous les livres
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {books.slice(0, 3).map((book) => (
                <Card key={book.id} className="border">
                  <CardContent className="p-4">
                    <div className="flex space-x-4">
                      <img
                        src={book.coverUrl || "/placeholder.svg"}
                        alt={book.title}
                        className="w-16 h-20 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm line-clamp-2">{book.title}</h4>
                        <p className="text-xs text-gray-600 mt-1">{book.author}</p>
                        <div className="flex items-center justify-between mt-2">
                          <Badge variant={book.available ? "default" : "destructive"}>
                            {book.available ? "Disponible" : "Indisponible"}
                          </Badge>
                          <div className="flex space-x-1">
                            <Button size="sm" variant="outline">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Liste des étudiants */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des étudiants ({filteredStudents.length})</CardTitle>
            <CardDescription>Gestion complète des étudiants inscrits</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filtres */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Rechercher par nom, email ou ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-64">
                <Select value={selectedSpecialization} onValueChange={setSelectedSpecialization}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrer par spécialisation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les spécialisations</SelectItem>
                    {specializations.map((spec) => (
                      <SelectItem key={spec} value={spec}>
                        {spec}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tableau des étudiants */}
            <div className="space-y-4">
              {filteredStudents.map((student) => (
                <Card key={student.id} className="border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <img
                          src={student.avatar || "/images/student-avatar-1.jpg"}
                          alt={student.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                          <h4 className="font-semibold">{student.name}</h4>
                          <p className="text-sm text-gray-600">{student.email}</p>
                          <p className="text-xs text-gray-500">ID: {student.studentId}</p>
                        </div>
                      </div>

                      <div className="text-center">
                        <p className="text-sm font-medium">{student.specialization}</p>
                        <p className="text-xs text-gray-500">Inscrit le {student.registrationDate}</p>
                      </div>

                      <div className="text-center">
                        <div className="flex space-x-4">
                          <div>
                            <p className="text-lg font-bold text-blue-600">{student.activeLoans}</p>
                            <p className="text-xs text-gray-500">Emprunts actifs</p>
                          </div>
                          <div>
                            <p className="text-lg font-bold text-green-600">{student.totalLoans}</p>
                            <p className="text-xs text-gray-500">Total emprunts</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <UserX className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredStudents.length === 0 && (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Aucun étudiant trouvé pour votre recherche.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
