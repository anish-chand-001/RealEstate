import { createHmac, timingSafeEqual } from 'node:crypto';
import mongoose from 'mongoose';

const cursorError = () => {
  const error = new Error('Invalid pagination cursor.');
  error.status = 400;
  return error;
};

const cursorSecret = () => process.env.CURSOR_SECRET || process.env.JWT_SECRET;

const normalizeSort = (sortBy) => {
  const entries = typeof sortBy === 'string'
    ? sortBy.trim().split(/\s+/).filter(Boolean).map((part) => [part.replace(/^-/, ''), part.startsWith('-') ? -1 : 1])
    : Object.entries(sortBy || {});
  const sort = Object.fromEntries(entries.map(([field, direction]) => [field, Number(direction) < 0 ? -1 : 1]));
  if (!sort._id) sort._id = Object.values(sort).at(-1) || -1;
  return sort;
};

const signature = (encoded) => createHmac('sha256', cursorSecret() || 'cursor-secret-unconfigured').update(encoded).digest();

const encodeCursor = (document, sort) => {
  const payload = Buffer.from(JSON.stringify({
    fields: Object.keys(sort),
    values: Object.keys(sort).map((field) => document[field]?.toISOString?.() ?? document[field]?.toString?.() ?? document[field]),
  }), 'utf8').toString('base64url');
  return `${payload}.${signature(payload).toString('base64url')}`;
};

const decodeCursor = (token, sort) => {
  if (!token) return null;
  if (typeof token !== 'string' || token.length > 2048) throw cursorError();
  const [payload, encodedSignature, ...extra] = token.split('.');
  if (!payload || !encodedSignature || extra.length) throw cursorError();
  let suppliedSignature;
  try { suppliedSignature = Buffer.from(encodedSignature, 'base64url'); }
  catch { throw cursorError(); }
  const expectedSignature = signature(payload);
  if (suppliedSignature.length !== expectedSignature.length || !timingSafeEqual(suppliedSignature, expectedSignature)) throw cursorError();

  let parsed;
  try { parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')); }
  catch { throw cursorError(); }
  const fields = Object.keys(sort);
  if (!Array.isArray(parsed.fields) || !Array.isArray(parsed.values) ||
      parsed.fields.join('|') !== fields.join('|') || parsed.values.length !== fields.length ||
      !mongoose.isValidObjectId(parsed.values.at(-1)) ||
      parsed.values.some((value) => value !== null && !['string', 'number', 'boolean'].includes(typeof value))) {
    throw cursorError();
  }
  return parsed.values;
};

export const buildCursorPage = ({ filter, sortBy, cursor, direction = 'next', page = 1, limit }) => {
  if (Number(page) > 1 && !cursor) throw cursorError();
  const sort = normalizeSort(sortBy);
  const values = decodeCursor(cursor, sort);
  const reverse = direction === 'previous';
  const querySort = reverse
    ? Object.fromEntries(Object.entries(sort).map(([field, order]) => [field, order * -1]))
    : sort;

  let queryFilter = filter;
  if (values) {
    const fields = Object.keys(sort);
    const clauses = fields.map((field, index) => {
      const equality = Object.fromEntries(fields.slice(0, index).map((key, prior) => [key, values[prior]]));
      const isAfter = reverse ? sort[field] < 0 : sort[field] > 0;
      return { ...equality, [field]: { [isAfter ? '$gt' : '$lt']: values[index] } };
    });
    queryFilter = { $and: [filter, { $or: clauses }] };
  }

  return {
    filter: queryFilter,
    sort: querySort,
    limit: limit + 1,
    hasMore: (documents) => documents.length > limit,
    trim: (documents) => {
      const items = documents.slice(0, limit);
      return reverse ? items.reverse() : items;
    },
    cursors: (documents) => ({
      previousCursor: documents.length ? encodeCursor(documents[0], sort) : null,
      nextCursor: documents.length ? encodeCursor(documents[documents.length - 1], sort) : null,
    }),
  };
};

export const cursorPaginationMetadata = ({ page, limit, total, hasNextPage, hasPrevPage, previousCursor, nextCursor }) => ({
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit),
  hasNextPage,
  hasPrevPage,
  previousCursor: hasPrevPage ? previousCursor : null,
  nextCursor: hasNextPage ? nextCursor : null,
});
