export const AUTH_COOKIE_NAME = "token";

export const authCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  path: "/",
});

export const authCookieMaxAge = () => {
  const value = process.env.JWT_EXPIRES_IN || "7d";
  if (/^\d+$/.test(value)) return Number(value);
  const match = value.match(/^(\d+)\s*(s|m|h|d|w)$/i);
  if (!match) return 7 * 24 * 60 * 60 * 1000;
  const units = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000, w: 604_800_000 };
  return Number(match[1]) * units[match[2].toLowerCase()];
};

export const clearAuthCookie = (res) => res.clearCookie(AUTH_COOKIE_NAME, authCookieOptions());

export const readAuthCookie = (cookieHeader = "") => {
  const entry = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${AUTH_COOKIE_NAME}=`));

  if (!entry) return null;
  try {
    return decodeURIComponent(entry.slice(AUTH_COOKIE_NAME.length + 1)) || null;
  } catch {
    return null;
  }
};
