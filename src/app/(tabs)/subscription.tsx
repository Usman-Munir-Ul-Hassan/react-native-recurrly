import React, { useMemo } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors, Radius } from "@/constants/theme";
import { useSubscriptions } from "@/context/subscription-context";

export default function AnalyticsScreen() {
  const { subscriptions, activeCount, totalMonthlyAmount } = useSubscriptions();

  // Active subscriptions calculation
  const activeSubs = useMemo(
    () => subscriptions.filter((s) => s.status === "Active"),
    [subscriptions]
  );

  // Numeric monthly total
  const numericMonthlyTotal = useMemo(() => {
    return activeSubs.reduce((sum, item) => {
      const num = parseFloat(item.price.replace(/[^0-9.]/g, "")) || 0;
      return sum + num;
    }, 0);
  }, [activeSubs]);

  // Projected Annual Spend
  const annualTotal = (numericMonthlyTotal * 12).toFixed(2);
  const averagePerSub =
    activeCount > 0 ? (numericMonthlyTotal / activeCount).toFixed(2) : "0.00";

  // Category breakdown calculation
  const categoryBreakdown = useMemo(() => {
    const map: Record<string, { total: number; count: number }> = {};

    activeSubs.forEach((sub) => {
      const num = parseFloat(sub.price.replace(/[^0-9.]/g, "")) || 0;
      if (!map[sub.category]) {
        map[sub.category] = { total: 0, count: 0 };
      }
      map[sub.category].total += num;
      map[sub.category].count += 1;
    });

    return Object.entries(map)
      .map(([category, data]) => ({
        category,
        total: data.total,
        count: data.count,
        percentage:
          numericMonthlyTotal > 0
            ? Math.round((data.total / numericMonthlyTotal) * 100)
            : 0,
      }))
      .sort((a, b) => b.total - a.total);
  }, [activeSubs, numericMonthlyTotal]);

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: "#F8F8F8" }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 6, paddingBottom: 40 }}
      >
        {/* Header */}
        <View className="py-3 mb-2">
          <Text
            style={{
              fontSize: 16,
              fontWeight: "800",
              color: Colors.pitchBlack,
              letterSpacing: 1.5,
              textTransform: "uppercase",
            }}
          >
            Analytics
          </Text>
          <Text style={{ fontSize: 13, color: Colors.graphite, marginTop: 2 }}>
            Spending breakdown and category distribution
          </Text>
        </View>

        {/* Hero Projection Card */}
        <View
          style={{
            backgroundColor: Colors.cloud,
            borderWidth: 1,
            borderColor: Colors.fog,
            borderRadius: Radius.card,
            padding: 18,
            marginBottom: 14,
            shadowColor: "#000000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.04,
            shadowRadius: 2,
            elevation: 1,
          }}
        >
          <Text
            style={{
              fontSize: 13,
              color: Colors.graphite,
              fontWeight: "500",
              marginBottom: 6,
            }}
          >
            Projected Annual Spend
          </Text>

          <View className="flex-row items-baseline mb-5">
            <Text
              style={{
                fontSize: 32,
                fontWeight: "700",
                color: Colors.pitchBlack,
                letterSpacing: -1,
                fontVariant: ["tabular-nums"],
              }}
            >
              ${annualTotal}
            </Text>
            <Text style={{ fontSize: 14, color: Colors.graphite, marginLeft: 6 }}>
              / year
            </Text>
          </View>

          {/* Quick Metrics: 3 Dedicated Equal Columns with Dividers */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingTop: 14,
              borderTopWidth: 1,
              borderTopColor: Colors.fog,
            }}
          >
            {/* Metric 1 */}
            <View style={{ flex: 1 }}>
              <Text numberOfLines={1} style={{ fontSize: 11, color: Colors.graphite, marginBottom: 2 }}>
                Monthly
              </Text>
              <Text
                numberOfLines={1}
                style={{
                  fontSize: 15,
                  fontWeight: "700",
                  color: Colors.pitchBlack,
                  fontVariant: ["tabular-nums"],
                }}
              >
                {totalMonthlyAmount}
              </Text>
            </View>

            {/* Hairline Divider */}
            <View style={{ width: 1, height: 26, backgroundColor: Colors.fog, marginHorizontal: 8 }} />

            {/* Metric 2 */}
            <View style={{ flex: 1, alignItems: "center" }}>
              <Text numberOfLines={1} style={{ fontSize: 11, color: Colors.graphite, marginBottom: 2 }}>
                Avg / Sub
              </Text>
              <Text
                numberOfLines={1}
                style={{
                  fontSize: 15,
                  fontWeight: "700",
                  color: Colors.pitchBlack,
                  fontVariant: ["tabular-nums"],
                }}
              >
                ${averagePerSub}
              </Text>
            </View>

            {/* Hairline Divider */}
            <View style={{ width: 1, height: 26, backgroundColor: Colors.fog, marginHorizontal: 8 }} />

            {/* Metric 3 */}
            <View style={{ flex: 1, alignItems: "flex-end" }}>
              <Text numberOfLines={1} style={{ fontSize: 11, color: Colors.graphite, marginBottom: 2 }}>
                Active
              </Text>
              <Text
                numberOfLines={1}
                style={{
                  fontSize: 15,
                  fontWeight: "700",
                  color: Colors.pitchBlack,
                }}
              >
                {activeCount} Services
              </Text>
            </View>
          </View>
        </View>

        {/* Category Breakdown Section */}
        <View
          style={{
            backgroundColor: Colors.cloud,
            borderWidth: 1,
            borderColor: Colors.fog,
            borderRadius: Radius.card,
            padding: 16,
            marginBottom: 14,
            shadowColor: "#000000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.04,
            shadowRadius: 2,
            elevation: 1,
          }}
        >
          <Text
            style={{
              fontSize: 13,
              fontWeight: "700",
              color: Colors.pitchBlack,
              textTransform: "uppercase",
              letterSpacing: 0.8,
              marginBottom: 16,
            }}
          >
            Spending by Category
          </Text>

          {categoryBreakdown.map((item, index) => (
            <View
              key={item.category}
              style={{
                marginBottom: index < categoryBreakdown.length - 1 ? 16 : 0,
              }}
            >
              {/* Category Name & Amount */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 6,
                }}
              >
                <Text
                  numberOfLines={1}
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: Colors.pitchBlack,
                    flex: 1,
                    marginRight: 8,
                  }}
                >
                  {item.category}
                </Text>

                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "700",
                      color: Colors.pitchBlack,
                      fontVariant: ["tabular-nums"],
                    }}
                  >
                    ${item.total.toFixed(2)}
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      color: Colors.graphite,
                      marginLeft: 6,
                    }}
                  >
                    ({item.percentage}%)
                  </Text>
                </View>
              </View>

              {/* High-Contrast Visible Progress Bar Track */}
              <View
                style={{
                  height: 6,
                  width: "100%",
                  backgroundColor: "#EBEBEB",
                  borderRadius: 3,
                  overflow: "hidden",
                }}
              >
                <View
                  style={{
                    height: "100%",
                    width: `${item.percentage}%`,
                    backgroundColor: Colors.pitchBlack,
                    borderRadius: 3,
                  }}
                />
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
