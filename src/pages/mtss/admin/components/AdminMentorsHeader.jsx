import { Sparkles } from "lucide-react";

const AdminMentorsHeader = () => (
    <div
        className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8"
        data-aos="fade-up"
        data-aos-delay="150"
    >
        <div className="space-y-3">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r from-[#e0f2fe] via-[#fef3c7] to-[#fbcfe8] text-sm font-semibold text-slate-700 dark:text-white shadow-inner">
                <Sparkles className="w-4 h-4 text-rose-500" />
                Mentor Squad
            </div>
            <div className="rounded-[28px] bg-gradient-to-r from-white/95 via-white/70 to-white/40 dark:from-white/10 dark:via-white/5 dark:to-white/5 p-5 border border-white/60 dark:border-white/10 shadow-inner backdrop-blur-xl space-y-2">
                <h3 className="text-3xl font-black text-foreground dark:text-white bg-gradient-to-r from-[#14b8a6] via-[#3b82f6] to-[#a855f7] text-transparent bg-clip-text">
                    Manage Mentors
                </h3>
                <div className="rounded-2xl bg-gradient-to-r from-[#fee2e2]/80 via-[#fef9c3]/80 to-[#cffafe]/80 dark:from-white/10 dark:via-white/5 dark:to-white/5 px-4 py-2 text-xs font-semibold text-rose-500 flex items-center gap-2 shadow-sm">
                    <Sparkles className="w-4 h-4" />
                    Tap "Assign students" to pair mentors with multiple kids instantly.
                </div>
            </div>
        </div>
        <button className="px-5 py-3 rounded-full bg-gradient-to-r from-[#fde68a] via-[#fca5a5] to-[#f472b6] text-sm font-semibold text-rose-700 shadow-lg hover:-translate-y-0.5 transition border border-white/70">
            Add Mentor
        </button>
    </div>
);

export default AdminMentorsHeader;
