"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  createAdCampaign,
  createPromotedPost,
  type AdCampaign,
  type PromotedPost,
} from "@/src/infrastructure/adapters/api/ads-api";
import { useAdsData } from "../_use-ads-data";
import {
  PageRoot,
  Card,
  CardHeader,
  CardTitle,
  CardSubtitle,
  InlineForm,
  SmallSelect,
  Input,
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

export default function AdsPromotePage() {
  const { t } = useTranslation();
  const { accounts, promotablePosts, promotedPosts, setPromotedPosts, setCampaigns, loading, error } = useAdsData(t);
  const [promoteError, setPromoteError] = useState<string | null>(null);
  const [promoteForm, setPromoteForm] = useState({
    postId: "",
    accountId: "",
    objective: "IMPRESSIONS",
    audience: "18-34, interests: lifestyle",
    dailyBudget: "",
    totalBudget: "",
  });

  return (
    <PageRoot>
      {error && <ErrorText>{error}</ErrorText>}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>{t("ads.modulePromote")}</CardTitle>
            <CardSubtitle>{t("ads.promoteSubtitle")}</CardSubtitle>
          </div>
        </CardHeader>
        <InlineForm
          onSubmit={async (e) => {
            e.preventDefault();
            setPromoteError(null);
            const daily = Math.round(parseFloat(promoteForm.dailyBudget || "0") * 100);
            const total = promoteForm.totalBudget.trim()
              ? Math.round(parseFloat(promoteForm.totalBudget.trim()) * 100)
              : null;
            if (!promoteForm.postId || !promoteForm.accountId || !promoteForm.audience.trim()) {
              setPromoteError(t("ads.promoteRequired"));
              return;
            }
            if (!daily || isNaN(daily) || (total != null && isNaN(total))) {
              setPromoteError(t("ads.budgetNumber"));
              return;
            }
            try {
              const res = await createPromotedPost({
                postId: promoteForm.postId,
                accountId: promoteForm.accountId,
                objective: promoteForm.objective as "IMPRESSIONS" | "CLICKS" | "CONVERSIONS",
                audience: promoteForm.audience.trim(),
                dailyBudgetCents: daily,
                totalBudgetCents: total,
              });
              if (res.success && res.data) {
                setPromotedPosts((prev) => [res.data as PromotedPost, ...prev]);
              } else {
                const fallbackCampaign = await createAdCampaign({
                  accountId: promoteForm.accountId,
                  name: `${t("ads.promotedPostPrefix")} ${promoteForm.postId}`,
                  objective: promoteForm.objective,
                  dailyBudgetCents: daily,
                  totalBudgetCents: total,
                });
                if (fallbackCampaign.success && fallbackCampaign.data) {
                  setCampaigns((prev) => [fallbackCampaign.data as AdCampaign, ...prev]);
                }
              }
              setPromoteForm((prev) => ({ ...prev, postId: "", dailyBudget: "", totalBudget: "" }));
            } catch {
              setPromoteError(t("ads.saveFailed"));
            }
          }}
        >
          <SmallSelect
            value={promoteForm.postId}
            onChange={(e) => setPromoteForm((prev) => ({ ...prev, postId: e.target.value }))}
          >
            <option value="">{t("ads.selectPostPlaceholder")}</option>
            {promotablePosts.map((p) => (
              <option key={p.postId} value={p.postId}>
                {p.caption ? `${p.userId} · ${p.caption.slice(0, 28)}` : p.postId}
              </option>
            ))}
          </SmallSelect>
          <SmallSelect
            value={promoteForm.accountId}
            onChange={(e) => setPromoteForm((prev) => ({ ...prev, accountId: e.target.value }))}
          >
            <option value="">{t("ads.selectAccountPlaceholder")}</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </SmallSelect>
          <SmallSelect
            value={promoteForm.objective}
            onChange={(e) => setPromoteForm((prev) => ({ ...prev, objective: e.target.value }))}
          >
            <option value="IMPRESSIONS">{t("ads.objectiveImpressions")}</option>
            <option value="CLICKS">{t("ads.objectiveClicks")}</option>
            <option value="CONVERSIONS">{t("ads.objectiveConversions")}</option>
          </SmallSelect>
          <Input
            placeholder={t("ads.audiencePlaceholder")}
            value={promoteForm.audience}
            onChange={(e) => setPromoteForm((prev) => ({ ...prev, audience: e.target.value }))}
          />
          <Input
            placeholder={t("ads.dailyBudgetPlaceholder")}
            value={promoteForm.dailyBudget}
            onChange={(e) => setPromoteForm((prev) => ({ ...prev, dailyBudget: e.target.value }))}
          />
          <Input
            placeholder={t("ads.totalBudgetPlaceholder")}
            value={promoteForm.totalBudget}
            onChange={(e) => setPromoteForm((prev) => ({ ...prev, totalBudget: e.target.value }))}
          />
          <Button type="submit">{t("ads.promoteNow")}</Button>
        </InlineForm>
        {promoteError && <InlineError>{promoteError}</InlineError>}
        <TableWrap>
          <Table>
            <thead>
              <tr>
                <Th>{t("ads.tablePost")}</Th>
                <Th>{t("ads.tableAccount")}</Th>
                <Th>{t("ads.tableObjective")}</Th>
                <Th>{t("ads.tableAudience")}</Th>
                <Th>{t("ads.tableStatus")}</Th>
                <Th>{t("ads.tableDailyBudget")}</Th>
                <Th>{t("ads.tableSpend")}</Th>
              </tr>
            </thead>
            <tbody>
              {loading && promotedPosts.length === 0 ? (
                <tr>
                  <Td colSpan={7}>
                    <EmptyState>{t("common.loading")}</EmptyState>
                  </Td>
                </tr>
              ) : promotedPosts.length === 0 ? (
                <tr>
                  <Td colSpan={7}>
                    <EmptyState>{t("ads.emptyPromotions")}</EmptyState>
                  </Td>
                </tr>
              ) : (
                promotedPosts.map((item) => {
                  const acc = accounts.find((a) => a.id === item.accountId);
                  return (
                    <tr key={item.id}>
                      <Td>{item.postId}</Td>
                      <Td>{acc?.name ?? item.accountId}</Td>
                      <Td>{objectiveLabel(t, item.objective)}</Td>
                      <Td>{item.audience}</Td>
                      <Td>
                        <StatusBadge status={item.status}>{statusLabel(t, item.status)}</StatusBadge>
                      </Td>
                      <Td>{formatBudget(item.dailyBudgetCents)}</Td>
                      <Td>{formatBudget(item.spendCents)}</Td>
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
