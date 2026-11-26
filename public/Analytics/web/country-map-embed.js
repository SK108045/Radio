(()=>{
  let latest=[];
  const frames=new Set();

  function payload(){
    return {type:'rieng-country-map-data',data:latest};
  }

  function send(frame){
    try{frame?.contentWindow?.postMessage(payload(),location.origin)}catch{}
  }

  function mount(root,x,y,width,height){
    const frame=document.createElement('iframe');
    frame.className='b ga-country-map-frame';
    frame.src='interactive-country-map.html';
    frame.title='Interactive users by country map';
    frame.loading='eager';
    frame.setAttribute('aria-label','Interactive users by country map');
    frame.setAttribute('data-rieng-country-map','');
    frame.style.cssText=`left:${x}px;top:${y}px;width:${width}px;height:${height}px;border:0;background:#fff;overflow:hidden;`;
    frame.dataset.reportX=x;
    frame.dataset.reportY=y;
    frame.addEventListener('load',()=>send(frame));
    root.appendChild(frame);
    frames.add(frame);
    return frame;
  }

  function update(rows){
    latest=Array.isArray(rows)?rows.map(row=>({
      label:String(row?.label??row?.country??''),
      users:Number(row?.users??row?.value??0)
    })):rows||{};
    frames.forEach(send);
    document.querySelectorAll('iframe[data-rieng-country-map]').forEach(send);
  }

  addEventListener('message',event=>{
    if(event.origin!==location.origin)return;
    if(event.data?.type!=='rieng-country-map-ready')return;
    const frame=[...document.querySelectorAll('iframe[data-rieng-country-map]')]
      .find(item=>item.contentWindow===event.source);
    if(frame){frames.add(frame);send(frame)}
  });

  window.RiengCountryMap={mount,update};
})();
