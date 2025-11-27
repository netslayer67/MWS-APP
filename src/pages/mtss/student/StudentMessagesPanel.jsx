import React, { memo } from "react";
import { MessageCircleHeart } from "lucide-react";

const StudentMessagesPanel = ({ student }) => (
    <div className="space-y-6">
        <div className="rounded-[40px] bg-white/95 dark:bg-white/5 border border-white/40 dark:border-white/10 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground">Messages</p>
                    <h3 className="text-lg font-black text-foreground dark:text-white">Communication Log</h3>
                </div>
                <MessageCircleHeart className="w-5 h-5 text-pink-500" />
            </div>
            <div className="space-y-3">
                {student.data.messages.map((message, index) => (
                    <div
                        key={`${message.from}-${index}`}
                        className="rounded-[28px] bg-gradient-to-r from-[#eef2ff] to-[#e0f2fe] dark:from-white/10 dark:to-white/5 p-4 border border-white/80 dark:border-white/10"
                    >
                        <p className="text-sm font-black text-sky-600 dark:text-sky-300">
                            {message.from} • {message.date}
                        </p>
                        <p className="text-sm text-foreground dark:text-white/80">{message.text}</p>
                    </div>
                ))}
            </div>
            <div className="mt-4 flex gap-3">
                <input
                    type="text"
                    className="flex-1 px-4 py-3 rounded-[24px] border border-white/60 dark:border-white/20 bg-white/80 dark:bg-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-300"
                    placeholder="Type your message... (demo only)"
                    disabled
                />
                <button className="px-6 py-3 rounded-[24px] bg-gradient-to-r from-[#a5b4fc] to-[#fbcfe8] text-sm font-semibold text-white shadow-lg cursor-not-allowed">
                    Send
                </button>
            </div>
        </div>
    </div>
);

StudentMessagesPanel.displayName = "StudentMessagesPanel";
export default memo(StudentMessagesPanel);
