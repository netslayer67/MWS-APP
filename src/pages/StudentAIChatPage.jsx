import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Plus, Loader2, Volume2, VolumeX, Pencil, Check, X, PanelLeft, PanelLeftClose, History, Clock3 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import { useLocation, useNavigate } from 'react-router-dom';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useToast } from "@/components/ui/use-toast";
import { useDispatch, useSelector } from 'react-redux';
import { ASSISTANT_WIDGET_TYPES, isWidgetTypeSupported } from '@/features/assistant/runtime/widgetRegistry';
import {
    detectAssistantNavigationIntent,
    sanitizeAssistantNavigateAction
} from '@/utils/studentAssistantNavigator';
import {
    sendMessage,
    loadConversations,
    loadConversationHistory,
    loadAssistantProfile,
    saveAssistantProfile,
    startNewConversation,
    addUserMessage,
    setInputValue,
    setBuddyAnimation,
    resetBuddyToIdle,
    toggleSound,
    selectMessages,
    selectSessionId,
    selectIsLoading,
    selectIsTyping,
    selectInputValue,
    selectBuddyExpression,
    selectBuddyAnimation,
    selectSoundEnabled,
    selectConversations,
    selectConversationsLoading,
    selectHistoryLoading,
    selectAssistantProfile,
    selectAssistantLoading,
    selectAssistantSaving
} from '@/store/slices/aiChatSlice';
import aiChatService from '@/services/aiChatService';

// Scoped styles for chat page (Hub-style design + animations)
const ChatScopedStyles = () => (
    <style>{`
        .chat-bg {
            --chat-accent-cyan: #22d3ee;
            --chat-accent-coral: #fb7185;
            --chat-accent-lime: #a3e635;
            --chat-accent-violet: #8b5cf6;
            background:
                radial-gradient(960px circle at 10% 12%, rgb(34 211 238 / 0.22), transparent 46%),
                radial-gradient(740px circle at 86% 10%, rgb(251 113 133 / 0.23), transparent 48%),
                radial-gradient(820px circle at 76% 88%, rgb(163 230 53 / 0.18), transparent 52%),
                linear-gradient(150deg, rgb(255 248 239) 0%, rgb(240 250 255) 44%, rgb(255 242 251) 100%);
        }
        .dark .chat-bg {
            background:
                radial-gradient(920px circle at 8% 6%, rgb(34 211 238 / 0.16), transparent 48%),
                radial-gradient(760px circle at 90% 12%, rgb(249 168 212 / 0.16), transparent 48%),
                radial-gradient(780px circle at 70% 88%, rgb(163 230 53 / 0.12), transparent 55%),
                linear-gradient(155deg, rgb(6 12 28) 0%, rgb(11 18 45) 46%, rgb(28 20 44) 100%);
        }

        .chat-grid {
            background-image:
                linear-gradient(rgb(3 105 161 / 0.08) 1px, transparent 1px),
                linear-gradient(90deg, rgb(3 105 161 / 0.08) 1px, transparent 1px);
            background-size: 24px 24px;
            mask-image: radial-gradient(circle at center, black 58%, transparent 100%);
        }
        .dark .chat-grid {
            background-image:
                linear-gradient(rgb(125 211 252 / 0.09) 1px, transparent 1px),
                linear-gradient(90deg, rgb(125 211 252 / 0.09) 1px, transparent 1px);
        }

        .chat-font {
            font-family: 'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            letter-spacing: -0.011em;
        }

        /* Blob animations */
        @keyframes chatBlob {
            0%, 100% { transform: translate(0, 0) scale(1); }
            25% { transform: translate(10px, -18px) scale(1.04); }
            50% { transform: translate(-14px, 9px) scale(0.95); }
            75% { transform: translate(16px, 13px) scale(1.03); }
        }

        @keyframes chatHalo {
            0%, 100% { opacity: 0.45; transform: scale(1); }
            50% { opacity: 0.8; transform: scale(1.07); }
        }

        @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }

        /* AI Buddy animations */
        @keyframes buddyBounce {
            0%, 100% { transform: translateY(0) scale(1); }
            50% { transform: translateY(-12px) scale(1.1); }
        }

        @keyframes buddyWave {
            0%, 100% { transform: rotate(0deg); }
            25% { transform: rotate(15deg); }
            75% { transform: rotate(-15deg); }
        }

        @keyframes buddyNod {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(4px); }
        }

        @keyframes buddyCelebrate {
            0%, 100% { transform: scale(1) rotate(0deg); }
            25% { transform: scale(1.2) rotate(-10deg); }
            50% { transform: scale(1.3) rotate(10deg); }
            75% { transform: scale(1.2) rotate(-10deg); }
        }

        @keyframes buddyPulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.15); opacity: 0.8; }
        }

        .buddy-bounce { animation: buddyBounce 0.6s ease-in-out; }
        .buddy-wave { animation: buddyWave 1s ease-in-out; }
        .buddy-nod { animation: buddyNod 0.5s ease-in-out infinite; }
        .buddy-celebrate { animation: buddyCelebrate 0.8s ease-in-out; }
        .buddy-pulse { animation: buddyPulse 1.5s ease-in-out infinite; }

        /* Message animations */
        @keyframes slideInRight {
            from { opacity: 0; transform: translateX(30px) scale(0.9); }
            to { opacity: 1; transform: translateX(0) scale(1); }
        }

        @keyframes slideInLeft {
            from { opacity: 0; transform: translateX(-30px) scale(0.9); }
            to { opacity: 1; transform: translateX(0) scale(1); }
        }

        @keyframes messageReaction {
            0% { transform: scale(0); }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); }
        }

        .message-user {
            animation: slideInRight 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .message-assistant {
            animation: slideInLeft 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .message-reaction {
            animation: messageReaction 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        /* Typing indicator */
        @keyframes typingDot {
            0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
            30% { transform: translateY(-12px); opacity: 1; }
        }

        .typing-dot {
            animation: typingDot 1.4s infinite;
        }
        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }

        /* Sparkle effect */
        @keyframes sparkle {
            0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
            50% { opacity: 1; transform: scale(1) rotate(180deg); }
        }

        .sparkle {
            animation: sparkle 1.5s ease-in-out infinite;
        }

        /* Quick reaction buttons */
        @keyframes reactionPop {
            0% { transform: scale(0); }
            70% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }

        .reaction-button {
            animation: reactionPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        /* Message bubble hover effect */
        .message-bubble {
            transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
        }

        .message-bubble:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 24px rgb(17 24 39 / 0.15);
            border-color: rgb(125 211 252 / 0.45);
        }

        /* Particle burst effect */
        @keyframes particleBurst {
            0% { transform: translate(0, 0) scale(1); opacity: 1; }
            100% { transform: translate(var(--tx), var(--ty)) scale(0); opacity: 0; }
        }

        .particle {
            animation: particleBurst 0.8s ease-out forwards;
        }

        .chat-soft-panel {
            background: linear-gradient(145deg, rgb(255 255 255 / 0.82), rgb(255 255 255 / 0.52));
            border: 1px solid rgb(125 211 252 / 0.25);
            box-shadow: 0 14px 30px rgb(2 132 199 / 0.08);
        }

        .dark .chat-soft-panel {
            background: linear-gradient(145deg, rgb(15 23 42 / 0.72), rgb(30 41 59 / 0.46));
            border: 1px solid rgb(103 232 249 / 0.18);
            box-shadow: 0 14px 30px rgb(2 6 23 / 0.35);
        }

        .chat-action-chip {
            border: 1px solid rgb(255 255 255 / 0.4);
            box-shadow: 0 8px 18px rgb(15 23 42 / 0.08);
            transition: transform 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease;
            will-change: transform;
        }

        .chat-action-chip:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 22px rgb(15 23 42 / 0.14);
            filter: saturate(1.08);
        }

        .dark .chat-action-chip {
            border-color: rgb(255 255 255 / 0.15);
            box-shadow: 0 10px 22px rgb(2 6 23 / 0.35);
        }

        .chat-pill-glow {
            animation: chatHalo 3.5s ease-in-out infinite;
        }

        .chat-gradient-border {
            position: relative;
        }

        .chat-gradient-border::before {
            content: '';
            position: absolute;
            inset: -1px;
            z-index: -1;
            border-radius: inherit;
            background: linear-gradient(120deg, rgb(34 211 238 / 0.55), rgb(249 168 212 / 0.45), rgb(163 230 53 / 0.48));
            background-size: 200% 200%;
            animation: gradientShift 7s ease infinite;
        }

        .chat-markdown > :first-child {
            margin-top: 0;
        }

        .chat-markdown > :last-child {
            margin-bottom: 0;
        }

        .chat-markdown table {
            width: 100%;
            margin: 0.5rem 0;
            border-collapse: collapse;
            font-size: 0.95em;
        }

        .chat-markdown th,
        .chat-markdown td {
            border: 1px solid rgba(148, 163, 184, 0.35);
            padding: 0.35rem 0.45rem;
            vertical-align: top;
        }

        .chat-markdown-user a {
            color: rgba(255, 255, 255, 0.96);
            text-decoration: underline;
        }

        .chat-markdown-assistant a {
            color: rgb(124, 58, 237);
            text-decoration: underline;
        }

        .dark .chat-markdown-assistant a {
            color: rgb(125, 211, 252);
        }

        @media (prefers-reduced-motion: reduce) {
            .buddy-bounce,
            .buddy-wave,
            .buddy-nod,
            .buddy-celebrate,
            .buddy-pulse,
            .typing-dot,
            .sparkle,
            .reaction-button,
            .chat-pill-glow,
            .particle {
                animation: none !important;
            }
        }
    `}</style>
);

const markdownSanitizeSchema = {
    ...defaultSchema,
    tagNames: [...(defaultSchema.tagNames || []), 'u', 'ins', 'mark'],
    attributes: {
        ...(defaultSchema.attributes || {}),
        a: [...((defaultSchema.attributes && defaultSchema.attributes.a) || []), 'target', 'rel'],
        code: [...((defaultSchema.attributes && defaultSchema.attributes.code) || []), 'className']
    }
};

const preprocessMarkdownContent = (content = '') =>
    String(content || '')
        .replace(/\r\n/g, '\n')
        // Custom underline shorthand: ++text++
        .replace(/\+\+([^\n+][\s\S]*?)\+\+/g, '<u>$1</u>');

const CHAT_COACH_STORAGE_KEY = 'student_ai_chat_coach_v1';
const CHAT_COACH_IDLE_MS = 95 * 1000;
const CHAT_COACH_COOLDOWN_MS = 20 * 60 * 1000;
const CHAT_COACH_SNOOZE_MS = 2 * 60 * 60 * 1000;
const CHAT_COACH_DAILY_LIMIT = 4;
const CHAT_COACH_SESSION_LIMIT = 2;
const CONVERSATIONS_REFRESH_COOLDOWN_MS = 10000;

const getTodayKey = () => new Date().toISOString().slice(0, 10);

const readCoachState = (userKey = 'student') => {
    if (typeof window === 'undefined') {
        return { day: getTodayKey(), count: 0, lastAt: 0, snoozeUntil: 0 };
    }

    try {
        const raw = window.localStorage.getItem(`${CHAT_COACH_STORAGE_KEY}:${userKey}`);
        if (!raw) return { day: getTodayKey(), count: 0, lastAt: 0, snoozeUntil: 0 };
        const parsed = JSON.parse(raw);
        return {
            day: String(parsed?.day || getTodayKey()),
            count: Number(parsed?.count || 0),
            lastAt: Number(parsed?.lastAt || 0),
            snoozeUntil: Number(parsed?.snoozeUntil || 0)
        };
    } catch {
        return { day: getTodayKey(), count: 0, lastAt: 0, snoozeUntil: 0 };
    }
};

const normalizeCoachState = (state) => {
    const today = getTodayKey();
    if (String(state?.day || '') !== today) {
        return {
            day: today,
            count: 0,
            lastAt: 0,
            snoozeUntil: Number(state?.snoozeUntil || 0)
        };
    }

    return {
        day: today,
        count: Number(state?.count || 0),
        lastAt: Number(state?.lastAt || 0),
        snoozeUntil: Number(state?.snoozeUntil || 0)
    };
};

const writeCoachState = (userKey = 'student', state = {}) => {
    if (typeof window === 'undefined') return;
    try {
        window.localStorage.setItem(`${CHAT_COACH_STORAGE_KEY}:${userKey}`, JSON.stringify(state));
    } catch {
        // no-op
    }
};

const buildCoachNudge = ({
    assistantName = 'Nova',
    studentName = 'there',
    focusItems = [],
    quickActions = [],
    messages = []
} = {}) => {
    const latestAssistantMessage = [...messages].reverse().find((item) => item?.role === 'assistant');
    const latestAssistantText = String(latestAssistantMessage?.content || '').trim();
    const hasQuestion = /\?\s*$/.test(latestAssistantText);
    const primaryFocus = String(focusItems?.[0] || '').trim();
    const primaryAction = String(quickActions?.[0] || '').trim();

    if (hasQuestion) {
        return {
            title: `${assistantName} follow-up`,
            text: `I can help you answer the last question step by step, ${studentName}.`,
            suggestion: 'Help me answer your last question in simple steps with one concrete action.'
        };
    }

    if (primaryFocus) {
        return {
            title: `${assistantName} quick check-in`,
            text: `Still want to focus on "${primaryFocus}"? I can break it into a quick mini plan.`,
            suggestion: `Help me make a 20-minute plan for this focus: ${primaryFocus}.`
        };
    }

    if (primaryAction) {
        return {
            title: `${assistantName} ready when you are`,
            text: `Want to continue with "${primaryAction}"?`,
            suggestion: primaryAction
        };
    }

    return {
        title: `${assistantName} mini boost`,
        text: `Need a short momentum boost, ${studentName}? I can propose your next best action now.`,
        suggestion: 'Give me one high-impact study action I can do in the next 15 minutes.'
    };
};

// Particle decorations (Hub-style)
const ChatParticle = React.memo(({ delay = 0, size = 'sm', type = 'dot', top = '20%', left = '10%' }) => {
    const sizeClasses = {
        xs: 'w-1 h-1',
        sm: 'w-1.5 h-1.5',
        md: 'w-2 h-2',
        lg: 'w-3 h-3'
    };

    const shapes = {
        dot: 'rounded-full bg-cyan-400/25 dark:bg-cyan-300/20',
        ring: 'rounded-full border-2 border-amber-400/25 dark:border-amber-300/20',
        cross: 'rotate-45 bg-gradient-to-br from-pink-400/20 to-transparent dark:from-pink-300/15 dark:to-transparent',
        diamond: 'rotate-45 bg-lime-400/22 dark:bg-lime-300/16'
    };

    return (
        <motion.div
            className={`absolute ${sizeClasses[size]} ${shapes[type]} pointer-events-none`}
            style={{ top, left }}
            animate={{
                y: [0, -20, 0],
                opacity: [0.3, 0.8, 0.3],
                scale: [1, 1.2, 1],
                rotate: [0, 12, 0]
            }}
            transition={{
                duration: 4 + delay,
                repeat: Infinity,
                ease: 'easeInOut',
                delay
            }}
        />
    );
});
ChatParticle.displayName = 'ChatParticle';

// AI Buddy Character Component
const AIBuddy = React.memo(({ expression, animation }) => {
    const animationClass = animation ? `buddy-${animation}` : '';

    return (
        <div className="relative">
            <div className="absolute inset-0 -z-10 rounded-full bg-gradient-to-br from-cyan-300/45 via-pink-300/35 to-lime-300/30 blur-xl chat-pill-glow" />
            <motion.div
                className={`text-5xl sm:text-6xl ${animationClass}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            >
                {expression}
            </motion.div>

            {/* Sparkle effects */}
            {animation === 'celebrate' && (
                <>
                    <motion.div
                        className="absolute -top-2 -right-2 text-yellow-400 text-2xl sparkle"
                        style={{ animationDelay: '0s' }}
                    >
                        ✨
                    </motion.div>
                    <motion.div
                        className="absolute -bottom-2 -left-2 text-pink-400 text-xl sparkle"
                        style={{ animationDelay: '0.3s' }}
                    >
                        💫
                    </motion.div>
                </>
            )}
        </div>
    );
});
AIBuddy.displayName = 'AIBuddy';

const formatWidgetValue = (value) => {
    if (value === null || value === undefined || value === '') return '-';
    if (typeof value === 'number' && Number.isFinite(value)) return value.toString();
    return String(value);
};

const ChartWidget = React.memo(({ widget }) => {
    const data = Array.isArray(widget?.data) ? widget.data : [];
    const xKey = widget?.xKey || 'label';
    const yKey = widget?.yKey || 'value';
    const yDomain = Array.isArray(widget?.yDomain) && widget.yDomain.length === 2 ? widget.yDomain : [0, 3];
    const yTicks = Array.isArray(widget?.yTicks) && widget.yTicks.length > 0 ? widget.yTicks : undefined;
    const gradientId = `chat-widget-gradient-${String(widget?.id || 'chart').replace(/[^a-zA-Z0-9_-]/g, '')}`;

    if (data.length === 0) return null;

    return (
        <div className="rounded-2xl border border-cyan-200/55 dark:border-cyan-200/20 bg-gradient-to-br from-cyan-50/90 via-sky-50/85 to-violet-50/85 dark:from-cyan-500/10 dark:via-indigo-500/10 dark:to-pink-500/10 p-3 mt-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700 dark:text-cyan-300">{widget.title || 'Chart'}</p>
            {widget.subtitle && (
                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">{widget.subtitle}</p>
            )}
            <div className="h-56 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                        <defs>
                            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.95} />
                                <stop offset="55%" stopColor="#8b5cf6" stopOpacity={0.9} />
                                <stop offset="100%" stopColor="#f472b6" stopOpacity={0.85} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.25)" vertical={false} />
                        <XAxis
                            dataKey={xKey}
                            tick={{ fontSize: 11, fill: '#334155' }}
                            axisLine={{ stroke: 'rgba(100,116,139,0.28)' }}
                            tickLine={false}
                        />
                        <YAxis
                            domain={yDomain}
                            ticks={yTicks}
                            allowDecimals={false}
                            tick={{ fontSize: 11, fill: '#334155' }}
                            axisLine={{ stroke: 'rgba(100,116,139,0.28)' }}
                            tickLine={false}
                        />
                        <Tooltip
                            cursor={{ fill: 'rgba(148,163,184,0.12)' }}
                            contentStyle={{
                                borderRadius: '0.9rem',
                                border: '1px solid rgba(148,163,184,0.35)',
                                background: 'rgba(255,255,255,0.96)',
                                fontSize: '12px'
                            }}
                        />
                        <Bar dataKey={yKey} radius={[9, 9, 0, 0]} fill={`url(#${gradientId})`} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
});
ChartWidget.displayName = 'ChartWidget';

const TableWidget = React.memo(({ widget }) => {
    const columns = Array.isArray(widget?.columns) ? widget.columns : [];
    const rows = Array.isArray(widget?.rows) ? widget.rows : [];
    if (columns.length === 0 || rows.length === 0) return null;

    return (
        <div className="rounded-2xl border border-pink-200/55 dark:border-pink-200/25 bg-gradient-to-br from-white/90 via-pink-50/85 to-orange-50/85 dark:from-slate-900/45 dark:via-fuchsia-500/10 dark:to-amber-500/10 p-3 mt-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-pink-700 dark:text-pink-300">{widget.title || 'Table'}</p>
            {widget.subtitle && (
                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">{widget.subtitle}</p>
            )}
            <div className="overflow-x-auto mt-2 rounded-xl border border-white/45 dark:border-white/10">
                <table className="min-w-full text-xs sm:text-sm">
                    <thead className="bg-white/75 dark:bg-white/6">
                        <tr>
                            {columns.map((column) => (
                                <th key={column.key} className="px-2.5 py-2 text-left font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">
                                    {column.label || column.key}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, rowIndex) => (
                            <tr
                                key={`row-${rowIndex}`}
                                className="border-t border-slate-200/70 dark:border-white/10 odd:bg-white/60 even:bg-cyan-50/45 dark:odd:bg-white/4 dark:even:bg-cyan-500/5"
                            >
                                {columns.map((column) => (
                                    <td key={`${rowIndex}-${column.key}`} className="px-2.5 py-2 text-slate-700 dark:text-slate-200 align-top">
                                        {formatWidgetValue(row?.[column.key])}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
});
TableWidget.displayName = 'TableWidget';

const StatsWidget = React.memo(({ widget }) => {
    const items = Array.isArray(widget?.items) ? widget.items : [];
    if (items.length === 0) return null;

    return (
        <div className="rounded-2xl border border-lime-200/65 dark:border-lime-200/25 bg-gradient-to-br from-lime-50/90 via-emerald-50/85 to-cyan-50/85 dark:from-lime-500/10 dark:via-emerald-500/10 dark:to-cyan-500/10 p-3 mt-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">{widget.title || 'Snapshot'}</p>
            {widget.subtitle && (
                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">{widget.subtitle}</p>
            )}
            <div className="grid grid-cols-2 gap-2 mt-2">
                {items.slice(0, 6).map((item, index) => (
                    <div
                        key={`${item.label || 'metric'}-${index}`}
                        className="rounded-xl bg-white/80 dark:bg-white/8 border border-white/55 dark:border-white/12 px-2.5 py-2"
                    >
                        <p className="text-[11px] text-slate-500 dark:text-slate-300">{item.label || 'Metric'}</p>
                        <p className="text-sm sm:text-base font-bold text-slate-800 dark:text-white">{formatWidgetValue(item.value)}</p>
                    </div>
                ))}
            </div>
        </div>
    );
});
StatsWidget.displayName = 'StatsWidget';

const TimelineWidget = React.memo(({ widget }) => {
    const items = Array.isArray(widget?.items) ? widget.items : [];
    if (items.length === 0) return null;

    return (
        <div className="rounded-2xl border border-indigo-200/60 dark:border-indigo-200/20 bg-gradient-to-br from-indigo-50/90 via-cyan-50/85 to-pink-50/80 dark:from-indigo-500/10 dark:via-cyan-500/10 dark:to-pink-500/10 p-3 mt-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700 dark:text-indigo-300">{widget.title || 'Timeline'}</p>
            {widget.subtitle && (
                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">{widget.subtitle}</p>
            )}
            <div className="mt-2 space-y-2">
                {items.slice(0, 6).map((item, index) => (
                    <div key={`${item.time || 'time'}-${index}`} className="flex gap-2.5">
                        <div className="shrink-0 w-14 text-[11px] font-bold text-indigo-700 dark:text-indigo-200 pt-0.5">{formatWidgetValue(item.time)}</div>
                        <div className="flex-1 rounded-xl px-2.5 py-2 bg-white/80 dark:bg-white/8 border border-white/60 dark:border-white/12">
                            <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-white">{formatWidgetValue(item.title)}</p>
                            <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 mt-0.5">{formatWidgetValue(item.detail)}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
});
TimelineWidget.displayName = 'TimelineWidget';

const ChecklistWidget = React.memo(({ widget }) => {
    const items = Array.isArray(widget?.items) ? widget.items : [];
    if (items.length === 0) return null;

    const priorityBadgeClass = (priority) => {
        const value = String(priority || '').toLowerCase();
        if (value === 'high') return 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-200';
        if (value === 'medium') return 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200';
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200';
    };

    return (
        <div className="rounded-2xl border border-emerald-200/60 dark:border-emerald-200/20 bg-gradient-to-br from-emerald-50/90 via-lime-50/85 to-cyan-50/80 dark:from-emerald-500/10 dark:via-lime-500/10 dark:to-cyan-500/10 p-3 mt-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">{widget.title || 'Checklist'}</p>
            <div className="mt-2 space-y-2">
                {items.slice(0, 8).map((item, index) => (
                    <div
                        key={`${item.text || 'item'}-${index}`}
                        className="rounded-xl px-2.5 py-2 bg-white/80 dark:bg-white/8 border border-white/60 dark:border-white/12 flex items-start gap-2"
                    >
                        <span className="mt-0.5 text-emerald-500">☑️</span>
                        <div className="flex-1">
                            <p className="text-xs sm:text-sm text-slate-800 dark:text-white">{formatWidgetValue(item.text)}</p>
                            {item.priority && (
                                <span className={`inline-flex mt-1 text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${priorityBadgeClass(item.priority)}`}>
                                    {String(item.priority).toUpperCase()}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
});
ChecklistWidget.displayName = 'ChecklistWidget';

const CapabilitiesWidget = React.memo(({ widget }) => {
    const items = Array.isArray(widget?.items) ? widget.items : [];
    if (items.length === 0) return null;

    return (
        <div className="rounded-2xl border border-fuchsia-200/60 dark:border-fuchsia-200/20 bg-gradient-to-br from-fuchsia-50/90 via-rose-50/80 to-violet-50/85 dark:from-fuchsia-500/10 dark:via-rose-500/10 dark:to-violet-500/10 p-3 mt-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-fuchsia-700 dark:text-fuchsia-300">{widget.title || 'Capabilities'}</p>
            {widget.subtitle && (
                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">{widget.subtitle}</p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                {items.slice(0, 8).map((item, index) => (
                    <div
                        key={`${item.title || 'capability'}-${index}`}
                        className="rounded-xl px-2.5 py-2 bg-white/80 dark:bg-white/8 border border-white/60 dark:border-white/12"
                    >
                        <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-white">
                            <span className="mr-1">{item.icon || '✨'}</span>
                            {formatWidgetValue(item.title)}
                        </p>
                        <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 mt-1">{formatWidgetValue(item.description)}</p>
                    </div>
                ))}
            </div>
        </div>
    );
});
CapabilitiesWidget.displayName = 'CapabilitiesWidget';

const ActionChipsWidget = React.memo(({ widget, onWidgetAction }) => {
    const actions = Array.isArray(widget?.actions) ? widget.actions : [];
    if (actions.length === 0) return null;

    return (
        <div className="rounded-2xl border border-cyan-200/60 dark:border-cyan-200/20 bg-gradient-to-br from-cyan-50/90 via-sky-50/80 to-indigo-50/85 dark:from-cyan-500/10 dark:via-sky-500/10 dark:to-indigo-500/10 p-3 mt-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700 dark:text-cyan-300">{widget.title || 'Quick Actions'}</p>
            <div className="flex flex-wrap gap-2 mt-2">
                {actions.slice(0, 8).map((entry, index) => {
                    const label = entry?.label || `Action ${index + 1}`;
                    const actionPayload = entry?.action || null;
                    return (
                        <button
                            key={`${label}-${index}`}
                            type="button"
                            onClick={() => onWidgetAction?.(actionPayload)}
                            className="px-2.5 py-1.5 rounded-full text-xs font-semibold text-slate-800 dark:text-slate-100 bg-white/85 dark:bg-white/10 border border-white/70 dark:border-white/15 hover:brightness-105 transition-all"
                        >
                            {label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
});
ActionChipsWidget.displayName = 'ActionChipsWidget';

const SkillCardsWidget = React.memo(({ widget, onWidgetAction }) => {
    const cards = Array.isArray(widget?.cards) ? widget.cards : [];
    if (cards.length === 0) return null;

    return (
        <div className="rounded-2xl border border-violet-200/60 dark:border-violet-200/20 bg-gradient-to-br from-violet-50/90 via-fuchsia-50/80 to-cyan-50/85 dark:from-violet-500/10 dark:via-fuchsia-500/10 dark:to-cyan-500/10 p-3 mt-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-violet-700 dark:text-violet-300">{widget.title || 'Adaptive Skills'}</p>
            {widget.subtitle && (
                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">{widget.subtitle}</p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                {cards.slice(0, 6).map((card, index) => (
                    <div
                        key={card.id || `${card.title || 'skill'}-${index}`}
                        className="rounded-xl bg-white/82 dark:bg-white/8 border border-white/65 dark:border-white/14 px-3 py-2"
                    >
                        <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100">
                            <span className="mr-1">{card.icon || '🧩'}</span>
                            {card.title || 'Skill'}
                        </p>
                        {card.description && (
                            <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 mt-1">{card.description}</p>
                        )}
                        {card.action && (
                            <button
                                type="button"
                                onClick={() => onWidgetAction?.(card.action)}
                                className="mt-2 inline-flex px-2.5 py-1.5 rounded-full text-[11px] font-semibold text-violet-700 dark:text-violet-200 bg-violet-100/85 dark:bg-violet-500/20 border border-violet-200/70 dark:border-violet-400/25 hover:brightness-105 transition-all"
                            >
                                Use skill
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
});
SkillCardsWidget.displayName = 'SkillCardsWidget';

const AssistantWidgets = React.memo(({ widgets, isUser, onWidgetAction }) => {
    const normalizedWidgets = useMemo(
        () => (
            Array.isArray(widgets)
                ? widgets
                    .filter((widget) => widget && typeof widget === 'object')
                    .filter((widget) => isWidgetTypeSupported(widget.type))
                    .slice(0, 6)
                : []
        ),
        [widgets]
    );

    if (isUser || normalizedWidgets.length === 0) return null;

    return (
        <div className="space-y-2">
            {normalizedWidgets.map((widget, index) => {
                const key = widget.id || `${widget.type || 'widget'}-${index}`;
                if (widget.type === ASSISTANT_WIDGET_TYPES.BAR_CHART) return <ChartWidget key={key} widget={widget} />;
                if (widget.type === ASSISTANT_WIDGET_TYPES.TABLE) return <TableWidget key={key} widget={widget} />;
                if (widget.type === ASSISTANT_WIDGET_TYPES.STATS) return <StatsWidget key={key} widget={widget} />;
                if (widget.type === ASSISTANT_WIDGET_TYPES.TIMELINE) return <TimelineWidget key={key} widget={widget} />;
                if (widget.type === ASSISTANT_WIDGET_TYPES.CHECKLIST) return <ChecklistWidget key={key} widget={widget} />;
                if (widget.type === ASSISTANT_WIDGET_TYPES.CAPABILITIES) return <CapabilitiesWidget key={key} widget={widget} />;
                if (widget.type === ASSISTANT_WIDGET_TYPES.ACTION_CHIPS) return <ActionChipsWidget key={key} widget={widget} onWidgetAction={onWidgetAction} />;
                if (widget.type === ASSISTANT_WIDGET_TYPES.SKILL_CARDS) return <SkillCardsWidget key={key} widget={widget} onWidgetAction={onWidgetAction} />;
                return null;
            })}
        </div>
    );
});
AssistantWidgets.displayName = 'AssistantWidgets';

// Message Bubble Component
const MessageBubble = React.memo(({ message, isUser, onWidgetAction }) => {
    const [showReactions, setShowReactions] = useState(false);
    const [selectedReaction, setSelectedReaction] = useState(null);
    const formattedContent = useMemo(
        () => preprocessMarkdownContent(message.content),
        [message.content]
    );

    const reactions = ['👍', '❤️', '😂', '🤔', '🎉'];

    const handleReaction = useCallback((reaction) => {
        setSelectedReaction(reaction);
        setShowReactions(false);
        // Could dispatch action to save reaction
    }, []);

    return (
        <div className={`relative group`}>
            <div
                className={`message-bubble rounded-2xl sm:rounded-3xl px-4 py-3 sm:px-5 sm:py-4 ${isUser
                        ? 'chat-gradient-border bg-[linear-gradient(130deg,_rgb(34_211_238)_0%,_rgb(139_92_246)_52%,_rgb(251_113_133)_100%)] text-white'
                        : 'chat-soft-panel backdrop-blur-sm text-gray-800 dark:text-gray-100'
                    }`}
                onMouseEnter={() => !isUser && setShowReactions(true)}
                onMouseLeave={() => setShowReactions(false)}
            >
                <div className={`chat-markdown ${isUser ? 'chat-markdown-user' : 'chat-markdown-assistant'} text-sm sm:text-base leading-relaxed`}>
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[
                            rehypeRaw,
                            [rehypeSanitize, markdownSanitizeSchema]
                        ]}
                        components={{
                            p: ({ children, ...props }) => (
                                <p className="my-1 whitespace-pre-wrap leading-relaxed" {...props}>{children}</p>
                            ),
                            strong: ({ children, ...props }) => (
                                <strong className="font-bold" {...props}>{children}</strong>
                            ),
                            em: ({ children, ...props }) => (
                                <em className="italic" {...props}>{children}</em>
                            ),
                            u: ({ children, ...props }) => (
                                <u className="underline underline-offset-2" {...props}>{children}</u>
                            ),
                            ul: ({ children, ...props }) => (
                                <ul className="list-disc pl-5 my-2 space-y-1" {...props}>{children}</ul>
                            ),
                            ol: ({ children, ...props }) => (
                                <ol className="list-decimal pl-5 my-2 space-y-1" {...props}>{children}</ol>
                            ),
                            li: ({ children, ...props }) => (
                                <li className="leading-relaxed" {...props}>{children}</li>
                            ),
                            blockquote: ({ children, ...props }) => (
                                <blockquote
                                    className={`my-2 pl-3 border-l-2 ${isUser ? 'border-white/60 text-white/95' : 'border-violet-300/50 text-gray-700 dark:text-gray-200'}`}
                                    {...props}
                                >
                                    {children}
                                </blockquote>
                            ),
                            h1: ({ children, ...props }) => (
                                <h1 className="text-lg sm:text-xl font-bold mt-2 mb-1" {...props}>{children}</h1>
                            ),
                            h2: ({ children, ...props }) => (
                                <h2 className="text-base sm:text-lg font-bold mt-2 mb-1" {...props}>{children}</h2>
                            ),
                            h3: ({ children, ...props }) => (
                                <h3 className="text-sm sm:text-base font-semibold mt-2 mb-1" {...props}>{children}</h3>
                            ),
                            a: ({ href, children, ...props }) => (
                                <a href={href} target="_blank" rel="noreferrer" {...props}>{children}</a>
                            ),
                            code: ({ inline, children, ...props }) => (
                                inline ? (
                                    <code className={`px-1 py-0.5 rounded ${isUser ? 'bg-white/20 text-white' : 'bg-black/10 dark:bg-white/10'}`} {...props}>
                                        {children}
                                    </code>
                                ) : (
                                    <code className={`block my-2 p-2.5 rounded-xl whitespace-pre-wrap ${isUser ? 'bg-white/18 text-white' : 'bg-black/10 dark:bg-white/8'}`} {...props}>
                                        {children}
                                    </code>
                                )
                            ),
                            hr: () => (
                                <hr className={`my-2 ${isUser ? 'border-white/35' : 'border-gray-300/60 dark:border-white/15'}`} />
                            )
                        }}
                    >
                        {formattedContent}
                    </ReactMarkdown>
                </div>
                <AssistantWidgets widgets={message.widgets} isUser={isUser} onWidgetAction={onWidgetAction} />

                {/* Quick reactions */}
                {!isUser && showReactions && (
                    <div className="absolute -bottom-8 left-0 flex gap-1 bg-white dark:bg-gray-800 rounded-full px-2 py-1 shadow-lg border border-gray-200/50 dark:border-white/10">
                        {reactions.map((reaction, i) => (
                            <button
                                key={reaction}
                                onClick={() => handleReaction(reaction)}
                                className="reaction-button hover:scale-125 transition-transform text-lg"
                                style={{ animationDelay: `${i * 0.05}s` }}
                            >
                                {reaction}
                            </button>
                        ))}
                    </div>
                )}

                {/* Selected reaction */}
                {selectedReaction && (
                    <div className="absolute -top-3 -right-3 message-reaction text-2xl">
                        {selectedReaction}
                    </div>
                )}
            </div>
        </div>
    );
});
MessageBubble.displayName = 'MessageBubble';

// Main component
export default function StudentAIChatPage() {
    const dispatch = useDispatch();
    const { toast } = useToast();
    const navigate = useNavigate();
    const location = useLocation();
    const authUser = useSelector((state) => state.auth?.user || null);

    // Redux state
    const messages = useSelector(selectMessages);
    const sessionId = useSelector(selectSessionId);
    const isLoading = useSelector(selectIsLoading);
    const isTyping = useSelector(selectIsTyping);
    const inputValue = useSelector(selectInputValue);
    const buddyExpression = useSelector(selectBuddyExpression);
    const buddyAnimation = useSelector(selectBuddyAnimation);
    const soundEnabled = useSelector(selectSoundEnabled);
    const conversations = useSelector(selectConversations);
    const conversationsLoading = useSelector(selectConversationsLoading);
    const historyLoading = useSelector(selectHistoryLoading);
    const assistantProfile = useSelector(selectAssistantProfile);
    const assistantLoading = useSelector(selectAssistantLoading);
    const assistantSaving = useSelector(selectAssistantSaving);
    const assistantName = assistantProfile?.assistant?.assistantName || 'Nova';
    const dailyFocus = useMemo(
        () => (Array.isArray(assistantProfile?.assistant?.daily?.focusItems)
            ? assistantProfile.assistant.daily.focusItems
            : []),
        [assistantProfile]
    );
    const dailyQuickActions = useMemo(
        () => (Array.isArray(assistantProfile?.assistant?.daily?.quickActions)
            ? assistantProfile.assistant.daily.quickActions
            : []),
        [assistantProfile]
    );
    const twinProfile = assistantProfile?.twin || {};
    const twinRiskLevel = String(twinProfile?.riskLevel || 'low').toLowerCase();
    const twinConfidencePct = Math.max(0, Math.min(100, Math.round(Number(twinProfile?.confidenceScore || 0.5) * 100)));
    const [isNicknameEditorOpen, setIsNicknameEditorOpen] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [nicknameDraft, setNicknameDraft] = useState(assistantName);
    const [coachNudge, setCoachNudge] = useState(null);
    const [isCoachVisible, setIsCoachVisible] = useState(false);

    const messagesScrollRef = useRef(null);
    const inputRef = useRef(null);
    const nicknameInputRef = useRef(null);
    const processedDockNonceRef = useRef(null);
    const lastInteractionAtRef = useRef(0);
    const sessionCoachCountRef = useRef(0);
    const lastConversationsRefreshAtRef = useRef(0);
    const refreshConversationsTimeoutRef = useRef(null);
    const displayedAssistantName = isNicknameEditorOpen ? (nicknameDraft.trim() || assistantName) : assistantName;
    const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
    const normalizedRole = useMemo(
        () => String(authUser?.role || '').trim().toLowerCase(),
        [authUser?.role]
    );
    const isStudentRole = normalizedRole === 'student';
    const studentCallName = useMemo(() => {
        const nickname = String(authUser?.nickname || '').trim();
        if (nickname) return nickname;
        const name = String(authUser?.name || '').trim();
        if (!name) return 'there';
        return name.split(/\s+/)[0] || 'there';
    }, [authUser?.name, authUser?.nickname]);
    const assistantSupportTagline = isStudentRole ? 'daily school support' : 'daily work support';
    const assistantWelcomeSubtitle = isStudentRole
        ? 'I can help with daily planning, homework strategy, MTSS check-ins, and personal study coaching.'
        : 'I can help with workday planning, MTSS follow-up, check-in workflow, and role-specific dashboard actions.';
    const coachStateUserKey = useMemo(() => {
        const seed = authUser?.email || authUser?.id || authUser?._id || authUser?.username || 'student';
        return String(seed).replace(/[^a-zA-Z0-9_.@-]/g, '_');
    }, [authUser?.email, authUser?.id, authUser?._id, authUser?.username]);

    // Particles configuration
    const particles = useMemo(() => [
        { delay: 0, size: 'sm', type: 'dot', top: '8%', left: '15%' },
        { delay: 0.5, size: 'md', type: 'ring', top: '25%', left: '85%' },
        { delay: 1, size: 'xs', type: 'cross', top: '45%', left: '8%' },
        { delay: 1.5, size: 'sm', type: 'diamond', top: '65%', left: '90%' },
        { delay: 2, size: 'md', type: 'dot', top: '80%', left: '12%' },
        { delay: 2.5, size: 'xs', type: 'ring', top: '15%', left: '70%' },
        { delay: 3, size: 'sm', type: 'cross', top: '55%', left: '75%' },
        { delay: 0.8, size: 'xs', type: 'diamond', top: '35%', left: '25%' }
    ], []);

    useEffect(() => {
        lastInteractionAtRef.current = Date.now();
    }, []);

    const scrollToBottom = useCallback((behavior = 'smooth') => {
        const element = messagesScrollRef.current;
        if (!element) return;
        element.scrollTo({
            top: element.scrollHeight,
            behavior
        });
    }, []);

    const checkNearBottom = useCallback(() => {
        const element = messagesScrollRef.current;
        if (!element) return true;
        const distanceFromBottom = element.scrollHeight - element.scrollTop - element.clientHeight;
        return distanceFromBottom < 140;
    }, []);

    useEffect(() => {
        if (autoScrollEnabled) {
            scrollToBottom(messages.length <= 1 ? 'auto' : 'smooth');
        }
    }, [messages, isTyping, autoScrollEnabled, scrollToBottom]);

    // Bootstrap: load assistant profile + latest conversation history
    useEffect(() => {
        let isMounted = true;

        const bootstrapChat = async () => {
            try {
                const items = await dispatch(loadConversations()).unwrap();
                if (isMounted && Array.isArray(items) && items.length > 0) {
                    await dispatch(loadConversationHistory({
                        sessionId: items[0].sessionId,
                        limit: 120
                    }));
                    setAutoScrollEnabled(true);
                }
            } catch {
                // no-op, handled by slice error state
            }

            dispatch(loadAssistantProfile());
        };

        bootstrapChat();

        return () => {
            isMounted = false;
        };
    }, [dispatch]);

    useEffect(() => {
        if (!isNicknameEditorOpen) {
            setNicknameDraft(assistantName);
        }
    }, [assistantName, isNicknameEditorOpen]);

    useEffect(() => {
        if (isNicknameEditorOpen) {
            nicknameInputRef.current?.focus();
            nicknameInputRef.current?.select();
        }
    }, [isNicknameEditorOpen]);

    useEffect(() => () => {
        if (refreshConversationsTimeoutRef.current) {
            clearTimeout(refreshConversationsTimeoutRef.current);
            refreshConversationsTimeoutRef.current = null;
        }
    }, []);

    useEffect(() => {
        lastInteractionAtRef.current = Date.now();
        setIsCoachVisible(false);
        setCoachNudge(null);
        sessionCoachCountRef.current = 0;
    }, [sessionId]);

    useEffect(() => {
        if (messages.length === 0) {
            setIsCoachVisible(false);
            return;
        }
        lastInteractionAtRef.current = Date.now();
        setIsCoachVisible(false);
    }, [messages.length]);

    useEffect(() => {
        if (messages.length === 0) return;
        if (isTyping || isLoading) return;
        if (inputValue.trim()) return;
        if (isNicknameEditorOpen || isHistoryOpen) return;
        if (sessionCoachCountRef.current >= CHAT_COACH_SESSION_LIMIT) return;

        const timer = window.setInterval(() => {
            if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
            if (!checkNearBottom()) return;

            const now = Date.now();
            if ((now - lastInteractionAtRef.current) < CHAT_COACH_IDLE_MS) return;

            const persisted = normalizeCoachState(readCoachState(coachStateUserKey));
            if (persisted.snoozeUntil > now) return;
            if (persisted.count >= CHAT_COACH_DAILY_LIMIT) return;
            if (persisted.lastAt && (now - persisted.lastAt) < CHAT_COACH_COOLDOWN_MS) return;

            const payload = buildCoachNudge({
                assistantName,
                studentName: studentCallName,
                focusItems: dailyFocus,
                quickActions: dailyQuickActions,
                messages
            });

            setCoachNudge(payload);
            setIsCoachVisible(true);
            sessionCoachCountRef.current += 1;
            lastInteractionAtRef.current = now;

            writeCoachState(coachStateUserKey, {
                ...persisted,
                count: persisted.count + 1,
                lastAt: now
            });
        }, 15000);

        return () => window.clearInterval(timer);
    }, [
        assistantName,
        checkNearBottom,
        coachStateUserKey,
        dailyFocus,
        dailyQuickActions,
        inputValue,
        isHistoryOpen,
        isLoading,
        isNicknameEditorOpen,
        isTyping,
        messages,
        studentCallName
    ]);

    // Reset buddy animation after it completes
    useEffect(() => {
        if (buddyAnimation && buddyAnimation !== 'idle' && buddyAnimation !== 'pulse') {
            const timer = setTimeout(() => {
                dispatch(resetBuddyToIdle());
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [buddyAnimation, dispatch]);

    const scheduleConversationsRefresh = useCallback((force = false) => {
        const now = Date.now();
        const elapsed = now - lastConversationsRefreshAtRef.current;

        if (refreshConversationsTimeoutRef.current) {
            clearTimeout(refreshConversationsTimeoutRef.current);
            refreshConversationsTimeoutRef.current = null;
        }

        if (force || elapsed >= CONVERSATIONS_REFRESH_COOLDOWN_MS) {
            lastConversationsRefreshAtRef.current = now;
            dispatch(loadConversations());
            return;
        }

        const remaining = CONVERSATIONS_REFRESH_COOLDOWN_MS - elapsed;
        refreshConversationsTimeoutRef.current = setTimeout(() => {
            lastConversationsRefreshAtRef.current = Date.now();
            dispatch(loadConversations());
            refreshConversationsTimeoutRef.current = null;
        }, remaining);
    }, [dispatch]);

    // Handlers (memoized for performance)
    const handleStartNewChat = useCallback(() => {
        setIsCoachVisible(false);
        setCoachNudge(null);
        lastInteractionAtRef.current = Date.now();
        sessionCoachCountRef.current = 0;
        dispatch(startNewConversation())
            .unwrap()
            .then(() => {
                setAutoScrollEnabled(true);
                setIsHistoryOpen(false);
                scheduleConversationsRefresh(true);
                toast({
                    title: "New chat started! 🎉",
                    description: "Start chatting with your AI Assistant"
                });
            })
            .catch(() => {
                toast({
                    title: "Failed to start new chat",
                    description: "Please try again!",
                    variant: "destructive"
                });
            });
    }, [dispatch, scheduleConversationsRefresh, toast]);

    const handleClientAction = useCallback((clientAction) => {
        const safeAction = sanitizeAssistantNavigateAction(clientAction, normalizedRole);
        if (!safeAction) return false;

        const targetPath = String(safeAction.navigateTo || '').trim();
        if (!targetPath) return false;
        if (location.pathname === targetPath) return true;

        const workspaceLabel = isStudentRole ? 'student workspace' : 'your workspace';

        const actionLabel = safeAction.label || 'requested page';
        toast({
            title: `Opening ${actionLabel}`,
            description: `Redirecting inside ${workspaceLabel}...`
        });

        dispatch(setBuddyAnimation('wave'));
        navigate(targetPath, {
            state: {
                fromAIChat: true,
                aiIntent: safeAction.intent || null
            }
        });
        return true;
    }, [dispatch, isStudentRole, location.pathname, navigate, normalizedRole, toast]);

    const buildCreateInterventionPayload = useCallback((seedPayload = {}) => {
        if (typeof window === 'undefined') return null;
        const payload = { ...(seedPayload || {}) };
        const studentOptions = Array.isArray(payload.studentOptions) ? payload.studentOptions : [];
        delete payload.studentOptions;

        if (!payload.studentId) {
            if (studentOptions.length > 0) {
                const listText = studentOptions
                    .slice(0, 8)
                    .map((student, index) => {
                        const gradeClass = [student.grade, student.className].filter(Boolean).join(' / ');
                        return `${index + 1}. ${student.name || 'Student'}${gradeClass ? ` (${gradeClass})` : ''} [${student.id}]`;
                    })
                    .join('\n');
                const studentInput = window.prompt(
                    `Select student by number or paste Student ID:\n${listText}`,
                    ''
                );
                if (studentInput === null) return null;
                const raw = String(studentInput || '').trim();
                if (!raw) return null;
                const selectedNumber = Number(raw);
                if (Number.isFinite(selectedNumber) && selectedNumber >= 1 && selectedNumber <= studentOptions.length) {
                    payload.studentId = String(studentOptions[selectedNumber - 1]?.id || '').trim();
                } else {
                    payload.studentId = raw;
                }
            } else {
                const studentIdInput = window.prompt('Enter Student ID for intervention submission:', '');
                if (studentIdInput === null) return null;
                payload.studentId = String(studentIdInput || '').trim();
            }
        }

        if (!payload.studentId) return null;

        const tierInput = window.prompt('Tier (tier1/tier2/tier3):', String(payload.tier || 'tier2'));
        if (tierInput === null) return null;
        const normalizedTier = String(tierInput || 'tier2').toLowerCase().replace(/\s+/g, '');
        payload.tier = normalizedTier.startsWith('tier') ? normalizedTier : `tier${normalizedTier || '2'}`;

        const focusInput = window.prompt(
            'Focus areas (comma separated):',
            Array.isArray(payload.focusAreas) ? payload.focusAreas.join(', ') : String(payload.focusAreas || payload.focusArea || '')
        );
        if (focusInput === null) return null;
        payload.focusAreas = String(focusInput || '')
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean);

        const goalInput = window.prompt('Primary goal (optional):', String(payload.goal || ''));
        if (goalInput === null) return null;
        payload.goal = String(goalInput || '').trim();

        const notesInput = window.prompt('Notes (optional):', String(payload.notes || ''));
        if (notesInput === null) return null;
        payload.notes = String(notesInput || '').trim();

        return payload;
    }, []);

    const buildProgressPayload = useCallback((seedPayload = {}) => {
        if (typeof window === 'undefined') return null;
        const payload = { ...(seedPayload || {}) };
        const assignmentOptions = Array.isArray(payload.assignmentOptions) ? payload.assignmentOptions : [];
        delete payload.assignmentOptions;

        if (!payload.assignmentId) {
            if (assignmentOptions.length > 0) {
                const listText = assignmentOptions
                    .slice(0, 8)
                    .map((assignment, index) => (
                        `${index + 1}. ${assignment.studentName || 'Student'} | ${assignment.tier || 'Tier'} [${assignment.id}]`
                    ))
                    .join('\n');
                const assignmentInput = window.prompt(
                    `Select assignment by number or paste Assignment ID:\n${listText}`,
                    ''
                );
                if (assignmentInput === null) return null;
                const raw = String(assignmentInput || '').trim();
                if (!raw) return null;
                const selectedNumber = Number(raw);
                if (Number.isFinite(selectedNumber) && selectedNumber >= 1 && selectedNumber <= assignmentOptions.length) {
                    payload.assignmentId = String(assignmentOptions[selectedNumber - 1]?.id || '').trim();
                } else {
                    payload.assignmentId = raw;
                }
            } else {
                const assignmentIdInput = window.prompt('Enter Mentor Assignment ID:', '');
                if (assignmentIdInput === null) return null;
                payload.assignmentId = String(assignmentIdInput || '').trim();
            }
        }

        if (!payload.assignmentId) return null;

        const summaryInput = window.prompt('Progress summary (required):', String(payload.summary || 'Progress update'));
        if (summaryInput === null) return null;
        payload.summary = String(summaryInput || '').trim();
        if (!payload.summary) return null;

        const nextStepsInput = window.prompt('Next steps (optional):', String(payload.nextSteps || ''));
        if (nextStepsInput === null) return null;
        payload.nextSteps = String(nextStepsInput || '').trim();

        const valueInput = window.prompt('Progress value (optional number):', payload.value != null ? String(payload.value) : '');
        if (valueInput === null) return null;
        const parsedValue = Number(String(valueInput || '').trim());
        payload.value = Number.isFinite(parsedValue) ? parsedValue : undefined;

        const unitInput = window.prompt('Progress unit (optional):', String(payload.unit || payload.scoreUnit || 'score'));
        if (unitInput === null) return null;
        payload.unit = String(unitInput || '').trim() || 'score';

        const celebrationInput = window.prompt('Celebration note (optional):', String(payload.celebration || ''));
        if (celebrationInput === null) return null;
        payload.celebration = String(celebrationInput || '').trim();

        return payload;
    }, []);

    const handleExecuteOperation = useCallback(async (action = {}) => {
        const operation = String(action.operation || '').trim();
        if (!operation) return;

        if (action.requireConfirmation !== false) {
            const confirmed = window.confirm(String(action.confirmText || 'Run this automation now?'));
            if (!confirmed) return;
        }

        let payload = { ...(action.payload || {}) };
        if (operation === 'create_mtss_intervention') {
            payload = buildCreateInterventionPayload(payload);
        } else if (operation === 'append_mtss_progress_checkin') {
            payload = buildProgressPayload(payload);
        }

        if (!payload) return;

        try {
            const result = await aiChatService.executeAssistantOperation(operation, payload, sessionId);
            dispatch(setBuddyAnimation('celebrate'));
            toast({
                title: 'Automation completed',
                description: String(action.successMessage || result?.message || 'Operation executed successfully.')
            });
            if (sessionId) {
                dispatch(loadConversationHistory({ sessionId, limit: 120 }));
            }
            scheduleConversationsRefresh(false);
        } catch (error) {
            const message = error?.response?.data?.message || error?.message || action.failureMessage || 'Automation failed.';
            toast({
                title: 'Automation failed',
                description: String(message),
                variant: 'destructive'
            });
        }
    }, [
        buildCreateInterventionPayload,
        buildProgressPayload,
        dispatch,
        scheduleConversationsRefresh,
        sessionId,
        toast
    ]);

    const handleWidgetAction = useCallback((action) => {
        if (!action || typeof action !== 'object') return;
        const type = String(action.type || '').trim().toLowerCase();

        if (type === 'navigate') {
            handleClientAction({
                ...action,
                type: 'navigate'
            });
            return;
        }

        if (type === 'prefill') {
            const value = String(action.value || action.message || '').trim();
            if (!value) return;
            dispatch(setInputValue(value));
            inputRef.current?.focus();
            return;
        }

        if (type === 'execute_operation') {
            handleExecuteOperation(action);
        }
    }, [dispatch, handleClientAction, handleExecuteOperation]);

    const dismissCoachNudge = useCallback((withSnooze = false) => {
        setIsCoachVisible(false);
        lastInteractionAtRef.current = Date.now();

        if (!withSnooze) return;

        const persisted = normalizeCoachState(readCoachState(coachStateUserKey));
        writeCoachState(coachStateUserKey, {
            ...persisted,
            snoozeUntil: Date.now() + CHAT_COACH_SNOOZE_MS
        });
    }, [coachStateUserKey]);

    const applyCoachNudge = useCallback(() => {
        if (!coachNudge?.suggestion) return;
        dispatch(setInputValue(coachNudge.suggestion));
        setIsCoachVisible(false);
        lastInteractionAtRef.current = Date.now();
        inputRef.current?.focus();
    }, [coachNudge, dispatch]);

    const dispatchChatMessage = useCallback((rawMessage) => {
        const userMessage = String(rawMessage || '').trim();
        if (!userMessage || isLoading) return;

        setAutoScrollEnabled(true);
        setIsCoachVisible(false);
        lastInteractionAtRef.current = Date.now();
        dispatch(addUserMessage(userMessage));

        dispatch(sendMessage({ message: userMessage, sessionId }))
            .unwrap()
            .then((payload) => {
                scheduleConversationsRefresh(false);
                const navigatedByServerAction = handleClientAction(payload?.clientAction);

                if (!navigatedByServerAction) {
                    const localAction = detectAssistantNavigationIntent(userMessage, normalizedRole);
                    if (localAction) {
                        handleClientAction(localAction);
                    }
                }
            })
            .catch(() => { });
    }, [dispatch, handleClientAction, isLoading, normalizedRole, scheduleConversationsRefresh, sessionId]);

    useEffect(() => {
        const routeState = location.state || {};
        const dockNonce = routeState.dockNonce;
        const prefillMessage = String(routeState.prefillMessage || '').trim();
        const autoSendFromDock = Boolean(routeState.autoSendFromDock);

        if (!dockNonce || processedDockNonceRef.current === dockNonce) {
            return;
        }
        processedDockNonceRef.current = dockNonce;

        if (prefillMessage) {
            if (autoSendFromDock && !isLoading) {
                dispatchChatMessage(prefillMessage);
            } else {
                dispatch(setInputValue(prefillMessage));
                inputRef.current?.focus();
            }
        }

        const restState = { ...routeState };
        delete restState.prefillMessage;
        delete restState.autoSendFromDock;
        delete restState.dockNonce;
        const nextState = Object.keys(restState).length > 0 ? restState : null;
        navigate(location.pathname, { replace: true, state: nextState });
    }, [dispatch, dispatchChatMessage, isLoading, location.pathname, location.state, navigate]);

    const handleSendMessage = useCallback((e) => {
        e.preventDefault();
        dispatchChatMessage(inputValue);
    }, [dispatchChatMessage, inputValue]);

    const handleInputChange = useCallback((e) => {
        lastInteractionAtRef.current = Date.now();
        if (isCoachVisible) {
            setIsCoachVisible(false);
        }
        dispatch(setInputValue(e.target.value));

        // Trigger buddy animation on typing
        if (e.target.value && !buddyAnimation) {
            dispatch(setBuddyAnimation('pulse'));
        }
    }, [dispatch, buddyAnimation, isCoachVisible]);

    const handleToggleSound = useCallback(() => {
        dispatch(toggleSound());
    }, [dispatch]);

    const handleOpenConversation = useCallback((targetSessionId) => {
        if (!targetSessionId || historyLoading) return;
        setAutoScrollEnabled(true);
        setIsCoachVisible(false);
        setCoachNudge(null);
        lastInteractionAtRef.current = Date.now();
        sessionCoachCountRef.current = 0;
        dispatch(loadConversationHistory({ sessionId: targetSessionId, limit: 120 }));
        setIsHistoryOpen(false);
    }, [dispatch, historyLoading]);

    const handleMessagesScroll = useCallback(() => {
        const nearBottom = checkNearBottom();
        if (nearBottom !== autoScrollEnabled) {
            setAutoScrollEnabled(nearBottom);
        }
    }, [autoScrollEnabled, checkNearBottom]);

    const formatConversationTime = useCallback((value) => {
        if (!value) return '';
        const parsed = new Date(value);
        if (Number.isNaN(parsed.getTime())) return '';
        const now = new Date();
        const isSameDay = parsed.toDateString() === now.toDateString();
        return isSameDay
            ? parsed.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
            : parsed.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
    }, []);

    const openNicknameEditor = useCallback(() => {
        setNicknameDraft(assistantName);
        setIsNicknameEditorOpen(true);
    }, [assistantName]);

    const closeNicknameEditor = useCallback(() => {
        if (assistantSaving) return;
        setIsNicknameEditorOpen(false);
        setNicknameDraft(assistantName);
    }, [assistantName, assistantSaving]);

    const handleNicknameSubmit = useCallback(async (event) => {
        event.preventDefault();
        const trimmed = String(nicknameDraft || '').trim();

        if (!trimmed) {
            toast({
                title: "Nickname can't be empty",
                description: "Please enter a nickname for your AI Assistant.",
                variant: "destructive"
            });
            return;
        }

        if (trimmed.length < 2 || trimmed.length > 24) {
            toast({
                title: "Nickname length is invalid",
                description: "Use 2 to 24 characters for the nickname.",
                variant: "destructive"
            });
            return;
        }

        if (!/^[A-Za-z0-9 _-]+$/.test(trimmed)) {
            toast({
                title: "Invalid nickname format",
                description: "Use letters, numbers, spaces, hyphen, or underscore.",
                variant: "destructive"
            });
            return;
        }

        if (trimmed === assistantName) {
            setIsNicknameEditorOpen(false);
            return;
        }

        try {
            await dispatch(saveAssistantProfile({ assistantName: trimmed })).unwrap();
            setIsNicknameEditorOpen(false);
            dispatch(setBuddyAnimation('celebrate'));
            toast({
                title: "Nickname updated",
                description: `Your AI Assistant nickname is now ${trimmed}.`
            });
        } catch (error) {
            toast({
                title: "Failed to update nickname",
                description: error || 'Please try again.',
                variant: "destructive"
            });
        }
    }, [assistantName, dispatch, nicknameDraft, toast]);

    // Quick suggestions
    const quickSuggestions = useMemo(() => [
        ...dailyQuickActions,
        'Help me make a study plan for today',
        'Explain this topic step by step',
        'Quiz me in 5 quick questions',
        'Check my MTSS progress'
    ].filter((item, index, arr) => arr.indexOf(item) === index).slice(0, 6), [dailyQuickActions]);

    const quickSuggestionStyles = useMemo(() => ([
        'bg-gradient-to-r from-cyan-300/80 to-sky-200/85 text-sky-950',
        'bg-gradient-to-r from-pink-300/80 to-rose-200/85 text-rose-950',
        'bg-gradient-to-r from-lime-300/80 to-emerald-200/85 text-emerald-950',
        'bg-gradient-to-r from-amber-300/80 to-orange-200/85 text-orange-950',
        'bg-gradient-to-r from-indigo-300/80 to-violet-200/85 text-violet-950',
        'bg-gradient-to-r from-fuchsia-300/80 to-pink-200/85 text-fuchsia-950'
    ]), []);

    const twinRiskBadgeClass = useMemo(() => {
        if (twinRiskLevel === 'high') return 'from-rose-100/90 to-red-100/85 dark:from-rose-500/20 dark:to-red-500/20 border-rose-200/55 dark:border-rose-300/25 text-rose-700 dark:text-rose-200';
        if (twinRiskLevel === 'medium') return 'from-amber-100/90 to-orange-100/85 dark:from-amber-500/20 dark:to-orange-500/20 border-amber-200/55 dark:border-amber-300/25 text-amber-700 dark:text-amber-200';
        return 'from-emerald-100/90 to-lime-100/85 dark:from-emerald-500/20 dark:to-lime-500/20 border-emerald-200/55 dark:border-emerald-300/25 text-emerald-700 dark:text-emerald-200';
    }, [twinRiskLevel]);

    return (
        <div className="chat-bg chat-font h-[100dvh] min-h-screen relative overflow-x-hidden">
            <ChatScopedStyles />

            {/* Background grid */}
            <div className="chat-grid absolute inset-0 pointer-events-none" />

            {/* Animated blobs */}
            <div className="absolute -top-20 -right-16 w-80 sm:w-[430px] h-80 sm:h-[430px] rounded-full blur-3xl bg-gradient-to-br from-cyan-300/40 via-sky-300/30 to-transparent dark:from-cyan-400/15 dark:via-sky-500/10 dark:to-transparent pointer-events-none" style={{ animation: 'chatBlob 12s ease-in-out infinite' }} />
            <div className="absolute -bottom-24 -left-20 w-72 sm:w-[390px] h-72 sm:h-[390px] rounded-full blur-3xl bg-gradient-to-tr from-amber-300/35 via-pink-300/30 to-transparent dark:from-amber-400/12 dark:via-pink-500/10 dark:to-transparent pointer-events-none" style={{ animation: 'chatBlob 15s ease-in-out infinite reverse' }} />
            <div className="absolute top-1/3 -left-16 w-60 sm:w-72 h-60 sm:h-72 rounded-full blur-3xl bg-gradient-to-br from-lime-300/28 via-emerald-200/25 to-transparent dark:from-lime-400/10 dark:via-emerald-400/8 dark:to-transparent pointer-events-none" style={{ animation: 'chatBlob 18s ease-in-out infinite' }} />

            {/* Floating particles */}
            {particles.map((particle, i) => (
                <ChatParticle key={i} {...particle} />
            ))}

            {/* Conversation history drawer */}
            <AnimatePresence>
                {isHistoryOpen && (
                    <>
                        <motion.button
                            type="button"
                            aria-label="Close history"
                            onClick={() => setIsHistoryOpen(false)}
                            className="fixed inset-0 z-30 bg-black/45 backdrop-blur-[1px]"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        />
                        <motion.aside
                            initial={{ x: -380, opacity: 0.4 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -380, opacity: 0.4 }}
                            transition={{ type: 'spring', stiffness: 250, damping: 30 }}
                            className="fixed left-0 top-0 bottom-0 z-40 w-[320px] sm:w-[360px] bg-[linear-gradient(160deg,_rgb(8_24_46/0.94),_rgb(26_37_68/0.92),_rgb(40_20_52/0.9))] border-r border-cyan-200/20 backdrop-blur-xl shadow-2xl p-3 sm:p-4"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2 text-white">
                                    <History className="w-4 h-4 text-cyan-300" />
                                    <h3 className="text-sm font-semibold tracking-wide">Your Chats</h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsHistoryOpen(false)}
                                    className="p-1.5 rounded-lg bg-white/12 hover:bg-cyan-300/20 text-white transition-all"
                                >
                                    <PanelLeftClose className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="h-[calc(100%-3rem)] overflow-y-auto pr-1 space-y-2">
                                {conversationsLoading ? (
                                    Array.from({ length: 6 }).map((_, idx) => (
                                        <div key={`conv-skeleton-${idx}`} className="h-16 rounded-xl bg-white/10 animate-pulse" />
                                    ))
                                ) : conversations.length === 0 ? (
                                    <div className="rounded-xl border border-cyan-200/25 bg-cyan-200/10 p-3 text-sm text-slate-200">
                                        No chat history yet. Start your first conversation.
                                    </div>
                                ) : (
                                    conversations.map((conversation, index) => {
                                        const isActive = sessionId === conversation.sessionId;
                                        const isArchived = conversation.status === 'archived';
                                        const hasMemorySummary = Boolean(conversation.hasMemorySummary);
                                        const title = conversation.title || 'New Conversation';
                                        const preview = conversation.preview || 'Open this chat to continue the context.';
                                        const badge = ['✨', '🧠', '🎯', '📘', '🌟'][index % 5];

                                        return (
                                            <motion.button
                                                key={conversation.sessionId}
                                                type="button"
                                                whileHover={{ scale: 1.01, x: 2 }}
                                                whileTap={{ scale: 0.99 }}
                                                onClick={() => handleOpenConversation(conversation.sessionId)}
                                                className={`w-full text-left rounded-xl px-3 py-2.5 border transition-all ${isActive
                                                        ? 'bg-gradient-to-r from-cyan-400/28 via-indigo-400/16 to-pink-400/16 border-cyan-300/45 text-white'
                                                        : 'bg-white/6 border-white/12 text-slate-100 hover:bg-cyan-300/12'
                                                    }`}
                                            >
                                                <div className="flex items-start justify-between gap-2 mb-1">
                                                    <p className="text-sm font-semibold truncate">
                                                        <span className="mr-1.5">{badge}</span>{title}
                                                    </p>
                                                    <span className="text-[11px] text-slate-300 shrink-0 inline-flex items-center gap-1">
                                                        <Clock3 className="w-3 h-3" />
                                                        {formatConversationTime(conversation.lastActivity)}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-300/90 line-clamp-2">{preview}</p>
                                                <div className="mt-1.5 text-[11px] text-slate-300/90">
                                                    {conversation.messageCount || 0} messages
                                                    {isArchived ? ' • archived' : isActive ? ' • active' : ''}
                                                    {hasMemorySummary ? ' • memory on' : ''}
                                                </div>
                                            </motion.button>
                                        );
                                    })
                                )}
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Main content */}
            <div className="relative z-10 h-full min-h-0 flex flex-col">
                {/* Header with AI Buddy */}
                <div className="p-4 sm:p-6">
                    <div className="max-w-3xl mx-auto">
                        <AnimatePresence>
                            {isNicknameEditorOpen && (
                                <motion.form
                                    onSubmit={handleNicknameSubmit}
                                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                                    transition={{ duration: 0.2 }}
                                    className="mb-3 rounded-2xl p-3 sm:p-4 chat-soft-panel backdrop-blur-md shadow-sm"
                                >
                                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 mb-2">
                                        <Sparkles className="w-4 h-4 text-cyan-500" />
                                        <span>Set your personal AI nickname (example: Jarvis)</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input
                                            ref={nicknameInputRef}
                                            type="text"
                                            value={nicknameDraft}
                                            onChange={(event) => setNicknameDraft(event.target.value)}
                                            disabled={assistantSaving}
                                            maxLength={24}
                                            className="flex-1 px-3 py-2 rounded-xl bg-white/90 dark:bg-white/10 border border-cyan-200/45 dark:border-cyan-200/20 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-300 text-sm text-gray-800 dark:text-white"
                                            placeholder="Enter assistant nickname..."
                                        />
                                        <motion.button
                                            type="submit"
                                            disabled={assistantSaving}
                                            whileTap={{ scale: 0.95 }}
                                            className="px-3 py-2 rounded-xl bg-gradient-to-br from-cyan-500 via-indigo-500 to-pink-500 text-white disabled:opacity-60"
                                        >
                                            {assistantSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                        </motion.button>
                                        <motion.button
                                            type="button"
                                            onClick={closeNicknameEditor}
                                            disabled={assistantSaving}
                                            whileTap={{ scale: 0.95 }}
                                            className="px-3 py-2 rounded-xl bg-white/80 dark:bg-white/10 border border-cyan-200/45 dark:border-cyan-200/20 text-gray-700 dark:text-gray-300 disabled:opacity-60"
                                        >
                                            <X className="w-4 h-4" />
                                        </motion.button>
                                    </div>
                                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                        Live preview: Call me <span className="font-semibold text-cyan-600 dark:text-cyan-300">{displayedAssistantName}</span>
                                    </p>
                                </motion.form>
                            )}
                        </AnimatePresence>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                {/* AI Buddy Character */}
                                <div className="relative p-1.5 rounded-2xl chat-soft-panel">
                                    <AIBuddy expression={buddyExpression} animation={buddyAnimation} />
                                </div>

                                <div>
                                    <h1 className="text-xl sm:text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-indigo-500 to-pink-500 dark:from-cyan-300 dark:via-indigo-200 dark:to-pink-300">
                                        AI Assistant
                                    </h1>
                                    <p className="text-sm text-slate-600 dark:text-slate-300">
                                        {isTyping
                                            ? `${displayedAssistantName} is typing...`
                                            : historyLoading
                                                ? 'Loading conversation context...'
                                                : assistantLoading
                                                    ? 'Preparing your personal assistant...'
                                                    : `Call me ${displayedAssistantName}. Your personal AI assistant for ${assistantSupportTagline}`}
                                    </p>
                                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                                        <button
                                            type="button"
                                            onClick={openNicknameEditor}
                                            className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full bg-gradient-to-r from-cyan-100/85 to-pink-100/85 dark:from-cyan-400/15 dark:to-pink-400/15 backdrop-blur-sm border border-cyan-200/45 dark:border-cyan-200/20 text-gray-700 dark:text-gray-200 hover:brightness-105 transition-all"
                                        >
                                            <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
                                            <span>Nickname: {assistantName}</span>
                                            <Pencil className="w-3.5 h-3.5" />
                                        </button>
                                        <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full bg-gradient-to-r border backdrop-blur-sm ${twinRiskBadgeClass}`}>
                                            <Sparkles className="w-3.5 h-3.5" />
                                            Twin: {twinRiskLevel} risk • {twinConfidencePct}% confidence
                                        </span>
                                        {/* <span className="chat-pill-glow inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full bg-gradient-to-r from-lime-100/85 to-emerald-100/80 dark:from-lime-400/18 dark:to-emerald-400/16 border border-lime-200/50 dark:border-lime-200/20 text-emerald-700 dark:text-emerald-200">
                                            <Sparkles className="w-3.5 h-3.5" />
                                            Cheer Mode
                                        </span> */}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {/* History toggle */}
                                <button
                                    onClick={() => setIsHistoryOpen((prev) => !prev)}
                                    className="p-2 rounded-xl bg-gradient-to-r from-cyan-100/85 to-sky-100/80 dark:from-cyan-400/15 dark:to-sky-400/15 backdrop-blur-sm border border-cyan-200/45 dark:border-cyan-200/20 hover:brightness-105 transition-all"
                                    title="Open chat history"
                                >
                                    {isHistoryOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
                                </button>

                                {/* Sound toggle */}
                                <button
                                    onClick={handleToggleSound}
                                    className="p-2 rounded-xl bg-gradient-to-r from-lime-100/85 to-emerald-100/80 dark:from-lime-400/15 dark:to-emerald-400/15 backdrop-blur-sm border border-lime-200/45 dark:border-lime-200/20 hover:brightness-105 transition-all"
                                    title={soundEnabled ? "Mute sound" : "Enable sound"}
                                >
                                    {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                                </button>

                                {/* New chat button */}
                                <button
                                    onClick={handleStartNewChat}
                                    className="px-3 py-2 sm:px-4 sm:py-2 rounded-xl bg-gradient-to-r from-pink-100/85 to-amber-100/85 dark:from-pink-400/15 dark:to-amber-400/15 backdrop-blur-sm border border-pink-200/45 dark:border-pink-200/20 hover:brightness-105 transition-all flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span className="hidden sm:inline">New Chat</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Messages container */}
                <div
                    ref={messagesScrollRef}
                    onScroll={handleMessagesScroll}
                    className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 pb-4"
                >
                    <div className="max-w-3xl mx-auto space-y-4">
                        {messages.length === 0 ? (
                            // Welcome message
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center py-12 sm:py-20"
                            >
                                <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6">
                                    <AIBuddy expression={buddyExpression} animation="wave" />
                                </div>
                                <h2 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-violet-500 to-pink-500 dark:from-cyan-300 dark:via-violet-200 dark:to-pink-300 mb-2 sm:mb-3">
                                    Hi! I&apos;m your AI Assistant. You can call me {displayedAssistantName}. 👋
                                </h2>
                                <p className="text-gray-600 dark:text-gray-400 mb-6 sm:mb-8 max-w-md mx-auto px-4">
                                    {assistantWelcomeSubtitle}
                                </p>

                                {dailyFocus.length > 0 && (
                                    <div className="mb-6 max-w-xl mx-auto text-left px-4">
                                        <div className="rounded-2xl px-4 py-3 chat-soft-panel backdrop-blur-sm">
                                            <p className="text-xs uppercase tracking-wide text-cyan-700 dark:text-cyan-300 mb-2 font-semibold">Today&apos;s Focus</p>
                                            <ul className="space-y-1">
                                                {dailyFocus.slice(0, 3).map((focus, idx) => (
                                                    <li key={`${focus}-${idx}`} className="text-sm text-gray-700 dark:text-gray-200">• {focus}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                )}

                                {/* Quick suggestions */}
                                <div className="flex flex-wrap gap-2 justify-center max-w-lg mx-auto px-4">
                                    {quickSuggestions.map((suggestion, i) => (
                                        <motion.button
                                            key={i}
                                            onClick={() => dispatch(setInputValue(suggestion))}
                                            className={`chat-action-chip px-3 py-2 sm:px-4 sm:py-2 rounded-full backdrop-blur-sm transition-all text-sm font-semibold ${quickSuggestionStyles[i % quickSuggestionStyles.length]} dark:text-slate-100`}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            {suggestion}
                                        </motion.button>
                                    ))}
                                </div>
                            </motion.div>
                        ) : (
                            // Messages list
                            <>
                                {messages.map((message, index) => (
                                    <div
                                        key={message.id || index}
                                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} ${message.role === 'user' ? 'message-user' : 'message-assistant'}`}
                                    >
                                        <div className={`max-w-[85%] sm:max-w-[75%]`}>
                                            <MessageBubble
                                                message={message}
                                                isUser={message.role === 'user'}
                                                onWidgetAction={handleWidgetAction}
                                            />
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 px-2">
                                                {new Date(message.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                ))}

                                {/* Typing indicator */}
                                {isTyping && (
                                    <div className="flex justify-start message-assistant">
                                        <div className="max-w-[85%] sm:max-w-[75%]">
                                            <div className="rounded-2xl sm:rounded-3xl px-4 py-3 sm:px-5 sm:py-4 chat-soft-panel backdrop-blur-sm">
                                                <div className="flex gap-1.5">
                                                    <div className="w-2.5 h-2.5 bg-cyan-500 rounded-full typing-dot"></div>
                                                    <div className="w-2.5 h-2.5 bg-violet-500 rounded-full typing-dot"></div>
                                                    <div className="w-2.5 h-2.5 bg-pink-500 rounded-full typing-dot"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                            </>
                        )}
                    </div>
                </div>

                <AnimatePresence>
                    {isCoachVisible && coachNudge && messages.length > 0 && !isTyping && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 8, scale: 0.98 }}
                            transition={{ duration: 0.2 }}
                            className="px-4 pb-2"
                        >
                            <div className="max-w-3xl mx-auto">
                                <div className="rounded-2xl border border-cyan-200/55 dark:border-cyan-200/20 bg-gradient-to-r from-white/92 via-cyan-50/88 to-pink-50/88 dark:from-slate-900/76 dark:via-cyan-500/10 dark:to-pink-500/10 backdrop-blur-md px-3 py-2.5 sm:px-4 sm:py-3 shadow-[0_12px_28px_rgba(6,182,212,0.14)]">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <p className="text-xs font-extrabold text-cyan-700 dark:text-cyan-300">{coachNudge.title}</p>
                                            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-0.5">{coachNudge.text}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => dismissCoachNudge(false)}
                                            className="p-1 rounded-md text-slate-500 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                                            aria-label="Dismiss coach suggestion"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                    <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                                        <button
                                            type="button"
                                            onClick={applyCoachNudge}
                                            className="px-3 py-1.5 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-cyan-500 via-indigo-500 to-pink-500 hover:brightness-105 transition-all"
                                        >
                                            Use this prompt
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => dismissCoachNudge(true)}
                                            className="px-3 py-1.5 rounded-full text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white/85 dark:bg-white/10 border border-slate-200/70 dark:border-white/15 hover:brightness-105 transition-all"
                                        >
                                            Snooze
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Input area */}
                <div className="shrink-0 p-4 border-t border-cyan-200/35 dark:border-cyan-200/15 bg-white/35 dark:bg-black/25 backdrop-blur-md">
                    <div className="max-w-3xl mx-auto">
                        <form onSubmit={handleSendMessage} className="flex gap-2 sm:gap-3">
                            <input
                                ref={inputRef}
                                type="text"
                                value={inputValue}
                                onChange={handleInputChange}
                                placeholder="Type a message..."
                                disabled={isLoading}
                                className="flex-1 px-4 py-3 sm:px-5 sm:py-3.5 rounded-2xl sm:rounded-3xl bg-white/90 dark:bg-white/10 backdrop-blur-sm border border-cyan-200/50 dark:border-cyan-200/20 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-300 disabled:opacity-50 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm sm:text-base transition-all"
                            />
                            <motion.button
                                type="submit"
                                disabled={isLoading || !inputValue.trim()}
                                className="px-4 py-3 sm:px-5 sm:py-3.5 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-cyan-500 via-indigo-500 to-pink-500 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
                                whileHover={{ scale: !isLoading && inputValue.trim() ? 1.05 : 1 }}
                                whileTap={{ scale: !isLoading && inputValue.trim() ? 0.95 : 1 }}
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Send className="w-5 h-5" />
                                )}
                            </motion.button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
