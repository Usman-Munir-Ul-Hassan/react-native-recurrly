import React, { createContext, useContext, useMemo, useState } from "react";
import { useUser } from "@clerk/expo";
import { getSubscriptionCurrency, Subscription } from "@/types/subscription";
import { MOCK_SUBSCRIPTIONS } from "@/data/subscriptions.data";
import {
    loadSubscriptionsFromUser,
    saveSubscriptionsToUser,
} from "@/services/subscription/clerk-subscription-storage";
import { useRenewalNotifications } from "@/hooks/use-renewal-notifications";
import { usePreferences } from "@/context/preferences-context";
import { calculateSubscriptionCycle } from "@/utils/subscription-cycle-calculator";

interface SubscriptionContextType {
    subscriptions: Subscription[];
    activeCount: number;
    totalMonthlyAmount: string;
    nextRenewalDate: string;
    isSyncing: boolean;
    getSubscription: (id: string) => Subscription | undefined;
    cancelSubscription: (id: string) => void;
    pauseSubscription: (id: string) => void;
    resumeSubscription: (id: string) => void;
    deleteSubscription: (id: string) => void;
    addSubscription: (newSub: Subscription) => void;
    updateSubscription: (id: string, partial: Partial<Subscription>) => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
    const { user, isLoaded: isUserLoaded } = useUser();
    const currentUserId = user?.id ?? null;
    const [overrideState, setOverrideState] = useState<{
        userId: string | null;
        subscriptions: Subscription[];
    } | null>(null);
    const [isSyncing, setIsSyncing] = useState<boolean>(false);

    // Reset in-memory override when authentication confirms the user signed out or switched accounts
    if (isUserLoaded && overrideState?.userId && overrideState.userId !== currentUserId) {
        setOverrideState(null);
    }

    // Only apply local override if it belongs to the currently active user (avoids cross-account leaks)
    const activeOverride =
        overrideState?.userId === currentUserId ? overrideState.subscriptions : null;

    // Compute active subscription list: scoped local updates take precedence over cloud metadata
    const subscriptions = useMemo(() => {
        if (activeOverride !== null) {
            return activeOverride;
        }
        if (isUserLoaded && user) {
            return loadSubscriptionsFromUser(user);
        }
        return MOCK_SUBSCRIPTIONS;
    }, [activeOverride, isUserLoaded, user]);

    const { alertsEnabled, formatCompactPrice, convertAmount, currency } = usePreferences();

    // Automatically monitors subscriptions and schedules/dispatches 1-day alerts if enabled
    useRenewalNotifications(subscriptions, { enabled: alertsEnabled });

    // Active subscriptions count and total monthly price calculated dynamically
    const activeSubs = useMemo(
        () => subscriptions.filter((s) => s.status === "Active"),
        [subscriptions]
    );

    const activeCount = activeSubs.length;

    const totalMonthlyAmount = useMemo(() => {
        const total = activeSubs.reduce((sum, item) => {
            const inUserCurrency = convertAmount(item.amountNumeric, getSubscriptionCurrency(item));
            return sum + (inUserCurrency || 0);
        }, 0);
        return formatCompactPrice(total, undefined, currency).replace(/\/mo|\/yr/, "");
    }, [activeSubs, formatCompactPrice, convertAmount, currency]);

    const nextRenewalDate =
        activeSubs[0]?.renewalDateShort?.replace("Renews ", "") || "Nov 1";

    const getSubscription = (id: string) => {
        return subscriptions.find((sub) => sub.id === id);
    };

    // Helper to optimistically update local state scoped to user and sync to Clerk cloud
    const updateAndSync = async (updated: Subscription[]) => {
        setOverrideState({
            userId: currentUserId,
            subscriptions: updated,
        });
        if (user) {
            setIsSyncing(true);
            await saveSubscriptionsToUser(user, updated);
            setIsSyncing(false);
        }
    };

    const cancelSubscription = (id: string) => {
        const updated = subscriptions.map((sub) =>
            sub.id === id ? { ...sub, status: "Cancelled" as const } : sub
        );
        void updateAndSync(updated);
    };

    const pauseSubscription = (id: string) => {
        const updated = subscriptions.map((sub) =>
            sub.id === id ? { ...sub, status: "Paused" as const } : sub
        );
        void updateAndSync(updated);
    };

    const resumeSubscription = (id: string) => {
        const updated = subscriptions.map((sub) =>
            sub.id === id ? { ...sub, status: "Active" as const } : sub
        );
        void updateAndSync(updated);
    };

    const deleteSubscription = (id: string) => {
        const updated = subscriptions.filter((sub) => sub.id !== id);
        void updateAndSync(updated);
    };

    const addSubscription = (newSub: Subscription) => {
        const updated = [newSub, ...subscriptions];
        void updateAndSync(updated);
    };

    const updateSubscription = (id: string, partial: Partial<Subscription>) => {
        const updated = subscriptions.map((sub) => {
            if (sub.id !== id) return sub;
            const merged = { ...sub, ...partial };
            if ((partial.startDate !== undefined || partial.renewalDate !== undefined) && partial.daysRemaining === undefined) {
                const cycle = calculateSubscriptionCycle({
                    startDateInput: merged.startDate,
                    renewalDateInput: partial.renewalDate !== undefined ? merged.renewalDate : undefined,
                    cadence: merged.billingCycle?.toLowerCase().includes("yearly") ? "Yearly" : "Monthly",
                });
                return {
                    ...merged,
                    startDate: cycle.startDate,
                    renewalDate: cycle.renewalDate,
                    renewalDateShort: cycle.renewalDateShort,
                    nextRenewalFull: cycle.nextRenewalFull,
                    daysRemaining: cycle.daysRemaining,
                    cadence: cycle.cadenceText,
                };
            }
            return merged;
        });
        void updateAndSync(updated);
    };

    return (
        <SubscriptionContext.Provider
            value={{
                subscriptions,
                activeCount,
                totalMonthlyAmount,
                nextRenewalDate,
                isSyncing,
                getSubscription,
                cancelSubscription,
                pauseSubscription,
                resumeSubscription,
                deleteSubscription,
                addSubscription,
                updateSubscription,
            }}
        >
            {children}
        </SubscriptionContext.Provider>
    );
}

// Custom hook for convenient consumption across screens and components
export function useSubscriptions() {
    const context = useContext(SubscriptionContext);
    if (!context) {
        throw new Error("useSubscriptions must be used within a SubscriptionProvider");
    }
    return context;
}
