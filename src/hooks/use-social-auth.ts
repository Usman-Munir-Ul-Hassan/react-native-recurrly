import { useSSO } from "@clerk/expo";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useCallback, useState } from "react";
import { Alert } from "react-native";

import { handleAuthError } from "@/services/auth/auth-error-handler";
import { getRedirectUrl } from "@/services/auth/auth-redirect";
import {
    getSocialStrategy,
    SOCIAL_STRATEGIES,
    SocialAuthStrategy,
    SocialProvider,
} from "@/services/auth/social-auth-strategies";
import { useWarmUpBrowser } from "@/hooks/use-warmup-browser";

// Re-export strategy contracts, helpers, and hooks for backward-compatibility
export { SOCIAL_STRATEGIES, getSocialStrategy, getRedirectUrl, useWarmUpBrowser };
export type { SocialProvider, SocialAuthStrategy };

WebBrowser.maybeCompleteAuthSession();

/**
 * Orchestrator hook for Social Single Sign-On (SSO) authentication.
 * Follows SRP by delegating strategy lookup, redirect resolution, browser warmup,
 * and error handling to specialized units.
 */
export function useSocialAuth() {
    useWarmUpBrowser();
    const router = useRouter();
    const { startSSOFlow } = useSSO();
    const [loadingProvider, setLoadingProvider] = useState<SocialProvider | null>(null);

    const authenticate = useCallback(
        async (provider: SocialProvider): Promise<boolean> => {
            const providerConfig = getSocialStrategy(provider);

            if (!providerConfig) {
                Alert.alert("Unsupported Provider", `Authentication provider '${provider}' is not supported.`);
                return false;
            }

            setLoadingProvider(provider);
            try {
                const redirectUrl = getRedirectUrl();

                console.log(`[SocialAuth] Initiating ${providerConfig.displayName} SSO with redirectUrl:`, redirectUrl);

                const { createdSessionId, setActive, signUp, signIn } = await startSSOFlow({
                    strategy: providerConfig.strategy,
                    redirectUrl,
                });

                console.log(`[SocialAuth] SSO flow result:`, {
                    createdSessionId,
                    hasSetActive: !!setActive,
                    signInStatus: signIn?.status,
                    signUpStatus: signUp?.status,
                });

                const targetSessionId = createdSessionId || signIn?.createdSessionId;

                if (targetSessionId && setActive) {
                    await setActive({ session: targetSessionId });
                    router.replace("/(tabs)");
                    return true;
                }

                if (signUp?.status === "missing_requirements") {
                    Alert.alert(
                        "Additional Information Required",
                        "Your account requires additional profile details to complete registration."
                    );
                    return false;
                }

                if (signIn?.status === "needs_first_factor" || signIn?.status === "needs_second_factor") {
                    Alert.alert(
                        "Account Linking Required",
                        "An account with this email already exists. Please log in with your email and password first to link your account."
                    );
                    return false;
                }

                return false;
            } catch (err: unknown) {
                handleAuthError(providerConfig.displayName, err);
                return false;
            } finally {
                setLoadingProvider(null);
            }
        },
        [startSSOFlow, router]
    );

    return {
        authenticate,
        loadingProvider,
        isSocialLoading: loadingProvider !== null,
    };
}
