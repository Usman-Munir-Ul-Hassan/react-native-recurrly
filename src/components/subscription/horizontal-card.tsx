import React from "react";
import { Pressable, Text, View } from "react-native";
import { getSemanticCardTheme } from "@/constants/theme";
import { Subscription } from "@/types/subscription";
import { ImageWithSkeleton } from "@/components/ui/image-with-skeleton";

interface HorizontalCardProps {
  subscription: Subscription;
  onPress: () => void;
}

export function HorizontalSubscriptionCard({
  subscription,
  onPress,
}: HorizontalCardProps) {
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
            <ImageWithSkeleton
              uri={subscription.logoUrl}
              fallbackText={subscription.initials}
              width={26}
              height={26}
              borderRadius={6}
              fallbackTextColor={theme.textColor}
            />
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
