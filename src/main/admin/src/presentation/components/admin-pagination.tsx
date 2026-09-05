"use client";

import Pagination from "react-bootstrap/Pagination";
import sortBy from "lodash/sortBy";
import uniq from "lodash/uniq";

type AdminPaginationProps = {
  page: number;
  count: number;
  onChange: (page: number) => void;
};

function buildPageItems(
  current: number,
  total: number,
): (number | "ellipsis")[] {
  if (total <= 1) return [];
  const raw = [1, total, current - 1, current, current + 1].filter(
    (p) => p >= 1 && p <= total,
  );
  const sorted = sortBy(uniq(raw));
  const out: (number | "ellipsis")[] = [];
  for (let i = 0; i < sorted.length; i++) {
    const n = sorted[i];
    const prev = sorted[i - 1];
    if (i > 0 && n - prev > 1) {
      out.push("ellipsis");
    }
    out.push(n);
  }
  return out;
}

export function AdminPagination({
  page,
  count,
  onChange,
}: AdminPaginationProps) {
  if (count <= 1) return null;
  const items = buildPageItems(page, count);
  return (
    <Pagination className="justify-content-center mb-0 rounded-pill flex-wrap">
      {items.map((item, idx) =>
        item === "ellipsis" ? (
          <Pagination.Ellipsis key={`e-${idx}`} disabled />
        ) : (
          <Pagination.Item
            key={item}
            active={item === page}
            onClick={(e) => {
              e.preventDefault();
              onChange(item);
            }}
          >
            {item}
          </Pagination.Item>
        ),
      )}
    </Pagination>
  );
}
