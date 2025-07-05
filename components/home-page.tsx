"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BookOpen, Search, LogOut, HelpCircle, Mail, MapPin, Clock, Star } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

export default function HomePage() {
  const router = useRouter()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    router.push("/auth")
  }

  const handleReservationClick = () => {
    router.push("/student/reservation")
  }

  const handleEmpruntClick = () => {
    router.push("/student/emprunt")
  }

  const handleSearchClick = () => {
    router.push("/student/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-green-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img src="/images/logo-2ie.jpg" alt="Logo 2iE" className="h-16 w-32 object-cover rounded" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Bibliothèque en ligne</h1>
                <p className="text-sm text-gray-600">
                  Institut International d'Ingénierie de l'Eau et de l'Environnement
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">Bonjour, {user?.name}</span>
              <Button
                onClick={() => router.push(user?.role === "admin" ? "/admin/dashboard" : "/student/dashboard")}
                className="bg-green-600 hover:bg-green-700"
              >
                Mon espace
              </Button>
              {user?.role !== "admin" && (
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="border-red-300 text-red-700 hover:bg-red-50 bg-transparent"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Déconnexion
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation rapide */}
      <div className="bg-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex flex-wrap items-center justify-center space-x-12 text-sm">
            <a href="#accueil" className="hover:text-yellow-200 transition-colors">
              Accueil
            </a>
            <button onClick={handleReservationClick} className="hover:text-yellow-200 transition-colors">
              Réservation
            </button>
            <button onClick={handleEmpruntClick} className="hover:text-yellow-200 transition-colors">
              Emprunt
            </button>
          </div>
        </div>
      </div>

      {/* Message de bienvenue personnalisé */}
      <div className="bg-green-50 border-b border-green-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <Alert className="border-green-300">
            <BookOpen className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Bienvenue {user?.name} !</strong> Vous êtes connecté en tant que{" "}
              <span className="font-medium">{user?.role === "admin" ? "Administrateur" : "Étudiant"}</span>. Vous avez
              maintenant accès à toutes les fonctionnalités de la bibliothèque.
            </AlertDescription>
          </Alert>
        </div>
      </div>

      {/* Barre de recherche simplifiée */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center mb-6">
            <div className="space-y-2">
              <p className="text-xl text-green-700 font-semibold">Bienvenue dans votre Bibliothèque en ligne</p>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Trouvez divers ouvrages selon vos besoins : manuels, mémoires, ressources numériques et plus encore.
              </p>
            </div>
          </div>
          <Card className="border-yellow-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Rechercher par titre, auteur, mot-clé..."
                      className="pl-10 h-12 text-lg border-yellow-200 focus:border-green-400"
                    />
                  </div>
                </div>
                <div className="w-64">
                  <Select>
                    <SelectTrigger className="border-yellow-200 h-12">
                      <SelectValue placeholder="Choisir une option de recherche" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="titre">Recherche par titre</SelectItem>
                      <SelectItem value="titre-exact">Titre exact</SelectItem>
                      <SelectItem value="debut-titre">Début du titre</SelectItem>
                      <SelectItem value="auteur">Par auteur</SelectItem>
                      <SelectItem value="auteur-exact">Auteur exact</SelectItem>
                      <SelectItem value="nom-famille">Nom de famille</SelectItem>
                      <SelectItem value="eau">Eau et Assainissement</SelectItem>
                      <SelectItem value="gc">Génie Civil et BTP</SelectItem>
                      <SelectItem value="energie">Énergies renouvelables</SelectItem>
                      <SelectItem value="environnement">Environnement</SelectItem>
                      <SelectItem value="mines">Mines et Géologie</SelectItem>
                      <SelectItem value="electro">Électromécanique</SelectItem>
                      <SelectItem value="info">Informatique et Télécommunications</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleSearchClick} className="bg-green-600 hover:bg-green-700 h-12 px-8">
                  <Search className="h-4 w-4 mr-2" />
                  Rechercher
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Section "Entrez dans la bibliothèque" */}
        <Card className="mb-8 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 mb-6">
              <HelpCircle className="h-5 w-5 text-green-600" />
              <h2 className="text-lg font-semibold text-green-700">Explorez nos collections par bibliothèque</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="text-center">
                <h3 className="font-semibold text-green-700 mb-4">Bibliothèque Kamboinsé</h3>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <Card className="p-2 border-green-200">
                    <div className="text-xs">
                      <img
                        src="/images/book-hydraulique.jpg"
                        alt="Hydraulique générale"
                        className="w-full h-16 object-cover rounded mb-2"
                      />
                      <p className="font-medium">Hydraulique générale</p>
                      <p className="text-gray-600">André Lencastre</p>
                      <div className="flex items-center mt-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs ml-1">4.6</span>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-2 border-green-200">
                    <div className="text-xs">
                      <img
                        src="/images/book-energie.jpg"
                        alt="Énergies renouvelables"
                        className="w-full h-16 object-cover rounded mb-2"
                      />
                      <p className="font-medium">Énergies renouvelables</p>
                      <p className="text-gray-600">Amadou Maiga</p>
                      <div className="flex items-center mt-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs ml-1">4.7</span>
                      </div>
                    </div>
                  </Card>
                </div>
                <Button
                  variant="outline"
                  className="w-full bg-transparent border-green-300 text-green-700 hover:bg-green-50"
                  onClick={() => router.push("/student/dashboard")}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Voir plus de livres
                </Button>
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-green-700 mb-4">Bibliothèque Ouaga</h3>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <Card className="p-2 border-green-200">
                    <div className="text-xs">
                      <img
                        src="/images/book-genie-civil.jpg"
                        alt="Génie Civil - BTP"
                        className="w-full h-16 object-cover rounded mb-2"
                      />
                      <p className="font-medium">Génie Civil - BTP</p>
                      <p className="text-gray-600">Jean-Pierre Muzeau</p>
                      <div className="flex items-center mt-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs ml-1">4.4</span>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-2 border-green-200">
                    <div className="text-xs">
                      <img
                        src="/images/book-memoire.jpg"
                        alt="Informatique et réseaux"
                        className="w-full h-16 object-cover rounded mb-2"
                      />
                      <p className="font-medium">Informatique et réseaux</p>
                      <p className="text-gray-600">Michel Dupont</p>
                      <div className="flex items-center mt-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs ml-1">4.5</span>
                      </div>
                    </div>
                  </Card>
                </div>
                <Button
                  variant="outline"
                  className="w-full bg-transparent border-green-300 text-green-700 hover:bg-green-50"
                  onClick={() => router.push("/student/dashboard")}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Voir plus de livres
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <h3 className="text-sm font-semibold mb-2 text-yellow-300">Contact</h3>
              <div className="space-y-1 text-xs">
                <div className="flex items-center">
                  <MapPin className="h-3 w-3 mr-1" />
                  <span>2iE - Burkina Faso</span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-3 w-3 mr-1" />
                  <span>bibliotheque@2ie-edu.org</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-2 text-yellow-300">Horaires</h3>
              <div className="text-xs">
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  <div>
                    <p>Lun-Ven: 7h30-18h00</p>
                    <p>Sam: 8h00-12h00</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-2 text-yellow-300">2iE Bibliothèque</h3>
              <p className="text-xs">
                Votre bibliothèque universitaire spécialisée en ingénierie, eau et environnement.
              </p>
            </div>
          </div>
          <div className="border-t border-green-500 mt-3 pt-2 text-center">
            <p className="text-xs text-gray-200">© 2025 2iE - Tous droits réservés</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
