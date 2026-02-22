const normalizeText = (value = '') => String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
const toTrimmedText = (value = '') => String(value || '').trim();

export const normalizeRoleName = (role = '') => String(role || '').trim().toLowerCase();

const EXECUTE_AUTOMATION_ROLES = new Set([
    'teacher',
    'se_teacher',
    'head_unit',
    'principal',
    'directorate',
    'admin',
    'superadmin'
]);

const OPERATION_CONFIG = {
    create_mtss_intervention: {
        label: 'Create MTSS Intervention',
        description: 'Create a structured MTSS intervention plan for one student.',
        regex: /(create|buat|bikin|add|new)\s+.*(intervention|intervensi|mtss)/i
    },
    append_mtss_progress_checkin: {
        label: 'Log Progress Check-in',
        description: 'Log objective progress evidence for an MTSS assignment.',
        regex: /(log|append|update|isi|catat|submit).*(progress|check[\s-]?in|perkembangan|progres)/i
    },
    assign_students_to_mtss_mentor: {
        label: 'Assign Students to Mentor',
        description: 'Assign one or more students to a mentor scope.',
        regex: /(assign|tetapkan|hubungkan|link).*(student|siswa).*(mentor|mtss)/i
    },
    assign_intervention_mentor: {
        label: 'Assign Mentor by Subject',
        description: 'Assign mentor to an intervention focus/subject.',
        regex: /(assign|tetapkan|map).*(mentor).*(subject|focus|intervention|intervensi)/i
    },
    reassign_mtss_assignment_mentor: {
        label: 'Reassign Mentor',
        description: 'Reassign mentor ownership for an assignment.',
        regex: /(reassign|ganti).*(mentor)/i
    },
    update_mtss_assignment_status: {
        label: 'Update Assignment Status',
        description: 'Update assignment lifecycle status and optional notes.',
        regex: /(update|ubah|ganti).*(status).*(assignment|mtss|intervention|intervensi)/i
    },
    update_mtss_goal_completion: {
        label: 'Update Goal Completion',
        description: 'Mark goal completion state with summary.',
        regex: /(update|mark|tandai|ubah).*(goal).*(complete|selesai|completion)/i
    }
};

const OPERATION_ORDER = [
    'create_mtss_intervention',
    'append_mtss_progress_checkin',
    'assign_students_to_mtss_mentor',
    'assign_intervention_mentor',
    'reassign_mtss_assignment_mentor',
    'update_mtss_assignment_status',
    'update_mtss_goal_completion'
];

const OPERATION_FORM_FIELDS = {
    create_mtss_intervention: [
        { key: 'studentId', label: 'Student ID', type: 'text', required: true, placeholder: 'student id' },
        { key: 'strategy', label: 'Strategy', type: 'text', required: true, placeholder: 'Emotion Menu / strategy name' },
        { key: 'goal', label: 'Goal', type: 'textarea', required: true, placeholder: 'measurable goal' },
        { key: 'tier', label: 'Tier', type: 'select', required: true, options: ['Tier 1', 'Tier 2', 'Tier 3'] },
        { key: 'focusArea', label: 'Focus Area', type: 'text', required: false, placeholder: 'SEL / Behavior / Math / English' },
        { key: 'durationWeeks', label: 'Duration (weeks)', type: 'number', required: false, placeholder: '6' },
        { key: 'mentorId', label: 'Mentor ID', type: 'text', required: false, placeholder: 'mentor id (optional)' }
    ],
    append_mtss_progress_checkin: [
        { key: 'assignmentId', label: 'Assignment ID', type: 'text', required: true, placeholder: 'assignment id' },
        { key: 'summary', label: 'Progress Summary', type: 'textarea', required: true, placeholder: 'objective progress update' },
        { key: 'score', label: 'Score / Value', type: 'number', required: false, placeholder: '78' },
        { key: 'interventionPerformed', label: 'Intervention Performed', type: 'select', required: true, options: ['yes', 'no'] },
        { key: 'notes', label: 'Notes', type: 'textarea', required: false, placeholder: 'optional notes' }
    ],
    assign_students_to_mtss_mentor: [
        { key: 'mentorId', label: 'Mentor ID', type: 'text', required: true, placeholder: 'mentor id' },
        { key: 'studentIdsCsv', label: 'Student IDs', type: 'textarea', required: true, placeholder: 'id1, id2, id3' }
    ],
    assign_intervention_mentor: [
        { key: 'assignmentId', label: 'Assignment ID', type: 'text', required: true, placeholder: 'assignment id' },
        { key: 'mentorId', label: 'Mentor ID', type: 'text', required: true, placeholder: 'mentor id' },
        { key: 'subject', label: 'Subject / Focus', type: 'text', required: false, placeholder: 'SEL / Behavior / Math' }
    ],
    reassign_mtss_assignment_mentor: [
        { key: 'assignmentId', label: 'Assignment ID', type: 'text', required: true, placeholder: 'assignment id' },
        { key: 'mentorId', label: 'New Mentor ID', type: 'text', required: true, placeholder: 'new mentor id' },
        { key: 'reason', label: 'Reason', type: 'textarea', required: false, placeholder: 'optional reason' }
    ],
    update_mtss_assignment_status: [
        { key: 'assignmentId', label: 'Assignment ID', type: 'text', required: true, placeholder: 'assignment id' },
        { key: 'status', label: 'Status', type: 'select', required: true, options: ['active', 'paused', 'completed', 'closed'] },
        { key: 'summary', label: 'Summary', type: 'textarea', required: false, placeholder: 'short summary' },
        { key: 'notes', label: 'Notes', type: 'textarea', required: false, placeholder: 'optional notes' }
    ],
    update_mtss_goal_completion: [
        { key: 'assignmentId', label: 'Assignment ID', type: 'text', required: true, placeholder: 'assignment id' },
        { key: 'goalIndex', label: 'Goal Index', type: 'number', required: false, placeholder: '0 (optional)' },
        { key: 'goalText', label: 'Goal Text', type: 'textarea', required: false, placeholder: 'required if goal index is empty' },
        { key: 'completed', label: 'Completed', type: 'select', required: true, options: ['yes', 'no'] },
        { key: 'summary', label: 'Summary', type: 'textarea', required: false, placeholder: 'optional summary' }
    ]
};

const DEFAULT_VALUES = {
    tier: 'Tier 2',
    interventionPerformed: 'yes',
    status: 'active',
    completed: 'yes'
};

const toCsvList = (rawValue = '') =>
    String(rawValue || '')
        .split(/[,;\n]/g)
        .map((item) => item.trim())
        .filter(Boolean);

const toBoolean = (rawValue = '', fallback = false) => {
    const value = String(rawValue || '').trim().toLowerCase();
    if (!value) return fallback;
    if (['yes', 'y', 'true', '1'].includes(value)) return true;
    if (['no', 'n', 'false', '0'].includes(value)) return false;
    return fallback;
};

const toNumberIfPossible = (rawValue = '') => {
    const parsed = Number(String(rawValue || '').trim());
    return Number.isFinite(parsed) ? parsed : null;
};

const getSeedValue = (seedPayload = {}, keys = [], fallback = '') => {
    for (const key of keys) {
        const value = seedPayload?.[key];
        if (value === null || value === undefined) continue;
        if (typeof value === 'string' && !value.trim()) continue;
        if (Array.isArray(value) && value.length === 0) continue;
        return value;
    }
    return fallback;
};

const buildInitialFormValues = (operation = '', seedPayload = {}) => {
    const base = {};

    if (operation === 'create_mtss_intervention') {
        base.studentId = getSeedValue(seedPayload, ['studentId', 'targetStudentId'], '');
        base.strategy = getSeedValue(seedPayload, ['strategy', 'interventionStrategy'], '');
        base.goal = getSeedValue(seedPayload, ['goal'], '');
        base.tier = getSeedValue(seedPayload, ['tier'], DEFAULT_VALUES.tier);
        base.focusArea = getSeedValue(seedPayload, ['focusArea', 'subject'], '');
        base.durationWeeks = getSeedValue(seedPayload, ['durationWeeks', 'duration'], '');
        base.mentorId = getSeedValue(seedPayload, ['mentorId'], '');
    } else if (operation === 'append_mtss_progress_checkin') {
        base.assignmentId = getSeedValue(seedPayload, ['assignmentId'], '');
        base.summary = getSeedValue(seedPayload, ['summary'], '');
        base.score = getSeedValue(seedPayload, ['score', 'value'], '');
        base.interventionPerformed = getSeedValue(seedPayload, ['interventionPerformed'], DEFAULT_VALUES.interventionPerformed);
        base.notes = getSeedValue(seedPayload, ['notes'], '');
    } else if (operation === 'assign_students_to_mtss_mentor') {
        base.mentorId = getSeedValue(seedPayload, ['mentorId'], '');
        const studentIds = getSeedValue(seedPayload, ['studentIds'], []);
        base.studentIdsCsv = Array.isArray(studentIds) ? studentIds.join(', ') : String(studentIds || '');
    } else if (operation === 'assign_intervention_mentor') {
        base.assignmentId = getSeedValue(seedPayload, ['assignmentId'], '');
        base.mentorId = getSeedValue(seedPayload, ['mentorId'], '');
        base.subject = getSeedValue(seedPayload, ['subject', 'focusArea'], '');
    } else if (operation === 'reassign_mtss_assignment_mentor') {
        base.assignmentId = getSeedValue(seedPayload, ['assignmentId'], '');
        base.mentorId = getSeedValue(seedPayload, ['mentorId'], '');
        base.reason = getSeedValue(seedPayload, ['reason', 'notes'], '');
    } else if (operation === 'update_mtss_assignment_status') {
        base.assignmentId = getSeedValue(seedPayload, ['assignmentId'], '');
        base.status = getSeedValue(seedPayload, ['status'], DEFAULT_VALUES.status);
        base.summary = getSeedValue(seedPayload, ['summary'], '');
        base.notes = getSeedValue(seedPayload, ['notes'], '');
    } else if (operation === 'update_mtss_goal_completion') {
        base.assignmentId = getSeedValue(seedPayload, ['assignmentId'], '');
        base.goalIndex = getSeedValue(seedPayload, ['goalIndex'], '');
        base.goalText = getSeedValue(seedPayload, ['goalText', 'goal'], '');
        base.completed = getSeedValue(seedPayload, ['completed'], DEFAULT_VALUES.completed);
        base.summary = getSeedValue(seedPayload, ['summary'], '');
    }

    return base;
};

const validateRequiredText = (value = '', label = 'Field') => {
    const text = toTrimmedText(value);
    if (!text) return { error: `${label} is required.` };
    return { value: text };
};

const validateOperationPayload = (operation = '', formValues = {}, seedPayload = {}) => {
    const payload = { ...(seedPayload || {}) };

    if (operation === 'create_mtss_intervention') {
        const studentId = validateRequiredText(formValues.studentId, 'Student ID');
        if (studentId.error) return { error: studentId.error };
        const strategy = validateRequiredText(formValues.strategy, 'Strategy');
        if (strategy.error) return { error: strategy.error };
        const goal = validateRequiredText(formValues.goal, 'Goal');
        if (goal.error) return { error: goal.error };

        payload.studentId = studentId.value;
        payload.strategy = strategy.value;
        payload.goal = goal.value;
        payload.tier = toTrimmedText(formValues.tier) || 'Tier 2';

        const focusArea = toTrimmedText(formValues.focusArea);
        if (focusArea) payload.focusArea = focusArea;
        const durationWeeks = toNumberIfPossible(formValues.durationWeeks);
        if (durationWeeks !== null) payload.durationWeeks = durationWeeks;
        const mentorId = toTrimmedText(formValues.mentorId);
        if (mentorId) payload.mentorId = mentorId;
        return { payload };
    }

    if (operation === 'append_mtss_progress_checkin') {
        const assignmentId = validateRequiredText(formValues.assignmentId, 'Assignment ID');
        if (assignmentId.error) return { error: assignmentId.error };
        const summary = validateRequiredText(formValues.summary, 'Progress Summary');
        if (summary.error) return { error: summary.error };

        payload.assignmentId = assignmentId.value;
        payload.summary = summary.value;
        payload.interventionPerformed = toBoolean(formValues.interventionPerformed, true);

        const score = toNumberIfPossible(formValues.score);
        if (score !== null) payload.score = score;
        const notes = toTrimmedText(formValues.notes);
        if (notes) payload.notes = notes;
        return { payload };
    }

    if (operation === 'assign_students_to_mtss_mentor') {
        const mentorId = validateRequiredText(formValues.mentorId, 'Mentor ID');
        if (mentorId.error) return { error: mentorId.error };
        const studentIds = toCsvList(formValues.studentIdsCsv);
        if (studentIds.length === 0) return { error: 'At least one Student ID is required.' };

        payload.mentorId = mentorId.value;
        payload.studentIds = studentIds;
        return { payload };
    }

    if (operation === 'assign_intervention_mentor') {
        const assignmentId = validateRequiredText(formValues.assignmentId, 'Assignment ID');
        if (assignmentId.error) return { error: assignmentId.error };
        const mentorId = validateRequiredText(formValues.mentorId, 'Mentor ID');
        if (mentorId.error) return { error: mentorId.error };

        payload.assignmentId = assignmentId.value;
        payload.mentorId = mentorId.value;
        const subject = toTrimmedText(formValues.subject);
        if (subject) payload.subject = subject;
        return { payload };
    }

    if (operation === 'reassign_mtss_assignment_mentor') {
        const assignmentId = validateRequiredText(formValues.assignmentId, 'Assignment ID');
        if (assignmentId.error) return { error: assignmentId.error };
        const mentorId = validateRequiredText(formValues.mentorId, 'New Mentor ID');
        if (mentorId.error) return { error: mentorId.error };

        payload.assignmentId = assignmentId.value;
        payload.mentorId = mentorId.value;
        const reason = toTrimmedText(formValues.reason);
        if (reason) payload.reason = reason;
        return { payload };
    }

    if (operation === 'update_mtss_assignment_status') {
        const assignmentId = validateRequiredText(formValues.assignmentId, 'Assignment ID');
        if (assignmentId.error) return { error: assignmentId.error };
        const status = validateRequiredText(formValues.status, 'Status');
        if (status.error) return { error: status.error };

        payload.assignmentId = assignmentId.value;
        payload.status = status.value.toLowerCase();
        const summary = toTrimmedText(formValues.summary);
        if (summary) payload.summary = summary;
        const notes = toTrimmedText(formValues.notes);
        if (notes) payload.notes = notes;
        return { payload };
    }

    if (operation === 'update_mtss_goal_completion') {
        const assignmentId = validateRequiredText(formValues.assignmentId, 'Assignment ID');
        if (assignmentId.error) return { error: assignmentId.error };
        payload.assignmentId = assignmentId.value;

        const goalIndex = toNumberIfPossible(formValues.goalIndex);
        if (goalIndex !== null && Number.isInteger(goalIndex) && goalIndex >= 0) {
            payload.goalIndex = goalIndex;
        } else {
            const goalText = validateRequiredText(formValues.goalText, 'Goal Text');
            if (goalText.error) return { error: 'Goal Text is required when Goal Index is empty.' };
            payload.goalText = goalText.value;
        }

        payload.completed = toBoolean(formValues.completed, true);
        const summary = toTrimmedText(formValues.summary);
        if (summary) payload.summary = summary;
        return { payload };
    }

    return { error: `Unsupported operation "${operation}".` };
};

export const canExecuteAutomationRole = (role = '') => EXECUTE_AUTOMATION_ROLES.has(normalizeRoleName(role));

export const isOperationAllowedForRole = (role = '', operation = '') => {
    if (!canExecuteAutomationRole(role)) return false;
    return Boolean(OPERATION_CONFIG[String(operation || '').trim().toLowerCase()]);
};

export const getOperationLabel = (operation = '') =>
    OPERATION_CONFIG[String(operation || '').trim().toLowerCase()]?.label
    || String(operation || '').trim().replace(/_/g, ' ');

export const getDockOperationFormConfig = (operation = '', seedPayload = {}) => {
    const key = String(operation || '').trim().toLowerCase();
    const config = OPERATION_CONFIG[key];
    const fields = OPERATION_FORM_FIELDS[key];
    if (!config || !Array.isArray(fields)) return null;

    return {
        operation: key,
        label: config.label,
        description: config.description,
        fields: fields.map((field = {}) => ({
            key: String(field.key || ''),
            label: String(field.label || field.key || ''),
            type: String(field.type || 'text'),
            required: Boolean(field.required),
            placeholder: String(field.placeholder || ''),
            options: Array.isArray(field.options) ? field.options.slice(0, 8) : []
        })),
        initialValues: buildInitialFormValues(key, seedPayload)
    };
};

export const buildOperationPayloadFromForm = (operation = '', formValues = {}, seedPayload = {}) => {
    const key = String(operation || '').trim().toLowerCase();
    const result = validateOperationPayload(key, formValues || {}, seedPayload || {});
    if (result?.error) return { payload: null, error: String(result.error) };
    return { payload: result.payload || {}, error: '' };
};

export const detectDockOperationIntent = (message = '', { role = '', routeFamily = 'general' } = {}) => {
    if (!canExecuteAutomationRole(role)) return null;
    if (!['mtss', 'support_hub', 'emotional_dashboard', 'general'].includes(String(routeFamily || 'general'))) {
        return null;
    }

    const text = normalizeText(message);
    if (!text) return null;
    const hasActionCue = /(create|buat|bikin|assign|tetapkan|update|ubah|log|catat|submit|mark|ganti|reassign)/i.test(text);
    const hasMtssCue = /(mtss|intervention|intervensi|mentor|assignment|goal|check[\s-]?in|progress|progres)/i.test(text);
    if (!hasActionCue || !hasMtssCue) return null;

    for (const operation of OPERATION_ORDER) {
        const config = OPERATION_CONFIG[operation];
        if (config?.regex?.test(message)) {
            return {
                type: 'execute_operation',
                operation,
                payload: {},
                requireConfirmation: true,
                confirmText: `Run "${config.label}" now?`
            };
        }
    }

    return null;
};

export default {
    normalizeRoleName,
    canExecuteAutomationRole,
    isOperationAllowedForRole,
    getOperationLabel,
    getDockOperationFormConfig,
    buildOperationPayloadFromForm,
    detectDockOperationIntent
};
