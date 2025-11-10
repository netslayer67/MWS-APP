import React, { memo, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getCheckinHistory } from "../../../store/slices/checkinSlice";
import { User, TrendingUp, Calendar, MessageCircle, Heart, Activity, BarChart3, Brain } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Progress } from "../../../components/ui/progress";

const IndividualView = memo(({ selectedUser, targetUserId }) => {
    const dispatch = useDispatch();
    const { user: currentUser } = useSelector((state) => state.auth);
    const { checkinHistory } = useSelector((state) => state.checkin);

    const resolvedUser = useMemo(() => {
        if (selectedUser) {
            return selectedUser;
        }
        if (targetUserId) {
            return { id: targetUserId };
        }
        return currentUser || null;
    }, [selectedUser, targetUserId, currentUser]);

    const resolvedUserId = useMemo(() => {
        return (
            resolvedUser?.id?.toString() ||
            resolvedUser?._id?.toString() ||
            targetUserId?.toString() ||
            currentUser?._id?.toString() ||
            currentUser?.id?.toString() ||
            ''
        );
    }, [resolvedUser, targetUserId, currentUser]);

    useEffect(() => {
        if (resolvedUserId) {
            dispatch(getCheckinHistory({
                page: 1,
                limit: 100,
                userId: resolvedUserId
            }));
        }
    }, [dispatch, resolvedUserId]);

    const userCheckins = useMemo(() => {
        if (!resolvedUserId || !checkinHistory) return [];
        const data = checkinHistory.data || checkinHistory;
        return Array.isArray(data) ? data : (data.checkins || []);
    }, [resolvedUserId, checkinHistory]);

    const weeklyTrends = useMemo(() => {
        if (userCheckins.length === 0) return null;

        const last7Days = userCheckins.slice(0, 7);
        const avgPresence = last7Days.reduce((sum, c) => sum + c.presenceLevel, 0) / last7Days.length;
        const avgCapacity = last7Days.reduce((sum, c) => sum + c.capacityLevel, 0) / last7Days.length;

        const moodFrequency = {};
        last7Days.forEach(checkin => {
            checkin.selectedMoods?.forEach(mood => {
                moodFrequency[mood] = (moodFrequency[mood] || 0) + 1;
            });
        });

        const topMoods = Object.entries(moodFrequency)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3);

        return {
            avgPresence: Math.round(avgPresence * 10) / 10,
            avgCapacity: Math.round(avgCapacity * 10) / 10,
            topMoods,
            checkinCount: last7Days.length,
            trend: avgPresence > 6 ? 'improving' : avgPresence < 4 ? 'concerning' : 'stable'
        };
    }, [userCheckins]);

    const recentReflections = useMemo(() => {
        return userCheckins
            .filter(checkin => checkin.details)
            .slice(0, 5)
            .map(checkin => ({
                date: new Date(checkin.date).toLocaleDateString(),
                details: checkin.details,
                weatherType: checkin.weatherType,
                moods: checkin.selectedMoods
            }));
    }, [userCheckins]);

    if (!resolvedUser) {
        return (
            <Card>
                <CardContent className="text-center py-16">
                    <div className="w-20 h-20 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-6">
                        <BarChart3 className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">Individual User Analytics</h3>
                    <p className="text-muted-foreground text-base leading-relaxed">
                        Unable to load the requested user report. Please try again from the dashboard.
                    </p>
                </CardContent>
            </Card>
        );
    }

    if (userCheckins.length === 0) {
        return (
            <Card>
                <CardContent className="text-center py-16">
                    <div className="w-20 h-20 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-6">
                        <BarChart3 className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">Individual User Analytics</h3>
                    <p className="text-muted-foreground text-base leading-relaxed">
                        {`${resolvedUser?.name || 'This user'} belum memiliki catatan check-in emosional.`}
                    </p>
                    <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                        <p className="text-sm text-primary font-medium">
                            Tip: Dorong pengguna ini untuk melakukan check-in pertama mereka agar dapat memantau kesejahteraan emosionalnya.
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        {resolvedUser.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">Detailed emotional wellness analysis for this user</p>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="text-center p-3 bg-primary/5 rounded-lg">
                            <div className="text-xl font-bold text-primary">{userCheckins.length}</div>
                            <div className="text-xs text-muted-foreground">Total Check-ins</div>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                            <div className="text-xl font-bold text-green-600">{weeklyTrends?.avgPresence || 0}</div>
                            <div className="text-xs text-muted-foreground">Avg Presence</div>
                        </div>
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <div className="text-xl font-bold text-blue-600">{weeklyTrends?.avgCapacity || 0}</div>
                            <div className="text-xs text-muted-foreground">Avg Capacity</div>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                            <div className="text-xl font-bold text-purple-600">
                                {userCheckins.filter(c => c.aiAnalysis?.needsSupport).length}
                            </div>
                            <div className="text-xs text-muted-foreground">Support Flags</div>
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <h4 className="font-medium mb-3 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Latest Check-in
                        </h4>
                        {userCheckins[0] && (
                            <div className="bg-muted/30 p-3 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium">
                                        {new Date(userCheckins[0].date).toLocaleDateString()}
                                    </span>
                                    <Badge variant="outline" className="text-xs">
                                        {userCheckins[0].weatherType}
                                    </Badge>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>Presence: <span className="font-medium">{userCheckins[0].presenceLevel}/10</span></div>
                                    <div>Capacity: <span className="font-medium">{userCheckins[0].capacityLevel}/10</span></div>
                                </div>
                                {userCheckins[0].selectedMoods?.length > 0 && (
                                    <div className="mt-2 flex gap-1">
                                        {userCheckins[0].selectedMoods.slice(0, 3).map((mood) => (
                                            <Badge key={mood} variant="secondary" className="text-xs">
                                                {mood}
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        Weekly Wellness Snapshot
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                                <span>Presence trend</span>
                                <span>{weeklyTrends?.avgPresence || 0}/10</span>
                            </div>
                            <Progress value={(weeklyTrends?.avgPresence || 0) * 10} className="h-2" />
                        </div>
                        <div>
                            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                                <span>Capacity trend</span>
                                <span>{weeklyTrends?.avgCapacity || 0}/10</span>
                            </div>
                            <Progress value={(weeklyTrends?.avgCapacity || 0) * 10} className="h-2" />
                        </div>
                    </div>

                    {weeklyTrends?.topMoods?.length > 0 && (
                        <div className="pt-2">
                            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-2">
                                <Heart className="w-3.5 h-3.5" />
                                Dominant moods this week
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {weeklyTrends.topMoods.map(([mood, count]) => (
                                    <Badge key={mood} variant="outline" className="text-xs">
                                        {mood} - {count}x
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {recentReflections.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MessageCircle className="w-5 h-5" />
                            Recent Reflections
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {recentReflections.map((reflection, index) => (
                            <div key={index} className="p-3 rounded-lg border border-border/40 bg-card/30">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium">{reflection.date}</span>
                                    {reflection.weatherType && (
                                        <Badge variant="outline" className="text-xs">{reflection.weatherType}</Badge>
                                    )}
                                </div>
                                <p className="text-sm text-muted-foreground leading-relaxed">{reflection.details}</p>
                                {reflection.moods?.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-1">
                                        {reflection.moods.map((mood) => (
                                            <Badge key={mood} variant="secondary" className="text-xs">
                                                {mood}
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}
        </div>
    );
});

IndividualView.displayName = 'IndividualView';

export default IndividualView;



