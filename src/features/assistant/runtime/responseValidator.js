const MAX_WIDGETS = 8;
const ALLOWED_EXECUTE_OPERATIONS = new Set([
    'create_mtss_intervention',
    'append_mtss_progress_checkin'
]);

const ALLOWED_TYPES = new Set([
    'stats',
    'bar_chart',
    'table',
    'timeline',
    'checklist',
    'capabilities',
    'action_chips',
    'skill_cards'
]);

const ALLOWED_ROUTES = new Set([
    '/student/support-hub',
    '/student/emotional-checkin',
    '/student/emotional-checkin/manual',
    '/student/emotional-checkin/ai',
    '/student/emotional-checkin/face-scan',
    '/student/ai-chat',
    '/support-hub',
    '/emotional-checkin',
    '/emotional-checkin/staff',
    '/emotional-checkin/dashboard',
    '/emotional-checkin/teacher-dashboard',
    '/profile',
    '/profile/personal-stats',
    '/profile/emotional-history',
    '/profile/emotional-patterns',
    '/mtss',
    '/mtss/student-portal',
    '/mtss/teacher',
    '/mtss/admin',
    '/select-role',
    '/user-management',
    '/ai-assistant'
]);

const toText = (value, max = 220) => String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);

const toList = (value) => (Array.isArray(value) ? value : []);

const normalizeOperationPayload = (payload = {}, depth = 0) => {
    if (depth > 3) return undefined;
    if (Array.isArray(payload)) {
        return payload.slice(0, 12).map((entry) => normalizeOperationPayload(entry, depth + 1));
    }
    if (payload && typeof payload === 'object') {
        const normalized = {};
        Object.entries(payload).slice(0, 20).forEach(([key, value]) => {
            const safeKey = toText(key, 40);
            if (!safeKey) return;
            normalized[safeKey] = normalizeOperationPayload(value, depth + 1);
        });
        return normalized;
    }
    if (typeof payload === 'number' || typeof payload === 'boolean') return payload;
    return toText(payload, 240);
};

const normalizeAction = (action = {}) => {
    const type = toText(action.type, 20).toLowerCase();
    if (type === 'navigate') {
        const navigateTo = toText(action.navigateTo, 120);
        if (!ALLOWED_ROUTES.has(navigateTo)) return null;
        return {
            type: 'navigate',
            intent: toText(action.intent || 'assistant_navigation', 80),
            navigateTo,
            label: toText(action.label || 'Open page', 80),
            autoNavigate: true,
            confidence: Number(action.confidence || 0.9)
        };
    }

    if (type === 'prefill') {
        const value = toText(action.value || action.message, 240);
        if (!value) return null;
        return {
            type: 'prefill',
            value
        };
    }

    if (type === 'execute_operation') {
        const operation = toText(action.operation, 80).toLowerCase();
        if (!ALLOWED_EXECUTE_OPERATIONS.has(operation)) return null;
        return {
            type: 'execute_operation',
            operation,
            payload: normalizeOperationPayload(action.payload || {}),
            requireConfirmation: action.requireConfirmation !== false,
            confirmText: toText(action.confirmText || 'Run this automation now?', 180),
            successMessage: toText(action.successMessage || '', 160),
            failureMessage: toText(action.failureMessage || '', 160)
        };
    }

    return null;
};

const normalizeActionWidget = (widget = {}) => ({
    ...widget,
    actions: toList(widget.actions)
        .slice(0, 10)
        .map((entry = {}) => {
            const action = normalizeAction(entry.action || {});
            if (!action) return null;
            return {
                label: toText(entry.label || 'Action', 90),
                action
            };
        })
        .filter(Boolean)
});

const normalizeSkillCardsWidget = (widget = {}) => ({
    ...widget,
    cards: toList(widget.cards)
        .slice(0, 6)
        .map((card = {}) => ({
            id: toText(card.id || card.title || 'skill-card', 90),
            icon: toText(card.icon || '🧩', 6),
            title: toText(card.title || 'Skill', 90),
            description: toText(card.description, 220),
            action: normalizeAction(card.action || {})
        }))
        .filter((card) => card.title)
});

const normalizeByType = (widget = {}) => {
    const type = toText(widget.type, 40).toLowerCase();
    if (!ALLOWED_TYPES.has(type)) return null;

    const base = {
        ...widget,
        id: toText(widget.id || `${type}-widget`, 90),
        type,
        title: toText(widget.title || '', 120),
        subtitle: toText(widget.subtitle || '', 180)
    };

    if (type === 'action_chips') return normalizeActionWidget(base);
    if (type === 'skill_cards') return normalizeSkillCardsWidget(base);
    return base;
};

export const normalizeAssistantWidgets = (widgets = []) => {
    const list = toList(widgets)
        .slice(0, MAX_WIDGETS)
        .map((widget) => normalizeByType(widget))
        .filter(Boolean);

    const deduped = [];
    const seen = new Set();

    list.forEach((widget, index) => {
        const key = String(widget.id || `${widget.type}-${index}`);
        if (seen.has(key)) return;
        seen.add(key);
        deduped.push(widget);
    });

    return deduped;
};

export const normalizeAssistantAction = normalizeAction;
