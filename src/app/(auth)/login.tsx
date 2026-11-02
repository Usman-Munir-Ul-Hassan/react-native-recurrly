import { AppButton } from "@/components/ui/app-button";
import { AppInput } from "@/components/ui/app-input";
import { AuthDivider } from "@/components/ui/auth-divider";
import { SocialButton } from "@/components/ui/social-button";
import { Colors, Typography } from "@/constants/theme";
import { useLoginFlow } from "@/hooks/use-login-flow";
import { useSocialAuth } from "@/hooks/use-social-auth";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
    const router = useRouter();
    const { email, setEmail, password, setPassword, loading, handleLogin } =
        useLoginFlow();
    const { authenticate: authenticateSocial, loadingProvider } = useSocialAuth();

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
                        Log in to your account
                    </Text>
                    <Text style={Typography.subtitle}>
                        Welcome back. Enter your credentials to access your subscriptions.
                    </Text>
                </View>

                {/* Inputs */}
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
                    placeholder="••••••••••••"
                    isPassword
                    rightActionText="Forgot?"
                    onRightActionPress={() => router.push("/forgot-password")}
                    value={password}
                    onChangeText={setPassword}
                />

                {/* Primary CTA */}
                <View className="mt-2 mb-2">
                    <AppButton
                        title={loading ? "Logging in..." : "Log in"}
                        onPress={handleLogin}
                    />
                </View>

                {/* Divider */}
                <AuthDivider />

                {/* Social SSO Logins */}
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

                {/* Footer Navigation */}
                <View className="flex-row justify-center items-center mt-8">
                    <Text style={[Typography.body, { color: Colors.graphite }]}>
                        {"Don't have an account? "}
                    </Text>
                    <Pressable onPress={() => router.push("/register")}>
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
                            Sign up
                        </Text>
                    </Pressable>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
