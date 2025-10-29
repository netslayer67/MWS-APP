import React, { memo } from "react";
import { MessageCircle, User, CheckCircle } from "lucide-react";

const CheckInRequests = memo(({ requests }) => {
    if (!requests || requests.length === 0) return null;

    return (
        <div className="glass glass-card hover-lift transition-all duration-300">
            <div className="glass__refract" />
            <div className="glass__noise" />

            <div className="relative z-10 p-4 md:p-6">
                <div className="flex items-center gap-2 mb-4">
                    <MessageCircle className="w-4 h-4 text-primary" />
                    <h2 className="text-base md:text-lg font-semibold text-foreground">
                        Check-in Requests
                    </h2>
                </div>

                <div className="space-y-3">
                    {requests.map((request, index) => (
                        <div
                            key={index}
                            className="glass glass-card transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                        >
                            <div className="glass__refract" />
                            <div className="glass__noise" />

                            <div className="relative z-10 p-3 md:p-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                                        <User className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-semibold text-foreground text-sm md:text-base">
                                                {request.contact}
                                            </span>
                                            <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${request.status === 'handled' || request.status === 'acknowledged'
                                                    ? 'text-green-700 bg-green-100'
                                                    : 'text-orange-700 bg-orange-100'
                                                }`}>
                                                {request.status === 'handled' || request.status === 'acknowledged' ? (
                                                    <>
                                                        <CheckCircle className="w-3 h-3" />
                                                        completed
                                                    </>
                                                ) : (
                                                    'requested'
                                                )}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            by {request.requestedBy}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
});

CheckInRequests.displayName = 'CheckInRequests';
export default CheckInRequests;