const cursorCache = new Map();

export const requestCursorPage = async (key, params, fetchPage) => {
  const page = Math.max(1, Number.parseInt(params.page, 10) || 1);
  const filters = Object.fromEntries(Object.entries(params).filter(([name]) => !['page', 'cursor', 'direction'].includes(name)));
  const cacheKey = `${key}:${JSON.stringify(filters)}`;
  let pageCursors = cursorCache.get(cacheKey);
  if (!pageCursors) {
    pageCursors = new Map([[1, null]]);
    cursorCache.set(cacheKey, pageCursors);
  }

  let lastTraversedResponse = null;
  for (let currentPage = 1; currentPage < page; currentPage += 1) {
    if (pageCursors.has(currentPage + 1)) continue;
    const cursor = pageCursors.get(currentPage);
    lastTraversedResponse = cursor
      ? await fetchPage({ ...params, page: currentPage, cursor, direction: 'next' })
      : await fetchPage({ ...params, page: currentPage });
    const nextCursor = lastTraversedResponse.pagination?.nextCursor;
    if (!nextCursor) return lastTraversedResponse;
    pageCursors.set(currentPage + 1, nextCursor);
  }

  const cursor = pageCursors.get(page);
  if (page > 1 && !cursor) return lastTraversedResponse;
  const response = await fetchPage({ ...params, page, ...(cursor ? { cursor, direction: 'next' } : {}) });
  if (response.pagination?.nextCursor) pageCursors.set(page + 1, response.pagination.nextCursor);
  return response;
};
