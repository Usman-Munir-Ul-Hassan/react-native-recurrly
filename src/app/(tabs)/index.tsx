import { ProductCard } from "@/components/ui/product-card";
import { PRODUCTS } from "@/constants/products";
import { useRouter } from "expo-router";
import { ScrollView, Text } from "react-native";

export default function HomeScreen() {
    const router = useRouter();

    return (
        <ScrollView className="flex-1 bg-slate-50 p-5">
            <Text className="text-slate-500 text-sm mb-4">
                Tap any product to view dynamic details:
            </Text>

            {PRODUCTS.map((item) => (
                <ProductCard
                    key={item.id}
                    product={item}
                    onPress={() => router.push(`/details/${item.id}`)}
                />
            ))}
        </ScrollView>
    );
}
