import { Subscription } from "@/types/subscription";
import { MOCK_SUBSCRIPTIONS } from "@/data/subscriptions.data";

export interface UserMetadataResource {
    unsafeMetadata?: Record<string, unknown>;
    update?: (params: { unsafeMetadata: Record<string, unknown> }) => Promise<unknown>;
}

/**
 * Loads subscription records from Clerk user's unsafeMetadata.
 * If the user has no stored subscriptions (e.g. brand new user), returns starter sample data.
 */
export function loadSubscriptionsFromUser(user: UserMetadataResource | null | undefined): Subscription[] {
    if (!user || !user.unsafeMetadata) {
        return MOCK_SUBSCRIPTIONS;
    }

    const saved = user.unsafeMetadata.subscriptions;
    if (Array.isArray(saved) && saved.length > 0) {
        return saved as Subscription[];
    }

    return MOCK_SUBSCRIPTIONS;
}

/**
 * Persists updated subscription records to Clerk user's unsafeMetadata.
 */
export async function saveSubscriptionsToUser(
    user: UserMetadataResource | null | undefined,
    subscriptions: Subscription[]
): Promise<boolean> {
    if (!user || typeof user.update !== "function") {
        return false;
    }

    try {
        const currentMeta = user.unsafeMetadata || {};
        await user.update({
            unsafeMetadata: {
                ...currentMeta,
                subscriptions,
            },
        });
        return true;
    } catch (err) {
        console.error("[ClerkSubscriptionStorage] Failed to save subscriptions to user metadata:", err);
        return false;
    }
}
