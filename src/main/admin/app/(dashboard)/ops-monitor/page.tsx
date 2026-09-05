"use client";

import { useTranslation } from "react-i18next";
import Card from "react-bootstrap/Card";

export default function OpsMonitorPage() {
  const { t } = useTranslation();
  return (
    <div>
      <h1 className="h4 fw-semibold text-body mb-3">{t("opsMonitor.title")}</h1>
      <Card className="rounded-3 border shadow-sm" style={{ maxWidth: 500 }}>
        <Card.Body className="py-4 px-4 text-body-secondary">
          {t("opsMonitor.developing")}
        </Card.Body>
      </Card>
    </div>
  );
}
