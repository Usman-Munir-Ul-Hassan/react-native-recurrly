import React, { createContext, useContext, useMemo, useState } from "react";
import { useUser } from "@clerk/expo";
import { Subscription } from "@/types/subscription";
import { MOCK_SUBSCRIPTIONS } from "@/data/subscriptions.data";
import {
    loadSubscriptionsFromUser,
    saveSubscriptionsToUser,
} from "@/services/subscription/clerk-subscription-storage";

interface SubscriptionContextType {
    subscriptions: Subscription[];
    activeCount: number;
    totalMonthlyAmount: string;
    nextRenewalDate: string;
    isSyncing: boolean;
    getSubscription: (id: string) => Subscription | undefined;
    cancelSubscription: (id: string) => void;
    pauseSubscription: (id: string) => void;
    addSubscription: (newSub: Subscription) => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
    const { user, isLoaded: isUserLoaded } = useUser();
    const [localOverride, setLocalOverride] = useState<Subscription[] | null>(null);
    const [isSyncing, setIsSyncing] = useState<boolean>(false);

    // Compute active subscription list: local optimistic updates take precedence over cloud metadata
    const subscriptions = useMemo(() => {
        if (localOverride !== null) {
            return localOverride;
        }
        if (isUserLoaded && user) {
            return loadSubscriptionsFromUser(user);
        }
        return MOCK_SUBSCRIPTIONS;
    }, [localOverride, isUserLoaded, user]);

    // Active subscriptions count and total monthly price calculated dynamically
    const activeSubs = useMemo(
        () => subscriptions.filter((s) => s.status === "Active"),
        [subscriptions]
    );

    const activeCount = activeSubs.length;

    const totalMonthlyAmount = useMemo(() => {
        const total = activeSubs.reduce((sum, item) => {
            return sum + (item.amountNumeric || parseFloat(item.price.replace(/[^0-9.]/g, "")) || 0);
        }, 0);
        return `$${total.toFixed(2)}`;
    }, [activeSubs]);

    const nextRenewalDate =
        activeSubs[0]?.renewalDateShort?.replace("Renews ", "") || "Nov 1";

    const getSubscription = (id: string) => {
        return subscriptions.find((sub) => sub.id === id);
    };

    // Helper to optimistically update local state and sync to Clerk cloud
    const updateAndSync = async (updated: Subscription[]) => {
        setLocalOverride(updated);
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

    const addSubscription = (newSub: Subscription) => {
        const updated = [newSub, ...subscriptions];
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
                addSubscription,
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
