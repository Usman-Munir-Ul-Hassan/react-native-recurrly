import React, { useMemo } from "react";
import { Pressable, Text, View } from "react-native";
import { getSemanticCardTheme } from "@/constants/theme";
import { getSubscriptionCurrency, Subscription } from "@/types/subscription";
import { ImageWithSkeleton } from "@/components/ui/image-with-skeleton";
import { usePreferences } from "@/context/preferences-context";
import { formatCompactPrice } from "@/utils/compact-currency-formatter";

interface HorizontalCardProps {
  subscription: Subscription;
  onPress: () => void;
}

export function HorizontalSubscriptionCard({
  subscription,
  onPress,
}: HorizontalCardProps) {
  const prefs = usePreferences();
  const subCurrency = getSubscriptionCurrency(subscription);
  const compactDisplayPrice = prefs.formatCompactPrice
    ? prefs.formatCompactPrice(subscription.amountNumeric, undefined, subCurrency)
    : formatCompactPrice(subscription.amountNumeric, subCurrency);
  const theme = getSemanticCardTheme(subscription);

  // Status color tinting for the top-right corner badge:
  const isDueSoon = subscription.daysRemaining <= 3;
  const isUrgent = subscription.daysRemaining === 0;

  const badgeTheme = useMemo(() => {
    if (subscription.status === "Cancelled") {
      return { bg: "#FEF2F2", text: "#991B1B", border: "#FECACA" };
    }
    if (subscription.status === "Paused") {
      return { bg: "#FFFBEB", text: "#92400E", border: "#FDE68A" };
    }
    if (isUrgent) {
      return { bg: "#FEF2F2", text: "#991B1B", border: "#FECACA" };
    }
    if (isDueSoon) {
      return { bg: "#FFFBEB", text: "#B45309", border: "#FDE68A" };
    }
    // Healthy active subscription renewal (soft light green)
    return { bg: "#ECFDF5", text: "#065F46", border: "#A7F3D0" };
  }, [subscription.status, isDueSoon, isUrgent]);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${subscription.name}, ${compactDisplayPrice}, ${subscription.daysRemaining} days remaining`}
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
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Docked Top-Right Corner Badge with Status Tint */}
        <View
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            backgroundColor: badgeTheme.bg,
            paddingHorizontal: 8,
            paddingVertical: 3.5,
            borderBottomLeftRadius: 8,
            borderLeftWidth: 1,
            borderBottomWidth: 1,
            borderColor: badgeTheme.border,
          }}
        >
          <Text
            style={{
              fontSize: 10,
              fontWeight: "700",
              color: badgeTheme.text,
              letterSpacing: 0.3,
            }}
            numberOfLines={1}
          >
            {subscription.daysRemaining === 0
              ? "TODAY"
              : `${subscription.daysRemaining}D LEFT`}
          </Text>
        </View>

        {/* Top: Square Brand Icon Box */}
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 2 }}>
          <View
            style={{
              width: 38,
              height: 38,
              backgroundColor: theme.iconBg,
              borderRadius: 10,
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            <ImageWithSkeleton
              uri={subscription.logoUrl}
              fallbackText={subscription.initials}
              width={24}
              height={24}
              borderRadius={6}
              fallbackTextColor={theme.textColor}
            />
          </View>
        </View>

        {/* Middle: Service Name */}
        <Text
          numberOfLines={1}
          style={{
            fontSize: 14,
            fontWeight: "600",
            color: theme.textColor,
            marginTop: 12,
            letterSpacing: -0.2,
          }}
        >
          {subscription.name}
        </Text>

        {/* Bottom: Full-Width Prominent Price */}
        <Text
          numberOfLines={1}
          style={{
            fontSize: 18,
            fontWeight: "700",
            color: theme.textColor,
            fontVariant: ["tabular-nums"],
            marginTop: 4,
          }}
        >
          {compactDisplayPrice}
        </Text>
      </View>
    </Pressable>
  );
}
