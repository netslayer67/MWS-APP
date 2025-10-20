import React, { memo } from "react";
import { AlertTriangle, CheckCircle, Info, AlertCircle } from "lucide-react";

const InsightsPanel = memo(({ insights = [] }) => {
    if (!insights || insights.length === 0) return null;

    const getIcon = (type) => {
        switch (type) {
            case 'success':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'warning':
                return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
            case 'alert':
                return <AlertCircle className="w-5 h-5 text-red-500" />;
            default:
                return <Info className="w-5 h-5 text-blue-500" />;
        }
    };

    const getBgColor = (type) => {
        switch (type) {
            case 'success':
                return 'bg-green-50 border-green-200';
            case 'warning':
                return 'bg-yellow-50 border-yellow-200';
            case 'alert':
                return 'bg-red-50 border-red-200';
            default:
                return 'bg-blue-50 border-blue-200';
        }
    };

    return (
        <div className="mb-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">AI Insights & Recommendations</h3>
            <div className="space-y-3">
                {insights.map((insight, index) => (
                    <div
                        key={index}
                        className={`p-4 rounded-lg border ${getBgColor(insight.type)}`}
                    >
                        <div className="flex items-start gap-3">
                            {getIcon(insight.type)}
                            <div className="flex-1">
                                <h4 className="font-medium text-foreground mb-1">
                                    {insight.title}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                    {insight.message}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
});

InsightsPanel.displayName = 'InsightsPanel';

export default InsightsPanel;