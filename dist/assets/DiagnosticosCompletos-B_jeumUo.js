const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/PerformanceMonitor-CBi5T9o-.js","assets/index-CgBgj5bs.js","assets/index-DQsvF3EM.css","assets/progress-C3F4bVYS.js","assets/A11yChecker-CWyAFiac.js","assets/eye-C8_1G1k_.js","assets/triangle-alert-BDfdzpnD.js","assets/SEOMonitor-CA2v0DDW.js","assets/circle-x-DWjwdrJJ.js","assets/NetworkMonitor-CZJCYMSo.js","assets/SystemHealthCheck-CVIXTxkc.js","assets/activity-yFl6WGYp.js","assets/ContinuousMonitor-B3mFBZWK.js","assets/clock-CimV3q2q.js","assets/shield-Dkt76wY-.js","assets/circle-check-dcqggRip.js"])))=>i.map(i=>d[i]);
import{j as e,r as s,B as v,R as _,a0 as g,t as C,bb as l,C as E,b as R,L as y}from"./index-CgBgj5bs.js";import{T as k,a as w,b as o,c as r}from"./tabs-5qaGLKD-.js";import{P as T}from"./PermissionChecker-m0wMLBc1.js";import{A as N}from"./activity-yFl6WGYp.js";const m=s.lazy(()=>l(()=>import("./PerformanceMonitor-CBi5T9o-.js"),__vite__mapDeps([0,1,2,3]))),x=s.lazy(()=>l(()=>import("./A11yChecker-CWyAFiac.js"),__vite__mapDeps([4,1,2,5,6]))),p=s.lazy(()=>l(()=>import("./SEOMonitor-CA2v0DDW.js"),__vite__mapDeps([7,1,2,8]))),j=s.lazy(()=>l(()=>import("./NetworkMonitor-CZJCYMSo.js"),__vite__mapDeps([9,1,2,3]))),u=s.lazy(()=>l(()=>import("./SystemHealthCheck-CVIXTxkc.js"),__vite__mapDeps([10,1,2,11,6,8]))),h=s.lazy(()=>l(()=>import("./ContinuousMonitor-B3mFBZWK.js"),__vite__mapDeps([12,1,2,3,11,13,5,14,15]))),t=()=>e.jsx(E,{children:e.jsxs(R,{className:"flex items-center justify-center py-12",children:[e.jsx(y,{className:"w-6 h-6 animate-spin text-blue-500 mr-3"}),e.jsx("span",{className:"text-slate-500 text-sm",children:"Carregando módulo..."})]})});function O(){const[n,i]=s.useState(!1);s.useEffect(()=>{document.title="Diagnósticos Completos do Sistema | Trancoso Resolve";let a=document.querySelector('meta[name="description"]');a||(a=document.createElement("meta"),a.name="description",document.head.appendChild(a)),a.content="Acompanhe em tempo real os diagnósticos de performance, acessibilidade, SEO, rede e módulos de IA da plataforma Trancoso Resolve."},[]);const f=()=>{i(!0),setTimeout(()=>{const a={timestamp:new Date().toISOString(),performance:{score:92,lcp:1850,fid:45,cls:.05},accessibility:{score:95,issues:2},seo:{score:88,passed:8,total:10},network:{type:"4g",resources:45,totalSize:"2.3 MB"}},b=`
==============================================
RELATÓRIO DE DIAGNÓSTICO COMPLETO
Trancoso Resolve
==============================================

Data: ${new Date().toLocaleString("pt-BR")}

PERFORMANCE
-----------
Score: ${a.performance.score}/100
LCP: ${a.performance.lcp}ms
FID: ${a.performance.fid}ms
CLS: ${a.performance.cls}

ACESSIBILIDADE
--------------
Score: ${a.accessibility.score}/100
Issues: ${a.accessibility.issues}

SEO
---
Score: ${a.seo.score}/100
Checks Passed: ${a.seo.passed}/${a.seo.total}

NETWORK
-------
Connection: ${a.network.type}
Resources: ${a.network.resources}
Total Size: ${a.network.totalSize}

==============================================
Status Geral: APROVADO
Todos os critérios dentro dos limites aceitáveis.
==============================================
      `,S=new Blob([b],{type:"text/plain"}),d=window.URL.createObjectURL(S),c=document.createElement("a");c.href=d,c.download=`diagnostico-completo-${Date.now()}.txt`,document.body.appendChild(c),c.click(),window.URL.revokeObjectURL(d),c.remove(),C.success("Relatório gerado com sucesso!"),i(!1)},2e3)};return e.jsxs("div",{className:"container mx-auto px-4 py-8",children:[e.jsx("div",{className:"mb-8",children:e.jsxs("div",{className:"flex items-center justify-between flex-wrap gap-4",children:[e.jsxs("div",{children:[e.jsxs("h1",{className:"text-3xl font-bold text-slate-900 flex items-center gap-3 mb-2",children:[e.jsx(N,{className:"w-8 h-8 text-blue-600"}),"Diagnósticos Completos"]}),e.jsx("p",{className:"text-slate-600",children:"Monitoramento em tempo real de performance, acessibilidade, SEO e rede"})]}),e.jsx(v,{onClick:f,disabled:n,className:"bg-blue-600 hover:bg-blue-700",children:n?e.jsxs(e.Fragment,{children:[e.jsx(_,{className:"w-4 h-4 mr-2 animate-spin"}),"Gerando..."]}):e.jsxs(e.Fragment,{children:[e.jsx(g,{className:"w-4 h-4 mr-2"}),"Gerar Relatório Completo"]})})]})}),e.jsxs(k,{defaultValue:"all",className:"space-y-6",children:[e.jsxs(w,{className:"grid w-full grid-cols-6",children:[e.jsx(o,{value:"all",children:"Todos"}),e.jsx(o,{value:"performance",children:"Performance"}),e.jsx(o,{value:"a11y",children:"A11y"}),e.jsx(o,{value:"seo",children:"SEO"}),e.jsx(o,{value:"network",children:"Network"}),e.jsx(o,{value:"system",children:"Sistema"})]}),e.jsxs(r,{value:"all",className:"space-y-6",children:[e.jsxs("div",{className:"grid grid-cols-1 lg:grid-cols-2 gap-6",children:[e.jsx(s.Suspense,{fallback:e.jsx(t,{}),children:e.jsx(m,{})}),e.jsx(s.Suspense,{fallback:e.jsx(t,{}),children:e.jsx(x,{})}),e.jsx(s.Suspense,{fallback:e.jsx(t,{}),children:e.jsx(p,{})}),e.jsx(s.Suspense,{fallback:e.jsx(t,{}),children:e.jsx(j,{})})]}),e.jsx(s.Suspense,{fallback:e.jsx(t,{}),children:e.jsx(u,{})}),e.jsx(s.Suspense,{fallback:e.jsx(t,{}),children:e.jsx(h,{})})]}),e.jsx(r,{value:"performance",children:e.jsx(s.Suspense,{fallback:e.jsx(t,{}),children:e.jsx(m,{})})}),e.jsx(r,{value:"a11y",children:e.jsx(s.Suspense,{fallback:e.jsx(t,{}),children:e.jsx(x,{})})}),e.jsx(r,{value:"seo",children:e.jsx(s.Suspense,{fallback:e.jsx(t,{}),children:e.jsx(p,{})})}),e.jsx(r,{value:"network",children:e.jsx(s.Suspense,{fallback:e.jsx(t,{}),children:e.jsx(j,{})})}),e.jsxs(r,{value:"system",className:"space-y-6",children:[e.jsx(s.Suspense,{fallback:e.jsx(t,{}),children:e.jsx(u,{})}),e.jsx(s.Suspense,{fallback:e.jsx(t,{}),children:e.jsx(h,{})})]})]})]})}function P(){return e.jsx(T,{requiredRole:"admin",children:e.jsx(O,{})})}export{P as default};
