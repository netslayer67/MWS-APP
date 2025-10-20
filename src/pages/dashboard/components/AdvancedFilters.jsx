import React, { memo, useState } from "react";
import { Filter, X, Search, Users, Building, Calendar } from "lucide-react";

const AdvancedFilters = memo(({ onFiltersChange, currentFilters = {} }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [filters, setFilters] = useState(currentFilters);

    const roleOptions = [
        { value: 'student', label: 'Students' },
        { value: 'staff', label: 'Staff' },
        { value: 'teacher', label: 'Teachers' },
        { value: 'admin', label: 'Admins' },
        { value: 'directorate', label: 'Directorate' }
    ];

    const departmentOptions = [
        { value: 'Academic', label: 'Academic' },
        { value: 'Student Affairs', label: 'Student Affairs' },
        { value: 'Finance', label: 'Finance' },
        { value: 'HR', label: 'Human Resources' },
        { value: 'IT', label: 'Information Technology' },
        { value: 'Operations', label: 'Operations' }
    ];

    const moodOptions = [
        { value: 'happy', label: 'Happy' },
        { value: 'excited', label: 'Excited' },
        { value: 'calm', label: 'Calm' },
        { value: 'hopeful', label: 'Hopeful' },
        { value: 'tired', label: 'Tired' },
        { value: 'anxious', label: 'Anxious' },
        { value: 'sad', label: 'Sad' },
        { value: 'overwhelmed', label: 'Overwhelmed' }
    ];

    const weatherOptions = [
        { value: 'sunny', label: 'Sunny' },
        { value: 'cloudy', label: 'Cloudy' },
        { value: 'rain', label: 'Rain' },
        { value: 'storm', label: 'Storm' },
        { value: 'tornado', label: 'Tornado' },
        { value: 'snow', label: 'Snow' }
    ];

    const handleFilterChange = (category, value) => {
        const newFilters = { ...filters };
        if (!newFilters[category]) {
            newFilters[category] = [];
        }

        if (newFilters[category].includes(value)) {
            newFilters[category] = newFilters[category].filter(item => item !== value);
        } else {
            newFilters[category].push(value);
        }

        // Remove empty arrays
        if (newFilters[category].length === 0) {
            delete newFilters[category];
        }

        setFilters(newFilters);
        onFiltersChange(newFilters);
    };

    const clearFilters = () => {
        setFilters({});
        onFiltersChange({});
    };

    const activeFilterCount = Object.values(filters).reduce((count, arr) => count + arr.length, 0);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${activeFilterCount > 0
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-card text-foreground border-border hover:bg-card/80'
                    }`}
            >
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">Advanced Filters</span>
                {activeFilterCount > 0 && (
                    <span className="bg-destructive text-destructive-foreground text-xs px-2 py-1 rounded-full">
                        {activeFilterCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute top-full mt-2 right-0 z-50 w-96 bg-card border border-border rounded-xl shadow-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-foreground">Filter Dashboard Data</h3>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1 hover:bg-muted rounded"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="space-y-6">
                        {/* Role Filter */}
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <Users className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm font-medium text-foreground">Role</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {roleOptions.map(option => (
                                    <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={filters.role?.includes(option.value) || false}
                                            onChange={() => handleFilterChange('role', option.value)}
                                            className="rounded border-border"
                                        />
                                        <span className="text-sm text-foreground">{option.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Department Filter */}
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <Building className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm font-medium text-foreground">Department</span>
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                                {departmentOptions.map(option => (
                                    <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={filters.department?.includes(option.value) || false}
                                            onChange={() => handleFilterChange('department', option.value)}
                                            className="rounded border-border"
                                        />
                                        <span className="text-sm text-foreground">{option.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Mood Filter */}
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-sm font-medium text-foreground">Moods</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {moodOptions.map(option => (
                                    <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={filters.mood?.includes(option.value) || false}
                                            onChange={() => handleFilterChange('mood', option.value)}
                                            className="rounded border-border"
                                        />
                                        <span className="text-sm text-foreground">{option.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Weather Filter */}
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-sm font-medium text-foreground">Weather Types</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {weatherOptions.map(option => (
                                    <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={filters.weather?.includes(option.value) || false}
                                            onChange={() => handleFilterChange('weather', option.value)}
                                            className="rounded border-border"
                                        />
                                        <span className="text-sm text-foreground">{option.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Support Status Filter */}
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-sm font-medium text-foreground">Support Status</span>
                            </div>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={filters.needsSupport?.includes('true') || false}
                                        onChange={() => handleFilterChange('needsSupport', 'true')}
                                        className="rounded border-border"
                                    />
                                    <span className="text-sm text-foreground">Needs Support</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={filters.needsSupport?.includes('false') || false}
                                        onChange={() => handleFilterChange('needsSupport', 'false')}
                                        className="rounded border-border"
                                    />
                                    <span className="text-sm text-foreground">No Support Needed</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
                        <button
                            onClick={clearFilters}
                            className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Clear All
                        </button>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                        >
                            Apply Filters
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
});

AdvancedFilters.displayName = 'AdvancedFilters';

export default AdvancedFilters;