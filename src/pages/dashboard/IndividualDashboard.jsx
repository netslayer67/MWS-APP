import React, { memo, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { getCheckinHistory } from "../../store/slices/checkinSlice";
import { fetchUsers } from "../../store/slices/userSlice";
import IndividualView from "./components/IndividualView";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { ArrowLeft, User, Calendar, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const IndividualDashboard = memo(() => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { userId } = useParams();
    const { user: currentUser } = useSelector((state) => state.auth);
    const { checkinHistory } = useSelector((state) => state.checkin);
    const { users } = useSelector((state) => state.users);

    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedPeriod, setSelectedPeriod] = useState('week');
    const [loading, setLoading] = useState(false);

    // Auto-select user based on URL param or current user for individual dashboard
    useEffect(() => {
        if (users.length > 0) {
            if (userId) {
                // If userId is in URL, find that specific user
                const userData = users.find(u => u.id === userId);
                if (userData) {
                    setSelectedUser(userData);
                }
            } else if (currentUser) {
                // Otherwise, use current user
                const userData = users.find(u => u.id === currentUser.id);
                if (userData) {
                    setSelectedUser(userData);
                }
            }
        }
    }, [currentUser, users, userId]);

    // Load data on mount
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                await Promise.all([
                    dispatch(fetchUsers()),
                    dispatch(getCheckinHistory({ page: 1, limit: 100 }))
                ]);
            } catch (error) {
                console.error('Error loading dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [dispatch]);

    const handleUserSelect = (user) => {
        setSelectedUser(user);
    };

    const handleBackToMain = () => {
        navigate('/emotional-checkin/dashboard');
    };

    const handleBackToPersonal = () => {
        navigate('/emotional-wellness');
    };

    const handlePeriodChange = (period) => {
        setSelectedPeriod(period);
    };

    // Get user's title based on gender
    const getUserTitle = (user) => {
        if (!user?.gender) return user?.name || 'User';

        const title = user.gender === 'male' ? 'Mr.' :
            user.gender === 'female' ? 'Ms.' : '';
        const displayName = user.username || user.name || 'User';

        return title ? `${title} ${displayName}` : displayName;
    };

    return (
        <div className="min-h-screen text-foreground relative overflow-hidden">
            {/* Decorative Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-gold/5" />
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.1),transparent_50%)]" />
            <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,rgba(255,215,0,0.05),transparent_50%)]" />

            <div className="relative z-10 container-tight py-4 md:py-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-6"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                onClick={userId ? handleBackToPersonal : handleBackToMain}
                                className="flex items-center gap-2 hover:bg-primary/10"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                {userId ? 'Back to My Dashboard' : 'Back to Main Dashboard'}
                            </Button>
                        </div>

                        <div className="text-right">
                            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-gold bg-clip-text text-transparent">
                                {userId ? 'User Report' : 'Individual Dashboard'}
                            </h1>
                            <p className="text-sm text-muted-foreground mt-1">
                                {userId ? 'Detailed emotional wellness report' : 'Your personal emotional wellness overview'}
                            </p>
                        </div>
                    </div>

                    {/* Welcome Section */}
                    <Card className="glass glass-card border-primary/20">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-gold flex items-center justify-center">
                                    <User className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold">
                                        {userId ? `Report for ${getUserTitle(selectedUser)}` : `Welcome back, ${getUserTitle(currentUser)}!`}
                                    </h2>
                                    <p className="text-muted-foreground">
                                        {userId ? 'Detailed emotional wellness analysis for this user' : 'Here\'s your comprehensive emotional wellness analysis'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Individual View Component */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <IndividualView
                        selectedUser={selectedUser}
                        onUserSelect={handleUserSelect}
                        selectedPeriod={selectedPeriod}
                        loading={loading}
                        isPersonalView={true}
                    />
                </motion.div>

                {/* Quick Stats Summary */}
                {selectedUser && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="mt-6"
                    >
                        <Card className="glass glass-card">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5" />
                                    Quick Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-primary">
                                            {checkinHistory?.filter(c => c.userId === selectedUser.id).length || 0}
                                        </div>
                                        <div className="text-sm text-muted-foreground">Total Check-ins</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-green-600">
                                            {checkinHistory?.filter(c => c.userId === selectedUser.id && c.presenceLevel >= 7).length || 0}
                                        </div>
                                        <div className="text-sm text-muted-foreground">High Presence Days</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-600">
                                            {checkinHistory?.filter(c => c.userId === selectedUser.id && c.capacityLevel >= 7).length || 0}
                                        </div>
                                        <div className="text-sm text-muted-foreground">High Capacity Days</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </div>
        </div>
    );
});

IndividualDashboard.displayName = 'IndividualDashboard';

export default IndividualDashboard;
