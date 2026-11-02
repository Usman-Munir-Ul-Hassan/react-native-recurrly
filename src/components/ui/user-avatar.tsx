import React, { useState } from "react";
import { Image, Text, View } from "react-native";
import { Colors } from "@/constants/theme";

interface UserAvatarProps {
    imageUrl?: string | null;
    initials: string;
    size?: number;
}

/**
 * Renders the user's avatar image or initials fallback badge.
 * Adheres strictly to the achromatic palette and circular border treatment in DESIGN.md.
 */
export function UserAvatar({ imageUrl, initials, size = 36 }: UserAvatarProps) {
    const [imageError, setImageError] = useState(false);

    if (imageUrl && !imageError) {
        return (
            <Image
                source={{ uri: imageUrl }}
                onError={() => setImageError(true)}
                style={{
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    borderWidth: 1,
                    borderColor: Colors.cardBorder,
                }}
            />
        );
    }

    return (
        <View
            style={{
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: Colors.badgeBg,
                borderWidth: 1,
                borderColor: Colors.badgeBorder,
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <Text
                style={{
                    fontSize: Math.round(size * 0.36),
                    fontWeight: "700",
                    color: Colors.pitchBlack,
                }}
            >
                {initials}
            </Text>
        </View>
    );
}
