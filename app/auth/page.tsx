"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BookOpen, User, Shield, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

export default function AuthPage() {
  const [userType, setUserType] = useState("")
  const [showLoginForm, setShowLoginForm] = useState(false)
  const [showRegisterForm, setShowRegisterForm] = useState(false)
  const [loginData, setLoginData] = useState({ email: "", password: "" })
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    studentId: "",
    specialization: "",
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()
  const { login } = useAuth()

  const handleUserTypeChoice = () => {
    if (!userType) {
      setError("Veuillez choisir votre type d'utilisateur")
      return
    }
    setError("")
    if (userType === "admin") {
      setShowLoginForm(true)
    } else {
      // Pour les étudiants, on peut proposer connexion ou inscription
      setShowLoginForm(true)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Simulation de connexion
      if (userType === "admin" && loginData.email === "admin@2ie-edu.org" && loginData.password === "admin123") {
        login({
          id: "1",
          name: "Administrateur CDI",
          email: "admin@2ie-edu.org",
          role: "admin",
        })
        router.push("/")
      } else if (userType === "student" && loginData.email && loginData.password) {
        login({
          id: "2",
          name: "Étudiant 2iE",
          email: loginData.email,
          role: "student",
          studentId: "2iE2024001",
        })
        router.push("/")
      } else {
        setError("Identifiants invalides")
      }
    } catch (error) {
      setError("Erreur de connexion")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      if (registerData.name && registerData.email && registerData.password && registerData.studentId) {
        login({
          id: "3",
          name: registerData.name,
          email: registerData.email,
          role: "student",
          studentId: registerData.studentId,
        })
        router.push("/")
      } else {
        setError("Veuillez remplir tous les champs")
      }
    } catch (error) {
      setError("Erreur lors de l'inscription")
    } finally {
      setIsLoading(false)
    }
  }

  const resetForms = () => {
    setShowLoginForm(false)
    setShowRegisterForm(false)
    setUserType("")
    setError("")
    setLoginData({ email: "", password: "" })
    setRegisterData({ name: "", email: "", password: "", studentId: "", specialization: "" })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-green-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo et titre */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <BookOpen className="h-16 w-16 text-green-600" />
              <div className="absolute -top-2 -right-2 h-6 w-6 bg-yellow-400 rounded-full flex items-center justify-center">
                <div className="h-3 w-3 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Choix de Connexion</h1>
          <p className="text-gray-600">Bibliothèque 2iE</p>
        </div>

        {!showLoginForm && !showRegisterForm ? (
          /* Choix du type d'utilisateur */
          <Card className="border-green-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-center text-green-700">Sélectionnez votre profil</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <Alert className="border-red-300">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              )}

              <RadioGroup value={userType} onValueChange={setUserType} className="space-y-4">
                <div className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-green-50 transition-colors">
                  <RadioGroupItem value="student" id="student" />
                  <Label htmlFor="student" className="flex items-center space-x-3 cursor-pointer flex-1">
                    <User className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Étudiant</p>
                      <p className="text-sm text-gray-600">Accès aux ressources et emprunts</p>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-green-50 transition-colors">
                  <RadioGroupItem value="admin" id="admin" />
                  <Label htmlFor="admin" className="flex items-center space-x-3 cursor-pointer flex-1">
                    <Shield className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-medium">Administrateur</p>
                      <p className="text-sm text-gray-600">Gestion de la bibliothèque</p>
                    </div>
                  </Label>
                </div>
              </RadioGroup>

              <Button onClick={handleUserTypeChoice} className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg">
                Choisir
              </Button>
            </CardContent>
          </Card>
        ) : showLoginForm ? (
          /* Formulaire de connexion */
          <Card className="border-green-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-center text-green-700">
                Connexion {userType === "admin" ? "Administrateur" : "Étudiant"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                {error && (
                  <Alert className="border-red-300">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email {userType === "admin" ? "" : "2iE"}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={userType === "admin" ? "admin@2ie-edu.org" : "votre.nom@2ie-edu.org"}
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input
                    id="password"
                    type="password"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required
                    disabled={isLoading}
                  />
                </div>

                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isLoading}>
                  {isLoading ? "Connexion..." : "Se connecter"}
                </Button>

                {userType === "admin" && (
                  <div className="text-sm text-gray-600 space-y-1 p-3 bg-gray-50 rounded">
                    <p>
                      <strong>Compte test :</strong>
                    </p>
                    <p>Email: admin@2ie-edu.org</p>
                    <p>Mot de passe: admin123</p>
                  </div>
                )}

                {userType === "student" && (
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">Pas encore de compte ?</p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowLoginForm(false)
                        setShowRegisterForm(true)
                      }}
                      className="w-full border-green-300 text-green-700 hover:bg-green-50"
                    >
                      Créer un compte étudiant
                    </Button>
                  </div>
                )}

                <Button
                  type="button"
                  variant="ghost"
                  onClick={resetForms}
                  className="w-full text-gray-600 hover:text-gray-800"
                >
                  ← Retour au choix
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          /* Formulaire d'inscription */
          <Card className="border-green-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-center text-green-700">Inscription Étudiant</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegister} className="space-y-4">
                {error && (
                  <Alert className="border-red-300">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="name">Nom complet</Label>
                  <Input
                    id="name"
                    placeholder="Prénom NOM"
                    value={registerData.name}
                    onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="studentId">Numéro étudiant 2iE</Label>
                  <Input
                    id="studentId"
                    placeholder="2iE2024001"
                    value={registerData.studentId}
                    onChange={(e) => setRegisterData({ ...registerData, studentId: e.target.value })}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialization">Spécialisation</Label>
                  <Select
                    value={registerData.specialization}
                    onValueChange={(value) => setRegisterData({ ...registerData, specialization: value })}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir une spécialisation" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Génie Civil">Génie Civil</SelectItem>
                      <SelectItem value="Génie Électrique">Génie Électrique</SelectItem>
                      <SelectItem value="Informatique">Informatique</SelectItem>
                      <SelectItem value="Management">Management</SelectItem>
                      <SelectItem value="Environnement">Environnement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="registerEmail">Email 2iE</Label>
                  <Input
                    id="registerEmail"
                    type="email"
                    placeholder="prenom.nom@2ie-edu.org"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="registerPassword">Mot de passe</Label>
                  <Input
                    id="registerPassword"
                    type="password"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    required
                    disabled={isLoading}
                  />
                </div>

                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isLoading}>
                  {isLoading ? "Inscription..." : "Créer mon compte"}
                </Button>

                <div className="text-center">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowRegisterForm(false)
                      setShowLoginForm(true)
                    }}
                    className="w-full border-green-300 text-green-700 hover:bg-green-50"
                  >
                    Déjà un compte ? Se connecter
                  </Button>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={resetForms}
                  className="w-full text-gray-600 hover:text-gray-800"
                >
                  ← Retour au choix
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
