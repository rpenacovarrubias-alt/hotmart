import { useState } from 'react';

export const PAGE_SIZES = [10, 20, 50] as const;
export type PageSize = (typeof PAGE_SIZES)[number];

export function usePagination<T>(items: T[], storageKey: string) {
  const [pageSize, setPageSizeState] = useState<PageSize>(() => {
    try {
      const v = localStorage.getItem(`pgsize_${storageKey}`);
      if (v) {
        const n = parseInt(v);
        if ((PAGE_SIZES as readonly number[]).includes(n)) return n as PageSize;
      }
    } catch { /* ignore */ }
    return 10;
  });
  const [page, setPageRaw] = useState(1);

  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage   = Math.min(page, totalPages);
  const paginated  = items.slice((safePage - 1) * pageSize, safePage * pageSize);

  const setPage     = (p: number) => setPageRaw(Math.max(1, Math.min(p, totalPages)));
  const setPageSize = (s: PageSize) => {
    setPageSizeState(s);
    try { localStorage.setItem(`pgsize_${storageKey}`, String(s)); } catch { /* ignore */ }
    setPageRaw(1);
  };
  const resetPage = () => setPageRaw(1);

  return { page: safePage, setPage, pageSize, setPageSize, paginated, totalPages, totalItems, resetPage };
}
