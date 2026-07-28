"use client";

import { QbDashboard } from "@/components/QbDashboard";
import { I18nProvider } from "@/components/I18nProvider";

export function WebApp() {
  return (
    <I18nProvider>
      <WebAppInner />
    </I18nProvider>
  );
}

function WebAppInner() {
  return <QbDashboard />;
}
