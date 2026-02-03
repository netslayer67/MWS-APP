import{r as n,b as x,j as a,H as p,m as i,t as f,w as h,p as y,I as k,J as v}from"./index-BH3Cl4N6.js";import{A as w}from"./AnimatedPage-BkUYU0ps.js";import{C as d}from"./camera-DpfsMb6F.js";import{C as j}from"./check-CHmK610p.js";import{E as N}from"./eye-v8mgZw8I.js";import{B as S}from"./brain-B9jBBd7O.js";import{Z as z}from"./zap-BECm_PpK.js";const m=n.memo(()=>a.jsx("style",{children:`
        @keyframes saiBgShift{
            0%{background-position:0% 0%}
            25%{background-position:50% 100%}
            50%{background-position:100% 50%}
            75%{background-position:50% 0%}
            100%{background-position:0% 0%}
        }
        .sai-bg{
            background-size:300% 300%;
            animation:saiBgShift 16s ease infinite;
        }
        :is(.dark) .sai-bg{ animation:none; }

        .sai-grid{
            background-image:radial-gradient(circle,rgba(0,0,0,.04) 1px,transparent 1px);
            background-size:24px 24px;
        }
        :is(.dark) .sai-grid{
            background-image:radial-gradient(circle,rgba(255,255,255,.035) 1px,transparent 1px);
        }

        @keyframes saiTextShimmer{
            0%{background-position:0% 50%}
            50%{background-position:100% 50%}
            100%{background-position:0% 50%}
        }
        .sai-title{
            font-family:'Nunito','Inter',system-ui,sans-serif;
            background-size:200% 200%;
            animation:saiTextShimmer 4s ease infinite;
            -webkit-background-clip:text;
            -webkit-text-fill-color:transparent;
            background-clip:text;
        }

        .sai-font{
            font-family:'Nunito','Inter',system-ui,-apple-system,sans-serif;
            letter-spacing:-0.01em;
        }

        @keyframes saiBlob{
            0%,100%{transform:translate(0,0) scale(1) rotate(0deg)}
            25%{transform:translate(12px,-8px) scale(1.04) rotate(1deg)}
            50%{transform:translate(-4px,10px) scale(.97) rotate(-1deg)}
            75%{transform:translate(-10px,-4px) scale(1.02) rotate(.5deg)}
        }

        @keyframes saiFloat{
            0%,100%{transform:translateY(0) scale(1);opacity:.55}
            50%{transform:translateY(-10px) scale(1.12);opacity:.85}
        }
        @keyframes saiPulse{
            0%,100%{transform:scale(1);opacity:.4}
            50%{transform:scale(1.25);opacity:.7}
        }
        @keyframes saiSpin{
            from{transform:rotate(0deg)}to{transform:rotate(360deg)}
        }
        @keyframes saiDrift{
            0%,100%{transform:translateX(0) translateY(0)}
            33%{transform:translateX(6px) translateY(-4px)}
            66%{transform:translateX(-4px) translateY(6px)}
        }
        @keyframes saiOrbit{
            from{transform:rotate(0deg) translateX(40px) rotate(0deg)}
            to{transform:rotate(360deg) translateX(40px) rotate(-360deg)}
        }
    `}));m.displayName="ScopedStyles";const A=[{t:"dot",top:"6%",left:"6%",sz:7,cl:"bg-sky-300 dark:bg-sky-500/25",anim:"saiFloat",dur:4,del:0},{t:"dot",top:"14%",right:"8%",sz:6,cl:"bg-violet-300 dark:bg-violet-500/25",anim:"saiFloat",dur:5,del:1},{t:"dot",top:"45%",left:"3%",sz:8,cl:"bg-blue-300 dark:bg-blue-500/25",anim:"saiFloat",dur:4.5,del:.5},{t:"dot",top:"70%",right:"5%",sz:5,cl:"bg-pink-300 dark:bg-pink-500/25",anim:"saiFloat",dur:5.5,del:2},{t:"dot",top:"88%",left:"10%",sz:6,cl:"bg-indigo-300 dark:bg-indigo-500/25",anim:"saiFloat",dur:3.8,del:1.5},{t:"ring",top:"10%",left:"20%",sz:13,cl:"border-sky-300/50 dark:border-sky-500/20",anim:"saiPulse",dur:5,del:.3},{t:"ring",top:"55%",right:"8%",sz:11,cl:"border-violet-300/50 dark:border-violet-500/20",anim:"saiPulse",dur:6,del:1.8},{t:"cross",top:"25%",left:"5%",sz:9,cl:"bg-blue-300/60 dark:bg-blue-500/20",anim:"saiSpin",dur:12,del:0},{t:"cross",top:"75%",right:"6%",sz:8,cl:"bg-purple-300/60 dark:bg-purple-500/20",anim:"saiSpin",dur:15,del:2},{t:"diamond",top:"18%",right:"18%",sz:7,cl:"bg-cyan-300/50 dark:bg-cyan-500/20",anim:"saiDrift",dur:6,del:1},{t:"diamond",top:"60%",left:"12%",sz:6,cl:"bg-pink-300/50 dark:bg-pink-500/20",anim:"saiDrift",dur:7,del:2.5},{t:"diamond",top:"85%",right:"22%",sz:6,cl:"bg-indigo-300/50 dark:bg-indigo-500/20",anim:"saiDrift",dur:6,del:3}],c=n.memo(({p:e})=>{const r={top:e.top,bottom:e.bottom,left:e.left,right:e.right},s="absolute pointer-events-none",o={animation:`${e.anim} ${e.dur}s ease-in-out infinite`,animationDelay:`${e.del}s`};return e.t==="ring"?a.jsx("div",{className:`${s} rounded-full border-[1.5px] ${e.cl}`,style:{...r,width:e.sz,height:e.sz,...o}}):e.t==="cross"?a.jsxs("div",{className:s,style:{...r,width:e.sz,height:e.sz,...o},children:[a.jsx("div",{className:`absolute top-1/2 left-0 w-full h-[1.5px] -translate-y-1/2 rounded-full ${e.cl}`}),a.jsx("div",{className:`absolute left-1/2 top-0 h-full w-[1.5px] -translate-x-1/2 rounded-full ${e.cl}`})]}):e.t==="diamond"?a.jsx("div",{className:`${s} ${e.cl} rounded-[1px]`,style:{...r,width:e.sz,height:e.sz,transform:"rotate(45deg)",...o}}):a.jsx("div",{className:`${s} rounded-full ${e.cl}`,style:{...r,width:e.sz,height:e.sz,...o}})});c.displayName="Particle";const I=[{icon:N,title:"Face Emotion Scan",desc:"Camera reads your expressions in real-time",gradient:"from-sky-400 to-blue-500",shadow:"shadow-sky-400/25"},{icon:S,title:"AI Mood Analysis",desc:"Smart insights about how you're feeling",gradient:"from-violet-400 to-purple-500",shadow:"shadow-violet-400/25"},{icon:z,title:"Instant Results",desc:"Get your emotional report in seconds",gradient:"from-amber-400 to-orange-500",shadow:"shadow-amber-400/25"},{icon:y,title:"100% Private",desc:"Nothing is stored — your face stays safe",gradient:"from-emerald-400 to-teal-500",shadow:"shadow-emerald-400/25"}],C=n.memo(function(){const r=x(),[s,o]=n.useState(!1),[u,g]=n.useState(!0);return n.useEffect(()=>{(async()=>{try{(await v.getTodayCheckinStatus()).data.status?.hasAICheckin&&o(!0)}catch{}finally{g(!1)}})()},[]),a.jsxs(w,{children:[a.jsx(p,{children:a.jsx("title",{children:"AI Emotional Analysis - Millennia World School"})}),a.jsx(m,{}),a.jsxs("div",{className:"sai-bg sai-font min-h-screen relative overflow-hidden bg-gradient-to-br from-sky-50 via-violet-50 via-50% to-indigo-50 dark:from-background dark:via-background dark:to-background",children:[a.jsx("div",{className:"sai-grid absolute inset-0 pointer-events-none"}),a.jsxs("div",{className:"absolute inset-0 pointer-events-none overflow-hidden",children:[a.jsx("div",{className:"absolute -top-20 -right-16 w-80 sm:w-[400px] h-80 sm:h-[400px] rounded-full blur-3xl bg-gradient-to-br from-sky-200/50 via-blue-200/35 to-indigo-100/25 dark:from-sky-500/8 dark:via-blue-500/4 dark:to-transparent",style:{animation:"saiBlob 10s ease-in-out infinite"}}),a.jsx("div",{className:"absolute -bottom-16 -left-16 w-72 sm:w-[370px] h-72 sm:h-[370px] rounded-full blur-3xl bg-gradient-to-br from-violet-200/50 via-purple-200/35 to-pink-100/25 dark:from-violet-500/8 dark:via-purple-500/4 dark:to-transparent",style:{animation:"saiBlob 12s ease-in-out infinite",animationDelay:"3s"}}),a.jsx("div",{className:"absolute top-1/3 left-1/2 -translate-x-1/2 w-60 sm:w-80 h-60 sm:h-80 rounded-full blur-3xl bg-gradient-to-br from-blue-100/45 via-cyan-100/25 to-transparent dark:from-blue-500/5 dark:to-transparent",style:{animation:"saiBlob 9s ease-in-out infinite",animationDelay:"1.5s"}}),a.jsx("div",{className:"absolute bottom-[15%] right-[5%] w-56 sm:w-68 h-56 sm:h-68 rounded-full blur-3xl bg-gradient-to-br from-pink-100/40 via-rose-100/25 to-transparent dark:from-pink-500/5 dark:to-transparent",style:{animation:"saiBlob 11s ease-in-out infinite",animationDelay:"5s"}}),a.jsx("div",{className:"absolute top-[8%] -left-10 w-48 sm:w-60 h-48 sm:h-60 rounded-full blur-3xl bg-gradient-to-br from-indigo-100/40 via-blue-100/20 to-transparent dark:from-indigo-500/5 dark:to-transparent",style:{animation:"saiBlob 8s ease-in-out infinite",animationDelay:"2s"}}),A.map((t,l)=>a.jsx(c,{p:t},l))]}),a.jsxs("div",{className:"relative z-10 flex flex-col items-center px-4 py-6 sm:py-10 max-w-lg mx-auto min-h-screen",children:[a.jsxs(i.button,{initial:{opacity:0,x:-10},animate:{opacity:1,x:0},onClick:()=>r("/student/emotional-checkin"),className:"self-start flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors mb-6 font-semibold",children:[a.jsx(f,{className:"w-4 h-4"}),a.jsx("span",{children:"Back"})]}),a.jsxs(i.div,{initial:{opacity:0,scale:.9},animate:{opacity:1,scale:1},transition:{duration:.4,ease:"easeOut"},className:"relative w-32 h-32 sm:w-40 sm:h-40 mb-6",children:[a.jsx("div",{className:"absolute inset-0 rounded-full bg-gradient-to-br from-sky-200/60 via-violet-200/40 to-pink-200/30 dark:from-sky-500/10 dark:via-violet-500/8 dark:to-pink-500/5 backdrop-blur-sm"}),a.jsx("div",{className:"absolute inset-3 sm:inset-4 rounded-full bg-gradient-to-br from-sky-400 via-blue-500 to-violet-500 flex items-center justify-center shadow-xl shadow-blue-500/30",children:a.jsx(d,{className:"w-10 h-10 sm:w-12 sm:h-12 text-white"})}),a.jsx("div",{className:"absolute inset-0",style:{animation:"saiOrbit 8s linear infinite"},children:a.jsx("div",{className:"w-3 h-3 rounded-full bg-gradient-to-br from-pink-400 to-rose-400 shadow-lg shadow-pink-400/40"})}),a.jsx("div",{className:"absolute inset-0",style:{animation:"saiOrbit 12s linear infinite reverse",animationDelay:"2s"},children:a.jsx("div",{className:"w-2.5 h-2.5 rounded-full bg-gradient-to-br from-amber-400 to-orange-400 shadow-lg shadow-amber-400/40"})})]}),a.jsxs(i.div,{initial:{opacity:0,y:15},animate:{opacity:1,y:0},transition:{duration:.35,delay:.1},className:"text-center mb-6",children:[a.jsxs("div",{className:"inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/70 dark:bg-white/8 border border-gray-200/40 dark:border-white/10 backdrop-blur-sm mb-3 shadow-sm",children:[a.jsx(h,{className:"w-3 h-3 text-sky-500"}),a.jsx("span",{className:"text-[10px] font-extrabold tracking-widest text-sky-600 dark:text-sky-400 uppercase",children:"AI Analysis"})]}),a.jsx("h1",{className:"text-2xl sm:text-3xl font-black leading-tight mb-2",children:a.jsx("span",{className:"sai-title bg-gradient-to-r from-sky-500 via-blue-500 via-40% to-violet-500 dark:from-sky-400 dark:via-blue-400 dark:to-violet-400",children:"AI Emotional Scan"})}),a.jsx("p",{className:"text-[13px] text-gray-400 dark:text-gray-500 font-medium leading-relaxed max-w-sm mx-auto",children:"Let our AI read your expressions and give you friendly insights about how you're feeling today."})]}),!u&&s&&a.jsxs(i.div,{initial:{opacity:0,y:10},animate:{opacity:1,y:0},className:"w-full backdrop-blur-xl bg-gradient-to-r from-emerald-50/90 to-teal-50/70 dark:from-emerald-900/20 dark:to-teal-900/10 border border-emerald-200/50 dark:border-emerald-700/40 rounded-2xl p-4 mb-5 flex items-center gap-3",children:[a.jsx(j,{className:"w-5 h-5 text-emerald-500 flex-shrink-0"}),a.jsx("p",{className:"text-sm font-bold text-emerald-600 dark:text-emerald-400",children:"You've already completed your AI analysis today!"})]}),a.jsx(i.div,{initial:{opacity:0,y:15},animate:{opacity:1,y:0},transition:{duration:.35,delay:.2},className:"w-full grid grid-cols-2 gap-3 mb-6",children:I.map((t,l)=>{const b=t.icon;return a.jsxs(i.div,{initial:{opacity:0,y:10},animate:{opacity:1,y:0},transition:{delay:.25+l*.08},className:"backdrop-blur-xl bg-white/55 dark:bg-white/5 border border-white/70 dark:border-white/10 rounded-2xl p-3.5 shadow-sm",children:[a.jsx("div",{className:`w-9 h-9 rounded-xl bg-gradient-to-br ${t.gradient} flex items-center justify-center shadow-lg ${t.shadow} mb-2`,children:a.jsx(b,{className:"w-4 h-4 text-white"})}),a.jsx("p",{className:"text-xs font-bold text-gray-700 dark:text-white mb-0.5",children:t.title}),a.jsx("p",{className:"text-[10px] text-gray-400 dark:text-gray-500 font-medium leading-snug",children:t.desc})]},t.title)})}),a.jsxs(i.div,{initial:{opacity:0,y:10},animate:{opacity:1,y:0},transition:{delay:.5},className:"w-full",children:[a.jsxs(k,{type:"button",onClick:()=>r("/student/emotional-checkin/face-scan"),disabled:s,className:"w-full rounded-xl bg-gradient-to-r from-sky-500 via-blue-500 to-violet-500 hover:from-sky-600 hover:via-blue-600 hover:to-violet-600 text-white font-extrabold shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 py-3",children:[a.jsx(d,{className:"w-4 h-4 mr-2"}),s?"AI Analysis Completed":"Start Face Scan"]}),a.jsx("p",{className:"text-center text-[10px] text-gray-400 dark:text-gray-500 font-medium mt-2",children:"Your camera will open — no photos are saved"})]}),a.jsx(i.p,{initial:{opacity:0},animate:{opacity:1},transition:{delay:.6},className:"mt-auto pt-8 text-[10px] text-gray-300 dark:text-gray-600 tracking-wide font-semibold",children:"Millennia World School"})]})]})]})});C.displayName="StudentAICheckinPage";export{C as default};
