export const getPagination = (query = {}, { defaultLimit = 20, maxLimit = 50 } = {}) => {
  const parsedPage = Number.parseInt(query.page, 10);
  const parsedLimit = Number.parseInt(query.limit, 10);
  const page = Number.isFinite(parsedPage) ? Math.min(100_000, Math.max(1, parsedPage)) : 1;
  const limit = Number.isFinite(parsedLimit) ? Math.min(maxLimit, Math.max(1, parsedLimit)) : defaultLimit;
  return { page, limit };
};

export const paginationMetadata = (page, limit, total) => ({
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit),
  hasNextPage: page * limit < total,
  hasPrevPage: page > 1,
});
