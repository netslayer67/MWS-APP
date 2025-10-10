import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

const Slide = ({
    onComplete,
    label = "Geser untuk Selesai",
    completedLabel = "Tugas Selesai!",
    threshold = 0.8, // seberapa jauh harus digeser
    className = "",
}) => {
    const [completed, setCompleted] = useState(false);
    const constraintsRef = useRef(null);

    const handleDragEnd = (event, info) => {
        if (!constraintsRef.current) return;
        const width = constraintsRef.current.offsetWidth;
        if (info.point.x - info.offset.x > width * threshold) {
            setCompleted(true);
            if (onComplete) onComplete();
        }
    };

    return (
        <div
            ref={constraintsRef}
            className={`relative w-full h-14 rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30 overflow-hidden ${className}`}
        >
            {!completed ? (
                <>
                    <motion.div
                        className="absolute top-0 left-0 h-full bg-primary/40"
                        initial={{ width: 0 }}
                        animate={{ width: completed ? "100%" : "0%" }}
                        transition={{ duration: 0.3 }}
                    />
                    <motion.div
                        drag="x"
                        dragConstraints={constraintsRef}
                        dragElastic={0.05}
                        onDragEnd={handleDragEnd}
                        className="absolute top-0 left-0 w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-lg cursor-pointer"
                        whileTap={{ scale: 0.95 }}
                    >
                        <CheckCircle className="text-white w-6 h-6" />
                    </motion.div>
                    <div className="absolute inset-0 flex items-center justify-center text-white font-medium">
                        {label}
                    </div>
                </>
            ) : (
                <div className="absolute inset-0 flex items-center justify-center text-green-500 font-bold">
                    {completedLabel}
                </div>
            )}
        </div>
    );
};

export default Slide;
