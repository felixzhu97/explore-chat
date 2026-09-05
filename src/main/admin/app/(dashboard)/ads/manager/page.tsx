"use client";

import { useState } from "react";
import keyBy from "lodash/keyBy";
import { useTranslation } from "react-i18next";
import { styled } from "@/src/shared/utils/emotion";
import {
  createAdAccount,
  createAdCampaign,
  linkFacebookAdManager,
  updateAdCampaign,
  type AdCampaign,
} from "@/src/infrastructure/adapters/api/ads-api";
import { useAdsData } from "../_use-ads-data";
import {
  PageRoot,
  Card,
  CardHeader,
  CardTitle,
  CardSubtitle,
  Select,
  SecondaryButton,
  SummaryRow,
  InlineForm,
  Input,
  SmallSelect,
  Button,
  InlineError,
  TableWrap,
  Table,
  Th,
  Td,
  StatusBadge,
  EmptyState,
  ErrorText,
  formatBudget,
  statusLabel,
  objectiveLabel,
} from "../_shared";

const HeaderActions = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

export default function AdsManagerPage() {
  const { t } = useTranslation();
  const {
    accounts,
    setAccounts,
    campaigns,
    setCampaigns,
    selectedAccountId,
    setSelectedAccountId,
    filteredCampaigns,
    metrics,
    loading,
    error,
    reload,
  } = useAdsData(t);
  const [activeForm, setActiveForm] = useState<"account" | "campaign" | null>(null);
  const [accountForm, setAccountForm] = useState({
    name: "",
    currency: "CNY",
    dailyBudget: "",
    totalBudget: "",
  });
  const [campaignForm, setCampaignForm] = useState({
    accountId: "",
    name: "",
    objective: "IMPRESSIONS",
    dailyBudget: "",
    totalBudget: "",
  });
  const [fbForm, setFbForm] = useState({
    businessId: "",
    adAccountId: "",
    accessToken: "",
  });
  const [accountError, setAccountError] = useState<string | null>(null);
  const [campaignError, setCampaignError] = useState<string | null>(null);
  const [fbError, setFbError] = useState<string | null>(null);
  const accountById = keyBy(accounts, "id");

  return (
    <PageRoot>
      {error && <ErrorText>{error}</ErrorText>}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>{t("ads.moduleManager")}</CardTitle>
            <CardSubtitle>{t("ads.managerSubtitle")}</CardSubtitle>
          </div>
          <HeaderActions>
            <Select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value as string | "all")}
            >
              <option value="all">{t("ads.allAccounts")}</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </Select>
            <SecondaryButton type="button" onClick={() => void reload()}>
              {t("common.search")}
            </SecondaryButton>
          </HeaderActions>
        </CardHeader>
        <SummaryRow>
          <span>{t("ads.accountSummaryCount", { count: accounts.length })}</span>
          <span>{t("ads.accountSummaryBudget", { budget: formatBudget(metrics.accountDailyBudget) })}</span>
          <span>{t("ads.campaignSummaryCount", { count: campaigns.length })}</span>
          <span>{t("ads.campaignSummaryBudget", { budget: formatBudget(metrics.campaignDailyBudget) })}</span>
        </SummaryRow>
        <InlineForm
          onSubmit={async (e) => {
            e.preventDefault();
            setFbError(null);
            if (!fbForm.businessId.trim() || !fbForm.adAccountId.trim() || !fbForm.accessToken.trim()) {
              setFbError(t("ads.fbLinkRequired"));
              return;
            }
            try {
              const res = await linkFacebookAdManager({
                businessId: fbForm.businessId.trim(),
                adAccountId: fbForm.adAccountId.trim(),
                accessToken: fbForm.accessToken.trim(),
              });
              if (!res.success) setFbError(t("ads.saveFailed"));
              else setFbForm({ businessId: "", adAccountId: "", accessToken: "" });
            } catch {
              setFbError(t("ads.saveFailed"));
            }
          }}
        >
          <Input
            placeholder={t("ads.fbBusinessId")}
            value={fbForm.businessId}
            onChange={(e) => setFbForm((prev) => ({ ...prev, businessId: e.target.value }))}
          />
          <Input
            placeholder={t("ads.fbAdAccountId")}
            value={fbForm.adAccountId}
            onChange={(e) => setFbForm((prev) => ({ ...prev, adAccountId: e.target.value }))}
          />
          <Input
            placeholder={t("ads.fbAccessToken")}
            value={fbForm.accessToken}
            onChange={(e) => setFbForm((prev) => ({ ...prev, accessToken: e.target.value }))}
          />
          <Button type="submit">{t("ads.linkFacebook")}</Button>
        </InlineForm>
        {fbError && <InlineError>{fbError}</InlineError>}
        <InlineForm>
          <Button type="button" onClick={() => setActiveForm((prev) => (prev === "account" ? null : "account"))}>
            {t("ads.newAccount")}
          </Button>
          <Button type="button" onClick={() => setActiveForm((prev) => (prev === "campaign" ? null : "campaign"))}>
            {t("ads.newCampaign")}
          </Button>
        </InlineForm>
        {activeForm === "account" && (
          <>
            <InlineForm
              onSubmit={async (e) => {
                e.preventDefault();
                setAccountError(null);
                if (!accountForm.name.trim()) {
                  setAccountError(t("ads.nameRequired"));
                  return;
                }
                const daily = accountForm.dailyBudget.trim();
                const total = accountForm.totalBudget.trim();
                const dailyCents = daily ? Math.round(parseFloat(daily) * 100) : null;
                const totalCents = total ? Math.round(parseFloat(total) * 100) : null;
                if ((daily && isNaN(dailyCents as number)) || (total && isNaN(totalCents as number))) {
                  setAccountError(t("ads.budgetNumber"));
                  return;
                }
                try {
                  const res = await createAdAccount({
                    name: accountForm.name.trim(),
                    currency: accountForm.currency || "CNY",
                    dailyBudgetCents: dailyCents,
                    totalBudgetCents: totalCents,
                  });
                  if (res.success && res.data) {
                    const created = res.data;
                    setAccounts((prev) => [created, ...prev]);
                    setActiveForm(null);
                  }
                } catch {
                  setAccountError(t("ads.saveFailed"));
                }
              }}
            >
              <Input
                placeholder={t("ads.accountNamePlaceholder")}
                value={accountForm.name}
                onChange={(e) => setAccountForm((prev) => ({ ...prev, name: e.target.value }))}
              />
              <Input
                placeholder={t("ads.dailyBudgetPlaceholder")}
                value={accountForm.dailyBudget}
                onChange={(e) => setAccountForm((prev) => ({ ...prev, dailyBudget: e.target.value }))}
              />
              <Input
                placeholder={t("ads.totalBudgetPlaceholder")}
                value={accountForm.totalBudget}
                onChange={(e) => setAccountForm((prev) => ({ ...prev, totalBudget: e.target.value }))}
              />
              <SmallSelect
                value={accountForm.currency}
                onChange={(e) => setAccountForm((prev) => ({ ...prev, currency: e.target.value }))}
              >
                <option value="CNY">CNY</option>
                <option value="USD">USD</option>
              </SmallSelect>
              <Button type="submit">{t("common.save")}</Button>
            </InlineForm>
            {accountError && <InlineError>{accountError}</InlineError>}
          </>
        )}
        {activeForm === "campaign" && (
          <>
            <InlineForm
              onSubmit={async (e) => {
                e.preventDefault();
                setCampaignError(null);
                if (!campaignForm.name.trim()) {
                  setCampaignError(t("ads.nameRequired"));
                  return;
                }
                if (!campaignForm.accountId) {
                  setCampaignError(t("ads.accountRequired"));
                  return;
                }
                const daily = campaignForm.dailyBudget.trim();
                const total = campaignForm.totalBudget.trim();
                const dailyCents = daily ? Math.round(parseFloat(daily) * 100) : null;
                const totalCents = total ? Math.round(parseFloat(total) * 100) : null;
                if ((daily && isNaN(dailyCents as number)) || (total && isNaN(totalCents as number))) {
                  setCampaignError(t("ads.budgetNumber"));
                  return;
                }
                try {
                  const res = await createAdCampaign({
                    accountId: campaignForm.accountId,
                    name: campaignForm.name.trim(),
                    objective: campaignForm.objective,
                    dailyBudgetCents: dailyCents,
                    totalBudgetCents: totalCents,
                  });
                  if (res.success && res.data) {
                    const created = res.data;
                    setCampaigns((prev) => [created, ...prev]);
                    setActiveForm(null);
                  }
                } catch {
                  setCampaignError(t("ads.saveFailed"));
                }
              }}
            >
              <SmallSelect
                value={campaignForm.accountId}
                onChange={(e) => setCampaignForm((prev) => ({ ...prev, accountId: e.target.value }))}
              >
                <option value="">{t("ads.selectAccountPlaceholder")}</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </SmallSelect>
              <Input
                placeholder={t("ads.campaignNamePlaceholder")}
                value={campaignForm.name}
                onChange={(e) => setCampaignForm((prev) => ({ ...prev, name: e.target.value }))}
              />
              <SmallSelect
                value={campaignForm.objective}
                onChange={(e) => setCampaignForm((prev) => ({ ...prev, objective: e.target.value }))}
              >
                <option value="IMPRESSIONS">{t("ads.objectiveImpressions")}</option>
                <option value="CLICKS">{t("ads.objectiveClicks")}</option>
                <option value="CONVERSIONS">{t("ads.objectiveConversions")}</option>
              </SmallSelect>
              <Input
                placeholder={t("ads.dailyBudgetPlaceholder")}
                value={campaignForm.dailyBudget}
                onChange={(e) => setCampaignForm((prev) => ({ ...prev, dailyBudget: e.target.value }))}
              />
              <Input
                placeholder={t("ads.totalBudgetPlaceholder")}
                value={campaignForm.totalBudget}
                onChange={(e) => setCampaignForm((prev) => ({ ...prev, totalBudget: e.target.value }))}
              />
              <Button type="submit">{t("common.save")}</Button>
            </InlineForm>
            {campaignError && <InlineError>{campaignError}</InlineError>}
          </>
        )}
        <TableWrap>
          <Table>
            <thead>
              <tr>
                <Th>{t("ads.tableAccount")}</Th>
                <Th>{t("ads.tableName")}</Th>
                <Th>{t("ads.tableObjective")}</Th>
                <Th>{t("ads.tableStatus")}</Th>
                <Th>{t("ads.tableDailyBudget")}</Th>
                <Th>{t("ads.tableTotalBudget")}</Th>
                <Th>{t("ads.tableCurrency")}</Th>
                <Th>{t("common.action")}</Th>
              </tr>
            </thead>
            <tbody>
              {loading && filteredCampaigns.length === 0 ? (
                <tr>
                  <Td colSpan={8}>
                    <EmptyState>{t("common.loading")}</EmptyState>
                  </Td>
                </tr>
              ) : filteredCampaigns.length === 0 ? (
                <tr>
                  <Td colSpan={8}>
                    <EmptyState>{t("ads.emptyCampaigns")}</EmptyState>
                  </Td>
                </tr>
              ) : (
                filteredCampaigns.map((c) => {
                  const acc = accountById[c.accountId];
                  const nextStatus = c.status === "ACTIVE" ? "PAUSED" : "ACTIVE";
                  return (
                    <tr key={c.id}>
                      <Td>{acc?.name ?? c.accountId}</Td>
                      <Td>{c.name}</Td>
                      <Td>{objectiveLabel(t, c.objective)}</Td>
                      <Td>
                        <StatusBadge status={c.status}>{statusLabel(t, c.status)}</StatusBadge>
                      </Td>
                      <Td>{formatBudget(c.dailyBudgetCents)}</Td>
                      <Td>{formatBudget(c.totalBudgetCents)}</Td>
                      <Td>{acc?.currency ?? "—"}</Td>
                      <Td>
                        <SecondaryButton
                          type="button"
                          onClick={async () => {
                            try {
                              const res = await updateAdCampaign(c.id, { status: nextStatus });
                              if (res.success && res.data) {
                                setCampaigns((prev) =>
                                  prev.map((item) => (item.id === c.id ? (res.data as AdCampaign) : item)),
                                );
                              }
                            } catch {
                              setCampaignError(t("ads.saveFailed"));
                            }
                          }}
                        >
                          {nextStatus === "ACTIVE" ? t("ads.activate") : t("ads.pause")}
                        </SecondaryButton>
                      </Td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </Table>
        </TableWrap>
      </Card>
    </PageRoot>
  );
}
