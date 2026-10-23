import { AppButton } from "@/components/ui/app-button";
import { getProductById } from "@/constants/products";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Text, View } from "react-native";

export default function DynamicProductDetail() {
    // Expo Router URL se ID pakad raha hai!
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();

    const product = getProductById(id);

    if (!product) {
        return (
            <View className="flex-1 items-center justify-center p-6 bg-slate-50">
                <Text className="text-red-500 text-lg font-bold mb-4">
                    Product Not Found! (ID: {id})
                </Text>
                <AppButton title="Go Back" onPress={() => router.back()} />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-slate-50 p-6 justify-between">
            <View className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm items-center">
                <Text className="text-6xl mb-4">{product.icon}</Text>
                <Text className="text-2xl font-bold text-slate-900 mb-1">
                    {product.name}
                </Text>
                <Text className="text-indigo-600 font-extrabold text-2xl mb-4">
                    {product.price}
                </Text>
                <Text className="text-slate-600 text-center leading-relaxed text-sm">
                    {product.desc}
                </Text>
                <View className="mt-4 px-3 py-1 bg-slate-100 rounded-full">
                    <Text className="text-slate-500 text-xs">Route ID: {id}</Text>
                </View>
            </View>

            <AppButton
                title="← Back to Catalog"
                variant="secondary"
                onPress={() => router.back()}
            />
        </View>
    );
}
