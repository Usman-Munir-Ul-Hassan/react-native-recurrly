import { AppButton } from "@/components/ui/app-button";
import { AppCheckbox } from "@/components/ui/app-checkbox";
import { AppInput } from "@/components/ui/app-input";
import { AuthDivider } from "@/components/ui/auth-divider";
import { SocialButton } from "@/components/ui/social-button";
import { Colors, Typography } from "@/constants/theme";
import { useRegisterFlow } from "@/hooks/use-register-flow";
import { useSocialAuth } from "@/hooks/use-social-auth";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RegisterScreen() {
    const router = useRouter();
    const {
        email,
        setEmail,
        password,
        setPassword,
        agreed,
        setAgreed,
        code,
        setCode,
        pendingVerification,
        loading,
        handleRegister,
        handleVerify,
    } = useRegisterFlow();
    const { authenticate: authenticateSocial, loadingProvider } = useSocialAuth();

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* Bot Protection mount point required by Clerk */}
            <View nativeID="clerk-captcha" />

            <ScrollView
                contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
                className="px-6 py-8"
                keyboardShouldPersistTaps="handled"
            >
                {/* Header Section */}
                <View className="mb-8">
                    <Text style={[Typography.display, { marginBottom: 8 }]}>
                        {pendingVerification ? "Verify your email" : "Create an account"}
                    </Text>
                    <Text style={Typography.subtitle}>
                        {pendingVerification
                            ? `Enter the 6-digit code sent to ${email}`
                            : "Track and manage your subscription expenses in one place."}
                    </Text>
                </View>

                {pendingVerification ? (
                    /* Verification Code UI */
                    <View>
                        <AppInput
                            label="Verification Code"
                            placeholder="123456"
                            keyboardType="number-pad"
                            value={code}
                            onChangeText={setCode}
                        />
                        <View className="mt-4 mb-2">
                            <AppButton
                                title={loading ? "Verifying..." : "Verify & Continue"}
                                onPress={handleVerify}
                            />
                        </View>
                    </View>
                ) : (
                    /* Registration Form */
                    <View>
                        <AppInput
                            label="Email address"
                            placeholder="name@example.com"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={email}
                            onChangeText={setEmail}
                        />

                        <AppInput
                            label="Password"
                            placeholder="At least 8 characters"
                            isPassword
                            helperText="Must be at least 8 characters"
                            value={password}
                            onChangeText={setPassword}
                        />

                        <AppCheckbox checked={agreed} onChange={setAgreed} />

                        <View className="mb-2">
                            <AppButton
                                title={loading ? "Creating Account..." : "Create Account"}
                                onPress={handleRegister}
                            />
                        </View>

                        {/* Divider */}
                        <AuthDivider />

                        {/* Social SSO Register */}
                        <SocialButton
                            provider="github"
                            onPress={() => authenticateSocial("github")}
                            isLoading={loadingProvider === "github"}
                        />
                        <SocialButton
                            provider="google"
                            onPress={() => authenticateSocial("google")}
                            isLoading={loadingProvider === "google"}
                        />
                    </View>
                )}

                {/* Footer Navigation */}
                <View className="flex-row justify-center items-center mt-8">
                    <Text style={[Typography.body, { color: Colors.graphite }]}>
                        Already have an account?{" "}
                    </Text>
                    <Pressable onPress={() => router.back()}>
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
