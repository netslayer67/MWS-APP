import React, { memo, useCallback, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSupportContacts } from "@/store/slices/supportSlice";
import { motion } from "framer-motion";
import { UserCircle, GraduationCap, Heart, CheckCircle2, School } from "lucide-react";

const categoryConfig = {
    classTeacher: {
        label: "Your Teachers",
        icon: GraduationCap,
        gradient: "from-sky-400 to-blue-500",
        bgLight: "bg-sky-50 dark:bg-sky-900/20",
        borderLight: "border-sky-200 dark:border-sky-700/40"
    },
    principal: {
        label: "Your Principal",
        icon: School,
        gradient: "from-amber-400 to-orange-500",
        bgLight: "bg-amber-50 dark:bg-amber-900/20",
        borderLight: "border-amber-200 dark:border-amber-700/40"
    },
    psychologist: {
        label: "School Counselor",
        icon: Heart,
        gradient: "from-pink-400 to-rose-500",
        bgLight: "bg-pink-50 dark:bg-pink-900/20",
        borderLight: "border-pink-200 dark:border-pink-700/40"
    }
};

const StudentSupportSelector = memo(({ supportContact, onSupportChange }) => {
    const dispatch = useDispatch();
    const { contacts: supportContacts, loading } = useSelector((state) => state.support);
    const { isAuthenticated } = useSelector((state) => state.auth);

    useEffect(() => {
        if (supportContacts.length === 0 && isAuthenticated) {
            dispatch(fetchSupportContacts());
        }
    }, [dispatch, isAuthenticated, supportContacts.length]);

    const handleSelect = useCallback((contact) => {
        if (contact.id === "no-need") {
            onSupportChange?.("No Need");
        } else {
            onSupportChange?.(contact.name || contact.id);
        }
    }, [onSupportChange]);

    // Group contacts by category
    const groupedContacts = useMemo(() => {
        const groups = { classTeacher: [], principal: [], psychologist: [], other: [] };
        const noNeedOption = supportContacts.find(c => c.id === "no-need");

        supportContacts.forEach(contact => {
            if (contact.id === "no-need") return;
            const cat = contact.isClassTeacher ? 'classTeacher' : (contact.contactCategory || 'other');
            if (groups[cat]) {
                groups[cat].push(contact);
            } else {
                groups.other.push(contact);
            }
        });

        return { groups, noNeedOption };
    }, [supportContacts]);

    const isSelected = (contact) => {
        if (contact.id === "no-need") return supportContact === "No Need";
        return supportContact === contact.name || supportContact === contact.id;
    };

    const getDisplayName = (contact) => {
        const name = contact.displayName || contact.preferredName || contact.name || '';
        if (contact.gender === 'female' && !name.startsWith('Ms.') && !name.startsWith('Mrs.')) {
            return `Ms. ${name.split(' ')[0]}`;
        }
        if (contact.gender === 'male' && !name.startsWith('Mr.')) {
            return `Mr. ${name.split(' ')[0]}`;
        }
        return name;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="backdrop-blur-xl bg-white/60 dark:bg-white/5 border border-white/40 dark:border-white/10 rounded-2xl p-4 sm:p-5"
        >
            <div className="flex items-center gap-2.5 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center shadow-md">
                    <Heart className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h4 className="text-base font-bold text-foreground">Need Support?</h4>
                    <p className="text-xs text-muted-foreground">Choose someone to talk to</p>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-6 text-sm text-muted-foreground">Loading your support team...</div>
            ) : (
                <div className="space-y-4">
                    {/* Grouped contacts */}
                    {Object.entries(groupedContacts.groups).map(([category, contacts]) => {
                        if (contacts.length === 0) return null;
                        const config = categoryConfig[category];
                        if (!config) {
                            // Render ungrouped "other" contacts
                            return contacts.map(contact => (
                                <ContactCard
                                    key={contact.id}
                                    contact={contact}
                                    selected={isSelected(contact)}
                                    onSelect={handleSelect}
                                    displayName={getDisplayName(contact)}
                                />
                            ));
                        }

                        const GroupIcon = config.icon;
                        return (
                            <div key={category}>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${config.gradient} flex items-center justify-center`}>
                                        <GroupIcon className="w-3.5 h-3.5 text-white" />
                                    </div>
                                    <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{config.label}</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {contacts.map(contact => (
                                        <ContactCard
                                            key={contact.id}
                                            contact={contact}
                                            selected={isSelected(contact)}
                                            onSelect={handleSelect}
                                            displayName={getDisplayName(contact)}
                                            categoryConfig={config}
                                        />
                                    ))}
                                </div>
                            </div>
                        );
                    })}

                    {/* No Need option */}
                    {groupedContacts.noNeedOption && (
                        <button
                            onClick={() => handleSelect(groupedContacts.noNeedOption)}
                            className={`w-full flex items-center gap-3 rounded-xl border px-4 py-3 transition-all duration-200 ${isSelected(groupedContacts.noNeedOption)
                                ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-600 shadow-sm"
                                : "bg-white/40 dark:bg-white/5 border-white/50 dark:border-white/10 hover:bg-white/60"
                                }`}
                        >
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isSelected(groupedContacts.noNeedOption) ? "bg-emerald-100 dark:bg-emerald-800/30" : "bg-gray-100 dark:bg-gray-800/30"}`}>
                                <CheckCircle2 className={`w-4.5 h-4.5 ${isSelected(groupedContacts.noNeedOption) ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400"}`} />
                            </div>
                            <div className="text-left">
                                <p className={`text-sm font-semibold ${isSelected(groupedContacts.noNeedOption) ? "text-emerald-700 dark:text-emerald-300" : "text-foreground"}`}>
                                    I'm feeling supported
                                </p>
                                <p className="text-xs text-muted-foreground">No support needed right now</p>
                            </div>
                        </button>
                    )}
                </div>
            )}
        </motion.div>
    );
});

const ContactCard = memo(({ contact, selected, onSelect, displayName, categoryConfig }) => {
    const avatarInitials = (contact.name || '').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const roleLabel = contact.displayRole || contact.classInfo || contact.jobPosition || contact.role;

    return (
        <button
            onClick={() => onSelect(contact)}
            className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-all duration-200 text-left ${selected
                ? `${categoryConfig?.bgLight || 'bg-purple-50 dark:bg-purple-900/20'} ${categoryConfig?.borderLight || 'border-purple-200 dark:border-purple-700/40'} shadow-sm`
                : "bg-white/40 dark:bg-white/5 border-white/50 dark:border-white/10 hover:bg-white/60"
                }`}
        >
            <div className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold ${selected
                ? `bg-gradient-to-br ${categoryConfig?.gradient || 'from-purple-400 to-pink-500'} text-white`
                : "bg-gray-100 dark:bg-gray-800/50 text-muted-foreground"
                }`}>
                {contact.avatar && contact.avatar !== '✓' ? contact.avatar : avatarInitials || <UserCircle className="w-4 h-4" />}
            </div>
            <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold truncate ${selected ? "text-foreground" : "text-foreground"}`}>
                    {displayName}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">{roleLabel}</p>
            </div>
            {selected && (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            )}
        </button>
    );
});
ContactCard.displayName = "ContactCard";

StudentSupportSelector.displayName = "StudentSupportSelector";

export default StudentSupportSelector;
