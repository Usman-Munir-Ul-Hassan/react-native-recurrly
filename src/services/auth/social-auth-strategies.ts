export type SocialProvider = "google" | "github";

export interface SocialAuthStrategy {
    strategy: "oauth_google" | "oauth_github";
    displayName: string;
}

export const SOCIAL_STRATEGIES: Record<SocialProvider, SocialAuthStrategy> = {
    google: {
        strategy: "oauth_google",
        displayName: "Google",
    },
    github: {
        strategy: "oauth_github",
        displayName: "GitHub",
    },
};

/**
 * Retrieves the OAuth strategy configuration for a given social provider.
 */
export function getSocialStrategy(provider: SocialProvider): SocialAuthStrategy | undefined {
    return SOCIAL_STRATEGIES[provider];
}
