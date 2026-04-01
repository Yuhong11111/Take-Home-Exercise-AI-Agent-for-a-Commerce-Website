export type Product = {
  id: number
  name: string
  price: number
  category: string
  tag: string
  image_url?: string | null
}

export type Message = {
  role: 'user' | 'ai'
  content: string
  imageUrl?: string
  products?: Product[]
}
