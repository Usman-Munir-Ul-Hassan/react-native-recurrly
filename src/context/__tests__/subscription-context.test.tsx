import React from "react";
import { renderHook, act } from "@testing-library/react-native";
import { useUser } from "@clerk/expo";
import { SubscriptionProvider, useSubscriptions } from "../subscription-context";
import { Subscription } from "@/types/subscription";

jest.mock("@clerk/expo", () => ({
    useUser: jest.fn(),
}));

const initialSampleSubscriptions: Subscription[] = [
    {
        id: "sub-netflix",
        name: "Netflix",
        initials: "NF",
        status: "Active",
        category: "Entertainment",
        price: "$15.99/mo",
        amountNumeric: 15.99,
        cadence: "in 10 days",
        daysRemaining: 10,
        renewalDateShort: "Renews Nov 10",
        nextRenewalFull: "November 10, 2026",
        billingCycle: "Monthly",
        paymentMethod: "Card",
        invoiceEmail: "user@example.com",
        startDate: "2026-10-10",
    },
    {
        id: "sub-spotify",
        name: "Spotify",
        initials: "SP",
        status: "Active",
        category: "Entertainment",
        price: "$9.99/mo",
        amountNumeric: 9.99,
        cadence: "in 15 days",
        daysRemaining: 15,
        renewalDateShort: "Renews Nov 15",
        nextRenewalFull: "November 15, 2026",
        billingCycle: "Monthly",
        paymentMethod: "Card",
        invoiceEmail: "user@example.com",
        startDate: "2026-10-15",
    },
];

describe("SubscriptionContext", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (useUser as jest.Mock).mockReturnValue({
            isLoaded: true,
            user: {
                id: "test-user-1",
                unsafeMetadata: {
                    subscriptions: [...initialSampleSubscriptions],
                },
                update: jest.fn().mockResolvedValue({}),
            },
        });
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <SubscriptionProvider>{children}</SubscriptionProvider>
    );

    it("should provide empty subscriptions and zero metrics for a brand new user with no metadata", async () => {
        (useUser as jest.Mock).mockReturnValue({
            isLoaded: true,
            user: {
                id: "new-user-empty",
                unsafeMetadata: {},
                update: jest.fn().mockResolvedValue({}),
            },
        });

        const { result } = await renderHook(() => useSubscriptions(), { wrapper });

        expect(result.current.subscriptions).toEqual([]);
        expect(result.current.activeCount).toBe(0);
        expect(result.current.totalMonthlyAmount).toBe("$0");
        expect(result.current.nextRenewalDate).toBe("—");
    });

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

    it("should resume a paused subscription", async () => {
        const { result } = await renderHook(() => useSubscriptions(), { wrapper });
        const targetId = result.current.subscriptions[0].id;

        await act(async () => {
            result.current.pauseSubscription(targetId);
        });
        expect(result.current.getSubscription(targetId)?.status).toBe("Paused");

        await act(async () => {
            result.current.resumeSubscription(targetId);
        });
        expect(result.current.getSubscription(targetId)?.status).toBe("Active");
    });

    it("should delete a subscription permanently", async () => {
        const { result } = await renderHook(() => useSubscriptions(), { wrapper });
        const initialCount = result.current.subscriptions.length;
        const targetId = result.current.subscriptions[0].id;

        await act(async () => {
            result.current.deleteSubscription(targetId);
        });

        expect(result.current.subscriptions.length).toBe(initialCount - 1);
        expect(result.current.getSubscription(targetId)).toBeUndefined();
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

    it("should not leak localOverride across sign-out or account switch", async () => {
        let currentUser: any = {
            id: "user_alice",
            unsafeMetadata: { subscriptions: [] },
            update: jest.fn().mockResolvedValue(undefined),
        };
        (useUser as jest.Mock).mockImplementation(() => ({
            isLoaded: true,
            user: currentUser,
        }));

        const { result, rerender } = await renderHook(() => useSubscriptions(), { wrapper });

        const aliceSub: Subscription = {
            id: "alice-exclusive-sub",
            name: "Alice Sub",
            initials: "AS",
            status: "Active",
            category: "Dev Tools",
            price: "$5.00/mo",
            amountNumeric: 5.0,
            cadence: "in 5 days",
            daysRemaining: 5,
            renewalDateShort: "Renews Nov 5",
            nextRenewalFull: "November 5, 2026",
            billingCycle: "Monthly",
            paymentMethod: "Card",
            invoiceEmail: "alice@example.com",
        };

        await act(async () => {
            result.current.addSubscription(aliceSub);
        });

        // Alice sees her new subscription
        expect(result.current.subscriptions.some((s) => s.id === "alice-exclusive-sub")).toBe(true);

        // Alice signs out (user becomes null)
        currentUser = null;
        await rerender({});

        // Logged-out session must NOT see Alice's subscription
        expect(result.current.subscriptions.some((s) => s.id === "alice-exclusive-sub")).toBe(false);

        // Bob signs in
        currentUser = {
            id: "user_bob",
            unsafeMetadata: { subscriptions: [] },
            update: jest.fn().mockResolvedValue(undefined),
        };
        await rerender({});

        // Bob must NOT see Alice's subscription
        expect(result.current.subscriptions.some((s) => s.id === "alice-exclusive-sub")).toBe(false);
    });

    it("should clear overrideState on sign out so same-account re-login receives fresh metadata", async () => {
        let currentUser: any = {
            id: "user_alice",
            unsafeMetadata: { subscriptions: [] },
            update: jest.fn().mockResolvedValue(undefined),
        };
        (useUser as jest.Mock).mockImplementation(() => ({
            isLoaded: true,
            user: currentUser,
        }));

        const { result, rerender } = await renderHook(() => useSubscriptions(), { wrapper });

        const zombieSub: Subscription = {
            id: "zombie-sub",
            name: "Zombie Sub",
            initials: "ZS",
            status: "Active",
            category: "Dev Tools",
            price: "$9.99/mo",
            amountNumeric: 9.99,
            cadence: "in 10 days",
            daysRemaining: 10,
            renewalDateShort: "Renews Nov 10",
            nextRenewalFull: "November 10, 2026",
            billingCycle: "Monthly",
            paymentMethod: "Card",
            invoiceEmail: "alice@example.com",
        };

        await act(async () => {
            result.current.addSubscription(zombieSub);
        });

        expect(result.current.subscriptions.some((s) => s.id === "zombie-sub")).toBe(true);

        // Alice signs out (confirmed by isLoaded: true, user: null)
        currentUser = null;
        await rerender({});

        // Now Alice logs back in, but in the DB her metadata has fresh subscriptions instead of zombieSub
        const freshCloudSub: Subscription = {
            ...zombieSub,
            id: "fresh-cloud-sub",
            name: "Fresh Cloud Sub",
        };
        currentUser = {
            id: "user_alice",
            unsafeMetadata: { subscriptions: [freshCloudSub] },
            update: jest.fn().mockResolvedValue(undefined),
        };
        await rerender({});

        // Must load fresh data from Clerk DB, not the old in-memory zombieSub
        expect(result.current.subscriptions.some((s) => s.id === "fresh-cloud-sub")).toBe(true);
        expect(result.current.subscriptions.some((s) => s.id === "zombie-sub")).toBe(false);
    });

    it("should update an existing subscription and recalculate cycle dates when modified", async () => {
        const { result } = await renderHook(() => useSubscriptions(), { wrapper });
        const target = result.current.subscriptions[0];

        await act(async () => {
            result.current.updateSubscription(target.id, {
                startDate: "2026-10-18",
                price: "$19.99/mo",
                amountNumeric: 19.99,
            });
        });

        const updated = result.current.getSubscription(target.id);
        expect(updated?.startDate).toBe("2026-10-18");
        expect(updated?.price).toBe("$19.99/mo");
        expect(updated?.amountNumeric).toBe(19.99);
        expect(updated?.renewalDate).toBeDefined();
        expect(updated?.daysRemaining).toBeDefined();
    });

    it("should recalculate renewal date dynamically when only startDate is updated", async () => {
        const { result } = await renderHook(() => useSubscriptions(), { wrapper });
        const target = result.current.subscriptions[0];

        // Set an initial explicit renewal date
        await act(async () => {
            result.current.updateSubscription(target.id, {
                startDate: "2026-08-01",
                renewalDate: "2026-09-01",
            });
        });

        const initial = result.current.getSubscription(target.id);
        expect(initial?.renewalDate).toBe("2026-09-01");

        // Now update ONLY startDate; it must recalculate renewalDate instead of keeping 2026-09-01
        await act(async () => {
            result.current.updateSubscription(target.id, {
                startDate: "2026-10-15",
            });
        });

        const refreshed = result.current.getSubscription(target.id);
        expect(refreshed?.startDate).toBe("2026-10-15");
        expect(refreshed?.renewalDate).not.toBe("2026-09-01");
        expect(refreshed?.renewalDate).toMatch(/202[6-9]-/);
    });

    it("should format totalMonthlyAmount with compact number notation when amount exceeds 1000", async () => {
        const { result } = await renderHook(() => useSubscriptions(), { wrapper });

        await act(async () => {
            result.current.addSubscription({
                id: "enterprise-tool",
                name: "Enterprise Cloud Suite",
                initials: "EC",
                logoUrl: "",
                status: "Active",
                category: "Dev Tools",
                price: "$1500.00/mo",
                amountNumeric: 1500.0,
                cadence: "Monthly",
                daysRemaining: 15,
                billingCycle: "Monthly",
                paymentMethod: "Visa •••• 1234",
                currency: "USD",
            });
        });

        // Total amount is over 1000 USD, so compact notation formats it with 'K'
        expect(result.current.totalMonthlyAmount).toMatch(/^\$[0-9]+(\.[0-9])?K$/);
    });
});
