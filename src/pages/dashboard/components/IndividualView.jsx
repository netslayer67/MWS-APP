import React, { memo, useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers } from "../../../store/slices/userSlice";
import { getCheckinHistory } from "../../../store/slices/checkinSlice";
import { User, TrendingUp, Calendar, MessageCircle, Heart, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Badge } from "../../../components/ui/badge";
import { Progress } from "../../../components/ui/progress";

const IndividualView = memo(({ selectedUser, onUserSelect, selectedPeriod, loading }) => {
    const dispatch = useDispatch();
    const { users } = useSelector((state) => state.users);
    const { checkinHistory } = useSelector((state) => state.checkin);

    const [selectedUserId, setSelectedUserId] = useState(selectedUser?.id || '');

    useEffect(() => {
        // Fetch users if not already loaded
        if (users.length === 0) {
            dispatch(fetchUsers());
        }
    }, [dispatch, users.length]);

    useEffect(() => {
        // Fetch check-in history when user is selected
        if (selectedUserId) {
            dispatch(getCheckinHistory({
                page: 1,
                limit: 50 // Get more data for trend analysis
            }));
        }
    }, [dispatch, selectedUserId]);

    const handleUserChange = (userId) => {
        setSelectedUserId(userId);
        const user = users.find(u => u.id === userId);
        onUserSelect(user);
    };

    // Filter check-ins for selected user
    const userCheckins = useMemo(() => {
        if (!selectedUserId || !checkinHistory) return [];
        return checkinHistory.filter(checkin => checkin.userId === selectedUserId);
    }, [selectedUserId, checkinHistory]);

    // Calculate weekly trends
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

    // Get recent reflections
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

    const selectedUserData = users.find(u => u.id === selectedUserId);

    return (
        <div className="space-y-6">
            {/* User Selection */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Select User for Individual Analysis
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Select value={selectedUserId} onValueChange={handleUserChange}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Choose a user to analyze..." />
                        </SelectTrigger>
                        <SelectContent>
                            {users.map((user) => (
                                <SelectItem key={user.id} value={user.id}>
                                    {user.name} — {user.role} {user.department && `(${user.department})`}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            {selectedUserData && (
                <>
                    {/* User Overview */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="w-5 h-5" />
                                {selectedUserData.name}'s Emotional Wellness Overview
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-primary">
                                        {userCheckins.length}
                                    </div>
                                    <div className="text-sm text-muted-foreground">Total Check-ins</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-600">
                                        {weeklyTrends?.avgPresence || 'N/A'}
                                    </div>
                                    <div className="text-sm text-muted-foreground">Avg Presence (7d)</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">
                                        {weeklyTrends?.avgCapacity || 'N/A'}
                                    </div>
                                    <div className="text-sm text-muted-foreground">Avg Capacity (7d)</div>
                                </div>
                            </div>

                            {weeklyTrends && (
                                <div className="mt-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <TrendingUp className="w-4 h-4" />
                                        <span className="font-medium">Weekly Trend:</span>
                                        <Badge variant={
                                            weeklyTrends.trend === 'improving' ? 'default' :
                                                weeklyTrends.trend === 'concerning' ? 'destructive' : 'secondary'
                                        }>
                                            {weeklyTrends.trend}
                                        </Badge>
                                    </div>

                                    <div className="space-y-2">
                                        <div>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span>Presence Level</span>
                                                <span>{weeklyTrends.avgPresence}/10</span>
                                            </div>
                                            <Progress value={weeklyTrends.avgPresence * 10} className="h-2" />
                                        </div>
                                        <div>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span>Capacity Level</span>
                                                <span>{weeklyTrends.avgCapacity}/10</span>
                                            </div>
                                            <Progress value={weeklyTrends.avgCapacity * 10} className="h-2" />
                                        </div>
                                    </div>

                                    {weeklyTrends.topMoods.length > 0 && (
                                        <div className="mt-4">
                                            <span className="font-medium text-sm">Most Common Moods (7 days):</span>
                                            <div className="flex gap-2 mt-2">
                                                {weeklyTrends.topMoods.map(([mood, count]) => (
                                                    <Badge key={mood} variant="outline">
                                                        {mood} ({count})
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Reflections */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MessageCircle className="w-5 h-5" />
                                Recent Reflections & Thoughts
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {recentReflections.length > 0 ? (
                                <div className="space-y-4">
                                    {recentReflections.map((reflection, index) => (
                                        <div key={index} className="border-l-4 border-primary/20 pl-4 py-2">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                                <span className="text-sm text-muted-foreground">{reflection.date}</span>
                                                <Badge variant="outline" className="text-xs">
                                                    {reflection.weatherType}
                                                </Badge>
                                            </div>
                                            <p className="text-sm mb-2">{reflection.details}</p>
                                            {reflection.moods && reflection.moods.length > 0 && (
                                                <div className="flex gap-1">
                                                    {reflection.moods.map((mood) => (
                                                        <Badge key={mood} variant="secondary" className="text-xs">
                                                            {mood}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>No reflections recorded yet</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Emotional Patterns */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="w-5 h-5" />
                                Emotional Patterns & Insights
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {userCheckins.length > 0 ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <h4 className="font-medium mb-2">Weather Patterns</h4>
                                            <div className="space-y-1 text-sm">
                                                {Object.entries(
                                                    userCheckins.reduce((acc, checkin) => {
                                                        acc[checkin.weatherType] = (acc[checkin.weatherType] || 0) + 1;
                                                        return acc;
                                                    }, {})
                                                ).sort(([, a], [, b]) => b - a).slice(0, 3).map(([weather, count]) => (
                                                    <div key={weather} className="flex justify-between">
                                                        <span>{weather}</span>
                                                        <span className="text-muted-foreground">{count} times</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="font-medium mb-2">Common Challenges</h4>
                                            <div className="space-y-1 text-sm">
                                                {userCheckins.filter(c => c.capacityLevel < 5).length > 0 && (
                                                    <div className="flex justify-between">
                                                        <span>Low capacity days</span>
                                                        <span className="text-muted-foreground">
                                                            {userCheckins.filter(c => c.capacityLevel < 5).length} times
                                                        </span>
                                                    </div>
                                                )}
                                                {userCheckins.filter(c => c.presenceLevel < 5).length > 0 && (
                                                    <div className="flex justify-between">
                                                        <span>Low presence days</span>
                                                        <span className="text-muted-foreground">
                                                            {userCheckins.filter(c => c.presenceLevel < 5).length} times
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t">
                                        <h4 className="font-medium mb-2">AI Insights Summary</h4>
                                        <p className="text-sm text-muted-foreground">
                                            {userCheckins.length > 0 ?
                                                `${selectedUserData.name} has completed ${userCheckins.length} emotional check-ins. ` +
                                                (weeklyTrends?.trend === 'improving' ?
                                                    'Recent trends show positive emotional progress.' :
                                                    weeklyTrends?.trend === 'concerning' ?
                                                        'Recent patterns suggest additional support may be beneficial.' :
                                                        'Emotional patterns appear stable overall.'
                                                ) : 'No check-in data available yet.'
                                            }
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>No emotional pattern data available</p>
                                    <p className="text-xs mt-2">User hasn't completed any check-ins yet</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </>
            )}

            {!selectedUserId && (
                <Card>
                    <CardContent className="text-center py-12">
                        <User className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                        <h3 className="text-lg font-medium mb-2">Select a User</h3>
                        <p className="text-muted-foreground">
                            Choose a user from the dropdown above to view their detailed emotional wellness analysis
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
});

IndividualView.displayName = 'IndividualView';

export default IndividualView;