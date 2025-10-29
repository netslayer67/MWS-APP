import React, { memo, useMemo, useEffect, useState } from "react";
import { Users, UserCheck, CheckCircle2, MessageCircle, ChevronDown } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSupportContacts } from "../../store/slices/supportSlice";

const Header = memo(() => (
    <div className="flex items-center gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-emerald/10 border border-emerald/20 flex items-center justify-center">
            <Users className="w-5 h-5 text-emerald" />
        </div>
        <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-foreground">
                Need Support?
            </h3>
            <p className="text-xs text-foreground/70">
                Select someone to check in with you today
            </p>
        </div>
    </div>
));

const CustomSelect = memo(({ internalSelection, onInternalChange, hasSelection, supportContacts, loading }) => (
    <div className="relative">
        <select
            value={internalSelection}
            onChange={(e) => onInternalChange(e.target.value)}
            disabled={loading || supportContacts.length === 0}
            className={`w-full px-3 py-2.5 bg-card/50 border border-border/60 rounded-lg text-sm text-foreground appearance-none cursor-pointer transition-all duration-300 ${hasSelection ? 'border-emerald/50 bg-emerald/5' : 'hover:border-emerald/30'} focus:outline-none focus:border-emerald focus:ring-1 focus:ring-emerald/20 ${loading || supportContacts.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            <option value="">
                {loading ? 'Loading...' : supportContacts.length === 0 ? 'No contacts available' : 'Choose a team member...'}
            </option>
            {supportContacts.map((contact) => (
                <option key={contact.id} value={contact.name}>
                    {contact.isClassTeacher
                        ? `${contact.name} — Class Teacher`
                        : `${contact.name} — ${contact.displayRole || contact.role}`
                    }
                </option>
            ))}
            <option value="No Need">No Need</option>
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <ChevronDown className={`w-4 h-4 transition-colors ${hasSelection ? 'text-emerald' : 'text-foreground/50'}`} />
        </div>
    </div>
));

const SelectedPersonCard = memo(({ selectedPerson }) => (
    <div className="p-3 rounded-lg bg-emerald/5 border border-emerald/20">
        <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald/20 flex items-center justify-center">
                <span className="text-xs font-semibold text-emerald">
                    {selectedPerson.avatar}
                </span>
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <UserCheck className="w-3.5 h-3.5 text-emerald flex-shrink-0" />
                    <p className="text-sm font-medium text-emerald truncate">
                        {selectedPerson.name}
                    </p>
                </div>
                <p className="text-xs text-foreground/70">
                    We'll arrange for {selectedPerson.name} to connect with you today.
                </p>
            </div>
        </div>
    </div>
));

const NoNeedCard = memo(() => (
    <div className="p-3 rounded-lg bg-emerald/5 border border-emerald/20">
        <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald flex-shrink-0" />
            <div className="flex-1">
                <p className="text-sm font-medium text-emerald">
                    Great! You're feeling supported
                </p>
                <p className="text-xs text-foreground/70">
                    Remember, our team is always here when you need us.
                </p>
            </div>
        </div>
    </div>
));

const EmptyStateHelper = memo(() => (
    <div className="p-3 rounded-lg bg-card/30 border border-border/40">
        <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm">💬</span>
            </div>
            <div className="flex-1">
                <p className="text-xs text-foreground/70 leading-relaxed">
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
        <div className="w-1.5 h-1.5 rounded-full bg-emerald animate-pulse" />
        <p className="text-xs text-foreground/60">
            Our support team is available today
        </p>
    </div>
));

const SupportSelector = memo(({ supportContact, onSupportChange }) => {
    const dispatch = useDispatch();
    const { contacts, loading } = useSelector((state) => state.support);
    const { isAuthenticated } = useSelector((state) => state.auth);

    // Internal state for immediate UI updates
    const [internalSelection, setInternalSelection] = useState(supportContact || "");

    // Fetch support contacts on component mount
    useEffect(() => {
        if (contacts.length === 0 && isAuthenticated && !loading) {
            // Small delay to ensure auth state is fully loaded
            const timer = setTimeout(() => {
                dispatch(fetchSupportContacts());
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [dispatch, contacts.length, isAuthenticated, loading]);

    // Sync internal state with prop
    useEffect(() => {
        setInternalSelection(supportContact || "");
    }, [supportContact]);

    // Use API data if available, otherwise show loading or empty state
    const supportContacts = useMemo(() => {
        console.log('SupportSelector contacts:', contacts);
        if (contacts.length > 0) {
            return contacts;
        }
        // Return empty array if no data yet (loading state)
        return [];
    }, [contacts]);

    const selectedPerson = useMemo(
        () => supportContacts.find(c => c.name === internalSelection) || {
            name: internalSelection,
            role: 'Support Contact',
            department: 'N/A',
            jobLevel: 'N/A',
            unit: 'N/A',
            jobPosition: 'N/A',
            avatar: internalSelection ? internalSelection.charAt(0).toUpperCase() : '?'
        },
        [internalSelection, supportContacts]
    );

    const isNoNeed = internalSelection === "No Need";
    const hasSelection = !!internalSelection;

    const handleInternalChange = (value) => {
        setInternalSelection(value);
        if (onSupportChange) {
            onSupportChange(value);
        }
    };

    return (
        <div className="bg-card/30 border border-border/40 rounded-lg p-4 space-y-4">
            <Header />
            <CustomSelect internalSelection={internalSelection} onInternalChange={handleInternalChange} hasSelection={hasSelection} supportContacts={supportContacts} loading={loading} />
            {selectedPerson && selectedPerson.id !== "no-need" && <SelectedPersonCard selectedPerson={selectedPerson} />}
            {isNoNeed && <NoNeedCard />}
            {!hasSelection && <EmptyStateHelper />}
            <TeamAvailabilityBadge />
        </div>
    );
});

SupportSelector.displayName = 'SupportSelector';
export default SupportSelector;