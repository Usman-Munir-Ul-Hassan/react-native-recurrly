import { isClerkAPIResponseError } from "@clerk/expo";
import { Alert } from "react-native";

/**
 * Parses and formats authentication errors into user-friendly alerts.
 * Centralizes error handling across social SSO and credential flows.
 */
export function handleAuthError(providerName: string, err: unknown): void {
    console.error(`[Auth] Error during ${providerName}:`, err);

    if (isClerkAPIResponseError(err)) {
        const clerkError = err.errors?.[0];
        const code = clerkError?.code;

        if (code === "form_identifier_exists" || code === "identifier_already_signed_up") {
            Alert.alert(
                "Account Already Exists",
                "An account with this email address already exists. Please log in with your email and password to access your account."
            );
            return;
        }

        if (clerkError?.message) {
            Alert.alert(`${providerName} Sign-In Failed`, clerkError.message);
            return;
        }
    }

    const errorMessage =
        (err as any)?.message ||
        (err as any)?.errors?.[0]?.message ||
        `Failed to authenticate with ${providerName}. Please try again.`;

    Alert.alert(`${providerName} Sign-In Failed`, errorMessage);
}
