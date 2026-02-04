import{r as i,b as m,j as e,H as c,m as o,w as b,v as u,ag as g}from"./index-Z8dj6zX8.js";import{A as h}from"./AnimatedPage-C_PSvSdH.js";import{B as x}from"./book-open-C7nHHV-I.js";import{A as p}from"./arrow-right-CMkz8YtS.js";import{Z as f}from"./zap-kYlOhOYS.js";const k=[{id:"emotional-checkin",title:"Emotional Check-in",description:"Quick mood check or AI facial analysis",icon:u,path:"/student/emotional-checkin",tag:"Wellness",iconBg:"from-rose-400 to-orange-400",cardAccent:"from-rose-400/25 via-pink-300/15 to-transparent",tagStyle:"text-rose-600 bg-rose-500/10 dark:text-rose-400 dark:bg-rose-500/15",iconShadow:"shadow-rose-400/30"},{id:"mtss-portal",title:"MTSS Student Portal",description:"Progress tracking & mentor connections",icon:x,path:"/mtss/student-portal",tag:"Learning",iconBg:"from-violet-400 to-blue-400",cardAccent:"from-violet-400/25 via-blue-300/15 to-transparent",tagStyle:"text-violet-600 bg-violet-500/10 dark:text-violet-400 dark:bg-violet-500/15",iconShadow:"shadow-violet-400/30"}],n=i.memo(()=>e.jsx("style",{children:`
        /* ── Animated gradient background ── */
        @keyframes shubBgShift{
            0%{background-position:0% 0%}
            25%{background-position:50% 100%}
            50%{background-position:100% 50%}
            75%{background-position:50% 0%}
            100%{background-position:0% 0%}
        }
        .shub-bg{
            background-size:300% 300%;
            animation:shubBgShift 16s ease infinite;
        }
        :is(.dark) .shub-bg{
            animation:none;
        }

        /* ── Dot-grid ── */
        .shub-grid{
            background-image:radial-gradient(circle,rgba(0,0,0,.04) 1px,transparent 1px);
            background-size:24px 24px;
        }
        :is(.dark) .shub-grid{
            background-image:radial-gradient(circle,rgba(255,255,255,.035) 1px,transparent 1px);
        }

        /* ── Heading shimmer gradient ── */
        @keyframes shubTextShimmer{
            0%{background-position:0% 50%}
            50%{background-position:100% 50%}
            100%{background-position:0% 50%}
        }
        .shub-title{
            font-family:'Nunito','Inter',system-ui,sans-serif;
            background-size:200% 200%;
            animation:shubTextShimmer 4s ease infinite;
            -webkit-background-clip:text;
            -webkit-text-fill-color:transparent;
            background-clip:text;
        }

        /* ── Font override for entire hub ── */
        .shub-font{
            font-family:'Nunito','Inter',system-ui,-apple-system,sans-serif;
            letter-spacing:-0.01em;
        }

        /* ── Blob movement ── */
        @keyframes shubBlob{
            0%,100%{transform:translate(0,0) scale(1) rotate(0deg)}
            25%{transform:translate(12px,-8px) scale(1.04) rotate(1deg)}
            50%{transform:translate(-4px,10px) scale(.97) rotate(-1deg)}
            75%{transform:translate(-10px,-4px) scale(1.02) rotate(.5deg)}
        }

        /* ── Particles ── */
        @keyframes shubFloat{
            0%,100%{transform:translateY(0) scale(1);opacity:.55}
            50%{transform:translateY(-10px) scale(1.12);opacity:.85}
        }
        @keyframes shubSpin{
            from{transform:rotate(0deg)}to{transform:rotate(360deg)}
        }
        @keyframes shubPulse{
            0%,100%{transform:scale(1);opacity:.4}
            50%{transform:scale(1.25);opacity:.7}
        }
        @keyframes shubDrift{
            0%,100%{transform:translateX(0) translateY(0)}
            33%{transform:translateX(6px) translateY(-4px)}
            66%{transform:translateX(-4px) translateY(6px)}
        }

        /* ── Card interaction ── */
        .shub-card{
            transition:transform .3s cubic-bezier(.22,.68,0,1.1),box-shadow .3s ease;
        }
        .shub-card:active{transform:scale(.97)}
        @media(hover:hover){.shub-card:hover{transform:translateY(-4px)}}
    `}));n.displayName="ScopedStyles";const y=[{t:"dot",top:"6%",left:"7%",sz:8,cl:"bg-rose-300 dark:bg-rose-500/25",anim:"shubFloat",dur:4,del:0},{t:"dot",top:"14%",right:"10%",sz:6,cl:"bg-amber-300 dark:bg-amber-500/25",anim:"shubFloat",dur:5,del:1},{t:"dot",top:"38%",left:"4%",sz:7,cl:"bg-violet-300 dark:bg-violet-500/25",anim:"shubFloat",dur:4.5,del:.5},{t:"dot",top:"60%",right:"6%",sz:9,cl:"bg-sky-300 dark:bg-sky-500/25",anim:"shubFloat",dur:5.5,del:2},{t:"dot",top:"80%",left:"12%",sz:5,cl:"bg-emerald-300 dark:bg-emerald-500/25",anim:"shubFloat",dur:3.8,del:1.5},{t:"dot",top:"75%",right:"15%",sz:6,cl:"bg-orange-300 dark:bg-orange-500/25",anim:"shubFloat",dur:4.2,del:.8},{t:"dot",top:"48%",right:"3%",sz:5,cl:"bg-pink-300 dark:bg-pink-500/25",anim:"shubFloat",dur:5,del:2.5},{t:"dot",top:"92%",left:"30%",sz:7,cl:"bg-teal-300 dark:bg-teal-500/25",anim:"shubFloat",dur:4.8,del:1.2},{t:"ring",top:"10%",left:"20%",sz:14,cl:"border-rose-300/50 dark:border-rose-500/20",anim:"shubPulse",dur:5,del:.3},{t:"ring",top:"50%",right:"10%",sz:12,cl:"border-violet-300/50 dark:border-violet-500/20",anim:"shubPulse",dur:6,del:1.8},{t:"ring",top:"85%",left:"8%",sz:10,cl:"border-amber-300/50 dark:border-amber-500/20",anim:"shubPulse",dur:4.5,del:2.5},{t:"ring",top:"30%",right:"5%",sz:16,cl:"border-sky-300/40 dark:border-sky-500/15",anim:"shubPulse",dur:7,del:.8},{t:"cross",top:"22%",left:"6%",sz:10,cl:"bg-fuchsia-300/60 dark:bg-fuchsia-500/20",anim:"shubSpin",dur:12,del:0},{t:"cross",top:"65%",right:"8%",sz:8,cl:"bg-emerald-300/60 dark:bg-emerald-500/20",anim:"shubSpin",dur:15,del:2},{t:"cross",top:"45%",left:"10%",sz:9,cl:"bg-amber-300/60 dark:bg-amber-500/20",anim:"shubSpin",dur:18,del:4},{t:"diamond",top:"16%",right:"18%",sz:8,cl:"bg-orange-300/50 dark:bg-orange-500/20",anim:"shubDrift",dur:6,del:1},{t:"diamond",top:"70%",left:"18%",sz:7,cl:"bg-sky-300/50 dark:bg-sky-500/20",anim:"shubDrift",dur:7,del:2.5},{t:"diamond",top:"55%",left:"25%",sz:6,cl:"bg-rose-300/50 dark:bg-rose-500/20",anim:"shubDrift",dur:5.5,del:.5},{t:"diamond",top:"35%",right:"15%",sz:5,cl:"bg-yellow-300/60 dark:bg-yellow-500/20",anim:"shubPulse",dur:4,del:1.5},{t:"diamond",top:"88%",right:"25%",sz:6,cl:"bg-violet-300/50 dark:bg-violet-500/20",anim:"shubDrift",dur:6,del:3}],l=i.memo(({p:t})=>{const s={top:t.top,bottom:t.bottom,left:t.left,right:t.right},a="absolute pointer-events-none",r={animation:`${t.anim} ${t.dur}s ease-in-out infinite`,animationDelay:`${t.del}s`};return t.t==="ring"?e.jsx("div",{className:`${a} rounded-full border-[1.5px] ${t.cl}`,style:{...s,width:t.sz,height:t.sz,...r}}):t.t==="cross"?e.jsxs("div",{className:a,style:{...s,width:t.sz,height:t.sz,...r},children:[e.jsx("div",{className:`absolute top-1/2 left-0 w-full h-[1.5px] -translate-y-1/2 rounded-full ${t.cl}`}),e.jsx("div",{className:`absolute left-1/2 top-0 h-full w-[1.5px] -translate-x-1/2 rounded-full ${t.cl}`})]}):t.t==="diamond"?e.jsx("div",{className:`${a} ${t.cl} rounded-[1px]`,style:{...s,width:t.sz,height:t.sz,transform:"rotate(45deg)",...r}}):e.jsx("div",{className:`${a} rounded-full ${t.cl}`,style:{...s,width:t.sz,height:t.sz,...r}})});l.displayName="Particle";const v=i.memo(()=>{const t=m(),s=i.useCallback(a=>t(a),[t]);return e.jsxs(h,{children:[e.jsx(c,{children:e.jsx("title",{children:"Student Support Hub - Millennia World School"})}),e.jsx(n,{}),e.jsxs("div",{className:"shub-bg shub-font min-h-screen relative overflow-hidden bg-gradient-to-br from-amber-50 via-rose-50 via-50% to-violet-50 dark:from-background dark:via-background dark:to-background",children:[e.jsx("div",{className:"shub-grid absolute inset-0 pointer-events-none"}),e.jsxs("div",{className:"absolute inset-0 pointer-events-none overflow-hidden",children:[e.jsx("div",{className:"absolute -top-20 -right-16 w-80 sm:w-[420px] h-80 sm:h-[420px] rounded-full blur-3xl bg-gradient-to-br from-rose-200/50 via-orange-200/35 to-amber-100/25 dark:from-rose-500/8 dark:via-orange-500/4 dark:to-transparent",style:{animation:"shubBlob 10s ease-in-out infinite"}}),e.jsx("div",{className:"absolute -bottom-16 -left-16 w-72 sm:w-[380px] h-72 sm:h-[380px] rounded-full blur-3xl bg-gradient-to-br from-violet-200/50 via-blue-200/35 to-sky-100/25 dark:from-violet-500/8 dark:via-blue-500/4 dark:to-transparent",style:{animation:"shubBlob 12s ease-in-out infinite",animationDelay:"3s"}}),e.jsx("div",{className:"absolute top-1/3 left-1/2 -translate-x-1/2 w-64 sm:w-80 h-64 sm:h-80 rounded-full blur-3xl bg-gradient-to-br from-amber-100/45 via-yellow-100/25 to-transparent dark:from-amber-500/5 dark:to-transparent",style:{animation:"shubBlob 9s ease-in-out infinite",animationDelay:"1.5s"}}),e.jsx("div",{className:"absolute bottom-[10%] right-[5%] w-60 sm:w-72 h-60 sm:h-72 rounded-full blur-3xl bg-gradient-to-br from-emerald-100/40 via-teal-100/25 to-transparent dark:from-emerald-500/5 dark:to-transparent",style:{animation:"shubBlob 11s ease-in-out infinite",animationDelay:"5s"}}),e.jsx("div",{className:"absolute top-[5%] -left-10 w-52 sm:w-64 h-52 sm:h-64 rounded-full blur-3xl bg-gradient-to-br from-pink-100/40 via-fuchsia-100/20 to-transparent dark:from-pink-500/5 dark:to-transparent",style:{animation:"shubBlob 8s ease-in-out infinite",animationDelay:"2s"}}),e.jsx("div",{className:"absolute top-[55%] -right-8 w-48 sm:w-60 h-48 sm:h-60 rounded-full blur-3xl bg-gradient-to-br from-indigo-100/35 via-violet-100/20 to-transparent dark:from-indigo-500/5 dark:to-transparent",style:{animation:"shubBlob 13s ease-in-out infinite",animationDelay:"4s"}}),y.map((a,r)=>e.jsx(l,{p:a},r))]}),e.jsxs("div",{className:"relative z-10 flex flex-col items-center justify-center px-4 pt-12 pb-10 sm:pt-20 sm:pb-16 min-h-screen",children:[e.jsxs(o.div,{initial:{opacity:0,y:16},animate:{opacity:1,y:0},transition:{duration:.4},className:"text-center mb-5 sm:mb-7 max-w-lg",children:[e.jsxs("div",{className:"inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/70 dark:bg-white/8 border border-gray-200/40 dark:border-white/10 backdrop-blur-sm mb-4 shadow-sm",children:[e.jsx(b,{className:"w-3 h-3 text-amber-500"}),e.jsx("span",{className:"text-[11px] font-extrabold tracking-wide text-gray-500 dark:text-gray-400 uppercase",children:"Student Hub"})]}),e.jsxs("h1",{className:"text-[1.65rem] sm:text-4xl font-black leading-tight mb-2",children:[e.jsx("span",{className:"text-gray-700 dark:text-white",children:"Hey there "}),e.jsx(o.span,{className:"inline-block origin-bottom-right",animate:{rotate:[0,14,-8,14,-4,10,0]},transition:{duration:2,repeat:1/0,repeatDelay:3,ease:"easeInOut"},role:"img","aria-label":"wave",children:"👋"}),e.jsx("br",{}),e.jsx("span",{className:"shub-title bg-gradient-to-r from-rose-500 via-amber-500 via-40% to-violet-500 dark:from-rose-400 dark:via-amber-400 dark:to-violet-400",children:"Ready to shine today?"})]}),e.jsx("p",{className:"text-[13px] sm:text-sm text-gray-400 dark:text-gray-500 font-medium leading-relaxed",children:"Pick how you want to start — we've got your back!"})]}),e.jsx(o.div,{initial:{opacity:0,scale:.95},animate:{opacity:1,scale:1},transition:{duration:.35,delay:.12},className:"flex items-center gap-2 sm:gap-3 mb-7 sm:mb-9",children:[{emoji:"😊",label:"Happy",bg:"hover:bg-amber-50 dark:hover:bg-amber-500/10"},{emoji:"😌",label:"Calm",bg:"hover:bg-emerald-50 dark:hover:bg-emerald-500/10"},{emoji:"🤔",label:"Thinking",bg:"hover:bg-violet-50 dark:hover:bg-violet-500/10"},{emoji:"💪",label:"Strong",bg:"hover:bg-rose-50 dark:hover:bg-rose-500/10"}].map(a=>e.jsxs("button",{onClick:()=>s("/student/emotional-checkin"),className:`flex flex-col items-center gap-0.5 px-3 py-2 rounded-2xl bg-white/60 dark:bg-white/5 border border-white/80 dark:border-white/8 ${a.bg} hover:shadow-md hover:-translate-y-1 active:scale-95 transition-all duration-200 cursor-pointer backdrop-blur-sm`,title:a.label,children:[e.jsx("span",{className:"text-xl sm:text-2xl select-none",children:a.emoji}),e.jsx("span",{className:"text-[9px] font-bold text-gray-400 dark:text-gray-500 tracking-wide uppercase",children:a.label})]},a.emoji))}),e.jsx("div",{className:"w-full max-w-md space-y-3 sm:space-y-4",children:k.map((a,r)=>{const d=a.icon;return e.jsxs(o.button,{initial:{opacity:0,y:20},animate:{opacity:1,y:0},transition:{duration:.4,delay:.2+r*.1},onClick:()=>s(a.path),className:"shub-card w-full relative overflow-hidden rounded-2xl sm:rounded-3xl text-left bg-white/65 dark:bg-white/[0.04] backdrop-blur-xl border border-white/90 dark:border-white/8 shadow-sm hover:shadow-xl p-4 sm:p-5 group",children:[e.jsx("div",{className:`absolute -top-10 -left-10 w-36 h-36 rounded-full bg-gradient-to-br ${a.cardAccent} blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-700`}),e.jsx("div",{className:`absolute -bottom-8 -right-8 w-28 h-28 rounded-full bg-gradient-to-tl ${a.cardAccent} blur-2xl pointer-events-none opacity-50 group-hover:opacity-80 transition-opacity duration-500`}),e.jsxs("div",{className:"relative z-10 flex items-center gap-3.5 sm:gap-4",children:[e.jsx("div",{className:`flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br ${a.iconBg} flex items-center justify-center shadow-lg ${a.iconShadow} group-hover:scale-110 transition-transform duration-300`,children:e.jsx(d,{className:"w-5 h-5 sm:w-6 sm:h-6 text-white"})}),e.jsxs("div",{className:"flex-1 min-w-0",children:[e.jsxs("div",{className:"flex items-center gap-2 mb-0.5",children:[e.jsx("h3",{className:"text-sm sm:text-base font-extrabold text-gray-800 dark:text-white truncate",children:a.title}),e.jsx("span",{className:`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded ${a.tagStyle}`,children:a.tag})]}),e.jsx("p",{className:"text-[11px] sm:text-xs text-gray-400 dark:text-gray-500 leading-snug font-medium",children:a.description})]}),e.jsx("div",{className:"flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-50/80 dark:bg-white/8 flex items-center justify-center group-hover:bg-gray-100 dark:group-hover:bg-white/12 transition-all duration-200 group-hover:translate-x-0.5",children:e.jsx(p,{className:"w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300 transition-colors"})})]})]},a.id)})}),e.jsx(o.div,{initial:{opacity:0,y:8},animate:{opacity:1,y:0},transition:{delay:.45,duration:.35},className:"mt-8 sm:mt-10 w-full max-w-md",children:e.jsxs("div",{className:"flex items-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-amber-50/80 via-orange-50/60 to-yellow-50/40 dark:from-amber-900/10 dark:via-orange-900/5 dark:to-transparent border border-amber-100/60 dark:border-amber-800/20 backdrop-blur-sm",children:[e.jsx("div",{className:"flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-amber-300 to-orange-400 flex items-center justify-center shadow-sm",children:e.jsx(f,{className:"w-4 h-4 text-white"})}),e.jsxs("div",{className:"flex-1 min-w-0",children:[e.jsx("p",{className:"text-[11px] font-extrabold text-amber-700/80 dark:text-amber-400/80",children:"Daily Tip"}),e.jsx("p",{className:"text-[10px] text-amber-600/60 dark:text-amber-500/50 leading-snug font-medium",children:"Take a moment to check in with yourself. Your feelings matter!"})]}),e.jsx(g,{className:"w-4 h-4 text-amber-300 flex-shrink-0"})]})}),e.jsx(o.p,{initial:{opacity:0},animate:{opacity:1},transition:{delay:.6},className:"mt-6 text-[10px] text-gray-300 dark:text-gray-600 tracking-wide font-semibold",children:"Millennia World School"})]})]})]})});v.displayName="StudentSupportHubPage";export{v as default};
