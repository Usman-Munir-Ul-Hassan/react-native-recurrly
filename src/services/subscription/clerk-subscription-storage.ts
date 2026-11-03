import { Subscription } from "@/types/subscription";

export interface UserMetadataResource {
    unsafeMetadata?: Record<string, unknown>;
    update?: (params: { unsafeMetadata: Record<string, unknown> }) => Promise<unknown>;
}

/**
 * Loads subscription records from Clerk user's unsafeMetadata.
 * For new users or users with empty metadata, returns an empty array [].
 */
export function loadSubscriptionsFromUser(user: UserMetadataResource | null | undefined): Subscription[] {
    if (!user || !user.unsafeMetadata) {
        return [];
    }

    const saved = user.unsafeMetadata.subscriptions;
    if (Array.isArray(saved)) {
        return saved as Subscription[];
    }

    return [];
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
