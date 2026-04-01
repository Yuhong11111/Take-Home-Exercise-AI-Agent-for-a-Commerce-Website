import { useEffect, useMemo, useState } from 'react'
import ChatPanel from '../components/ChatPanel'
import '../styles/browser.css'
import axios from 'axios'

type Product = {
  id: number
  name: string
  price: number
  category: string
  tag: string
  image_url?: string | null
}

export default function Browse() {
  const [showChat, setShowChat] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')

  // Fetch products on mount
  useEffect(() => {
    let mounted = true
    async function fetchProducts() {
      try {
        const res = await axios.get<Product[]>('http://localhost:8000/products')
        if (mounted) setProducts(res.data)
      } catch (err) {
        console.error('Failed to load products', err)
      }
    }
    fetchProducts()
    return () => {
      mounted = false
    }
  }, [])

  // Derive unique categories from products for filter chips
  const categories = useMemo(() => {
    const unique = new Set(products.map((p) => p.category))
    return ['All', ...Array.from(unique)]
  }, [products])

  // Filter products based on active category and search term
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // check if product matches active category (or if "All" is selected) and if it matches the search term in name or tag
      const matchesCategory = activeCategory === 'All' || product.category === activeCategory
      const matchesSearch =
        !search.trim() ||
        product.name.toLowerCase().includes(search.trim().toLowerCase()) ||
        product.tag.toLowerCase().includes(search.trim().toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [activeCategory, products, search])

  // Format currency
  const currency = useMemo(
    () =>
      new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
      }),
    []
  )

  // Determine layout classes based on whether chat is open
  const layoutClass = showChat ? 'browser-layout browser-layout--split' : 'browser-layout'
  const gridClass = showChat ? 'product-grid product-grid--single' : 'product-grid'

  return (
    <div className="browser-page">
      <header className="browser-hero">
        <p className="browser-eyebrow">Shopping Browser</p>
        <h1 className="browser-title">Browse the collection</h1>
        <p className="browser-subtitle">
          Curated essentials across lighting, living, and workspace. Use filters to refine your browse.
        </p>
      </header>

      <section className="browser-toolbar">
        <input
          type="text"
          placeholder="Search products..."
          className="browser-search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="browser-chips">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={`browser-chip${activeCategory === category ? ' browser-chip--active' : ''}`}
              onClick={() => setActiveCategory(category)} // Toggle category filter on click
            >
              {category}
            </button>
          ))}
        </div>
        <button type="button" onClick={() => setShowChat(true)} className="browser-help">
          Ask AI for help
        </button>
      </section>

      <section className={layoutClass}>
        <div className={gridClass}>
          {filteredProducts.map((product) => (
            <article key={product.id} className="product-card">
              <div className="product-media">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} />
                ) : (
                  'Product Image'
                )}
              </div>
              <div className="product-meta">
                <div className="product-title-row">
                  <h3 className="product-title">{product.name}</h3>
                  <span className="product-price">{currency.format(product.price)}</span>
                </div>
                <p className="product-category">{product.category}</p>
                <span className="product-tag">{product.tag}</span>
              </div>
              <button type="button" className="product-action">
                View details
              </button>
            </article>
          ))}
        </div>

        {showChat && (
          <div className="browser-chat">
            <ChatPanel title="Need help narrowing it down?" onClose={() => setShowChat(false)} />
          </div>
        )}
      </section>
    </div>
  )
}
