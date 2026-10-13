/* Anna Chorna v2.6 · WEBLIOR concept. Progressive enhancement only. */
(()=>{'use strict';
 const $=(q,c=document)=>c.querySelector(q), $$=(q,c=document)=>[...c.querySelectorAll(q)];
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const toggle=$('.nav-toggle'),nav=$('.site-nav');
 const closeNav=()=>{if(!nav||!toggle)return;nav.classList.remove('is-open');toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Menü öffnen');};
 if(toggle&&nav){toggle.addEventListener('click',()=>{const open=!nav.classList.contains('is-open');nav.classList.toggle('is-open',open);toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Menü schließen':'Menü öffnen');});$$('a',nav).forEach(a=>a.addEventListener('click',closeNav));document.addEventListener('keydown',e=>{if(e.key==='Escape')closeNav()});document.addEventListener('click',e=>{if(!e.target.closest('.site-header'))closeNav()});}
 const backTop=$('.back-top');if(backTop){const update=()=>backTop.classList.toggle('is-visible',scrollY>500);window.addEventListener('scroll',update,{passive:true});update();backTop.addEventListener('click',()=>window.scrollTo({top:0,behavior:reduced.matches?'instant':'smooth'}));}
 // Subtle different reveals for heading, paragraphs, masks and photographs. No-JS is fully readable.
 const reveals=$$('[data-reveal]');
 if(!reduced.matches&&'IntersectionObserver' in window){
  const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-revealed');observer.unobserve(e.target)}}),{rootMargin:'0px 0px -7% 0px',threshold:.07});
  reveals.forEach(node=>observer.observe(node));
  // Wait for paint before enabling hidden initial state, to avoid a blank screen on script errors.
  requestAnimationFrame(()=>document.documentElement.classList.add('motion-ready'));
 }else{reveals.forEach(n=>n.classList.add('is-revealed'));}
 // Gallery category filters. Plain links show images even if third-party lightbox cannot load.
 const tiles=$$('.gallery-tile'),filters=$$('[data-filter]');
 let fancy=null;
 const setFilter=(category)=>{
  filters.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter===category)));
  tiles.forEach(tile=>{tile.hidden=category!=='all'&&tile.dataset.category!==category});
  // GLightbox reloads after gallery filter changes.
  if(fancy&&typeof fancy.reload==='function')fancy.reload();
 };
 filters.forEach(b=>b.addEventListener('click',()=>setFilter(b.dataset.filter)));
 // GLightbox is loaded only for gallery and progressively enhances the native dialog.
 if(typeof window.GLightbox==='function'&&tiles.length){
  try{fancy=window.GLightbox({selector:'.glightbox',touchNavigation:true,loop:false,zoomable:true,openEffect:'fade',closeEffect:'fade'});}catch(e){fancy=null;}
 }
 const dialog=$('#gallery-dialog');
 if(dialog&&typeof dialog.showModal==='function'&&!fancy){
  let index=0,focused=null;const img=$('img',dialog),label=$('p',dialog);
  const visible=()=>tiles.filter(t=>!t.hidden);
  const render=()=>{const a=visible()[index];if(!a)return;img.src=a.href;img.alt=$('img',a)?.alt||'Beauty-Moodbild';label.textContent=a.dataset.caption||'';};
  tiles.forEach(tile=>tile.addEventListener('click',e=>{e.preventDefault();focused=document.activeElement;index=visible().indexOf(tile);if(index<0)return;render();dialog.showModal();}));
  $('.close-lightbox',dialog)?.addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
  dialog.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();const n=visible().length;if(n){index=(index+(e.key==='ArrowRight'?1:-1)+n)%n;render();}}});
  dialog.addEventListener('close',()=>{img.removeAttribute('src');focused?.focus()});
 }
 // Curated four-slide lookbook: use Swiper when available; native scroll-snap fallback otherwise.
 const slider=$('.editorial-swiper');if(slider){
  const prev=$('.carousel-prev'),next=$('.carousel-next'),status=$('.carousel-status'),slides=$$('.swiper-slide',slider);
  const update=(i)=>{const n=slides.length;status.textContent=`${String(i+1).padStart(2,'0')} / ${String(n).padStart(2,'0')}`;};
  if(typeof window.Swiper==='function'){
   try{const swiper=new window.Swiper(slider,{slidesPerView:1.16,spaceBetween:15,grabCursor:true,watchOverflow:true,loop:false,speed:650,keyboard:{enabled:true,onlyInViewport:true},breakpoints:{600:{slidesPerView:2.05,spaceBetween:22},960:{slidesPerView:2.7,spaceBetween:27}},on:{slideChange(s){update(s.activeIndex)}}});
    prev.addEventListener('click',()=>swiper.slidePrev());next.addEventListener('click',()=>swiper.slideNext());update(0);
   }catch(e){setupNative();}
  }else setupNative();
  function setupNative(){
   slider.classList.add('native-carousel');const track=$('.swiper-wrapper',slider);
   const index=()=>{const left=track.scrollLeft;const width=slides[1]?slides[1].offsetLeft-slides[0].offsetLeft:1;return Math.max(0,Math.min(slides.length-1,Math.round(left/Math.max(1,width))))};
   const move=step=>{const i=Math.max(0,Math.min(slides.length-1,index()+step));track.scrollTo({left:slides[i].offsetLeft-slides[0].offsetLeft,behavior:reduced.matches?'instant':'smooth'});update(i)};
   prev.addEventListener('click',()=>move(-1));next.addEventListener('click',()=>move(1));track.addEventListener('scroll',()=>update(index()),{passive:true});update(0);
  }
 }
})();
// Image failure guard: a local graphic prevents an empty or broken image slot when
// external photography is unavailable, while keeping the real image as primary.
document.querySelectorAll('img[src^="https://images.unsplash.com/"]').forEach(img=>{
 img.addEventListener('error',()=>{if(img.dataset.fallbackApplied)return;img.dataset.fallbackApplied='1';img.src='assets/image-placeholder.svg';const a=img.closest('.gallery-tile');if(a)a.href='assets/image-placeholder.svg';});
});
