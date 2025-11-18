import React, { memo, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpenCheck, CalendarHeart, MessageCircleHeart, Sparkles, Star } from "lucide-react";

const playfulStudents = [
    {
        id: "marcus",
        name: "Student A",
        grade: "5th Grade • Tier 2",
        focus: "Reading Fluency",
        mentor: "Ms. Johnson",
        accent: "from-[#fda4af] via-[#f472b6] to-[#c084fc]",
        statAccent: "from-[#fcd34d] to-[#f97316]",
        data: {
            goal: "Improve reading fluency to 90 words per minute",
            progress: "79 wpm",
            status: "Reading speed (wpm)",
            nextSession: {
                label: "Tomorrow",
                detail: "Tuesday • Nov 5, 2025 • 2:00 PM — 3:00 PM",
                room: "Room 204 with Ms. Johnson",
            },
            chart: [
                { label: "Oct 15", value: 45 },
                { label: "Oct 22", value: 60 },
                { label: "Oct 29", value: 72 },
                { label: "Nov 5", value: 79 },
            ],
            updates: [
                { date: "Nov 1, 2025", note: "Marcus is showing more confidence when reading aloud. Keep up the sparkle!" },
                { date: "Oct 25, 2025", note: "Steady gains from mini fluency games and weekend practice." },
            ],
            schedule: {
                thisWeek: [
                    { day: "Tuesday, Nov 5 • 2:00 PM", title: "Reading Fluency Practice", room: "Room 204", note: "Paired reading + word games" },
                    { day: "Thursday, Nov 7 • 2:00 PM", title: "Coach Check-in", room: "Room 204", note: "Celebrate wins & set micro-goals" },
                ],
                nextWeek: [
                    { day: "Tuesday, Nov 12 • 2:00 PM", title: "Fluency Lab", room: "Room 204", note: "Reader's theater + expression focus" },
                    { day: "Thursday, Nov 14 • 2:00 PM", title: "Family Bridge Call", room: "Room 204", note: "Share strategies with parents" },
                ],
            },
            messages: [
                { from: "Ms. Johnson", date: "Nov 3, 2025", text: "Hi Marcus! Remember to bring your comic book for tomorrow's reading celebration." },
                { from: "You", date: "Nov 3, 2025", text: "Got it, Ms. J! I can't wait to share the funny parts." },
                { from: "Ms. Johnson", date: "Nov 1, 2025", text: "Amazing progress this week. Your expression and pacing are awesome!" },
            ],
        },
    },
    {
        id: "emily",
        name: "Student B",
        grade: "6th Grade • Tier 3",
        focus: "Math Problem Solving",
        mentor: "Mr. Brown",
        accent: "from-[#fef3c7] via-[#fcd34d] to-[#fb923c]",
        statAccent: "from-[#c7d2fe] to-[#a5b4fc]",
        data: {
            goal: "Reach 80% accuracy on multi-step problems",
            progress: "62% accuracy",
            status: "Problem-solving accuracy",
            nextSession: {
                label: "Next Session",
                detail: "Wednesday • Nov 6, 2025 • 11:00 AM — 11:40 AM",
                room: "Math Lab with Mr. Brown",
            },
            chart: [
                { label: "Sep 30", value: 48 },
                { label: "Oct 7", value: 55 },
                { label: "Oct 23", value: 58 },
                { label: "Nov 4", value: 62 },
            ],
            updates: [
                { date: "Nov 4, 2025", note: "Emily reasoned through every step. Verbalizing helped to keep track of each operation." },
                { date: "Oct 28, 2025", note: "Math lab manipulatives made fractions and ratios feel less scary—awesome teamwork!" },
            ],
            schedule: {
                thisWeek: [
                    { day: "Tuesday, Nov 5 • 10:30 AM", title: "Tier 3 Math Intervention", room: "Math Lab", note: "Multi-step word problems + math games" },
                    { day: "Thursday, Nov 7 • 10:30 AM", title: "Data Conference", room: "Math Lab", note: "Goal tracking + micro-lesson on ratios" },
                ],
                nextWeek: [
                    { day: "Tuesday, Nov 12 • 10:30 AM", title: "Tier 3 Math Intervention", room: "Math Lab", note: "Visual models + check-ins" },
                    { day: "Thursday, Nov 14 • 10:30 AM", title: "Math Specialist Support", room: "Math Lab with Mr. Perez", note: "Collaborative problem solving" },
                ],
            },
            messages: [
                { from: "Mr. Brown", date: "Nov 3, 2025", text: "Hey Emily! Can you bring your math journal tomorrow? We’ll glue in our strategy cards." },
                { from: "You", date: "Nov 3, 2025", text: "Yes! I’ve already decorated the cover!" },
                { from: "Mr. Brown", date: "Nov 1, 2025", text: "Great grit today. Keep practicing those micro-steps at home 💪" },
            ],
        },
    },
];

const StudentPortalPage = memo(() => {
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [activeTab, setActiveTab] = useState("progress");
    const navigate = useNavigate();

    const currentStudent = useMemo(() => playfulStudents.find((student) => student.id === selectedStudent) || playfulStudents[0], [selectedStudent]);

    const handleBack = () => {
        if (selectedStudent) {
            setSelectedStudent(null);
            setActiveTab("progress");
            return;
        }
        navigate("/mtss");
    };

    const renderSelectionView = () => (
        <div className="mtss-theme mtss-animated-bg min-h-screen relative overflow-hidden">
            <div className="mtss-bg-overlay" />
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-[#fde68a]/50 via-[#f9a8d4]/50 to-[#a5b4fc]/50" />
                <div className="absolute -top-20 left-6 w-72 h-72 bg-[#fcd34d]/30 blur-[120px]" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#a5b4fc]/20 blur-[160px]" />
            </div>

            <div className="relative z-10 container-tight py-14 text-foreground dark:text-white space-y-10">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
                    <p className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/80 dark:bg-white/10 text-xs font-black tracking-[0.6em] text-rose-500 shadow-lg">
                        👨‍🎓 Student/Parent
                    </p>
                    <h1 className="text-4xl md:text-5xl font-black">
                        <span className="bg-gradient-to-r from-[#f97316] via-[#ec4899] to-[#14b8a6] bg-clip-text text-transparent">My MTSS Portal</span>
                    </h1>
                    <p className="text-base md:text-lg text-muted-foreground dark:text-white/75">Select a student account to see cheerful dashboards, schedules, and quick chat logs.</p>
                </motion.div>

                <div className="grid gap-6 md:grid-cols-2">
                    {playfulStudents.map((student, index) => (
                        <motion.button
                            key={student.id}
                            whileHover={{ scale: 1.02, y: -6 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSelectedStudent(student.id)}
                            className="group relative overflow-hidden rounded-[48px] border border-white/50 dark:border-white/15 text-left shadow-[0_25px_70px_rgba(15,23,42,0.25)]"
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${student.accent}`} />
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-white/15 mix-blend-overlay" />
                            <div className="relative z-10 p-8 text-white space-y-3">
                                <p className="text-sm uppercase tracking-[0.5em] opacity-80">Who is logging in?</p>
                                <h2 className="text-3xl font-black drop-shadow-lg">{student.name}</h2>
                                <p className="text-lg font-semibold">{student.grade}</p>
                                <div className="rounded-3xl bg-white/20 px-4 py-2 text-sm font-semibold">
                                    <p>Focus: {student.focus}</p>
                                    <p>Mentor: {student.mentor}</p>
                                </div>
                                <span className="inline-flex items-center gap-2 text-sm uppercase font-black tracking-[0.5em]">
                                    Enter Portal
                                    <motion.span animate={{ x: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.4 }}>
                                        →
                                    </motion.span>
                                </span>
                            </div>
                        </motion.button>
                    ))}
                </div>

                <div className="flex justify-center">
                    <button
                        onClick={handleBack}
                        className="px-6 py-3 rounded-full bg-white/85 dark:bg-white/10 text-sm font-semibold text-rose-500 shadow-lg border border-white/60 hover:shadow-xl transition"
                    >
                        ← Back to Role Selection
                    </button>
                </div>
            </div>
        </div>
    );

    const renderProgressTab = () => (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-[32px] bg-white/90 dark:bg-white/5 border border-white/40 dark:border-white/10 p-5 shadow-lg">
                    <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Current Goal</p>
                    <p className="mt-3 text-sm text-muted-foreground dark:text-white/70">{currentStudent.data.goal}</p>
                    <p className="mt-2 text-sm font-semibold">My Mentor: {currentStudent.mentor}</p>
                </div>
                <div className="rounded-[32px] bg-gradient-to-br from-[#fef3c7] via-[#fde68a] to-[#fcd34d] text-[#92400e] p-5 shadow-lg border border-white/50">
                    <p className="text-xs uppercase tracking-[0.4em]">My Progress</p>
                    <p className="mt-3 text-4xl font-black drop-shadow-md">{currentStudent.data.progress}</p>
                    <p className="text-sm font-semibold">{currentStudent.data.status}</p>
                </div>
                <div className="rounded-[32px] bg-white/90 dark:bg-white/5 border border-white/40 dark:border-white/10 p-5 shadow-lg">
                    <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Next Session</p>
                    <p className="mt-3 text-lg font-semibold">{currentStudent.data.nextSession.label}</p>
                    <p className="text-sm text-muted-foreground">{currentStudent.data.nextSession.detail}</p>
                    <p className="text-sm font-semibold mt-2">{currentStudent.data.nextSession.room}</p>
                </div>
            </div>

            <div className="rounded-[40px] bg-white/95 dark:bg-white/5 border border-white/40 dark:border-white/10 p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">My Progress Chart</p>
                        <h3 className="text-lg font-black text-foreground dark:text-white">{currentStudent.focus}</h3>
                    </div>
                    <Star className="w-5 h-5 text-pink-500" />
                </div>
                <svg viewBox="0 0 600 200" className="w-full h-48">
                    <defs>
                        <linearGradient id="sparkLine" x1="0%" x2="100%" y1="0%" y2="0%">
                            <stop offset="0%" stopColor="#f472b6" />
                            <stop offset="100%" stopColor="#f97316" />
                        </linearGradient>
                    </defs>
                    <polyline
                        fill="none"
                        stroke="url(#sparkLine)"
                        strokeWidth="6"
                        strokeLinecap="round"
                        points={currentStudent.data.chart
                            .map((point, index) => {
                                const x = (index / (currentStudent.data.chart.length - 1 || 1)) * 580 + 10;
                                const y = 190 - (point.value / 100) * 180;
                                return `${x},${y}`;
                            })
                            .join(" ")}
                    />
                </svg>
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    {currentStudent.data.chart.map((point) => (
                        <span key={point.label}>{point.label}</span>
                    ))}
                </div>
            </div>

            <div className="rounded-[32px] bg-white/95 dark:bg-white/5 border border-white/40 dark:border-white/10 p-5 shadow-xl space-y-3">
                <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Recent Updates</p>
                {currentStudent.data.updates.map((update) => (
                    <div key={update.date} className="rounded-[24px] bg-gradient-to-r from-[#eef2ff] to-[#ffe4e6] dark:from-white/10 dark:to-white/5 p-4">
                        <p className="text-sm font-semibold text-purple-600 dark:text-purple-300">{update.date}</p>
                        <p className="text-sm text-foreground dark:text-white/80">{update.note}</p>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderScheduleTab = () => (
        <div className="space-y-6">
            {["thisWeek", "nextWeek"].map((weekKey) => (
                <div key={weekKey} className="rounded-[40px] bg-white/95 dark:bg-white/5 border border-white/40 dark:border-white/10 p-6 shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">
                                {weekKey === "thisWeek" ? "This Week" : "Next Week"}
                            </p>
                            <h3 className="text-lg font-black text-foreground dark:text-white">My MTSS Schedule</h3>
                        </div>
                        <CalendarHeart className="w-5 h-5 text-sky-500" />
                    </div>
                    <div className="space-y-3">
                        {currentStudent.data.schedule[weekKey].map((item) => (
                            <div key={item.day} className="rounded-[30px] bg-gradient-to-r from-[#fff7ed] to-[#fef3c7] dark:from-white/10 dark:to-white/5 p-4 border border-white/70 dark:border-white/10">
                                <p className="text-sm font-black text-rose-500">{item.day}</p>
                                <p className="text-base font-semibold text-foreground dark:text-white">{item.title}</p>
                                <p className="text-sm text-muted-foreground">{item.room}</p>
                                <p className="text-sm text-foreground dark:text-white/80 mt-1">{item.note}</p>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );

    const renderMessagesTab = () => (
        <div className="space-y-6">
            <div className="rounded-[40px] bg-white/95 dark:bg-white/5 border border-white/40 dark:border-white/10 p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Messages</p>
                        <h3 className="text-lg font-black text-foreground dark:text-white">Communication Log</h3>
                    </div>
                    <MessageCircleHeart className="w-5 h-5 text-pink-500" />
                </div>
                <div className="space-y-3">
                    {currentStudent.data.messages.map((message, index) => (
                        <div key={`${message.from}-${index}`} className="rounded-[28px] bg-gradient-to-r from-[#eef2ff] to-[#e0f2fe] dark:from-white/10 dark:to-white/5 p-4 border border-white/80 dark:border-white/10">
                            <p className="text-sm font-black text-sky-600 dark:text-sky-300">{message.from} • {message.date}</p>
                            <p className="text-sm text-foreground dark:text-white/80">{message.text}</p>
                        </div>
                    ))}
                </div>
                <div className="mt-4 flex gap-3">
                    <input
                        type="text"
                        className="flex-1 px-4 py-3 rounded-[24px] border border-white/60 dark:border-white/20 bg-white/80 dark:bg-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
                        placeholder="Type your message... (demo only)"
                        disabled
                    />
                    <button className="px-6 py-3 rounded-[24px] bg-gradient-to-r from-[#a5b4fc] to-[#fbcfe8] text-sm font-semibold text-white shadow-lg cursor-not-allowed">
                        Send
                    </button>
                </div>
            </div>
        </div>
    );

    if (!selectedStudent) {
        return renderSelectionView();
    }

    return (
        <div className="mtss-theme mtss-animated-bg min-h-screen relative overflow-hidden text-foreground dark:text-white">
            <div className="mtss-bg-overlay" />
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-[#fde68a]/50 via-[#f9a8d4]/50 to-[#c4b5fd]/50" />
                <motion.div className="absolute top-10 left-10 w-20 h-20 rounded-full bg-white/40" animate={{ scale: [1, 1.2, 1], rotate: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 6 }} />
            </div>

            <div className="relative z-10 container-tight py-12 space-y-10">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <button onClick={handleBack} className="inline-flex items-center gap-2 px-4 py-2 rounded-[28px] bg-white/90 dark:bg-white/10 shadow-lg text-sm font-semibold text-rose-500">
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </button>
                    <div className="text-right space-y-1">
                        <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground dark:text-white/70">My MTSS Portal</p>
                        <h1 className="text-3xl md:text-4xl font-black">{currentStudent.data.title || currentStudent.name} Journey</h1>
                    </div>
                    <div className="px-4 py-2 rounded-[28px] bg-gradient-to-r from-[#fecdd3] to-[#f5d0fe] text-sm font-black text-rose-700 shadow-lg">
                        Logged in as: {currentStudent.name}
                    </div>
                </div>

                <div className="flex flex-wrap gap-3">
                    {[
                        { key: "progress", label: "My Progress", icon: BookOpenCheck },
                        { key: "schedule", label: "Schedule", icon: CalendarHeart },
                        { key: "messages", label: "Messages", icon: MessageCircleHeart },
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`px-5 py-3 rounded-[30px] border font-semibold text-sm flex items-center gap-2 transition ${
                                activeTab === tab.key ? "bg-gradient-to-r from-[#fdf2f8] to-[#eef2ff] text-rose-600 border-white/60" : "bg-white/15 text-white border-white/30 hover:bg-white/25"
                            }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {activeTab === "progress" && renderProgressTab()}
                {activeTab === "schedule" && renderScheduleTab()}
                {activeTab === "messages" && renderMessagesTab()}
            </div>
        </div>
    );
});

StudentPortalPage.displayName = "StudentPortalPage";
export default StudentPortalPage;

