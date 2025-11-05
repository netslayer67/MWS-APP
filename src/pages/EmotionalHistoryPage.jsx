import React, { useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { ArrowLeft, Calendar, MessageCircle } from "lucide-react";
import { Helmet } from "react-helmet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCheckinHistory } from "../store/slices/checkinSlice";
import socketService from "../services/socketService";

const EmotionalHistoryPage = () => {
    const navigate = useNavigate();
    const { userId } = useParams();
    const dispatch = useDispatch();
    const { user: currentUser } = useSelector((state) => state.auth);
    const { checkinHistory } = useSelector((state) => state.checkin);

    // Use userId from URL params if available, otherwise use current user
    const targetUserId = userId || currentUser?.id;

    const userCheckins = useMemo(() => {
        if (!checkinHistory) return [];
        // Handle both array and object response formats
        const data = Array.isArray(checkinHistory) ? checkinHistory : checkinHistory.data?.checkins || checkinHistory.checkins || [];
        return data.filter(checkin => checkin.userId === targetUserId || checkin.userId?._id === targetUserId);
    }, [checkinHistory, targetUserId]);

    // Debug logging
    console.log('EmotionalHistoryPage Debug:', {
        currentUser: currentUser?.id,
        targetUserId,
        checkinHistoryLength: checkinHistory?.data?.checkins?.length || checkinHistory?.length || 0,
        userCheckinsLength: userCheckins.length,
        checkinHistoryKeys: checkinHistory ? Object.keys(checkinHistory) : [],
        firstCheckin: userCheckins[0]
    });

    const allReflections = useMemo(() => {
        return userCheckins
            .filter(checkin => checkin.details)
            .map(checkin => ({
                id: checkin._id,
                date: new Date(checkin.date).toLocaleDateString('id-ID', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                }),
                time: new Date(checkin.date).toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit'
                }),
                details: checkin.details,
                weatherType: checkin.weatherType,
                moods: checkin.selectedMoods || [],
                presenceLevel: checkin.presenceLevel,
                capacityLevel: checkin.capacityLevel
            }))
            .sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [userCheckins]);

    // Load data and set up real-time updates
    useEffect(() => {
        if (currentUser && targetUserId) {
            dispatch(getCheckinHistory({ page: 1, limit: 50, userId: targetUserId }));

            // Connect to socket for real-time updates
            socketService.connect();
            socketService.joinPersonal(targetUserId);

            // Set up real-time listeners
            const handleNewCheckin = (checkinData) => {
                console.log('Real-time personal check-in update:', checkinData);
                // Refresh check-in history
                dispatch(getCheckinHistory({ page: 1, limit: 50, userId: targetUserId }));
            };

            socketService.onPersonalNewCheckin(handleNewCheckin);

            // Cleanup on unmount
            return () => {
                socketService.offPersonalNewCheckin(handleNewCheckin);
                socketService.leavePersonal();
            };
        }
    }, [dispatch, currentUser, targetUserId]);

    const container = useMemo(
        () => ({ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { staggerChildren: 0.05 } } }),
        []
    );
    const item = useMemo(() => ({ hidden: { opacity: 0, y: 6 }, show: { opacity: 1, y: 0, transition: { duration: 0.32 } } }), []);

    return (
        <>
            <Helmet>
                <title>Emotional History — MWS APP</title>
            </Helmet>

            <motion.main initial="hidden" animate="show" variants={container} className="relative min-h-dvh w-full px-4 pb-12 pt-6">
                <div className="mx-auto max-w-md">
                    {/* header */}
                    <motion.header variants={item} className="mb-6 flex items-center gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            aria-label="Go back"
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card/40 backdrop-blur-md hover:bg-accent/8 transition-colors duration-300"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </button>

                        <div className="flex-1 min-w-0">
                            <h1 className="text-lg font-semibold text-foreground">Emotional History</h1>
                            <p className="mt-0.5 text-xs text-muted-foreground">Reflection & thoughts</p>
                        </div>
                    </motion.header>

                    {/* History List */}
                    <motion.section variants={item}>
                        {allReflections.length > 0 ? (
                            <div className="space-y-4">
                                {allReflections.map((reflection) => (
                                    <Card key={reflection.id} className="glass glass-card">
                                        <CardContent className="p-4">
                                            <div className="space-y-3">
                                                {/* Header */}
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-4 h-4 text-muted-foreground" />
                                                        <span className="text-sm font-medium text-foreground">
                                                            {reflection.date}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {reflection.time}
                                                        </span>
                                                    </div>
                                                    <Badge variant="outline" className="text-xs">
                                                        {reflection.weatherType}
                                                    </Badge>
                                                </div>

                                                {/* Details */}
                                                <div className="bg-secondary/20 rounded-lg p-3">
                                                    <p className="text-sm text-foreground leading-relaxed">
                                                        {reflection.details}
                                                    </p>
                                                </div>

                                                {/* Moods */}
                                                {reflection.moods.length > 0 && (
                                                    <div className="flex flex-wrap gap-1">
                                                        {reflection.moods.map((mood) => (
                                                            <Badge key={mood} variant="secondary" className="text-xs">
                                                                {mood}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Levels */}
                                                <div className="flex items-center justify-between text-xs text-foreground/70 pt-2 border-t border-border/50">
                                                    <span>Presence: {reflection.presenceLevel}/10</span>
                                                    <span>Capacity: {reflection.capacityLevel}/10</span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <Card className="glass glass-card">
                                <CardContent className="text-center py-12">
                                    <MessageCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                                    <h3 className="text-lg font-medium mb-2 text-foreground">No History Yet</h3>
                                    <p className="text-foreground/70 text-sm">
                                        You haven't completed any emotional check-ins or added reflections yet.
                                        Start with daily check-ins to see your history here.
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </motion.section>

                    {/* Summary Stats */}
                    {allReflections.length > 0 && (
                        <motion.section variants={item} className="mt-6">
                            <Card className="glass glass-card">
                                <CardHeader>
                                    <CardTitle>History Summary</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-primary">
                                                {allReflections.length}
                                            </div>
                                            <div className="text-xs text-foreground/70">Total Reflections</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-blue-600">
                                                {Math.round(allReflections.reduce((sum, r) => sum + r.presenceLevel, 0) / allReflections.length * 10) / 10}
                                            </div>
                                            <div className="text-xs text-foreground/70">Average Presence</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.section>
                    )}
                </div>
            </motion.main>
        </>
    );
};

export default EmotionalHistoryPage;