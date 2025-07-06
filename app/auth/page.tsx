"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/lib/auth-context"
import { BookOpen, Mail, Lock, User, IdCard, GraduationCap, AlertCircle } from "lucide-react"

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("login")
  const [loginError, setLoginError] = useState("")
  const [registerError, setRegisterError] = useState("")
  const [registerSuccess, setRegisterSuccess] = useState("")
  const { login, register, user } = useAuth()
  const router = useRouter()

  // Effet pour rediriger l'utilisateur s'il est déjà connecté
  useEffect(() => {
    if (user) {
      if (user.role === "admin") {
        router.push("/admin/dashboard")
      } else {
        router.push("/student/dashboard")
      }
    }
  }, [user, router])

  // États pour la connexion
  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  })

  // Fonction pour gérer le changement d'onglet
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    // Réinitialiser les messages d'erreur et de succès lors du changement d'onglet
    setLoginError("")
    setRegisterError("")
    setRegisterSuccess("")
  }

  // États pour l'inscription
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    studentId: "",
    specialization: ""
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setLoginError("") // Réinitialiser l'erreur

    try {
      await login(loginData.email, loginData.password)
      // La redirection sera gérée par l'useEffect basé sur le rôle de l'utilisateur
    } catch (error) {
      console.error("Erreur de connexion:", error)
      const errorMessage = error instanceof Error ? error.message : "Erreur de connexion"
      
      // Messages d'erreur plus conviviaux
      if (errorMessage.includes("Mot de passe incorrect")) {
        setLoginError("Mot de passe incorrect. Veuillez vérifier vos informations.")
      } else if (errorMessage.includes("Utilisateur non trouvé") || errorMessage.includes("User not found")) {
        setLoginError("Adresse email non trouvée. Veuillez vérifier votre email ou vous inscrire.")
      } else if (errorMessage.includes("Invalid credentials")) {
        setLoginError("Identifiants invalides. Vérifiez votre email et mot de passe.")
      } else if (errorMessage.includes("Network") || errorMessage.includes("fetch")) {
        setLoginError("Problème de connexion au serveur. Veuillez réessayer.")
      } else {
        setLoginError(errorMessage || "Erreur de connexion. Veuillez réessayer.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setRegisterError("") // Réinitialiser l'erreur
    setRegisterSuccess("") // Réinitialiser le succès

    try {
      await register({
        name: registerData.name,
        email: registerData.email,
        password: registerData.password,
        studentId: registerData.studentId,
        specialization: registerData.specialization
      })
      
      // Afficher le message de succès
      setRegisterSuccess("Inscription réussie ! Vous pouvez maintenant vous connecter.")
      
      // Réinitialiser le formulaire et basculer vers l'onglet login
      setRegisterData({
        name: "",
        email: "",
        password: "",
        studentId: "",
        specialization: ""
      })
      
      // Basculer vers l'onglet login après un délai
      setTimeout(() => {
        setActiveTab("login")
        setRegisterSuccess("")
      }, 2000)
      
    } catch (error) {
      console.error("Erreur d'inscription:", error)
      const errorMessage = error instanceof Error ? error.message : "Erreur d'inscription"
      
      // Messages d'erreur plus conviviaux
      if (errorMessage.includes("Email already exists") || errorMessage.includes("déjà utilisé")) {
        setRegisterError("Cette adresse email est déjà utilisée. Veuillez en choisir une autre ou vous connecter.")
      } else if (errorMessage.includes("Invalid email")) {
        setRegisterError("Format d'email invalide. Veuillez saisir un email valide.")
      } else if (errorMessage.includes("Password too short")) {
        setRegisterError("Le mot de passe doit contenir au moins 6 caractères.")
      } else if (errorMessage.includes("Missing required fields")) {
        setRegisterError("Veuillez remplir tous les champs obligatoires.")
      } else if (errorMessage.includes("Network") || errorMessage.includes("fetch")) {
        setRegisterError("Problème de connexion au serveur. Veuillez réessayer.")
      } else {
        setRegisterError(errorMessage || "Erreur lors de l'inscription. Veuillez réessayer.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo et titre */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <BookOpen className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Bibliothèque 2iE</h1>
          <p className="text-gray-600 mt-2">Système de gestion des emprunts</p>
        </div>

        <Card className="shadow-lg">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Connexion</TabsTrigger>
              <TabsTrigger value="register">Inscription</TabsTrigger>
            </TabsList>

            {/* Onglet Connexion */}
            <TabsContent value="login">
              <CardHeader>
                <CardTitle>Se connecter</CardTitle>
                <CardDescription>
                  Connectez-vous à votre compte étudiant
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Affichage des erreurs de connexion */}
                {loginError && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{loginError}</AlertDescription>
                  </Alert>
                )}
                
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="votre.email@student.2ie-edu.org"
                        className="pl-10"
                        value={loginData.email}
                        onChange={(e) => {
                          setLoginData(prev => ({ ...prev, email: e.target.value }))
                          if (loginError) setLoginError("") // Effacer l'erreur lors de la saisie
                        }}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Mot de passe</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10"
                        value={loginData.password}
                        onChange={(e) => {
                          setLoginData(prev => ({ ...prev, password: e.target.value }))
                          if (loginError) setLoginError("") // Effacer l'erreur lors de la saisie
                        }}
                        required
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? "Connexion..." : "Se connecter"}
                  </Button>
                </form>
              </CardContent>
            </TabsContent>

            {/* Onglet Inscription */}
            <TabsContent value="register">
              <CardHeader>
                <CardTitle>S&apos;inscrire</CardTitle>
                <CardDescription>
                  Créez votre compte étudiant
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Affichage des erreurs d'inscription */}
                {registerError && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{registerError}</AlertDescription>
                  </Alert>
                )}
                
                {/* Affichage du message de succès */}
                {registerSuccess && (
                  <Alert className="mb-4 border-green-200 bg-green-50">
                    <AlertCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-700">{registerSuccess}</AlertDescription>
                  </Alert>
                )}
                
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name">Nom complet</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="register-name"
                        type="text"
                        placeholder="Jean Ouédraogo"
                        className="pl-10"
                        value={registerData.name}
                        onChange={(e) => {
                          setRegisterData(prev => ({ ...prev, name: e.target.value }))
                          if (registerError) setRegisterError("") // Effacer l'erreur lors de la saisie
                        }}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="j.ouedraogo@student.2ie-edu.org"
                        className="pl-10"
                        value={registerData.email}
                        onChange={(e) => {
                          setRegisterData(prev => ({ ...prev, email: e.target.value }))
                          if (registerError) setRegisterError("") // Effacer l'erreur lors de la saisie
                        }}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password">Mot de passe</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="register-password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10"
                        value={registerData.password}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-student-id">Numéro étudiant</Label>
                    <div className="relative">
                      <IdCard className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="register-student-id"
                        type="text"
                        placeholder="2IE2024001"
                        className="pl-10"
                        value={registerData.studentId}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, studentId: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-specialization">Spécialisation</Label>
                    <div className="relative">
                      <GraduationCap className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="register-specialization"
                        type="text"
                        placeholder="Génie Informatique"
                        className="pl-10"
                        value={registerData.specialization}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, specialization: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? "Inscription..." : "S'inscrire"}
                  </Button>
                </form>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>

        <div className="text-center mt-6 text-sm text-gray-600">
          <p>© 2024 Institut International d&apos;Ingénierie de l&apos;Eau et de l&apos;Environnement</p>
        </div>
      </div>
    </div>
  )
}
