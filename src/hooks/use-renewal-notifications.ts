import { useEffect, useRef } from "react";
import { Subscription } from "@/types/subscription";
import { buildRenewalDigest } from "@/services/notification/notification-digest-builder";
import { dispatchRenewalNotification } from "@/services/notification/renewal-notification-service";

export interface UseRenewalNotificationsOptions {
  debounceMs?: number;
  enabled?: boolean;
}

/**
 * Orchestrator hook that observes active subscriptions and dispatches a debounced
 * notification digest for subscriptions renewing within <= 1 day.
 */
export function useRenewalNotifications(
  subscriptions: Subscription[],
  options?: UseRenewalNotificationsOptions
): void {
  const debounceMs = options?.debounceMs ?? 1500;
  const enabled = options?.enabled ?? true;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(async () => {
      const digest = buildRenewalDigest(subscriptions);
      if (digest) {
        await dispatchRenewalNotification(digest);
      }
    }, debounceMs);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [subscriptions, debounceMs, enabled]);
}
