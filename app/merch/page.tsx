'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import {
  ShoppingBag,
  Sparkles,
  Ticket,
  Flame,
  CheckCircle2,
  Truck,
  ShieldCheck,
  CreditCard,
  X,
  ChevronRight,
  Clock,
  ArrowRight,
} from 'lucide-react'

// ─── Products Data ────────────────────────────────────────────────────────────
export interface MerchProduct {
  id: string
  name: string
  artist: string
  category: 'Apparel' | 'Tickets' | 'Accessories' | 'Collectibles'
  price: string
  priceNum: number
  image: string
  badge: string
  stockStatus: string
  description: string
  sizes?: string[]
  details: string[]
  isTicket?: boolean
  eventDate?: string
  venue?: string
}

const merchProducts: MerchProduct[] = [
  {
    id: 'ethics-hoodie-01',
    name: 'ETHICS Heavyweight Oversized Hoodie',
    artist: 'Ethics Entertainment',
    category: 'Apparel',
    price: 'KES 3,800',
    priceNum: 3800,
    image: '/merch/hoodie.jpg',
    badge: 'Drop 01 Best Seller 🔥',
    stockStatus: 'Only 6 left in stock',
    description:
      'Engineered from 480 GSM ultra-dense French Terry cotton. Features high-density neon orange silicone print on chest, custom metallic eyelets, double-layered hood, and relaxed boxy streetwear drape.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    details: [
      '480 GSM 100% Heavyweight Cotton',
      'High-Density 3D Screenprint',
      'Pre-shrunk Vintage Washed Finish',
      'Custom Ethics Woven Hem Tag',
    ],
  },
  {
    id: 'ethics-vip-ticket-01',
    name: 'ETHICS LIVE // RIENG FEST VIP Backstage Pass',
    artist: 'Ethics Entertainment × RIENG',
    category: 'Tickets',
    price: 'KES 2,500',
    priceNum: 2500,
    image: '/merch/ticket.jpg',
    badge: 'VIP Golden Pass 🎟️',
    stockStatus: 'Limited Batch · Fast Selling',
    description:
      'Official All-Access VIP Pass for Ethics Entertainment Live at RIENG Fest 2026. Includes fast-track express entry, backstage artist lounge access, complimentary welcome drink, and digital commemorative holographic NFT badge.',
    isTicket: true,
    eventDate: 'Saturday, November 14, 2026 · 6:00 PM EAT',
    venue: 'Nairobi Carnivore Grounds (Main Arena)',
    details: [
      'Instant SMS & WhatsApp QR E-Ticket',
      'Backstage Lounge & Dedicated VIP Bar',
      'Priority Stage Front Row Access',
      'Official Lanyard & Physical Badge at Gate',
    ],
  },
  {
    id: 'ethics-vintage-tee-01',
    name: 'ETHICS Vintage Washed Graphic Tee',
    artist: 'Ethics Entertainment',
    category: 'Apparel',
    price: 'KES 2,200',
    priceNum: 2200,
    image: '/merch/tee.jpg',
    badge: 'Street Classic ⚡',
    stockStatus: 'In Stock',
    description:
      'Custom acid-washed 260 GSM single-stitch cotton t-shirt with signature Nairobi Sound distressed typography. Built for ultimate comfort with a drop-shoulder cut and ribbed collar.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    details: [
      '260 GSM Premium Combed Cotton',
      'Hand-Distressed Acid Wash Finish',
      'Reinforced Single-Stitch Construction',
      'Breathable All-Weather Comfort',
    ],
  },
  {
    id: 'rieng-ethics-bomber-01',
    name: 'RIENG × ETHICS Tactical Satin Bomber Jacket',
    artist: 'Ethics Entertainment × RIENG',
    category: 'Apparel',
    price: 'KES 5,500',
    priceNum: 5500,
    image: '/merch/bomber.jpg',
    badge: 'Limited Vault Drop 🏆',
    stockStatus: 'Only 3 left in stock',
    description:
      'High-grade water-resistant flight satin jacket featuring heavy-duty silver YKK zippers, embroidered vibrant orange back crest, utility arm pocket, and custom orange quilted lining.',
    sizes: ['M', 'L', 'XL'],
    details: [
      'Waterproof Flight Satin Shell',
      'Full Orange Quilted Insulation',
      'Custom Chainstitch Embroidered Crest',
      'Heavy-duty YKK Dual Hardware',
    ],
  },
  {
    id: 'ethics-trucker-cap-01',
    name: 'ETHICS 3D Raised Embroidery Trucker Hat',
    artist: 'Ethics Entertainment',
    category: 'Accessories',
    price: 'KES 1,600',
    priceNum: 1600,
    image: '/merch/cap.jpg',
    badge: 'Popular 🧢',
    stockStatus: 'In Stock',
    description:
      'Structured 5-panel curved trucker hat with 3D raised puff embroidery on front, breathable mesh back, contrast visor stitching, and adjustable snapback strap.',
    details: [
      'Structured 5-Panel Profile',
      '3D Puff Embroidery Logo',
      'Heavy-duty Breathable Mesh Back',
      'Universal Snapback Size Adjustment',
    ],
  },
  {
    id: 'ethics-vinyl-lp-01',
    name: 'ETHICS "MASTER CUTS" Translucent Orange Vinyl LP',
    artist: 'Ethics Entertainment',
    category: 'Collectibles',
    price: 'KES 4,200',
    priceNum: 4200,
    image: '/merch/vinyl.jpg',
    badge: 'Numbered 1st Pressing 💿',
    stockStatus: 'Numbered 1 of 200 Copies',
    description:
      'Collector edition 180-gram translucent neon orange 12-inch vinyl LP. Pressed from uncompressed analog 24-bit studio masters. Encased in a matte black soft-touch gatefold jacket with exclusive studio photos and lyric sheet.',
    details: [
      '180g Heavyweight Audiophile Vinyl',
      'Direct-From-Master Analog Audio Cut',
      'Matte Gatefold Jacket with Spot UV Gloss',
      'Numbered Hologram Authentication Sticker',
    ],
  },
]

// ─── Ticker Items ────────────────────────────────────────────────────────────
const merchTicker = [
  'OFFICIAL MERCH STORE',
  'ETHICS ENTERTAINMENT × RIENG RADIO',
  'INSTANT M-PESA CHECKOUT',
  'SAME-DAY NAIROBI DELIVERY',
  'LIMITED RUN DROPS',
  'CONCERT & VIP FESTIVAL TICKETS',
  '100% AUTHENTIC STREETWEAR',
]

export default function MerchPage() {
  const [activeCategory, setActiveCategory] = useState<string>('All')
  const [selectedProduct, setSelectedProduct] = useState<MerchProduct | null>(null)
  const [selectedSize, setSelectedSize] = useState<string>('L')
  const [quantity, setQuantity] = useState<number>(1)
  const [phoneNumber, setPhoneNumber] = useState<string>('')
  const [deliveryLocation, setDeliveryLocation] = useState<string>('')
  const [isCheckingOut, setIsCheckingOut] = useState<boolean>(false)
  const [checkoutStatus, setCheckoutStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string>('')

  const categories = ['All', 'Apparel', 'Tickets', 'Accessories', 'Collectibles']

  const filteredProducts =
    activeCategory === 'All'
      ? merchProducts
      : merchProducts.filter((p) => p.category === activeCategory)

  const handleOpenModal = (product: MerchProduct) => {
    setSelectedProduct(product)
    setSelectedSize(product.sizes ? product.sizes[1] || product.sizes[0] : 'Standard')
    setQuantity(1)
    setCheckoutStatus('idle')
    setErrorMessage('')
    setIsCheckingOut(true)
  }

  const handleCloseModal = () => {
    setIsCheckingOut(false)
    setSelectedProduct(null)
    setCheckoutStatus('idle')
  }

  const handlePaystackCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProduct) return

    const cleanedPhone = phoneNumber.replace(/\s+/g, '')
    if (!/^(07|01|\+2547|\+2541)\d{8,9}$/.test(cleanedPhone)) {
      setErrorMessage('Please enter a valid Kenyan phone number (e.g. 0712345678)')
      return
    }

    if (!selectedProduct.isTicket && !deliveryLocation.trim()) {
      setErrorMessage('Please enter your delivery address / town')
      return
    }

    setErrorMessage('')
    setCheckoutStatus('loading')

    const totalAmount = selectedProduct.priceNum * quantity
    const orderTitle = `${selectedProduct.name} (${selectedProduct.isTicket ? 'E-Ticket' : selectedSize} × ${quantity})`
    const fakeEmail = `${cleanedPhone.replace('+', '')}@riengmerch.co.ke`
    const callbackUrl = `${window.location.origin}/merch?order=success&product=${encodeURIComponent(selectedProduct.id)}`

    try {
      const res = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: fakeEmail,
          amount: totalAmount,
          songTitle: orderTitle,
          songId: selectedProduct.id,
          phone: cleanedPhone,
          callbackUrl,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.authorization_url) {
        throw new Error(data.error || 'Payment gateway initialization failed. Please try again.')
      }

      // Redirect user directly to Paystack for M-Pesa STK push / Card
      window.location.href = data.authorization_url
    } catch (err: any) {
      console.error('Merch checkout error:', err)
      setErrorMessage(err?.message || 'Payment service error. Please try again.')
      setCheckoutStatus('error')
    }
  }

  // Handle return from Paystack redirect
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    if (params.get('order') === 'success') {
      window.history.replaceState({}, '', '/merch')
      setCheckoutStatus('success')
    }
  }, [])

  return (
    <main className="min-h-screen bg-[#050505] selection:bg-primary selection:text-white text-white overflow-x-hidden">
      <Navbar />

      {/* ── HERO BANNER ── */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden border-b border-white/5">
        {/* Glow ambient spheres */}
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-primary/10 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-[500px] h-[500px] bg-red-600/10 blur-[130px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Season Tag */}
          <div className="inline-flex items-center gap-2.5 bg-primary/10 border border-primary/30 text-primary px-4 py-1.5 rounded-full mb-6 shadow-[0_0_20px_rgba(255,107,53,0.2)]">
            <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
            <span className="text-[11px] font-black uppercase tracking-[0.25em]">
              OFFICIAL DROP 01 // ETHICS × RIENG COLLECTION
            </span>
          </div>

          <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black uppercase tracking-tight leading-none mb-6">
            Merch &amp; <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-orange-400 to-red-500 italic pr-2">Tickets</span>
          </h1>

          <p className="text-gray-300 text-lg sm:text-xl md:text-2xl max-w-3xl mx-auto font-medium leading-relaxed mb-10">
            Exclusive streetwear, heavyweight hoodies, vintage acid-washed tees, collector vinyl, and official VIP concert passes for <strong className="text-white">Ethics Entertainment</strong> and RIENG Radio.
          </p>

          {/* Quick Features Highlight */}
          <div className="flex items-center justify-center gap-6 sm:gap-10 flex-wrap text-xs sm:text-sm font-bold text-gray-400">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-primary" />
              <span>Same-Day Nairobi Delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-primary" />
              <span>Instant M-Pesa STK Checkout</span>
            </div>
            <div className="flex items-center gap-2">
              <Ticket className="w-4 h-4 text-primary" />
              <span>Instant WhatsApp QR E-Tickets</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span>100% Official Artist Auth</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── TICKER BAR ── */}
      <div className="w-full overflow-hidden bg-[#080808] border-y border-white/5 py-3.5 flex whitespace-nowrap">
        <div className="marquee-left flex items-center min-w-max">
          {[...merchTicker, ...merchTicker, ...merchTicker].map((tag, i) => (
            <span key={i} className="text-white/30 font-black uppercase tracking-[0.3em] text-xs mx-6 flex items-center gap-6">
              {tag} <span className="w-1.5 h-1.5 bg-primary/60 rounded-full inline-block" />
            </span>
          ))}
        </div>
      </div>

      {/* ── PRODUCTS SECTION ── */}
      <section className="py-20 md:py-28 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header & Filter Tabs */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 pb-8 border-b border-white/5 gap-6">
            <div>
              <span className="text-primary font-black uppercase tracking-[0.35em] text-xs block mb-2 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" />
                Featured Catalog
              </span>
              <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
                Available <span className="text-primary italic">Drops</span>
              </h2>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 flex-wrap bg-[#0a0a0a] p-1.5 rounded-full border border-white/10">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-5 py-2 rounded-full font-black text-xs uppercase tracking-wider transition-all duration-300 ${
                    activeCategory === cat
                      ? 'bg-primary text-white shadow-[0_0_20px_rgba(255,107,53,0.4)]'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="group relative bg-[#080808] border border-white/8 hover:border-primary/40 rounded-3xl overflow-hidden transition-all duration-500 flex flex-col justify-between hover:shadow-[0_15px_50px_rgba(255,107,53,0.12)] hover:-translate-y-1.5"
              >
                {/* Top Image Container */}
                <div className="relative aspect-square w-full overflow-hidden bg-black">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-transparent opacity-80" />

                  {/* Badge */}
                  <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                    <span className="bg-primary/90 backdrop-blur-md text-white font-black text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">
                      {product.badge}
                    </span>
                    <span className="bg-black/60 backdrop-blur-md border border-white/10 text-gray-300 text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                      {product.artist}
                    </span>
                  </div>

                  {/* Stock Indicator */}
                  <div className="absolute bottom-4 right-4 bg-black/75 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-[10px] font-bold text-orange-400">
                    {product.stockStatus}
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-6 sm:p-7 flex flex-col flex-1 justify-between gap-6">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black uppercase text-white tracking-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {product.name}
                    </h3>

                    {product.isTicket && (
                      <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 mb-3 text-xs">
                        <p className="font-black text-primary uppercase tracking-wide">
                          📅 {product.eventDate}
                        </p>
                        <p className="text-gray-300 text-[11px] font-medium mt-0.5">
                          📍 {product.venue}
                        </p>
                      </div>
                    )}

                    <p className="text-gray-400 text-xs sm:text-sm leading-relaxed line-clamp-3 mb-4">
                      {product.description}
                    </p>

                    {/* Features list */}
                    <div className="space-y-1 mb-2">
                      {product.details.slice(0, 2).map((detail, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-[11px] text-gray-300 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                          <span>{detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pricing and Action */}
                  <div className="pt-5 border-t border-white/8 flex items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Price</span>
                      <span className="text-2xl font-black text-white tracking-tight">
                        {product.price}
                      </span>
                    </div>

                    <button
                      onClick={() => handleOpenModal(product)}
                      className="bg-primary hover:bg-white text-white hover:text-black transition-all duration-300 px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-[0_0_20px_rgba(255,107,53,0.3)] hover:scale-105"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      {product.isTicket ? 'Get Ticket' : 'Buy Now'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ETHICS SPOTLIGHT BANNER ── */}
      <section className="py-20 border-t border-white/5 bg-gradient-to-r from-primary/10 via-[#080808] to-black relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="border border-primary/30 rounded-[2.5rem] p-8 sm:p-14 bg-black/60 backdrop-blur-2xl relative overflow-hidden shadow-[0_0_80px_rgba(255,107,53,0.15)] flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-primary/20 border border-primary/40 text-primary px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-4">
                <Flame className="w-3.5 h-3.5" /> Exclusive Artist Collab
              </div>
              <h3 className="text-3xl sm:text-5xl font-black uppercase text-white tracking-tight mb-4">
                Official <span className="text-primary italic">Ethics Entertainment</span> Merch Line
              </h3>
              <p className="text-gray-300 text-base sm:text-lg leading-relaxed mb-6">
                All sales directly support the creators. Delivered in premium custom vacuum-sealed packaging with authenticity certificates and exclusive sticker packs.
              </p>
              <div className="flex items-center gap-6 text-sm font-bold text-gray-400 flex-wrap">
                <span>✓ M-Pesa STK Instant Checkout</span>
                <span>✓ WhatsApp Support Line</span>
                <span>✓ Exchanges Guaranteed</span>
              </div>
            </div>

            <div className="flex-shrink-0">
              <Link
                href="/ethics"
                className="bg-white hover:bg-primary text-black hover:text-white px-8 py-4 rounded-full font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-2xl transition-all hover:scale-105"
              >
                Visit Ethics Partner Page <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── CHECKOUT MODAL ── */}
      {isCheckingOut && selectedProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/15 rounded-[2.5rem] p-6 sm:p-10 shadow-[0_0_120px_rgba(255,107,53,0.25)] max-h-[90vh] overflow-y-auto">
            
            {/* Close Button */}
            <button
              onClick={handleCloseModal}
              className="absolute top-6 right-6 w-9 h-9 rounded-full bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-white flex items-center justify-center transition-colors border border-white/10"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/10">
              <div className="relative w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 border border-white/10">
                <Image src={selectedProduct.image} alt={selectedProduct.name} fill className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary block mb-0.5">
                  {selectedProduct.artist}
                </span>
                <h3 className="text-lg font-black uppercase text-white truncate">
                  {selectedProduct.name}
                </h3>
                <p className="text-xl font-black text-primary">
                  {selectedProduct.price}
                </p>
              </div>
            </div>

            {/* Checkout Form */}
            <form onSubmit={handlePaystackCheckout} className="space-y-5">
              {/* Size Selector for Apparel */}
              {selectedProduct.sizes && (
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-2">
                    Select Size:
                  </label>
                  <div className="flex items-center gap-2 flex-wrap">
                    {selectedProduct.sizes.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`w-11 h-11 rounded-xl font-black text-xs uppercase transition-all ${
                          selectedSize === size
                            ? 'bg-primary text-white border-2 border-primary shadow-[0_0_15px_rgba(255,107,53,0.5)]'
                            : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-2">
                  Quantity:
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 font-black text-sm text-white hover:bg-white/10"
                  >
                    -
                  </button>
                  <span className="font-black text-lg text-white w-8 text-center">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 font-black text-sm text-white hover:bg-white/10"
                  >
                    +
                  </button>
                  <span className="text-xs text-gray-400 ml-auto font-bold">
                    Total: <strong className="text-white text-base">KES {(selectedProduct.priceNum * quantity).toLocaleString()}</strong>
                  </span>
                </div>
              </div>

              {/* M-Pesa Phone Number */}
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-1.5">
                  M-Pesa Phone Number:
                </label>
                <input
                  type="text"
                  placeholder="e.g. 0712345678"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                  className="w-full bg-[#121212] border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary placeholder:text-gray-600 font-semibold"
                />
              </div>

              {/* Delivery Address if physical item */}
              {!selectedProduct.isTicket ? (
                <div>
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-1.5">
                    Delivery Address / Nairobi Estate / Town:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Kilimani, Nairobi or Thika Road"
                    value={deliveryLocation}
                    onChange={(e) => setDeliveryLocation(e.target.value)}
                    required
                    className="w-full bg-[#121212] border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary placeholder:text-gray-600 font-semibold"
                  />
                </div>
              ) : (
                <div className="bg-primary/10 border border-primary/20 rounded-xl p-3.5 text-xs text-gray-300">
                  <p className="font-black text-primary uppercase mb-1">🎟️ Instant Digital Delivery</p>
                  <p>Your VIP QR Code E-Ticket will be generated and dispatched to your phone via SMS &amp; WhatsApp immediately after payment.</p>
                </div>
              )}

              {/* Error Notification */}
              {errorMessage && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-bold">
                  {errorMessage}
                </div>
              )}

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={checkoutStatus === 'loading'}
                className="w-full bg-primary hover:bg-white text-white hover:text-black py-4 rounded-full font-black text-sm uppercase tracking-widest transition-all shadow-[0_0_30px_rgba(255,107,53,0.35)] flex items-center justify-center gap-2 mt-6"
              >
                {checkoutStatus === 'loading' ? (
                  <span>Initializing M-Pesa STK Push...</span>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Pay KES {(selectedProduct.priceNum * quantity).toLocaleString()} via M-Pesa / Card</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </main>
  )
}
