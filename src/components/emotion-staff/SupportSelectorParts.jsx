import React, { memo } from "react";
import { Users, UserCheck, CheckCircle2, ChevronDown } from "lucide-react";

export const SupportHeader = memo(() => (
    <div className="text-center space-y-3 sm:space-y-2 sm:text-left">
        <div className="flex items-center justify-center sm:justify-start gap-3">
            <div className="flex-shrink-0 w-14 h-14 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40 border-2 border-emerald-300 dark:border-emerald-600 flex items-center justify-center shadow-lg">
                <Users className="w-7 h-7 sm:w-6 sm:h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0 hidden sm:block">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2"><span>💚</span> Need Support?</h3>
                <p className="text-sm text-foreground/70">Select someone to check in with you today</p>
            </div>
        </div>
        <div className="sm:hidden">
            <h3 className="text-xl font-bold text-foreground flex items-center justify-center gap-2"><span>💚</span> Need Support?</h3>
            <p className="text-sm text-foreground/70 mt-2">Select someone to check in with you today</p>
        </div>
    </div>
));

export const SupportSelect = memo(({ value, onChange, hasSelection, supportContacts, loading }) => (
    <div className="relative">
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={loading || supportContacts.length === 0}
            className={`w-full px-4 sm:px-4 py-4 sm:py-3.5 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800/50 dark:to-gray-900/50 border-2 rounded-2xl text-base sm:text-sm text-foreground appearance-none cursor-pointer transition-all duration-300 shadow-md ${hasSelection ? "border-emerald-400 dark:border-emerald-600 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 shadow-emerald-200 dark:shadow-emerald-900/50" : "border-gray-300 dark:border-gray-600 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-lg"} focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-300 dark:focus:ring-emerald-700 ${loading || supportContacts.length === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
        >
            <option value="">{loading ? "⏳ Loading..." : supportContacts.length === 0 ? "❌ No contacts available" : "👥 Choose a team member..."}</option>
            {supportContacts.map((contact) => (
                <option key={contact.id} value={contact.value}>{contact.displayValue}</option>
            ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <ChevronDown className={`w-5 h-5 sm:w-4 sm:h-4 transition-colors ${hasSelection ? "text-emerald-600 dark:text-emerald-400" : "text-foreground/50"}`} />
        </div>
    </div>
));

export const SelectedSupportPersonCard = memo(({ selectedPerson }) => (
    <div className="p-5 sm:p-4 rounded-2xl bg-gradient-to-br from-emerald-100 via-teal-100 to-green-100 dark:from-emerald-900/40 dark:via-teal-900/40 dark:to-green-900/40 border-2 border-emerald-300 dark:border-emerald-600 shadow-lg">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-3 text-center sm:text-left">
            <div className="flex-shrink-0 w-16 h-16 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-emerald-200 to-teal-200 dark:from-emerald-700 dark:to-teal-700 flex items-center justify-center shadow-md border-2 border-emerald-400 dark:border-emerald-500">
                <span className="text-2xl sm:text-lg font-bold text-emerald-800 dark:text-emerald-100">{selectedPerson.avatar}</span>
            </div>
            <div className="flex-1 min-w-0 space-y-2 sm:space-y-1">
                <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2">
                    <UserCheck className="w-5 h-5 sm:w-4 sm:h-4 text-emerald-700 dark:text-emerald-300 flex-shrink-0" />
                    <p className="text-lg sm:text-base font-bold text-emerald-800 dark:text-emerald-200 truncate">{selectedPerson.displayValue || selectedPerson.displayName || selectedPerson.name}</p>
                </div>
                <p className="text-sm sm:text-xs text-emerald-700 dark:text-emerald-300 leading-relaxed">
                    ✨ We'll arrange for <span className="font-semibold">{selectedPerson.displayValue || selectedPerson.displayName || selectedPerson.name}</span> to connect with you today.
                </p>
            </div>
        </div>
    </div>
));

export const NoNeedSupportCard = memo(() => (
    <div className="p-5 sm:p-4 rounded-2xl bg-gradient-to-br from-green-100 via-emerald-100 to-teal-100 dark:from-green-900/40 dark:via-emerald-900/40 dark:to-teal-900/40 border-2 border-green-300 dark:border-green-600 shadow-lg">
        <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-4 sm:gap-3">
            <div className="flex-shrink-0 w-14 h-14 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-green-200 to-emerald-200 dark:from-green-700 dark:to-emerald-700 flex items-center justify-center shadow-md border-2 border-green-400 dark:border-green-500">
                <CheckCircle2 className="w-7 h-7 sm:w-5 sm:h-5 text-green-800 dark:text-green-100 flex-shrink-0" />
            </div>
            <div className="flex-1 space-y-2 sm:space-y-1">
                <p className="text-lg sm:text-base font-bold text-green-800 dark:text-green-200 flex items-center justify-center sm:justify-start gap-2"><span>🎉</span> Great! You're feeling supported</p>
                <p className="text-sm sm:text-xs text-green-700 dark:text-green-300 leading-relaxed">Remember, our team is always here when you need us.</p>
            </div>
        </div>
    </div>
));

export const SupportEmptyState = memo(() => (
    <div className="p-5 sm:p-4 rounded-2xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/30 dark:via-indigo-900/30 dark:to-purple-900/30 border-2 border-blue-200 dark:border-blue-700 shadow-md">
        <div className="flex flex-col sm:flex-row items-start text-center sm:text-left gap-4 sm:gap-3">
            <div className="flex-shrink-0 w-12 h-12 sm:w-8 sm:h-8 rounded-2xl bg-gradient-to-br from-blue-200 to-indigo-200 dark:from-blue-700 dark:to-indigo-700 flex items-center justify-center mx-auto sm:mx-0 shadow-sm border-2 border-blue-300 dark:border-blue-600">
                <span className="text-2xl sm:text-base">💬</span>
            </div>
            <div className="flex-1">
                <p className="text-sm sm:text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
                    <span className="font-bold text-blue-900 dark:text-blue-100">💡 Tip:</span> Select a team member if you'd like someone to check in with you, or choose "No Need" if you're feeling well-supported today.
                </p>
            </div>
        </div>
    </div>
));

export const TeamAvailableBadge = memo(() => (
    <div className="flex items-center justify-center gap-2.5 pt-3 sm:pt-2">
        <div className="w-2.5 h-2.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 dark:bg-emerald-400" />
        <p className="text-sm sm:text-xs text-foreground/70 font-medium">🌟 Our support team is available today</p>
    </div>
));
