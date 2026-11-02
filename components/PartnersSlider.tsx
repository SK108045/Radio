const partners = ['22Bet', 'Equity', 'Quickmart']

export default function PartnersSlider() {
  return (
    <section aria-label="Our partners" className="border-y border-white/10 bg-[#080808] py-6 md:py-8">
      <div className="max-w-7xl mx-auto px-5 md:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <p className="text-[10px] font-medium text-gray-500 uppercase tracking-[0.2em]">In good company <span className="text-gray-600 block mt-1 tracking-normal normal-case">Our partners</span></p>
        <ul className="flex items-center justify-center gap-8 sm:gap-14 md:gap-24">
          {partners.map(partner => <li key={partner} className="text-lg sm:text-2xl font-bold tracking-tight text-gray-400">{partner}</li>)}
        </ul>
      </div>
    </section>
  )
}
