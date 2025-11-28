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

    const selectedStudents = useMemo(
        () => students.filter((student) => selectedIds.includes(student.id || student._id)),
        [students, selectedIds],
    );

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!mentor?._id || selectedIds.length < 2) return;
        setSubmitting(true);
        try {
            const focusAreas = focusInput
                ? focusInput.split(",").map((item) => item.trim()).filter(Boolean)
                : [];
            await createMentorAssignment({
                mentorId: mentor._id,
                studentIds: selectedIds,
                tier,
                focusAreas,
                notes: notes?.trim() || "",
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
            <DialogContent className="max-w-3xl border-none bg-transparent p-0">
                <div className="rounded-[32px] glass glass-card overflow-hidden">
                    <DialogHeader className="bg-gradient-to-r from-[#f472b6] via-[#a855f7] to-[#6366f1] px-6 py-5 text-white">
                        <DialogTitle className="text-2xl font-black tracking-tight">Assign students</DialogTitle>
                        <DialogDescription className="text-white/80">
                            Pair <strong>{mentor?.name}</strong> with collaborative Tier 2/3 groups. At least two students are required.
                        </DialogDescription>
                        <div className="mt-3 flex flex-wrap gap-3 text-sm font-semibold">
                            <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur text-white">{mentor?.jobPosition || mentor?.role || "Teacher"}</span>
                            <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur text-white">{selectedIds.length} selected</span>
                        </div>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            <label className="space-y-2 text-sm font-semibold text-foreground dark:text-white">
                                <span className="flex items-center justify-between uppercase tracking-[0.3em] text-[11px] text-muted-foreground">
                                    Tier <span className="text-[10px] text-white/70 bg-primary/70 px-2 py-0.5 rounded-full">Required</span>
                                </span>
                                <select
                                    value={tier}
                                    onChange={(event) => setTier(event.target.value)}
                                    className="w-full rounded-2xl border border-border/50 bg-white/90 dark:bg-white/10 px-4 py-3 focus:ring-2 focus:ring-primary/40"
                                >
                                    {tierOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label className="space-y-2 text-sm font-semibold text-foreground dark:text-white">
                                <span className="flex items-center justify-between uppercase tracking-[0.3em] text-[11px] text-muted-foreground">
                                    Focus areas <span className="text-[10px] text-muted-foreground px-2 py-0.5 rounded-full border border-border/40">Optional</span>
                                </span>
                                <input
                                    value={focusInput}
                                    onChange={(event) => setFocusInput(event.target.value)}
                                    placeholder="Fluency boost, SEL routines"
                                    className="w-full rounded-2xl border border-border/50 bg-white/90 dark:bg-white/10 px-4 py-3 focus:ring-2 focus:ring-primary/40"
                                />
                            </label>
                        </div>

                        <label className="space-y-2 text-sm font-semibold text-foreground dark:text-white">
                            <span className="flex items-center justify-between uppercase tracking-[0.3em] text-[11px] text-muted-foreground">
                                Notes <span className="text-[10px] text-muted-foreground px-2 py-0.5 rounded-full border border-border/40">Optional</span>
                            </span>
                            <textarea
                                value={notes}
                                onChange={(event) => setNotes(event.target.value)}
                                placeholder="Add optional context or next steps for this mentor..."
                                className="w-full h-24 rounded-2xl border border-border/50 bg-white/90 dark:bg-white/10 px-4 py-3 resize-none focus:ring-2 focus:ring-primary/40"
                            />
                        </label>

                        {selectedStudents.length > 0 && (
                            <div className="rounded-[24px] bg-gradient-to-r from-[#e0f2fe]/80 to-[#fef9c3]/70 dark:from-white/5 dark:to-white/5 border border-white/40 dark:border-white/5 p-4 flex flex-wrap gap-2 text-sm" data-aos="fade-up" data-aos-delay="250">
                                {selectedStudents.slice(0, 6).map((student) => (
                                    <span key={student.id || student._id} className="px-3 py-1 rounded-full bg-white/70 dark:bg-white/10 border border-white/60 dark:border-white/20 text-foreground dark:text-white">
                                        {student.name}
                                    </span>
                                ))}
                                {selectedStudents.length > 6 && (
                                    <span className="px-3 py-1 rounded-full bg-white/60 dark:bg-white/10 border border-white/40 dark:border-white/20 text-muted-foreground">
                                        +{selectedStudents.length - 6} more
                                    </span>
                                )}
                            </div>
                        )}

                        <div className="space-y-3">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-foreground dark:text-white">Choose at least two students for this mentor</p>
                                    <p className="text-xs text-muted-foreground">Use the search to quickly filter by name or focus type.</p>
                                </div>
                                <div className="relative w-full sm:w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(event) => setSearch(event.target.value)}
                                        placeholder="Search students..."
                                        className="w-full pl-10 pr-4 py-2.5 rounded-full border border-border/60 bg-white/90 dark:bg-white/10 text-sm focus:ring-2 focus:ring-primary/40"
                                    />
                                </div>
                            </div>
                            <div className="max-h-64 overflow-y-auto rounded-2xl border border-border/50 bg-white/90 dark:bg-white/10 p-4 space-y-2 custom-scroll" data-aos="fade-up" data-aos-delay="300">
                                {filteredStudents.map((student) => {
                                    const id = student.id || student._id;
                                    return (
                                        <label key={id} className="flex items-center gap-3 text-sm text-foreground dark:text-white">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(id)}
                                                onChange={() => toggleSelection(id)}
                                                className="rounded border-border/60 accent-primary"
                                            />
                                            <div className="flex flex-col">
                                                <span className="font-semibold">{student.name}</span>
                                                <span className="text-muted-foreground text-xs">
                                                    {student.grade} · {student.type}
                                                </span>
                                            </div>
                                        </label>
                                    );
                                })}
                                {!filteredStudents.length && <p className="text-sm text-muted-foreground">No students match the search.</p>}
                            </div>
                        </div>

                        <DialogFooter className="pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 rounded-full border border-border/60 text-sm font-semibold text-foreground dark:text-white bg-white/70 dark:bg-white/5 hover:shadow"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting || selectedIds.length < 2}
                                className={`px-5 py-2.5 rounded-full text-sm font-semibold text-white ${
                                    submitting || selectedIds.length < 2
                                        ? "bg-muted cursor-not-allowed opacity-60"
                                        : "bg-gradient-to-r from-[#22d3ee] via-[#3b82f6] to-[#a855f7] shadow-xl hover:-translate-y-0.5 transition"
                                }`}
                            >
                                {submitting ? "Assigning…" : "Assign Selected"}
                            </button>
                        </DialogFooter>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
};

AdminMentorAssignModal.displayName = "AdminMentorAssignModal";
export default AdminMentorAssignModal;
