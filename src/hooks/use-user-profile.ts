import { useUser } from "@clerk/expo";

export interface UserProfileData {
    displayName: string;
    initials: string;
    imageUrl: string | null;
    email: string | null;
    isLoaded: boolean;
}

/**
 * Hook extracting real-time formatted user profile information from Clerk.
 * Supports both Social SSO (Google/GitHub) and Email/Password authenticated sessions.
 */
export function useUserProfile(): UserProfileData {
    const { user, isLoaded } = useUser();

    if (!isLoaded || !user) {
        return {
            displayName: "...",
            initials: "—",
            imageUrl: null,
            email: null,
            isLoaded,
        };
    }

    const email = user.primaryEmailAddress?.emailAddress ?? null;

    // Resolve human-friendly display name: Full Name -> First Name -> Username -> Email Prefix -> "User"
    const displayName =
        user.fullName ||
        user.firstName ||
        user.username ||
        (email ? email.split("@")[0] : "User");

    // Resolve initials: e.g. "UM" for Usman Munir, or first two letters of username/email
    const initials =
        user.firstName && user.lastName
            ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
            : displayName.slice(0, 2).toUpperCase();

    const imageUrl = user.hasImage ? user.imageUrl : null;

    return {
        displayName,
        initials,
        imageUrl,
        email,
        isLoaded,
    };
}
