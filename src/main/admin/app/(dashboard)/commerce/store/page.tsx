"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { styled } from "@/src/shared/utils/emotion";
import { theme } from "@/src/shared/theme";
import {
  getShops,
  createShop,
  getProducts,
  type Shop,
  type Product,
} from "@/src/infrastructure/adapters/api/commerce-api";
import { Wrap, Card, Header, Title, Subtitle, Form, Input, Select, Button, Table, Th, Td, ErrorText, Empty, money } from "../_shared";

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 20, 25, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const ModalPanel = styled.div`
  width: min(820px, 100%);
  max-height: 80vh;
  overflow: auto;
  background: ${theme.surface};
  border-radius: 12px;
  border: 1px solid ${theme.border};
  box-shadow: ${theme.shadow};
  padding: 1rem 1.1rem;
`;

const ClickableRow = styled.tr`
  cursor: pointer;
  &:hover td {
    background: ${theme.surfaceAlt};
  }
`;

export default function CommerceStorePage() {
  const { t } = useTranslation();
  const [shops, setShops] = useState<Shop[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeShopId, setActiveShopId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [shopForm, setShopForm] = useState({ name: "", currency: "CNY" });

  useEffect(() => {
    const load = async () => {
      try {
        const [shopRes, productRes] = await Promise.all([
          getShops({ page: 1, limit: 50 }),
          getProducts({ page: 1, limit: 100 }),
        ]);
        if (shopRes.success && Array.isArray(shopRes.data)) setShops(shopRes.data);
        if (productRes.success && Array.isArray(productRes.data)) setProducts(productRes.data);
      } catch {
        setError(t("error.loadFailed"));
      }
    };
    void load();
  }, [t]);

  const activeShop = activeShopId ? shops.find((s) => s.id === activeShopId) ?? null : null;
  const activeShopProducts = activeShopId ? products.filter((p) => p.shopId === activeShopId) : [];

  return (
    <Wrap>
      {error && <ErrorText>{error}</ErrorText>}
      <Card>
        <Header>
          <div>
            <Title>{t("commerce.storeTitle")}</Title>
            <Subtitle>{t("commerce.storeSubtitle")}</Subtitle>
          </div>
        </Header>
        <Form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              const res = await createShop({
                name: shopForm.name.trim(),
                currency: shopForm.currency,
              });
              if (res.success && res.data) {
                setShops((prev) => [res.data as Shop, ...prev]);
                setShopForm({ name: "", currency: "CNY" });
              }
            } catch {
              setError(t("commerce.saveFailed"));
            }
          }}
        >
          <Input placeholder={t("commerce.shopName")} value={shopForm.name} onChange={(e) => setShopForm((p) => ({ ...p, name: e.target.value }))} />
          <Select value={shopForm.currency} onChange={(e) => setShopForm((p) => ({ ...p, currency: e.target.value }))}>
            <option value="CNY">CNY</option>
            <option value="USD">USD</option>
          </Select>
          <Button type="submit">{t("commerce.createShop")}</Button>
        </Form>
        <Table>
          <thead>
            <tr>
              <Th>{t("commerce.tableShop")}</Th>
              <Th>{t("commerce.tableCurrency")}</Th>
              <Th>{t("commerce.tableStatus")}</Th>
              <Th>{t("commerce.tableProductCount")}</Th>
            </tr>
          </thead>
          <tbody>
            {shops.length === 0 ? (
              <tr><Td colSpan={4}><Empty>{t("commerce.emptyShops")}</Empty></Td></tr>
            ) : shops.map((s) => (
              <ClickableRow key={s.id} onClick={() => setActiveShopId(s.id)}>
                <Td>{s.name}</Td>
                <Td>{s.currency}</Td>
                <Td>{s.status}</Td>
                <Td>{s.productCount}</Td>
              </ClickableRow>
            ))}
          </tbody>
        </Table>
      </Card>
      {activeShop && (
        <ModalOverlay onClick={() => setActiveShopId(null)} role="presentation">
          <ModalPanel onClick={(e) => e.stopPropagation()}>
            <Header>
              <div>
                <Title>{`${activeShop.name} · ${t("commerce.productTitle")}`}</Title>
                <Subtitle>{t("commerce.productSubtitle")}</Subtitle>
              </div>
              <Button type="button" onClick={() => setActiveShopId(null)}>
                {t("common.cancel")}
              </Button>
            </Header>
            <Table>
              <thead>
                <tr>
                  <Th>{t("commerce.tableProduct")}</Th>
                  <Th>{t("commerce.tablePrice")}</Th>
                  <Th>{t("commerce.tableInventory")}</Th>
                  <Th>{t("commerce.tableStatus")}</Th>
                </tr>
              </thead>
              <tbody>
                {activeShopProducts.length === 0 ? (
                  <tr>
                    <Td colSpan={4}>
                      <Empty>{t("commerce.emptyProducts")}</Empty>
                    </Td>
                  </tr>
                ) : (
                  activeShopProducts.map((p) => (
                    <tr key={p.id}>
                      <Td>{p.title}</Td>
                      <Td>{money(p.priceCents)}</Td>
                      <Td>{p.inventory}</Td>
                      <Td>{p.status}</Td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </ModalPanel>
        </ModalOverlay>
      )}
    </Wrap>
  );
}
