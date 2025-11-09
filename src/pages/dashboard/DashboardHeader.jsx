import React, { memo } from "react";
import { Calendar, Filter } from "lucide-react";
import { periodOptions } from "./utils";

const DashboardHeader = memo(({ selectedPeriod, onPeriodChange, selectedDate, onDateChange, isHeadUnit, userUnit }) => {

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const isDatePickerDisabled = selectedPeriod === 'all';

    return (
        <div className="mb-4 md:mb-6">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-primary/15 to-primary/10 border border-primary/30 flex items-center justify-center">
                        <Calendar className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">
                            {isHeadUnit ? `Unit Dashboard - ${userUnit || 'Your Unit'}` : 'Daily Check-in Dashboard'}
                        </h1>
                        <p className="text-xs md:text-sm text-muted-foreground">
                            {isHeadUnit
                                ? `Monitor your team's wellness and emotional well-being`
                                : 'Monitor staff wellness and emotional well-being'
                            }
                        </p>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-3">
                {/* Report Type Selector */}
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">Report Type:</span>
                    <div className="flex items-center gap-2">
                        {periodOptions.map(({ id, label }) => (
                            <button
                                key={id}
                                onClick={() => onPeriodChange(id)}
                                className={`
                                    px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium flex-shrink-0
                                    transition-all duration-300 ease-premium
                                    ${selectedPeriod === id
                                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                                        : 'bg-card/50 text-muted-foreground border border-border/50 hover:border-primary/40 hover:bg-card/80'
                                    }
                                `}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Date Selector */}
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">Select Date:</span>
                    <div className="relative">
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => onDateChange(e.target.value)}
                            disabled={isDatePickerDisabled}
                            className={`flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-card/50 border border-border/50 rounded-lg transition-all duration-300 text-sm text-foreground
                                ${isDatePickerDisabled
                                    ? 'opacity-60 cursor-not-allowed'
                                    : 'hover:border-primary/40 hover:bg-card/80'}
                            `}
                        />
                        {isDatePickerDisabled && (
                            <p className="text-[10px] mt-1 text-muted-foreground">Showing entire emotional history</p>
                        )}
                    </div>
                </div>

                {/* View Toggle */}
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">View:</span>
                    <button className="px-3 py-1.5 md:px-4 md:py-2 bg-primary text-primary-foreground rounded-lg text-xs md:text-sm font-medium">
                        {isHeadUnit ? 'Unit Summary' : 'Summary'}
                    </button>
                </div>
            </div>
        </div>
    );
});

DashboardHeader.displayName = 'DashboardHeader';
export default DashboardHeader;
