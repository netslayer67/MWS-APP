import React from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import AnimatedPage from "@/components/AnimatedPage";
import EmptyState from "@/components/feedback/EmptyState";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export default function NotFound() {
    return (
        <AnimatedPage>
            <Helmet>
                <title>Halaman tidak ditemukan — Kerjain</title>
            </Helmet>
            <div className="relative mx-auto max-w-lg px-3 sm:px-4 py-8">
                <EmptyState
                    icon={<Search className="h-6 w-6" />}
                    title="Halaman tidak ditemukan"
                    subtitle="Link mungkin salah atau sudah tidak berlaku."
                    action={
                        <Link to="/">
                            <Button className="rounded-full bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 transition-colors duration-320">
                                Kembali ke Beranda
                            </Button>
                        </Link>
                    }
                />
            </div>
        </AnimatedPage>
    );
}