import { useState } from 'react'
import ChatPanel from '../components/ChatPanel'
import '../styles/browser.css'

type Product = {
  id: number
  name: string
  price: string
  category: string
  tag: string
}

export default function Browse() {
  const [showChat, setShowChat] = useState(false)

  const products: Product[] = [
    {
      id: 1,
      name: 'Lumen Desk Lamp',
      price: '$98',
      category: 'Lighting',
      tag: 'Best Seller'
    },
    {
      id: 2,
      name: 'Harbor Sofa',
      price: '$1,240',
      category: 'Living',
      tag: 'New'
    },
    {
      id: 3,
      name: 'Slate Coffee Table',
      price: '$420',
      category: 'Living',
      tag: 'Limited'
    },
    {
      id: 4,
      name: 'Arc Wall Mirror',
      price: '$160',
      category: 'Decor',
      tag: 'Popular'
    },
    {
      id: 5,
      name: 'Studio Task Chair',
      price: '$280',
      category: 'Office',
      tag: 'Ergonomic'
    },
    {
      id: 6,
      name: 'Cloud Bedside Table',
      price: '$190',
      category: 'Bedroom',
      tag: 'Soft Touch'
    }
  ]

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
        <input type="text" placeholder="Search products..." className="browser-search" />
        <div className="browser-chips">
          <button type="button" className="browser-chip">All</button>
          <button type="button" className="browser-chip">Living</button>
          <button type="button" className="browser-chip">Lighting</button>
          <button type="button" className="browser-chip">Office</button>
          <button type="button" className="browser-chip">Decor</button>
        </div>
        <button type="button" onClick={() => setShowChat(true)} className="browser-help">
          Ask AI for help
        </button>
      </section>

      <section className={layoutClass}>
        <div className={gridClass}>
          {products.map((product) => (
            <article key={product.id} className="product-card">
              <div className="product-media">Product Image</div>
              <div className="product-meta">
                <div className="product-title-row">
                  <h3 className="product-title">{product.name}</h3>
                  <span className="product-price">{product.price}</span>
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
