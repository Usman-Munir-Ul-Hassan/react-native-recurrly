import React from "react";
import { Pressable, Text, View } from "react-native";
import { Colors, Radius } from "@/constants/theme";
import { Subscription } from "@/constants/subscriptions";

interface SubscriptionCardProps {
  subscription: Subscription;
  onPress: () => void;
}

function isExpiringSoon(cadence: string): boolean {
  const match = cadence.match(/in\s+(\d+)\s+day/i);
  if (match) {
    const days = parseInt(match[1], 10);
    return days <= 7;
  }
  return false;
}

export function SubscriptionCard({ subscription, onPress }: SubscriptionCardProps) {
  const isCancelled = subscription.status === "Cancelled";
  const isUrgent = !isCancelled && isExpiringSoon(subscription.cadence);

  return (
    <Pressable onPress={onPress}>
      <View
        style={{
          backgroundColor: Colors.cloud,
          borderWidth: 1,
          borderColor: isUrgent ? "#FDE68A" : Colors.fog,
          borderRadius: Radius.card,
          paddingVertical: 14,
          paddingHorizontal: 16,
          marginBottom: 10,
          flexDirection: "row",
          alignItems: "center",
          shadowColor: "#000000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: isUrgent ? 0.08 : 0.04,
          shadowRadius: 2,
          elevation: 1,
        }}
      >
        {/* 44x44px Square Monogram Box (Fixed on Left) */}
        <View
          style={{
            width: 44,
            height: 44,
            backgroundColor: Colors.limestone,
            borderRadius: Radius.tag,
            borderWidth: 1,
            borderColor: Colors.fog,
            alignItems: "center",
            justifyContent: "center",
            marginRight: 14,
            flexShrink: 0,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: "700",
              color: Colors.pitchBlack,
              letterSpacing: 0.5,
            }}
          >
            {subscription.initials}
          </Text>
        </View>

        {/* Content Area: 2 Rows */}
        <View style={{ flex: 1, justifyContent: "center" }}>
          {/* Row 1: Name (Shrinkable) + Status (Locked) <---------> Price (Locked) */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 4,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", flex: 1, marginRight: 8 }}>
              {/* Service Name with Smart Ellipsis */}
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={{
                  fontSize: 15,
                  fontWeight: "700",
                  color: Colors.pitchBlack,
                  flexShrink: 1,
                  marginRight: 6,
                }}
              >
                {subscription.name}
              </Text>

              {/* Status Pill Tag */}
              <View
                style={{
                  backgroundColor: isCancelled ? "#FEE2E2" : Colors.limestone,
                  borderRadius: Radius.tag,
                  paddingHorizontal: 6,
                  paddingVertical: 1.5,
                  flexShrink: 0,
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "500",
                    color: isCancelled ? "#991B1B" : "#555555",
                  }}
                >
                  {subscription.status}
                </Text>
              </View>
            </View>

            {/* Price */}
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: Colors.pitchBlack,
                letterSpacing: -0.3,
                fontVariant: ["tabular-nums"],
                flexShrink: 0,
              }}
            >
              {subscription.price}
            </Text>
          </View>

          {/* Row 2: Renewal Date (Left) <-------------------------> Cadence (Right) */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{
                fontSize: 12,
                color: isCancelled ? "#DC2626" : Colors.graphite,
                flex: 1,
                marginRight: 8,
              }}
            >
              {isCancelled ? "Subscription discontinued" : subscription.renewalDateShort}
            </Text>

            {/* Urgency Highlight: Soft Warm Amber Pill if <= 7 days */}
            {isUrgent ? (
              <View
                style={{
                  backgroundColor: "#FEF3C7",
                  borderRadius: Radius.tag,
                  paddingHorizontal: 7,
                  paddingVertical: 2,
                  flexShrink: 0,
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "600",
                    color: "#92400E",
                  }}
                >
                  {subscription.cadence}
                </Text>
              </View>
            ) : (
              <Text
                style={{
                  fontSize: 12,
                  color: Colors.graphite,
                  flexShrink: 0,
                }}
              >
                {isCancelled ? "Cancelled" : subscription.cadence}
              </Text>
            )}
          </View>
        </View>
      </View>
    </Pressable>
  );
}
