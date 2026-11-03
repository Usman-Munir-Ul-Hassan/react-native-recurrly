import { NotificationDigest } from "./notification-digest-builder";

type NotificationsType = typeof import("expo-notifications");

let cachedNotificationsModule: NotificationsType | null | undefined = undefined;

/**
 * Safe dynamic module loader for expo-notifications.
 * Prevents top-level crashes in Expo Go or Web where native notification modules are not supported.
 */
export function getNotificationsModule(): NotificationsType | null {
  if (cachedNotificationsModule !== undefined) {
    return cachedNotificationsModule;
  }
  try {
    // Dynamic require prevents bundle evaluation crashes on app boot in Expo Go
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    cachedNotificationsModule = require("expo-notifications") as NotificationsType;
    return cachedNotificationsModule;
  } catch (error) {
    console.warn(
      "[NotificationService] expo-notifications native module is not supported in this environment (e.g. Expo Go). Falling back gracefully.",
      error
    );
    cachedNotificationsModule = null;
    return null;
  }
}

let isHandlerConfigured = false;

/**
 * Lazy initializer for foreground notification presentation handler.
 * Avoids executing native code at file import time during bundle evaluation.
 */
export function ensureNotificationHandlerConfigured(): void {
  const Notifications = getNotificationsModule();
  if (!Notifications || isHandlerConfigured) return;
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
  const Notifications = getNotificationsModule();
  if (!Notifications) {
    return false;
  }

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

  const Notifications = getNotificationsModule();
  if (!Notifications) {
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
