import { AppButton } from "@/components/ui/app-button";
import { ScrollView, Text, View } from "react-native";

export default function SubscriptionScreen() {
    return (
        <ScrollView className="flex-1 bg-slate-50 p-6">
            <View className="bg-indigo-600 p-6 rounded-3xl mb-6 shadow-md items-center">
                <Text className="text-4xl mb-2">💎</Text>
                <Text className="text-white text-2xl font-bold">Go Premium</Text>
                <Text className="text-indigo-200 text-sm text-center mt-1">
                    Unlock exclusive discounts, priority shipping & 24/7 VIP support.
                </Text>
            </View>

            {/* Plan Card */}
            <View className="bg-white p-6 rounded-2xl border-2 border-indigo-500 mb-6 shadow-sm">
                <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-lg font-bold text-slate-900">Annual Plan</Text>
                    <View className="bg-indigo-100 px-3 py-1 rounded-full">
                        <Text className="text-indigo-700 text-xs font-bold">BEST VALUE</Text>
                    </View>
                </View>

                <Text className="text-3xl font-extrabold text-slate-900 mb-4">
                    $9.99 <Text className="text-sm font-normal text-slate-500">/ month</Text>
                </Text>

                <Text className="text-slate-600 text-xs mb-6">
                    ✓ Unlimited product tracking{"\n"}
                    ✓ Early access to flash sales{"\n"}
                    ✓ Free 2-day delivery
                </Text>

                <AppButton
                    title="Subscribe Now"
                    onPress={() => alert("Subscribed Successfully! 🎉")}
                />
            </View>
        </ScrollView>
    );
}
