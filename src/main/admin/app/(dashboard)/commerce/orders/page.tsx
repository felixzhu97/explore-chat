"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getOrders, type Order } from "@/src/infrastructure/adapters/api/commerce-api";
import { Wrap, Card, Header, Title, Subtitle, Select, Table, Th, Td, ErrorText, Empty, money } from "../_shared";

export default function CommerceOrdersPage() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [status, setStatus] = useState("all");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getOrders({ page: 1, limit: 100, status: status === "all" ? undefined : status });
        if (res.success && Array.isArray(res.data)) setOrders(res.data);
      } catch {
        setError(t("error.loadFailed"));
      }
    };
    void load();
  }, [status, t]);

  return (
    <Wrap>
      {error && <ErrorText>{error}</ErrorText>}
      <Card>
        <Header>
          <div>
            <Title>{t("commerce.ordersTitle")}</Title>
            <Subtitle>{t("commerce.ordersSubtitle")}</Subtitle>
          </div>
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">{t("commerce.allOrders")}</option>
            <option value="PENDING">{t("commerce.orderPending")}</option>
            <option value="PAID">{t("commerce.orderPaid")}</option>
            <option value="SHIPPED">{t("commerce.orderShipped")}</option>
            <option value="COMPLETED">{t("commerce.orderCompleted")}</option>
            <option value="CANCELLED">{t("commerce.orderCancelled")}</option>
          </Select>
        </Header>
        <Table>
          <thead>
            <tr>
              <Th>{t("commerce.tableOrderId")}</Th>
              <Th>{t("commerce.tableExternalOrderId")}</Th>
              <Th>{t("commerce.tableCustomer")}</Th>
              <Th>{t("commerce.tableAmount")}</Th>
              <Th>{t("commerce.tableOrderStatus")}</Th>
              <Th>{t("commerce.tablePlatform")}</Th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr><Td colSpan={6}><Empty>{t("commerce.emptyOrders")}</Empty></Td></tr>
            ) : orders.map((o) => (
              <tr key={o.id}>
                <Td>{o.id}</Td>
                <Td>{o.externalOrderId}</Td>
                <Td>{o.customerName}</Td>
                <Td>{money(o.totalCents)}</Td>
                <Td>{o.status}</Td>
                <Td>{o.ecommercePlatform}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </Wrap>
  );
}
