// NEXUS AI — Service Worker (يخزن واجهة التطبيق للعمل دون إنترنت)
const CACHE_NAME="nexus-ai-v1";
const ASSETS=["./","./index.html","./manifest.json"];

self.addEventListener("install",e=>{
  e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(ASSETS)).catch(()=>{}));
  self.skipWaiting();
});

self.addEventListener("activate",e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener("fetch",e=>{
  // لا تخزّن طلبات Firebase أو الـ AI APIs — هي محتاجة بيانات حديثة دايماً
  const url=e.request.url;
  if(url.includes("firebaseio")||url.includes("firebasedatabase")||url.includes("googleapis")||url.includes("groq")||url.includes("openrouter")||url.includes("cerebras")||url.includes("cloudflare")||url.includes("huggingface")||url.includes("pollinations")||url.includes("azure")){
    return; // اتركها تذهب للشبكة مباشرة
  }
  e.respondWith(
    caches.match(e.request).then(cached=>cached||fetch(e.request).then(res=>{
      const clone=res.clone();
      caches.open(CACHE_NAME).then(c=>c.put(e.request,clone)).catch(()=>{});
      return res;
    }).catch(()=>cached))
  );
});
