import { useSignUp } from "@clerk/expo";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";

/**
 * Custom hook managing the Clerk registration lifecycle.
 * Adheres to SRP by isolating authentication logic and state from the UI presentation,
 * and DRY by centralizing error formatting and flow management.
 */
export function useRegisterFlow() {
    const router = useRouter();
    const { signUp, fetchStatus } = useSignUp();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [agreed, setAgreed] = useState(false);
    const [code, setCode] = useState("");
    const [pendingVerification, setPendingVerification] = useState(false);
    const [loading, setLoading] = useState(false);

    // Centralized DRY error handler
    const handleError = (title: string, error: unknown) => {
        const message =
            (error as any)?.message ||
            (error as any)?.errors?.[0]?.message ||
            "Something went wrong. Please try again.";
        Alert.alert(title, message);
    };

    // 1. Submit email + password and request verification code
    const handleRegister = async () => {
        if (!agreed) {
            Alert.alert("Terms Required", "Please accept the Terms of Service to continue.");
            return;
        }

        if (!email.trim() || !password) {
            Alert.alert("Required Fields", "Please enter both an email address and password.");
            return;
        }

        setLoading(true);
        try {
            const { error: signUpError } = await signUp.password({
                emailAddress: email.trim(),
                password: password,
            });

            if (signUpError) {
                handleError("Registration Error", signUpError);
                return;
            }

            // Send verification OTP to user's email
            const { error: sendError } = await signUp.verifications.sendEmailCode();
            if (sendError) {
                handleError("Verification Error", sendError);
                return;
            }

            setPendingVerification(true);
        } catch (err) {
            handleError("Registration Error", err);
        } finally {
            setLoading(false);
        }
    };

    // 2. Verify 6-digit email code and finalize active session
    const handleVerify = async () => {
        if (!code.trim()) {
            Alert.alert("Required Field", "Please enter the verification code.");
            return;
        }

        setLoading(true);
        try {
            const { error: verifyError } = await signUp.verifications.verifyEmailCode({
                code: code.trim(),
            });

            if (verifyError) {
                handleError("Verification Error", verifyError);
                return;
            }

            if (signUp.status === "complete") {
                await signUp.finalize({
                    navigate: () => {
                        router.replace("/(tabs)");
                    },
                });
            } else {
                Alert.alert("Notice", "Verification incomplete. Please check your details.");
            }
        } catch (err) {
            handleError("Verification Error", err);
        } finally {
            setLoading(false);
        }
    };

    return {
        email,
        setEmail,
        password,
        setPassword,
        agreed,
        setAgreed,
        code,
        setCode,
        pendingVerification,
        loading: loading || fetchStatus === "fetching",
        handleRegister,
        handleVerify,
    };
}
