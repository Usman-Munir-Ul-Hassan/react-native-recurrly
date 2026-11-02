import { useSignIn } from "@clerk/expo";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";

/**
 * Custom hook managing the Clerk login lifecycle.
 * Adheres to SRP by decoupling auth API calls from the screen UI presentation,
 * and DRY by centralizing error formatting and validation.
 */
export function useLoginFlow() {
    const router = useRouter();
    const { signIn, fetchStatus } = useSignIn();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    // Centralized DRY error handler
    const handleError = (title: string, error: unknown) => {
        const message =
            (error as any)?.message ||
            (error as any)?.errors?.[0]?.message ||
            (error as any)?.errors?.[0]?.longMessage ||
            "Invalid email or password. Please try again.";
        Alert.alert(title, message);
    };

    const handleLogin = async () => {
        const trimmedEmail = email.trim();

        if (!trimmedEmail || !password) {
            Alert.alert("Required Fields", "Please enter both your email address and password.");
            return;
        }

        setLoading(true);
        try {
            // Sign in using email address and password via modern Clerk method-based API
            const { error } = await signIn.password({
                emailAddress: trimmedEmail,
                password: password,
            });

            if (error) {
                handleError("Login Failed", error);
                return;
            }

            if (signIn.status === "complete") {
                // Finalize session and navigate to tabs
                await signIn.finalize({
                    navigate: () => {
                        router.replace("/(tabs)");
                    },
                });
            } else if (signIn.status === "needs_second_factor") {
                Alert.alert("2FA Required", "Second factor authentication is required for this account.");
            } else {
                Alert.alert("Notice", `Additional verification required (Status: ${signIn.status}).`);
            }
        } catch (err) {
            handleError("Login Error", err);
        } finally {
            setLoading(false);
        }
    };

    return {
        email,
        setEmail,
        password,
        setPassword,
        loading: loading || fetchStatus === "fetching",
        handleLogin,
    };
}
