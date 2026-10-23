import { AppButton } from "@/components/ui/app-button";
import { useRouter } from "expo-router";
import { Pressable, Text, TextInput, View } from "react-native";

export default function LoginScreen() {
    const router = useRouter();

    const handleLogin = () => {
        // User login hone ke baad main tabs par wapas bhejenge
        router.replace("/");
    };

    return (
        <View className="flex-1 bg-white p-6 justify-center">
            <View className="mb-8">
                <Text className="text-3xl font-extrabold text-slate-900 mb-2">
                    Welcome Back 👋
                </Text>
                <Text className="text-slate-500 text-sm">
                    Please sign in to continue to your account.
                </Text>
            </View>

            <View className="gap-4 mb-6">
                <View>
                    <Text className="text-xs font-bold text-slate-700 uppercase mb-2">
                        Email Address
                    </Text>
                    <TextInput
                        placeholder="name@example.com"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900"
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>

                <View>
                    <Text className="text-xs font-bold text-slate-700 uppercase mb-2">
                        Password
                    </Text>
                    <TextInput
                        placeholder="••••••••"
                        secureTextEntry
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900"
                    />
                </View>

                <Pressable
                    onPress={() => router.push("/forgot-password")}
                    className="self-end"
                >
                    <Text className="text-indigo-600 text-xs font-semibold">
                        Forgot Password?
                    </Text>
                </Pressable>
            </View>

            <AppButton title="Sign In" onPress={handleLogin} />

            <View className="flex-row justify-center mt-6">
                <Text className="text-slate-500 text-sm">Don't have an account? </Text>
                <Pressable onPress={() => router.push("/register")}>
                    <Text className="text-indigo-600 font-bold text-sm">Sign Up</Text>
                </Pressable>
            </View>
        </View>
    );
}
