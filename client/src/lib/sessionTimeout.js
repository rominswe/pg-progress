const META_KEY = import.meta.env.SESSION_META_KEY;
const THREE_HOURS_MS = 3 * 60 * 60 * 1000;
const MAX_DURATION_MS = 12 * 60 * 60 * 1000;

const persistMeta = (meta) => {
  sessionStorage.setItem(META_KEY, JSON.stringify(meta));
};

export const getSessionMeta = () => {
  const raw = sessionStorage.getItem(META_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    sessionStorage.removeItem(META_KEY);
    return null;
  }
};

export const initializeSessionMeta = () => {
  const now = Date.now();
  const meta = {
    start: now,
    expiresAt: now + THREE_HOURS_MS,
    maxExpiresAt: now + MAX_DURATION_MS,
    lastActivity: now,
  };
  persistMeta(meta);
  return meta;
};

export const refreshSessionActivity = () => {
  const now = Date.now();
  let meta = getSessionMeta();
  if (!meta || meta.expiresAt <= now) {
    meta = initializeSessionMeta();
  } else {
    meta.lastActivity = now;
    persistMeta(meta);
  }
  return meta;
};

export const extendSessionMeta = () => {
  const now = Date.now();
  const meta = getSessionMeta() || initializeSessionMeta();
  const candidate = Math.min(meta.expiresAt + THREE_HOURS_MS, meta.maxExpiresAt);
  if (candidate > meta.expiresAt) {
    meta.expiresAt = candidate;
  }
  meta.lastActivity = now;
  persistMeta(meta);
  return meta;
};

export const clearSessionMeta = () => {
  sessionStorage.removeItem(META_KEY);
};
