import { AppButton } from "@/components/ui/app-button";
import { useRouter } from "expo-router";
import { Text, TextInput, View } from "react-native";

export default function ForgotPasswordScreen() {
    const router = useRouter();

    return (
        <View className="flex-1 bg-white p-6 justify-center">
            <View className="mb-8">
                <Text className="text-3xl font-extrabold text-slate-900 mb-2">
                    Reset Password 🔑
                </Text>
                <Text className="text-slate-500 text-sm">
                    Enter your registered email address to receive password reset link.
                </Text>
            </View>

            <View className="mb-6">
                <Text className="text-xs font-bold text-slate-700 uppercase mb-2">
                    Email Address
                </Text>
                <TextInput
                    placeholder="name@example.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900"
                    keyboardType="email-address"
                />
            </View>

            <AppButton
                title="Send Reset Instructions"
                onPress={() => {
                    alert("Reset email sent! 📩");
                    router.back();
                }}
            />
        </View>
    );
}
