/**
 * Custom hook for MTSS intervention form management using Redux
 */
import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useToast } from '@/components/ui/use-toast';
import {
    fetchStudents,
    fetchMtssStrategies,
    createInterventionPlan,
    submitProgressUpdate,
    updateInterventionForm,
    resetInterventionForm,
    updateProgressForm,
    resetProgressForm,
    prefillInterventionFromStudent,
    selectStudents,
    selectStudentsLoading,
    selectStrategies,
    selectStrategiesLoading,
    selectInterventionForm,
    selectInterventionSubmitting,
    selectInterventionError,
    selectInterventionSuccess,
    selectProgressForm,
    selectProgressSubmitting,
    selectProgressError,
    selectProgressSuccess,
    selectAssignments,
    fetchAssignments,
    clearInterventionError,
    clearProgressError,
} from '@/store/slices/mtssSlice';
import { validateInterventionForm } from '../config/interventionFormConfig';

export const useMtssIntervention = () => {
    const dispatch = useDispatch();
    const { toast } = useToast();

    // Selectors
    const students = useSelector(selectStudents);
    const studentsLoading = useSelector(selectStudentsLoading);
    const strategies = useSelector(selectStrategies);
    const strategiesLoading = useSelector(selectStrategiesLoading);
    const assignments = useSelector(selectAssignments);

    // Intervention form state
    const interventionForm = useSelector(selectInterventionForm);
    const interventionSubmitting = useSelector(selectInterventionSubmitting);
    const interventionError = useSelector(selectInterventionError);
    const interventionSuccess = useSelector(selectInterventionSuccess);

    // Progress form state
    const progressForm = useSelector(selectProgressForm);
    const progressSubmitting = useSelector(selectProgressSubmitting);
    const progressError = useSelector(selectProgressError);
    const progressSuccess = useSelector(selectProgressSuccess);

    // Load students on mount
    useEffect(() => {
        if (!students.length && !studentsLoading) {
            dispatch(fetchStudents());
        }
    }, [dispatch, students.length, studentsLoading]);

    // Load strategies when intervention type changes
    useEffect(() => {
        const params = interventionForm.type ? { type: interventionForm.type } : {};
        dispatch(fetchMtssStrategies(params));
    }, [dispatch, interventionForm.type]);

    // Load assignments
    useEffect(() => {
        if (!assignments.length) {
            dispatch(fetchAssignments());
        }
    }, [dispatch, assignments.length]);

    // Show toast on intervention success
    useEffect(() => {
        if (interventionSuccess) {
            toast({
                title: 'Intervention plan saved',
                description: 'Student plan created successfully. Track their progress!',
            });
        }
    }, [interventionSuccess, toast]);

    // Show toast on intervention error
    useEffect(() => {
        if (interventionError) {
            toast({
                title: 'Failed to save plan',
                description: interventionError,
                variant: 'destructive',
            });
            dispatch(clearInterventionError());
        }
    }, [interventionError, toast, dispatch]);

    // Show toast on progress success
    useEffect(() => {
        if (progressSuccess) {
            toast({
                title: 'Progress submitted',
                description: 'Your monitoring update is live on the MTSS dashboard.',
            });
        }
    }, [progressSuccess, toast]);

    // Show toast on progress error
    useEffect(() => {
        if (progressError) {
            toast({
                title: 'Failed to submit progress',
                description: progressError,
                variant: 'destructive',
            });
            dispatch(clearProgressError());
        }
    }, [progressError, toast, dispatch]);

    // Handlers
    const handleInterventionChange = useCallback(
        (field, value) => {
            dispatch(updateInterventionForm({ field, value }));

            // Auto-fill strategy name when strategy is selected
            if (field === 'strategyId' && value) {
                const strategy = strategies.find((s) => s._id === value);
                if (strategy) {
                    dispatch(updateInterventionForm({ field: 'strategyName', value: strategy.name }));
                    // Optionally prefill goal with strategy overview
                    if (!interventionForm.goal && strategy.overview) {
                        dispatch(updateInterventionForm({ field: 'goal', value: strategy.overview }));
                    }
                }
            }
        },
        [dispatch, strategies, interventionForm.goal]
    );

    const handleProgressChange = useCallback(
        (field, value) => {
            dispatch(updateProgressForm({ field, value }));
        },
        [dispatch]
    );

    const handleStudentSelect = useCallback(
        (studentId) => {
            const student = students.find((s) => s.id === studentId || s._id === studentId);
            if (student) {
                dispatch(prefillInterventionFromStudent(student));
            }
        },
        [dispatch, students]
    );

    const handleSavePlan = useCallback(
        async (event) => {
            event?.preventDefault?.();
            if (interventionSubmitting) return;

            if (!validateInterventionForm(interventionForm)) {
                toast({
                    title: 'Complete the required fields',
                    description: 'Student, type, tier, start date, frequency, and method are required.',
                    variant: 'destructive',
                });
                return;
            }

            dispatch(createInterventionPlan(interventionForm));
        },
        [dispatch, interventionForm, interventionSubmitting, toast]
    );

    const handleSubmitProgress = useCallback(
        async (event) => {
            event?.preventDefault?.();
            if (progressSubmitting) return;

            if (!progressForm.assignmentId || !progressForm.summary) {
                toast({
                    title: 'Complete the required fields',
                    description: 'Please select a student and provide a progress summary.',
                    variant: 'destructive',
                });
                return;
            }

            dispatch(submitProgressUpdate(progressForm));
        },
        [dispatch, progressForm, progressSubmitting, toast]
    );

    const handleResetInterventionForm = useCallback(() => {
        dispatch(resetInterventionForm());
    }, [dispatch]);

    const handleResetProgressForm = useCallback(() => {
        dispatch(resetProgressForm());
    }, [dispatch]);

    const refreshStudents = useCallback(() => {
        dispatch(fetchStudents());
    }, [dispatch]);

    return {
        // Data
        students,
        studentsLoading,
        strategies,
        strategiesLoading,
        assignments,

        // Intervention form
        interventionForm,
        interventionSubmitting,
        interventionSuccess,
        handleInterventionChange,
        handleSavePlan,
        handleResetInterventionForm,
        handleStudentSelect,

        // Progress form
        progressForm,
        progressSubmitting,
        progressSuccess,
        handleProgressChange,
        handleSubmitProgress,
        handleResetProgressForm,

        // Utilities
        refreshStudents,
    };
};

export default useMtssIntervention;
