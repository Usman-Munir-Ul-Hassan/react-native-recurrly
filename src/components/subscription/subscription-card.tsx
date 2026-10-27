import React, { useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { getSemanticCardTheme } from "@/constants/theme";
import { Subscription } from "@/types/subscription";

interface SubscriptionCardProps {
  subscription: Subscription;
  onPress: () => void;
}

export function SubscriptionCard({ subscription, onPress }: SubscriptionCardProps) {
  const [imageError, setImageError] = useState(false);
  const isCancelled = subscription.status === "Cancelled";
  const theme = getSemanticCardTheme(subscription);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: pressed ? 0.88 : 1,
        transform: [{ scale: pressed ? 0.98 : 1 }],
      })}
    >
      <View
        style={{
          backgroundColor: isCancelled ? "#F5F5F5" : theme.bg,
          borderWidth: 1,
          borderColor: isCancelled ? "#E5E5E5" : theme.borderColor,
          borderTopLeftRadius: 14,
          borderTopRightRadius: 36,
          borderBottomRightRadius: 14,
          borderBottomLeftRadius: 36,
          paddingVertical: 14,
          paddingHorizontal: 16,
          marginBottom: 10,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Left Section: 48x48px Icon Box + Name & Subtitle */}
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1, marginRight: 12 }}>
          {/* Brand Icon Box */}
          <View
            style={{
              width: 48,
              height: 48,
              backgroundColor: isCancelled ? "rgba(0,0,0,0.05)" : theme.iconBg,
              borderRadius: 14,
              alignItems: "center",
              justifyContent: "center",
              marginRight: 12,
              overflow: "hidden",
            }}
          >
            {subscription.logoUrl && !imageError ? (
              <Image
                source={{ uri: subscription.logoUrl }}
                onError={() => setImageError(true)}
                style={{ width: 28, height: 28, resizeMode: "contain" }}
              />
            ) : (
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "700",
                  color: isCancelled ? "#999999" : theme.textColor,
                }}
              >
                {subscription.initials}
              </Text>
            )}
          </View>

          {/* Name & Date */}
          <View style={{ flex: 1, justifyContent: "center" }}>
            <Text
              numberOfLines={1}
              style={{
                fontSize: 17,
                fontWeight: "700",
                color: isCancelled ? "#999999" : theme.textColor,
                marginBottom: 3,
              }}
            >
              {subscription.name}
            </Text>
            <Text
              numberOfLines={1}
              style={{
                fontSize: 13,
                fontWeight: "500",
                color: isCancelled ? "#DC2626" : theme.subtextColor,
              }}
            >
              {isCancelled ? "Cancelled" : subscription.renewalDateShort}
            </Text>
          </View>
        </View>

        {/* Right Section: Price & Cadence */}
        <View style={{ alignItems: "flex-end", justifyContent: "center", flexShrink: 0 }}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "700",
              color: isCancelled ? "#999999" : theme.textColor,
              fontVariant: ["tabular-nums"],
            }}
          >
            ${subscription.amountNumeric.toFixed(2)}
          </Text>
          <Text
            style={{
              fontSize: 13,
              fontWeight: "500",
              color: isCancelled ? "#999999" : theme.subtextColor,
              marginTop: 2,
            }}
          >
            per month
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
