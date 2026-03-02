import { useEffect, useState } from "react";

import type { User } from "../../../entities/user/model/types";
import { getCurrentUser } from "../api/sessionApi";

interface UseSessionBootstrapOptions {
  skip?: boolean;
}

export function useSessionBootstrap(options: UseSessionBootstrapOptions = {}) {
  const [user, setUser] = useState<User | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const skip = options.skip ?? false;

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      if (skip) {
        setCheckingSession(false);
        return;
      }

      try {
        const me = await getCurrentUser();
        if (!cancelled) setUser(me);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setCheckingSession(false);
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, [skip]);

  return {
    user,
    setUser,
    checkingSession,
  };
}

