import React, { memo, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { fetchUserById } from "../../store/slices/userSlice";
import IndividualView from "./components/IndividualView";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { ArrowLeft, User, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { getUnitMembers } from "../../services/dashboardService";

const IndividualDashboard = memo(() => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { userId } = useParams();
    const { user: currentUser } = useSelector((state) => state.auth);
    const { checkinHistory } = useSelector((state) => state.checkin);
    const { users } = useSelector((state) => state.users);

    const [selectedUser, setSelectedUser] = useState(null);
    const [resolvingUser, setResolvingUser] = useState(false);
    const [teamMembers, setTeamMembers] = useState([]);
    const [teamLoading, setTeamLoading] = useState(false);
    const [teamError, setTeamError] = useState(null);
    const [userAccessError, setUserAccessError] = useState(null);

    const locationStateUser = location.state?.user;
    const isHeadUnit = currentUser?.role === 'head_unit';

    useEffect(() => {
        if (!isHeadUnit) {
            return;
        }

        let isMounted = true;

        const loadUnitMembers = async () => {
            setTeamLoading(true);
            setTeamError(null);
            try {
                const response = await getUnitMembers();
                if (!isMounted) return;
                const members = response?.data?.data?.users || response?.data?.users || response?.users || [];
                setTeamMembers(members);
            } catch (error) {
                if (!isMounted) return;
                console.error('Failed to fetch unit members for head unit view:', error);
                setTeamError('Tidak dapat memuat anggota unit. Coba lagi nanti.');
            } finally {
                if (isMounted) {
                    setTeamLoading(false);
                }
            }
        };

        loadUnitMembers();

        return () => {
            isMounted = false;
        };
    }, [isHeadUnit]);

    // Auto-select user based on URL param, navigation state, or current user
    useEffect(() => {
        let isMounted = true;

        const resolveUserContext = async () => {
            setUserAccessError(null);

            if (!userId) {
                if (currentUser && isMounted) {
                    setSelectedUser(currentUser);
                }
                setResolvingUser(false);
                return;
            }

            if (isHeadUnit && teamLoading) {
                return;
            }

            setResolvingUser(true);

            if (locationStateUser && isMounted) {
                setSelectedUser(locationStateUser);
                setResolvingUser(false);
                return;
            }

            if (isHeadUnit) {
                const normalizedTargetId = userId?.toString();
                const unitCandidate = teamMembers.find((member) => {
                    const candidateId = member?.id?.toString() || member?._id?.toString();
                    return candidateId === normalizedTargetId;
                });

                if (unitCandidate && isMounted) {
                    setSelectedUser(unitCandidate);
                } else if (isMounted) {
                    setSelectedUser(null);
                    setUserAccessError('Anda hanya dapat melihat laporan anggota dalam unit Anda.');
                }
                setResolvingUser(false);
                return;
            }

            const normalizedTargetId = userId?.toString();
            const existingUser = users.find((user) => {
                const candidateId = user?.id?.toString() || user?._id?.toString();
                return candidateId === normalizedTargetId;
            });

            if (existingUser && isMounted) {
                setSelectedUser(existingUser);
                setResolvingUser(false);
                return;
            }

            try {
                const response = await dispatch(fetchUserById(userId)).unwrap();
                if (!isMounted) {
                    return;
                }
                const fetchedUser = response?.user || response?.data?.user || response?.data || response;
                if (fetchedUser) {
                    setSelectedUser(fetchedUser);
                }
            } catch (error) {
                if (isMounted) {
                    console.error('Error loading targeted user for individual dashboard:', error);
                }
            } finally {
                if (isMounted) {
                    setResolvingUser(false);
                }
            }
        };

        resolveUserContext();

        return () => {
            isMounted = false;
        };
    }, [userId, locationStateUser, users, currentUser, dispatch, isHeadUnit, teamMembers, teamLoading]);

    const resolvedTargetUserId = useMemo(() => {
        return (
            userId?.toString() ||
            selectedUser?.id?.toString() ||
            selectedUser?._id?.toString() ||
            currentUser?.id?.toString() ||
            currentUser?._id?.toString() ||
            null
        );
    }, [userId, selectedUser, currentUser]);

    const normalizedCheckins = useMemo(() => {
        if (!checkinHistory) {
            return [];
        }

        if (Array.isArray(checkinHistory)) {
            return checkinHistory;
        }

        if (Array.isArray(checkinHistory?.data?.checkins)) {
            return checkinHistory.data.checkins;
        }

        if (Array.isArray(checkinHistory?.data)) {
            return checkinHistory.data;
        }

        if (Array.isArray(checkinHistory?.checkins)) {
            return checkinHistory.checkins;
        }

        return [];
    }, [checkinHistory]);

    const sortedTeamMembers = useMemo(() => {
        if (!teamMembers?.length) {
            return [];
        }
        return [...teamMembers].sort((a, b) => {
            const nameA = (a?.name || '').toLowerCase();
            const nameB = (b?.name || '').toLowerCase();
            return nameA.localeCompare(nameB);
        });
    }, [teamMembers]);

    const activeTeamMemberId = useMemo(() => {
        return (
            userId?.toString() ||
            selectedUser?.id?.toString() ||
            selectedUser?._id?.toString() ||
            ''
        );
    }, [userId, selectedUser]);

    const targetedCheckins = useMemo(() => {
        if (!normalizedCheckins.length) {
            return [];
        }

        if (!resolvedTargetUserId) {
            return normalizedCheckins;
        }

        return normalizedCheckins.filter((entry) => {
            const entryUserId =
                entry?.userId?.toString() ||
                entry?.user?._id?.toString() ||
                entry?.user?.id?.toString() ||
                null;
            return !entryUserId || entryUserId === resolvedTargetUserId;
        });
    }, [normalizedCheckins, resolvedTargetUserId]);

    const summaryStats = useMemo(() => {
        if (!targetedCheckins.length) {
            return null;
        }

        let highPresence = 0;
        let highCapacity = 0;

        targetedCheckins.forEach((entry) => {
            if (Number(entry?.presenceLevel) >= 7) {
                highPresence += 1;
            }
            if (Number(entry?.capacityLevel) >= 7) {
                highCapacity += 1;
            }
        });

        return {
            total: targetedCheckins.length,
            highPresence,
            highCapacity
        };
    }, [targetedCheckins]);

    const handleBackToMain = () => {
        navigate('/emotional-checkin/dashboard');
    };

    const handleBackToPersonal = () => {
        navigate('/emotional-wellness');
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

                {isHeadUnit && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                        className="mb-6"
                    >
                        <Card className="glass glass-card border-primary/10">
                            <CardHeader>
                                <CardTitle className="text-base md:text-lg">
                                    Anggota Unit Anda
                                </CardTitle>
                                <p className="text-xs md:text-sm text-muted-foreground">
                                    Pilih anggota unit untuk melihat laporan emosional personal mereka.
                                </p>
                            </CardHeader>
                            <CardContent>
                                {teamLoading ? (
                                    <div className="flex flex-wrap gap-2">
                                        {Array.from({ length: 6 }).map((_, index) => (
                                            <div
                                                key={index}
                                                className="h-9 w-32 rounded-lg bg-muted/40 animate-pulse"
                                            />
                                        ))}
                                    </div>
                                ) : sortedTeamMembers.length > 0 ? (
                                    <div className="flex flex-wrap gap-2 max-h-40 overflow-auto">
                                        {sortedTeamMembers.map((member) => {
                                            const memberId = member?.id || member?._id;
                                            const isActive = memberId?.toString() === activeTeamMemberId;
                                            return (
                                                <Button
                                                    key={memberId}
                                                    size="sm"
                                                    variant={isActive ? "default" : "outline"}
                                                    className="justify-start"
                                                    onClick={() =>
                                                        navigate(`/emotional-wellness/${memberId}`, {
                                                            state: { user: member }
                                                        })
                                                    }
                                                >
                                                    {member.name}
                                                </Button>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        {teamError || 'Belum ada anggota unit yang terdaftar.'}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {userAccessError && userId && !resolvingUser && (
                    <div className="mb-6">
                        <Card className="border-destructive/30 bg-destructive/5">
                            <CardContent className="py-5">
                                <p className="text-sm text-destructive mb-3">{userAccessError}</p>
                                <Button variant="outline" size="sm" onClick={handleBackToPersonal}>
                                    Kembali ke laporan saya
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Individual View Component */}
                {(selectedUser || (!userId && currentUser && !userAccessError)) && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <IndividualView
                            selectedUser={selectedUser}
                            targetUserId={resolvedTargetUserId}
                        />
                    </motion.div>
                )}

                {/* Quick Stats Summary */}
                {selectedUser && !resolvingUser && !userAccessError && (
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
                                            {summaryStats?.total ?? 0}
                                        </div>
                                        <div className="text-sm text-muted-foreground">Total Check-ins</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-green-600">
                                            {summaryStats?.highPresence ?? 0}
                                        </div>
                                        <div className="text-sm text-muted-foreground">High Presence Days</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-600">
                                            {summaryStats?.highCapacity ?? 0}
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
