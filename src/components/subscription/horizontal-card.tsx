import React from "react";
import { Image, Pressable, Text, View } from "react-native";
import { Colors, Radius } from "@/constants/theme";
import { Subscription } from "@/types/subscription";

interface HorizontalCardProps {
  subscription: Subscription;
  onPress: () => void;
}

export function HorizontalSubscriptionCard({
  subscription,
  onPress,
}: HorizontalCardProps) {
  const formattedPrice = `$${subscription.amountNumeric.toFixed(2)}`;

  return (
    <Pressable onPress={onPress}>
      <View
        style={{
          width: 156,
          backgroundColor: "#FAF8F5",
          borderWidth: 1,
          borderColor: "#EAE6DC",
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
              backgroundColor: "#F3EFEA",
              borderRadius: 12,
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            {subscription.logoUrl ? (
              <Image
                source={{ uri: subscription.logoUrl }}
                style={{ width: 26, height: 26, resizeMode: "contain" }}
              />
            ) : (
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "700",
                  color: Colors.pitchBlack,
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
                color: Colors.pitchBlack,
                fontVariant: ["tabular-nums"],
              }}
              numberOfLines={1}
            >
              {formattedPrice}
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: "#6B7280",
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
            color: Colors.pitchBlack,
            marginTop: 14,
          }}
        >
          {subscription.name}
        </Text>
      </View>
    </Pressable>
  );
}
