'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { hasCatfishAd } from '@/lib/catfish'

const containerId = 'zone_1892228828'

// The advertiser's supplied tag, unchanged.
const advertiserTag = `(function(w,d,o,g,r,a,m){
    var cid='zone_1892228828';
    w[r]=w[r]||function(){(w[r+'l']=w[r+'l']||[]).push(arguments)};
    function e(b,w,r){if((w[r+'h']=b.pop())&&!w.ABN){
        var a=d.createElement(o),p=d.getElementsByTagName(o)[0];a.async=1;
        a.src='https://cdn.'+w[r+'h']+'/libs/e.js';a.onerror=function(){e(g,w,r)};
        p.parentNode.insertBefore(a,p)}}e(g,w,r);
    w[r](cid,{id:1892228828,domain:w[r+'h']});
})(window,document,'script',['ftd.agency'],'ABNS');`

function CatfishTag() {
  const container = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = container.current
    if (!node) return
    const script = document.createElement('script')
    script.dataset.catfishZone = '1892228828'
    script.textContent = advertiserTag
    node.appendChild(script)

    return () => {
      script.remove()
      // Release the removed container so the same supplied tag works on re-entry.
      const zones = (window as Window & {
        ABN?: { zones?: Record<string, { div: HTMLElement }> }
      }).ABN?.zones
      if (zones?.[containerId]?.div === node) delete zones[containerId]
    }
  }, [])

  return <div id={containerId} ref={container} />
}

export default function CatfishAd() {
  const pathname = usePathname()
  return hasCatfishAd(pathname) ? <CatfishTag /> : null
}
