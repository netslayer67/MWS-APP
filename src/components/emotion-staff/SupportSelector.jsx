import React, { memo, useMemo } from "react";
import { Users, UserCheck, CheckCircle2, MessageCircle, ChevronDown } from "lucide-react";

const supportContacts = [
    { id: "mahrukh", name: "Ms. Mahrukh", role: "Coordinator", avatar: "MB" },
    { id: "latifah", name: "Ms. Latifah", role: "Counselor", avatar: "LA" },
    { id: "kholida", name: "Ms. Kholida", role: "Advisor", avatar: "KH" },
    { id: "aria", name: "Mr. Aria", role: "Mentor", avatar: "AR" },
    { id: "hana", name: "Ms. Hana", role: "Support", avatar: "HA" },
    { id: "wina", name: "Ms. Wina", role: "Counselor", avatar: "WI" },
    { id: "sarah", name: "Ms. Sarah", role: "Advisor", avatar: "SA" },
    { id: "hanny", name: "Ms. Hanny", role: "Support", avatar: "HN" },
    { id: "dodi", name: "Pak Dodi", role: "Mentor", avatar: "DO" },
    { id: "faisal", name: "Pak Faisal", role: "Advisor", avatar: "FA" },
    { id: "no-need", name: "No Need", role: "I'm feeling supported", avatar: "✓" }
];

const Header = memo(() => (
    <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br from-emerald/10 to-emerald/5 border border-emerald/20 flex items-center justify-center transition-all duration-300 hover:scale-105">
            <Users className="w-6 h-6 md:w-7 md:h-7 text-emerald" />
        </div>
        <div className="flex-1 min-w-0">
            <h2 className="text-lg md:text-xl font-semibold text-foreground tracking-tight">
                Need Support?
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                Select someone to check in with you today
            </p>
        </div>
    </div>
));

const CustomSelect = memo(({ supportContact, onSupportChange, hasSelection }) => (
    <div className="relative">
        <select
            value={supportContact}
            onChange={(e) => onSupportChange(e.target.value)}
            className={`w-full px-4 py-3.5 md:py-4 bg-input/50 backdrop-blur-sm border-2 rounded-lg text-sm md:text-base text-foreground appearance-none cursor-pointer transition-all duration-300 ease-premium ${hasSelection ? 'border-emerald shadow-lg shadow-emerald/10 bg-input/80' : 'border-border hover:border-emerald/40 hover:bg-input/70'} focus:outline-none focus:border-emerald focus:shadow-lg focus:shadow-emerald/10`}
        >
            <option value="">Choose a team member...</option>
            {supportContacts.map((contact) => (
                <option key={contact.id} value={contact.name}>
                    {contact.name} — {contact.role}
                </option>
            ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <ChevronDown className={`w-5 h-5 transition-all duration-300 ${hasSelection ? 'text-emerald' : 'text-muted-foreground'}`} />
        </div>
    </div>
));

const SelectedPersonCard = memo(({ selectedPerson }) => (
    <div className="p-4 rounded-lg border backdrop-blur-sm animate-in fade-in slide-in-from-bottom-2 duration-300 bg-emerald/5 border-emerald/20">
        <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-emerald to-emerald/70 flex items-center justify-center shadow-lg shadow-emerald/20">
                <span className="text-sm font-bold text-white">
                    {selectedPerson.avatar}
                </span>
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <UserCheck className="w-4 h-4 text-emerald flex-shrink-0" />
                    <p className="text-sm md:text-base font-semibold text-emerald">
                        {selectedPerson.name}
                    </p>
                </div>
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                    We'll arrange for {selectedPerson.name} to connect with you today.
                    You can also reach out directly if needed.
                </p>
            </div>
        </div>
        <div className="mt-3 pt-3 border-t border-emerald/10">
            <div className="flex items-center gap-2 text-xs text-emerald">
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Available for check-in or direct contact</span>
            </div>
        </div>
    </div>
));

const NoNeedCard = memo(() => (
    <div className="p-4 rounded-lg border backdrop-blur-sm animate-in fade-in slide-in-from-bottom-2 duration-300 bg-emerald/5 border-emerald/20">
        <div className="flex items-start gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald flex-shrink-0 mt-0.5" />
            <div className="flex-1">
                <p className="text-sm md:text-base font-semibold text-emerald mb-1">
                    Great! You're feeling supported
                </p>
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                    Remember, our team is always here when you need us. Don't hesitate to reach out anytime.
                </p>
            </div>
        </div>
    </div>
));

const EmptyStateHelper = memo(() => (
    <div className="p-4 rounded-lg bg-muted/10 border border-border/50">
        <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-base">💬</span>
            </div>
            <div className="flex-1">
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                    <span className="font-medium text-foreground">Tip:</span> Select a team member
                    if you'd like someone to check in with you, or choose "No Need" if you're
                    feeling well-supported today.
                </p>
            </div>
        </div>
    </div>
));

const TeamAvailabilityBadge = memo(() => (
    <div className="flex items-center justify-center gap-2 pt-2">
        <div className="w-2 h-2 rounded-full bg-emerald animate-pulse" />
        <p className="text-xs text-muted-foreground">
            Our support team is available today
        </p>
    </div>
));

const SupportSelector = memo(({ supportContact, onSupportChange }) => {
    const selectedPerson = useMemo(
        () => supportContacts.find(c => c.name === supportContact),
        [supportContact]
    );

    const isNoNeed = supportContact === "No Need";
    const hasSelection = !!supportContact;

    return (
        <div className="glass glass-card hover-lift transition-all duration-300">
            <div className="glass__refract" />
            <div className="glass__refract--soft" />
            <div className="glass__noise" />
            <div className="relative z-10 p-5 md:p-6 space-y-5">
                <Header />
                <CustomSelect supportContact={supportContact} onSupportChange={onSupportChange} hasSelection={hasSelection} />
                {selectedPerson && selectedPerson.id !== "no-need" && <SelectedPersonCard selectedPerson={selectedPerson} />}
                {isNoNeed && <NoNeedCard />}
                {!hasSelection && <EmptyStateHelper />}
                <TeamAvailabilityBadge />
            </div>
        </div>
    );
});

SupportSelector.displayName = 'SupportSelector';
export default SupportSelector;