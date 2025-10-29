import React, { useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { ArrowLeft, Activity, Heart, TrendingUp } from "lucide-react";
import { Helmet } from "react-helmet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCheckinHistory } from "../store/slices/checkinSlice";
import socketService from "../services/socketService";

const EmotionalPatternsPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user: currentUser } = useSelector((state) => state.auth);
    const { checkinHistory } = useSelector((state) => state.checkin);

    const userCheckins = useMemo(() => {
        if (!checkinHistory) return [];
        return checkinHistory.filter(checkin => checkin.userId === currentUser?.id);
    }, [checkinHistory, currentUser?.id]);

    const patterns = useMemo(() => {
        if (userCheckins.length === 0) return null;

        // Weather patterns
        const weatherCount = userCheckins.reduce((acc, checkin) => {
            acc[checkin.weatherType] = (acc[checkin.weatherType] || 0) + 1;
            return acc;
        }, {});

        const weatherPatterns = Object.entries(weatherCount)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5);

        // Mood patterns
        const moodCount = {};
        userCheckins.forEach(checkin => {
            checkin.selectedMoods?.forEach(mood => {
                moodCount[mood] = (moodCount[mood] || 0) + 1;
            });
        });

        const moodPatterns = Object.entries(moodCount)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10);

        // Challenge patterns
        const lowCapacityDays = userCheckins.filter(c => c.capacityLevel < 5).length;
        const lowPresenceDays = userCheckins.filter(c => c.presenceLevel < 5).length;
        const highCapacityDays = userCheckins.filter(c => c.capacityLevel >= 8).length;
        const highPresenceDays = userCheckins.filter(c => c.presenceLevel >= 8).length;

        // Weekly patterns
        const weeklyData = userCheckins.slice(0, 28); // Last 4 weeks
        const weeklyAvg = weeklyData.length > 0 ? {
            presence: weeklyData.reduce((sum, c) => sum + c.presenceLevel, 0) / weeklyData.length,
            capacity: weeklyData.reduce((sum, c) => sum + c.capacityLevel, 0) / weeklyData.length
        } : null;

        return {
            weatherPatterns,
            moodPatterns,
            challenges: {
                lowCapacityDays,
                lowPresenceDays,
                highCapacityDays,
                highPresenceDays
            },
            weeklyAvg,
            totalCheckins: userCheckins.length
        };
    }, [userCheckins]);

    const insights = useMemo(() => {
        if (!patterns) return null;

        const { challenges, weeklyAvg, totalCheckins, weatherPatterns, moodPatterns } = patterns;
        let insights = [];

        if (totalCheckins > 0) {
            // Advanced AI Analysis
            const userName = currentUser?.name || 'Anda';

            // 1. Overall engagement analysis
            insights.push(`🎯 ${userName} telah menyelesaikan ${totalCheckins} check-in emosi dengan konsistensi yang mengagumkan. Ini menunjukkan komitmen yang kuat terhadap kesehatan mental dan kesadaran diri.`);

            // 2. Advanced trend analysis
            if (weeklyAvg) {
                const presenceScore = weeklyAvg.presence;
                const capacityScore = weeklyAvg.capacity;

                // Presence analysis
                let presenceInsight = '';
                if (presenceScore >= 8) {
                    presenceInsight = `Kehadiran mental Anda luar biasa (${presenceScore.toFixed(1)}/10) - ini menunjukkan fokus dan engagement yang sangat tinggi dengan pekerjaan dan lingkungan sekitar.`;
                } else if (presenceScore >= 6) {
                    presenceInsight = `Kehadiran Anda stabil (${presenceScore.toFixed(1)}/10) dengan ruang untuk peningkatan. Pertimbangkan teknik mindfulness untuk meningkatkan fokus harian.`;
                } else if (presenceScore >= 4) {
                    presenceInsight = `Kehadiran Anda sedang (${presenceScore.toFixed(1)}/10). Ini mungkin terkait dengan beban kerja atau faktor eksternal.`;
                } else {
                    presenceInsight = `Kehadiran Anda perlu perhatian khusus (${presenceScore.toFixed(1)}/10). Pertimbangkan untuk mengidentifikasi dan mengatasi faktor-faktor yang mempengaruhinya.`;
                }
                insights.push(`🧠 ${presenceInsight}`);

                // Capacity analysis
                let capacityInsight = '';
                if (capacityScore >= 8) {
                    capacityInsight = `Kapasitas energi Anda sangat tinggi (${capacityScore.toFixed(1)}/10) - ini menunjukkan resiliensi mental yang luar biasa dan kemampuan untuk menangani tantangan dengan baik.`;
                } else if (capacityScore >= 6) {
                    capacityInsight = `Kapasitas Anda baik (${capacityScore.toFixed(1)}/10) dengan fondasi yang solid untuk produktivitas.`;
                } else if (capacityScore >= 4) {
                    capacityInsight = `Kapasitas Anda sedang (${capacityScore.toFixed(1)}/10). Pertimbangkan strategi manajemen energi seperti istirahat teratur dan nutrisi yang baik.`;
                } else {
                    capacityInsight = `Kapasitas energi Anda perlu perhatian (${capacityScore.toFixed(1)}/10). Ini mungkin menunjukkan kelelahan atau kebutuhan akan dukungan tambahan.`;
                }
                insights.push(`⚡ ${capacityInsight}`);
            }

            // 3. Weather pattern analysis
            if (weatherPatterns && weatherPatterns.length > 0) {
                const dominantWeather = weatherPatterns[0][0];
                const weatherFrequency = ((weatherPatterns[0][1] / totalCheckins) * 100);

                const weatherInsights = {
                    'sunny': `Cuaca emosi Anda didominasi oleh hari cerah (${weatherFrequency.toFixed(1)}%), menunjukkan optimisme dan energi positif yang konsisten.`,
                    'light-rain': `Anda sering mengalami hari hujan ringan (${weatherFrequency.toFixed(1)}%), yang menunjukkan kemampuan untuk menangani tantangan kecil dengan tenang.`,
                    'rainy': `Cuaca hujan cukup sering muncul (${weatherFrequency.toFixed(1)}%), menunjukkan periode refleksi dan pemrosesan emosi yang mendalam.`,
                    'thunderstorms': `Badai emosi muncul (${weatherFrequency.toFixed(1)}%), menunjukkan intensitas emosi yang tinggi dan kemampuan untuk menavigasi turbulensi.`,
                    'windy': `Angin kencang sering terjadi (${weatherFrequency.toFixed(1)}%), menunjukkan periode ketidakstabilan yang memerlukan grounding.`,
                    'snowy': `Salju menutupi lanskap emosi Anda (${weatherFrequency.toFixed(1)}%), menunjukkan kebutuhan akan kehangatan dan dukungan.`,
                    'foggy': `Kabut emosi cukup tebal (${weatherFrequency.toFixed(1)}%), menunjukkan periode ketidakjelasan yang memerlukan klarifikasi.`,
                    'cloudy': `Awan mendominasi (${weatherFrequency.toFixed(1)}%), menunjukkan suasana hati yang stabil namun redup.`
                };

                insights.push(`🌤️ ${weatherInsights[dominantWeather] || `Pola cuaca emosi Anda unik dengan dominasi ${dominantWeather} (${weatherFrequency.toFixed(1)}%).`}`);
            }

            // 4. Mood pattern analysis
            if (moodPatterns && moodPatterns.length > 0) {
                const topMoods = moodPatterns.slice(0, 3);
                const moodAnalysis = topMoods.map(([mood, count]) => {
                    const percentage = ((count / totalCheckins) * 100).toFixed(1);
                    return `${mood} (${percentage}%)`;
                }).join(', ');

                insights.push(`😊 Pola mood Anda menunjukkan kecenderungan kuat ke arah: ${moodAnalysis}. Ini mencerminkan kepribadian dan respons emosi Anda yang unik.`);

                // Advanced mood insights
                const positiveMoods = ['happy', 'excited', 'hopeful', 'calm', 'grateful'];
                const challengingMoods = ['anxious', 'tired', 'lonely', 'sad', 'angry'];

                const positiveCount = moodPatterns.filter(([mood]) => positiveMoods.includes(mood)).reduce((sum, [, count]) => sum + count, 0);
                const challengingCount = moodPatterns.filter(([mood]) => challengingMoods.includes(mood)).reduce((sum, [, count]) => sum + count, 0);

                if (positiveCount > challengingCount * 1.5) {
                    insights.push(`✨ Analisis mendalam menunjukkan Anda memiliki kecenderungan positif yang kuat, dengan rasio emosi positif vs tantangan sebesar ${(positiveCount / challengingCount).toFixed(1)}:1. Ini adalah kekuatan besar!`);
                } else if (challengingCount > positiveCount * 1.5) {
                    insights.push(`🔍 Pola emosi Anda menunjukkan periode tantangan yang signifikan. Ini adalah kesempatan untuk pengembangan resiliensi dan pertumbuhan pribadi.`);
                } else {
                    insights.push(`⚖️ Keseimbangan emosi Anda cukup baik, dengan variasi yang sehat antara pengalaman positif dan tantangan. Ini menunjukkan kecerdasan emosi yang matang.`);
                }
            }

            // 5. Challenge analysis with advanced insights
            const totalLowDays = challenges.lowCapacityDays + challenges.lowPresenceDays;
            const totalHighDays = challenges.highCapacityDays + challenges.highPresenceDays;

            if (totalLowDays > totalHighDays) {
                insights.push(`📊 Analisis tantangan menunjukkan Anda mengalami lebih banyak hari dengan performa rendah (${totalLowDays} vs ${totalHighDays} hari tinggi). Ini mungkin terkait dengan pola tidur, nutrisi, atau beban kerja. Rekomendasi: Tinjau rutinitas harian dan pertimbangkan konsultasi dengan profesional kesehatan mental.`);
            } else if (totalHighDays > totalCheckins * 0.6) {
                insights.push(`🏆 Performa emosi Anda luar biasa! ${totalHighDays} hari dengan kapasitas/kehadiran tinggi dari ${totalCheckins} total check-in menunjukkan resiliensi mental yang exceptional. Lanjutkan praktik yang mendukung kesejahteraan ini.`);
            }

            // 6. Predictive insights
            if (totalCheckins >= 7) {
                const recentCheckins = userCheckins.slice(0, 7); // Last 7 days
                const recentAvgPresence = recentCheckins.reduce((sum, c) => sum + c.presenceLevel, 0) / recentCheckins.length;
                const recentAvgCapacity = recentCheckins.reduce((sum, c) => sum + c.capacityLevel, 0) / recentCheckins.length;

                if (recentAvgPresence < weeklyAvg?.presence - 1) {
                    insights.push(`🔮 Prediksi: Kehadiran Anda menurun dalam seminggu terakhir. Ini mungkin sinyal untuk intervensi dini - pertimbangkan istirahat tambahan atau teknik relaksasi.`);
                } else if (recentAvgCapacity > weeklyAvg?.capacity + 1) {
                    insights.push(`📈 Tren positif terdeteksi! Kapasitas Anda meningkat. Analisis menunjukkan praktik yang Anda lakukan efektif - lanjutkan!`);
                }
            }

            // 7. Personalized recommendations
            insights.push(`💡 Rekomendasi Personal: Berdasarkan pola unik Anda, fokuslah pada ${challenges.lowCapacityDays > challenges.lowPresenceDays ? 'pengelolaan energi' : 'peningkatan fokus'} untuk optimalkan performa emosi Anda.`);

            // 8. Long-term growth insights
            if (totalCheckins >= 14) {
                insights.push(`🌱 Wawasan Pertumbuhan: Dengan ${totalCheckins} check-in, Anda telah membangun foundation yang solid untuk kesehatan mental. Lanjutkan konsistensi ini untuk melihat pola jangka panjang yang lebih bermakna.`);
            }
        }

        return insights;
    }, [patterns, currentUser?.name]);

    // Load data and set up real-time updates
    useEffect(() => {
        if (currentUser) {
            dispatch(getCheckinHistory({ page: 1, limit: 50 }));

            // Connect to socket for real-time updates
            socketService.connect();
            socketService.joinPersonal(currentUser.id);

            // Set up real-time listeners
            const handleNewCheckin = (checkinData) => {
                console.log('Real-time personal check-in update:', checkinData);
                // Refresh check-in history
                dispatch(getCheckinHistory({ page: 1, limit: 50 }));
            };

            socketService.onPersonalNewCheckin(handleNewCheckin);

            // Cleanup on unmount
            return () => {
                socketService.offPersonalNewCheckin(handleNewCheckin);
                socketService.leavePersonal();
            };
        }
    }, [dispatch, currentUser]);

    const container = useMemo(
        () => ({ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } } }),
        []
    );
    const item = useMemo(() => ({ hidden: { opacity: 0, y: 6 }, show: { opacity: 1, y: 0, transition: { duration: 0.32 } } }), []);

    return (
        <>
            <Helmet>
                <title>Pola Emosi — Kerjain</title>
            </Helmet>

            <motion.main initial="hidden" animate="show" variants={container} className="relative min-h-dvh w-full px-4 pb-12 pt-6">
                <div className="mx-auto max-w-md">
                    {/* header */}
                    <motion.header variants={item} className="mb-6 flex items-center gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            aria-label="Kembali"
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card/40 backdrop-blur-md hover:bg-accent/8 transition-colors duration-300"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </button>

                        <div className="flex-1 min-w-0">
                            <h1 className="text-lg font-semibold text-foreground">Emotional Patterns</h1>
                            <p className="mt-0.5 text-xs text-muted-foreground">Insights & patterns of your emotional behavior</p>
                        </div>
                    </motion.header>

                    {patterns ? (
                        <>
                            {/* Weather Patterns */}
                            <motion.section variants={item}>
                                <Card className="glass glass-card">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Activity className="w-5 h-5" />
                                            Emotional Weather Patterns
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {patterns.weatherPatterns.map(([weather, count]) => (
                                                <div key={weather} className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline" className="text-foreground border-foreground/30">{weather}</Badge>
                                                        <span className="text-sm text-foreground/80">
                                                            {((count / patterns.totalCheckins) * 100).toFixed(1)}% of total
                                                        </span>
                                                    </div>
                                                    <span className="text-sm font-medium text-foreground">{count} kali</span>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.section>

                            {/* Mood Patterns */}
                            <motion.section variants={item} className="mt-6">
                                <Card className="glass glass-card">
                                    <CardHeader>
                                        <CardTitle>Mood Patterns</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-wrap gap-2">
                                            {patterns.moodPatterns.map(([mood, count]) => (
                                                <Badge key={mood} variant="secondary" className="text-sm text-foreground bg-secondary/80 border-secondary-foreground/30">
                                                    {mood} ({count})
                                                </Badge>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.section>

                            {/* Challenge Patterns */}
                            <motion.section variants={item} className="mt-6">
                                <Card className="glass glass-card">
                                    <CardHeader>
                                        <CardTitle>Challenge Patterns</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="text-center p-3 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800/30">
                                                <div className="text-xl font-bold text-red-700 dark:text-red-400">
                                                    {patterns.challenges.lowCapacityDays}
                                                </div>
                                                <div className="text-xs text-foreground/70">Low Capacity Days</div>
                                            </div>
                                            <div className="text-center p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg border border-orange-200 dark:border-orange-800/30">
                                                <div className="text-xl font-bold text-orange-700 dark:text-orange-400">
                                                    {patterns.challenges.lowPresenceDays}
                                                </div>
                                                <div className="text-xs text-foreground/70">Low Presence Days</div>
                                            </div>
                                            <div className="text-center p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800/30">
                                                <div className="text-xl font-bold text-green-700 dark:text-green-400">
                                                    {patterns.challenges.highCapacityDays}
                                                </div>
                                                <div className="text-xs text-foreground/70">High Capacity Days</div>
                                            </div>
                                            <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800/30">
                                                <div className="text-xl font-bold text-blue-700 dark:text-blue-400">
                                                    {patterns.challenges.highPresenceDays}
                                                </div>
                                                <div className="text-xs text-foreground/70">High Presence Days</div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.section>

                            {/* AI Insights */}
                            <motion.section variants={item} className="mt-6">
                                <Card className="glass glass-card">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <TrendingUp className="w-5 h-5" />
                                            AI Insights
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {insights.map((insight, index) => (
                                                <div key={index} className="flex gap-3">
                                                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                                                    <p className="text-sm text-foreground/80">{insight}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.section>
                        </>
                    ) : (
                        <motion.section variants={item}>
                            <Card className="glass glass-card">
                                <CardContent className="text-center py-12">
                                    <Heart className="w-16 h-16 mx-auto mb-4 text-foreground/30" />
                                    <h3 className="text-lg font-medium mb-2 text-foreground">Belum Ada Data Pola</h3>
                                    <p className="text-foreground/70 text-sm">
                                        You haven't completed enough emotional check-ins to analyze patterns.
                                        Perform regular check-ins to see insights into your emotional patterns.
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.section>
                    )}
                </div>
            </motion.main>
        </>
    );
};

export default EmotionalPatternsPage;