import * as Notifications from "expo-notifications";
import {
  dispatchRenewalNotification,
  requestNotificationPermissions,
  resetNotificationDeduplicationState,
} from "../renewal-notification-service";
import { NotificationDigest } from "../notification-digest-builder";

jest.mock("expo-notifications", () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
}));

describe("renewal-notification-service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetNotificationDeduplicationState();
  });

  describe("requestNotificationPermissions", () => {
    it("returns true immediately if status is already granted", async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: "granted",
      });

      const granted = await requestNotificationPermissions();
      expect(granted).toBe(true);
      expect(Notifications.requestPermissionsAsync).not.toHaveBeenCalled();
    });

    it("requests permissions if existing status is not granted", async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: "undetermined",
      });
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: "granted",
      });

      const granted = await requestNotificationPermissions();
      expect(granted).toBe(true);
      expect(Notifications.requestPermissionsAsync).toHaveBeenCalled();
    });

    it("returns false if user denies permission request", async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: "undetermined",
      });
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: "denied",
      });

      const granted = await requestNotificationPermissions();
      expect(granted).toBe(false);
    });
  });

  describe("dispatchRenewalNotification", () => {
    const mockDigest: NotificationDigest = {
      title: "⚠️ Renewal Alert: Spotify",
      body: "Your Spotify subscription ($10.00/mo) renews tomorrow!",
      urgentCount: 1,
      subscriptionIds: ["sub-1"],
    };

    it("returns null when digest is null or has 0 urgent items", async () => {
      const result = await dispatchRenewalNotification(null);
      expect(result).toBeNull();
      expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    });

    it("returns null if permissions are denied", async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: "denied",
      });
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: "denied",
      });

      const result = await dispatchRenewalNotification(mockDigest);
      expect(result).toBeNull();
      expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    });

    it("schedules notification when permissions are granted", async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({
        status: "granted",
      });
      (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValueOnce("notif-123");

      const result = await dispatchRenewalNotification(mockDigest);

      expect(result).toBe("notif-123");
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: {
          title: mockDigest.title,
          body: mockDigest.body,
          sound: true,
          data: {
            subscriptionIds: mockDigest.subscriptionIds,
            urgentCount: mockDigest.urgentCount,
          },
        },
        trigger: null,
      });
    });

    it("deduplicates subsequent identical dispatches without spamming", async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: "granted",
      });
      (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValue("notif-123");

      // First dispatch
      const firstResult = await dispatchRenewalNotification(mockDigest);
      expect(firstResult).toBe("notif-123");
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(1);

      // Second identical dispatch (e.g. re-render or re-focus)
      const secondResult = await dispatchRenewalNotification(mockDigest);
      expect(secondResult).toBeNull();
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(1);
    });

    it("dispatches a new notification if the subscription batch changes", async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: "granted",
      });
      (Notifications.scheduleNotificationAsync as jest.Mock)
        .mockResolvedValueOnce("notif-123")
        .mockResolvedValueOnce("notif-456");

      // First batch (1 item)
      await dispatchRenewalNotification(mockDigest);

      // New batch (2 items)
      const updatedDigest: NotificationDigest = {
        title: "⚠️ 2 Subscriptions Renew Soon",
        body: "Spotify, Netflix totaling $25.00 renew soon.",
        urgentCount: 2,
        subscriptionIds: ["sub-1", "sub-2"],
      };

      const secondResult = await dispatchRenewalNotification(updatedDigest);
      expect(secondResult).toBe("notif-456");
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(2);
    });
  });
});
