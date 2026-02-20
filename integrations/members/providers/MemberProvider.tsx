import React, { useState, useEffect, useCallback, ReactNode } from "react";
import { MemberActions, MemberContext, MemberState } from ".";
import { getCurrentMember } from "..";

const MEMBER_STORAGE_KEY = "member-store";

interface MemberProviderProps {
  children: ReactNode;
}

export const MemberProvider: React.FC<MemberProviderProps> = ({ children }) => {
  const [state, setState] = useState<MemberState>(() => {
    let storedMemberData = null;

    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(MEMBER_STORAGE_KEY);
        if (stored) {
          const parsedData = JSON.parse(stored);
          storedMemberData = parsedData.member ?? null;
        }
      } catch {
        storedMemberData = null;
      }
    }

    return {
      member: storedMemberData,
      isAuthenticated: false,
      isLoading: true,
      error: null,
    };
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(MEMBER_STORAGE_KEY, JSON.stringify(state));
    }
  }, [state]);

  const updateState = useCallback((updates: Partial<MemberState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const actions: MemberActions = {
    loadCurrentMember: useCallback(async () => {
      try {
        updateState({ isLoading: true, error: null });
        const member = await getCurrentMember();

        if (member) {
          updateState({
            member,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          updateState({
            member: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } catch (err) {
        updateState({
          error: err instanceof Error ? err.message : "Failed to load member",
          member: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    }, [updateState]),

    login: useCallback(() => {
      updateState({
        member: {
          loginEmail: "demo@recruiterai.local",
          loginEmailVerified: true,
          status: "APPROVED",
          profile: { nickname: "Demo User" },
          lastLoginDate: new Date().toISOString(),
        },
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    }, [updateState]),

    logout: useCallback(() => {
      if (typeof window !== "undefined") {
        localStorage.removeItem(MEMBER_STORAGE_KEY);
      }
      updateState({
        member: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }, [updateState]),

    clearMember: useCallback(() => {
      updateState({
        member: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }, [updateState]),
  };

  useEffect(() => {
    actions.loadCurrentMember();
  }, [actions.loadCurrentMember]);

  return <MemberContext.Provider value={{ ...state, actions }}>{children}</MemberContext.Provider>;
};
