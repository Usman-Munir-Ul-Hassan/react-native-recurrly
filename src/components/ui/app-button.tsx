import { Pressable, Text } from "react-native";

interface AppButtonProps {
    title: string;
    onPress: () => void;
    variant?: "primary" | "secondary";
}

export function AppButton({ title, onPress, variant = "primary" }: AppButtonProps) {
    const isPrimary = variant === "primary";

    return (
        <Pressable
            onPress={onPress}
            className={`px-6 py-3 rounded-xl active:opacity-80 items-center justify-center ${isPrimary ? "bg-indigo-600" : "bg-slate-200"
                }`}
        >
            <Text
                className={`font-semibold text-base ${isPrimary ? "text-white" : "text-slate-800"
                    }`}
            >
                {title}
            </Text>
        </Pressable>
    );
}
