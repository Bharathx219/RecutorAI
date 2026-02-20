import { Member } from ".";

const MEMBER_STORAGE_KEY = "member-store";

export const getCurrentMember = async (): Promise<Member | null> => {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(MEMBER_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      member?: Member | null;
      isAuthenticated?: boolean;
    };

    if (!parsed?.isAuthenticated || !parsed.member) {
      return null;
    }

    return parsed.member;
  } catch {
    return null;
  }
};
