"use client";

import { ServiceWorkerRegister } from "@/components/boot/ServiceWorkerRegister";
import { QbDashboard } from "@/components/shell/QbDashboard";
import { I18nProvider } from "@/components/ui/I18nProvider";

export function WebApp() {
  return (
    <I18nProvider>
      <ServiceWorkerRegister />
      <QbDashboard />
    </I18nProvider>
  );
}
