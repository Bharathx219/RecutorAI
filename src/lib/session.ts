export type AppRole = "candidate" | "recruiter";

export interface AppSessionUser {
  userId: string;
  name: string;
  email: string;
  role: AppRole;
}

const SESSION_KEY = "recruitorai:session";
const LOCAL_AUTH_USERS_KEY = "recruitorai:auth-users";

interface LocalAuthUserRecord extends AppSessionUser {
  password: string;
}

export function getSessionUser(): AppSessionUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AppSessionUser;
    if (!parsed?.userId || !parsed?.role) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function setSessionUser(user: AppSessionUser): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function clearSessionUser(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
}

function getLocalAuthUsers(): LocalAuthUserRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_AUTH_USERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as LocalAuthUserRecord[]) : [];
  } catch {
    return [];
  }
}

function saveLocalAuthUsers(users: LocalAuthUserRecord[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_AUTH_USERS_KEY, JSON.stringify(users));
}

export function registerLocalAuthUser(input: {
  name: string;
  email: string;
  role: AppRole;
  password: string;
}): AppSessionUser {
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim();
  const password = input.password;

  if (!name || !email || !password) {
    throw new Error("Name, email, and password are required");
  }

  const users = getLocalAuthUsers();
  const alreadyExists = users.some((user) => user.email === email && user.role === input.role);
  if (alreadyExists) {
    throw new Error("User already exists for this role");
  }

  const nextUser: LocalAuthUserRecord = {
    userId: crypto.randomUUID(),
    name,
    email,
    role: input.role,
    password,
  };
  users.push(nextUser);
  saveLocalAuthUsers(users);

  return {
    userId: nextUser.userId,
    name: nextUser.name,
    email: nextUser.email,
    role: nextUser.role,
  };
}

export function loginLocalAuthUser(input: {
  email: string;
  role: AppRole;
  password: string;
}): AppSessionUser {
  const email = input.email.trim().toLowerCase();
  const password = input.password;

  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  const users = getLocalAuthUsers();
  const matched = users.find(
    (user) => user.email === email && user.role === input.role && user.password === password
  );

  if (!matched) {
    throw new Error("Invalid credentials");
  }

  return {
    userId: matched.userId,
    name: matched.name,
    email: matched.email,
    role: matched.role,
  };
}
