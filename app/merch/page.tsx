'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import {
  ShoppingBag,
  CheckCircle2,
  X,
  CreditCard,
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
  tag: string
  stockStatus: string
  desc: string
  sizes?: string[]
  details: string[]
  isTicket?: boolean
  eventDate?: string
  venue?: string
  materialOrType: string
}

export const merchList: MerchProduct[] = [
  {
    id: 'kapitani-kitemeo-tee-01',
    name: 'KAPITANI "KITEMEO" Vintage Washed Tee',
    artist: 'Kapitani',
    category: 'Apparel',
    price: 'KES 2,200',
    priceNum: 2200,
    image: '/merch/kapitani-kitemeo-tee.png',
    tag: 'New Artist Drop 🌟',
    stockStatus: 'First Run · In Stock',
    desc: 'A heavyweight acid-washed tee built around Kapitani\'s Kitemeo era. The relaxed drop-shoulder cut, bold orange artwork, and soft broken-in finish bring the track\'s street energy into an everyday piece.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    materialOrType: '260 GSM Cotton · Acid Wash',
    details: [
      '260 GSM Premium Combed Cotton',
      'Kitemeo Front Graphic',
      'Relaxed Drop-Shoulder Fit',
      'Reinforced Ribbed Collar',
    ],
  },
  {
    id: 'kapitani-control-hoodie-01',
    name: 'KAPITANI "CONTROL" Heavyweight Hoodie',
    artist: 'Kapitani',
    category: 'Apparel',
    price: 'KES 3,800',
    priceNum: 3800,
    image: '/merch/kapitani-control-hoodie.png',
    tag: 'Kapitani Capsule 🔥',
    stockStatus: 'Limited First Run',
    desc: 'Dense French Terry, a double-layer hood, and vivid orange Kapitani embroidery give this oversized hoodie a clean but unmistakable presence. Designed as the anchor piece of the Control capsule.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    materialOrType: '480 GSM Cotton · Oversized Fit',
    details: [
      '480 GSM Heavyweight French Terry',
      'Raised Kapitani Chest Embroidery',
      'Double-Layered Structured Hood',
      'Pre-shrunk Relaxed Street Fit',
    ],
  },
  {
    id: 'kapitani-trucker-cap-01',
    name: 'KAPITANI Raised Embroidery Trucker Cap',
    artist: 'Kapitani',
    category: 'Accessories',
    price: 'KES 1,600',
    priceNum: 1600,
    image: '/merch/kapitani-trucker-cap.png',
    tag: 'Fresh Drop 🧢',
    stockStatus: 'In Stock',
    desc: 'A structured five-panel cap with raised Kapitani lettering, contrast orange stitching, a breathable mesh back, and an adjustable snap closure for an easy everyday fit.',
    materialOrType: '5-Panel Structured · Snapback',
    details: [
      'Raised Puff Embroidery',
      'Brushed Cotton Twill Front',
      'Breathable Mesh Back',
      'Adjustable Snapback Closure',
    ],
  },
  {
    id: 'ethics-hoodie-01',
    name: 'ETHICS Heavyweight Oversized Hoodie',
    artist: 'Ethics Entertainment',
    category: 'Apparel',
    price: 'KES 3,800',
    priceNum: 3800,
    image: '/merch/hoodie.jpg',
    tag: 'Best Seller 🔥',
    stockStatus: 'Only 6 Left in Stock',
    desc: 'Engineered from 480 GSM ultra-dense French Terry cotton. Features high-density neon orange silicone typography on chest, custom metallic hardware, double-layered hood, and relaxed boxy streetwear drape.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    materialOrType: '480 GSM Cotton · Street Fit',
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
    tag: 'VIP Access 🎟️',
    stockStatus: 'Limited Batch · Fast Selling',
    desc: 'Official All-Access VIP Pass for Ethics Entertainment Live at RIENG Fest 2026. Includes fast-track express entry, backstage artist lounge access, complimentary drink voucher, and digital holographic QR ticket.',
    isTicket: true,
    eventDate: 'Saturday, November 14, 2026 · 6:00 PM EAT',
    venue: 'Nairobi Carnivore Grounds (Main Arena)',
    materialOrType: 'All-Access VIP Pass · Nairobi Arena',
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
    tag: 'Street Classic ⚡',
    stockStatus: 'In Stock',
    desc: 'Custom acid-washed 260 GSM single-stitch cotton t-shirt with signature Nairobi Sound distressed typography. Built for ultimate comfort with a drop-shoulder cut and reinforced ribbed collar.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    materialOrType: '260 GSM Combed Cotton · Acid Wash',
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
    tag: 'Vault Limited 🏆',
    stockStatus: 'Only 3 Left in Stock',
    desc: 'High-grade water-resistant flight satin jacket featuring heavy-duty silver dual zippers, custom vibrant orange chainstitch embroidered crest, utility arm zip pocket, and quilted insulation.',
    sizes: ['M', 'L', 'XL'],
    materialOrType: 'Water-Resistant Satin · Quilted',
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
    tag: 'Trending 🧢',
    stockStatus: 'In Stock',
    desc: 'Structured 5-panel curved trucker hat with 3D raised puff embroidery on front, breathable heavy-duty mesh back, contrast visor stitching, and adjustable snapback closure.',
    materialOrType: '5-Panel Structured · Snapback',
    details: [
      'Structured 5-Panel Profile',
      '3D Puff Embroidery Logo',
      'Heavy-duty Breathable Mesh Back',
      'Universal Snapback Size Adjustment',
    ],
  },
  {
    id: 'ethics-vinyl-lp-01',
    name: 'ETHICS "MASTER CUTS" Neon Orange Marbled Vinyl LP',
    artist: 'Ethics Entertainment',
    category: 'Collectibles',
    price: 'KES 4,200',
    priceNum: 4200,
    image: '/merch/vinyl.jpg',
    tag: '1st Pressing 💿',
    stockStatus: 'Numbered 1 of 200 Copies',
    desc: 'Collector edition 180-gram translucent neon orange 12-inch vinyl LP pressed directly from uncompressed 24-bit analog master studio tapes. Encased in a soft-touch matte black gatefold sleeve with lyric booklet.',
    materialOrType: '180g Audiophile Vinyl · Gatefold',
    details: [
      '180g Heavyweight Audiophile Vinyl',
      'Direct-From-Master Analog Audio Cut',
      'Matte Gatefold Jacket with Spot UV Gloss',
      'Numbered Hologram Authentication Sticker',
    ],
  },
]

// ─── Ticker Items ────────────────────────────────────────────────────────────
const merchTickerTags = [
  'OFFICIAL MERCH STORE',
  'KAPITANI × RIENG RADIO',
  'KITEMEO CAPSULE · OUT NOW',
  'ETHICS ENTERTAINMENT × RIENG RADIO',
  'HEAVYWEIGHT STREETWEAR',
  'INSTANT M-PESA CHECKOUT',
  'VIP CONCERT PASSES & TICKETS',
  'SAME-DAY NAIROBI DELIVERY',
  'LIMITED 1ST PRESSING VINYL',
  '100% GENUINE AUTHENTIC DROPS',
]

// ─── Animated Counter Hook ────────────────────────────────────────────────────
function useCounter(target: number, duration = 1800) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true
        const step = target / (duration / 16)
        let current = 0
        const timer = setInterval(() => {
          current += step
          if (current >= target) {
            setCount(target)
            clearInterval(timer)
          } else {
            setCount(Math.floor(current))
          }
        }, 16)
      }
    }, { threshold: 0.5 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target, duration])

  return { count, ref }
}

// ─── Stat Card Component ──────────────────────────────────────────────────────
function StatCard({ value, suffix, label, color }: { value: number; suffix: string; label: string; color: string }) {
  const { count, ref } = useCounter(value)
  return (
    <div ref={ref} className="group relative bg-[#080808] border border-white/5 rounded-[1.5rem] p-8 overflow-hidden hover:border-primary/30 transition-all duration-500 hover:shadow-[0_0_40px_rgba(255,107,53,0.08)]">
      <div className={`absolute top-0 right-0 w-32 h-32 ${color} blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity rounded-full pointer-events-none`}></div>
      <p className="text-5xl md:text-6xl font-black text-white tracking-tighter leading-none mb-2">
        {count.toLocaleString()}<span className="text-primary">{suffix}</span>
      </p>
      <p className="text-gray-500 font-bold uppercase tracking-[0.2em] text-xs">{label}</p>
    </div>
  )
}

// ─── Waveform Bar Component ──────────────────────────────────────────────────
function WaveformBars() {
  return (
    <div className="flex items-end gap-[3px] h-8">
      {[3, 6, 9, 5, 8, 4, 10, 7, 3, 9, 6, 4, 8, 5, 10, 3, 7, 9, 4, 6].map((h, i) => (
        <div
          key={i}
          className="w-1 bg-primary rounded-full opacity-70"
          style={{
            height: `${h * 10}%`,
            animation: `wave ${0.6 + (i % 5) * 0.15}s ease-in-out ${i * 0.05}s infinite alternate`,
          }}
        />
      ))}
    </div>
  )
}

export default function MerchPage() {
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null)
  const [selectedArtist, setSelectedArtist] = useState<'All' | 'Kapitani' | 'Ethics Entertainment'>('All')
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'Apparel' | 'Tickets' | 'Accessories' | 'Collectibles'>('All')
  const [selectedProduct, setSelectedProduct] = useState<MerchProduct | null>(null)
  const [selectedSize, setSelectedSize] = useState<string>('L')
  const [quantity, setQuantity] = useState<number>(1)
  const [phoneNumber, setPhoneNumber] = useState<string>('')
  const [deliveryLocation, setDeliveryLocation] = useState<string>('')
  const [checkoutStatus, setCheckoutStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string>('')

  const categories = ['All', 'Apparel', 'Tickets', 'Accessories', 'Collectibles'] as const
  const artists = ['All', 'Kapitani', 'Ethics Entertainment'] as const

  const filteredProducts = merchList.filter((product) => {
    const matchesCategory = selectedFilter === 'All' || product.category === selectedFilter
    const matchesArtist = selectedArtist === 'All' || product.artist.includes(selectedArtist)
    return matchesCategory && matchesArtist
  })

  const handleOpenBuyModal = (product: MerchProduct) => {
    setSelectedProduct(product)
    setSelectedSize(product.sizes ? product.sizes[1] || product.sizes[0] : 'Standard')
    setQuantity(1)
    setPhoneNumber('')
    setDeliveryLocation('')
    setCheckoutStatus('idle')
    setErrorMessage('')
  }

  const handleCloseBuyModal = () => {
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
      setErrorMessage('Please enter your delivery location or town')
      return
    }

    setErrorMessage('')
    setCheckoutStatus('loading')

    const totalAmount = selectedProduct.priceNum * quantity
    const orderTitle = `${selectedProduct.name} (${selectedProduct.isTicket ? 'VIP Ticket' : selectedSize} × ${quantity})`
    const fakeEmail = `${cleanedPhone.replace('+', '')}@riengmerch.co.ke`
    const callbackUrl = `${window.location.origin}/merch?payment=success&product=${encodeURIComponent(selectedProduct.id)}`

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
        throw new Error(data.error || 'Could not initialize payment gateway. Please check connection.')
      }

      window.location.href = data.authorization_url
    } catch (err: any) {
      console.error('Checkout error:', err)
      setErrorMessage(err?.message || 'Payment service error. Please try again.')
      setCheckoutStatus('error')
    }
  }

  // Handle return from Paystack redirect
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    if (params.get('payment') === 'success') {
      window.history.replaceState({}, '', '/merch')
      setCheckoutStatus('success')
    }
  }, [])

  return (
    <main className="min-h-screen bg-[#050505] selection:bg-primary selection:text-white overflow-x-hidden">
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative pt-28 pb-20 overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-primary/5 blur-[140px] rounded-full pointer-events-none"></div>
        
        {/* Animated slide lines */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute h-px bg-gradient-to-r from-transparent via-primary/10 to-transparent w-full"
              style={{
                top: `${20 + i * 20}%`,
                animation: `slideLine ${3 + i}s ease-in-out ${i * 0.5}s infinite alternate`,
              }}
            ></div>
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row gap-12 items-end">
            <div className="flex-1">
              <p className="text-primary font-black uppercase tracking-[0.4em] text-xs mb-5 flex items-center gap-3">
                <span className="w-8 h-px bg-primary inline-block"></span>
                RIENG MERCH &amp; TICKET STORE
              </p>
              <h1 className="text-6xl md:text-8xl lg:text-[9rem] font-black text-white uppercase tracking-tighter leading-[0.85] mb-8">
                Merch<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400 italic pr-4">
                  &amp; Tickets
                </span>
              </h1>
              <p className="text-gray-400 text-lg md:text-xl max-w-2xl font-medium border-l-4 border-primary pl-6 mb-8 leading-relaxed">
                Official artist drops from <strong className="text-white">Kapitani</strong> and <strong className="text-white">Ethics Entertainment</strong>, brought together by RIENG Radio.
              </p>

              {/* Quick Actions */}
              <div className="flex items-center gap-4 flex-wrap">
                <a
                  href="#merch-catalog"
                  onClick={() => setSelectedArtist('Kapitani')}
                  className="relative bg-primary hover:bg-white text-white hover:text-black transition-all duration-300 px-8 py-4 rounded-full font-black uppercase tracking-widest text-xs flex items-center gap-3 shadow-[0_0_30px_rgba(255,107,53,0.3)] hover:shadow-[0_0_40px_rgba(255,107,53,0.5)] transform hover:-translate-y-0.5"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse"></span>
                  Shop Kapitani Capsule →
                </a>
                <span className="text-white/40 text-xs font-bold uppercase tracking-wider bg-white/5 border border-white/10 px-5 py-4 rounded-full">
                  100% Verified Streetwear
                </span>
              </div>
            </div>

            {/* Live Streaming Badge & Waveform Widget */}
            <div className="flex flex-col items-end gap-4">
              <div className="bg-[#080808] border border-white/5 rounded-2xl px-6 py-5 flex items-center gap-5">
                <div className="flex flex-col">
                  <span className="text-white/30 text-[10px] font-black uppercase tracking-widest mb-1">Live Store</span>
                  <span className="text-white font-black text-sm">Kapitani Capsule Live 🔥</span>
                </div>
                <WaveformBars />
              </div>
              <div className="flex gap-3 flex-wrap justify-end">
                <span className="bg-primary/10 border border-primary/20 text-primary text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest">
                  {merchList.length} Official Items
                </span>
                <span className="bg-orange-500/15 border border-orange-500/30 text-orange-400 text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-ping inline-block"></span>
                  M-Pesa Express
                </span>
                <span className="bg-white/5 border border-white/10 text-white/50 text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest">
                  Same-Day Delivery
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TICKER ── */}
      <div className="w-full overflow-hidden bg-[#080808] border-y border-white/5 py-4 flex whitespace-nowrap">
        <div className="marquee-left flex items-center min-w-max">
          {[...merchTickerTags, ...merchTickerTags, ...merchTickerTags].map((tag, i) => (
            <span key={i} className="text-white/30 font-black uppercase tracking-[0.3em] text-xs mx-6 flex items-center gap-6">
              {tag} <span className="w-1.5 h-1.5 bg-primary/50 rounded-full inline-block"></span>
            </span>
          ))}
        </div>
      </div>

      {/* ── STATS BAR ── */}
      <section className="py-16 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard value={2} suffix="" label="Featured Artist Drops" color="bg-primary" />
            <StatCard value={100} suffix="%" label="Authentic Artist Guarantee" color="bg-primary" />
            <StatCard value={24} suffix="h" label="Nairobi Delivery Window" color="bg-primary" />
            <StatCard value={200} suffix=" LPs" label="Limited Vinyl Pressings" color="bg-orange-500" />
          </div>
        </div>
      </section>

      {/* ── PRODUCTS / CATALOG SECTION ── */}
      <section id="merch-catalog" className="py-24 md:py-32 relative overflow-hidden">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/5 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 border-b border-white/5 pb-10 gap-6">
            <div>
              <span className="text-primary font-black uppercase tracking-[0.4em] text-xs block mb-4 flex items-center gap-3">
                <span className="w-8 h-px bg-primary inline-block"></span>
                Official Drops
              </span>
              <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tight">
                Shop <span className="italic text-primary pr-2">Collection</span>
              </h2>
            </div>

            <div className="flex flex-col gap-4 md:items-end">
              {/* Artist Filter Buttons */}
              <div className="flex items-center gap-2 flex-wrap" aria-label="Filter merchandise by artist">
                {artists.map((artist) => (
                  <button
                    key={artist}
                    onClick={() => setSelectedArtist(artist)}
                    aria-pressed={selectedArtist === artist}
                    className={`px-5 py-2.5 rounded-full font-black text-xs uppercase tracking-wider transition-all duration-300 ${
                      selectedArtist === artist
                        ? 'bg-white text-black shadow-[0_0_24px_rgba(255,255,255,0.15)]'
                        : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10'
                    }`}
                  >
                    {artist}
                  </button>
                ))}
              </div>

              {/* Category Filter Buttons */}
              <div className="flex items-center gap-2 flex-wrap" aria-label="Filter merchandise by category">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedFilter(cat)}
                    aria-pressed={selectedFilter === cat}
                    className={`px-5 py-2.5 rounded-full font-black text-xs uppercase tracking-wider transition-all duration-300 ${
                      selectedFilter === cat
                        ? 'bg-primary text-white shadow-[0_0_20px_rgba(255,107,53,0.4)]'
                        : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <p className="text-white/35 text-[10px] font-black uppercase tracking-[0.22em]">
                Showing {filteredProducts.length} of {merchList.length} official items
              </p>
            </div>
          </div>

          {/* Product Items List */}
          <div className="flex flex-col gap-8">
            {filteredProducts.map((product, idx) => (
              <div
                key={product.id}
                onMouseEnter={() => setHoveredProduct(product.id)}
                onMouseLeave={() => setHoveredProduct(null)}
                className="group relative flex flex-col md:flex-row border border-white/8 hover:border-primary/40 rounded-[2rem] overflow-hidden transition-all duration-700 hover:shadow-[0_0_80px_rgba(255,107,53,0.12)] bg-[#080808]"
              >
                {/* Left image */}
                <div className="relative w-full md:w-80 lg:w-96 aspect-[4/3] md:aspect-auto flex-shrink-0 overflow-hidden">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-[3s] group-hover:scale-110 opacity-70 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#080808] hidden md:block pointer-events-none"></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080808] to-transparent md:hidden pointer-events-none"></div>

                  <span className="absolute top-5 left-5 bg-primary text-white text-[10px] font-black px-3 py-1.5 uppercase tracking-widest shadow-[0_0_20px_rgba(255,107,53,0.5)]">
                    {product.tag}
                  </span>

                  <span className="absolute bottom-4 right-4 text-[90px] font-black text-white/5 leading-none select-none pointer-events-none">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                </div>

                {/* Right info */}
                <div className="flex flex-col justify-between flex-1 p-8 md:p-10 lg:p-14">
                  <div>
                    <div className="flex items-center gap-3 flex-wrap mb-4">
                      <span className="text-primary/80 font-bold uppercase tracking-[0.3em] text-[10px] border border-primary/20 px-3 py-1 rounded-full bg-primary/5">
                        {product.category}
                      </span>
                      <span className="text-white/40 font-bold uppercase tracking-[0.3em] text-[10px] border border-white/10 px-3 py-1 rounded-full">
                        {product.materialOrType}
                      </span>
                      <span className="text-orange-400/80 font-bold uppercase tracking-[0.3em] text-[10px] border border-orange-500/20 px-3 py-1 rounded-full bg-orange-500/5">
                        {product.stockStatus}
                      </span>
                    </div>

                    <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-white uppercase tracking-tighter leading-tight mb-2 group-hover:text-primary transition-colors duration-300">
                      {product.name}
                    </h3>
                    <p className="text-gray-500 font-bold text-xs sm:text-sm uppercase tracking-widest mb-6">
                      {product.artist}
                    </p>

                    {product.isTicket && (
                      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-4 text-xs">
                        <p className="font-black text-primary uppercase tracking-wide">
                          📅 {product.eventDate}
                        </p>
                        <p className="text-gray-300 text-xs font-medium mt-1">
                          📍 {product.venue}
                        </p>
                      </div>
                    )}

                    <p className="text-gray-300 text-base md:text-lg leading-relaxed max-w-xl border-l-[3px] border-white/10 group-hover:border-primary/40 pl-5 transition-colors duration-300 mb-6">
                      {product.desc}
                    </p>

                    {/* Feature bullets */}
                    <div className="grid sm:grid-cols-2 gap-2 mb-2">
                      {product.details.map((detail, dIdx) => (
                        <div key={dIdx} className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                          <span>{detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pricing and Buy Button */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mt-10 pt-8 border-t border-white/5">
                    <div>
                      <p className="text-white/30 font-bold uppercase tracking-widest text-[10px] mb-1">Price</p>
                      <p className="text-4xl md:text-5xl font-black text-white tracking-tighter group-hover:text-primary transition-colors duration-700">
                        {product.price}
                      </p>
                    </div>
                    <button
                      onClick={() => handleOpenBuyModal(product)}
                      className="relative bg-primary hover:bg-white text-white hover:text-black transition-all duration-300 px-10 py-4 rounded-full font-black uppercase tracking-widest text-sm flex items-center gap-3 shadow-[0_0_30px_rgba(255,107,53,0.2)] hover:shadow-[0_0_40px_rgba(255,107,53,0.4)]"
                    >
                      <ShoppingBag className="w-5 h-5" />
                      {product.isTicket ? 'Get VIP Ticket' : 'Buy Now'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* ── SUBMIT MERCH / ARTIST COLLAB CTA ── */}
      <section className="py-20 relative overflow-hidden bg-[#030303] border-b border-white/5">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-white/3 rounded-full animate-[spin_30s_linear_infinite]"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-primary/5 rounded-full animate-[spin_20s_linear_infinite_reverse]"></div>
        </div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <span className="text-primary font-black uppercase tracking-[0.4em] text-xs block mb-6">
            Artists / Creators / Designers
          </span>
          <h2 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-[0.9] mb-8">
            Want Your Merch<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400 italic pr-4">
              Featured Here?
            </span>
          </h2>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
            We partner with Kenyan urban artists, record labels, and festival organizers to provide direct merchandise manufacturing, warehousing, and automated M-Pesa fulfillment.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <a
              href="mailto:merch@riengradio.co.ke"
              className="group bg-primary hover:bg-white text-white hover:text-black transition-all duration-300 px-10 py-5 rounded-full font-black uppercase tracking-widest text-sm flex items-center gap-3 shadow-[0_0_30px_rgba(255,107,53,0.3)]"
            >
              Partner on Merch
            </a>
            <span className="text-white/20 font-bold text-sm">or reach out on Instagram @riengradio</span>
          </div>
        </div>
      </section>

      {/* ── CHECKOUT MODAL ── */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-300">
          <div className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-6 sm:p-10 shadow-[0_0_120px_rgba(255,107,53,0.25)] max-h-[90vh] overflow-y-auto">
            {/* Close */}
            <button
              onClick={handleCloseBuyModal}
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
                <h3 className="text-base sm:text-lg font-black uppercase text-white truncate">
                  {selectedProduct.name}
                </h3>
                <p className="text-xl font-black text-primary">
                  {selectedProduct.price}
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handlePaystackCheckout} className="space-y-5">
              {/* Size Selector */}
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

              {/* Phone */}
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

              {/* Delivery or Ticket info */}
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
                  <p>Your VIP QR Code E-Ticket will be generated and dispatched to your phone via SMS &amp; WhatsApp immediately upon payment.</p>
                </div>
              )}

              {/* Error */}
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

      {/* Keyframe Injection */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes wave {
          from { transform: scaleY(0.4); }
          to   { transform: scaleY(1); }
        }
        @keyframes slideLine {
          from { opacity: 0.3; transform: translateX(-5%); }
          to   { opacity: 0.8; transform: translateX(5%); }
        }
      ` }} />

      <Footer />
    </main>
  )
}
