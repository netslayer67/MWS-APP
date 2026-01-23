import React, { memo } from "react";
import TeacherStatCards from "../teacher/TeacherStatCards";
import DashboardOverviewRoster from "./DashboardOverviewRoster";
import DashboardOverviewSpotlight from "./DashboardOverviewSpotlight";

const DashboardOverview = memo(({ statCards, students, progressData, TierPill, ProgressBadge, onView, onUpdate }) => (
    <div className="space-y-8 mtss-theme">
        <TeacherStatCards statCards={statCards} />
        <DashboardOverviewRoster
            students={students}
            TierPill={TierPill}
            ProgressBadge={ProgressBadge}
            onView={onView}
            onUpdate={onUpdate}
        />
        <DashboardOverviewSpotlight students={students} progressData={progressData} TierPill={TierPill} />
    </div>
));

DashboardOverview.displayName = "DashboardOverview";
export default DashboardOverview;
