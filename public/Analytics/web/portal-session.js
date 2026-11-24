(()=>{
  const KEY='gaPortalSession';
  const api={
    get(){try{return JSON.parse(localStorage.getItem(KEY)||'null')}catch{return null}},
    email(){return this.get()?.email||''},
    initial(){
      const e=this.email();
      const c=(e.split('@')[0].match(/[A-Za-z0-9]/)||['R'])[0];
      return c.toUpperCase();
    },
    set(email,role='Viewer'){
      const s={email:String(email||'').trim().toLowerCase(),role,loggedAt:new Date().toISOString()};
      localStorage.setItem(KEY,JSON.stringify(s));
      this.apply();
      return s;
    },
    clear(){
      localStorage.removeItem(KEY);
      this.apply();
    },
    apply(){
      const s=this.get();
      const nextInitial=s?.email?this.initial():'R';
      document.querySelectorAll('.pfh-avatar,.ga-avatar,.report-badge').forEach(el=>{
        if(el.textContent!==nextInitial)el.textContent=nextInitial;
        if(s?.email){
          if(el.title!==s.email)el.title=s.email;
          const label='Account '+s.email;
          if(el.getAttribute('aria-label')!==label)el.setAttribute('aria-label',label);
          if(el.dataset.sessionEmail!==s.email)el.dataset.sessionEmail=s.email;
        }else{
          if(el.title)el.removeAttribute('title');
          if(el.dataset.sessionEmail)delete el.dataset.sessionEmail;
        }
      });
    },
    async validate(){
      let path=location.pathname;
      try{path=decodeURIComponent(path)}catch{}
      if(path.endsWith('/access.html')||path.endsWith('/Access management.html'))return true;

      try{
        const response=await fetch('session-status',{
          method:'GET',
          credentials:'same-origin',
          cache:'no-store',
          headers:{'Accept':'application/json'}
        });

        if(response.ok)return true;
        if(response.status===503)return true;

        this.clear();
        const reason=response.status===403?'revoked':'session-required';
        location.replace('access.html?error='+reason);
        return false;
      }catch{
        return true;
      }
    }
  };

  window.PortalSession=api;

  const run=()=>{
    api.apply();
    api.validate();
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});
  else run();

  // Re-check access while a report tab remains open, and immediately when
  // the user returns to the tab. A revoked session is cleared on the next check.
  setInterval(()=>api.validate(),60000);
  document.addEventListener('visibilitychange',()=>{
    if(document.visibilityState==='visible')api.validate();
  });

  const observer=new MutationObserver(records=>{
    for(const record of records){
      for(const node of record.addedNodes){
        if(node.nodeType!==1)continue;
        if(node.matches?.('.pfh-avatar,.ga-avatar,.report-badge')||node.querySelector?.('.pfh-avatar,.ga-avatar,.report-badge')){
          api.apply();
          return;
        }
      }
    }
  });
  observer.observe(document.documentElement,{childList:true,subtree:true});
})();
