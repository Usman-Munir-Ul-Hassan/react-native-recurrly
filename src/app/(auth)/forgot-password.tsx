import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { Colors, Typography } from "@/constants/theme";
import { useForgotPasswordFlow } from "@/hooks/use-forgot-password-flow";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const {
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
        loading,
        handleSendResetCode,
        handleVerifyCode,
        handleResetPassword,
    } = useForgotPasswordFlow();

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView
                contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
                className="px-6 py-8"
                keyboardShouldPersistTaps="handled"
            >
                {/* Header Section */}
                <View className="mb-8">
                    <Text style={[Typography.display, { marginBottom: 8 }]}>
                        {step === "email" && "Reset Password"}
                        {step === "code" && "Verify Code"}
                        {step === "new_password" && "New Password"}
                    </Text>
                    <Text style={Typography.subtitle}>
                        {step === "email" &&
                            "Enter your registered email address to receive a password reset code."}
                        {step === "code" &&
                            `Enter the 6-digit verification code sent to ${email}`}
                        {step === "new_password" &&
                            "Create a strong, new password with at least 8 characters."}
                    </Text>
                </View>

                {/* Step 1: Email Input */}
                {step === "email" && (
                    <View>
                        <AppInput
                            label="Email address"
                            placeholder="name@example.com"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={email}
                            onChangeText={setEmail}
                        />

                        <View className="mt-2 mb-2">
                            <AppButton
                                title={loading ? "Sending Code..." : "Send Reset Code"}
                                onPress={handleSendResetCode}
                            />
                        </View>
                    </View>
                )}

                {/* Step 2: Code Verification */}
                {step === "code" && (
                    <View>
                        <AppInput
                            label="Verification Code"
                            placeholder="123456"
                            keyboardType="number-pad"
                            value={code}
                            onChangeText={setCode}
                        />

                        <View className="mt-2 mb-2">
                            <AppButton
                                title={loading ? "Verifying..." : "Verify Code"}
                                onPress={handleVerifyCode}
                            />
                        </View>

                        <Pressable
                            onPress={() => setStep("email")}
                            className="items-center py-2"
                        >
                            <Text
                                style={[
                                    Typography.caption,
                                    { color: Colors.graphite, textDecorationLine: "underline" },
                                ]}
                            >
                                Re-enter email or resend code
                            </Text>
                        </Pressable>
                    </View>
                )}

                {/* Step 3: Set New Password */}
                {step === "new_password" && (
                    <View>
                        <AppInput
                            label="New Password"
                            placeholder="At least 8 characters"
                            isPassword
                            helperText="Must be at least 8 characters"
                            value={newPassword}
                            onChangeText={setNewPassword}
                        />

                        <AppInput
                            label="Confirm Password"
                            placeholder="Repeat your password"
                            isPassword
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                        />

                        <View className="mt-2 mb-2">
                            <AppButton
                                title={loading ? "Updating Password..." : "Update Password & Sign In"}
                                onPress={handleResetPassword}
                            />
                        </View>
                    </View>
                )}

                {/* Footer Navigation */}
                <View className="flex-row justify-center items-center mt-8">
                    <Text style={[Typography.body, { color: Colors.graphite }]}>
                        Remember your password?{" "}
                    </Text>
                    <Pressable onPress={() => router.replace("/(auth)/login")}>
                        <Text
                            style={[
                                Typography.body,
                                {
                                    color: Colors.pitchBlack,
                                    fontWeight: "600",
                                    textDecorationLine: "underline",
                                },
                            ]}
                        >
                            Log in
                        </Text>
                    </Pressable>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
