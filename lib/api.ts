const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Fonction utilitaire pour les requêtes API
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Récupérer le token depuis localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Erreur API');
    }

    return data;
  } catch (error) {
    console.error('Erreur API:', error);
    throw error;
  }
};

// Services d'authentification
export const authAPI = {
  // Connexion
  login: async (email: string, password: string) => {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.token) {
      localStorage.setItem('token', response.token);
    }
    
    return response;
  },

  // Inscription
  register: async (userData: {
    name: string;
    email: string;
    password: string;
    studentId: string;
    specialization: string;
  }) => {
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (response.token) {
      localStorage.setItem('token', response.token);
    }
    
    return response;
  },

  // Vérifier le token
  me: async () => {
    return await apiRequest('/auth/me');
  },

  // Déconnexion
  logout: async () => {
    localStorage.removeItem('token');
    return await apiRequest('/auth/logout', {
      method: 'POST',
    });
  },
};

// Services des livres
export const booksAPI = {
  // Récupérer tous les livres
  getAll: async (params?: {
    search?: string;
    specialization?: string;
    location?: string;
    page?: number;
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.specialization) queryParams.append('specialization', params.specialization);
    if (params?.location) queryParams.append('location', params.location);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const endpoint = `/books${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiRequest(endpoint);
    return response.books || [];
  },

  // Récupérer un livre par ID
  getById: async (id: string) => {
    return await apiRequest(`/books/${id}`);
  },

  // Créer un livre (admin)
  create: async (bookData: {
    title: string;
    author: string;
    isbn?: string;
    specialization: string;
    totalCopies?: number;
    location?: string;
    description?: string;
  }) => {
    return await apiRequest('/books', {
      method: 'POST',
      body: JSON.stringify(bookData),
    });
  },

  // Modifier un livre (admin)
  update: async (id: string, bookData: any) => {
    return await apiRequest(`/books/${id}`, {
      method: 'PUT',
      body: JSON.stringify(bookData),
    });
  },

  // Supprimer un livre (admin)
  delete: async (id: string) => {
    return await apiRequest(`/books/${id}`, {
      method: 'DELETE',
    });
  },
};

// Services des emprunts
export const loansAPI = {
  // Récupérer mes emprunts
  getMy: async () => {
    const response = await apiRequest('/loans/my');
    return response.loans || [];
  },

  // Récupérer tous les emprunts (admin)
  getAll: async (params?: { status?: string; page?: number; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const endpoint = `/loans${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiRequest(endpoint);
    return response.loans || [];
  },

  // Créer un emprunt
  create: async (bookId: string, dueDate?: string) => {
    return await apiRequest('/loans', {
      method: 'POST',
      body: JSON.stringify({ bookId, dueDate }),
    });
  },

  // Retourner un livre
  return: async (loanId: string) => {
    return await apiRequest(`/loans/${loanId}/return`, {
      method: 'PUT',
    });
  },
};

// Services des réservations
export const reservationsAPI = {
  // Récupérer mes réservations
  getMy: async () => {
    return await apiRequest('/reservations');
  },

  // Récupérer toutes les réservations (admin)
  getAll: async () => {
    return await apiRequest('/reservations/admin/all');
  },

  // Créer une réservation
  create: async (bookId: string) => {
    return await apiRequest('/reservations', {
      method: 'POST',
      body: JSON.stringify({ bookId }),
    });
  },

  // Annuler une réservation
  cancel: async (reservationId: string) => {
    return await apiRequest(`/reservations/${reservationId}`, {
      method: 'DELETE',
    });
  },
};

// Service de recherche
export const searchAPI = {
  search: async (query: string, filters?: {
    type?: 'title' | 'author' | 'keyword';
    specialization?: string;
    location?: string;
  }) => {
    const params = new URLSearchParams();
    params.append('search', query);
    if (filters?.specialization) params.append('specialization', filters.specialization);
    if (filters?.location) params.append('location', filters.location);

    return await apiRequest(`/books?${params.toString()}`);
  },
};

export default {
  auth: authAPI,
  books: booksAPI,
  loans: loansAPI,
  reservations: reservationsAPI,
  search: searchAPI,
};
