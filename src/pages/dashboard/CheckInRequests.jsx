import React, { memo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, User, CheckCircle, Check, X } from "lucide-react";
import { useDispatch } from "react-redux";
import { removeFlaggedUser } from "../../store/slices/dashboardSlice";
import { toast } from "../../components/ui/use-toast";

const CheckInRequests = memo(({ requests, isHeadUnit }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [processingRequests, setProcessingRequests] = useState(new Set());

    const handleConfirmAction = async (requestId, action) => {
        if (processingRequests.has(requestId)) return;

        setProcessingRequests(prev => new Set(prev).add(requestId));

        try {
            // Here you would call the API to confirm the action
            // For now, we'll simulate the action and update the UI
            console.log(`Confirming ${action} for request ${requestId}`);

            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Update the request status locally (in a real app, this would come from the API response)
            // For now, we'll just show a success message
            toast({
                title: "Action Confirmed",
                description: `Check-in request has been ${action === 'handled' ? 'handled' : 'acknowledged'}.`,
            });

            // Remove from flagged users if handled
            if (action === 'handled') {
                dispatch(removeFlaggedUser(requestId));
            }

        } catch (error) {
            console.error('Error confirming action:', error);
            toast({
                title: "Error",
                description: "Failed to confirm action. Please try again.",
                variant: "destructive",
            });
        } finally {
            setProcessingRequests(prev => {
                const newSet = new Set(prev);
                newSet.delete(requestId);
                return newSet;
            });
        }
    };

    if (!requests || requests.length === 0) return null;

    return (
        <div className="glass glass-card hover-lift transition-all duration-300">
            <div className="glass__refract" />
            <div className="glass__noise" />

            <div className="relative z-10 p-4 md:p-6">
                <div className="flex items-center gap-2 mb-2">
                    <MessageCircle className="w-4 h-4 text-primary" />
                    <h2 className="text-base md:text-lg font-semibold text-foreground">
                        Check-in Requests
                    </h2>
                </div>
                <p className="text-xs md:text-sm text-muted-foreground mb-4">
                    {isHeadUnit
                        ? 'Unit members who selected you as their support contact'
                        : 'Teacher/Staff/Student (automatically created when someone requested to be checked-in with you)'
                    }
                </p>

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
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-2">
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
                                            {request.status !== 'handled' && request.status !== 'acknowledged' && (
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleConfirmAction(request.id, 'acknowledged');
                                                        }}
                                                        disabled={processingRequests.has(request.id)}
                                                        className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                                    >
                                                        <Check className="w-3 h-3" />
                                                        Acknowledge
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleConfirmAction(request.id, 'handled');
                                                        }}
                                                        disabled={processingRequests.has(request.id)}
                                                        className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                                    >
                                                        <CheckCircle className="w-3 h-3" />
                                                        Handled
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => navigate(`/emotional-wellness/${request.userId}`)}
                                            className="text-sm text-muted-foreground hover:text-primary hover:underline transition-colors text-left"
                                        >
                                            by {request.requestedBy}
                                        </button>
                                        {request.weatherType && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Weather: {request.weatherType} • Presence: {request.presenceLevel}/10 • Capacity: {request.capacityLevel}/10
                                            </p>
                                        )}
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