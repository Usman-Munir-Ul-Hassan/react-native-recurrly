import { SUBSCRIPTIONS, Subscription } from "@/constants/subscriptions";
import React, { createContext, useContext, useMemo, useState } from "react";

interface SubscriptionContextType {
    subscriptions: Subscription[];
    activeCount: number;
    totalMonthlyAmount: string;
    nextRenewalDate: string;
    getSubscription: (id: string) => Subscription | undefined;
    cancelSubscription: (id: string) => void;
    pauseSubscription: (id: string) => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(
    undefined
);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>(SUBSCRIPTIONS);

    // Active subscriptions count aur total monthly price dynamically calculate karna
    const activeSubs = useMemo(
        () => subscriptions.filter((s) => s.status === "Active"),
        [subscriptions]
    );

    const activeCount = activeSubs.length;

    const totalMonthlyAmount = useMemo(() => {
        const total = activeSubs.reduce((sum, item) => {
            // "$20/mo" mein se sirf number extract karna
            const numeric = parseFloat(item.price.replace(/[^0-9.]/g, "")) || 0;
            return sum + numeric;
        }, 0);
        return `$${total.toFixed(2)}`;
    }, [activeSubs]);

    const nextRenewalDate = activeSubs[0]?.renewalDateShort?.replace("Renews ", "") || "Nov 1";

    const getSubscription = (id: string) => {
        return subscriptions.find((sub) => sub.id === id);
    };

    const cancelSubscription = (id: string) => {
        setSubscriptions((prev) =>
            prev.map((sub) => (sub.id === id ? { ...sub, status: "Cancelled" } : sub))
        );
    };

    const pauseSubscription = (id: string) => {
        setSubscriptions((prev) =>
            prev.map((sub) => (sub.id === id ? { ...sub, status: "Paused" } : sub))
        );
    };

    return (
        <SubscriptionContext.Provider
            value={{
                subscriptions,
                activeCount,
                totalMonthlyAmount,
                nextRenewalDate,
                getSubscription,
                cancelSubscription,
                pauseSubscription,
            }}
        >
            {children}
        </SubscriptionContext.Provider>
    );
}

// Custom hook: kisi bhi screen par asani se use karne ke liye
export function useSubscriptions() {
    const context = useContext(SubscriptionContext);
    if (!context) {
        throw new Error("useSubscriptions must be used within a SubscriptionProvider");
    }
    return context;
}
