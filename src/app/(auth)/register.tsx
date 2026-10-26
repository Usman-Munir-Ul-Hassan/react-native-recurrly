import { AppButton } from "@/components/ui/app-button";
import { AppCheckbox } from "@/components/ui/app-checkbox";
import { AppInput } from "@/components/ui/app-input";
import { AuthDivider } from "@/components/ui/auth-divider";
import { SocialButton } from "@/components/ui/social-button";
import { Colors, Typography } from "@/constants/theme";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RegisterScreen() {
    const router = useRouter();
    const [agreed, setAgreed] = useState(false);

    const handleRegister = () => {
        if (!agreed) {
            alert("Please accept the Terms of Service to continue.");
            return;
        }
        router.replace("/(tabs)");
    };

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
                        Create an account
                    </Text>
                    <Text style={Typography.subtitle}>
                        Track and manage your subscription expenses in one place.
                    </Text>
                </View>

                {/* Form Inputs */}
                <AppInput
                    label="Full Name"
                    placeholder="Jane Doe"
                    autoCapitalize="words"
                />

                <AppInput
                    label="Email address"
                    placeholder="name@example.com"
                    keyboardType="email-address"
                />

                <AppInput
                    label="Password"
                    placeholder="At least 8 characters"
                    isPassword
                    helperText="Must be at least 8 characters"
                />

                {/* Terms & Privacy Checkbox */}
                <AppCheckbox checked={agreed} onChange={setAgreed} />

                {/* Primary CTA */}
                <View className="mb-2">
                    <AppButton title="Create Account" onPress={handleRegister} />
                </View>

                {/* Divider */}
                <AuthDivider />

                {/* Social SSO Login */}
                <SocialButton
                    provider="github"
                    onPress={() => alert("GitHub SSO Triggered")}
                />

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
