import React from "react";
import { Text, View } from "react-native";
import { Colors, Radius } from "@/constants/theme";

interface MetricCardProps {
  totalAmount: string;
  activeCount: number;
  nextRenewalDate: string;
}

export function MetricCard({
  totalAmount,
  activeCount,
  nextRenewalDate,
}: MetricCardProps) {
  return (
    <View
      style={{
        backgroundColor: Colors.cloud,
        borderWidth: 1,
        borderColor: Colors.fog,
        borderRadius: Radius.card,
        padding: 18,
        marginBottom: 12,
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 2,
        elevation: 1,
      }}
    >
      {/* Top Label */}
      <Text
        style={{
          fontSize: 13,
          fontWeight: "500",
          color: Colors.graphite,
          marginBottom: 6,
        }}
      >
        Total Commitments
      </Text>

      {/* Hero Amount Row */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "baseline",
          marginBottom: 16,
        }}
      >
        <Text
          style={{
            fontSize: 32,
            fontWeight: "700",
            color: Colors.pitchBlack,
            letterSpacing: -1,
            fontVariant: ["tabular-nums"],
          }}
        >
          {totalAmount}
        </Text>
        <Text
          style={{
            fontSize: 14,
            fontWeight: "400",
            color: Colors.graphite,
            marginLeft: 6,
          }}
        >
          / month
        </Text>
      </View>

      {/* Bottom Badges Row: 8 Active (Left) <-----------------> Next Renewal (Right) */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Active Count Badge */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: Colors.limestone,
            borderRadius: Radius.tag,
            paddingVertical: 5,
            paddingHorizontal: 10,
          }}
        >
          <View
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: "#16A34A",
              marginRight: 6,
            }}
          />
          <Text
            style={{
              fontSize: 12,
              fontWeight: "600",
              color: Colors.pitchBlack,
            }}
          >
            {activeCount} Active Services
          </Text>
        </View>

        {/* Next Renewal Badge */}
        <View
          style={{
            backgroundColor: Colors.limestone,
            borderRadius: Radius.tag,
            paddingVertical: 5,
            paddingHorizontal: 10,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              fontWeight: "500",
              color: Colors.graphite,
            }}
          >
            Next: {nextRenewalDate}
          </Text>
        </View>
      </View>
    </View>
  );
}
