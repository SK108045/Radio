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
  Sparkles,
  Flame,
  ShieldCheck,
  Ticket,
  Disc3,
  Truck,
  ArrowRight,
  Check,
  Calendar,
  MapPin,
  Tag,
  Zap,
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
]

// ─── Ticker Items ────────────────────────────────────────────────────────────
const merchTickerTags = [
  'OFFICIAL MERCH VAULT',
  'KAPITANI CONTROL CAPSULE',
  'ETHICS ENTERTAINMENT OFFICIAL',
  'HEAVYWEIGHT 480 GSM HOODIES',
  'INSTANT M-PESA CHECKOUT',
  'VIP FESTIVAL PASSES',
  'NAIROBI SAME-DAY DELIVERY',
  'LIMITED FIRST RUN VINYL',
  '100% VERIFIED AUTHENTIC',
]

export default function MerchPage() {
  const [selectedArtist, setSelectedArtist] = useState<'All' | 'Kapitani' | 'Ethics Entertainment'>('All')
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Apparel' | 'Tickets' | 'Accessories' | 'Collectibles'>('All')
  const [selectedProduct, setSelectedProduct] = useState<MerchProduct | null>(null)
  const [selectedSize, setSelectedSize] = useState<string>('L')
  const [quantity, setQuantity] = useState<number>(1)
  const [phoneNumber, setPhoneNumber] = useState<string>('')
  const [deliveryLocation, setDeliveryLocation] = useState<string>('')
  const [checkoutStatus, setCheckoutStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string>('')

  // Flagships (Featured Heroes)
  const kapitaniFlagship = merchList.find(p => p.id === 'kapitani-control-hoodie-01')!
  const ethicsFlagship = merchList.find(p => p.id === 'rieng-ethics-bomber-01')!

  // Special Items
  const vipTicket = merchList.find(p => p.id === 'ethics-vip-ticket-01')!
  const vinylRecord = merchList.find(p => p.id === 'ethics-vinyl-lp-01')!

  // Catalog Items
  const filteredProducts = merchList.filter(product => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory
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

  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    if (params.get('payment') === 'success') {
      window.history.replaceState({}, '', '/merch')
      setCheckoutStatus('success')
    }
  }, [])

  return (
    <main className="min-h-screen bg-[#030303] text-white selection:bg-primary selection:text-white flex flex-col justify-between overflow-x-hidden">
      <Navbar />

      {/* ── CINEMATIC STREETWEAR HERO ── */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 border-b border-white/5 overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-primary/15 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute top-1/2 left-0 w-[450px] h-[450px] bg-orange-600/10 rounded-full blur-[130px] pointer-events-none" />

        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2.5 bg-white/5 border border-white/10 px-4 py-2 rounded-full mb-6 backdrop-blur-md shadow-[0_0_30px_rgba(255,107,53,0.15)]">
                <span className="w-2.5 h-2.5 bg-primary rounded-full animate-ping" />
                <span className="text-xs font-black uppercase tracking-[0.25em] text-orange-200">
                  Drop 002 Live · Limited Capsules
                </span>
              </div>

              <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[8.5rem] font-black uppercase tracking-tighter leading-[0.88] text-white">
                Official
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-orange-400 to-yellow-500 italic pr-6 drop-shadow-[0_0_40px_rgba(255,107,53,0.4)]">
                  Merch Vault
                </span>
              </h1>

              <p className="text-base sm:text-xl text-gray-300 font-medium leading-relaxed mt-6 border-l-[3px] border-primary/50 pl-6 max-w-2xl">
                Heavyweight 480 GSM hoodies, vintage washed tees, VIP festival credentials, and audiophile vinyl pressings. Created in direct partnership with Nairobi artists.
              </p>
            </div>

            {/* Quick Filter Navigation Cards */}
            <div className="flex flex-col gap-3 shrink-0">
              <span className="text-xs font-black uppercase tracking-widest text-gray-500">
                Explore Drops:
              </span>
              <div className="flex flex-wrap gap-2">
                <a
                  href="#flagship-capsules"
                  className="px-5 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-black uppercase tracking-wider text-white transition-all flex items-center gap-2"
                >
                  <Flame size={14} className="text-primary" /> Flagship Capsules
                </a>
                <a
                  href="#collector-vault"
                  className="px-5 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-black uppercase tracking-wider text-white transition-all flex items-center gap-2"
                >
                  <Ticket size={14} className="text-orange-400" /> VIP Pass & Vinyl
                </a>
                <a
                  href="#streetwear-grid"
                  className="px-5 py-3 rounded-2xl bg-primary hover:bg-orange-600 text-white text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-primary/25"
                >
                  <ShoppingBag size={14} /> Full Collection
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TICKER ── */}
      <div className="w-full overflow-hidden bg-[#070707] border-y border-white/5 py-3.5 flex whitespace-nowrap">
        <div className="flex items-center animate-[marquee_25s_linear_infinite] min-w-max">
          {[...merchTickerTags, ...merchTickerTags, ...merchTickerTags].map((tag, i) => (
            <span key={i} className="text-white/40 font-black uppercase tracking-[0.3em] text-xs mx-6 flex items-center gap-4">
              {tag} <span className="w-1.5 h-1.5 bg-primary rounded-full inline-block" />
            </span>
          ))}
        </div>
      </div>

      {/* ── SECTION 1: THE FLAGSHIP CAPSULE SPOTLIGHTS ── */}
      <section id="flagship-capsules" className="py-20 md:py-28 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 text-primary font-black uppercase tracking-[0.25em] text-xs mb-2">
              <Sparkles size={14} /> Flagship Drops
            </div>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-white">
              The Anchor Pieces
            </h2>
          </div>
          <p className="text-sm text-gray-400 max-w-sm">
            Hand-distressed, heavy custom French Terry & waterproof flight satin. Pure street statement items.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Card 1: Kapitani Control Hoodie */}
          <div className="group relative rounded-[2.5rem] bg-[#080808] border border-white/10 hover:border-primary/50 overflow-hidden transition-all duration-700 hover:shadow-[0_20px_80px_rgba(255,107,53,0.18)] flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-[100px] pointer-events-none" />
            
            <div className="p-8 sm:p-12 relative z-10">
              <div className="flex items-center justify-between gap-4 mb-6">
                <span className="px-3.5 py-1.5 rounded-full bg-primary/20 border border-primary/40 text-primary text-xs font-black uppercase tracking-wider">
                  {kapitaniFlagship.tag}
                </span>
                <span className="text-xs uppercase tracking-widest text-orange-400 font-black">
                  {kapitaniFlagship.stockStatus}
                </span>
              </div>

              <h3 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white mb-2 group-hover:text-primary transition-colors">
                {kapitaniFlagship.name}
              </h3>
              <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-primary mb-6">
                Official {kapitaniFlagship.artist} Capsule
              </p>

              <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-8 max-w-md">
                {kapitaniFlagship.desc}
              </p>

              <div className="flex flex-wrap gap-2 mb-8">
                {kapitaniFlagship.details.map((detail, idx) => (
                  <span key={idx} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-bold uppercase tracking-wider text-gray-300">
                    ✓ {detail}
                  </span>
                ))}
              </div>
            </div>

            {/* Image Presentation */}
            <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] overflow-hidden bg-black/40 border-t border-white/5">
              <Image
                src={kapitaniFlagship.image}
                alt={kapitaniFlagship.name}
                fill
                sizes="(max-width: 1024px) 100vw, 750px"
                className="object-contain p-6 sm:p-10 transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-transparent pointer-events-none" />
              
              <div className="absolute bottom-6 left-8 right-8 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-gray-400 block font-bold">Release Price</span>
                  <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">{kapitaniFlagship.price}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenBuyModal(kapitaniFlagship)}
                  className="px-8 py-3.5 rounded-full bg-primary hover:bg-white text-white hover:text-black font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-primary/30 flex items-center gap-2 hover:scale-105"
                >
                  <ShoppingBag size={14} /> Buy Hoodie
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: Ethics Tactical Satin Bomber Jacket */}
          <div className="group relative rounded-[2.5rem] bg-[#080808] border border-white/10 hover:border-red-500/50 overflow-hidden transition-all duration-700 hover:shadow-[0_20px_80px_rgba(239,68,68,0.18)] flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/10 rounded-full blur-[100px] pointer-events-none" />
            
            <div className="p-8 sm:p-12 relative z-10">
              <div className="flex items-center justify-between gap-4 mb-6">
                <span className="px-3.5 py-1.5 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-black uppercase tracking-wider">
                  {ethicsFlagship.tag}
                </span>
                <span className="text-xs uppercase tracking-widest text-red-400 font-black">
                  {ethicsFlagship.stockStatus}
                </span>
              </div>

              <h3 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white mb-2 group-hover:text-red-400 transition-colors">
                {ethicsFlagship.name}
              </h3>
              <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-red-400 mb-6">
                Official {ethicsFlagship.artist}
              </p>

              <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-8 max-w-md">
                {ethicsFlagship.desc}
              </p>

              <div className="flex flex-wrap gap-2 mb-8">
                {ethicsFlagship.details.map((detail, idx) => (
                  <span key={idx} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-bold uppercase tracking-wider text-gray-300">
                    ✓ {detail}
                  </span>
                ))}
              </div>
            </div>

            {/* Image Presentation */}
            <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] overflow-hidden bg-black/40 border-t border-white/5">
              <Image
                src={ethicsFlagship.image}
                alt={ethicsFlagship.name}
                fill
                sizes="(max-width: 1024px) 100vw, 750px"
                className="object-contain p-6 sm:p-10 transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-transparent pointer-events-none" />

              <div className="absolute bottom-6 left-8 right-8 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-gray-400 block font-bold">Release Price</span>
                  <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">{ethicsFlagship.price}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenBuyModal(ethicsFlagship)}
                  className="px-8 py-3.5 rounded-full bg-red-600 hover:bg-white text-white hover:text-black font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-red-600/30 flex items-center gap-2 hover:scale-105"
                >
                  <ShoppingBag size={14} /> Buy Bomber
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── SECTION 2: THE COLLECTOR'S VAULT (HOLOGRAPHIC VIP PASS & VINYL LP) ── */}
      <section id="collector-vault" className="py-20 md:py-28 bg-[#060606] border-y border-white/5 relative overflow-hidden">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-14">
            <div>
              <span className="text-primary font-black uppercase tracking-[0.25em] text-xs block mb-2">
                Special Artifacts
              </span>
              <h2 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-white">
                The Collector&apos;s Vault
              </h2>
            </div>
            <p className="text-sm text-gray-400 max-w-sm">
              Live all-access festival credentials and uncompressed analog studio vinyl pressings.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-10">
            
            {/* ── Holographic VIP Ticket Pass ── */}
            <div className="relative rounded-[2.5rem] bg-gradient-to-br from-[#12100e] via-[#090807] to-[#040404] border border-amber-500/30 p-8 sm:p-12 overflow-hidden shadow-[0_20px_70px_rgba(245,158,11,0.1)] group">
              {/* Holographic Watermark Sheen */}
              <div className="absolute -right-20 -top-20 w-80 h-80 bg-gradient-to-br from-yellow-500/20 via-orange-500/10 to-transparent rounded-full blur-[80px] pointer-events-none" />
              
              <div className="relative z-10 flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center justify-between gap-4 mb-6">
                    <span className="px-4 py-1.5 rounded-full bg-yellow-500/15 border border-yellow-500/40 text-yellow-400 text-xs font-black uppercase tracking-widest flex items-center gap-2">
                      <Ticket size={14} /> VIP Credential Pass
                    </span>
                    <span className="text-[11px] font-mono tracking-widest text-yellow-500/70 border border-yellow-500/30 px-3 py-1 rounded-md">
                      BATCH #RF-2026
                    </span>
                  </div>

                  <h3 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white mb-2">
                    {vipTicket.name}
                  </h3>
                  <p className="text-xs font-bold uppercase tracking-widest text-yellow-400 mb-6">
                    {vipTicket.artist}
                  </p>

                  {/* Event Details Badge */}
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-yellow-500/20 mb-6 flex flex-col sm:flex-row gap-4 sm:items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5 text-gray-200">
                      <Calendar size={16} className="text-yellow-400 shrink-0" />
                      <span className="font-semibold">{vipTicket.eventDate}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-gray-200">
                      <MapPin size={16} className="text-yellow-400 shrink-0" />
                      <span className="font-semibold">{vipTicket.venue}</span>
                    </div>
                  </div>

                  <p className="text-gray-300 text-sm leading-relaxed mb-6">
                    {vipTicket.desc}
                  </p>

                  <div className="grid sm:grid-cols-2 gap-2 mb-8">
                    {vipTicket.details.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                        <Check size={14} className="text-yellow-400 shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Perforated Stub Line & Buy */}
                <div className="pt-8 border-t border-dashed border-yellow-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-gray-400 block font-bold">Ticket Price</span>
                    <span className="text-3xl sm:text-4xl font-black text-yellow-400 tracking-tight">{vipTicket.price}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenBuyModal(vipTicket)}
                    className="w-full sm:w-auto px-8 py-4 rounded-full bg-yellow-500 hover:bg-white text-black font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-yellow-500/30 flex items-center justify-center gap-2 hover:scale-105"
                  >
                    <Ticket size={16} /> Get VIP Pass
                  </button>
                </div>
              </div>
            </div>

            {/* ── 180g Neon Orange Marbled Vinyl LP ── */}
            <div className="relative rounded-[2.5rem] bg-gradient-to-br from-[#120b08] via-[#090605] to-[#040404] border border-orange-500/30 p-8 sm:p-12 overflow-hidden shadow-[0_20px_70px_rgba(255,107,53,0.1)] group">
              <div className="absolute -right-20 -top-20 w-80 h-80 bg-gradient-to-br from-orange-500/20 via-red-500/10 to-transparent rounded-full blur-[80px] pointer-events-none" />

              <div className="relative z-10 flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center justify-between gap-4 mb-6">
                    <span className="px-4 py-1.5 rounded-full bg-orange-500/15 border border-orange-500/40 text-orange-400 text-xs font-black uppercase tracking-widest flex items-center gap-2">
                      <Disc3 size={14} /> 1st Pressing 12&quot; Vinyl
                    </span>
                    <span className="text-[11px] font-mono tracking-widest text-orange-400/80 border border-orange-500/30 px-3 py-1 rounded-md">
                      LIMITED #001–200
                    </span>
                  </div>

                  <h3 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white mb-2">
                    {vinylRecord.name}
                  </h3>
                  <p className="text-xs font-bold uppercase tracking-widest text-primary mb-6">
                    {vinylRecord.artist}
                  </p>

                  {/* Vinyl Specs Pill */}
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-orange-500/20 mb-6 flex flex-col sm:flex-row gap-4 sm:items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5 text-gray-200">
                      <Disc3 size={16} className="text-primary shrink-0 animate-spin [animation-duration:12s]" />
                      <span className="font-semibold">180g Audiophile Neon Vinyl</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-gray-200">
                      <Sparkles size={16} className="text-primary shrink-0" />
                      <span className="font-semibold">Direct Analog Master Cut</span>
                    </div>
                  </div>

                  <p className="text-gray-300 text-sm leading-relaxed mb-6">
                    {vinylRecord.desc}
                  </p>

                  <div className="grid sm:grid-cols-2 gap-2 mb-8">
                    {vinylRecord.details.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                        <Check size={14} className="text-primary shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price & Buy */}
                <div className="pt-8 border-t border-dashed border-orange-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-gray-400 block font-bold">Collector Price</span>
                    <span className="text-3xl sm:text-4xl font-black text-primary tracking-tight">{vinylRecord.price}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenBuyModal(vinylRecord)}
                    className="w-full sm:w-auto px-8 py-4 rounded-full bg-primary hover:bg-white text-white hover:text-black font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-primary/30 flex items-center justify-center gap-2 hover:scale-105"
                  >
                    <Disc3 size={16} /> Order Vinyl LP
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── SECTION 3: THE STREETWEAR CATALOG GRID (TEES, HOODIES, CAPS) ── */}
      <section id="streetwear-grid" className="py-24 md:py-32 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Filter Navigation Bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-14 pb-8 border-b border-white/5">
          <div>
            <span className="text-primary font-black uppercase tracking-[0.25em] text-xs block mb-2">
              Browse All Drops
            </span>
            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
              Streetwear Lookbook
            </h2>
          </div>

          <div className="flex flex-col gap-3 md:items-end">
            {/* Filter by Artist */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs uppercase tracking-wider text-gray-500 font-bold mr-1">Artist:</span>
              {(['All', 'Kapitani', 'Ethics Entertainment'] as const).map(artist => (
                <button
                  key={artist}
                  onClick={() => setSelectedArtist(artist)}
                  className={`px-4 py-2 rounded-full font-black text-xs uppercase tracking-wider transition-all ${
                    selectedArtist === artist
                      ? 'bg-white text-black shadow-lg shadow-white/10'
                      : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10'
                  }`}
                >
                  {artist}
                </button>
              ))}
            </div>

            {/* Filter by Category */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs uppercase tracking-wider text-gray-500 font-bold mr-1">Type:</span>
              {(['All', 'Apparel', 'Accessories', 'Tickets', 'Collectibles'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full font-black text-xs uppercase tracking-wider transition-all ${
                    selectedCategory === cat
                      ? 'bg-primary text-white shadow-lg shadow-primary/25'
                      : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <span className="text-[11px] font-mono tracking-wider text-gray-500 mt-1">
              Showing {filteredProducts.length} of {merchList.length} total releases
            </span>
          </div>
        </div>

        {/* Bento Product Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map(product => (
            <div
              key={product.id}
              className="group relative rounded-3xl bg-[#090909] border border-white/10 hover:border-primary/50 overflow-hidden transition-all duration-500 hover:shadow-[0_20px_50px_rgba(255,107,53,0.12)] flex flex-col justify-between"
            >
              <div>
                {/* Photo Header */}
                <div className="relative aspect-square w-full bg-black/60 overflow-hidden">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-contain p-6 transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#090909] via-transparent to-transparent pointer-events-none" />

                  {/* Tag Pill */}
                  <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-white/15 text-[10px] font-black uppercase tracking-wider text-white">
                    {product.tag}
                  </span>

                  {/* Stock Pill */}
                  <span className="absolute top-4 right-4 px-3 py-1 rounded-full bg-primary/20 backdrop-blur-md border border-primary/30 text-[10px] font-black uppercase tracking-wider text-primary">
                    {product.stockStatus}
                  </span>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                      {product.artist}
                    </span>
                    <span className="text-gray-600">•</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      {product.materialOrType}
                    </span>
                  </div>

                  <h3 className="text-xl font-black uppercase tracking-tight text-white mb-3 group-hover:text-primary transition-colors line-clamp-2">
                    {product.name}
                  </h3>

                  <p className="text-gray-400 text-xs line-clamp-2 leading-relaxed mb-4">
                    {product.desc}
                  </p>

                  {/* Sizes if applicable */}
                  {product.sizes && (
                    <div className="flex items-center gap-1.5 flex-wrap mb-4">
                      <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mr-1">Sizes:</span>
                      {product.sizes.map(size => (
                        <span
                          key={size}
                          className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold text-gray-300"
                        >
                          {size}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Price & Action */}
              <div className="p-6 pt-0 flex items-center justify-between border-t border-white/5 mt-2">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-gray-500 block font-bold">Price</span>
                  <span className="text-2xl font-black text-white tracking-tight">{product.price}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenBuyModal(product)}
                  className="px-6 py-3 rounded-full bg-white/10 hover:bg-primary text-white font-black uppercase tracking-widest text-xs transition-all flex items-center gap-2 hover:shadow-lg hover:shadow-primary/25"
                >
                  <ShoppingBag size={14} /> Buy
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SECTION 4: THE STREET GUARANTEE & SERVICE PILLARS ── */}
      <section className="py-20 bg-[#050505] border-t border-white/5">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 flex items-start gap-4">
              <div className="size-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                <Truck size={22} />
              </div>
              <div>
                <h4 className="text-sm font-black uppercase tracking-wider text-white mb-1">Nairobi Same-Day</h4>
                <p className="text-xs text-gray-400 leading-relaxed">Direct dispatch across Nairobi estates, express courier countrywide.</p>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 flex items-start gap-4">
              <div className="size-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 shrink-0">
                <Zap size={22} />
              </div>
              <div>
                <h4 className="text-sm font-black uppercase tracking-wider text-white mb-1">Instant M-Pesa</h4>
                <p className="text-xs text-gray-400 leading-relaxed">1-tap STK push checkout straight to your phone. Zero payment hassle.</p>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 flex items-start gap-4">
              <div className="size-12 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-400 shrink-0">
                <ShieldCheck size={22} />
              </div>
              <div>
                <h4 className="text-sm font-black uppercase tracking-wider text-white mb-1">100% Artist Direct</h4>
                <p className="text-xs text-gray-400 leading-relaxed">Officially licensed artist capsules. Real royalties supporting Nairobi creators.</p>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 flex items-start gap-4">
              <div className="size-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0">
                <Flame size={22} />
              </div>
              <div>
                <h4 className="text-sm font-black uppercase tracking-wider text-white mb-1">Heavyweight Textiles</h4>
                <p className="text-xs text-gray-400 leading-relaxed">260–480 GSM dense cottons, waterproof satin shells, and puff 3D embroidery.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CHECKOUT MODAL (100% PRESERVED FUNCTIONALITY) ── */}
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
              <div className="relative w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 border border-white/10 bg-black/50">
                <Image src={selectedProduct.image} alt={selectedProduct.name} fill className="object-contain p-1" />
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

      <Footer />
    </main>
  )
}
