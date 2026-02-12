import React, { memo, useMemo, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSupportContacts } from "../../store/slices/supportSlice";
import {
    mapSupportContacts,
    isNoNeedSelection,
} from "./supportSelectorUtils";
import {
    SupportHeader,
    SupportSelect,
    SelectedSupportPersonCard,
    NoNeedSupportCard,
    SupportEmptyState,
    TeamAvailableBadge,
} from "./SupportSelectorParts";

const buildFallbackPerson = (internalSelection) => ({
    name: internalSelection,
    displayValue: internalSelection,
    value: internalSelection,
    role: "Support Contact",
    department: "N/A",
    jobLevel: "N/A",
    unit: "N/A",
    jobPosition: "N/A",
    avatar: internalSelection ? internalSelection.charAt(0).toUpperCase() : "?",
});

const SupportSelector = memo(({ supportContact, onSupportChange }) => {
    const dispatch = useDispatch();
    const { contacts, loading } = useSelector((state) => state.support);
    const { isAuthenticated } = useSelector((state) => state.auth);

    const [internalSelection, setInternalSelection] = useState(supportContact || "");

    useEffect(() => {
        if (contacts.length === 0 && isAuthenticated && !loading) {
            const timer = setTimeout(() => {
                dispatch(fetchSupportContacts());
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [dispatch, contacts.length, isAuthenticated, loading]);

    const supportContacts = useMemo(
        () => mapSupportContacts(contacts),
        [contacts]
    );

    useEffect(() => {
        if (!supportContact) {
            setInternalSelection("");
            return;
        }
        const match = supportContacts.find(
            (c) => c.name === supportContact || c.value === supportContact
        );
        setInternalSelection(match ? match.value : supportContact);
    }, [supportContact, supportContacts]);

    const selectedPerson = useMemo(() => {
        const found = supportContacts.find((c) => c.value === internalSelection || c.name === internalSelection);
        return found || buildFallbackPerson(internalSelection);
    }, [internalSelection, supportContacts]);

    const hasSelection = !!internalSelection;
    const isNoNeed = isNoNeedSelection(internalSelection);

    const handleInternalChange = (value) => {
        setInternalSelection(value);
        onSupportChange?.(value);
    };

    return (
        <div className="bg-gradient-to-br from-white via-gray-50 to-blue-50 dark:from-gray-800/50 dark:via-gray-800/30 dark:to-blue-900/20 border-2 border-gray-200 dark:border-gray-700 rounded-3xl p-6 sm:p-5 space-y-5 sm:space-y-4 shadow-xl">
            <SupportHeader />

            <SupportSelect
                value={internalSelection}
                onChange={handleInternalChange}
                hasSelection={hasSelection}
                supportContacts={supportContacts}
                loading={loading}
            />

            {hasSelection && !isNoNeed && selectedPerson?.id !== "no-need" && (
                <SelectedSupportPersonCard selectedPerson={selectedPerson} />
            )}

            {isNoNeed && <NoNeedSupportCard />}
            {!hasSelection && <SupportEmptyState />}
            <TeamAvailableBadge />
        </div>
    );
});

SupportSelector.displayName = "SupportSelector";

export default SupportSelector;
