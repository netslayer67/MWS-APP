// JobStatusPage.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Users, XCircle } from "lucide-react";
import JobCard from "@/components/JobCard";
import NegotiationModal from "@/components/NegotiationModal";

// ==================
// Dummy jobs (API placeholder)
// ==================
const DUMMY_JOBS = [
    {
        id: 1,
        title: "Beli Kopi Cepat",
        type: "onsite",
        description: "Ambil kopi di kedai depan komplek dan antar ke rumah.",
        client: "Budi S.",
        distance: "500 m",
        fee: 15000,
        feeLabel: "Rp 15.000",
        time: "10 menit",
        paymentMethod: "cash",
        attachments: [],
    },
    {
        id: 2,
        title: "Desain Brosur Produk",
        type: "remote",
        description: "Desain brosur A4, 2 konsep draft. Final PDF & AI.",
        client: "Siti R.",
        distance: null,
        fee: 200000,
        feeLabel: "Rp 200.000",
        time: "2 hari",
        paymentMethod: "wallet",
        attachments: ["brand-guideline.pdf"],
    },
];

// ==================
// Dummy offers (workers apply/nego)
// ==================
const DUMMY_OFFERS = [
    {
        id: 101,
        worker: "Andi P.",
        offers: [
            {
                id: 1,
                amount: 14000,
                by: "worker",
                status: "pending",
                createdAt: Date.now(),
                expiresAt: Date.now() + 60000,
            },
            {
                id: 2,
                amount: 15000,
                by: "client",
                status: "pending",
                createdAt: Date.now(),
                expiresAt: Date.now() + 60000,
            },
        ],
    },
    {
        id: 102,
        worker: "Rina K.",
        offers: [
            {
                id: 3,
                amount: 210000,
                by: "worker",
                status: "pending",
                createdAt: Date.now(),
                expiresAt: Date.now() + 60000,
            },
            {
                id: 4,
                amount: 200000,
                by: "client",
                status: "pending",
                createdAt: Date.now(),
                expiresAt: Date.now() + 60000,
            },
        ],
    },
];

const JobStatusPage = () => {
    const [selectedJob] = useState(DUMMY_JOBS[0]); // job aktif
    const [offers] = useState(DUMMY_OFFERS);
    const [negoOpen, setNegoOpen] = useState(false);
    const [currentNego, setCurrentNego] = useState(null);

    const openNegotiation = (offer) => {
        setCurrentNego(offer);
        setNegoOpen(true);
    };

    return (
        <div className="min-h-screen px-4 py-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="max-w-2xl mx-auto"
            >
                {/* Header */}
                <div className="mb-6 text-center">
                    <h1 className="text-2xl font-semibold text-foreground">Status Job</h1>
                    <p className="text-muted-foreground text-sm">
                        Menunggu worker menerima / nego
                    </p>
                </div>

                {/* Job detail card */}
                <div className="mb-6">
                    <JobCard job={selectedJob} role="client" />
                </div>

                {/* Offers / workers apply */}
                <div className="mb-3 flex items-center gap-2">
                    <Users size={18} className="text-accent" />
                    <h2 className="text-lg font-medium">Penawaran dari Worker</h2>
                </div>

                <div className="space-y-4">
                    {offers.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center py-10 text-muted-foreground"
                        >
                            <Loader2 className="w-6 h-6 animate-spin mb-2" />
                            <p className="text-sm">Menunggu worker...</p>
                        </motion.div>
                    ) : (
                        offers.map((o) => (
                            <motion.div
                                key={o.id}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className="p-4 rounded-xl border bg-card/50 backdrop-blur-md shadow-sm flex justify-between items-start"
                            >
                                <div>
                                    <p className="font-medium text-foreground">{o.worker}</p>
                                    <p className="text-sm mt-1 text-accent font-semibold">
                                        Tawaran: Rp {o.offers[0].amount.toLocaleString("id-ID")}
                                    </p>
                                </div>
                                <button
                                    onClick={() => openNegotiation(o)}
                                    className="px-3 py-1.5 rounded-lg bg-primary text-sm text-secondary hover:bg-primary/90 transition"
                                >
                                    Lihat Nego
                                </button>
                            </motion.div>
                        ))
                    )}
                </div>

                {/* Cancel Job */}
                <div className="mt-8 flex justify-center">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-500 text-red-500 hover:bg-red-500/10 transition">
                        <XCircle size={18} />
                        Cancel Job
                    </button>
                </div>
            </motion.div>

            {/* Negotiation modal */}
            <NegotiationModal
                isOpen={negoOpen}
                onClose={() => setNegoOpen(false)}
                jobFee={selectedJob.fee}
                role="client"
                worker={currentNego?.worker}
                initialOffers={currentNego?.offers || []}
            />
        </div>
    );
};

export default JobStatusPage;
