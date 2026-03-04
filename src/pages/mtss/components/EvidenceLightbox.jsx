import { memo, useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Download, ZoomIn } from "lucide-react";

const EvidenceLightbox = memo(({ images = [], initialIndex = 0, onClose }) => {
    const [current, setCurrent] = useState(initialIndex);

    const goPrev = useCallback(() => setCurrent((i) => (i > 0 ? i - 1 : images.length - 1)), [images.length]);
    const goNext = useCallback(() => setCurrent((i) => (i < images.length - 1 ? i + 1 : 0)), [images.length]);

    useEffect(() => {
        const handler = (e) => {
            if (e.key === "Escape") onClose();
            else if (e.key === "ArrowLeft") goPrev();
            else if (e.key === "ArrowRight") goNext();
        };
        window.addEventListener("keydown", handler);
        document.body.style.overflow = "hidden";
        return () => {
            window.removeEventListener("keydown", handler);
            document.body.style.overflow = "";
        };
    }, [onClose, goPrev, goNext]);

    const item = images[current];
    if (!item) return null;

    const handleDownload = () => {
        const a = document.createElement("a");
        a.href = item.url;
        a.download = item.fileName || "evidence";
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.click();
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="fixed inset-0 z-[100] flex items-center justify-center"
            >
                {/* Backdrop */}
                <div className="absolute inset-0 bg-black/90" onClick={onClose} />

                {/* Top bar */}
                <div className="absolute top-0 inset-x-0 z-10 flex items-center justify-between px-4 py-3">
                    <p className="text-white/80 text-xs sm:text-sm font-medium truncate max-w-[60%]">
                        {item.fileName || `Image ${current + 1}`}
                    </p>
                    <div className="flex items-center gap-2">
                        <span className="text-white/50 text-xs">{current + 1}/{images.length}</span>
                        <button onClick={handleDownload} className="p-2 rounded-full hover:bg-white/10 transition-colors" title="Download">
                            <Download className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </button>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors" title="Close">
                            <X className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </button>
                    </div>
                </div>

                {/* Image */}
                <motion.img
                    key={item.url}
                    src={item.url}
                    alt={item.fileName || "Evidence"}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                    className="relative z-[1] max-h-[85vh] max-w-[90vw] object-contain rounded-lg select-none"
                    draggable={false}
                />

                {/* Nav buttons */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={goPrev}
                            className="absolute left-2 sm:left-4 z-10 p-2 sm:p-3 rounded-full bg-black/40 hover:bg-black/60 transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </button>
                        <button
                            onClick={goNext}
                            className="absolute right-2 sm:right-4 z-10 p-2 sm:p-3 rounded-full bg-black/40 hover:bg-black/60 transition-colors"
                        >
                            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </button>
                    </>
                )}
            </motion.div>
        </AnimatePresence>
    );
});
EvidenceLightbox.displayName = "EvidenceLightbox";

export default EvidenceLightbox;
