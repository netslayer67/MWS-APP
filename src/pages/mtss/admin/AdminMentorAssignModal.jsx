import React, { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { createMentorAssignment } from "@/services/mtssService";
import { useToast } from "@/components/ui/use-toast";
import { Search } from "lucide-react";

const tierOptions = [
    { label: "Tier 2 - Targeted", value: "tier2" },
    { label: "Tier 3 - Intensive", value: "tier3" },
];

const AdminMentorAssignModal = ({ open, onClose, mentor, students = [], onAssigned }) => {
    const { toast } = useToast();
    const [tier, setTier] = useState("tier2");
    const [search, setSearch] = useState("");
    const [selectedIds, setSelectedIds] = useState([]);
    const [focusInput, setFocusInput] = useState("");
    const [notes, setNotes] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!open) {
            setSelectedIds([]);
            setFocusInput("");
            setNotes("");
            setSearch("");
            setTier("tier2");
        }
    }, [open]);

    const filteredStudents = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return students;
        return students.filter((student) => student.name?.toLowerCase().includes(query));
    }, [students, search]);

    const toggleSelection = (id) => {
        setSelectedIds((prev) => (prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id]));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!mentor?._id || selectedIds.length < 2) return;
        setSubmitting(true);
        try {
            const focusAreas = focusInput
                ? focusInput.split(",").map((item) => item.trim()).filter(Boolean)
                : ["Targeted Support"];
            await createMentorAssignment({
                mentorId: mentor._id,
                studentIds: selectedIds,
                tier,
                focusAreas,
                notes,
            });
            toast({
                title: "Assignment created",
                description: `Paired ${mentor.name} with ${selectedIds.length} students.`,
            });
            onAssigned?.();
        } catch (error) {
            toast({
                title: "Failed to assign",
                description: error?.response?.data?.message || error.message || "Unable to create assignment",
                variant: "destructive",
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(value) => !value && onClose?.()}>
            <DialogContent className="max-w-3xl space-y-6">
                <DialogHeader>
                    <DialogTitle>Assign students to {mentor?.name}</DialogTitle>
                    <DialogDescription>Select at least two students to create a new MTSS plan.</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                        <label className="space-y-2 text-sm font-semibold text-foreground dark:text-white">
                            <span>Tier</span>
                            <select
                                value={tier}
                                onChange={(event) => setTier(event.target.value)}
                                className="w-full rounded-2xl border border-border/60 bg-white/80 dark:bg-white/10 px-4 py-3"
                            >
                                {tierOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label className="space-y-2 text-sm font-semibold text-foreground dark:text-white">
                            <span>Focus areas</span>
                            <input
                                value={focusInput}
                                onChange={(event) => setFocusInput(event.target.value)}
                                placeholder="Fluency boost, SEL routines"
                                className="w-full rounded-2xl border border-border/60 bg-white/80 dark:bg-white/10 px-4 py-3"
                            />
                        </label>
                    </div>

                    <label className="space-y-2 text-sm font-semibold text-foreground dark:text-white">
                        <span>Notes</span>
                        <textarea
                            value={notes}
                            onChange={(event) => setNotes(event.target.value)}
                            placeholder="Add optional context for the mentor…"
                            className="w-full h-24 rounded-2xl border border-border/60 bg-white/80 dark:bg-white/10 px-4 py-3 resize-none"
                        />
                    </label>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-foreground dark:text-white">
                                {selectedIds.length} students selected
                            </p>
                            <div className="relative w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder="Search students…"
                                    className="w-full pl-10 pr-4 py-2.5 rounded-full border border-border/60 bg-white/80 dark:bg-white/10 text-sm"
                                />
                            </div>
                        </div>
                        <div className="max-h-64 overflow-y-auto rounded-2xl border border-border/50 bg-white/70 dark:bg-white/10 p-4 space-y-2">
                            {filteredStudents.map((student) => {
                                const id = student.id || student._id;
                                return (
                                    <label key={id} className="flex items-center gap-3 text-sm text-foreground dark:text-white">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(id)}
                                            onChange={() => toggleSelection(id)}
                                            className="rounded border-border/60"
                                        />
                                        <span className="font-semibold">{student.name}</span>
                                        <span className="text-muted-foreground text-xs">
                                            {student.grade} · {student.type}
                                        </span>
                                    </label>
                                );
                            })}
                            {!filteredStudents.length && <p className="text-sm text-muted-foreground">No students match the search.</p>}
                        </div>
                    </div>

                    <DialogFooter>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-full border border-border/60 text-sm font-semibold text-foreground dark:text-white"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || selectedIds.length < 2}
                            className={`px-5 py-2.5 rounded-full text-sm font-semibold text-white ${
                                submitting || selectedIds.length < 2
                                    ? "bg-muted cursor-not-allowed opacity-60"
                                    : "bg-gradient-to-r from-[#22d3ee] to-[#3b82f6] shadow hover:-translate-y-0.5 transition"
                            }`}
                        >
                            {submitting ? "Assigning…" : "Assign Selected"}
                        </button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

AdminMentorAssignModal.displayName = "AdminMentorAssignModal";
export default AdminMentorAssignModal;
