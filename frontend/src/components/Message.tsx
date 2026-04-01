export type Message = {
  role: 'user' | 'ai'
  content: string
  imageUrl?: string
}
