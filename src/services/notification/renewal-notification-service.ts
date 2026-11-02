import * as Notifications from "expo-notifications";
import { NotificationDigest } from "./notification-digest-builder";

let isHandlerConfigured = false;

/**
 * Lazy initializer for foreground notification presentation handler.
 * Avoids executing native code at file import time during bundle evaluation.
 */
export function ensureNotificationHandlerConfigured(): void {
  if (isHandlerConfigured) return;
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
    isHandlerConfigured = true;
  } catch {
    // Gracefully handles test runners or unsupported headless environments
  }
}

let lastNotifiedSignature: string | null = null;

/**
 * Resets the in-memory deduplication signature (used during logout or testing).
 */
export function resetNotificationDeduplicationState(): void {
  lastNotifiedSignature = null;
}

/**
 * Checks and requests device notification permissions if not already granted.
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  ensureNotificationHandlerConfigured();
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === "granted";
  } catch (error) {
    console.warn("[NotificationService] Permission check failed:", error);
    return false;
  }
}

/**
 * Dispatches a single consolidated local notification for urgent subscriptions.
 * Prevents duplicate alerts if the same set of subscriptions was already notified.
 */
export async function dispatchRenewalNotification(
  digest: NotificationDigest | null
): Promise<string | null> {
  if (!digest || digest.urgentCount === 0) {
    return null;
  }

  // Deduplication signature: e.g. "sub-1:sub-2:sub-3-⚠️ 3 Subscriptions Renew Soon"
  const sortedIds = [...digest.subscriptionIds].sort().join(":");
  const currentSignature = `${sortedIds}-${digest.title}`;

  if (lastNotifiedSignature === currentSignature) {
    return null; // Already notified for this exact batch
  }

  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) {
    return null;
  }

  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: digest.title,
        body: digest.body,
        sound: true,
        data: {
          subscriptionIds: digest.subscriptionIds,
          urgentCount: digest.urgentCount,
        },
      },
      trigger: null, // Deliver immediately
    });

    lastNotifiedSignature = currentSignature;
    return id;
  } catch (error) {
    console.error("[NotificationService] Failed to schedule notification:", error);
    return null;
  }
}
