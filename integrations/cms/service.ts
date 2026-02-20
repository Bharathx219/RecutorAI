import { WixDataItem } from ".";
import { getSessionUser } from "@/lib/session";

const STORAGE_PREFIX = "recruitorai:";

function nowIso(): string {
  return new Date().toISOString();
}

function getApiBaseUrl(): string {
  return ((import.meta as ImportMeta).env?.PUBLIC_API_BASE_URL as string) || "";
}

function isRemoteEnabled(): boolean {
  return Boolean(getApiBaseUrl());
}

function isRecoverableNetworkError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const message = error.message.toLowerCase();
  return (
    message.includes("failed to fetch") ||
    message.includes("networkerror") ||
    message.includes("load failed") ||
    message.includes("err_connection_refused")
  );
}

async function parseApiError(response: Response): Promise<string> {
  const body = await response.json().catch(() => ({}));
  if (body && typeof body.error === "string" && body.error.trim()) {
    return body.error;
  }
  return `Request failed with status ${response.status}`;
}

function getAuthHeaders(): Record<string, string> {
  const user = getSessionUser();
  return {
    "Content-Type": "application/json",
    ...(user?.userId ? { "x-user-id": user.userId } : {}),
    ...(user?.role ? { "x-user-role": user.role } : {}),
    ...(user?.name ? { "x-user-name": user.name } : {}),
    ...(user?.email ? { "x-user-email": user.email } : {}),
  };
}

function readCollection<T extends WixDataItem>(collectionId: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${collectionId}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeCollection<T extends WixDataItem>(collectionId: string, items: T[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(`${STORAGE_PREFIX}${collectionId}`, JSON.stringify(items));
}

function ensureId<T extends WixDataItem>(item: Partial<T> | Record<string, unknown>): T {
  const id = (item as { _id?: string })._id ?? crypto.randomUUID();
  return {
    ...item,
    _id: id,
  } as T;
}

export interface PaginationOptions {
  limit?: number;
  skip?: number;
}

export interface RefFieldMeta {
  totalCount: number;
  returnedCount: number;
  hasMore: boolean;
}

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  hasNext: boolean;
  currentPage: number;
  pageSize: number;
  nextSkip: number | null;
}

export class BaseCrudService {
  static async create<T extends WixDataItem>(
    collectionId: string,
    itemData: Partial<T> | Record<string, unknown>,
    multiReferences?: Record<string, unknown>
  ): Promise<T> {
    if (isRemoteEnabled()) {
      try {
        const response = await fetch(`${getApiBaseUrl()}/api/data/${collectionId}`, {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            itemData,
            multiReferences,
          }),
        });
        if (!response.ok) {
          throw new Error(await parseApiError(response));
        }
        return (await response.json()) as T;
      } catch (error) {
        if (!isRecoverableNetworkError(error)) {
          throw error;
        }
      }
    }

    const items = readCollection<T>(collectionId);
    const base = ensureId<T>(itemData);
    const created = {
      ...base,
      ...(multiReferences ?? {}),
      _createdDate: (base as { _createdDate?: string })._createdDate ?? nowIso(),
      _updatedDate: nowIso(),
    } as T;
    items.push(created);
    writeCollection(collectionId, items);
    return created;
  }

  static async getAll<T extends WixDataItem>(
    collectionId: string,
    _includeRefs?: { singleRef?: string[]; multiRef?: string[] } | string[],
    pagination?: PaginationOptions
  ): Promise<PaginatedResult<T>> {
    if (isRemoteEnabled()) {
      try {
        const params = new URLSearchParams();
        if (pagination?.limit) params.set("limit", String(pagination.limit));
        if (pagination?.skip) params.set("skip", String(pagination.skip));
        const query = params.toString();
        const response = await fetch(
          `${getApiBaseUrl()}/api/data/${collectionId}${query ? `?${query}` : ""}`,
          {
            headers: getAuthHeaders(),
          }
        );
        if (!response.ok) {
          throw new Error(await parseApiError(response));
        }
        return (await response.json()) as PaginatedResult<T>;
      } catch (error) {
        if (!isRecoverableNetworkError(error)) {
          throw error;
        }
      }
    }

    const all = readCollection<T>(collectionId);
    const limit = Math.min(Math.max(pagination?.limit ?? 50, 1), 1000);
    const skip = Math.max(pagination?.skip ?? 0, 0);
    const pageItems = all.slice(skip, skip + limit);
    const hasNext = skip + limit < all.length;

    return {
      items: pageItems,
      totalCount: all.length,
      hasNext,
      currentPage: Math.floor(skip / limit),
      pageSize: limit,
      nextSkip: hasNext ? skip + limit : null,
    };
  }

  static async getById<T extends WixDataItem>(
    collectionId: string,
    itemId: string,
    _includeRefs?: { singleRef?: string[]; multiRef?: string[] } | string[]
  ): Promise<T | null> {
    if (isRemoteEnabled()) {
      try {
        const response = await fetch(`${getApiBaseUrl()}/api/data/${collectionId}/${itemId}`, {
          headers: getAuthHeaders(),
        });
        if (response.status === 404) return null;
        if (!response.ok) {
          throw new Error(await parseApiError(response));
        }
        return (await response.json()) as T;
      } catch (error) {
        if (!isRecoverableNetworkError(error)) {
          throw error;
        }
        return null;
      }
    }

    const all = readCollection<T>(collectionId);
    return all.find((item) => item._id === itemId) ?? null;
  }

  static async update<T extends WixDataItem>(collectionId: string, itemData: T): Promise<T> {
    if (isRemoteEnabled()) {
      try {
        const response = await fetch(`${getApiBaseUrl()}/api/data/${collectionId}/${itemData._id}`, {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify({ itemData }),
        });
        if (!response.ok) {
          throw new Error(await parseApiError(response));
        }
        return (await response.json()) as T;
      } catch (error) {
        if (!isRecoverableNetworkError(error)) {
          throw error;
        }
      }
    }

    if (!itemData._id) {
      throw new Error(`${collectionId} ID is required for update`);
    }
    const all = readCollection<T>(collectionId);
    const idx = all.findIndex((item) => item._id === itemData._id);
    if (idx === -1) {
      throw new Error(`${collectionId} not found`);
    }
    const merged = {
      ...all[idx],
      ...itemData,
      _updatedDate: nowIso(),
    } as T;
    all[idx] = merged;
    writeCollection(collectionId, all);
    return merged;
  }

  static async delete<T extends WixDataItem>(collectionId: string, itemId: string): Promise<T> {
    if (isRemoteEnabled()) {
      try {
        const response = await fetch(`${getApiBaseUrl()}/api/data/${collectionId}/${itemId}`, {
          method: "DELETE",
          headers: getAuthHeaders(),
        });
        if (!response.ok) {
          throw new Error(await parseApiError(response));
        }
        return (await response.json()) as T;
      } catch (error) {
        if (!isRecoverableNetworkError(error)) {
          throw error;
        }
      }
    }

    if (!itemId) {
      throw new Error(`${collectionId} ID is required for deletion`);
    }
    const all = readCollection<T>(collectionId);
    const idx = all.findIndex((item) => item._id === itemId);
    if (idx === -1) {
      throw new Error(`${collectionId} not found`);
    }
    const [removed] = all.splice(idx, 1);
    writeCollection(collectionId, all);
    return removed;
  }

  static async addReferences(
    collectionId: string,
    itemId: string,
    references: Record<string, string[]>
  ): Promise<void> {
    const item = await this.getById<WixDataItem>(collectionId, itemId);
    if (!item) throw new Error(`${collectionId} not found`);
    const next = { ...item } as WixDataItem & Record<string, unknown>;
    for (const [field, refs] of Object.entries(references)) {
      const current = Array.isArray(next[field]) ? (next[field] as string[]) : [];
      next[field] = Array.from(new Set([...current, ...refs]));
    }
    await this.update(collectionId, next);
  }

  static async removeReferences(
    collectionId: string,
    itemId: string,
    references: Record<string, string[]>
  ): Promise<void> {
    const item = await this.getById<WixDataItem>(collectionId, itemId);
    if (!item) throw new Error(`${collectionId} not found`);
    const next = { ...item } as WixDataItem & Record<string, unknown>;
    for (const [field, refs] of Object.entries(references)) {
      const current = Array.isArray(next[field]) ? (next[field] as string[]) : [];
      next[field] = current.filter((ref) => !refs.includes(ref));
    }
    await this.update(collectionId, next);
  }
}
