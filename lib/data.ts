export interface Book {
  id: string
  title: string
  author: string
  genre: string
  isbn: string
  publishedYear: number
  description: string
  coverUrl: string
  available: boolean
  totalCopies: number
  availableCopies: number
  rating: number
  reviews: Review[]
  documentType: "texte_imprime" | "document_electronique" | "multimedia" | "enregistrement_sonore"
  specialization: string
  language: string
  location: "kamboinse" | "ouaga"
}

export interface Review {
  id: string
  userId: string
  userName: string
  rating: number
  comment: string
  date: string
}

export interface Loan {
  id: string
  bookId: string
  userId: string
  userName: string
  bookTitle: string
  loanDate: string
  dueDate: string
  returnDate?: string
  status: "active" | "returned" | "overdue"
  location: "kamboinse" | "ouaga"
}

export interface Student {
  id: string
  name: string
  email: string
  studentId: string
  registrationDate: string
  activeLoans: number
  totalLoans: number
  specialization: string
  avatar?: string
}

// Données simulées spécifiques à 2iE
export const books: Book[] = [
  {
    id: "1",
    title: "Hydraulique générale et appliquée",
    author: "André Lencastre",
    genre: "Hydraulique",
    isbn: "978-2-212-11752-4",
    publishedYear: 2018,
    description: "Ouvrage de référence en hydraulique pour les ingénieurs en eau et environnement.",
    coverUrl: "/images/book-hydraulique.jpg",
    available: true,
    totalCopies: 8,
    availableCopies: 5,
    rating: 4.6,
    reviews: [],
    documentType: "texte_imprime",
    specialization: "Eau et Assainissement",
    language: "Français",
    location: "kamboinse",
  },
  {
    id: "2",
    title: "Génie Civil - Bâtiment et Travaux Publics",
    author: "Jean-Pierre Muzeau",
    genre: "Génie Civil",
    isbn: "978-2-10-074521-3",
    publishedYear: 2020,
    description: "Manuel complet pour les étudiants en génie civil et BTP.",
    coverUrl: "/images/book-genie-civil.jpg",
    available: true,
    totalCopies: 12,
    availableCopies: 8,
    rating: 4.4,
    reviews: [],
    documentType: "texte_imprime",
    specialization: "Génie Civil et BTP",
    language: "Français",
    location: "kamboinse",
  },
  {
    id: "3",
    title: "Énergies renouvelables en Afrique",
    author: "Amadou Hama Maiga",
    genre: "Énergies renouvelables",
    isbn: "978-2-343-12345-6",
    publishedYear: 2019,
    description: "Étude des potentiels énergétiques renouvelables en Afrique de l'Ouest.",
    coverUrl: "/images/book-energie.jpg",
    available: true,
    totalCopies: 6,
    availableCopies: 4,
    rating: 4.7,
    reviews: [],
    documentType: "texte_imprime",
    specialization: "Énergies renouvelables",
    language: "Français",
    location: "kamboinse",
  },
  {
    id: "4",
    title: "Traitement des eaux usées urbaines",
    author: "Sylvie Baig",
    genre: "Assainissement",
    isbn: "978-2-7430-2156-8",
    publishedYear: 2021,
    description: "Techniques modernes de traitement des eaux usées en milieu urbain africain.",
    coverUrl: "/images/book-eau.jpg",
    available: false,
    totalCopies: 4,
    availableCopies: 0,
    rating: 4.3,
    reviews: [],
    documentType: "texte_imprime",
    specialization: "Eau et Assainissement",
    language: "Français",
    location: "kamboinse",
  },
  {
    id: "5",
    title: "Mémoire Master - Étude de faisabilité d'un système d'irrigation solaire",
    author: "Fatou TRAORE",
    genre: "Mémoire",
    isbn: "",
    publishedYear: 2024,
    description: "Mémoire de fin d'études Master en Énergies renouvelables - 2iE 2024.",
    coverUrl: "/images/book-memoire.jpg",
    available: true,
    totalCopies: 1,
    availableCopies: 1,
    rating: 4.5,
    reviews: [],
    documentType: "document_electronique",
    specialization: "Énergies renouvelables",
    language: "Français",
    location: "kamboinse",
  },
  {
    id: "6",
    title: "Gestion intégrée des ressources en eau",
    author: "Mahamadou KOITA",
    genre: "Hydrologie",
    isbn: "978-2-343-15678-9",
    publishedYear: 2022,
    description: "Approches modernes de gestion des ressources hydriques au Sahel.",
    coverUrl: "/images/book-ressources.jpg",
    available: true,
    totalCopies: 7,
    availableCopies: 3,
    rating: 4.8,
    reviews: [],
    documentType: "texte_imprime",
    specialization: "Eau et Assainissement",
    language: "Français",
    location: "kamboinse",
  },
]

export const loans: Loan[] = [
  {
    id: "1",
    bookId: "1",
    userId: "2",
    userName: "Aminata OUEDRAOGO",
    bookTitle: "Hydraulique générale et appliquée",
    loanDate: "2024-12-15",
    dueDate: "2025-01-15",
    status: "active",
    location: "kamboinse",
  },
  {
    id: "2",
    bookId: "4",
    userId: "3",
    userName: "Ibrahim SAWADOGO",
    bookTitle: "Traitement des eaux usées urbaines",
    loanDate: "2024-11-20",
    dueDate: "2024-12-20",
    status: "overdue",
    location: "kamboinse",
  },
]

export const students: Student[] = [
  {
    id: "2",
    name: "Aminata OUEDRAOGO",
    email: "aminata.ouedraogo@2ie-edu.org",
    studentId: "2iE2023045",
    registrationDate: "2023-09-01",
    activeLoans: 1,
    totalLoans: 8,
    specialization: "Eau et Assainissement",
    avatar: "/images/student-avatar-1.jpg",
  },
  {
    id: "3",
    name: "Ibrahim SAWADOGO",
    email: "ibrahim.sawadogo@2ie-edu.org",
    studentId: "2iE2023067",
    registrationDate: "2023-09-01",
    activeLoans: 1,
    totalLoans: 5,
    specialization: "Génie Civil et BTP",
    avatar: "/images/student-avatar-2.jpg",
  },
  {
    id: "4",
    name: "Fatoumata KONE",
    email: "fatoumata.kone@2ie-edu.org",
    studentId: "2iE2024012",
    registrationDate: "2024-09-01",
    activeLoans: 0,
    totalLoans: 3,
    specialization: "Énergies renouvelables",
    avatar: "/images/student-avatar-3.jpg",
  },
]

// Spécialisations 2iE
export const specializations = [
  "Eau et Assainissement",
  "Génie Civil et BTP",
  "Énergies renouvelables",
  "Environnement",
  "Mines et Géologie",
  "Électromécanique",
  "Informatique et Télécommunications",
]

// Types de documents
export const documentTypes = [
  { value: "texte_imprime", label: "Texte imprimé" },
  { value: "document_electronique", label: "Document électronique" },
  { value: "multimedia", label: "Document multimédia" },
  { value: "enregistrement_sonore", label: "Enregistrement sonore" },
]

export const locations = [
  { value: "kamboinse", label: "Bibliothèque Kamboinsé" },
  { value: "ouaga", label: "Bibliothèque Ouaga" },
]
