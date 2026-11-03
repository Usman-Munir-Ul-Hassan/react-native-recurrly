import { renderHook, act } from "@testing-library/react-native";
import { useRenewalNotifications } from "@/hooks/use-renewal-notifications";
import { buildRenewalDigest } from "@/services/notification/notification-digest-builder";
import { dispatchRenewalNotification } from "@/services/notification/renewal-notification-service";
import { Subscription } from "@/types/subscription";

jest.mock("expo-notifications", () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: "granted" }),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: "granted" }),
  scheduleNotificationAsync: jest.fn().mockResolvedValue("mock-notif-id"),
}));

jest.mock("@/services/notification/notification-digest-builder");
jest.mock("@/services/notification/renewal-notification-service");

const createMockSub = (id: string, name: string): Subscription => ({
  id,
  name,
  initials: name.slice(0, 2).toUpperCase(),
  status: "Active",
  category: "Dev Tools",
  price: "$10.00/mo",
  amountNumeric: 10,
  cadence: "in 1 day",
  daysRemaining: 1,
  renewalDateShort: "Renews Tomorrow",
  nextRenewalFull: "Tomorrow",
  billingCycle: "Monthly",
  paymentMethod: "Apple Pay",
  invoiceEmail: "user@example.com",
});

describe("useRenewalNotifications", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("does not dispatch immediately before debounce time has elapsed", async () => {
    (buildRenewalDigest as jest.Mock).mockReturnValue({
      title: "⚠️ Renewal Alert: Spotify",
      body: "Spotify renews tomorrow!",
      urgentCount: 1,
      subscriptionIds: ["1"],
    });

    await renderHook(() =>
      useRenewalNotifications([createMockSub("1", "Spotify")], { debounceMs: 1500 })
    );

    expect(buildRenewalDigest).not.toHaveBeenCalled();
    expect(dispatchRenewalNotification).not.toHaveBeenCalled();
  });

  it("dispatches notification after debounce time has elapsed", async () => {
    const mockDigest = {
      title: "⚠️ Renewal Alert: Spotify",
      body: "Spotify renews tomorrow!",
      urgentCount: 1,
      subscriptionIds: ["1"],
    };
    (buildRenewalDigest as jest.Mock).mockReturnValue(mockDigest);

    await renderHook(() =>
      useRenewalNotifications([createMockSub("1", "Spotify")], { debounceMs: 1500 })
    );

    await act(async () => {
      jest.advanceTimersByTime(1500);
    });

    expect(buildRenewalDigest).toHaveBeenCalledTimes(1);
    expect(dispatchRenewalNotification).toHaveBeenCalledWith(mockDigest);
  });

  it("resets debounce timer and only dispatches ONCE when multiple subscriptions are added rapidly", async () => {
    const mockDigest = {
      title: "⚠️ 3 Subscriptions Renew Soon",
      body: "Sub 1, Sub 2, Sub 3 renew soon.",
      urgentCount: 3,
      subscriptionIds: ["1", "2", "3"],
    };
    (buildRenewalDigest as jest.Mock).mockReturnValue(mockDigest);

    const hook = await renderHook(
      ({ subs }: { subs: Subscription[] }) =>
        useRenewalNotifications(subs, { debounceMs: 1500 }),
      { initialProps: { subs: [createMockSub("1", "Sub 1")] } }
    );

    // Advance 500ms, then add item 2
    await act(async () => {
      jest.advanceTimersByTime(500);
    });
    hook.rerender({ subs: [createMockSub("1", "Sub 1"), createMockSub("2", "Sub 2")] });

    // Advance another 500ms, then add item 3
    await act(async () => {
      jest.advanceTimersByTime(500);
    });
    hook.rerender({
      subs: [
        createMockSub("1", "Sub 1"),
        createMockSub("2", "Sub 2"),
        createMockSub("3", "Sub 3"),
      ],
    });

    // Advance full 1500ms for final debounce to finish
    await act(async () => {
      jest.advanceTimersByTime(1500);
    });

    // It should have only called dispatch ONCE with the final batch!
    expect(buildRenewalDigest).toHaveBeenCalledTimes(1);
    expect(dispatchRenewalNotification).toHaveBeenCalledTimes(1);
    expect(dispatchRenewalNotification).toHaveBeenCalledWith(mockDigest);
  });

  it("does not dispatch when enabled is false", async () => {
    await renderHook(() =>
      useRenewalNotifications([createMockSub("1", "Spotify")], {
        debounceMs: 1500,
        enabled: false,
      })
    );

    await act(async () => {
      jest.advanceTimersByTime(2000);
    });

    expect(buildRenewalDigest).not.toHaveBeenCalled();
    expect(dispatchRenewalNotification).not.toHaveBeenCalled();
  });
});
