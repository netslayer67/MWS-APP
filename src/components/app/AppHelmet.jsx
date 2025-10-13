import React, { memo } from "react";
import { Helmet } from "react-helmet";

const AppHelmet = memo(() => (
    <>
        <title>Kerjain — Dapatkan Bantuan, Tawarkan Jasa</title>
        <meta name="description" content="Kerjain: platform auto-matching untuk tugas mikro hingga proyek makro." />
        <meta property="og:title" content="Kerjain — Dapatkan Bantuan, Tawarkan Jasa" />
        <meta property="og:description" content="Platform auto-matching untuk semua jenis pekerjaan." />
        <meta name="theme-color" content="#8B1C2F" />
    </>
));

AppHelmet.displayName = 'AppHelmet';
export default AppHelmet;