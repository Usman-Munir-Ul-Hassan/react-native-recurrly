import React from "react";
import { Image, Pressable, Text, View } from "react-native";
import { Colors } from "@/constants/theme";
import { Subscription } from "@/types/subscription";

interface SubscriptionCardProps {
  subscription: Subscription;
  onPress: () => void;
}

export function SubscriptionCard({ subscription, onPress }: SubscriptionCardProps) {
  const isCancelled = subscription.status === "Cancelled";

  return (
    <Pressable onPress={onPress}>
      <View
        style={{
          backgroundColor: "#FAF8F5",
          borderWidth: 1,
          borderColor: "#EAE6DC",
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
              backgroundColor: "#F3EFEA",
              borderRadius: 14,
              alignItems: "center",
              justifyContent: "center",
              marginRight: 12,
              overflow: "hidden",
            }}
          >
            {subscription.logoUrl ? (
              <Image
                source={{ uri: subscription.logoUrl }}
                style={{ width: 28, height: 28, resizeMode: "contain" }}
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

          {/* Name & Date */}
          <View style={{ flex: 1, justifyContent: "center" }}>
            <Text
              numberOfLines={1}
              style={{
                fontSize: 17,
                fontWeight: "700",
                color: Colors.pitchBlack,
                marginBottom: 3,
              }}
            >
              {subscription.name}
            </Text>
            <Text
              numberOfLines={1}
              style={{
                fontSize: 13,
                color: isCancelled ? "#DC2626" : "#6B7280",
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
              color: Colors.pitchBlack,
              fontVariant: ["tabular-nums"],
            }}
          >
            ${subscription.amountNumeric.toFixed(2)}
          </Text>
          <Text
            style={{
              fontSize: 13,
              color: "#6B7280",
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
