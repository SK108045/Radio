import Script from 'next/script'

/**
 * One Catfish ad placement per page.
 * The advertising provider controls the sticky banner's size and position.
 */
export default function CatfishAd() {
  return (
    <>
      <div id="zone_1892228828" aria-label="Advertisement" />
      <Script id="catfish-zone-1892228828" strategy="afterInteractive">
        {`
          (function(w,d,o,g,r,a,m){
            var cid='zone_1892228828';
            w[r]=w[r]||function(){(w[r+'l']=w[r+'l']||[]).push(arguments)};
            function e(b,w,r){if((w[r+'h']=b.pop())&&!w.ABN){
              var a=d.createElement(o),p=d.getElementsByTagName(o)[0];a.async=1;
              a.src='https://cdn.'+w[r+'h']+'/libs/e.js';a.onerror=function(){e(g,w,r)};
              p.parentNode.insertBefore(a,p)}}e(g,w,r);
            w[r](cid,{id:1892228828,domain:w[r+'h']});
          })(window,document,'script',['ftd.agency'],'ABNS');
        `}
      </Script>
    </>
  )
}
