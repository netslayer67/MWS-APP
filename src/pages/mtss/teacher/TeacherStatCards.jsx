import React, { memo } from "react";
import { motion } from "framer-motion";

const TeacherStatCards = ({ statCards }) => (
    <section className="grid md:grid-cols-3 gap-6">
        {statCards.map((card, index) => (
            <motion.div
                key={card.label}
                className="mtss-glass-stat"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -6, scale: 1.01 }}
                transition={{ delay: index * 0.05 }}
            >
                <div className="mtss-glass-stat__layer mtss-glass-stat__layer--blur" />
                <div className="mtss-glass-stat__layer mtss-glass-stat__layer--glow" />
                <div className="relative flex items-center justify-between gap-6">
                    <div>
                        <p className="uppercase text-xs tracking-[0.4em] text-slate-800/80 dark:text-white/75">{card.label}</p>
                        <p className="text-4xl font-black mt-2 text-slate-900 dark:text-white drop-shadow-lg dark:drop-shadow-none">
                            {card.value}
                        </p>
                        <p className="text-sm text-slate-700/90 dark:text-white/80 mt-1">{card.sub}</p>
                    </div>
                    <span className={`mtss-glass-stat__icon bg-gradient-to-br ${card.accent}`}>
                        <card.icon className="w-5 h-5" />
                    </span>
                </div>
            </motion.div>
        ))}
    </section>
);

export default memo(TeacherStatCards);
