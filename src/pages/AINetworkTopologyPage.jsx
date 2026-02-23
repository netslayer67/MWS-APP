import {
    memo,
    startTransition,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { Helmet } from "react-helmet";
import gsap from "gsap";
import { animate } from "animejs";
import {
    Activity,
    Bot,
    Brain,
    Database,
    Gauge,
    Layers,
    Network,
    Play,
    Pause,
    Radar,
    Route,
    ShieldCheck,
    Sparkles,
    TimerReset,
    Zap,
} from "lucide-react";
import AnimatedPage from "@/components/AnimatedPage";
import usePreferLowMotion from "@/hooks/usePreferLowMotion";
import socketService from "@/services/socketService";

const VIEWBOX = { width: 1320, height: 860, cx: 660, cy: 430 };

const TYPE_STYLES = {
    hub: {
        accent: "#f5d16b",
        soft: "rgba(245, 209, 107, 0.18)",
        ring: "rgba(245, 209, 107, 0.42)",
        label: "#ffefb6",
        core: "#231812",
    },
    ai: {
        accent: "#6ed6ff",
        soft: "rgba(110, 214, 255, 0.16)",
        ring: "rgba(110, 214, 255, 0.36)",
        label: "#d7f6ff",
        core: "#0b1722",
    },
    backend: {
        accent: "#ff7ba6",
        soft: "rgba(255, 123, 166, 0.14)",
        ring: "rgba(255, 123, 166, 0.34)",
        label: "#ffdbe9",
        core: "#21101a",
    },
    frontend: {
        accent: "#8ce6b7",
        soft: "rgba(140, 230, 183, 0.14)",
        ring: "rgba(140, 230, 183, 0.3)",
        label: "#dfffee",
        core: "#102017",
    },
    data: {
        accent: "#7dff7c",
        soft: "rgba(125, 255, 124, 0.15)",
        ring: "rgba(125, 255, 124, 0.36)",
        label: "#e1ffd8",
        core: "#0f1b10",
    },
};

const STATUS_COLORS = {
    active: "#66f7d2",
    warm: "#facc15",
    idle: "#64748b",
    degraded: "#fb7185",
};

const EDGE_KIND_STYLES = {
    frontend: { stroke: "rgba(115, 217, 255, 0.28)", active: "#6ed6ff" },
    model: { stroke: "rgba(188, 128, 255, 0.26)", active: "#be8cff" },
    core: { stroke: "rgba(247, 206, 99, 0.25)", active: "#f5d16b" },
    storage: { stroke: "rgba(120, 255, 146, 0.24)", active: "#7dff7c" },
    security: { stroke: "rgba(255, 154, 117, 0.24)", active: "#ff9a75" },
    telemetry: { stroke: "rgba(255, 123, 166, 0.22)", active: "#ff7ba6" },
};

function clamp(num, min, max) {
    return Math.min(max, Math.max(min, num));
}

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function jitter(num, spread = 1) {
    return num + (Math.random() * 2 - 1) * spread;
}

function polarToPoint(angleDeg, rx, ry, cx = VIEWBOX.cx, cy = VIEWBOX.cy) {
    const rad = (angleDeg * Math.PI) / 180;
    return {
        x: cx + Math.cos(rad) * rx,
        y: cy + Math.sin(rad) * ry,
    };
}

function nodeFactory(config) {
    return {
        radius: 16,
        labelWidth: 144,
        labelHeight: 42,
        depth: 1,
        methods: [],
        apiCalls: [],
        config: {},
        keywords: [],
        ...config,
    };
}

function frontendNode({ id, name, short, angle, purpose, route, aiMode, audience, dx = 0, dy = 0 }) {
    return nodeFactory({
        id,
        type: "frontend",
        ring: "outer",
        angle,
        short,
        name,
        purpose,
        dx,
        dy,
        methods: ["GET", "POST", "WS"],
        apiCalls: [
            `GET ${route}`,
            "POST /api/ai/insights/preview",
            "POST /api/ai/chat/message",
        ],
        config: {
            route,
            audience,
            aiMode,
            refresh: "3s websocket + fallback polling 15s",
        },
        keywords: ["UI", "Monitoring", "Role-based"],
    });
}

function backendNode({ id, name, short, angle, purpose, methods, apiCalls, config, dx = 0, dy = 0 }) {
    return nodeFactory({
        id,
        type: "backend",
        ring: "mid",
        angle,
        short,
        name,
        purpose,
        dx,
        dy,
        methods,
        apiCalls,
        config,
        keywords: ["Service", "API", "Orchestration"],
    });
}

function aiNode({ id, name, short, angle, provider, purpose, model, config }) {
    return nodeFactory({
        id,
        type: "ai",
        ring: "inner",
        angle,
        short,
        name,
        purpose,
        radius: 18,
        labelWidth: 150,
        methods: ["Inference", "Streaming", "Function Call"],
        apiCalls: [
            "OpenRouter /chat/completions",
            "Provider model selection (runtime)",
            "Telemetry provider execution hook",
        ],
        config: {
            provider,
            model,
            timeout: "14s",
            retries: 2,
            ...config,
        },
        keywords: ["LLM", provider, "Primary/Failover"],
    });
}

function dataNode({ id, name, short, angle, purpose, engine, config, dx = 0, dy = 0 }) {
    return nodeFactory({
        id,
        type: "data",
        ring: "data",
        angle,
        short,
        name,
        purpose,
        dx,
        dy,
        labelWidth: 156,
        methods: ["Read", "Write", "Replication"],
        apiCalls: [
            "driver.connect()",
            "find / aggregate / insert",
            "changeStream / pubsub sync",
        ],
        config: {
            engine,
            ...config,
        },
        keywords: ["Storage", "Persistence", "Observability"],
    });
}

const TOPOLOGY_NODES = [
    nodeFactory({
        id: "hub-core",
        type: "hub",
        ring: "hub",
        angle: 0,
        short: "HUB",
        name: "AI Integration Control Hub",
        purpose: "Single control plane for routing, monitoring, correlation tracing, and presentation mode orchestration.",
        radius: 24,
        labelWidth: 176,
        methods: ["Route", "Fan-out", "Trace", "Health Aggregation"],
        apiCalls: [
            "GET /api/v1/dev/topology/snapshot",
            "GET /api/v1/dev/topology/health",
            "socket.io join-dev-topology",
        ],
        config: {
            mode: "Live Telemetry + Fallback Simulation",
            websocket: "socket.io room: dev-topology",
            cadence: "3.2s - 5.2s",
            traceRetention: "24h",
        },
        keywords: ["Control Plane", "Monitoring", "Presentation"],
    }),
    aiNode({
        id: "ai-openai-gpt",
        name: "OpenRouter Chat Provider",
        short: "ORT",
        angle: -90,
        provider: "OpenRouter",
        model: "OPENROUTER_MODEL (+ fallbacks)",
        purpose: "Primary chat provider wrapper used by student AI chat with runtime model selection and fallbacks.",
        config: { stream: true, temperature: 0.4, maxTokens: 2800 },
    }),
    aiNode({
        id: "ai-anthropic-claude",
        name: "Fallback AI Engine (Local)",
        short: "FBK",
        angle: 148,
        provider: "Local Fallback",
        model: "fallback narrative builders",
        purpose: "Fallback response engine for resilience when external provider fails or is rate limited.",
        config: { stream: false, safetyGuard: "template+rules", maxTokens: 2200 },
    }),
    aiNode({
        id: "ai-google-gemini",
        name: "Google Gemini Insight",
        short: "GMI",
        angle: 28,
        provider: "Google",
        model: "GOOGLE_AI_MODEL (Gemini)",
        purpose: "AI analysis engine for check-in/insight processing and executive summary enrichment.",
        config: { multimodal: true, batchWindow: "30s", maxTokens: 2400 },
    }),
    backendNode({
        id: "be-auth-rbac",
        name: "Auth & RBAC Guard",
        short: "AUTH",
        angle: -154,
        purpose: "Session validation, role-gated access, and policy filtering before AI routing.",
        methods: ["JWT Verify", "RBAC", "Scope Filter"],
        apiCalls: ["middleware/auth.authenticate", "middleware/auth.authorize", "JWT verify + role resolve"],
        config: { cache: "Redis token shadow 90s", roles: "admin, head_unit, directorate, superadmin" },
        dx: -10,
        dy: -8,
    }),
    backendNode({
        id: "be-api-gateway",
        name: "API Gateway",
        short: "API",
        angle: -112,
        purpose: "Ingress layer for all AI-integrated pages; normalizes headers and routes to orchestrator pipeline.",
        methods: ["GET", "POST", "WS Upgrade"],
        apiCalls: ["/api/v1/ai-chat/*", "/api/v1/ai-insights/*", "/api/v1/dev/topology/*"],
        config: { rateLimit: "120 rpm/user", tracing: "x-trace-id", protocol: "HTTP + Socket.io" },
        dx: -8,
        dy: -6,
    }),
    backendNode({
        id: "be-ai-orchestrator",
        name: "AI Orchestrator Service",
        short: "ORCH",
        angle: -30,
        purpose: "Selects model, composes prompt context, handles fallback, and streams unified response events.",
        methods: ["Strategy Select", "Fallback", "Streaming"],
        apiCalls: ["aiChatService.chat()", "aiInsightService.*", "provider wrappers + fallback chain"],
        config: { failover: "OpenRouter -> Local Fallback / Google AI", timeoutBudget: "18s", circuitBreaker: "enabled" },
        dx: 6,
        dy: -10,
    }),
    backendNode({
        id: "be-prompt-engine",
        name: "Prompt Compiler",
        short: "PRM",
        angle: 18,
        purpose: "Builds role-specific prompts, contextual instructions, and retrieval augmentation payloads.",
        methods: ["Template Merge", "RAG Pack", "Guardrail Prompt"],
        apiCalls: ["prompt builders (student/manager/employee)", "context prompt builders", "guardrail prompt composition"],
        config: { templates: "versioned", locale: "id-ID / en-US", promptAudit: true },
        dx: 10,
        dy: -8,
    }),
    backendNode({
        id: "be-stream-broker",
        name: "Realtime Stream Broker",
        short: "WS",
        angle: 76,
        purpose: "Publishes live topology hits, token streams, and node status updates to dashboard consumers.",
        methods: ["Pub/Sub", "WS", "Backpressure"],
        apiCalls: ["socket.io join-dev-topology", "socket.io dev-topology:update", "socket.io dashboard:* / notifications:*"],
        config: { heartbeat: "5s", channels: 10, compression: "permessage-deflate" },
        dx: 10,
        dy: 4,
    }),
    backendNode({
        id: "be-telemetry",
        name: "Telemetry & Audit",
        short: "TEL",
        angle: 136,
        purpose: "Captures latency, errors, model usage, and event traces for monitoring and compliance review.",
        methods: ["Trace Ingest", "Metrics", "Audit"],
        apiCalls: ["devTopologyTelemetryService.recordFlow()", "devTopologyTelemetryService.recordProviderCall()", "GET /api/v1/dev/topology/snapshot"],
        config: { sampling: "100% topology events (in-memory)", retention: "ring buffer 16 events" },
        dx: -4,
        dy: 8,
    }),
    dataNode({
        id: "db-vector-store",
        name: "Vector Store (RAG)",
        short: "VEC",
        angle: -2,
        purpose: "Semantic retrieval index for AI knowledge context and grounding documents.",
        engine: "pgvector / qdrant",
        config: { dims: 1536, index: "HNSW", refresh: "incremental" },
        dx: 18,
        dy: 10,
    }),
    dataNode({
        id: "db-mongodb",
        name: "MongoDB Primary",
        short: "MGO",
        angle: 44,
        purpose: "Stores sessions, AI request metadata, topology snapshots, and operational configs.",
        engine: "MongoDB Replica Set",
        config: { replicaSet: "rs0", oplog: "enabled", changeStreams: "active" },
        dx: 12,
        dy: 12,
    }),
    dataNode({
        id: "db-redis-cache",
        name: "Redis Cache",
        short: "RDS",
        angle: 100,
        purpose: "Caches auth/session context and short-lived AI response fragments for burst handling.",
        engine: "Redis",
        config: { ttl: "30s-5m", mode: "in-memory", pubsub: true },
        dx: 0,
        dy: 10,
    }),
    dataNode({
        id: "db-s3-audit",
        name: "S3 Audit Archive",
        short: "S3",
        angle: 160,
        purpose: "Immutable archive for logs, traces, and presentation evidence exports.",
        engine: "Object Storage",
        config: { lifecycle: "90d cold tier", encryption: "AES256", versioning: true },
        dx: -14,
        dy: 4,
    }),
    frontendNode({
        id: "fe-dev-topology",
        name: "Developer AI Topology",
        short: "DEV",
        angle: -170,
        route: "/dev/ai-topology",
        purpose: "Operational monitoring and presentation page showing AI integration correlations.",
        aiMode: "Observability + Simulation",
        audience: "Admin / Head Unit",
        dx: -14,
        dy: -8,
    }),
    frontendNode({
        id: "fe-student-ai-chat",
        name: "Student AI Chat",
        short: "CHAT",
        angle: -132,
        route: "/student/ai-chat",
        purpose: "Student-facing conversational assistant with guided learning and context-aware responses.",
        aiMode: "Realtime LLM Streaming",
        audience: "Student",
        dx: -10,
        dy: -10,
    }),
    frontendNode({
        id: "fe-student-ai-checkin",
        name: "Student AI Check-in",
        short: "CHK",
        angle: -92,
        route: "/student/emotional-checkin/ai",
        purpose: "Emotional check-in page integrating AI-assisted reflection and readiness scoring.",
        aiMode: "Prompted Analysis",
        audience: "Student",
        dx: -4,
        dy: -12,
    }),
    frontendNode({
        id: "fe-teacher-insights",
        name: "Teacher Dashboard (AI Insights)",
        short: "TCH",
        angle: -50,
        route: "/emotional-checkin/teacher-dashboard",
        purpose: "Teacher dashboard for AI-generated student learning and wellbeing insights.",
        aiMode: "Batch + On-demand Summary",
        audience: "Teacher",
        dx: 6,
        dy: -12,
    }),
    frontendNode({
        id: "fe-mtss-portal",
        name: "MTSS Student Portal",
        short: "MTS",
        angle: -8,
        route: "/mtss/student-portal",
        purpose: "MTSS workflow entry point using AI hints, guidance cards, and progression analytics.",
        aiMode: "Recommendation + Narrative",
        audience: "Student / Mentor",
        dx: 12,
        dy: -8,
    }),
    frontendNode({
        id: "fe-head-unit-briefing",
        name: "Head Unit Dashboard Briefing",
        short: "HUD",
        angle: 32,
        route: "/emotional-checkin/dashboard",
        purpose: "Executive briefing page summarizing AI usage, alerts, and impact across project modules.",
        aiMode: "Executive Summary",
        audience: "Head Unit",
        dx: 16,
        dy: -2,
    }),
    frontendNode({
        id: "fe-admin-user-management",
        name: "Admin User Mgmt",
        short: "ADM",
        angle: 78,
        route: "/user-management",
        purpose: "Admin operations page with AI-assisted risk flags and role recommendation cues.",
        aiMode: "Audit Assist",
        audience: "Admin",
        dx: 8,
        dy: 10,
    }),
    frontendNode({
        id: "fe-executive-presentation",
        name: "Executive AI Showcase",
        short: "PRS",
        angle: 122,
        route: "/dev/ai-topology?mode=present",
        purpose: "Presentation mode page for showcasing AI correlations, workflows, and system readiness.",
        aiMode: "Presentation Telemetry",
        audience: "Executive / Stakeholder",
        dx: -6,
        dy: 14,
    }),
];

const EDGE_DEFS = [
    { id: "e-hub-gpt", from: "hub-core", to: "ai-openai-gpt", kind: "model", curve: 0.16 },
    { id: "e-hub-claude", from: "hub-core", to: "ai-anthropic-claude", kind: "model", curve: -0.16 },
    { id: "e-hub-gemini", from: "hub-core", to: "ai-google-gemini", kind: "model", curve: 0.12 },
    { id: "e-hub-api", from: "hub-core", to: "be-api-gateway", kind: "core", curve: -0.12 },
    { id: "e-hub-orch", from: "hub-core", to: "be-ai-orchestrator", kind: "core", curve: 0.08 },
    { id: "e-hub-stream", from: "hub-core", to: "be-stream-broker", kind: "core", curve: -0.08 },

    { id: "e-gpt-orch", from: "ai-openai-gpt", to: "be-ai-orchestrator", kind: "model", curve: 0.18 },
    { id: "e-claude-orch", from: "ai-anthropic-claude", to: "be-ai-orchestrator", kind: "model", curve: -0.2 },
    { id: "e-gemini-orch", from: "ai-google-gemini", to: "be-ai-orchestrator", kind: "model", curve: 0.14 },
    { id: "e-gpt-prompt", from: "ai-openai-gpt", to: "be-prompt-engine", kind: "model", curve: 0.14 },
    { id: "e-claude-prompt", from: "ai-anthropic-claude", to: "be-prompt-engine", kind: "model", curve: 0.22 },

    { id: "e-api-auth", from: "be-api-gateway", to: "be-auth-rbac", kind: "security", curve: -0.12 },
    { id: "e-api-orch", from: "be-api-gateway", to: "be-ai-orchestrator", kind: "core", curve: 0.1 },
    { id: "e-auth-orch", from: "be-auth-rbac", to: "be-ai-orchestrator", kind: "security", curve: 0.22 },
    { id: "e-orch-prompt", from: "be-ai-orchestrator", to: "be-prompt-engine", kind: "core", curve: 0.06 },
    { id: "e-orch-telemetry", from: "be-ai-orchestrator", to: "be-telemetry", kind: "telemetry", curve: 0.18 },
    { id: "e-orch-mongo", from: "be-ai-orchestrator", to: "db-mongodb", kind: "storage", curve: 0.12, mongoRoute: true },
    { id: "e-prompt-vector", from: "be-prompt-engine", to: "db-vector-store", kind: "storage", curve: 0.08 },
    { id: "e-stream-redis", from: "be-stream-broker", to: "db-redis-cache", kind: "storage", curve: 0.08 },
    { id: "e-telemetry-s3", from: "be-telemetry", to: "db-s3-audit", kind: "telemetry", curve: 0.06 },

    { id: "e-fe-dev-api", from: "fe-dev-topology", to: "be-api-gateway", kind: "frontend", curve: -0.1 },
    { id: "e-fe-chat-api", from: "fe-student-ai-chat", to: "be-api-gateway", kind: "frontend", curve: -0.12 },
    { id: "e-fe-checkin-api", from: "fe-student-ai-checkin", to: "be-api-gateway", kind: "frontend", curve: -0.08 },
    { id: "e-fe-teacher-api", from: "fe-teacher-insights", to: "be-api-gateway", kind: "frontend", curve: 0.06 },
    { id: "e-fe-mtss-api", from: "fe-mtss-portal", to: "be-api-gateway", kind: "frontend", curve: 0.14 },
    { id: "e-fe-head-api", from: "fe-head-unit-briefing", to: "be-api-gateway", kind: "frontend", curve: 0.2 },
    { id: "e-fe-admin-api", from: "fe-admin-user-management", to: "be-api-gateway", kind: "frontend", curve: 0.18 },
    { id: "e-fe-pres-api", from: "fe-executive-presentation", to: "be-api-gateway", kind: "frontend", curve: 0.12 },
];

const EDGE_IDS = new Set(EDGE_DEFS.map((edge) => edge.id));

const SCENARIOS = [
    {
        id: "scn-student-chat-primary",
        title: "Student AI Chat: OpenRouter Primary Stream",
        summary: "Student chat page triggers OpenRouter provider flow with orchestrator + prompt compiler + MongoDB session write.",
        severity: "normal",
        primaryModel: "ai-openai-gpt",
        throughputRpm: 54,
        latencyMs: 782,
        tokensPerMin: 18200,
        activeNodes: [
            "fe-student-ai-chat",
            "be-api-gateway",
            "be-auth-rbac",
            "be-ai-orchestrator",
            "be-prompt-engine",
            "ai-openai-gpt",
            "db-mongodb",
            "be-stream-broker",
        ],
        activeEdges: [
            "e-fe-chat-api",
            "e-api-auth",
            "e-auth-orch",
            "e-api-orch",
            "e-orch-prompt",
            "e-gpt-prompt",
            "e-gpt-orch",
            "e-orch-mongo",
            "e-hub-gpt",
            "e-hub-orch",
            "e-hub-api",
            "e-hub-stream",
        ],
        explanation: "Primary user conversation flow with OpenRouter provider execution, MongoDB session persistence, and realtime stream fan-out.",
    },
    {
        id: "scn-student-chat-fallback",
        title: "Student AI Chat: Local Fallback Engine",
        summary: "Local fallback engine takes over when primary provider degrades; orchestrator preserves continuity.",
        severity: "attention",
        primaryModel: "ai-anthropic-claude",
        throughputRpm: 41,
        latencyMs: 910,
        tokensPerMin: 15600,
        activeNodes: [
            "fe-student-ai-chat",
            "be-api-gateway",
            "be-ai-orchestrator",
            "be-prompt-engine",
            "ai-anthropic-claude",
            "db-mongodb",
            "be-telemetry",
            "db-s3-audit",
        ],
        activeEdges: [
            "e-fe-chat-api",
            "e-api-orch",
            "e-orch-prompt",
            "e-claude-prompt",
            "e-claude-orch",
            "e-orch-mongo",
            "e-orch-telemetry",
            "e-telemetry-s3",
            "e-hub-claude",
        ],
        explanation: "Fallback path remains green while telemetry captures provider-switch reason and latency delta.",
    },
    {
        id: "scn-checkin-ai-summary",
        title: "Student Check-in AI Summary (Google AI)",
        summary: "AI check-in page submits reflection payload for compact emotional summary and readiness signal.",
        severity: "normal",
        primaryModel: "ai-openai-gpt",
        throughputRpm: 36,
        latencyMs: 648,
        tokensPerMin: 8400,
        activeNodes: [
            "fe-student-ai-checkin",
            "be-api-gateway",
            "be-ai-orchestrator",
            "be-prompt-engine",
            "ai-openai-gpt",
            "db-mongodb",
            "be-telemetry",
        ],
        activeEdges: [
            "e-fe-checkin-api",
            "e-api-orch",
            "e-orch-prompt",
            "e-gpt-prompt",
            "e-gpt-orch",
            "e-orch-mongo",
            "e-orch-telemetry",
            "e-hub-gpt",
            "e-hub-orch",
        ],
        explanation: "Short-form prompt path with monitoring traces and write-back of summary metadata.",
    },
    {
        id: "scn-teacher-insights-batch",
        title: "Teacher Insights Batch Digest",
        summary: "Teacher insights page launches Gemini batch analytic digest using vector retrieval context.",
        severity: "normal",
        primaryModel: "ai-google-gemini",
        throughputRpm: 18,
        latencyMs: 1420,
        tokensPerMin: 11800,
        activeNodes: [
            "fe-teacher-insights",
            "be-api-gateway",
            "be-ai-orchestrator",
            "be-prompt-engine",
            "ai-google-gemini",
            "db-vector-store",
            "be-telemetry",
        ],
        activeEdges: [
            "e-fe-teacher-api",
            "e-api-orch",
            "e-orch-prompt",
            "e-gemini-orch",
            "e-prompt-vector",
            "e-hub-gemini",
            "e-orch-telemetry",
        ],
        explanation: "Gemini is used for deeper synthesis while prompt compiler pulls RAG context from vector store.",
    },
    {
        id: "scn-mtss-guidance",
        title: "MTSS Portal Guidance Request",
        summary: "MTSS page requests recommendation narrative using primary chat provider with vector context and Redis cache assist.",
        severity: "normal",
        primaryModel: "ai-openai-gpt",
        throughputRpm: 29,
        latencyMs: 734,
        tokensPerMin: 9700,
        activeNodes: [
            "fe-mtss-portal",
            "be-api-gateway",
            "be-ai-orchestrator",
            "be-prompt-engine",
            "be-stream-broker",
            "db-redis-cache",
            "db-vector-store",
            "ai-openai-gpt",
        ],
        activeEdges: [
            "e-fe-mtss-api",
            "e-api-orch",
            "e-orch-prompt",
            "e-gpt-prompt",
            "e-gpt-orch",
            "e-prompt-vector",
            "e-hub-stream",
            "e-stream-redis",
            "e-hub-gpt",
        ],
        explanation: "RAG + cache acceleration path optimized for MTSS suggestion panel responsiveness.",
    },
    {
        id: "scn-head-unit-briefing",
        title: "Head Unit Briefing Refresh",
        summary: "Executive briefing page aggregates multi-model indicators and telemetry summary for leadership view.",
        severity: "normal",
        primaryModel: "ai-google-gemini",
        throughputRpm: 12,
        latencyMs: 1264,
        tokensPerMin: 6200,
        activeNodes: [
            "fe-head-unit-briefing",
            "be-api-gateway",
            "be-ai-orchestrator",
            "be-telemetry",
            "db-s3-audit",
            "ai-google-gemini",
            "ai-anthropic-claude",
        ],
        activeEdges: [
            "e-fe-head-api",
            "e-api-orch",
            "e-gemini-orch",
            "e-claude-orch",
            "e-orch-telemetry",
            "e-telemetry-s3",
            "e-hub-gemini",
            "e-hub-claude",
        ],
        explanation: "Leadership briefing merges telemetry evidence and cross-model narratives into one page refresh.",
    },
    {
        id: "scn-admin-audit-check",
        title: "Admin User Mgmt Audit Assist",
        summary: "Admin page requests AI-assisted audit hints; strict RBAC gate and audit logging are emphasized.",
        severity: "normal",
        primaryModel: "ai-anthropic-claude",
        throughputRpm: 21,
        latencyMs: 804,
        tokensPerMin: 5400,
        activeNodes: [
            "fe-admin-user-management",
            "be-api-gateway",
            "be-auth-rbac",
            "be-ai-orchestrator",
            "be-telemetry",
            "db-s3-audit",
            "ai-anthropic-claude",
        ],
        activeEdges: [
            "e-fe-admin-api",
            "e-api-auth",
            "e-auth-orch",
            "e-api-orch",
            "e-claude-orch",
            "e-orch-telemetry",
            "e-telemetry-s3",
            "e-hub-claude",
        ],
        explanation: "Compliance-oriented path with stronger audit emphasis and policy-safe model usage.",
    },
    {
        id: "scn-dev-topology-monitor",
        title: "Developer Topology Self-Monitor",
        summary: "This page subscribes to live topology stream, fetching health summary and event pulses.",
        severity: "normal",
        primaryModel: "ai-openai-gpt",
        throughputRpm: 9,
        latencyMs: 312,
        tokensPerMin: 1200,
        activeNodes: [
            "fe-dev-topology",
            "be-api-gateway",
            "be-stream-broker",
            "hub-core",
            "be-telemetry",
            "db-mongodb",
        ],
        activeEdges: [
            "e-fe-dev-api",
            "e-hub-api",
            "e-hub-stream",
            "e-orch-mongo",
        ],
        explanation: "Monitoring loop updates live node status, event feed, and presentation-safe summaries.",
    },
    {
        id: "scn-presentation-showcase",
        title: "Executive Presentation Showcase",
        summary: "Presentation mode page pulls curated highlights and displays topology activity for stakeholders.",
        severity: "normal",
        primaryModel: "ai-google-gemini",
        throughputRpm: 7,
        latencyMs: 478,
        tokensPerMin: 1800,
        activeNodes: [
            "fe-executive-presentation",
            "be-api-gateway",
            "be-stream-broker",
            "hub-core",
            "be-telemetry",
            "ai-google-gemini",
        ],
        activeEdges: [
            "e-fe-pres-api",
            "e-hub-api",
            "e-hub-stream",
            "e-hub-gemini",
            "e-gemini-orch",
        ],
        explanation: "Presentation mode prioritizes clarity and stable animation while still reflecting live activity.",
    },
    {
        id: "scn-vector-reindex-window",
        title: "Vector Re-index Warm Sync",
        summary: "Prompt compiler syncs retrieval vectors after content updates; Gemini validates semantic drift sample.",
        severity: "attention",
        primaryModel: "ai-google-gemini",
        throughputRpm: 15,
        latencyMs: 1132,
        tokensPerMin: 4300,
        activeNodes: [
            "be-prompt-engine",
            "db-vector-store",
            "ai-google-gemini",
            "be-telemetry",
            "hub-core",
        ],
        activeEdges: [
            "e-prompt-vector",
            "e-gemini-orch",
            "e-hub-gemini",
            "e-orch-telemetry",
        ],
        explanation: "Maintenance activity kept visible so leadership can see background AI ops, not only user requests.",
    },
    {
        id: "scn-redis-burst-buffer",
        title: "Realtime Burst Buffering",
        summary: "Stream broker absorbs burst traffic and uses Redis cache for temporary state fan-out synchronization.",
        severity: "normal",
        primaryModel: "ai-openai-gpt",
        throughputRpm: 68,
        latencyMs: 388,
        tokensPerMin: 9200,
        activeNodes: [
            "be-stream-broker",
            "db-redis-cache",
            "be-api-gateway",
            "hub-core",
            "fe-dev-topology",
            "fe-head-unit-briefing",
        ],
        activeEdges: [
            "e-stream-redis",
            "e-hub-stream",
            "e-hub-api",
            "e-fe-dev-api",
            "e-fe-head-api",
        ],
        explanation: "Realtime channel surge handling path to keep dashboards smooth during peak activity.",
    },
    {
        id: "scn-mongo-change-stream",
        title: "MongoDB Change Stream Activity",
        summary: "MongoDB change stream emits session + topology metadata updates; visual packet flow is highlighted.",
        severity: "normal",
        primaryModel: "ai-anthropic-claude",
        throughputRpm: 24,
        latencyMs: 540,
        tokensPerMin: 2100,
        activeNodes: [
            "db-mongodb",
            "be-ai-orchestrator",
            "be-stream-broker",
            "hub-core",
            "fe-dev-topology",
        ],
        activeEdges: [
            "e-orch-mongo",
            "e-hub-orch",
            "e-hub-stream",
            "e-fe-dev-api",
        ],
        explanation: "MongoDB packets are animated to make persistence and change-stream behavior visible in presentations.",
    },
    {
        id: "scn-cross-model-consensus",
        title: "Cross-Engine Consensus Review",
        summary: "Critical insight request compares primary provider + fallback engine + Google AI outputs before final executive narrative release.",
        severity: "attention",
        primaryModel: "ai-openai-gpt",
        throughputRpm: 11,
        latencyMs: 1668,
        tokensPerMin: 14900,
        activeNodes: [
            "fe-head-unit-briefing",
            "be-api-gateway",
            "be-ai-orchestrator",
            "be-prompt-engine",
            "ai-openai-gpt",
            "ai-anthropic-claude",
            "ai-google-gemini",
            "db-vector-store",
            "be-telemetry",
            "db-s3-audit",
        ],
        activeEdges: [
            "e-fe-head-api",
            "e-api-orch",
            "e-orch-prompt",
            "e-gpt-prompt",
            "e-claude-prompt",
            "e-gpt-orch",
            "e-claude-orch",
            "e-gemini-orch",
            "e-prompt-vector",
            "e-orch-telemetry",
            "e-telemetry-s3",
            "e-hub-gpt",
            "e-hub-claude",
            "e-hub-gemini",
        ],
        explanation: "High-value decision workflow demonstrating correlation across multiple AI providers.",
    },
];

function computeNodePositions(nodes) {
    const ringSpecs = {
        hub: { rx: 0, ry: 0 },
        inner: { rx: 188, ry: 136 },
        mid: { rx: 344, ry: 232 },
        data: { rx: 390, ry: 260 },
        outer: { rx: 560, ry: 336 },
    };

    return nodes.reduce((acc, node) => {
        if (node.ring === "hub") {
            acc[node.id] = {
                ...node,
                x: VIEWBOX.cx,
                y: VIEWBOX.cy,
            };
            return acc;
        }

        const ring = ringSpecs[node.ring] || ringSpecs.mid;
        const pt = polarToPoint(node.angle, ring.rx, ring.ry);
        acc[node.id] = {
            ...node,
            x: pt.x + (node.dx || 0),
            y: pt.y + (node.dy || 0),
        };
        return acc;
    }, {});
}

function buildCurvedPath(a, b, edge) {
    const vx = b.x - a.x;
    const vy = b.y - a.y;
    const len = Math.hypot(vx, vy) || 1;
    const nx = -vy / len;
    const ny = vx / len;
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2;
    const curveStrength = clamp(len * (edge.curve || 0.12), -120, 120);
    const radialBias = {
        x: (mx - VIEWBOX.cx) * 0.08,
        y: (my - VIEWBOX.cy) * 0.08,
    };

    const c1 = {
        x: a.x + vx * 0.32 + nx * curveStrength + radialBias.x,
        y: a.y + vy * 0.32 + ny * curveStrength + radialBias.y,
    };
    const c2 = {
        x: a.x + vx * 0.68 + nx * curveStrength + radialBias.x,
        y: a.y + vy * 0.68 + ny * curveStrength + radialBias.y,
    };

    return `M ${a.x.toFixed(1)} ${a.y.toFixed(1)} C ${c1.x.toFixed(1)} ${c1.y.toFixed(1)}, ${c2.x.toFixed(1)} ${c2.y.toFixed(1)}, ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
}

function getLabelPlacement(node) {
    if (node.ring === "hub") {
        return {
            x: node.x,
            y: node.y + 52,
            anchor: "middle",
        };
    }

    const vx = node.x - VIEWBOX.cx;
    const vy = node.y - VIEWBOX.cy;
    const len = Math.hypot(vx, vy) || 1;
    const pad = node.ring === "outer" ? 30 : node.ring === "inner" ? 26 : 28;
    let lx = node.x + (vx / len) * pad;
    let ly = node.y + (vy / len) * pad;

    lx = clamp(lx, 74, VIEWBOX.width - 74);
    ly = clamp(ly, 44, VIEWBOX.height - 44);

    let anchor = "middle";
    if (lx < 190) anchor = "start";
    if (lx > VIEWBOX.width - 190) anchor = "end";

    return { x: lx, y: ly, anchor };
}

function toTitleCase(value) {
    return value
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

function formatAgo(ts, now) {
    if (!ts) return "No activity yet";
    const diff = Math.max(0, Math.round((now - ts) / 1000));
    if (diff < 2) return "just now";
    if (diff < 60) return `${diff}s ago`;
    const m = Math.round(diff / 60);
    if (m < 60) return `${m}m ago`;
    const h = Math.round(m / 60);
    return `${h}h ago`;
}

function splitLabel(name) {
    const words = name.split(" ");
    if (words.length <= 2) return [name];
    const pivot = Math.ceil(words.length / 2);
    return [words.slice(0, pivot).join(" "), words.slice(pivot).join(" ")];
}

function buildRuntimeSeed(nodes) {
    return nodes.reduce((acc, node) => {
        acc[node.id] = {
            hits: 0,
            lastActiveAt: 0,
            avgLatency: node.type === "ai" ? randInt(620, 1100) : randInt(180, 480),
            queueDepth: randInt(0, 3),
            status: node.type === "hub" ? "active" : "idle",
            lastThroughput: 0,
        };
        return acc;
    }, {});
}

function buildEdgeSeed(edges) {
    return edges.reduce((acc, edge) => {
        acc[edge.id] = {
            hits: 0,
            hotness: 0,
            lastActiveAt: 0,
        };
        return acc;
    }, {});
}

function sum(array) {
    return array.reduce((total, value) => total + value, 0);
}

function getApiBaseUrl() {
    return import.meta.env.VITE_API_BASE || "/api/v1";
}

function getAuthToken() {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem("auth_token") || window.localStorage.getItem("token");
}

async function fetchDevTopologySnapshot({ signal } = {}) {
    const token = getAuthToken();
    const response = await fetch(`${getApiBaseUrl()}/dev/topology/snapshot`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        signal,
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
        const message = payload?.message || `Topology snapshot failed (${response.status})`;
        throw new Error(message);
    }
    return payload;
}

function normalizeLiveContext(rawContext) {
    if (!rawContext || typeof rawContext !== "object") return null;
    const activeEdges = Array.isArray(rawContext.activeEdges)
        ? rawContext.activeEdges.filter((id) => EDGE_IDS.has(id))
        : [];
    const activeNodes = Array.isArray(rawContext.activeNodes) ? rawContext.activeNodes : [];

    return {
        id: `backend-${rawContext.routeKey || "live"}`,
        title: rawContext.title || "Backend Telemetry Event",
        summary: rawContext.summary || "Live backend telemetry update",
        explanation: rawContext.summary || "Live backend telemetry update",
        severity: rawContext.severity || "normal",
        primaryModel: rawContext.primaryModel || null,
        throughputRpm: Math.max(0, Math.round(Number(rawContext.throughputRpm || 0))),
        latencyMs: Math.max(0, Math.round(Number(rawContext.latencyMs || 0))),
        tokensPerMin: Math.max(0, Math.round(Number(rawContext.tokensPerMin || 0))),
        activeNodes,
        activeEdges,
        source: rawContext.source || "backend",
        routeKey: rawContext.routeKey || null,
        actorRole: rawContext.actorRole || null,
    };
}

function TiltCard({ children, className = "", reducedMotion = false }) {
    const ref = useRef(null);

    useEffect(() => {
        const el = ref.current;
        if (!el || reducedMotion) return undefined;
        if (typeof window !== "undefined" && !window.matchMedia("(hover: hover)").matches) return undefined;

        const onMove = (event) => {
            const rect = el.getBoundingClientRect();
            const px = (event.clientX - rect.left) / rect.width;
            const py = (event.clientY - rect.top) / rect.height;
            const rx = (0.5 - py) * 9;
            const ry = (px - 0.5) * 11;
            el.style.setProperty("--tilt-rx", `${rx.toFixed(2)}deg`);
            el.style.setProperty("--tilt-ry", `${ry.toFixed(2)}deg`);
            el.style.setProperty("--tilt-glow-x", `${(px * 100).toFixed(1)}%`);
            el.style.setProperty("--tilt-glow-y", `${(py * 100).toFixed(1)}%`);
        };

        const onLeave = () => {
            el.style.setProperty("--tilt-rx", "0deg");
            el.style.setProperty("--tilt-ry", "0deg");
            el.style.setProperty("--tilt-glow-x", "50%");
            el.style.setProperty("--tilt-glow-y", "50%");
        };

        el.addEventListener("pointermove", onMove);
        el.addEventListener("pointerleave", onLeave);

        return () => {
            el.removeEventListener("pointermove", onMove);
            el.removeEventListener("pointerleave", onLeave);
        };
    }, [reducedMotion]);

    return (
        <div ref={ref} className={`ainet-tilt ${className}`}>
            {children}
        </div>
    );
}

const ScopedStyles = memo(() => (
    <style>{`
        .ainet-page{
            --bg0:#03020b;
            --bg1:#090f1f;
            --bg2:#151236;
            --glass:rgba(6,10,26,.62);
            --glass-strong:rgba(7,12,30,.78);
            --line:rgba(161,188,255,.12);
            --line-strong:rgba(161,188,255,.22);
            --text:#e7f0ff;
            --muted:#9fb1d9;
            --muted-2:#7d8eb2;
            font-family:'Sora','Manrope','Inter',system-ui,sans-serif;
            letter-spacing:-0.01em;
            background:#03020b;
        }

        .ainet-bg-layer{position:absolute;inset:0;pointer-events:none}
        .ainet-bg-cosmos{
            background:
              radial-gradient(1000px 480px at 10% 12%, rgba(77,147,255,.20), transparent 60%),
              radial-gradient(760px 420px at 85% 15%, rgba(130,94,255,.22), transparent 68%),
              radial-gradient(900px 580px at 48% 86%, rgba(21,188,136,.14), transparent 62%),
              linear-gradient(180deg, #070611 0%, #060813 38%, #04060d 100%);
        }
        .ainet-stars-far{
            opacity:.45;
            background-image:
              radial-gradient(1px 1px at 12% 18%, rgba(255,255,255,.45) 95%, transparent),
              radial-gradient(1px 1px at 34% 70%, rgba(154,214,255,.32) 95%, transparent),
              radial-gradient(1px 1px at 76% 24%, rgba(255,255,255,.35) 95%, transparent),
              radial-gradient(1px 1px at 66% 82%, rgba(211,182,255,.28) 95%, transparent),
              radial-gradient(1px 1px at 90% 58%, rgba(255,255,255,.32) 95%, transparent);
            background-size:380px 240px, 420px 260px, 500px 320px, 480px 280px, 360px 220px;
            animation: ainetStarDriftA 75s linear infinite;
        }
        .ainet-stars-mid{
            opacity:.34;
            background-image:
              radial-gradient(1.5px 1.5px at 20% 42%, rgba(172,233,255,.55) 95%, transparent),
              radial-gradient(1.5px 1.5px at 52% 14%, rgba(255,255,255,.48) 95%, transparent),
              radial-gradient(1.4px 1.4px at 80% 72%, rgba(141,255,206,.45) 95%, transparent),
              radial-gradient(1.4px 1.4px at 8% 86%, rgba(255,197,115,.45) 95%, transparent);
            background-size:320px 220px, 360px 260px, 340px 240px, 300px 200px;
            animation: ainetStarDriftB 50s linear infinite;
            mix-blend-mode:screen;
        }
        .ainet-stars-near{
            opacity:.28;
            background-image:
              radial-gradient(2px 2px at 12% 65%, rgba(255,255,255,.9) 95%, transparent),
              radial-gradient(2px 2px at 40% 28%, rgba(164,217,255,.85) 95%, transparent),
              radial-gradient(2px 2px at 63% 55%, rgba(172,255,188,.85) 95%, transparent),
              radial-gradient(2px 2px at 84% 18%, rgba(232,186,255,.85) 95%, transparent),
              radial-gradient(2px 2px at 70% 82%, rgba(255,235,166,.85) 95%, transparent);
            background-size:260px 180px, 300px 210px, 280px 190px, 310px 210px, 260px 170px;
            animation: ainetStarDriftC 32s linear infinite;
            filter:drop-shadow(0 0 6px rgba(120,200,255,.08));
        }
        .ainet-bg-aurora{
            opacity:.75;
            background:
              radial-gradient(55% 32% at 18% 16%, rgba(93, 227, 255, .16), transparent 70%),
              radial-gradient(42% 28% at 78% 10%, rgba(176, 116, 255, .18), transparent 74%),
              radial-gradient(60% 34% at 54% 20%, rgba(104, 255, 185, .14), transparent 72%);
            filter: blur(14px) saturate(125%);
            transform-origin:center top;
            animation: ainetAuroraWave 18s ease-in-out infinite;
        }
        .ainet-bg-hex{
            opacity:.12;
            background-image:
              linear-gradient(30deg, rgba(129,165,255,.35) 12%, transparent 12.5%, transparent 87%, rgba(129,165,255,.35) 87.5%, rgba(129,165,255,.35)),
              linear-gradient(150deg, rgba(129,165,255,.35) 12%, transparent 12.5%, transparent 87%, rgba(129,165,255,.35) 87.5%, rgba(129,165,255,.35)),
              linear-gradient(90deg, rgba(129,165,255,.18) 2%, transparent 2.5%, transparent 97%, rgba(129,165,255,.18) 97.5%, rgba(129,165,255,.18));
            background-size:44px 76px;
            background-position:0 0, 0 0, 0 0;
            mask-image: radial-gradient(circle at 50% 44%, black 35%, transparent 100%);
        }
        .ainet-bg-overlay{
            background:
              repeating-linear-gradient(180deg, rgba(255,255,255,.015) 0 1px, transparent 1px 3px),
              repeating-linear-gradient(90deg, rgba(120,255,200,.018) 0 1px, transparent 1px 4px),
              radial-gradient(ellipse at center, transparent 45%, rgba(2,3,8,.28) 72%, rgba(2,3,8,.76) 100%);
            opacity:.9;
            mix-blend-mode:screen;
        }

        .ainet-shell{
            position:relative;
            border:1px solid var(--line);
            background:
              linear-gradient(180deg, rgba(255,255,255,.03), rgba(255,255,255,.0) 30%),
              linear-gradient(160deg, rgba(113,183,255,.06), rgba(176,116,255,.04) 45%, rgba(33,255,164,.03)),
              var(--glass);
            box-shadow:
              inset 0 1px 0 rgba(255,255,255,.05),
              0 12px 40px rgba(1,3,10,.36),
              0 0 0 1px rgba(255,255,255,.01);
            backdrop-filter: blur(20px) saturate(140%);
            border-radius: 20px;
            overflow:hidden;
        }
        .ainet-shell::before{
            content:'';
            position:absolute;
            inset:0;
            pointer-events:none;
            background:
              radial-gradient(220px 120px at var(--tilt-glow-x,50%) var(--tilt-glow-y,50%), rgba(130,198,255,.10), transparent 75%),
              radial-gradient(260px 160px at calc(var(--tilt-glow-x,50%) + 12%) calc(var(--tilt-glow-y,50%) + 8%), rgba(176,116,255,.08), transparent 75%);
            opacity:.9;
        }
        .ainet-tilt{
            transform: perspective(1400px) rotateX(var(--tilt-rx,0deg)) rotateY(var(--tilt-ry,0deg));
            transform-style: preserve-3d;
            transition: transform .28s cubic-bezier(.2,.7,0,1), box-shadow .2s ease;
            will-change: transform;
        }

        .ainet-kpi-grid{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:12px}
        .ainet-kpi-card{position:relative;padding:14px 14px 12px;border-radius:16px;border:1px solid var(--line);background:rgba(7,12,28,.62);overflow:hidden}
        .ainet-kpi-card::after{content:'';position:absolute;inset:auto -20% -60% -20%;height:80%;background:radial-gradient(circle, rgba(110,214,255,.14), transparent 70%);opacity:.8;pointer-events:none}
        .ainet-kpi-label{font-size:11px;line-height:1.15;color:var(--muted);text-transform:uppercase;letter-spacing:.12em}
        .ainet-kpi-value{font-weight:700;font-size:20px;line-height:1.1;color:#edf5ff;margin-top:8px}
        .ainet-kpi-sub{margin-top:6px;font-size:12px;color:var(--muted)}

        .ainet-badge{
            display:inline-flex;align-items:center;gap:8px;
            border:1px solid rgba(255,255,255,.09);
            border-radius:999px;padding:7px 11px;
            background:rgba(8,12,27,.62);
            color:var(--text);font-size:12px;
        }
        .ainet-live-dot{width:8px;height:8px;border-radius:999px;background:#66f7d2;box-shadow:0 0 0 0 rgba(102,247,210,.6);animation:ainetLivePulse 1.6s ease-in-out infinite}
        .ainet-dot-soft{width:6px;height:6px;border-radius:999px;background:currentColor;opacity:.85}

        .ainet-main-grid{
            display:grid;
            grid-template-columns:minmax(0,1.85fr) minmax(320px,.95fr);
            gap:14px;
        }
        .ainet-bottom-grid{
            display:grid;
            grid-template-columns:minmax(0,1.15fr) minmax(0,.85fr);
            gap:14px;
        }
        @media (max-width: 1180px){
            .ainet-main-grid{grid-template-columns:1fr}
            .ainet-bottom-grid{grid-template-columns:1fr}
        }

        .ainet-toolbar-btn{
            display:inline-flex;align-items:center;gap:8px;padding:8px 12px;border-radius:12px;
            border:1px solid rgba(255,255,255,.09);background:rgba(11,16,34,.7);color:#d9e7ff;
            font-size:12px;font-weight:600;transition:background .2s ease,border-color .2s ease,transform .2s ease;
        }
        .ainet-toolbar-btn:hover{background:rgba(16,23,49,.84);border-color:rgba(110,214,255,.28);transform:translateY(-1px)}
        .ainet-toolbar-btn[aria-pressed="true"]{border-color:rgba(102,247,210,.34);background:rgba(12,28,29,.78)}

        .ainet-topology-shell{padding:14px}
        .ainet-topology-frame{
            position:relative;
            min-height:560px;
            border-radius:16px;
            border:1px solid rgba(255,255,255,.05);
            background:
              radial-gradient(700px 300px at 50% 44%, rgba(86,117,255,.06), transparent 70%),
              linear-gradient(180deg, rgba(7,12,28,.72), rgba(6,9,21,.82));
            overflow:hidden;
        }
        .ainet-topology-frame::before{
            content:'';
            position:absolute;inset:0;
            background:
              linear-gradient(180deg, rgba(110,214,255,.03), transparent 35%),
              repeating-linear-gradient(0deg, rgba(255,255,255,.015) 0 1px, transparent 1px 36px),
              repeating-linear-gradient(90deg, rgba(255,255,255,.012) 0 1px, transparent 1px 36px);
            pointer-events:none;
        }
        @media (max-width: 640px){
            .ainet-topology-frame{min-height:520px}
        }

        .ainet-legend-chip{display:inline-flex;align-items:center;gap:8px;padding:6px 10px;border-radius:999px;border:1px solid var(--line);background:rgba(7,12,26,.65);font-size:12px;color:var(--muted)}
        .ainet-legend-line{width:18px;height:2px;border-radius:999px;background:currentColor}

        .ainet-node-btn{cursor:pointer;outline:none}
        .ainet-node-btn:focus-visible .ainet-node-focus{stroke:rgba(255,255,255,.72);stroke-width:2.2}
        .ainet-node-shadow{filter:url(#ainetNodeGlow)}
        .ainet-node-label text{font-size:11px;font-weight:600;fill:#e9f1ff;pointer-events:none}
        .ainet-node-label tspan.ainet-node-label-sub{fill:#aebfe4;font-weight:500}
        .ainet-node-mini{font-size:9px;fill:#b6c5ea}
        .ainet-wire{fill:none;stroke-linecap:round;stroke-linejoin:round;vector-effect:non-scaling-stroke}
        .ainet-wire-base{stroke-width:1.45}
        .ainet-wire-active{stroke-width:2.2;filter:url(#ainetWireGlow);stroke-dasharray:10 14;animation:ainetWireFlow 1.25s linear infinite}
        .ainet-wire-hot{stroke-width:2.8;opacity:.9;filter:url(#ainetWireGlowStrong)}
        .ainet-ring-guide{fill:none;stroke:rgba(156,190,255,.12);stroke-width:1;stroke-dasharray:5 8}
        .ainet-ring-guide-strong{stroke:rgba(156,190,255,.18);stroke-dasharray:2 8}
        .ainet-spoke-guide{stroke:rgba(156,190,255,.08);stroke-width:1}
        .ainet-web-thread{fill:none;stroke:rgba(176,116,255,.08);stroke-width:1;stroke-dasharray:2 10}

        .ainet-node-core-text{font-size:10px;font-weight:800;letter-spacing:.08em;fill:#eaf3ff;pointer-events:none}
        .ainet-node-breathe{transform-box: fill-box; transform-origin: center;}
        .ainet-ring-rotate-slow{transform-box: fill-box; transform-origin: center;}
        .ainet-ring-rotate-fast{transform-box: fill-box; transform-origin: center;}
        .ainet-floaty{transform-box: fill-box; transform-origin: center;}

        .ainet-panel{padding:14px}
        .ainet-panel-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}
        .ainet-panel-title{font-size:14px;font-weight:700;color:#eff5ff}
        .ainet-panel-sub{font-size:12px;color:var(--muted);margin-top:4px;line-height:1.35}
        .ainet-sect-title{font-size:11px;text-transform:uppercase;letter-spacing:.14em;color:#97abd6;margin-bottom:8px}
        .ainet-chip-wrap{display:flex;flex-wrap:wrap;gap:7px}
        .ainet-chip{font-size:11px;color:#d7e7ff;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.03);padding:5px 8px;border-radius:999px}
        .ainet-list{display:grid;gap:7px}
        .ainet-list-row{font-size:12px;color:#cfdef8;line-height:1.35;border:1px solid rgba(255,255,255,.05);background:rgba(255,255,255,.018);padding:8px 10px;border-radius:10px}
        .ainet-config-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
        .ainet-config-item{border:1px solid rgba(255,255,255,.05);background:rgba(255,255,255,.016);padding:8px 10px;border-radius:10px}
        .ainet-config-key{font-size:10px;color:#90a6d4;text-transform:uppercase;letter-spacing:.1em}
        .ainet-config-val{font-size:12px;color:#e7f0ff;margin-top:4px;line-height:1.25;word-break:break-word}
        @media (max-width:640px){.ainet-config-grid{grid-template-columns:1fr}}

        .ainet-event-row{display:grid;grid-template-columns:auto 1fr auto;gap:10px;align-items:flex-start;padding:10px;border-radius:12px;border:1px solid rgba(255,255,255,.05);background:rgba(255,255,255,.018)}
        .ainet-event-row.active{border-color:rgba(110,214,255,.18);background:linear-gradient(135deg, rgba(110,214,255,.05), rgba(176,116,255,.03))}
        .ainet-event-row-title{font-size:12px;font-weight:600;color:#e8f1ff;line-height:1.3}
        .ainet-event-row-sub{font-size:11px;color:var(--muted);margin-top:4px;line-height:1.35}
        .ainet-event-pill{font-size:10px;padding:4px 7px;border-radius:999px;border:1px solid rgba(255,255,255,.07);color:#d8e6ff;background:rgba(255,255,255,.03);text-transform:uppercase;letter-spacing:.08em}

        .ainet-ai-card{padding:12px;border-radius:14px;border:1px solid rgba(255,255,255,.06);background:linear-gradient(180deg, rgba(255,255,255,.03), rgba(255,255,255,.01));position:relative;overflow:hidden}
        .ainet-ai-card::before{content:'';position:absolute;inset:-25% 45% auto -10%;height:90px;border-radius:50%;background:radial-gradient(circle, rgba(110,214,255,.18), transparent 70%);pointer-events:none}
        .ainet-ai-card.active{border-color:rgba(102,247,210,.22);box-shadow:inset 0 0 0 1px rgba(102,247,210,.08)}
        .ainet-ai-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
        @media (max-width: 900px){.ainet-ai-grid{grid-template-columns:1fr}}

        .ainet-scroll{scrollbar-width:thin;scrollbar-color:rgba(138,162,219,.35) transparent}
        .ainet-scroll::-webkit-scrollbar{width:8px;height:8px}
        .ainet-scroll::-webkit-scrollbar-thumb{background:rgba(138,162,219,.25);border-radius:999px}
        .ainet-scroll::-webkit-scrollbar-track{background:transparent}

        .ainet-mongo-orb{animation:ainetMongoOrbit 2.8s linear infinite}
        .ainet-mongo-packet{filter:url(#ainetMongoGlow)}
        .ainet-mongo-node-active .ainet-mongo-orb{animation-duration:1.3s}

        @keyframes ainetLivePulse{
            0%,100%{box-shadow:0 0 0 0 rgba(102,247,210,.55);opacity:.88}
            50%{box-shadow:0 0 0 7px rgba(102,247,210,0);opacity:1}
        }
        @keyframes ainetWireFlow{from{stroke-dashoffset:0}to{stroke-dashoffset:-24}}
        @keyframes ainetStarDriftA{from{background-position:0 0,0 0,0 0,0 0,0 0}to{background-position:-180px 100px,-220px 70px,-260px 120px,-180px 90px,-160px 60px}}
        @keyframes ainetStarDriftB{from{background-position:0 0,0 0,0 0,0 0}to{background-position:150px -120px,180px -90px,160px -110px,140px -80px}}
        @keyframes ainetStarDriftC{from{background-position:0 0,0 0,0 0,0 0,0 0}to{background-position:-90px -60px,-120px -90px,-100px -70px,-130px -80px,-90px -65px}}
        @keyframes ainetAuroraWave{
            0%,100%{transform:translate3d(0,0,0) scale(1) rotate(0deg)}
            25%{transform:translate3d(0,-8px,0) scale(1.03,1.02) rotate(.4deg)}
            50%{transform:translate3d(-8px,4px,0) scale(1.02,.98) rotate(-.35deg)}
            75%{transform:translate3d(6px,-4px,0) scale(.99,1.03) rotate(.28deg)}
        }
        @keyframes ainetMongoOrbit{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}

        @media (prefers-reduced-motion: reduce){
            .ainet-live-dot,.ainet-wire-active,.ainet-stars-far,.ainet-stars-mid,.ainet-stars-near,.ainet-bg-aurora,.ainet-mongo-orb{animation:none!important}
            .ainet-tilt{transform:none!important;transition:none!important}
        }
    `}</style>
));
ScopedStyles.displayName = "AINetworkTopologyScopedStyles";

function useEntranceAnimation(containerRef, reducedMotion) {
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return undefined;

        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                defaults: { ease: "power3.out", duration: reducedMotion ? 0.28 : 0.55 },
            });

            tl.fromTo(
                ".ainet-hero",
                { opacity: 0, y: 16 },
                { opacity: 1, y: 0 },
            )
                .fromTo(
                    ".ainet-kpi-card",
                    { opacity: 0, y: 18, scale: 0.98 },
                    { opacity: 1, y: 0, scale: 1, stagger: reducedMotion ? 0.02 : 0.05 },
                    "<0.06",
                )
                .fromTo(
                    ".ainet-topology-shell",
                    { opacity: 0, y: 24, scale: 0.99 },
                    { opacity: 1, y: 0, scale: 1 },
                    "<0.08",
                )
                .fromTo(
                    ".ainet-info-shell",
                    { opacity: 0, x: 20 },
                    { opacity: 1, x: 0 },
                    "<0.08",
                )
                .fromTo(
                    ".ainet-bottom-shell",
                    { opacity: 0, y: 18 },
                    { opacity: 1, y: 0, stagger: reducedMotion ? 0.02 : 0.05 },
                    "<0.08",
                )
                .fromTo(
                    ".ainet-node-enter",
                    { opacity: 0, scale: 0.8, transformOrigin: "center center" },
                    { opacity: 1, scale: 1, stagger: reducedMotion ? 0.006 : 0.018, duration: reducedMotion ? 0.2 : 0.36 },
                    "<0.02",
                );
        }, container);

        return () => ctx.revert();
    }, [containerRef, reducedMotion]);
}

function useAmbientAnimations(containerRef, reducedMotion) {
    useEffect(() => {
        const container = containerRef.current;
        if (!container || reducedMotion) return undefined;

        const animations = [];

        const floatingNodes = container.querySelectorAll(".ainet-node-breathe");
        floatingNodes.forEach((el, i) => {
            animations.push(
                animate(
                    el,
                    {
                        scale: [1, 1.045, 1],
                    },
                    {
                        duration: 2600 + (i % 5) * 240,
                        delay: i * 80,
                        loop: true,
                        ease: "inOutSine",
                    },
                ),
            );
        });

        const floaty = container.querySelectorAll(".ainet-floaty");
        floaty.forEach((el, i) => {
            animations.push(
                animate(
                    el,
                    {
                        translateY: [-2, 3, -2],
                        translateX: [0, (i % 2 ? 2 : -2), 0],
                    },
                    {
                        duration: 3400 + i * 220,
                        delay: i * 90,
                        loop: true,
                        ease: "inOutQuad",
                    },
                ),
            );
        });

        const slowRings = container.querySelectorAll(".ainet-ring-rotate-slow");
        slowRings.forEach((el, i) => {
            animations.push(
                animate(
                    el,
                    { rotate: [0, 360] },
                    {
                        duration: 16000 + i * 2800,
                        loop: true,
                        ease: "linear",
                    },
                ),
            );
        });

        const fastRings = container.querySelectorAll(".ainet-ring-rotate-fast");
        fastRings.forEach((el, i) => {
            animations.push(
                animate(
                    el,
                    { rotate: [0, -360] },
                    {
                        duration: 7000 + i * 1200,
                        loop: true,
                        ease: "linear",
                    },
                ),
            );
        });

        return () => {
            animations.forEach((animation) => animation?.pause?.());
        };
    }, [containerRef, reducedMotion]);
}

function BackgroundLayers() {
    return (
        <>
            <div className="ainet-bg-layer ainet-bg-cosmos" />
            <div className="ainet-bg-layer ainet-stars-far" />
            <div className="ainet-bg-layer ainet-stars-mid" />
            <div className="ainet-bg-layer ainet-stars-near" />
            <div className="ainet-bg-layer ainet-bg-aurora" />
            <div className="ainet-bg-layer ainet-bg-hex" />
            <div className="ainet-bg-layer ainet-bg-overlay" />
        </>
    );
}

function NodeGlyph({ node, active }) {
    if (node.type === "hub") {
        return (
            <g className="ainet-node-breathe">
                <circle r="24" fill="rgba(245,209,107,.08)" stroke="rgba(245,209,107,.42)" strokeWidth="1.5" />
                <circle r="16" fill="rgba(245,209,107,.16)" stroke="rgba(245,209,107,.34)" strokeWidth="1" className="ainet-ring-rotate-slow" />
                <path d="M -8 0 L 0 -8 L 8 0 L 0 8 Z" fill="rgba(245,209,107,.65)" stroke="rgba(255,244,204,.65)" strokeWidth="0.6" />
            </g>
        );
    }

    if (node.id === "db-mongodb") {
        return (
            <g className={active ? "ainet-mongo-node-active" : ""}>
                <ellipse cx="0" cy="-6" rx="10" ry="4.2" fill="rgba(125,255,124,.22)" stroke="rgba(125,255,124,.55)" strokeWidth="0.9" />
                <path d="M -10 -6 L -10 6 C -10 8.3 10 8.3 10 6 L 10 -6" fill="rgba(125,255,124,.08)" stroke="rgba(125,255,124,.42)" strokeWidth="0.9" />
                <ellipse cx="0" cy="6" rx="10" ry="4.2" fill="rgba(125,255,124,.12)" stroke="rgba(125,255,124,.36)" strokeWidth="0.9" />
                <g className="ainet-mongo-orb">
                    <circle className="ainet-mongo-packet" cx="14" cy="0" r="1.9" fill="#9dff9b" opacity={active ? 1 : 0.55} />
                    <circle className="ainet-mongo-packet" cx="-12" cy="5" r="1.5" fill="#7dff7c" opacity={active ? 0.9 : 0.42} />
                </g>
            </g>
        );
    }

    if (node.type === "data") {
        return (
            <g className="ainet-node-breathe">
                <ellipse cx="0" cy="-5" rx="9" ry="3.7" fill="rgba(125,255,124,.18)" stroke="rgba(125,255,124,.44)" strokeWidth="0.9" />
                <path d="M -9 -5 L -9 5 C -9 7.1 9 7.1 9 5 L 9 -5" fill="rgba(125,255,124,.06)" stroke="rgba(125,255,124,.26)" strokeWidth="0.9" />
                <ellipse cx="0" cy="5" rx="9" ry="3.7" fill="rgba(125,255,124,.10)" stroke="rgba(125,255,124,.30)" strokeWidth="0.9" />
            </g>
        );
    }

    if (node.type === "ai") {
        return (
            <g className="ainet-node-breathe">
                <circle r="9.5" fill="rgba(110,214,255,.14)" stroke="rgba(110,214,255,.42)" strokeWidth="0.9" />
                <path d="M -5 1 Q 0 -6 5 1" fill="none" stroke="rgba(110,214,255,.65)" strokeWidth="1.1" strokeLinecap="round" />
                <path d="M -4 4 H 4" fill="none" stroke="rgba(110,214,255,.55)" strokeWidth="1" strokeLinecap="round" />
            </g>
        );
    }

    if (node.type === "backend") {
        return (
            <g className="ainet-node-breathe">
                <rect x="-8.5" y="-8.5" width="17" height="17" rx="4" fill="rgba(255,123,166,.10)" stroke="rgba(255,123,166,.38)" strokeWidth="0.9" />
                <path d="M -4 -1 H 4 M -4 3 H 4 M -4 -5 H 4" fill="none" stroke="rgba(255,183,209,.68)" strokeWidth="1" strokeLinecap="round" />
            </g>
        );
    }

    return (
        <g className="ainet-node-breathe">
            <circle r="9" fill="rgba(140,230,183,.12)" stroke="rgba(140,230,183,.34)" strokeWidth="0.9" />
            <path d="M -4 0 H 4 M 0 -4 V 4" fill="none" stroke="rgba(214,255,235,.72)" strokeWidth="1" strokeLinecap="round" />
        </g>
    );
}

function TopologyCanvas({
    nodes,
    edges,
    activeScenario,
    activeEdgeIds,
    selectedNodeId,
    hoveredNodeId,
    onSelectNode,
    onHoverNode,
    nodeRuntime,
    edgeRuntime,
    nowTick,
    reducedMotion,
    mongoBoost,
}) {
    const positions = useMemo(() => computeNodePositions(nodes), [nodes]);
    const labelMap = useMemo(() => {
        return Object.values(positions).reduce((acc, node) => {
            acc[node.id] = getLabelPlacement(node);
            return acc;
        }, {});
    }, [positions]);

    const renderedEdges = useMemo(() => {
        return edges.map((edge, index) => {
            const from = positions[edge.from];
            const to = positions[edge.to];
            return {
                ...edge,
                index,
                from,
                to,
                d: buildCurvedPath(from, to, edge),
                style: EDGE_KIND_STYLES[edge.kind] || EDGE_KIND_STYLES.core,
            };
        });
    }, [positions, edges]);

    const selectedNode = positions[selectedNodeId] || positions["hub-core"];
    const scenarioEdgeSet = useMemo(() => new Set(activeEdgeIds), [activeEdgeIds]);
    const scenarioNodeSet = useMemo(() => new Set(activeScenario?.activeNodes || []), [activeScenario]);

    const radialAngles = [-162, -138, -114, -90, -62, -28, 8, 36, 68, 106, 144, 172];

    return (
        <div className="ainet-topology-frame">
            <svg
                className="relative z-[1] h-full w-full"
                viewBox={`0 0 ${VIEWBOX.width} ${VIEWBOX.height}`}
                role="img"
                aria-label="AI integration topology with nodes, wires, and live activity pulses"
                preserveAspectRatio="xMidYMid meet"
            >
                <defs>
                    <filter id="ainetNodeGlow" x="-200%" y="-200%" width="400%" height="400%">
                        <feGaussianBlur stdDeviation="6" result="blur" />
                        <feColorMatrix
                            in="blur"
                            type="matrix"
                            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 .65 0"
                        />
                    </filter>
                    <filter id="ainetWireGlow" x="-200%" y="-200%" width="400%" height="400%">
                        <feGaussianBlur stdDeviation="2.8" />
                    </filter>
                    <filter id="ainetWireGlowStrong" x="-200%" y="-200%" width="400%" height="400%">
                        <feGaussianBlur stdDeviation="5.2" />
                    </filter>
                    <filter id="ainetMongoGlow" x="-300%" y="-300%" width="600%" height="600%">
                        <feGaussianBlur stdDeviation="1.8" />
                    </filter>
                    <radialGradient id="ainetHubGlow" cx="50%" cy="50%" r="60%">
                        <stop offset="0%" stopColor="rgba(245,209,107,.16)" />
                        <stop offset="60%" stopColor="rgba(110,214,255,.08)" />
                        <stop offset="100%" stopColor="rgba(0,0,0,0)" />
                    </radialGradient>
                    <marker id="ainetArrowDim" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto" markerUnits="strokeWidth">
                        <path d="M0,0 L8,4 L0,8 z" fill="rgba(170,190,255,.35)" />
                    </marker>
                    <marker id="ainetArrowHot" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto" markerUnits="strokeWidth">
                        <path d="M0,0 L8,4 L0,8 z" fill="#8be4ff" />
                    </marker>
                </defs>

                <g opacity="0.85">
                    <circle cx={VIEWBOX.cx} cy={VIEWBOX.cy} r="132" className="ainet-ring-guide ainet-ring-guide-strong" />
                    <ellipse cx={VIEWBOX.cx} cy={VIEWBOX.cy} rx="188" ry="136" className="ainet-ring-guide" />
                    <ellipse cx={VIEWBOX.cx} cy={VIEWBOX.cy} rx="344" ry="232" className="ainet-ring-guide" />
                    <ellipse cx={VIEWBOX.cx} cy={VIEWBOX.cy} rx="390" ry="260" className="ainet-ring-guide" />
                    <ellipse cx={VIEWBOX.cx} cy={VIEWBOX.cy} rx="560" ry="336" className="ainet-ring-guide" />
                </g>

                <g opacity="0.9">
                    {radialAngles.map((angle) => {
                        const inner = polarToPoint(angle, 120, 88);
                        const outer = polarToPoint(angle, 584, 352);
                        return (
                            <line
                                key={`spoke-${angle}`}
                                x1={inner.x}
                                y1={inner.y}
                                x2={outer.x}
                                y2={outer.y}
                                className="ainet-spoke-guide"
                            />
                        );
                    })}
                </g>

                <g opacity="0.6">
                    {[-150, -110, -68, -28, 18, 58, 104, 146].map((angle, idx) => {
                        const a = polarToPoint(angle, 344, 232);
                        const b = polarToPoint(angle + 24, 560, 336);
                        const c = polarToPoint(angle + 50, 560, 336);
                        const d = `M ${a.x.toFixed(1)} ${a.y.toFixed(1)} C ${(a.x + 18).toFixed(1)} ${(a.y - 10).toFixed(1)}, ${(b.x - 12).toFixed(1)} ${(b.y + 8).toFixed(1)}, ${b.x.toFixed(1)} ${b.y.toFixed(1)} S ${(c.x - 5).toFixed(1)} ${(c.y + 6).toFixed(1)}, ${c.x.toFixed(1)} ${c.y.toFixed(1)}`;
                        return <path key={`web-${idx}`} d={d} className="ainet-web-thread" />;
                    })}
                </g>

                <circle cx={VIEWBOX.cx} cy={VIEWBOX.cy} r="180" fill="url(#ainetHubGlow)" opacity="0.9" />

                <g>
                    {renderedEdges.map((edge) => {
                        const runtime = edgeRuntime[edge.id] || { hotness: 0, hits: 0, lastActiveAt: 0 };
                        const isScenarioActive = scenarioEdgeSet.has(edge.id);
                        const isHovered = hoveredNodeId && (edge.from.id === hoveredNodeId || edge.to.id === hoveredNodeId);
                        const isSelected = selectedNodeId && (edge.from.id === selectedNodeId || edge.to.id === selectedNodeId);
                        const hotnessOpacity = clamp((runtime.hotness || 0) / 10, 0, 1);

                        return (
                            <g key={edge.id}>
                                <path
                                    id={edge.id}
                                    d={edge.d}
                                    className="ainet-wire ainet-wire-base"
                                    stroke={edge.style.stroke}
                                    markerEnd="url(#ainetArrowDim)"
                                    opacity={isHovered || isSelected ? 0.95 : 0.78}
                                />
                                {hotnessOpacity > 0.12 ? (
                                    <path
                                        d={edge.d}
                                        className="ainet-wire ainet-wire-hot"
                                        stroke={edge.style.active}
                                        opacity={0.15 + hotnessOpacity * 0.42}
                                    />
                                ) : null}
                                {isScenarioActive ? (
                                    <path
                                        d={edge.d}
                                        className="ainet-wire ainet-wire-active"
                                        stroke={edge.style.active}
                                        markerEnd="url(#ainetArrowHot)"
                                        opacity={0.88}
                                    />
                                ) : null}
                                {isScenarioActive && !reducedMotion ? (
                                    <>
                                        <circle r="3" fill={edge.style.active} opacity="0.95">
                                            <animateMotion dur="1.45s" repeatCount="indefinite" rotate="auto">
                                                <mpath href={`#${edge.id}`} />
                                            </animateMotion>
                                        </circle>
                                        <circle r="2.2" fill="#e9fbff" opacity="0.9">
                                            <animateMotion dur="1.45s" begin="-0.6s" repeatCount="indefinite" rotate="auto">
                                                <mpath href={`#${edge.id}`} />
                                            </animateMotion>
                                        </circle>
                                    </>
                                ) : null}
                                {edge.mongoRoute && !reducedMotion ? (
                                    <>
                                        {[0, 0.6, 1.2].map((offset, i) => (
                                            <circle
                                                key={`${edge.id}-mongo-${i}`}
                                                r={mongoBoost ? 2.8 : 2}
                                                fill={mongoBoost ? "#9dff9b" : "rgba(157,255,155,.55)"}
                                                opacity={mongoBoost ? 0.95 : 0.55}
                                            >
                                                <animateMotion
                                                    dur={mongoBoost ? "1.15s" : "2.5s"}
                                                    begin={`-${offset}s`}
                                                    repeatCount="indefinite"
                                                    rotate="auto"
                                                >
                                                    <mpath href={`#${edge.id}`} />
                                                </animateMotion>
                                            </circle>
                                        ))}
                                    </>
                                ) : null}
                            </g>
                        );
                    })}
                </g>

                <g>
                    {Object.values(positions).map((node) => {
                        const typeStyle = TYPE_STYLES[node.type] || TYPE_STYLES.backend;
                        const runtime = nodeRuntime[node.id] || {};
                        const isActive = scenarioNodeSet.has(node.id);
                        const isSelected = node.id === selectedNodeId;
                        const isHovered = node.id === hoveredNodeId;
                        const statusColor = STATUS_COLORS[runtime.status || "idle"] || STATUS_COLORS.idle;
                        const label = labelMap[node.id];
                        const labelLines = splitLabel(node.name);
                        const line1 = labelLines[0];
                        const line2 = labelLines[1] || `${toTitleCase(node.type)} • ${formatAgo(runtime.lastActiveAt, nowTick)}`;

                        const haloOpacity = isActive ? 0.36 : isSelected ? 0.24 : isHovered ? 0.18 : 0.1;
                        const haloRadius = (node.radius || 16) + (isActive ? 16 : isSelected ? 10 : 6);

                        return (
                            <g key={node.id} className="ainet-node-enter">
                                <circle cx={node.x} cy={node.y} r={haloRadius} fill={typeStyle.soft} opacity={haloOpacity} />
                                {isActive ? (
                                    <circle
                                        cx={node.x}
                                        cy={node.y}
                                        r={(node.radius || 16) + 8}
                                        fill="none"
                                        stroke={typeStyle.accent}
                                        strokeWidth="1.5"
                                        opacity="0.55"
                                        strokeDasharray="3 5"
                                        className="ainet-ring-rotate-fast"
                                    />
                                ) : null}

                                <g
                                    className="ainet-node-btn"
                                    role="button"
                                    tabIndex={0}
                                    aria-label={`Select node ${node.name}`}
                                    onClick={() => onSelectNode(node.id)}
                                    onMouseEnter={() => onHoverNode(node.id)}
                                    onMouseLeave={() => onHoverNode(null)}
                                    onFocus={() => onHoverNode(node.id)}
                                    onBlur={() => onHoverNode(null)}
                                    onKeyDown={(event) => {
                                        if (event.key === "Enter" || event.key === " ") {
                                            event.preventDefault();
                                            onSelectNode(node.id);
                                        }
                                    }}
                                >
                                    <circle
                                        className="ainet-node-focus"
                                        cx={node.x}
                                        cy={node.y}
                                        r={(node.radius || 16) + 14}
                                        fill="none"
                                        stroke="transparent"
                                        strokeWidth="1"
                                    />
                                    <circle
                                        cx={node.x}
                                        cy={node.y}
                                        r={(node.radius || 16) + (isSelected ? 6 : 4)}
                                        fill={isSelected ? `${typeStyle.soft}` : "rgba(255,255,255,.01)"}
                                        stroke={isSelected ? typeStyle.accent : typeStyle.ring}
                                        strokeWidth={isSelected ? 1.8 : 1.2}
                                        className={isSelected ? "ainet-node-shadow" : ""}
                                    />
                                    <circle
                                        cx={node.x}
                                        cy={node.y}
                                        r={node.radius || 16}
                                        fill={typeStyle.core}
                                        stroke={typeStyle.ring}
                                        strokeWidth="1.1"
                                        className="ainet-floaty"
                                    />
                                    <g transform={`translate(${node.x}, ${node.y})`}>
                                        <NodeGlyph node={node} active={isActive} />
                                        <text className="ainet-node-core-text" textAnchor="middle" y={node.type === "hub" ? 42 : 28}>
                                            {node.short}
                                        </text>
                                    </g>
                                </g>

                                <g className="ainet-node-label" pointerEvents="none">
                                    <line
                                        x1={node.x}
                                        y1={node.y}
                                        x2={label.x}
                                        y2={label.y}
                                        stroke="rgba(166,187,234,.18)"
                                        strokeWidth="1"
                                        strokeDasharray="2 4"
                                    />
                                    <g transform={`translate(${label.x}, ${label.y})`}>
                                        <rect
                                            x={label.anchor === "middle" ? -node.labelWidth / 2 : label.anchor === "end" ? -node.labelWidth : 0}
                                            y={-16}
                                            rx="9"
                                            width={node.labelWidth}
                                            height={labelLines.length > 1 ? node.labelHeight : 28}
                                            fill={isSelected ? "rgba(13,22,47,.9)" : "rgba(7,12,28,.72)"}
                                            stroke={isSelected ? "rgba(110,214,255,.32)" : "rgba(255,255,255,.06)"}
                                            strokeWidth="1"
                                        />
                                        <text x="0" y={labelLines.length > 1 ? -3 : 2} textAnchor={label.anchor}>
                                            <tspan>{line1}</tspan>
                                            {labelLines.length > 1 ? (
                                                <tspan className="ainet-node-label-sub" x="0" dy="13">
                                                    {line2}
                                                </tspan>
                                            ) : null}
                                        </text>
                                        <circle
                                            cx={label.anchor === "middle" ? node.labelWidth / 2 - 11 : label.anchor === "end" ? -11 : node.labelWidth - 11}
                                            cy={-7}
                                            r="3.2"
                                            fill={statusColor}
                                            opacity={isActive ? 1 : 0.8}
                                        />
                                    </g>
                                </g>
                            </g>
                        );
                    })}
                </g>

                {selectedNode ? (
                    <g pointerEvents="none">
                        <circle cx={selectedNode.x} cy={selectedNode.y} r={(selectedNode.radius || 16) + 18} fill="none" stroke="rgba(110,214,255,.18)" strokeWidth="1.2" strokeDasharray="4 6" className="ainet-ring-rotate-slow" />
                        <circle cx={selectedNode.x} cy={selectedNode.y} r={(selectedNode.radius || 16) + 26} fill="none" stroke="rgba(176,116,255,.12)" strokeWidth="1" strokeDasharray="2 8" className="ainet-ring-rotate-fast" />
                    </g>
                ) : null}
            </svg>

            <div className="pointer-events-none absolute inset-x-3 top-3 z-[2] flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="ainet-badge"><Network size={14} /> Semi Spider-Web Topology</span>
                    <span className="ainet-badge"><Route size={14} /> {edges.length} Curved Wire Paths</span>
                    <span className="ainet-badge"><Bot size={14} /> {nodes.filter((node) => node.type === "ai").length} AI Models</span>
                </div>
                <span className="ainet-badge">
                    <span className="ainet-live-dot" />
                    {activeScenario?.title || "Live activity waiting"}
                </span>
            </div>

            <div className="pointer-events-none absolute bottom-3 left-3 right-3 z-[2] flex flex-wrap items-center gap-2">
                <span className="ainet-legend-chip" style={{ color: "#6ed6ff" }}><span className="ainet-legend-line" /> Frontend Routes</span>
                <span className="ainet-legend-chip" style={{ color: "#be8cff" }}><span className="ainet-legend-line" /> AI Model Flow</span>
                <span className="ainet-legend-chip" style={{ color: "#7dff7c" }}><span className="ainet-legend-line" /> Storage / MongoDB Packets</span>
                <span className="ainet-legend-chip" style={{ color: "#ff7ba6" }}><span className="ainet-legend-line" /> Telemetry & Audit</span>
                <span className="ainet-legend-chip" style={{ color: "#f5d16b" }}><span className="ainet-legend-line" /> Core Control Plane</span>
            </div>
        </div>
    );
}

function NodeDetailPanel({
    selectedNode,
    nodeRuntime,
    connectedEdges,
    positions,
    nowTick,
}) {
    if (!selectedNode) return null;

    const runtime = nodeRuntime[selectedNode.id] || {};
    const typeStyle = TYPE_STYLES[selectedNode.type] || TYPE_STYLES.backend;
    const statusColor = STATUS_COLORS[runtime.status || "idle"] || STATUS_COLORS.idle;

    return (
        <div className="space-y-3">
            <div className="ainet-panel-head">
                <div>
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex h-8 min-w-[32px] items-center justify-center rounded-xl border px-2 text-[11px] font-bold tracking-[0.15em]" style={{ borderColor: typeStyle.ring, color: typeStyle.label, background: typeStyle.soft }}>
                            {selectedNode.short}
                        </span>
                        <div>
                            <div className="ainet-panel-title">{selectedNode.name}</div>
                            <div className="ainet-panel-sub">{selectedNode.purpose}</div>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <span className="ainet-event-pill" style={{ color: typeStyle.label, borderColor: typeStyle.ring, background: typeStyle.soft }}>
                        {toTitleCase(selectedNode.type)} Node
                    </span>
                    <span className="ainet-badge" style={{ padding: "4px 8px", fontSize: 11 }}>
                        <span className="ainet-dot-soft" style={{ color: statusColor }} /> {toTitleCase(runtime.status || "idle")}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
                <div className="ainet-config-item">
                    <div className="ainet-config-key">Hits</div>
                    <div className="ainet-config-val">{runtime.hits || 0}</div>
                </div>
                <div className="ainet-config-item">
                    <div className="ainet-config-key">Last Active</div>
                    <div className="ainet-config-val">{formatAgo(runtime.lastActiveAt, nowTick)}</div>
                </div>
                <div className="ainet-config-item">
                    <div className="ainet-config-key">Avg Latency</div>
                    <div className="ainet-config-val">{Math.round(runtime.avgLatency || 0)} ms</div>
                </div>
                <div className="ainet-config-item">
                    <div className="ainet-config-key">Queue Depth</div>
                    <div className="ainet-config-val">{runtime.queueDepth ?? 0}</div>
                </div>
            </div>

            <div>
                <div className="ainet-sect-title">Methods / Capabilities</div>
                <div className="ainet-chip-wrap">
                    {selectedNode.methods.map((method) => (
                        <span key={method} className="ainet-chip">{method}</span>
                    ))}
                </div>
            </div>

            <div>
                <div className="ainet-sect-title">API Calls / Operations</div>
                <div className="ainet-list ainet-scroll max-h-[140px] overflow-auto pr-1">
                    {selectedNode.apiCalls.map((api) => (
                        <div key={api} className="ainet-list-row">{api}</div>
                    ))}
                </div>
            </div>

            <div>
                <div className="ainet-sect-title">Configuration Snapshot</div>
                <div className="ainet-config-grid">
                    {Object.entries(selectedNode.config || {}).map(([key, value]) => (
                        <div key={key} className="ainet-config-item">
                            <div className="ainet-config-key">{key}</div>
                            <div className="ainet-config-val">{String(value)}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <div className="ainet-sect-title">Correlation Paths</div>
                <div className="ainet-list ainet-scroll max-h-[180px] overflow-auto pr-1">
                    {connectedEdges.map((edge) => {
                        const otherId = edge.from === selectedNode.id ? edge.to : edge.from;
                        const other = positions[otherId];
                        return (
                            <div key={edge.id} className="ainet-list-row">
                                <div className="flex items-center justify-between gap-3">
                                    <span>{other?.name || otherId}</span>
                                    <span className="ainet-event-pill">{toTitleCase(edge.kind)}</span>
                                </div>
                                <div className="mt-1 text-[11px] text-[#9fb1d9]">{edge.id} • {edge.from === selectedNode.id ? "outbound" : "inbound"}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

function AIStatusCards({ modelStats, activeScenario }) {
    const cards = [
        { id: "ai-openai-gpt", label: "OpenAI GPT", icon: Brain },
        { id: "ai-anthropic-claude", label: "Claude", icon: ShieldCheck },
        { id: "ai-google-gemini", label: "Gemini", icon: Sparkles },
    ];

    return (
        <div className="ainet-ai-grid">
            {cards.map((card) => {
                const stat = modelStats[card.id];
                const Icon = card.icon;
                const isActive = !!stat?.active;
                return (
                    <div key={card.id} className={`ainet-ai-card ${isActive ? "active" : ""}`}>
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <div className="flex items-center gap-2 text-[12px] font-semibold text-[#e9f2ff]">
                                    <Icon size={14} className="text-[#86dfff]" /> {card.label}
                                </div>
                                <div className="mt-1 text-[11px] text-[#99abd1]">
                                    {isActive ? `Serving: ${activeScenario?.title || "-"}` : "Standby / health monitored"}
                                </div>
                            </div>
                            <span className="ainet-badge" style={{ padding: "4px 8px", fontSize: 10 }}>
                                <span className="ainet-dot-soft" style={{ color: STATUS_COLORS[stat?.status || "idle"] }} />
                                {toTitleCase(stat?.status || "idle")}
                            </span>
                        </div>
                        <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
                            <div className="rounded-lg border border-white/5 bg-white/[0.018] px-2 py-2">
                                <div className="text-[#8ea2cf]">RPM</div>
                                <div className="mt-1 font-semibold text-[#edf5ff]">{Math.round(stat?.rpm || 0)}</div>
                            </div>
                            <div className="rounded-lg border border-white/5 bg-white/[0.018] px-2 py-2">
                                <div className="text-[#8ea2cf]">Latency</div>
                                <div className="mt-1 font-semibold text-[#edf5ff]">{Math.round(stat?.latencyMs || 0)}ms</div>
                            </div>
                            <div className="rounded-lg border border-white/5 bg-white/[0.018] px-2 py-2">
                                <div className="text-[#8ea2cf]">Success</div>
                                <div className="mt-1 font-semibold text-[#edf5ff]">{(stat?.successRate || 0).toFixed(1)}%</div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function AINetworkTopologyPage() {
    const reducedMotion = usePreferLowMotion();
    const containerRef = useRef(null);

    const nodes = TOPOLOGY_NODES;
    const edges = EDGE_DEFS;
    const positions = useMemo(() => computeNodePositions(nodes), [nodes]);

    const [selectedNodeId, setSelectedNodeId] = useState("hub-core");
    const [hoveredNodeId, setHoveredNodeId] = useState(null);
    const [isPaused, setIsPaused] = useState(false);
    const [nowTick, setNowTick] = useState(() => Date.now());
    const [activeScenarioIndex, setActiveScenarioIndex] = useState(0);
    const [eventLog, setEventLog] = useState([]);
    const [nodeRuntime, setNodeRuntime] = useState(() => buildRuntimeSeed(nodes));
    const [edgeRuntime, setEdgeRuntime] = useState(() => buildEdgeSeed(edges));
    const [systemStats, setSystemStats] = useState(() => ({
        totalRequests: 0,
        liveLatencyMs: 0,
        tokensPerMin: 0,
        activeWires: 0,
        healthScore: 98.4,
        lastEventAt: Date.now(),
        mongoBoostUntil: 0,
    }));
    const [modelStats, setModelStats] = useState({
        "ai-openai-gpt": { rpm: 0, latencyMs: 0, successRate: 99.2, active: false, status: "idle" },
        "ai-anthropic-claude": { rpm: 0, latencyMs: 0, successRate: 99.6, active: false, status: "idle" },
        "ai-google-gemini": { rpm: 0, latencyMs: 0, successRate: 99.1, active: false, status: "idle" },
    });
    const [liveActiveContext, setLiveActiveContext] = useState(null);
    const [liveMeta, setLiveMeta] = useState({
        backendAvailable: false,
        socketConnected: false,
        sourceMode: "simulator",
        lastLiveAt: 0,
        lastSnapshotAt: 0,
        viewerCount: 0,
        mappingVersion: null,
        roomName: null,
        lastError: null,
    });
    const [liveMapping, setLiveMapping] = useState(null);
    const [isPageVisible, setIsPageVisible] = useState(() => {
        if (typeof document === "undefined") return true;
        return document.visibilityState !== "hidden";
    });

    const scenarioRef = useRef(0);
    const timerRef = useRef(null);
    const pausedRef = useRef(isPaused);
    const liveApplyFrameRef = useRef(0);
    const pendingLivePayloadRef = useRef(null);

    useEntranceAnimation(containerRef, reducedMotion);
    useAmbientAnimations(containerRef, reducedMotion);

    const activeScenario = SCENARIOS[activeScenarioIndex] || SCENARIOS[0];

    useEffect(() => {
        pausedRef.current = isPaused;
    }, [isPaused]);

    useEffect(() => {
        if (typeof document === "undefined") return undefined;
        const handleVisibility = () => setIsPageVisible(document.visibilityState !== "hidden");
        document.addEventListener("visibilitychange", handleVisibility);
        return () => document.removeEventListener("visibilitychange", handleVisibility);
    }, []);

    useEffect(() => {
        const interval = window.setInterval(() => {
            if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
            setNowTick(Date.now());
        }, 2000);
        return () => window.clearInterval(interval);
    }, []);

    const applyScenario = useCallback((index, source = "auto") => {
        const boundedIndex = ((index % SCENARIOS.length) + SCENARIOS.length) % SCENARIOS.length;
        scenarioRef.current = boundedIndex;
        const scenario = SCENARIOS[boundedIndex];
        const timestamp = Date.now();
        const activeNodeSet = new Set(scenario.activeNodes);
        const activeEdgeSet = new Set((scenario.activeEdges || []).filter((id) => EDGE_IDS.has(id)));
        const isAttention = scenario.severity === "attention";

        startTransition(() => {
            setActiveScenarioIndex(boundedIndex);
            setEventLog((prev) => [
                {
                    id: `${scenario.id}-${timestamp}`,
                    title: scenario.title,
                    summary: scenario.summary,
                    severity: scenario.severity,
                    source,
                    at: timestamp,
                    latencyMs: scenario.latencyMs,
                    throughputRpm: scenario.throughputRpm,
                },
                ...prev,
            ].slice(0, 8));

            setNodeRuntime((prev) => {
                const next = { ...prev };
                for (const node of nodes) {
                    const prevNode = prev[node.id] || { hits: 0, lastActiveAt: 0, avgLatency: 0, queueDepth: 0, status: "idle", lastThroughput: 0 };
                    const wasRecent = timestamp - (prevNode.lastActiveAt || 0) < 12000;
                    const baseStatus = activeNodeSet.has(node.id) ? "active" : wasRecent ? "warm" : "idle";
                    const degraded = isAttention && node.id === scenario.primaryModel && node.type === "ai";
                    next[node.id] = {
                        ...prevNode,
                        status: degraded ? "degraded" : baseStatus,
                        queueDepth: clamp(
                            Math.round((prevNode.queueDepth || 0) * 0.5) + (activeNodeSet.has(node.id) ? randInt(1, node.type === "frontend" ? 3 : 5) : 0),
                            0,
                            16,
                        ),
                        avgLatency: clamp(
                            Math.round((prevNode.avgLatency || (node.type === "ai" ? 900 : 320)) * 0.75 + (activeNodeSet.has(node.id) ? scenario.latencyMs * (node.type === "ai" ? 0.62 : 0.28) : 0)),
                            40,
                            2400,
                        ),
                        lastThroughput: activeNodeSet.has(node.id) ? Math.round(jitter(scenario.throughputRpm * (node.type === "frontend" ? 0.8 : 1), 4)) : Math.round((prevNode.lastThroughput || 0) * 0.7),
                        hits: prevNode.hits + (activeNodeSet.has(node.id) ? 1 : 0),
                        lastActiveAt: activeNodeSet.has(node.id) ? timestamp : prevNode.lastActiveAt,
                    };
                }
                next["hub-core"] = {
                    ...(next["hub-core"] || {}),
                    status: "active",
                    lastActiveAt: timestamp,
                    hits: (next["hub-core"]?.hits || 0) + 1,
                    lastThroughput: scenario.throughputRpm,
                };
                return next;
            });

            setEdgeRuntime((prev) => {
                const next = { ...prev };
                for (const edge of edges) {
                    const prevEdge = prev[edge.id] || { hits: 0, hotness: 0, lastActiveAt: 0 };
                    const active = activeEdgeSet.has(edge.id);
                    next[edge.id] = {
                        hits: prevEdge.hits + (active ? 1 : 0),
                        lastActiveAt: active ? timestamp : prevEdge.lastActiveAt,
                        hotness: clamp((prevEdge.hotness || 0) * 0.58 + (active ? randInt(4, 9) : 0), 0, 10),
                    };
                }
                return next;
            });

            setSystemStats((prev) => {
                const nextTotalRequests = prev.totalRequests + Math.max(1, Math.round(scenario.throughputRpm / 3));
                const nextLatency = Math.round((prev.liveLatencyMs || scenario.latencyMs) * 0.65 + scenario.latencyMs * 0.35);
                const nextTokens = Math.round((prev.tokensPerMin || scenario.tokensPerMin) * 0.52 + scenario.tokensPerMin * 0.48);
                const activeWireCount = activeEdgeSet.size;
                const healthPenalty = isAttention ? randInt(1, 4) * 0.35 : 0;
                const healthRecovery = !isAttention ? 0.22 : 0;
                return {
                    ...prev,
                    totalRequests: nextTotalRequests,
                    liveLatencyMs: nextLatency,
                    tokensPerMin: nextTokens,
                    activeWires: activeWireCount,
                    healthScore: clamp((prev.healthScore || 98.4) - healthPenalty + healthRecovery, 90.2, 99.8),
                    lastEventAt: timestamp,
                    mongoBoostUntil: scenario.activeNodes.includes("db-mongodb") ? timestamp + 3600 : prev.mongoBoostUntil,
                };
            });

            setModelStats((prev) => {
                const next = { ...prev };
                const modelIds = ["ai-openai-gpt", "ai-anthropic-claude", "ai-google-gemini"];
                modelIds.forEach((id) => {
                    const current = prev[id] || { rpm: 0, latencyMs: 0, successRate: 99.2, active: false, status: "idle" };
                    const active = scenario.primaryModel === id || scenario.activeNodes.includes(id);
                    const rpmTarget = active ? Math.max(6, scenario.throughputRpm * (scenario.primaryModel === id ? 1 : 0.45)) : Math.max(0, (current.rpm || 0) * 0.7);
                    const latencyTarget = active ? Math.round(scenario.latencyMs * (scenario.primaryModel === id ? 1 : 0.88)) : Math.max(120, Math.round((current.latencyMs || 260) * 0.9));
                    const successRate = clamp(
                        (current.successRate || 99) * 0.7 + (active && isAttention && scenario.primaryModel === id ? jitter(97.8, 0.5) : jitter(99.35, 0.2)) * 0.3,
                        96.2,
                        99.9,
                    );
                    next[id] = {
                        rpm: Math.round(jitter(rpmTarget, active ? 3 : 1.5)),
                        latencyMs: Math.round(jitter(latencyTarget, active ? 28 : 10)),
                        successRate,
                        active,
                        status: active ? (isAttention && scenario.primaryModel === id ? "degraded" : "active") : (current.rpm > 8 ? "warm" : "idle"),
                    };
                });
                return next;
            });
        });
    }, [edges, nodes]);

    const applyBackendTelemetry = useCallback((incomingPayload, source = "socket") => {
        const payload = incomingPayload?.data ? incomingPayload.data : incomingPayload;
        const runtime = payload?.runtime;
        if (!payload || !runtime) return;

        pendingLivePayloadRef.current = { payload, runtime, source };
        if (liveApplyFrameRef.current) return;

        liveApplyFrameRef.current = window.requestAnimationFrame(() => {
            liveApplyFrameRef.current = 0;
            const queued = pendingLivePayloadRef.current;
            pendingLivePayloadRef.current = null;
            if (!queued) return;
            if (pausedRef.current) return;

            const { payload: queuedPayload, runtime: queuedRuntime, source: queuedSource } = queued;
            const ts = Date.now();
            const normalizedContext = normalizeLiveContext(queuedRuntime.activeContext);

            startTransition(() => {
                if (queuedRuntime.nodeRuntime && typeof queuedRuntime.nodeRuntime === "object") {
                    setNodeRuntime((prev) => ({ ...prev, ...queuedRuntime.nodeRuntime }));
                }
                if (queuedRuntime.edgeRuntime && typeof queuedRuntime.edgeRuntime === "object") {
                    setEdgeRuntime((prev) => ({ ...prev, ...queuedRuntime.edgeRuntime }));
                }
                if (queuedRuntime.systemStats && typeof queuedRuntime.systemStats === "object") {
                    setSystemStats((prev) => ({ ...prev, ...queuedRuntime.systemStats }));
                }
                if (queuedRuntime.modelStats && typeof queuedRuntime.modelStats === "object") {
                    setModelStats((prev) => ({ ...prev, ...queuedRuntime.modelStats }));
                }
                if (Array.isArray(queuedRuntime.events)) {
                    setEventLog(queuedRuntime.events.slice(0, 8));
                }
                if (normalizedContext) {
                    setLiveActiveContext(normalizedContext);
                }
                if (queuedPayload.mapping) {
                    setLiveMapping(queuedPayload.mapping);
                }

                setLiveMeta((prev) => ({
                    ...prev,
                    backendAvailable: true,
                    socketConnected: queuedSource === "socket" ? true : prev.socketConnected,
                    sourceMode: "backend-live",
                    lastLiveAt: ts,
                    lastSnapshotAt: queuedSource === "snapshot" ? ts : prev.lastSnapshotAt,
                    viewerCount: Number(queuedRuntime.viewers || prev.viewerCount || 0),
                    mappingVersion: queuedPayload.version || prev.mappingVersion,
                    roomName: queuedPayload.roomName || prev.roomName,
                    lastError: null,
                }));
            });
        });
    }, []);

    const triggerNextScenario = useCallback((source = "manual") => {
        const nextIndex = (scenarioRef.current + 1) % SCENARIOS.length;
        applyScenario(nextIndex, source);
    }, [applyScenario]);

    useEffect(() => {
        applyScenario(0, "bootstrap");
    }, [applyScenario]);

    useEffect(() => {
        let mounted = true;
        const abortController = new AbortController();

        const handleSnapshot = (payload) => {
            if (!mounted) return;
            applyBackendTelemetry(payload, "snapshot");
        };

        const handleUpdate = (payload) => {
            if (!mounted) return;
            applyBackendTelemetry(payload, "socket");
        };
        const handleSocketConnect = () => {
            if (!mounted) return;
            setLiveMeta((prev) => ({ ...prev, socketConnected: true }));
        };
        const handleSocketDisconnect = () => {
            if (!mounted) return;
            setLiveMeta((prev) => ({ ...prev, socketConnected: false }));
        };

        const hydrateSnapshot = async () => {
            try {
                const payload = await fetchDevTopologySnapshot({ signal: abortController.signal });
                if (!mounted) return;
                handleSnapshot(payload);
            } catch (error) {
                if (error?.name === "AbortError") return;
                setLiveMeta((prev) => ({
                    ...prev,
                    backendAvailable: false,
                    sourceMode: prev.lastLiveAt ? prev.sourceMode : "simulator",
                    lastError: error.message || "Failed to fetch topology snapshot",
                }));
            }
        };

        socketService.connect();
        socketService.on("connect", handleSocketConnect);
        socketService.on("disconnect", handleSocketDisconnect);
        socketService.onDevTopologySnapshot(handleSnapshot);
        socketService.onDevTopologyUpdate(handleUpdate);
        socketService.joinDevTopology();
        setLiveMeta((prev) => ({ ...prev, socketConnected: socketService.isSocketConnected || prev.socketConnected }));

        hydrateSnapshot();

        const snapshotInterval = window.setInterval(() => {
            if (!mounted || pausedRef.current) return;
            if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
            hydrateSnapshot();
        }, 30000);

        return () => {
            mounted = false;
            abortController.abort();
            window.clearInterval(snapshotInterval);
            socketService.off("connect", handleSocketConnect);
            socketService.off("disconnect", handleSocketDisconnect);
            socketService.offDevTopologySnapshot(handleSnapshot);
            socketService.offDevTopologyUpdate(handleUpdate);
            socketService.leaveDevTopology();
            if (liveApplyFrameRef.current) {
                window.cancelAnimationFrame(liveApplyFrameRef.current);
                liveApplyFrameRef.current = 0;
            }
        };
    }, [applyBackendTelemetry]);

    useEffect(() => {
        const liveFresh = liveMeta.backendAvailable && (Date.now() - (liveMeta.lastLiveAt || 0) < 15000);
        if (isPaused || liveFresh || !isPageVisible) return undefined;
        let cancelled = false;

        const schedule = () => {
            const delay = reducedMotion ? 4200 : randInt(3200, 5200);
            timerRef.current = window.setTimeout(() => {
                if (cancelled) return;
                triggerNextScenario("auto");
                schedule();
            }, delay);
        };

        schedule();

        return () => {
            cancelled = true;
            if (timerRef.current) window.clearTimeout(timerRef.current);
        };
    }, [isPaused, reducedMotion, triggerNextScenario, liveMeta.backendAvailable, liveMeta.lastLiveAt, isPageVisible]);

    const selectedNode = positions[selectedNodeId] || positions["hub-core"];

    const selectedConnectedEdges = useMemo(() => {
        return edges.filter((edge) => edge.from === selectedNodeId || edge.to === selectedNodeId);
    }, [edges, selectedNodeId]);

    const topologyCounts = useMemo(() => {
        const byType = nodes.reduce((acc, node) => {
            acc[node.type] = (acc[node.type] || 0) + 1;
            return acc;
        }, {});
        return byType;
    }, [nodes]);

    const liveTelemetryFresh = liveMeta.backendAvailable && !!liveActiveContext && (nowTick - (liveMeta.lastLiveAt || 0) < 15000);
    const displayScenario = liveTelemetryFresh ? liveActiveContext : activeScenario;
    const activeEdgeIds = displayScenario?.activeEdges?.filter((id) => EDGE_IDS.has(id)) || [];
    const activeNodeCount = displayScenario?.activeNodes?.length || 0;
    const mongoBoost = systemStats.mongoBoostUntil > nowTick;
    const topActiveNodes = useMemo(() => {
        return Object.entries(nodeRuntime)
            .filter(([id]) => id !== "hub-core")
            .sort((a, b) => (b[1]?.hits || 0) - (a[1]?.hits || 0))
            .slice(0, 5)
            .map(([id, stats]) => ({ id, stats, node: positions[id] }));
    }, [nodeRuntime, positions]);

    const wireUtilization = useMemo(() => {
        const hotnessValues = Object.values(edgeRuntime).map((edge) => edge.hotness || 0);
        return hotnessValues.length ? Math.round((sum(hotnessValues) / (hotnessValues.length * 10)) * 100) : 0;
    }, [edgeRuntime]);
    const dataSourceLabel = liveTelemetryFresh ? "backend-live" : "simulator";
    const sourceModeDisplay = liveTelemetryFresh ? "backend-live" : "simulator";
    const liveAgeMs = liveMeta.lastLiveAt ? Math.max(0, nowTick - liveMeta.lastLiveAt) : null;

    const summaryCards = [
        {
            key: "endpoints",
            label: "Integrated Endpoints",
            value: nodes.filter((node) => node.type !== "hub").length,
            sub: "21 endpoints + 1 control hub (visual)",
            icon: Layers,
            color: "#86dfff",
        },
        {
            key: "wires",
            label: "Measured Wires",
            value: `${edges.length}`,
            sub: `${systemStats.activeWires || activeEdgeIds.length} active in current ${dataSourceLabel}`,
            icon: Route,
            color: "#f5d16b",
        },
        {
            key: "latency",
            label: "Live Latency",
            value: `${Math.round(systemStats.liveLatencyMs || displayScenario?.latencyMs || 0)} ms`,
            sub: `${displayScenario?.throughputRpm || 0} rpm ${liveTelemetryFresh ? "backend flow" : "simulated flow"}`,
            icon: Gauge,
            color: "#ff9a75",
        },
        {
            key: "health",
            label: "Topology Health",
            value: `${(systemStats.healthScore || 98.4).toFixed(1)}%`,
            sub: `${wireUtilization}% wire utilization intensity`,
            icon: Activity,
            color: "#66f7d2",
        },
    ];

    const statusMeta = {
        activeEdgeIds,
        activeNodeCount,
        nowTime: new Date(nowTick).toLocaleTimeString("id-ID", { hour12: false }),
        lastUpdate: new Date(systemStats.lastEventAt || nowTick).toLocaleTimeString("id-ID", { hour12: false }),
    };

    return (
        <AnimatedPage>
            <Helmet>
                <title>AI Network Topology | Developer Monitoring</title>
                <meta
                    name="description"
                    content="Advanced AI integration topology page for developer and head unit monitoring with real-time wire activity and node correlations."
                />
            </Helmet>
            <ScopedStyles />

            <div ref={containerRef} className="ainet-page relative min-h-screen overflow-hidden text-white">
                <BackgroundLayers />

                <div className="relative z-10 px-3 py-4 sm:px-5 sm:py-5 lg:px-7 lg:py-6">
                    <header className="ainet-hero ainet-shell mb-3 p-4 sm:p-5">
                        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(330px,.9fr)]">
                            <div className="min-w-0">
                                <div className="mb-2 flex flex-wrap items-center gap-2">
                                    <span className="ainet-badge">
                                        <span className="ainet-live-dot" /> Live AI Integration Monitoring
                                    </span>
                                    <span className="ainet-badge"><Radar size={14} /> Developer + Head Unit Presentation Mode</span>
                                    <span className="ainet-badge"><Zap size={14} /> GSAP + Anime.js Enhanced Motion</span>
                                    <span className="ainet-badge">
                                        <span className="ainet-dot-soft" style={{ color: liveTelemetryFresh ? "#66f7d2" : "#facc15" }} />
                                        Source {liveTelemetryFresh ? "Backend Live" : "Simulator Fallback"}
                                    </span>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="hidden h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-[#86dfff] sm:flex">
                                        <Network size={20} />
                                    </div>
                                    <div>
                                        <h1 className="text-[20px] font-semibold leading-tight tracking-[-0.02em] text-[#eff5ff] sm:text-[24px] lg:text-[28px]">
                                            AI Network Topology Page
                                        </h1>
                                        <p className="mt-2 max-w-3xl text-[13px] leading-6 text-[#a7b8dc] sm:text-[14px]">
                                            Halaman khusus developer untuk memantau jalur integrasi AI antar halaman web, service backend, model AI, dan data store secara real-time. Wire path dibuat semi spider-web dengan concentric rings, pulse direction, dan panel detail agar korelasi mudah dijelaskan saat monitoring maupun presentasi.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 sm:p-4">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div>
                                        <div className="text-[11px] uppercase tracking-[0.14em] text-[#91a6d5]">Live Source Control</div>
                                        <div className="mt-1 text-[13px] font-semibold text-[#edf4ff]">
                                            {liveTelemetryFresh ? "Backend Telemetry Active" : "Simulator Active (Fallback)"}
                                        </div>
                                    </div>
                                    <span className="ainet-event-pill">{sourceModeDisplay}</span>
                                </div>

                                <div className="mt-3 grid grid-cols-2 gap-2">
                                    <div className="ainet-config-item">
                                        <div className="ainet-config-key">Socket</div>
                                        <div className="ainet-config-val">{liveMeta.socketConnected ? "Connected" : "Connecting / Idle"}</div>
                                    </div>
                                    <div className="ainet-config-item">
                                        <div className="ainet-config-key">Backend Snapshot</div>
                                        <div className="ainet-config-val">{liveMeta.lastSnapshotAt ? formatAgo(liveMeta.lastSnapshotAt, nowTick) : "Not loaded"}</div>
                                    </div>
                                    <div className="ainet-config-item">
                                        <div className="ainet-config-key">Live Event Age</div>
                                        <div className="ainet-config-val">{liveAgeMs == null ? "N/A" : `${Math.round(liveAgeMs / 1000)}s`}</div>
                                    </div>
                                    <div className="ainet-config-item">
                                        <div className="ainet-config-key">Viewers / Room</div>
                                        <div className="ainet-config-val">{liveMeta.viewerCount || 0} • {liveMeta.roomName || "dev-topology"}</div>
                                    </div>
                                </div>

                                <div className="mt-3 flex flex-wrap items-center gap-2">
                                    <button
                                        type="button"
                                        className="ainet-toolbar-btn"
                                        onClick={() => setIsPaused((prev) => !prev)}
                                        aria-pressed={isPaused}
                                    >
                                        {isPaused ? <Play size={14} /> : <Pause size={14} />}
                                        {isPaused ? "Resume Updates" : "Pause Updates"}
                                    </button>
                                    <button
                                        type="button"
                                        className="ainet-toolbar-btn"
                                        onClick={() => triggerNextScenario("manual")}
                                        disabled={liveTelemetryFresh}
                                        title={liveTelemetryFresh ? "Disabled while backend live telemetry is active" : "Run fallback simulator scenario"}
                                        style={liveTelemetryFresh ? { opacity: 0.55, cursor: "not-allowed" } : undefined}
                                    >
                                        <TimerReset size={14} /> Trigger Next Scenario
                                    </button>
                                </div>
                                <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px] text-[#a3b6df]">
                                    <span className="ainet-badge"><ClockIcon /> {statusMeta.nowTime}</span>
                                    <span className="ainet-badge"><Activity size={14} /> Last Update {statusMeta.lastUpdate}</span>
                                    {liveMeta.mappingVersion ? <span className="ainet-badge"><Layers size={14} /> {liveMeta.mappingVersion}</span> : null}
                                </div>
                                {liveMeta.lastError ? (
                                    <div className="mt-3 rounded-xl border border-amber-400/20 bg-amber-300/5 px-3 py-2 text-[11px] leading-5 text-amber-200">
                                        Backend telemetry unavailable: {liveMeta.lastError}. Halaman tetap berjalan dengan simulator fallback.
                                    </div>
                                ) : null}
                            </div>
                        </div>

                        <div className="mt-4 ainet-kpi-grid">
                            {summaryCards.map((card, idx) => {
                                const Icon = card.icon;
                                const colSpan = idx === 0 ? "col-span-12 sm:col-span-6 xl:col-span-4" : "col-span-12 sm:col-span-6 xl:col-span-2";
                                return (
                                    <div key={card.key} className={`ainet-kpi-card ${colSpan}`}>
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <div className="ainet-kpi-label">{card.label}</div>
                                                <div className="ainet-kpi-value">{card.value}</div>
                                                <div className="ainet-kpi-sub">{card.sub}</div>
                                            </div>
                                            <div
                                                className="mt-0.5 rounded-xl border p-2"
                                                style={{
                                                    borderColor: `${card.color}33`,
                                                    color: card.color,
                                                    background: `${card.color}12`,
                                                }}
                                            >
                                                <Icon size={15} />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div className="ainet-kpi-card col-span-12 xl:col-span-2">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <div className="ainet-kpi-label">Current Scenario</div>
                                        <div className="ainet-kpi-value text-[16px] sm:text-[18px]">{displayScenario?.title || "Waiting for data"}</div>
                                        <div className="ainet-kpi-sub">{statusMeta.activeNodeCount} active nodes • {activeEdgeIds.length} active wires</div>
                                    </div>
                                    <div className="mt-0.5 rounded-xl border border-white/10 bg-white/5 p-2 text-[#be8cff]">
                                        <Bot size={15} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </header>

                    <div className="ainet-main-grid">
                        <TiltCard reducedMotion={reducedMotion} className="ainet-shell ainet-topology-shell">
                            <TopologyCanvas
                                nodes={nodes}
                                edges={edges}
                                activeScenario={displayScenario}
                                activeEdgeIds={activeEdgeIds}
                                selectedNodeId={selectedNodeId}
                                hoveredNodeId={hoveredNodeId}
                                onSelectNode={setSelectedNodeId}
                                onHoverNode={setHoveredNodeId}
                                nodeRuntime={nodeRuntime}
                                edgeRuntime={edgeRuntime}
                                nowTick={nowTick}
                                reducedMotion={reducedMotion}
                                mongoBoost={mongoBoost}
                            />
                        </TiltCard>

                        <TiltCard reducedMotion={reducedMotion} className="ainet-shell ainet-info-shell ainet-panel flex flex-col gap-4">
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <div className="text-[13px] font-semibold text-[#edf4ff]">Node Detail & Correlation Inspector</div>
                                    <div className="mt-1 text-[12px] leading-5 text-[#9db1da]">Klik node pada topology untuk melihat purpose, methods, API calls, konfigurasi, dan relasi wire yang terhubung.</div>
                                </div>
                                <div className="rounded-xl border border-white/10 bg-white/5 p-2 text-[#86dfff]">
                                    <Database size={16} />
                                </div>
                            </div>

                            <NodeDetailPanel
                                selectedNode={selectedNode}
                                nodeRuntime={nodeRuntime}
                                connectedEdges={selectedConnectedEdges}
                                positions={positions}
                                nowTick={nowTick}
                            />

                            <div className="mt-auto rounded-xl border border-white/5 bg-white/[0.018] p-3">
                                <div className="ainet-sect-title mb-2">Topology Breakdown</div>
                                <div className="grid grid-cols-2 gap-2 text-[12px]">
                                    <div className="ainet-config-item"><div className="ainet-config-key">Hub</div><div className="ainet-config-val">{topologyCounts.hub || 0}</div></div>
                                    <div className="ainet-config-item"><div className="ainet-config-key">AI Models</div><div className="ainet-config-val">{topologyCounts.ai || 0}</div></div>
                                    <div className="ainet-config-item"><div className="ainet-config-key">Backend Services</div><div className="ainet-config-val">{topologyCounts.backend || 0}</div></div>
                                    <div className="ainet-config-item"><div className="ainet-config-key">Frontend Pages</div><div className="ainet-config-val">{topologyCounts.frontend || 0}</div></div>
                                    <div className="ainet-config-item col-span-2"><div className="ainet-config-key">Data Stores</div><div className="ainet-config-val">{topologyCounts.data || 0} (MongoDB + Vector + Redis + S3 Archive)</div></div>
                                </div>
                                <p className="mt-2 text-[11px] leading-5 text-[#90a6d4]">
                                    Catatan: breakdown kategori menghasilkan 21 integrated endpoints, ditambah 1 control hub visual untuk orchestration center (total 22 node visual) agar hirarki monitoring lebih jelas.
                                </p>
                            </div>

                            {liveMapping?.frontendPageRoutes ? (
                                <div className="rounded-xl border border-white/5 bg-white/[0.018] p-3">
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="ainet-sect-title mb-0">Final Route Mapping (Backend-fed)</div>
                                        <span className="ainet-event-pill">{Object.keys(liveMapping.frontendPageRoutes || {}).length} pages</span>
                                    </div>
                                    <div className="mt-2 ainet-scroll max-h-[140px] space-y-2 overflow-auto pr-1">
                                        {Object.entries(liveMapping.frontendPageRoutes || {}).map(([nodeId, routePath]) => (
                                            <div key={nodeId} className="rounded-lg border border-white/5 bg-white/[0.014] px-2 py-2">
                                                <div className="text-[11px] font-semibold text-[#e8f1ff]">{positions[nodeId]?.name || nodeId}</div>
                                                <div className="mt-1 break-all text-[11px] text-[#93a7d2]">{routePath}</div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-2 text-[11px] leading-5 text-[#8da2cf]">
                                        Backend service mappings: {Object.keys(liveMapping.backendServices || {}).length} services • Flow keys: {(liveMapping.flowKeys || []).length}
                                    </div>
                                </div>
                            ) : null}
                        </TiltCard>
                    </div>

                    <div className="ainet-bottom-grid mt-3">
                        <TiltCard reducedMotion={reducedMotion} className="ainet-shell ainet-bottom-shell p-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <div className="text-[13px] font-semibold text-[#edf4ff]">AI Model Status & Realtime Indicators</div>
                                    <div className="mt-1 text-[12px] text-[#9db1da]">
                                        {liveTelemetryFresh
                                            ? "Status model mengikuti telemetry backend real (route hits + provider execution)."
                                            : "Status model mengikuti simulator fallback (13 scenario rotasi otomatis tiap 3.2-5.2 detik)."}
                                    </div>
                                </div>
                                <span className="ainet-badge"><Bot size={14} /> Tokens/min {Math.round(systemStats.tokensPerMin || displayScenario?.tokensPerMin || 0).toLocaleString("id-ID")}</span>
                            </div>
                            <div className="mt-3">
                                <AIStatusCards modelStats={modelStats} activeScenario={displayScenario} />
                            </div>

                            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <div className="rounded-xl border border-white/5 bg-white/[0.018] p-3">
                                    <div className="ainet-sect-title">Active Correlation Narrative</div>
                                    <div className="text-[13px] font-semibold leading-5 text-[#edf5ff]">{displayScenario?.title || "Waiting for telemetry"}</div>
                                    <p className="mt-2 text-[12px] leading-5 text-[#9fb1d9]">{displayScenario?.explanation || "No active correlation narrative yet."}</p>
                                    <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                                        <span className="ainet-event-pill">Latency {Math.round(displayScenario?.latencyMs || 0)}ms</span>
                                        <span className="ainet-event-pill">Throughput {Math.round(displayScenario?.throughputRpm || 0)} rpm</span>
                                        <span className="ainet-event-pill">Primary {positions[displayScenario?.primaryModel]?.short || "-"}</span>
                                        <span className="ainet-event-pill">Severity {displayScenario?.severity || "normal"}</span>
                                    </div>
                                </div>
                                <div className="rounded-xl border border-white/5 bg-white/[0.018] p-3">
                                    <div className="ainet-sect-title">Top Active Nodes (Session)</div>
                                    <div className="space-y-2">
                                        {topActiveNodes.map((item, idx) => (
                                            <div key={item.id} className="flex items-center justify-between gap-3 rounded-lg border border-white/5 bg-white/[0.014] px-2 py-2">
                                                <div className="min-w-0">
                                                    <div className="truncate text-[12px] font-medium text-[#e8f1ff]">{idx + 1}. {item.node?.name || item.id}</div>
                                                    <div className="text-[11px] text-[#93a7d2]">{toTitleCase(item.node?.type || "node")} • {formatAgo(item.stats?.lastActiveAt, nowTick)}</div>
                                                </div>
                                                <div className="text-right text-[11px]">
                                                    <div className="font-semibold text-[#dff0ff]">{item.stats?.hits || 0} hits</div>
                                                    <div className="text-[#8fa6d4]">{Math.round(item.stats?.avgLatency || 0)}ms</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </TiltCard>

                        <TiltCard reducedMotion={reducedMotion} className="ainet-shell ainet-bottom-shell p-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <div className="text-[13px] font-semibold text-[#edf4ff]">{liveTelemetryFresh ? "Realtime Activity Feed (Backend)" : "Realtime Activity Simulation Feed"}</div>
                                    <div className="mt-1 text-[12px] text-[#9db1da]">
                                        {liveTelemetryFresh
                                            ? "Menampilkan event route + provider telemetry dari backend via snapshot dan Socket.io room dev-topology."
                                            : "13 skenario activity untuk demonstrasi jalur AI, fallback, storage, telemetry, dan presentasi mode."}
                                    </div>
                                </div>
                                <span className="ainet-badge">
                                    <Gauge size={14} /> Health {(systemStats.healthScore || 98.4).toFixed(1)}%
                                </span>
                            </div>

                            <div className="mt-3 space-y-2 ainet-scroll max-h-[360px] overflow-auto pr-1">
                                {eventLog.map((event, idx) => (
                                    <div key={event.id} className={`ainet-event-row ${idx === 0 ? "active" : ""}`}>
                                        <span
                                            className="mt-1 inline-flex h-2.5 w-2.5 rounded-full"
                                            style={{ background: event.severity === "attention" ? "#f59e0b" : "#66f7d2", boxShadow: `0 0 10px ${event.severity === "attention" ? "rgba(245,158,11,.45)" : "rgba(102,247,210,.45)"}` }}
                                        />
                                        <div>
                                            <div className="ainet-event-row-title">{event.title}</div>
                                            <div className="ainet-event-row-sub">{event.summary}</div>
                                            <div className="mt-1 text-[10px] tracking-[0.08em] text-[#8ba0ce] uppercase">
                                                {new Date(event.at).toLocaleTimeString("id-ID", { hour12: false })} • {event.source} • latency {event.latencyMs}ms • {event.throughputRpm} rpm
                                            </div>
                                        </div>
                                        <span className="ainet-event-pill">{event.severity}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-2">
                                <div className="ainet-config-item">
                                    <div className="ainet-config-key">Scenario Engine</div>
                                    <div className="ainet-config-val">{liveTelemetryFresh ? (isPaused ? "Paused (live updates held)" : "Backend live (simulator standby)") : (isPaused ? "Paused" : "Auto cycling 3.2s-5.2s")}</div>
                                </div>
                                <div className="ainet-config-item">
                                    <div className="ainet-config-key">MongoDB Packet FX</div>
                                    <div className="ainet-config-val">{mongoBoost ? "Boosted (change-stream active)" : "Idle drift"}</div>
                                </div>
                                <div className="ainet-config-item">
                                    <div className="ainet-config-key">Active Scenario Nodes</div>
                                    <div className="ainet-config-val">{activeNodeCount}</div>
                                </div>
                                <div className="ainet-config-item">
                                    <div className="ainet-config-key">Active Scenario Wires</div>
                                    <div className="ainet-config-val">{activeEdgeIds.length}</div>
                                </div>
                            </div>
                        </TiltCard>
                    </div>
                </div>
            </div>
        </AnimatedPage>
    );
}

function ClockIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
        </svg>
    );
}

export default AINetworkTopologyPage;
