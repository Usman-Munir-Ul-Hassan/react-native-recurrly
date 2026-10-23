import { Product } from "@/constants/products";
import { Pressable, Text, View } from "react-native";

interface ProductCardProps {
    product: Product;
    onPress: () => void;
}

export function ProductCard({ product, onPress }: ProductCardProps) {
    return (
        <Pressable
            onPress={onPress}
            className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm active:opacity-75 mb-3 flex-row items-center"
        >
            <Text className="text-3xl mr-3">{product.icon}</Text>
            <View className="flex-1">
                <Text className="text-base font-bold text-slate-800">{product.name}</Text>
                <Text className="text-indigo-600 font-semibold text-xs mt-0.5">
                    {product.price}
                </Text>
            </View>
            <Text className="text-slate-400 text-lg">›</Text>
        </Pressable>
    );
}
