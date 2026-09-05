import { getApiClient } from "./api-client";
import pickBy from "lodash/pickBy";

const api = getApiClient();

function buildQuery(params?: Record<string, string | number | undefined>) {
  const search = new URLSearchParams();
  const picked = pickBy(params ?? {}, (value) => value !== undefined && value !== "");
  for (const [key, value] of Object.entries(picked)) {
    search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export interface Shop {
  id: string;
  name: string;
  currency: string;
  status: "ACTIVE" | "PAUSED";
  platform: "INSTAGRAM";
  productCount: number;
  createdAt: string;
}

export interface Product {
  id: string;
  shopId: string;
  title: string;
  priceCents: number;
  inventory: number;
  status: "ACTIVE" | "DRAFT" | "ARCHIVED";
  createdAt: string;
}

export interface ProductTag {
  id: string;
  postId: string;
  productId: string;
  productTitle: string;
  productUrl: string;
  position: string;
  mediaType: "POST" | "STORY";
  createdAt: string;
}

export interface Order {
  id: string;
  platform: "INSTAGRAM";
  externalOrderId: string;
  customerName: string;
  totalCents: number;
  status: "PENDING" | "PAID" | "SHIPPED" | "COMPLETED" | "CANCELLED";
  ecommercePlatform: string;
  createdAt: string;
}

export interface Paginated<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

export async function getShops(params?: { page?: number; limit?: number }) {
  return api.get<Paginated<Shop>>(`commerce/shops${buildQuery({ page: params?.page, limit: params?.limit })}`);
}

export async function createShop(body: { name: string; currency: string }) {
  return api.post<Shop>("commerce/shops", body);
}

export async function getProducts(params?: { shopId?: string; page?: number; limit?: number }) {
  return api.get<Paginated<Product>>(
    `commerce/products${buildQuery({ shopId: params?.shopId, page: params?.page, limit: params?.limit })}`
  );
}

export async function createProduct(body: {
  shopId: string;
  title: string;
  priceCents: number;
  inventory: number;
}) {
  return api.post<Product>("commerce/products", body);
}

export async function getProductTags(params?: { page?: number; limit?: number; mediaType?: string }) {
  return api.get<Paginated<ProductTag>>(
    `commerce/product-tags${buildQuery({ page: params?.page, limit: params?.limit, mediaType: params?.mediaType })}`
  );
}

export async function createProductTag(body: {
  postId: string;
  productId: string;
  position: string;
  mediaType: "POST" | "STORY";
}) {
  return api.post<ProductTag>("commerce/product-tags", body);
}

export async function getOrders(params?: { status?: string; page?: number; limit?: number }) {
  return api.get<Paginated<Order>>(
    `commerce/orders${buildQuery({ status: params?.status, page: params?.page, limit: params?.limit })}`
  );
}
