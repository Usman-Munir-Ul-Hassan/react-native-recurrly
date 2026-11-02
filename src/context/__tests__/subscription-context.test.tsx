import React from "react";
import { renderHook, act } from "@testing-library/react-native";
import { useUser } from "@clerk/expo";
import { SubscriptionProvider, useSubscriptions } from "../subscription-context";
import { Subscription } from "@/types/subscription";

jest.mock("@clerk/expo", () => ({
    useUser: jest.fn(),
}));

describe("SubscriptionContext", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (useUser as jest.Mock).mockReturnValue({
            isLoaded: true,
            user: null,
        });
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <SubscriptionProvider>{children}</SubscriptionProvider>
    );

    it("should provide initial subscriptions and calculate active metrics", async () => {
        const { result } = await renderHook(() => useSubscriptions(), { wrapper });

        expect(result.current.subscriptions.length).toBeGreaterThan(0);
        expect(result.current.activeCount).toBeGreaterThan(0);
        expect(result.current.totalMonthlyAmount).toMatch(/^\$[0-9]+\.[0-9]{2}$/);
    });

    it("should cancel a subscription and decrement the active count", async () => {
        const { result } = await renderHook(() => useSubscriptions(), { wrapper });
        const initialActive = result.current.activeCount;
        const targetId = result.current.subscriptions[0].id;

        await act(async () => {
            result.current.cancelSubscription(targetId);
        });

        const updated = result.current.getSubscription(targetId);
        expect(updated?.status).toBe("Cancelled");
        expect(result.current.activeCount).toBe(initialActive - 1);
    });

    it("should pause a subscription and update status", async () => {
        const { result } = await renderHook(() => useSubscriptions(), { wrapper });
        const targetId = result.current.subscriptions[0].id;

        await act(async () => {
            result.current.pauseSubscription(targetId);
        });

        const updated = result.current.getSubscription(targetId);
        expect(updated?.status).toBe("Paused");
    });

    it("should add a new subscription to the list", async () => {
        const { result } = await renderHook(() => useSubscriptions(), { wrapper });
        const initialCount = result.current.subscriptions.length;

        const newSub: Subscription = {
            id: "custom-spotify-test",
            name: "Spotify",
            initials: "SP",
            status: "Active",
            category: "Entertainment",
            price: "$10.99/mo",
            amountNumeric: 10.99,
            cadence: "in 10 days",
            daysRemaining: 10,
            renewalDateShort: "Renews Nov 20",
            nextRenewalFull: "November 20, 2026",
            billingCycle: "Monthly",
            paymentMethod: "Card",
            invoiceEmail: "test@example.com",
        };

        await act(async () => {
            result.current.addSubscription(newSub);
        });

        expect(result.current.subscriptions.length).toBe(initialCount + 1);
        expect(result.current.subscriptions[0].id).toBe("custom-spotify-test");
    });
});
