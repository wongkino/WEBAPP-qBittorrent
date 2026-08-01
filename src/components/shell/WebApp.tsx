"use client";

import { QbDashboard } from "@/components/shell/QbDashboard";
import { I18nProvider } from "@/components/ui/I18nProvider";

export function WebApp() {
  return (
    <I18nProvider>
      <QbDashboard />
    </I18nProvider>
  );
}
