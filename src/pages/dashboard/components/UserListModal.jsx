import React, { memo } from "react";
import { X, Users, TrendingUp } from "lucide-react";

const UserListModal = memo(({ isOpen, onClose, title, users, totalUsers, type }) => {
    if (!isOpen) return null;

    const sortedUsers = users ? [...users].sort() : [];

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                            {type === 'mood' ? (
                                <TrendingUp className="w-5 h-5 text-primary" />
                            ) : (
                                <Users className="w-5 h-5 text-primary" />
                            )}
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-foreground">{title}</h2>
                            <p className="text-sm text-muted-foreground">
                                {sortedUsers.length} of {totalUsers} users ({Math.round((sortedUsers.length / totalUsers) * 100)}%)
                            </p>
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
                <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
                    {sortedUsers.length > 0 ? (
                        <div className="space-y-2">
                            {sortedUsers.map((user, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-3 bg-card/40 border border-border/40 rounded-lg hover:bg-card/60 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                                            <span className="text-xs font-medium text-primary">
                                                {user.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <span className="text-sm font-medium text-foreground">{user}</span>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        #{index + 1}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">No users found for this category</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});

UserListModal.displayName = 'UserListModal';

export default UserListModal;