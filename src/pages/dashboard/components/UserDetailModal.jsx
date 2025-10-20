import React, { memo, useState, useEffect } from "react";
import { X, TrendingUp, Calendar, User, Activity, AlertTriangle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { getUserTrends } from "../../../services/dashboardService";

const UserDetailModal = memo(({ user, isOpen, onClose }) => {
    const [userTrends, setUserTrends] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState('month');

    useEffect(() => {
        if (isOpen && user?.id) {
            fetchUserTrends();
        }
    }, [isOpen, user, selectedPeriod]);

    const fetchUserTrends = async () => {
        setLoading(true);
        try {
            const response = await getUserTrends(user.id, selectedPeriod);
            setUserTrends(response.data);
        } catch (error) {
            console.error('Error fetching user trends:', error);
            setUserTrends(null);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !user) return null;

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                    <p className="font-medium text-foreground mb-2">{new Date(label).toLocaleDateString()}</p>
                    {payload.map((entry, index) => (
                        <p key={index} className="text-sm" style={{ color: entry.color }}>
                            {entry.name}: {entry.value}/10
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    const periods = [
        { id: 'week', label: 'Week' },
        { id: 'month', label: 'Month' },
        { id: 'semester', label: 'Semester' }
    ];

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                            <User className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-foreground">{user.name}</h2>
                            <p className="text-sm text-muted-foreground capitalize">{user.role} • {user.department}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                    {/* Period Selector */}
                    <div className="flex items-center gap-2 mb-6">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">Period:</span>
                        <div className="flex gap-1">
                            {periods.map((period) => (
                                <button
                                    key={period.id}
                                    onClick={() => setSelectedPeriod(period.id)}
                                    className={`px-3 py-1 text-xs rounded-full transition-colors ${selectedPeriod === period.id
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                        }`}
                                >
                                    {period.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Stats Overview */}
                    {userTrends && userTrends.summary && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="glass glass-card p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Activity className="w-4 h-4 text-emerald-500" />
                                    <span className="text-sm font-medium text-foreground">Avg Presence</span>
                                </div>
                                <p className="text-2xl font-bold text-foreground">
                                    {userTrends.summary.averagePresence?.toFixed(1) || 0}/10
                                </p>
                            </div>
                            <div className="glass glass-card p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <TrendingUp className="w-4 h-4 text-blue-500" />
                                    <span className="text-sm font-medium text-foreground">Avg Capacity</span>
                                </div>
                                <p className="text-2xl font-bold text-foreground">
                                    {userTrends.summary.averageCapacity?.toFixed(1) || 0}/10
                                </p>
                            </div>
                            <div className="glass glass-card p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertTriangle className="w-4 h-4 text-red-500" />
                                    <span className="text-sm font-medium text-foreground">Support Needed</span>
                                </div>
                                <p className="text-2xl font-bold text-foreground">
                                    {userTrends.summary.supportNeededCount || 0} times
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Trend Chart */}
                    <div className="glass glass-card p-6 mb-6">
                        <h3 className="text-lg font-semibold text-foreground mb-4">Emotional Trends</h3>
                        {loading ? (
                            <div className="h-64 flex items-center justify-center">
                                <div className="text-muted-foreground">Loading trends...</div>
                            </div>
                        ) : userTrends?.trends && userTrends.trends.length > 0 ? (
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={userTrends.trends}>
                                        <defs>
                                            <linearGradient id="presenceGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                                            </linearGradient>
                                            <linearGradient id="capacityGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                                        <XAxis
                                            dataKey="date"
                                            className="text-xs"
                                            tick={{ fill: 'currentColor' }}
                                            tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        />
                                        <YAxis domain={[0, 10]} className="text-xs" tick={{ fill: 'currentColor' }} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Area
                                            type="monotone"
                                            dataKey="presenceLevel"
                                            stroke="#10b981"
                                            fillOpacity={1}
                                            fill="url(#presenceGradient)"
                                            strokeWidth={2}
                                            name="Presence"
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="capacityLevel"
                                            stroke="#3b82f6"
                                            fillOpacity={1}
                                            fill="url(#capacityGradient)"
                                            strokeWidth={2}
                                            name="Capacity"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="h-64 flex items-center justify-center">
                                <div className="text-muted-foreground">No trend data available</div>
                            </div>
                        )}
                    </div>

                    {/* Recent Check-ins */}
                    {userTrends?.trends && userTrends.trends.length > 0 && (
                        <div className="glass glass-card p-6">
                            <h3 className="text-lg font-semibold text-foreground mb-4">Recent Check-ins</h3>
                            <div className="space-y-3 max-h-64 overflow-y-auto">
                                {userTrends.trends.slice(-10).reverse().map((checkin, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-card/40 rounded-lg border border-border/40">
                                        <div className="flex items-center gap-3">
                                            <div className="text-lg">
                                                {checkin.weatherType === 'sunny' ? '☀️' :
                                                    checkin.weatherType === 'cloudy' ? '☁️' :
                                                        checkin.weatherType === 'rain' ? '🌧️' :
                                                            checkin.weatherType === 'storm' ? '⛈️' :
                                                                checkin.weatherType === 'tornado' ? '🌪️' : '❄️'}
                                            </div>
                                            <div>
                                                <p className="font-medium text-foreground">
                                                    {new Date(checkin.date).toLocaleDateString()}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {checkin.selectedMoods?.join(', ')}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-foreground">
                                                P: {checkin.presenceLevel}/10
                                            </p>
                                            <p className="text-sm font-medium text-foreground">
                                                C: {checkin.capacityLevel}/10
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

UserDetailModal.displayName = 'UserDetailModal';

export default UserDetailModal;