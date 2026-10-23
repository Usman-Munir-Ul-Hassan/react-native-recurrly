import { AppButton } from "@/components/ui/app-button";
import { useRouter } from "expo-router";
import { ScrollView, Text, View } from "react-native";

export default function SettingsScreen() {
    const router = useRouter();

    return (
        <ScrollView className="flex-1 bg-slate-50 p-6">
            <View className="bg-white rounded-2xl border border-slate-100 p-4 mb-6 shadow-sm">
                <Text className="text-base font-bold text-slate-800 mb-3">
                    Account Preferences
                </Text>

                <View className="py-3 border-b border-slate-100 flex-row justify-between items-center">
                    <Text className="text-slate-600 text-sm">Notifications</Text>
                    <Text className="text-indigo-600 font-semibold text-sm">Enabled</Text>
                </View>

                <View className="py-3 border-b border-slate-100 flex-row justify-between items-center">
                    <Text className="text-slate-600 text-sm">Dark Mode</Text>
                    <Text className="text-slate-400 text-sm">System</Text>
                </View>

                <View className="py-3 flex-row justify-between items-center">
                    <Text className="text-slate-600 text-sm">App Version</Text>
                    <Text className="text-slate-400 text-sm">1.0.0</Text>
                </View>
            </View>

            {/* Auth Screen par switch karne ke liye Action */}
            <View className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
                <Text className="text-base font-bold text-slate-800 mb-2">Session</Text>
                <Text className="text-slate-500 text-xs mb-4">
                    Need to switch account or test auth screens?
                </Text>
                <AppButton
                    title="Sign Out (Go to Login) 🚪"
                    variant="secondary"
                    onPress={() => router.push("/login")}
                />
            </View>
        </ScrollView>
    );
}
