import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('cover') as File
    const bookTitle = formData.get('bookTitle') as string

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'Aucun fichier fourni' },
        { status: 400 }
      )
    }

    // Validation du type de fichier
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: 'Type de fichier non supporté' },
        { status: 400 }
      )
    }

    // Validation de la taille (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, message: 'Fichier trop volumineux (max 5MB)' },
        { status: 400 }
      )
    }

    // Créer le répertoire uploads s'il n'existe pas
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'book-covers')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Générer un nom de fichier unique
    const timestamp = Date.now()
    const cleanTitle = bookTitle
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 50)
    
    const fileExtension = file.name.split('.').pop()
    const fileName = `${cleanTitle}-${timestamp}.${fileExtension}`
    const filePath = join(uploadsDir, fileName)

    // Convertir le fichier en buffer et l'écrire
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Retourner l'URL de l'image
    const imageUrl = `/uploads/book-covers/${fileName}`

    return NextResponse.json({
      success: true,
      message: 'Image uploadée avec succès',
      imageUrl
    })

  } catch (error) {
    console.error('Erreur upload image:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur serveur lors de l\'upload' },
      { status: 500 }
    )
  }
}
