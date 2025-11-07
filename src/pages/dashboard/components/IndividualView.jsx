import React, { memo, useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchUsers } from "../../../store/slices/userSlice";
import { getUnitMembers } from "../../../services/dashboardService";
import { getCheckinHistory } from "../../../store/slices/checkinSlice";
import { User, TrendingUp, Calendar, MessageCircle, Heart, Activity, Eye, BarChart3, Brain } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Badge } from "../../../components/ui/badge";
import { Progress } from "../../../components/ui/progress";
import { Button } from "../../../components/ui/button";

const IndividualView = memo(({ selectedUser, onUserSelect, selectedPeriod, loading }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { users } = useSelector((state) => state.users);
    const { user: currentUser } = useSelector((state) => state.auth);
    const { checkinHistory } = useSelector((state) => state.checkin);

    const [selectedUserId, setSelectedUserId] = useState(selectedUser?.id || '');
    const [unitUsers, setUnitUsers] = useState([]);

    useEffect(() => {
        // Fetch all users for the dropdown - get all active users with proper pagination
        if (users.length === 0) {
            // Fetch multiple pages to get all users (limit is 100 per page max)
            const fetchAllUsers = async () => {
                let allUsers = [];
                let currentPage = 1;
                let hasMore = true;

                while (hasMore) {
                    try {
                        const result = await dispatch(fetchUsers({
                            page: currentPage,
                            limit: 100, // Maximum allowed by backend
                            isActive: true
                        })).unwrap();

                        const pageUsers = result.users || [];
                        allUsers = [...allUsers, ...pageUsers];

                        // Check if there are more pages
                        hasMore = result.pagination && result.pagination.hasNext;
                        currentPage++;

                        // Safety limit to prevent infinite loops
                        if (currentPage > 100) break;

                    } catch (error) {
                        console.error('Error fetching users page:', currentPage, error);
                        // Fallback for head_unit: fetch unit members via dashboard service
                        try {
                            if (currentUser?.role === 'head_unit') {
                                const resp = await getUnitMembers();
                                const list = resp.data?.data?.users || resp.data?.users || [];
                                setUnitUsers(list);
                            }
                        } catch (e) {
                            console.error('Failed to fetch unit members fallback:', e);
                        }
                        break;
                    }
                }

                // Update the store with all fetched users
                if (allUsers.length > 0) {
                    // The fetchUsers action will handle updating the store
                    console.log(`Fetched ${allUsers.length} total users`);
                }
            };

            fetchAllUsers();
        }
    }, [dispatch, users.length]);

    useEffect(() => {
        // Fetch check-in history when user is selected
        if (selectedUserId) {
            dispatch(getCheckinHistory({
                page: 1,
                limit: 100, // Get more data for comprehensive analysis
                userId: selectedUserId // Pass userId to filter on backend
            }));
        }
    }, [dispatch, selectedUserId]);

    const availableUsers = users.length > 0 ? users : unitUsers;

    const handleUserChange = (userId) => {
        setSelectedUserId(userId);
        const user = availableUsers.find(u => u.id === userId);
        onUserSelect(user);
    };

    // Use check-in history directly since backend now filters by userId
    const userCheckins = useMemo(() => {
        if (!selectedUserId || !checkinHistory) return [];
        // Backend already filters by userId, so use the data directly
        // The API response structure is: { success: true, message: "...", data: { checkins: [...], pagination: {...} } }
        const data = checkinHistory.data || checkinHistory;
        return Array.isArray(data) ? data : (data.checkins || []);
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

    const selectedUserData = availableUsers.find(u => u.id === selectedUserId);

    // Debug logging (remove in production)
    // console.log('IndividualView Debug:', {
    //     selectedUserId,
    //     selectedUserData,
    //     userCheckins: userCheckins.length,
    //     checkinHistory,
    //     usersCount: users.length
    // });

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
                        <SelectTrigger className="w-full bg-card/50 border-border/50 hover:bg-card/70 transition-colors">
                            <SelectValue placeholder="Choose a user to analyze..." />
                        </SelectTrigger>
                        <SelectContent className="max-h-80 overflow-y-auto bg-card/95 backdrop-blur-sm border-border/50">
                            {(availableUsers.length > 0) ? (
                                availableUsers.map((user) => (
                                    <SelectItem
                                        key={user.id || user._id}
                                        value={user.id || user._id}
                                        className="hover:bg-primary/10 focus:bg-primary/10 cursor-pointer py-3 px-3"
                                    >
                                        <div className="flex flex-col w-full">
                                            <span className="font-medium text-foreground text-sm">{user.name}</span>
                                            <span className="text-xs text-muted-foreground">
                                                {user.role} {user.department && `• ${user.department}`} {user.unit && `• ${user.unit}`}
                                            </span>
                                        </div>
                                    </SelectItem>
                                ))
                            ) : (
                                <div className="py-6 text-center text-muted-foreground">
                                    <p>No users available</p>
                                </div>
                            )}
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            {selectedUserData && userCheckins.length > 0 && (
                <>
                    {/* Simplified User Overview */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <User className="w-5 h-5" />
                                    {selectedUserData.name}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => navigate(`/emotional-wellness/${selectedUserId}`)}
                                    className="flex items-center gap-2"
                                >
                                    <Eye className="w-4 h-4" />
                                    View Full Report
                                </Button>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                <div className="text-center p-3 bg-primary/5 rounded-lg">
                                    <div className="text-xl font-bold text-primary">{userCheckins.length}</div>
                                    <div className="text-xs text-muted-foreground">Check-ins</div>
                                </div>
                                <div className="text-center p-3 bg-green-50 rounded-lg">
                                    <div className="text-xl font-bold text-green-600">{weeklyTrends?.avgPresence || 0}</div>
                                    <div className="text-xs text-muted-foreground">Presence</div>
                                </div>
                                <div className="text-center p-3 bg-blue-50 rounded-lg">
                                    <div className="text-xl font-bold text-blue-600">{weeklyTrends?.avgCapacity || 0}</div>
                                    <div className="text-xs text-muted-foreground">Capacity</div>
                                </div>
                                <div className="text-center p-3 bg-purple-50 rounded-lg">
                                    <div className="text-xl font-bold text-purple-600">
                                        {userCheckins.filter(c => c.aiAnalysis?.needsSupport).length}
                                    </div>
                                    <div className="text-xs text-muted-foreground">Support Flags</div>
                                </div>
                            </div>

                            {/* Latest Check-in Summary */}
                            <div className="border-t pt-4">
                                <h4 className="font-medium mb-3">Latest Check-in</h4>
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
                </>
            )}

            {(!selectedUserId || userCheckins.length === 0) && (
                <Card>
                    <CardContent className="text-center py-16">
                        <div className="w-20 h-20 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-6">
                            <BarChart3 className="w-10 h-10 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-semibold mb-3">Individual User Analytics</h3>
                        <p className="text-muted-foreground text-base leading-relaxed">
                            {!selectedUserId
                                ? "Select a user from the dropdown above to view their comprehensive emotional wellness report, including check-in history, AI analysis insights, and personalized recommendations."
                                : `${selectedUserData?.name || 'Selected user'} hasn't completed any emotional check-ins yet.`
                            }
                        </p>
                        <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                            <p className="text-sm text-primary font-medium">
                                📊 Access detailed individual reports to provide targeted support and track progress over time.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
});

IndividualView.displayName = 'IndividualView';

export default IndividualView;
