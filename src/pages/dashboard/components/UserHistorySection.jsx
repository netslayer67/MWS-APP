import React, { memo, useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { Calendar, TrendingUp, Heart, Cloud, Users, ChevronDown, ChevronUp } from "lucide-react";
import { fetchUserCheckinHistory } from "../../../store/slices/dashboardSlice";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const UserHistorySection = memo(function UserHistorySection({ userId }) {
    const dispatch = useDispatch();
    const { userCheckinHistory, loading } = useSelector((state) => state.dashboard);
    const [expandedItems, setExpandedItems] = useState(new Set());
    const [currentOffset, setCurrentOffset] = useState(0);
    const limit = 20;

    useEffect(() => {
        if (userId) {
            dispatch(fetchUserCheckinHistory({ userId, limit, offset: currentOffset }));
        }
    }, [dispatch, userId, currentOffset]);

    const toggleExpanded = useCallback((id) => {
        setExpandedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    }, []);

    const loadMore = useCallback(() => {
        if (userCheckinHistory?.pagination?.hasMore) {
            setCurrentOffset(prev => prev + limit);
        }
    }, [userCheckinHistory?.pagination?.hasMore]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getWeatherIcon = (weatherType) => {
        const iconMap = {
            'sunny': '☀️',
            'partly-cloudy': '⛅',
            'cloudy': '☁️',
            'rainy': '🌧️',
            'stormy': '⛈️',
            'snowy': '❄️'
        };
        return iconMap[weatherType] || '⛅';
    };

    if (loading && !userCheckinHistory) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Check-in History
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
                                <div className="h-3 bg-muted rounded w-3/4"></div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!userCheckinHistory?.checkins?.length) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Check-in History
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                        <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No check-in history available</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Check-in History
                    <Badge variant="secondary" className="ml-auto">
                        {userCheckinHistory.pagination.total} total
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {userCheckinHistory.checkins.map((checkin, index) => (
                        <motion.div
                            key={checkin.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{getWeatherIcon(checkin.weatherType)}</span>
                                    <div>
                                        <p className="font-medium text-sm">
                                            {formatDate(checkin.date)}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Submitted {formatDate(checkin.submittedAt)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs">
                                        P: {checkin.presenceLevel}/10
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                        C: {checkin.capacityLevel}/10
                                    </Badge>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => toggleExpanded(checkin.id)}
                                        className="h-6 w-6 p-0"
                                    >
                                        {expandedItems.has(checkin.id) ?
                                            <ChevronUp className="w-4 h-4" /> :
                                            <ChevronDown className="w-4 h-4" />
                                        }
                                    </Button>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-1 mb-2">
                                {checkin.selectedMoods.map((mood, i) => (
                                    <Badge key={i} variant="secondary" className="text-xs">
                                        {mood}
                                    </Badge>
                                ))}
                            </div>

                            {expandedItems.has(checkin.id) && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mt-3 pt-3 border-t space-y-2"
                                >
                                    {checkin.details && (
                                        <div>
                                            <p className="text-sm font-medium mb-1">Details:</p>
                                            <p className="text-sm text-muted-foreground">{checkin.details}</p>
                                        </div>
                                    )}

                                    {checkin.aiAnalysis && (
                                        <div>
                                            <p className="text-sm font-medium mb-1">AI Analysis:</p>
                                            <div className="text-sm text-muted-foreground">
                                                {checkin.aiAnalysis.emotionalState && (
                                                    <p>Emotional State: {checkin.aiAnalysis.emotionalState}</p>
                                                )}
                                                {checkin.aiAnalysis.needsSupport && (
                                                    <p className="text-amber-600">⚠️ Support needed</p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {checkin.supportContact && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <Users className="w-4 h-4" />
                                            <span>Support Contact: {checkin.supportContact.name}</span>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </motion.div>
                    ))}
                </div>

                {userCheckinHistory?.pagination?.hasMore && (
                    <div className="mt-6 text-center">
                        <Button
                            onClick={loadMore}
                            disabled={loading}
                            variant="outline"
                        >
                            {loading ? 'Loading...' : 'Load More'}
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
});

UserHistorySection.displayName = 'UserHistorySection';

export default UserHistorySection;