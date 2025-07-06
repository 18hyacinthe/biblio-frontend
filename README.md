# CDI 2iE - Plateforme de Gestion de Bibliothèque

## 📚 Description

Plateforme web moderne de gestion de bibliothèque pour le Centre de Documentation et d'Information (CDI) de l'Institut International d'Ingénierie de l'Eau et de l'Environnement (2iE) au Burkina Faso. Cette application permet aux étudiants de rechercher, consulter et emprunter des ouvrages spécialisés en ingénierie, eau et environnement.


## 🏛️ À propos de 2iE

L'Institut International d'Ingénierie de l'Eau et de l'Environnement (2iE) est une institution d'enseignement supérieur et de recherche basée au Burkina Faso, spécialisée dans la formation d'ingénieurs en :
- Eau et Assainissement
- Génie Civil et BTP
- Énergies renouvelables
- Environnement
- Mines et Géologie
- Électromécanique
- Informatique et Télécommunications

## ✨ Fonctionnalités

### Pour les Étudiants 2iE
- 🔐 Connexion avec identifiants 2iE
- 🔍 Recherche spécialisée par domaine d'ingénierie
- 📖 Consultation du catalogue (plus de 27 000 ouvrages)
- 📅 Gestion des emprunts personnels
- 🏢 Accès aux deux bibliothèques (Kamboinsé et Ouaga)
- 📱 Interface responsive adaptée aux mobiles

### Pour les Administrateurs CDI
- 👥 Gestion des comptes étudiants 2iE
- 📚 Gestion complète du catalogue spécialisé
- 📊 Statistiques par spécialisation et bibliothèque
- 🚨 Suivi des retards d'emprunt
- 📋 Gestion des emprunts multi-sites

## 🛠️ Technologies Utilisées

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Authentification**: Context API React
- **Icons**: Lucide React
- **Design**: Mobile-first, responsive

## 🏢 Bibliothèques CDI 2iE

### CDI-Kamboinsé
- Campus principal de 2iE
- Collections générales et spécialisées
- Mémoires et thèses 2iE
- Ressources numériques

### CDI-Ouaga
- Campus Ouagadougou
- Collections de proximité
- Accès facilité pour les étudiants en ville

## 🚀 Installation et Démarrage

### Prérequis
- Node.js 18+
- npm ou yarn

### Installation
\`\`\`bash
# Cloner le repository
git clone https://github.com/2ie-edu/cdi-2ie-platform.git

# Naviguer dans le dossier
cd cdi-2ie-platform

# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev
\`\`\`

L'application sera accessible sur \`http://localhost:3000\`

## 👤 Comptes de Test

### Administrateur CDI
- **Email**: admin@2ie-edu.org
- **Mot de passe**: admin123

### Étudiant 2iE
- Créez un nouveau compte avec un email @2ie-edu.org
- Ou utilisez n'importe quel email pour la démonstration

## 📁 Structure du Projet

\`\`\`
cdi-2ie-platform/
├── app/
│   ├── admin/
│   │   ├── dashboard/
│   │   └── books/
│   ├── student/
│   │   └── dashboard/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   └── ui/
├── lib/
│   ├── auth-context.tsx
│   ├── data.ts
│   └── utils.ts
└── README.md
\`\`\`

## 📚 Spécialisations Couvertes

- **Eau et Assainissement**: Hydraulique, traitement des eaux, assainissement urbain
- **Génie Civil et BTP**: Construction, infrastructures, matériaux
- **Énergies renouvelables**: Solaire, éolien, biomasse, efficacité énergétique
- **Environnement**: Gestion environnementale, changement climatique
- **Mines et Géologie**: Exploration minière, géotechnique
- **Électromécanique**: Systèmes électriques, maintenance industrielle
- **Informatique et Télécommunications**: Systèmes d'information, réseaux

## 🔧 Fonctionnalités Techniques

### Recherche Avancée
- Recherche par titre, auteur, spécialisation
- Filtres par type de document
- Filtres par bibliothèque (Kamboinsé/Ouaga)
- Recherche dans les mémoires et thèses 2iE

### Gestion Multi-Sites
- Gestion séparée des collections par site
- Suivi des emprunts par bibliothèque
- Statistiques par localisation

### Types de Documents
- Textes imprimés (livres, manuels)
- Documents électroniques (PDF, e-books)
- Documents multimédias (vidéos, présentations)
- Mémoires et thèses 2iE

## 🎯 Fonctionnalités Spécifiques 2iE

### Implémentées
- ✅ Catalogue spécialisé par domaine d'ingénierie
- ✅ Gestion multi-sites (Kamboinsé/Ouaga)
- ✅ Interface en français (langue principale)
- ✅ Recherche par spécialisation 2iE
- ✅ Gestion des mémoires de fin d'études

### À Développer
- 📧 Notifications par email @2ie-edu.org
- 🔄 Intégration avec le système d'information 2iE
- 📊 Rapports statistiques avancés
- 🌐 Accès aux ressources numériques externes
- 📱 Application mobile dédiée

## 🤝 Contribution

1. Fork le projet
2. Créez une branche pour votre fonctionnalité (\`git checkout -b feature/NouvelleFonctionnalite\`)
3. Committez vos changements (\`git commit -m 'Ajout nouvelle fonctionnalité'\`)
4. Push vers la branche (\`git push origin feature/NouvelleFonctionnalite\`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est développé pour l'Institut International d'Ingénierie de l'Eau et de l'Environnement (2iE).

## 👨‍💻 Développement

Développé dans le cadre du projet de modernisation du système de gestion documentaire du CDI 2iE.

## 📞 Contact

**Centre de Documentation et d'Information - 2iE**
- Email: cdi@2ie-edu.org
- Site web: https://www.2ie-edu.org
- Adresse: 01 BP 594 Ouagadougou 01, Burkina Faso

---

*Institut International d'Ingénierie de l'Eau et de l'Environnement - Excellence en formation d'ingénieurs pour l'Afrique*
