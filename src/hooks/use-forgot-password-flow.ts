import { useSignIn } from "@clerk/expo";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert } from "react-native";

export type ForgotPasswordStep = "email" | "code" | "new_password";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Custom hook managing the Clerk forgot-password lifecycle.
 * Follows SRP (isolating state & API calls) and DRY (centralized error handling & validation).
 */
export function useForgotPasswordFlow() {
    const router = useRouter();
    const { signIn, fetchStatus } = useSignIn();

    const [step, setStep] = useState<ForgotPasswordStep>("email");
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    // Centralized DRY error handler
    const handleError = (title: string, error: unknown) => {
        const message =
            (error as any)?.message ||
            (error as any)?.errors?.[0]?.message ||
            (error as any)?.errors?.[0]?.longMessage ||
            "An unexpected error occurred. Please try again.";
        Alert.alert(title, message);
    };

    // Step 1: Validate email & send password reset code
    const handleSendResetCode = async () => {
        const trimmedEmail = email.trim();

        if (!trimmedEmail) {
            Alert.alert("Validation Error", "Please enter your email address.");
            return;
        }

        if (!EMAIL_REGEX.test(trimmedEmail)) {
            Alert.alert("Invalid Email", "Please enter a valid email address (e.g. name@example.com).");
            return;
        }

        setLoading(true);
        try {
            // Initialize sign-in with user email
            const { error: createError } = await signIn.create({
                identifier: trimmedEmail,
            });

            if (createError) {
                handleError("Reset Request Failed", createError);
                return;
            }

            // Dispatch reset code to email
            const { error: sendCodeError } = await signIn.resetPasswordEmailCode.sendCode();
            if (sendCodeError) {
                handleError("Reset Code Error", sendCodeError);
                return;
            }

            setStep("code");
        } catch (err) {
            handleError("Reset Request Failed", err);
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Validate code & verify with Clerk
    const handleVerifyCode = async () => {
        const trimmedCode = code.trim();

        if (!trimmedCode) {
            Alert.alert("Validation Error", "Please enter the 6-digit verification code sent to your email.");
            return;
        }

        if (trimmedCode.length < 4) {
            Alert.alert("Invalid Code", "Please enter a valid verification code.");
            return;
        }

        setLoading(true);
        try {
            const { error } = await signIn.resetPasswordEmailCode.verifyCode({
                code: trimmedCode,
            });

            if (error) {
                handleError("Verification Failed", error);
                return;
            }

            // Status is now 'needs_new_password'
            setStep("new_password");
        } catch (err) {
            handleError("Verification Failed", err);
        } finally {
            setLoading(false);
        }
    };

    // Step 3: Validate new password & submit reset
    const handleResetPassword = async () => {
        if (!newPassword) {
            Alert.alert("Validation Error", "Please enter a new password.");
            return;
        }

        if (newPassword.length < 8) {
            Alert.alert("Weak Password", "Password must be at least 8 characters long.");
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert("Password Mismatch", "Passwords do not match. Please verify and try again.");
            return;
        }

        setLoading(true);
        try {
            const { error } = await signIn.resetPasswordEmailCode.submitPassword({
                password: newPassword,
                signOutOfOtherSessions: true,
            });

            if (error) {
                handleError("Password Reset Failed", error);
                return;
            }

            if (signIn.status === "complete") {
                Alert.alert(
                    "Success! 🎉",
                    "Your password has been reset successfully. You will now be redirected.",
                    [
                        {
                            text: "Continue",
                            onPress: async () => {
                                await signIn.finalize({
                                    navigate: () => router.replace("/(tabs)"),
                                });
                            },
                        },
                    ]
                );
            } else {
                Alert.alert("Notice", "Password updated. Please log in with your new credentials.", [
                    {
                        text: "Log In",
                        onPress: () => router.replace("/(auth)/login"),
                    },
                ]);
            }
        } catch (err) {
            handleError("Password Reset Failed", err);
        } finally {
            setLoading(false);
        }
    };

    return {
        step,
        setStep,
        email,
        setEmail,
        code,
        setCode,
        newPassword,
        setNewPassword,
        confirmPassword,
        setConfirmPassword,
        loading: loading || fetchStatus === "fetching",
        handleSendResetCode,
        handleVerifyCode,
        handleResetPassword,
    };
}
