"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getApiClient } from "@/src/infrastructure/adapters/api/api-client";
import {
  getProducts,
  getProductTags,
  createProductTag,
  type Product,
  type ProductTag,
} from "@/src/infrastructure/adapters/api/commerce-api";
import { Wrap, Card, Header, Title, Subtitle, Form, Input, Select, Button, Table, Th, Td, ErrorText, Empty } from "../_shared";

export default function CommerceTagsPage() {
  const { t } = useTranslation();
  const api = getApiClient();
  const [products, setProducts] = useState<Product[]>([]);
  const [tags, setTags] = useState<ProductTag[]>([]);
  const [posts, setPosts] = useState<Array<{ postId: string; userId: string; caption?: string }>>([]);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    postId: "",
    productId: "",
    position: "0.5,0.5",
    mediaType: "POST",
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [productRes, tagsRes, postRes] = await Promise.all([
          getProducts({ page: 1, limit: 100 }),
          getProductTags({ page: 1, limit: 100 }),
          api.get<Array<{ postId: string; userId: string; caption?: string }>>("admin/list/posts?page=1&limit=50"),
        ]);
        if (productRes.success && Array.isArray(productRes.data)) setProducts(productRes.data);
        if (tagsRes.success && Array.isArray(tagsRes.data)) setTags(tagsRes.data);
        if (postRes.success && Array.isArray(postRes.data)) setPosts(postRes.data);
      } catch {
        setError(t("error.loadFailed"));
      }
    };
    void load();
  }, [api, t]);

  return (
    <Wrap>
      {error && <ErrorText>{error}</ErrorText>}
      <Card>
        <Header>
          <div>
            <Title>{t("commerce.tagsTitle")}</Title>
            <Subtitle>{t("commerce.tagsSubtitle")}</Subtitle>
          </div>
        </Header>
        <Form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              const res = await createProductTag({
                postId: form.postId,
                productId: form.productId,
                position: form.position,
                mediaType: form.mediaType as "POST" | "STORY",
              });
              if (res.success && res.data) {
                setTags((prev) => [res.data as ProductTag, ...prev]);
                setForm((prev) => ({ ...prev, postId: "", productId: "" }));
              }
            } catch {
              setError(t("commerce.saveFailed"));
            }
          }}
        >
          <Select value={form.postId} onChange={(e) => setForm((p) => ({ ...p, postId: e.target.value }))}>
            <option value="">{t("commerce.selectPost")}</option>
            {posts.map((p) => (
              <option key={p.postId} value={p.postId}>
                {p.caption ? `${p.userId} · ${p.caption.slice(0, 24)}` : p.postId}
              </option>
            ))}
          </Select>
          <Select value={form.productId} onChange={(e) => setForm((p) => ({ ...p, productId: e.target.value }))}>
            <option value="">{t("commerce.selectProduct")}</option>
            {products.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
          </Select>
          <Select value={form.mediaType} onChange={(e) => setForm((p) => ({ ...p, mediaType: e.target.value }))}>
            <option value="POST">Post</option>
            <option value="STORY">Story</option>
          </Select>
          <Input value={form.position} onChange={(e) => setForm((p) => ({ ...p, position: e.target.value }))} placeholder={t("commerce.tagPosition")} />
          <Button type="submit">{t("commerce.createTag")}</Button>
        </Form>
        <Table>
          <thead>
            <tr>
              <Th>{t("commerce.tablePost")}</Th>
              <Th>{t("commerce.tableProduct")}</Th>
              <Th>{t("commerce.tableMediaType")}</Th>
              <Th>{t("commerce.tableTagPosition")}</Th>
              <Th>{t("commerce.tableProductLink")}</Th>
            </tr>
          </thead>
          <tbody>
            {tags.length === 0 ? (
              <tr><Td colSpan={5}><Empty>{t("commerce.emptyTags")}</Empty></Td></tr>
            ) : tags.map((tag) => (
              <tr key={tag.id}>
                <Td>{tag.postId}</Td>
                <Td>{tag.productTitle}</Td>
                <Td>{tag.mediaType}</Td>
                <Td>{tag.position}</Td>
                <Td>{tag.productUrl}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </Wrap>
  );
}
