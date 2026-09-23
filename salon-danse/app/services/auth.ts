export type UserRole = "benevole" | "admin";

export interface CurrentUser {
  email: string;
  role: UserRole;
}

interface StoredAccount extends CurrentUser {
  password: string;
}

interface OneTimeCode {
  code: string;
  email?: string;
  used: boolean;
}

const USER_STORAGE_KEY = "salon-danse-current-user";
const DEFAULT_ADMIN_EMAIL = "admin@salondeladanse.fr";
const ACCOUNTS_STORAGE_KEY = "salon-danse-accounts";
const ADMIN_EMAILS_STORAGE_KEY = "salon-danse-admin-emails";
const LOGIN_CODES_STORAGE_KEY = "salon-danse-login-codes";
const RESET_CODES_STORAGE_KEY = "salon-danse-reset-codes";

function getAdminEmails() {
  const configuredEmails = (
    process.env.NEXT_PUBLIC_ADMIN_EMAILS || DEFAULT_ADMIN_EMAIL
  )
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  if (typeof window === "undefined") return configuredEmails;

  try {
    const addedEmails = JSON.parse(
      window.localStorage.getItem(ADMIN_EMAILS_STORAGE_KEY) || "[]",
    ) as string[];
    return [...new Set([...configuredEmails, ...addedEmails])];
  } catch {
    return configuredEmails;
  }
}

export function isAdminEmail(email: string) {
  return getAdminEmails().includes(email.trim().toLowerCase());
}

export function getCurrentUser(): CurrentUser | null {
  if (typeof window === "undefined") return null;

  const storedUser = window.localStorage.getItem(USER_STORAGE_KEY);
  if (!storedUser) return null;

  try {
    const user = JSON.parse(storedUser) as CurrentUser;
    if (!user.email) return null;
    return {
      email: user.email,
      role: isAdminEmail(user.email) ? "admin" : "benevole",
    };
  } catch {
    return null;
  }
}

export function saveCurrentUser(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const user: CurrentUser = {
    email: normalizedEmail,
    role: isAdminEmail(normalizedEmail) ? "admin" : "benevole",
  };

  window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  return user;
}

function readCodes(key: string) {
  if (typeof window === "undefined") return [] as OneTimeCode[];

  try {
    return JSON.parse(
      window.localStorage.getItem(key) || "[]",
    ) as OneTimeCode[];
  } catch {
    return [] as OneTimeCode[];
  }
}

function writeCodes(key: string, codes: OneTimeCode[]) {
  window.localStorage.setItem(key, JSON.stringify(codes));
}

function createCode() {
  return `SDL-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
}

export function createAccount(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const accounts = getAccounts();
  const account: StoredAccount = {
    email: normalizedEmail,
    password,
    role: isAdminEmail(normalizedEmail) ? "admin" : "benevole",
  };

  const existingIndex = accounts.findIndex(
    (item) => item.email === normalizedEmail,
  );
  if (existingIndex >= 0) accounts[existingIndex] = account;
  else accounts.push(account);
  window.localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
  return saveCurrentUser(normalizedEmail);
}

function getAccounts() {
  if (typeof window === "undefined") return [] as StoredAccount[];

  try {
    return JSON.parse(
      window.localStorage.getItem(ACCOUNTS_STORAGE_KEY) || "[]",
    ) as StoredAccount[];
  } catch {
    return [] as StoredAccount[];
  }
}

export function loginWithPassword(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const account = getAccounts().find(
    (item) => item.email === normalizedEmail && item.password === password,
  );
  return account ? saveCurrentUser(account.email) : null;
}

export function generateLoginCode(email?: string) {
  const code = createCode();
  const codes = readCodes(LOGIN_CODES_STORAGE_KEY);
  codes.push({
    code,
    email: email?.trim().toLowerCase() || undefined,
    used: false,
  });
  writeCodes(LOGIN_CODES_STORAGE_KEY, codes);
  return code;
}

export function loginWithOneTimeCode(code: string, email?: string) {
  const normalizedEmail = email?.trim().toLowerCase();
  const codes = readCodes(LOGIN_CODES_STORAGE_KEY);
  const matchingCode = codes.find(
    (item) =>
      item.code === code.trim().toUpperCase() &&
      !item.used &&
      (!item.email || item.email === normalizedEmail),
  );

  if (!matchingCode || !matchingCode.email) return null;
  matchingCode.used = true;
  writeCodes(LOGIN_CODES_STORAGE_KEY, codes);
  return saveCurrentUser(matchingCode.email);
}

export function requestPasswordReset(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  if (!getAccounts().some((account) => account.email === normalizedEmail))
    return null;

  const code = createCode();
  const codes = readCodes(RESET_CODES_STORAGE_KEY);
  codes.push({ code, email: normalizedEmail, used: false });
  writeCodes(RESET_CODES_STORAGE_KEY, codes);
  return code;
}

export function resetPassword(email: string, code: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const codes = readCodes(RESET_CODES_STORAGE_KEY);
  const matchingCode = codes.find(
    (item) =>
      item.code === code.trim().toUpperCase() &&
      item.email === normalizedEmail &&
      !item.used,
  );
  if (!matchingCode) return false;

  const accounts = getAccounts();
  const account = accounts.find((item) => item.email === normalizedEmail);
  if (!account) return false;
  account.password = password;
  matchingCode.used = true;
  window.localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
  writeCodes(RESET_CODES_STORAGE_KEY, codes);
  return true;
}

export function addAdmin(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const adminEmails = getAdminEmails();
  if (!normalizedEmail || adminEmails.includes(normalizedEmail)) return false;
  window.localStorage.setItem(
    ADMIN_EMAILS_STORAGE_KEY,
    JSON.stringify([...adminEmails, normalizedEmail]),
  );
  return true;
}

export function getAdminEmailList() {
  return getAdminEmails();
}

export function clearCurrentUser() {
  window.localStorage.removeItem(USER_STORAGE_KEY);
}
