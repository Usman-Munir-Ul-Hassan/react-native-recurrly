import React, { useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { Colors, getSemanticCardTheme } from "@/constants/theme";
import { Subscription } from "@/types/subscription";

interface HorizontalCardProps {
  subscription: Subscription;
  onPress: () => void;
}

export function HorizontalSubscriptionCard({
  subscription,
  onPress,
}: HorizontalCardProps) {
  const [imageError, setImageError] = useState(false);
  const formattedPrice = `$${subscription.amountNumeric.toFixed(2)}`;
  const theme = getSemanticCardTheme(subscription);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: pressed ? 0.88 : 1,
        transform: [{ scale: pressed ? 0.97 : 1 }],
      })}
    >
      <View
        style={{
          width: 156,
          backgroundColor: theme.bg,
          borderWidth: 1,
          borderColor: theme.borderColor,
          borderRadius: 16,
          padding: 12,
          marginRight: 10,
        }}
      >
        {/* Top Row: Square Icon Box (Left) + Price & Days Left (Right) */}
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {/* Logo container box */}
          <View
            style={{
              width: 44,
              height: 44,
              backgroundColor: theme.iconBg,
              borderRadius: 12,
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            {subscription.logoUrl && !imageError ? (
              <Image
                source={{ uri: subscription.logoUrl }}
                onError={() => setImageError(true)}
                style={{ width: 26, height: 26, resizeMode: "contain" }}
              />
            ) : (
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "700",
                  color: theme.textColor,
                }}
              >
                {subscription.initials}
              </Text>
            )}
          </View>

          {/* Price + Days Remaining Stacked */}
          <View style={{ flex: 1, marginLeft: 10, justifyContent: "center" }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: theme.textColor,
                fontVariant: ["tabular-nums"],
              }}
              numberOfLines={1}
            >
              {formattedPrice}
            </Text>
            <Text
              style={{
                fontSize: 12,
                fontWeight: "500",
                color: theme.subtextColor,
                marginTop: 2,
              }}
              numberOfLines={1}
            >
              {subscription.daysRemaining} days left
            </Text>
          </View>
        </View>

        {/* Bottom: Service Name */}
        <Text
          numberOfLines={1}
          style={{
            fontSize: 15,
            fontWeight: "700",
            color: theme.textColor,
            marginTop: 14,
          }}
        >
          {subscription.name}
        </Text>
      </View>
    </Pressable>
  );
}
