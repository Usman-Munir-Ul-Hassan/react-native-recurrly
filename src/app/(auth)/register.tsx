import { AppButton } from "@/components/ui/app-button";
import { useRouter } from "expo-router";
import { Pressable, Text, TextInput, View } from "react-native";

export default function RegisterScreen() {
    const router = useRouter();

    return (
        <View className="flex-1 bg-white p-6 justify-center">
            <View className="mb-8">
                <Text className="text-3xl font-extrabold text-slate-900 mb-2">
                    Create Account 🚀
                </Text>
                <Text className="text-slate-500 text-sm">
                    Join thousands of members enjoying premium features.
                </Text>
            </View>

            <View className="gap-4 mb-6">
                <View>
                    <Text className="text-xs font-bold text-slate-700 uppercase mb-2">
                        Full Name
                    </Text>
                    <TextInput
                        placeholder="John Doe"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900"
                    />
                </View>

                <View>
                    <Text className="text-xs font-bold text-slate-700 uppercase mb-2">
                        Email Address
                    </Text>
                    <TextInput
                        placeholder="name@example.com"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900"
                        keyboardType="email-address"
                    />
                </View>

                <View>
                    <Text className="text-xs font-bold text-slate-700 uppercase mb-2">
                        Password
                    </Text>
                    <TextInput
                        placeholder="Create password"
                        secureTextEntry
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900"
                    />
                </View>
            </View>

            <AppButton
                title="Create Account"
                onPress={() => {
                    alert("Account Created! 🎉");
                    router.replace("/");
                }}
            />

            <View className="flex-row justify-center mt-6">
                <Text className="text-slate-500 text-sm">Already a member? </Text>
                <Pressable onPress={() => router.back()}>
                    <Text className="text-indigo-600 font-bold text-sm">Sign In</Text>
                </Pressable>
            </View>
        </View>
    );
}
