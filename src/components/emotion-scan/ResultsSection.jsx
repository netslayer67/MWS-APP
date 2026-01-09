
import React, { memo, useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import {
    Sparkles,
    Activity,
    HeartHandshake,
    RefreshCcw,
    Quote,
    Brain,
    Compass,
    Wind,
    CloudSun,
    CloudRain,
    Sun,
    Moon,
    ArrowUpRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import EmotionsDetected from "./results/EmotionsDetected";
import MicroExpressions from "./results/MicroExpressions";
import UserReflectionInput from "./results/UserReflectionInput";
import SupportSelector from "@/components/emotion-staff/SupportSelector";

const defaultHints = {
    gradientCss: "linear-gradient(135deg, rgba(245,243,255,0.92) 0%, rgba(237,233,254,0.85) 52%, rgba(255,255,255,0.92) 100%)",
    glassColor: "rgba(255,255,255,0.92)",
    borderColor: "rgba(148, 163, 184, 0.35)",
    accentColor: "#8b5cf6",
    animationAnchor: "fade-up",
    badges: []
};

const colorTokens = {
    berry: "var(--mtss-pop-berry)",
    peach: "var(--mtss-pop-peach)",
    sky: "var(--mtss-pop-sky)",
    lime: "var(--mtss-pop-lime)",
    gold: "hsl(var(--gold))",
    emerald: "hsl(var(--emerald))",
    accent: "hsl(var(--accent))",
    secondary: "hsl(var(--secondary))",
    foreground: "hsl(var(--foreground))"
};
const moodTokenMap = {
    balanced: {
        heroGradient: `linear-gradient(135deg, ${colorTokens.sky}, ${colorTokens.lime})`,
        panelBg: "linear-gradient(160deg, rgba(255,255,255,0.9), rgba(240,248,255,0.78))",
        panelBorder: "rgba(148,187,233,0.45)",
        chipBg: `linear-gradient(120deg, ${colorTokens.sky}, ${colorTokens.lime})`,
        chipText: "#0f172a",
        track: "rgba(15,23,42,0.12)",
        presenceBar: `linear-gradient(90deg, ${colorTokens.lime}, ${colorTokens.emerald})`,
        capacityBar: `linear-gradient(90deg, ${colorTokens.sky}, ${colorTokens.peach})`,
        panelShadow: "0 28px 75px rgba(15,23,42,0.14)",
        icon: CloudSun
    },
    charged: {
        heroGradient: `linear-gradient(135deg, ${colorTokens.berry}, ${colorTokens.peach})`,
        panelBg: "linear-gradient(150deg, rgba(255,255,255,0.94), rgba(255,236,245,0.75))",
        panelBorder: "rgba(244,114,182,0.45)",
        chipBg: `linear-gradient(120deg, ${colorTokens.berry}, ${colorTokens.peach})`,
        chipText: "#3b0a19",
        track: "rgba(15,15,35,0.18)",
        presenceBar: `linear-gradient(90deg, ${colorTokens.peach}, ${colorTokens.gold})`,
        capacityBar: `linear-gradient(90deg, ${colorTokens.berry}, ${colorTokens.sky})`,
        panelShadow: "0 34px 90px rgba(244,114,182,0.22)",
        icon: Sun
    },
    calm: {
        heroGradient: `linear-gradient(135deg, ${colorTokens.sky}, ${colorTokens.secondary})`,
        panelBg: "linear-gradient(160deg, rgba(255,255,255,0.9), rgba(229,238,255,0.78))",
        panelBorder: "rgba(148,163,184,0.45)",
        chipBg: `linear-gradient(120deg, ${colorTokens.secondary}, ${colorTokens.sky})`,
        chipText: "#0f172a",
        track: "rgba(15,23,42,0.12)",
        presenceBar: `linear-gradient(90deg, ${colorTokens.secondary}, ${colorTokens.sky})`,
        capacityBar: `linear-gradient(90deg, ${colorTokens.sky}, ${colorTokens.lime})`,
        panelShadow: "0 28px 70px rgba(15,23,42,0.12)",
        icon: Moon
    },
    storm: {
        heroGradient: `linear-gradient(135deg, ${colorTokens.secondary}, ${colorTokens.berry})`,
        panelBg: "linear-gradient(165deg, rgba(23,24,40,0.9), rgba(50,18,61,0.75))",
        panelBorder: "rgba(148,163,184,0.35)",
        chipBg: `linear-gradient(120deg, ${colorTokens.secondary}, ${colorTokens.berry})`,
        chipText: "#f8fafc",
        track: "rgba(248,250,252,0.2)",
        presenceBar: `linear-gradient(90deg, ${colorTokens.secondary}, ${colorTokens.berry})`,
        capacityBar: `linear-gradient(90deg, ${colorTokens.berry}, ${colorTokens.peach})`,
        panelShadow: "0 40px 90px rgba(0,0,0,0.45)",
        icon: CloudRain
    },
    radiant: {
        heroGradient: `linear-gradient(135deg, ${colorTokens.peach}, ${colorTokens.gold})`,
        panelBg: "linear-gradient(150deg, rgba(255,255,255,0.95), rgba(255,245,227,0.82))",
        panelBorder: "rgba(250,204,21,0.4)",
        chipBg: `linear-gradient(120deg, ${colorTokens.gold}, ${colorTokens.peach})`,
        chipText: "#7c2d12",
        track: "rgba(15,23,42,0.08)",
        presenceBar: `linear-gradient(90deg, ${colorTokens.gold}, ${colorTokens.peach})`,
        capacityBar: `linear-gradient(90deg, ${colorTokens.peach}, ${colorTokens.sky})`,
        panelShadow: "0 34px 90px rgba(249,115,22,0.22)",
        icon: Sun
    }
};
const weatherMoodMap = {
    "balanced skies": "balanced",
    "steady skies": "balanced",
    "charged currents": "charged",
    stormwatch: "storm",
    "heavy clouds": "storm",
    "gentle tides": "calm",
    "soothing mist": "calm",
    "luminous dawn": "radiant",
    "glowing horizon": "radiant"
};

const emotionMoodMap = {
    joy: "radiant",
    joyful: "radiant",
    excited: "charged",
    energized: "charged",
    anxious: "storm",
    stressed: "storm",
    calm: "calm",
    serene: "calm",
    balanced: "balanced"
};

const laneDescriptions = {
    glide: "Tubuh dan pikiran sedang sinkron. Pertahankan fokus tanpa lupa memberi jeda kreatif.",
    steady: "Ritme kerja stabil. Gunakan struktur untuk menjaga alur langkah demi langkah.",
    sensitive: "Sistem saraf peka. Hindari multitasking dan pilih tugas taktis berdurasi singkat.",
    repair: "Prioritaskan pemulihan. Lakukan pernapasan dan delegasikan hal yang tidak mendesak."
};
const narrativeArchetypes = {
    balancing: {
        heroTitle: "Balanced Emotional State",
        heroSubtitle: "Balanced Skies",
        description: "Kesadaran emosionalmu tersebar merata. Kamu mampu merasakan tanpa tenggelam dan merespon tanpa terburu-buru.",
        energyDescription: "Lane {lane} menunjukkan ritme yang dapat diandalkan untuk menutup prioritas strategis.",
        somaticCue: "Lakukan body scan 60 detik sebelum memasuki rapat agar mikro-tegangan cepat muncul di radar.",
        weatherWatch: "Jika muncul pemicu eksternal, tarik napas 4-4-6 dan perlebar jeda respons.",
        practiceTitle: "Micro Ritual",
        practice: "Ambil tiga siklus pernapasan 4-4-6 setiap pergantian tugas untuk menjaga konsistensi emosi.",
        focus: "Equilibrium",
        attentionCue: "Pertahankan ritme yang lembut namun presisi saat berpindah konteks.",
        energyTemperature: "Temperatur emosi netral hangat.",
        moodVector: "Equilibrium Arc"
    },
    expansion: {
        heroTitle: "Expansive Momentum",
        heroSubtitle: "Charged Currents",
        description: "Ada banyak energi kognitif yang siap diarahkan. Tantangannya adalah menyalurkan tanpa berlebihan.",
        energyDescription: "Lane {lane} menandakan momentum progresif, gunakan untuk ide besar.",
        somaticCue: "Grounding kaki di lantai selama 30 detik mengarahkan energi ke tubuh sebelum pitching.",
        weatherWatch: "Kendalikan dorongan overdrive dengan interval kerja 50/10 untuk menjaga konsentrasi.",
        practiceTitle: "Directional Burst",
        practice: "Tulis dua tujuan penting dan setel alarm mikro untuk mengecek progres tiap 90 menit.",
        focus: "Momentum",
        attentionCue: "Salurkan energi berlebih ke kolaborasi atau mentoring singkat.",
        energyTemperature: "Temperatur emosi hangat tinggi.",
        moodVector: "Expansion Route"
    },
    renewal: {
        heroTitle: "Restorative Window",
        heroSubtitle: "Gentle Tides",
        description: "Tubuh meminta ritme yang lebih lembut. Fokus lembut membantu memulihkan kapasitas kreatif.",
        energyDescription: "Lane {lane} mengajakmu mengatur ulang batasan agar energi kembali pulih.",
        somaticCue: "Lenturkan bahu dan rahang setiap 45 menit untuk melepaskan ketegangan mikro.",
        weatherWatch: "Jadwalkan jeda sunyi tanpa notifikasi minimal 10 menit sebelum sesi berat berikutnya.",
        practiceTitle: "Nourish Break",
        practice: "Minum air hangat dan lakukan journaling singkat mengenai sensasi tubuh sebelum lanjut bekerja.",
        focus: "Restoration",
        attentionCue: "Sisipkan tugas kreatif ringan agar sistem limbik merasa aman.",
        energyTemperature: "Temperatur emosi teduh.",
        moodVector: "Renewal Path"
    },
    grounding: {
        heroTitle: "Grounded Repair",
        heroSubtitle: "Stormwatch",
        description: "Ada turbulensi emosional kecil. Pendekatan sistematis akan membuatmu kembali merasa aman.",
        energyDescription: "Lane {lane} berarti kapasitas perlu diisi ulang terlebih dahulu.",
        somaticCue: "Tekan telapak tangan satu sama lain selama 20 detik untuk menstabilkan sistem saraf.",
        weatherWatch: "Kurangi paparan layar dan batasi keputusan kompleks sampai napas terasa panjang.",
        practiceTitle: "Stability Stack",
        practice: "Terapkan metode 5-4-3-2-1 untuk mengembalikan fokus ke tubuh sebelum merespon pesan sulit.",
        focus: "Stability",
        attentionCue: "Cari co-regulation melalui rekan atau journaling suara.",
        energyTemperature: "Temperatur emosi dingin basah.",
        moodVector: "Grounding Line"
    }
};
const getMoodTokens = (analysis, hints) => {
    const weatherKey = (analysis?.internalWeather || "").toLowerCase();
    const emotionKey = (analysis?.detectedEmotion || "").toLowerCase();
    const laneKey = analysis?.readinessMatrix?.readinessLane;
    const derivedKey =
        weatherMoodMap[weatherKey] ||
        emotionMoodMap[emotionKey] ||
        (laneKey === "glide"
            ? "radiant"
            : laneKey === "repair"
                ? "storm"
                : laneKey === "sensitive"
                    ? "calm"
                    : "balanced");
    const tokens = moodTokenMap[derivedKey] || moodTokenMap.balanced;

    return {
        ...tokens,
        accent: tokens.accent || hints?.accentColor || defaultHints.accentColor
    };
};

const getPanelStyle = (hints, tokens) => ({
    borderColor: tokens?.panelBorder || hints?.borderColor || defaultHints.borderColor,
    background: tokens?.panelBg || hints?.gradientCss || defaultHints.gradientCss,
    color: "inherit",
    backdropFilter: "blur(28px)",
    WebkitBackdropFilter: "blur(28px)",
    boxShadow: tokens?.panelShadow
});

const getReadinessFallback = (analysis) => {
    const presence = analysis?.presenceCapacity?.estimatedPresence || 6;
    const capacity = analysis?.presenceCapacity?.estimatedCapacity || 6;
    const overall = Math.round(((presence + capacity) / 20) * 100);
    return {
        presenceScore: presence,
        capacityScore: capacity,
        overallReadiness: overall,
        readinessLane: overall >= 80 ? "glide" : overall >= 60 ? "steady" : overall >= 40 ? "sensitive" : "repair",
        signals: [
            {
                label: "Presence",
                status: presence >= 7 ? "clear" : presence >= 5 ? "foggy" : "dense",
                idea: presence >= 7 ? "Gunakan kejernihan ini untuk keputusan strategis." : "Buat buffer sunyi 10 menit sebelum tugas penting."
            },
            {
                label: "Capacity",
                status: capacity >= 7 ? "charged" : capacity >= 5 ? "oscillating" : "drained",
                idea: capacity >= 6 ? "Salurkan surplus energi ke kolaborasi." : "Pasangkan blok intens dengan ritual reset singkat."
            }
        ]
    };
};

const buildFallbackNarrativeEngine = (analysis = {}, readiness = getReadinessFallback()) => {
    const lane = readiness.readinessLane || "steady";
    const hasStoryline = Boolean(analysis?.emotionalStoryline);
    const autoArc =
        analysis?.emotionalStoryline?.arc ||
        (lane === "repair"
            ? "grounding"
            : lane === "sensitive"
                ? "renewal"
                : readiness.capacityScore >= 7
                    ? "expansion"
                    : "balancing");
    const archetype = narrativeArchetypes[autoArc] || narrativeArchetypes.balancing;
    const storyline = hasStoryline
        ? analysis.emotionalStoryline
        : {
            title: analysis?.detectedEmotion || archetype.heroTitle,
            chapter: analysis?.internalWeather || archetype.heroSubtitle,
            narrative: analysis?.psychologicalInsight || archetype.description,
            arc: autoArc,
            confidence: analysis?.confidence ?? readiness.overallReadiness,
            colorTone: archetype.focus.toLowerCase()
        };

    const signalSource = analysis?.readinessMatrix?.signals?.length
        ? analysis.readinessMatrix.signals
        : readiness.signals;

    const recommendations = [
        ...signalSource.map((signal) => ({
            title: `${signal.label} - ${signal.status}`,
            description: signal.idea
        })),
        {
            title: archetype.practiceTitle,
            description: archetype.practice
        }
    ];

    const chips = [
        storyline.chapter,
        readiness.readinessLane,
        archetype.focus
    ]
        .filter(Boolean)
        .map((label) => ({ label }));

    const insights = [
        { label: "Lane Insight", detail: laneDescriptions[lane] || laneDescriptions.steady },
        { label: "Somatic Signal", detail: archetype.somaticCue },
        { label: "Momentum", detail: archetype.energyDescription.replace("{lane}", lane) }
    ];

    return {
        storyline,
        heroTitle: storyline.title,
        heroSubtitle: storyline.chapter,
        heroDescription: storyline.narrative,
        chips,
        insights,
        recommendations,
        laneDescriptor: laneDescriptions[lane] || laneDescriptions.steady,
        attentionCue: archetype.attentionCue,
        energyTemperature: archetype.energyTemperature,
        moodVector: archetype.moodVector
    };
};
const ResultsSection = memo(({
    analysis,
    onReset,
    onComplete,
    onSupportChange,
    isRescanDisabled = false,
    remainingRescans = 0,
    maxRescans = 2
}) => {
    useEffect(() => {
        AOS.init({
            once: true,
            duration: 650,
            easing: "ease-out-cubic"
        });
    }, []);

    const rescanStatus = isRescanDisabled
        ? "Kuota scan ulang untuk fitur ini sudah habis."
        : `Sisa kuota scan ulang: ${remainingRescans}/${maxRescans}`;

    const hints = analysis?.displayHints || defaultHints;
    const readiness = analysis?.readinessMatrix || getReadinessFallback(analysis);
    const moodTokens = getMoodTokens(analysis, hints);
    const fallbackEngine = buildFallbackNarrativeEngine(analysis, readiness);
    const storyline = analysis?.emotionalStoryline || {
        title: analysis?.detectedEmotion || "Mindful Awareness",
        chapter: analysis?.internalWeather || "Balanced Skies",
        narrative: analysis?.psychologicalInsight || "Teruskan kebiasaan melakukan check-in emosi ini demi menjaga keseimbangan harianmu.",
        arc: "balancing",
        confidence: analysis?.confidence || 70,
        colorTone: hints?.theme || "lilac"
    };
    const heroDescription = analysis?.psychologicalInsight || storyline.narrative || fallbackEngine.heroDescription;
    const supportCompass = analysis?.supportCompass || {
        needsSupport: readiness.overallReadiness < 55,
        supportLevel: readiness.overallReadiness < 55 ? "active" : "monitor",
        suggestedAllies: ["Peer ally", "Trusted mentor"],
        message: readiness.overallReadiness < 55
            ? "Pertimbangkan untuk menghubungi support contact agar mendapatkan ko-regulasi."
            : "Bagikan energi positifmu ke rekan kerja hari ini.",
        storylineContext: storyline.title
    };
    const heroStyle = {
        ...getPanelStyle(hints, moodTokens),
        backgroundImage: moodTokens.heroGradient,
        borderRadius: "28px",
        padding: "1px"
    };

    const chips = analysis?.insightChips?.length
        ? analysis.insightChips
        : fallbackEngine.chips;

    const recommendations = (analysis?.detailedRecommendations?.length ? analysis.detailedRecommendations : fallbackEngine.recommendations).slice(0, 4);

    const quickStats = [
        {
            label: "Confidence",
            value: `${analysis?.confidence ?? storyline.confidence ?? 70}%`,
            subtext: fallbackEngine.energyTemperature
        },
        {
            label: "Lane",
            value: readiness.readinessLane,
            subtext: fallbackEngine.laneDescriptor
        },
        {
            label: "Fokus Hari Ini",
            value: fallbackEngine.moodVector,
            subtext: fallbackEngine.attentionCue
        }
    ];

    const heroIconContent = analysis?.icon;
    const IconComponent = moodTokens.icon || CloudSun;
    return (
        <section className="space-y-6 text-foreground">
            <div className="grid gap-6 xl:grid-cols-12">
                <div className="space-y-4 xl:col-span-7">
                    <div
                        className="relative border rounded-[30px] p-5 overflow-hidden"
                        style={heroStyle}
                        data-aos={hints.animationAnchor || "fade-up"}
                    >
                        <div className="absolute inset-0 rounded-[28px] bg-white/60 dark:bg-slate-900/70 backdrop-blur-xl" />
                        <div className="absolute inset-0 rounded-[28px] opacity-70 mix-blend-screen" style={{ backgroundImage: moodTokens.heroGradient }} />
                        <div className="absolute -bottom-12 -right-10 w-48 h-48 bg-white/25 dark:bg-white/10 blur-3xl rounded-full" />

                        <div className="relative z-10 space-y-4">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div className="space-y-1">
                                    <p className="text-xs uppercase tracking-[0.35em] text-black/60 dark:text-white/60">
                                        {storyline.chapter}
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white/25 dark:bg-slate-900/50 shadow-inner">
                                            {heroIconContent ? (
                                                typeof heroIconContent === "string" ? (
                                                    <span className="text-4xl leading-none">{heroIconContent}</span>
                                                ) : (
                                                    heroIconContent
                                                )
                                            ) : (
                                                <IconComponent className="w-8 h-8 text-white drop-shadow" />
                                            )}
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-semibold text-black/85 dark:text-white">
                                                {storyline.title}
                                            </h2>
                                            <p className="text-sm text-black/70 dark:text-white/70">
                                                {analysis?.internalWeather || fallbackEngine.heroSubtitle}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right space-y-1">
                                    <p className="text-sm font-semibold text-black/80 dark:text-white">
                                        {readiness.overallReadiness}% Ready
                                    </p>
                                    <p className="text-xs text-black/70 dark:text-white/70">
                                        {fallbackEngine.attentionCue}
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1 text-[11px] font-semibold rounded-full border border-white/70 bg-white/30 dark:bg-white/10 dark:text-white text-black/80">
                                    {analysis?.confidence ?? storyline.confidence ?? 70}% Confidence
                                </span>
                                {chips.map((chip, idx) => (
                                    <span
                                        key={`${chip.label}-${idx}`}
                                        className="px-3 py-1 text-[11px] font-semibold rounded-full text-white shadow-sm"
                                        style={{
                                            backgroundImage: moodTokens.chipBg,
                                            color: moodTokens.chipText || "#fff"
                                        }}
                                    >
                                        {chip.label}
                                    </span>
                                ))}
                            </div>
                            <p className="text-sm leading-relaxed text-black/80 dark:text-white/80">
                                {heroDescription}
                            </p>
                            <div className="grid gap-4 sm:grid-cols-3">
                                {quickStats.map((stat) => (
                                    <div key={stat.label} className="rounded-2xl bg-white/45 dark:bg-slate-900/60 p-3 border border-white/40">
                                        <p className="text-[11px] uppercase tracking-[0.2em] text-black/60 dark:text-white/60">
                                            {stat.label}
                                        </p>
                                        <p className="text-lg font-semibold text-black dark:text-white">{stat.value}</p>
                                        <p className="text-xs text-black/65 dark:text-white/65 leading-snug">{stat.subtext}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2" data-aos="fade-up" data-aos-delay="120">
                        {fallbackEngine.insights.map((insight, idx) => (
                            <div
                                key={insight.label}
                                className="rounded-3xl border p-4 bg-gradient-to-br from-white/90 to-white/60 dark:from-slate-900/70 dark:to-slate-900/50 shadow-glass-md"
                                style={getPanelStyle(hints, moodTokens)}
                                data-aos="fade-up"
                                data-aos-delay={140 + idx * 40}
                            >
                                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-1.5">
                                    <Compass className="w-3.5 h-3.5" />
                                    {insight.label}
                                </p>
                                <p className="mt-2 text-sm leading-relaxed text-foreground/90">{insight.detail}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="space-y-4 xl:col-span-5">
                    <div
                        className="rounded-3xl border shadow-xl p-5 space-y-4"
                        style={getPanelStyle(hints, moodTokens)}
                        data-aos="fade-up"
                        data-aos-delay="80"
                    >
                        <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4 text-muted-foreground" />
                            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Readiness Matrix</span>
                        </div>
                        <div className="grid gap-4">
                            <div>
                                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                    <span>Presence</span>
                                    <span>{readiness.presenceScore}/10</span>
                                </div>
                                <div className="h-2 rounded-full overflow-hidden" style={{ background: moodTokens.track }}>
                                    <div
                                        className="h-full rounded-full"
                                        style={{
                                            width: `${(readiness.presenceScore / 10) * 100}%`,
                                            backgroundImage: moodTokens.presenceBar
                                        }}
                                    />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                    <span>Capacity</span>
                                    <span>{readiness.capacityScore}/10</span>
                                </div>
                                <div className="h-2 rounded-full overflow-hidden" style={{ background: moodTokens.track }}>
                                    <div
                                        className="h-full rounded-full"
                                        style={{
                                            width: `${(readiness.capacityScore / 10) * 100}%`,
                                            backgroundImage: moodTokens.capacityBar
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="rounded-2xl bg-black/5 dark:bg-white/10 p-4 space-y-2">
                                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Lane Focus</p>
                                <p className="text-base font-semibold text-foreground">{readiness.readinessLane}</p>
                                <p className="text-sm text-foreground/80">{fallbackEngine.laneDescriptor}</p>
                            </div>
                        </div>
                        <div className="grid gap-3">
                            {(readiness.signals || []).map((signal) => (
                                <div key={signal.label} className="rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-white/40 p-3">
                                    <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground flex items-center justify-between">
                                        <span>{signal.label}</span>
                                        <span className="font-semibold text-foreground">{signal.status}</span>
                                    </p>
                                    <p className="text-sm text-foreground/90">{signal.idea}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div
                        className="rounded-3xl border shadow-xl p-5 space-y-4"
                        style={getPanelStyle(hints, moodTokens)}
                        data-aos="fade-up"
                        data-aos-delay="140"
                    >
                        <div className="flex items-center gap-2">
                            <HeartHandshake className="w-4 h-4 text-muted-foreground" />
                            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Support Compass</span>
                        </div>
                        <div className="rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-white/40 p-4 space-y-2">
                            <p className="text-base font-semibold">
                                {supportCompass.needsSupport ? "Perlu dukungan aktif" : "Energi stabil, lanjutkan pemantauan"}
                            </p>
                            <p className="text-sm text-muted-foreground">{supportCompass.message}</p>
                            <div className="flex flex-wrap gap-2 pt-2">
                                {supportCompass.suggestedAllies?.map((ally) => (
                                    <span key={ally} className="px-3 py-1 text-[11px] rounded-full bg-black/5 dark:bg-white/10">
                                        {ally}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <SupportSelector
                            supportContact={analysis?.selectedSupportContact || ""}
                            onSupportChange={(contact) => {
                                if (onSupportChange) {
                                    onSupportChange(contact);
                                }
                            }}
                        />
                        <div className="pt-2 border-t border-border/60">
                            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-2">Reflection Log</p>
                            <UserReflectionInput
                                onReflectionChange={(reflection) => {
                                    if (analysis) {
                                        analysis.userReflection = reflection;
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div className="grid gap-6 lg:grid-cols-12">
                <div
                    className="rounded-3xl border shadow-xl p-5 space-y-4 lg:col-span-7"
                    style={getPanelStyle(hints, moodTokens)}
                    data-aos="fade-up"
                    data-aos-delay="80"
                >
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                            Emotional Storyline
                        </span>
                    </div>
                    <div className="space-y-1">
                        <p className="text-base font-semibold">{storyline.title}</p>
                        <p className="text-sm text-muted-foreground">{storyline.chapter}</p>
                    </div>
                    <p className="text-sm leading-relaxed text-foreground/90">
                        {storyline.narrative}
                    </p>
                    <div className="rounded-2xl bg-white/55 dark:bg-slate-900/55 border border-white/40 p-4 space-y-2">
                        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">
                            <Quote className="w-3.5 h-3.5" />
                            Personalized Guidance
                        </div>
                        <p className="text-sm text-foreground/90">
                            {analysis?.personalizedRecommendation || fallbackEngine.heroDescription}
                        </p>
                    </div>
                </div>

                <div
                    className="rounded-3xl border shadow-xl p-5 space-y-4 lg:col-span-5"
                    style={getPanelStyle(hints, moodTokens)}
                    data-aos="fade-up"
                    data-aos-delay="120"
                >
                    <div className="flex items-center gap-2">
                        <Brain className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                            Emotional Landscape
                        </span>
                    </div>
                    <div className="space-y-3">
                        <div className="rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-white/30 p-3 space-y-2">
                            <div className="flex items-center gap-2 text-sm font-semibold">
                                {analysis?.internalWeather?.toLowerCase().includes("storm") ? <CloudRain className="w-4 h-4" /> : analysis?.internalWeather?.toLowerCase().includes("night") ? <Moon className="w-4 h-4" /> : <CloudSun className="w-4 h-4" />}
                                <span>{analysis?.internalWeather || fallbackEngine.heroSubtitle}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {analysis?.weatherDesc || "Mood tracker mendeteksi pola cuaca emosi yang memengaruhi kecepatan kognitifmu hari ini."}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <Wind className="w-3.5 h-3.5" />
                                    <span>{analysis?.moodVelocity || "soft breeze"}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Sun className="w-3.5 h-3.5" />
                                    <span>{analysis?.solarCharge || "72% light"}</span>
                                </div>
                            </div>
                        </div>
                        <EmotionsDetected emotions={analysis?.selfreportedEmotions} />
                        <MicroExpressions expressions={analysis?.microExpressions} />
                    </div>
                </div>
            </div>
            <div
                className="rounded-3xl border shadow-xl p-5 space-y-4"
                style={getPanelStyle(hints, moodTokens)}
                data-aos="fade-up"
                data-aos-delay="80"
            >
                <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        Recommended Moves
                    </span>
                </div>
                <div className="space-y-3">
                    {recommendations.map((rec, idx) => (
                        <div key={`${rec.title}-${idx}`} className="rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-white/30 p-3">
                            <p className="text-sm font-semibold">{rec.title}</p>
                            <p className="text-xs text-muted-foreground">{rec.description}</p>
                        </div>
                    ))}
                    {analysis?.metadata?.callToAction && (
                        <div className="rounded-2xl bg-black/5 dark:bg-white/10 px-3 py-2 text-sm text-foreground/90">
                            {analysis.metadata.callToAction}
                        </div>
                    )}
                </div>
            </div>
            <div className="grid gap-6 lg:grid-cols-12">
                <div
                    className="rounded-3xl border shadow-xl p-5 space-y-4 lg:col-span-7"
                    style={getPanelStyle(hints, moodTokens)}
                    data-aos="fade-up"
                >
                    <div className="flex items-center gap-2">
                        <Quote className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                            Integration Log
                        </span>
                    </div>
                    <p className="text-sm text-foreground/85">
                        Simpan highlight rekomendasi ini sebelum lanjut ke aktivitas berikutnya. Bagikan ke rekan jika perlu accountability.
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-black/5 dark:bg-white/10">
                            <CloudSun className="w-3.5 h-3.5" />
                            Weather + mood sinkron
                        </span>
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-black/5 dark:bg-white/10">
                            <Wind className="w-3.5 h-3.5" />
                            {analysis?.moodVelocity || "soft breeze pace"}
                        </span>
                    </div>
                </div>
                <div
                    className="rounded-3xl border shadow-xl p-5 space-y-4 lg:col-span-5"
                    style={getPanelStyle(hints, moodTokens)}
                    data-aos="fade-up"
                    data-aos-delay="100"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Action Center</p>
                            <p className="text-base font-semibold">Finalize Session</p>
                        </div>
                        <ArrowUpRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={isRescanDisabled ? undefined : onReset}
                            disabled={isRescanDisabled}
                            className={cn(
                                "py-3 rounded-2xl border text-sm font-medium transition-all",
                                isRescanDisabled
                                    ? "cursor-not-allowed opacity-60 border-border/40 text-muted-foreground"
                                    : "border-border bg-white/70 dark:bg-slate-900/70 hover:bg-white/90 dark:hover:bg-slate-900"
                            )}
                            aria-label="Scan again for new AI emotional analysis"
                        >
                            <div className="flex items-center justify-center gap-2">
                                <RefreshCcw className="w-4 h-4" />
                                <span>Scan Again</span>
                            </div>
                        </button>
                        <button
                            onClick={() => {
                                if (analysis) {
                                    analysis.isSubmitting = true;
                                }
                                onComplete();
                            }}
                            disabled={analysis?.isSubmitting}
                            className={cn(
                                "py-3 rounded-2xl text-white font-semibold shadow-lg transition-colors",
                                analysis?.isSubmitting
                                    ? "bg-primary/60 cursor-wait"
                                    : "bg-primary hover:bg-primary/90"
                            )}
                            aria-label="Complete check-in and proceed to results"
                        >
                            {analysis?.isSubmitting ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Processing...
                                </div>
                            ) : (
                                "Complete"
                            )}
                        </button>
                    </div>
                    <p
                        className={cn(
                            "text-xs text-center",
                            isRescanDisabled ? "text-destructive" : "text-muted-foreground"
                        )}
                        role="status"
                    >
                        {rescanStatus}
                    </p>
                </div>
            </div>
        </section>
    );
});

ResultsSection.displayName = "ResultsSection";
export default ResultsSection;
