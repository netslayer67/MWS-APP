import React, { memo, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
    Activity,
    Building2,
    LayoutDashboard,
    LineChart as LineChartIcon,
    Search,
    Sparkles,
    Users2,
    UserCheck,
    Star,
    Shield,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { mtssStudents } from "./data/students";
import { TierPill, ProgressBadge } from "./components/StatusPills";
import StudentsTable from "./components/StudentsTable";

const adminTabs = [
    { key: "overview", label: "System Overview", icon: LayoutDashboard },
    { key: "students", label: "All Students", icon: Users2 },
    { key: "mentors", label: "Manage Mentors", icon: UserCheck },
    { key: "analytics", label: "Analytics Lab", icon: LineChartIcon },
];

const mentorSpotlights = [
    { name: "Sarah Johnson", caseload: 6, focus: "Tier 2 Literacy", trend: "+2 joyful gains" },
    { name: "Michael Brown", caseload: 5, focus: "Math Interventions", trend: "+1 mentor added" },
];

const successByType = [
    { label: "English", value: 88, gradient: "from-[#a78bfa] to-[#6366f1]" },
    { label: "Math", value: 84, gradient: "from-[#f472b6] to-[#fb7185]" },
    { label: "Behavior", value: 79, gradient: "from-[#34d399] to-[#10b981]" },
    { label: "SEL", value: 76, gradient: "from-[#22d3ee] to-[#3b82f6]" },
    { label: "Attendance", value: 91, gradient: "from-[#fcd34d] to-[#f97316]" },
];

const trendData = [
    { label: "Week 1", met: 62, support: 38 },
    { label: "Week 2", met: 65, support: 34 },
    { label: "Week 3", met: 68, support: 30 },
    { label: "Week 4", met: 71, support: 27 },
    { label: "Week 5", met: 75, support: 22 },
    { label: "Week 6", met: 78, support: 19 },
];

const recentActivity = [
    { date: "Nov 4, 2025", activity: "Progress update submitted", student: "Marcus Thompson", mentor: "Sarah Johnson" },
    { date: "Nov 4, 2025", activity: "New intervention created", student: "Lisa Anderson", mentor: "Michael Brown" },
    { date: "Nov 3, 2025", activity: "Progress update submitted", student: "Emily Rodriguez", mentor: "Michael Brown" },
    { date: "Nov 3, 2025", activity: "Student moved to Tier 2", student: "James Wilson", mentor: "-" },
];

const systemSnapshot = {
    totalStudents: 47,
    activeMentors: 12,
    successRate: 72,
    tierBreakdown: [
        { label: "Tier 1", description: "15 students", count: 15 },
        { label: "Tier 2", description: "22 students", count: 22 },
        { label: "Tier 3", description: "10 students", count: 10 },
    ],
    interventions: [
        { label: "English", count: 18 },
        { label: "Math", count: 12 },
        { label: "Behavior", count: 9 },
        { label: "SEL", count: 5 },
        { label: "Attendance", count: 3 },
    ],
};

const mentorRoster = [
    { name: "Sarah Johnson", role: "5th Grade Teacher", activeStudents: 12, successRate: "78%" },
    { name: "Michael Brown", role: "Reading Specialist", activeStudents: 8, successRate: "82%" },
    { name: "Jennifer Lee", role: "School Counselor", activeStudents: 15, successRate: "71%" },
];

const AdminDashboardPage = memo(() => {
    const students = mtssStudents;
    const navigate = useNavigate();
    const { toast } = useToast();

    const [activeTab, setActiveTab] = useState("overview");
    const [filters, setFilters] = useState({
        grade: "all",
        tier: "all",
        type: "all",
        mentor: "all",
        query: "",
    });

    const filteredStudents = useMemo(() => {
        return students.filter((student) => {
            const matchesGrade = filters.grade === "all" || student.grade === filters.grade;
            const matchesTier = filters.tier === "all" || student.tier === filters.tier;
            const matchesType = filters.type === "all" || student.type === filters.type;
            const matchesMentor = filters.mentor === "all" || student.profile?.mentor === filters.mentor;
            const matchesQuery =
                !filters.query ||
                student.name.toLowerCase().includes(filters.query.toLowerCase()) ||
                student.type.toLowerCase().includes(filters.query.toLowerCase());
            return matchesGrade && matchesTier && matchesType && matchesMentor && matchesQuery;
        });
    }, [students, filters]);

    const gradeOptions = useMemo(() => ["all", ...new Set(students.map((student) => student.grade))], [students]);
    const tierOptions = useMemo(() => ["all", ...new Set(students.map((student) => student.tier))], [students]);
    const typeOptions = useMemo(() => ["all", ...new Set(students.map((student) => student.type))], [students]);
    const mentorOptions = useMemo(
        () => ["all", ...new Set(students.map((student) => student.profile?.mentor).filter(Boolean))],
        [students],
    );

    const trendPaths = useMemo(() => {
        if (trendData.length < 2) {
            return { met: "", support: "" };
        }
        const width = 600;
        const height = 200;
        const createPath = (key) =>
            trendData
                .map((point, index) => {
                    const x = (index / (trendData.length - 1)) * width;
                    const y = height - (point[key] / 100) * height;
                    return `${index === 0 ? "M" : "L"}${x},${y}`;
                })
                .join(" ");
        return {
            met: createPath("met"),
            support: createPath("support"),
        };
    }, []);

    const handleFilterChange = (field, value) => {
        setFilters((prev) => ({ ...prev, [field]: value }));
    };

    const handleViewStudent = (student) => {
        navigate(`/mtss/student/${student.slug}`);
    };

    const handleUpdateStudent = (student) => {
        toast({
            title: "Mentor nudged",
            description: `Flagged ${student.name}'s plan for a system review.`,
        });
    };

    const filterClass =
        "px-4 py-3 rounded-2xl bg-white/70 dark:bg-white/10 border border-white/40 dark:border-white/10 text-sm text-foreground dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40";

    const statCards = [
        {
            label: "Students in MTSS",
            value: systemSnapshot.totalStudents,
            caption: "Across all tiers",
            accent: "from-[#ff80b5] via-[#f472b6] to-[#c084fc]",
            icon: Building2,
        },
        {
            label: "Active Mentors",
            value: systemSnapshot.activeMentors,
            caption: "Teachers & specialists",
            accent: "from-[#fcd34d] via-[#fb923c] to-[#f87171]",
            icon: UserCheck,
        },
        {
            label: "Success Rate",
            value: `${systemSnapshot.successRate}%`,
            caption: "Meeting intervention goals",
            accent: "from-[#6ee7b7] via-[#34d399] to-[#10b981]",
            icon: Star,
        },
    ];
    const renderOverview = () => (
        <div className="space-y-8">
            <div className="grid gap-6 md:grid-cols-3">
                {statCards.map((card, index) => (
                    <motion.div
                        key={card.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative p-6 rounded-[28px] bg-gradient-to-br text-white overflow-hidden mtss-card-pop shadow-[0_25px_80px_rgba(15,23,42,0.22)]"
                    >
                        <div className={`absolute inset-0 opacity-80 bg-gradient-to-br ${card.accent}`} />
                        <span className="mtss-liquid-hover-blob" />
                        <div className="relative z-10 flex flex-col gap-4">
                            <div className="flex items-center gap-3 text-sm uppercase tracking-[0.4em] text-white/80">
                                <card.icon className="w-5 h-5" />
                                {card.label}
                            </div>
                            <div>
                                <p className="text-4xl font-black tracking-tight">{card.value}</p>
                                <p className="text-sm opacity-80">{card.caption}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <div className="glass glass-card mtss-card-surface p-6 rounded-[32px] space-y-5">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-foreground dark:text-white">Students by Tier</h3>
                        <Sparkles className="w-5 h-5 text-primary" />
                    </div>
                    <div className="space-y-4">
                        {systemSnapshot.tierBreakdown.map((tier) => (
                            <div key={tier.label} className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-sm font-black text-primary">
                                    {tier.count}
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-foreground dark:text-white">{tier.label}</p>
                                    <p className="text-xs text-muted-foreground">{tier.description}</p>
                                    <div className="h-2.5 bg-white/30 dark:bg-white/10 rounded-full">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-primary/70 via-rose/70 to-gold/70"
                                            style={{ width: `${(tier.count / systemSnapshot.totalStudents) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="glass glass-card mtss-card-surface p-6 rounded-[32px] space-y-5">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-foreground dark:text-white">Intervention Types</h3>
                        <Shield className="w-5 h-5 text-sky-500" />
                    </div>
                    <div className="space-y-4">
                        {systemSnapshot.interventions.map((item) => (
                            <div key={item.label} className="flex items-center justify-between text-sm font-semibold">
                                <span className="text-foreground dark:text-white">{item.label}</span>
                                <div className="flex items-center gap-3">
                                    <div className="w-32 h-2 rounded-full bg-white/20">
                                        <div
                                            className="h-2 rounded-full bg-gradient-to-r from-[#7dd3fc] to-[#60a5fa]"
                                            style={{ width: `${(item.count / systemSnapshot.totalStudents) * 100}%` }}
                                        />
                                    </div>
                                    <span className="text-muted-foreground dark:text-white/70">{item.count}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <div className="glass glass-card mtss-card-surface p-6 rounded-[32px] space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-foreground dark:text-white">Recent Activity</h3>
                        <Activity className="w-5 h-5 text-rose-500" />
                    </div>
                    <div className="space-y-3 text-sm">
                        {recentActivity.map((item) => (
                            <div key={`${item.date}-${item.student}`} className="grid grid-cols-[90px_1fr] gap-4 rounded-2xl bg-white/50 dark:bg-white/5 p-4">
                                <div>
                                    <p className="font-semibold text-foreground dark:text-white">{item.date}</p>
                                    <p className="text-xs text-muted-foreground">{item.mentor}</p>
                                </div>
                                <div>
                                    <p className="font-semibold text-foreground dark:text-white">{item.student}</p>
                                    <p className="text-sm text-muted-foreground dark:text-white/70">{item.activity}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="glass glass-card mtss-card-surface p-6 rounded-[32px] space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-foreground dark:text-white">Mentor Spotlight</h3>
                        <Users2 className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div className="space-y-4">
                        {mentorSpotlights.map((mentor) => (
                            <div key={mentor.name} className="flex items-center gap-4 rounded-2xl bg-white/60 dark:bg-white/5 p-4">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/70 to-rose/70 text-white font-black flex items-center justify-center">
                                    {mentor.name
                                        .split(" ")
                                        .map((part) => part[0])
                                        .slice(0, 2)
                                        .join("")}
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-foreground dark:text-white">{mentor.name}</p>
                                    <p className="text-xs text-muted-foreground">{mentor.focus}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-foreground dark:text-white">{mentor.caseload} students</p>
                                    <p className="text-xs text-emerald-500 font-semibold">{mentor.trend}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderStudents = () => (
        <div className="space-y-6">
            <div className="glass glass-card mtss-card-surface p-6 rounded-[36px]">
                <div className="grid gap-4 lg:grid-cols-5">
                    <select className={filterClass} value={filters.grade} onChange={(event) => handleFilterChange("grade", event.target.value)}>
                        {gradeOptions.map((grade) => (
                            <option key={grade} value={grade}>
                                {grade === "all" ? "All Grades" : grade}
                            </option>
                        ))}
                    </select>
                    <select className={filterClass} value={filters.tier} onChange={(event) => handleFilterChange("tier", event.target.value)}>
                        {tierOptions.map((tier) => (
                            <option key={tier} value={tier}>
                                {tier === "all" ? "All Tiers" : tier}
                            </option>
                        ))}
                    </select>
                    <select className={filterClass} value={filters.type} onChange={(event) => handleFilterChange("type", event.target.value)}>
                        {typeOptions.map((type) => (
                            <option key={type} value={type}>
                                {type === "all" ? "All Types" : type}
                            </option>
                        ))}
                    </select>
                    <select className={filterClass} value={filters.mentor} onChange={(event) => handleFilterChange("mentor", event.target.value)}>
                        {mentorOptions.map((mentor) => (
                            <option key={mentor} value={mentor}>
                                {mentor === "all" ? "All Mentors" : mentor}
                            </option>
                        ))}
                    </select>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            className={`${filterClass} pl-10`}
                            placeholder="Search students"
                            value={filters.query}
                            onChange={(event) => handleFilterChange("query", event.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="glass glass-card mtss-card-surface p-6 rounded-[36px]">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Roster</p>
                        <h3 className="text-xl font-black text-foreground dark:text-white">All students in MTSS</h3>
                    </div>
                    <button className="px-4 py-2 rounded-full bg-white/80 text-sm font-semibold text-primary shadow">
                        Export CSV
                    </button>
                </div>
                <StudentsTable
                    students={filteredStudents}
                    TierPill={TierPill}
                    ProgressBadge={ProgressBadge}
                    showActions
                    onView={handleViewStudent}
                    onUpdate={handleUpdateStudent}
                />
            </div>
        </div>
    );
    const renderMentors = () => (
        <div className="space-y-8">
            <div className="glass glass-card mtss-card-surface p-8 rounded-[40px] shadow-[0_30px_90px_rgba(15,23,42,0.32)] border border-white/10 bg-white/15 dark:bg-white/5">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
                    <div>
                        <p className="text-[0.7rem] uppercase tracking-[0.5em] text-muted-foreground dark:text-white/60">Mentor Squad</p>
                        <h3 className="text-2xl font-black text-foreground dark:text-white">Manage Mentors</h3>
                        <p className="text-sm text-muted-foreground dark:text-white/70 max-w-2xl">
                            Assign caseloads, check success rates, and celebrate wins without losing the playful flow.
                        </p>
                    </div>
                    <button className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#fef9c3] to-[#fbcfe8] text-sm font-semibold text-rose-600 shadow-lg hover:shadow-[#f43f5e]/30 transition">
                        Add Mentor
                    </button>
                </div>
                <div className="grid gap-6 md:grid-cols-3">
                    {mentorRoster.map((mentor, index) => (
                        <motion.div
                            key={mentor.name}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.08 }}
                            className="rounded-[32px] bg-white/90 dark:bg-white/10 border border-white/60 dark:border-white/10 p-6 space-y-5 shadow-[0_25px_80px_rgba(15,23,42,0.24)] backdrop-blur-xl"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-rose text-white font-black flex items-center justify-center shadow-inner">
                                    {mentor.name
                                        .split(" ")
                                        .map((part) => part[0])
                                        .slice(0, 2)
                                        .join("")}
                                </div>
                                <div>
                                    <p className="text-lg font-semibold text-foreground dark:text-white">{mentor.name}</p>
                                    <p className="text-sm text-muted-foreground dark:text-white/70">{mentor.role}</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between text-sm font-semibold text-foreground dark:text-white gap-4">
                                <div>
                                    <p className="text-[0.65rem] uppercase tracking-[0.6em] text-muted-foreground">Active students</p>
                                    <p className="text-3xl font-black">{mentor.activeStudents}</p>
                                </div>
                                <div>
                                    <p className="text-[0.65rem] uppercase tracking-[0.6em] text-muted-foreground">Success rate</p>
                                    <p className="text-3xl font-black text-emerald-500">{mentor.successRate}</p>
                                </div>
                            </div>
                            <div className="flex flex-col gap-3 sm:flex-row">
                                <button className="flex-1 px-4 py-2.5 rounded-full bg-gradient-to-r from-[#7dd3fc] to-[#60a5fa] text-white text-sm font-semibold shadow-md hover:-translate-y-0.5 transition">
                                    View Details
                                </button>
                                <button className="flex-1 px-4 py-2.5 rounded-full border border-primary/40 text-primary text-sm font-semibold bg-white shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition dark:bg-white/5 dark:text-white">
                                    Assign Students
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
    const renderAnalytics = () => (
        <div className="space-y-6">
            <div className="glass glass-card mtss-card-surface p-6 rounded-[32px] space-y-5">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Pulse</p>
                        <h3 className="text-xl font-black text-foreground dark:text-white">Success rate by intervention type</h3>
                    </div>
                    <Sparkles className="w-5 h-5 text-yellow-400" />
                </div>
                <div className="space-y-4">
                    {successByType.map((item) => (
                        <div key={item.label}>
                            <div className="flex items-center justify-between text-sm font-semibold text-foreground dark:text-white mb-1">
                                <span>{item.label}</span>
                                <span>{item.value}%</span>
                            </div>
                            <div className="h-3 rounded-full bg-white/15">
                                <div className={`h-full rounded-full bg-gradient-to-r ${item.gradient}`} style={{ width: `${item.value}%` }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="glass glass-card mtss-card-surface p-6 rounded-[32px] space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Trajectory</p>
                        <h3 className="text-xl font-black text-foreground dark:text-white">Student progress over time</h3>
                    </div>
                    <Activity className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="w-full overflow-x-auto">
                    <svg viewBox="0 0 600 200" className="w-full h-48">
                        <defs>
                            <linearGradient id="metLine" x1="0%" x2="100%" y1="0%" y2="0%">
                                <stop offset="0%" stopColor="#6ee7b7" />
                                <stop offset="100%" stopColor="#22c55e" />
                            </linearGradient>
                            <linearGradient id="supportLine" x1="0%" x2="100%" y1="0%" y2="0%">
                                <stop offset="0%" stopColor="#fb7185" />
                                <stop offset="100%" stopColor="#f97316" />
                            </linearGradient>
                        </defs>
                        <path d={trendPaths.met} fill="none" stroke="url(#metLine)" strokeWidth="4" strokeLinecap="round" />
                        <path d={trendPaths.support} fill="none" stroke="url(#supportLine)" strokeWidth="4" strokeLinecap="round" />
                    </svg>
                    <div className="flex justify-between text-xs text-muted-foreground dark:text-white/70">
                        {trendData.map((point) => (
                            <span key={point.label}>{point.label}</span>
                        ))}
                    </div>
                </div>
            </div>

            <div className="glass glass-card mtss-card-surface p-6 rounded-[32px] grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                    <div>
                        <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Strategy lab</p>
                        <h3 className="text-xl font-black text-foreground dark:text-white">Most effective strategies</h3>
                    </div>
                    <div className="space-y-3 text-sm">
                        {[
                            { label: "Fluency Practice", value: "85%" },
                            { label: "Math Time Drill", value: "82%" },
                            { label: "CICO", value: "79%" },
                            { label: "2x10 Relationship", value: "76%" },
                        ].map((strategy) => (
                            <div key={strategy.label} className="flex items-center justify-between rounded-2xl bg-white/70 dark:bg-white/5 px-4 py-3">
                                <span className="font-semibold text-foreground dark:text-white">{strategy.label}</span>
                                <span className="text-lg font-black text-primary">{strategy.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="space-y-4">
                    <div>
                        <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Movement report</p>
                        <h3 className="text-xl font-black text-foreground dark:text-white">Tier movement (Last 30 days)</h3>
                    </div>
                    <div className="rounded-[28px] bg-gradient-to-br from-[#f8fafc] to-[#e0f2fe] dark:from-white/10 dark:to-white/5 p-6 space-y-4 text-foreground dark:text-white">
                        <div className="flex items-center gap-3">
                            <span className="text-3xl text-emerald-500">↑</span>
                            <div>
                                <p className="text-sm uppercase tracking-[0.4em] text-muted-foreground">Improved</p>
                                <p className="text-2xl font-black text-emerald-500">8 students improved</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-3xl text-rose-500">↓</span>
                            <div>
                                <p className="text-sm uppercase tracking-[0.4em] text-muted-foreground">Regressed</p>
                                <p className="text-2xl font-black text-rose-500">2 students regressed</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-3xl text-sky-500">→</span>
                            <div>
                                <p className="text-sm uppercase tracking-[0.4em] text-muted-foreground">Stable</p>
                                <p className="text-2xl font-black text-sky-500">15 students stable</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="mtss-theme mtss-animated-bg min-h-screen relative overflow-hidden">
            <div className="mtss-bg-overlay" />
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-20 left-0 w-96 h-96 bg-[#ff80b5]/30 blur-[180px]" />
                <div className="absolute top-40 right-0 w-80 h-80 bg-[#60a5fa]/30 blur-[180px]" />
                <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-[#fcd34d]/20 blur-[180px]" />
            </div>

            <div className="relative z-20 container-tight py-12 lg:py-16 text-foreground dark:text-white">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 space-y-4">
                    <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-white/80 dark:bg-white/10 backdrop-blur-xl shadow-lg">
                        <Building2 className="w-5 h-5 text-rose-500" />
                        <div>
                            <p className="text-[0.6rem] uppercase tracking-[0.5em] text-muted-foreground">Admin / Principal</p>
                            <p className="text-sm font-semibold">Oversee joyful MTSS momentum</p>
                        </div>
                    </div>
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight">
                            Multi-Tiered System Dashboard
                        </h1>
                        <p className="text-base md:text-lg text-muted-foreground dark:text-white/80 mt-2">
                            Assign mentors, scan analytics, and celebrate every intervention glow in one playful glass workspace.
                        </p>
                    </div>
                </motion.div>

                <div className="flex flex-wrap gap-3 mb-10">
                    {adminTabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`px-5 py-3 rounded-full border backdrop-blur-xl font-semibold text-sm flex items-center gap-2 transition shadow-lg ${activeTab === tab.key
                                    ? "bg-gradient-to-r from-[#ffe29f] via-[#ffa99f] to-[#ff719a] text-[#831843] border-white/60 shadow-[0_10px_30px_rgba(255,113,154,0.45)]"
                                    : "bg-white/25 text-white border-white/30 hover:bg-white/40 hover:text-rose-100"
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="space-y-10">
                    {activeTab === "overview" && renderOverview()}
                    {activeTab === "students" && renderStudents()}
                    {activeTab === "mentors" && renderMentors()}
                    {activeTab === "analytics" && renderAnalytics()}
                </div>
            </div>
        </div>
    );
});

AdminDashboardPage.displayName = "AdminDashboardPage";
export default AdminDashboardPage;
