import React, { useMemo } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors, Radius } from "@/constants/theme";
import { useSubscriptions } from "@/context/subscription-context";
import { usePreferences } from "@/context/preferences-context";
import { getSubscriptionCurrency } from "@/types/subscription";
import { calculateAnalytics } from "@/services/subscription/analytics-calculator";
import { formatCompactNumber } from "@/utils/compact-currency-formatter";

export default function AnalyticsScreen() {
  const { subscriptions } = useSubscriptions();
  const { currencySymbol, convertAmount } = usePreferences();

  // Financial calculations normalized into active currency based on each subscription's source currency
  const stats = useMemo(() => {
    const normalizedSubs = subscriptions.map((sub) => ({
      ...sub,
      amountNumeric: convertAmount(sub.amountNumeric, getSubscriptionCurrency(sub)),
    }));
    return calculateAnalytics(normalizedSubs);
  }, [subscriptions, convertAmount]);

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: Colors.canvas }}>
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
            Real-time financial projections and category distribution
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
          <Text style={{ fontSize: 13, color: Colors.graphite, fontWeight: "500", marginBottom: 6 }}>
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
              {currencySymbol}{formatCompactNumber(stats.annualTotal)}
            </Text>
            <Text style={{ fontSize: 14, color: Colors.graphite, marginLeft: 6 }}>
              / year
            </Text>
          </View>

          {/* Quick Metrics: 3 Dedicated Columns */}
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
            {/* Metric 1: Monthly Total */}
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
                {currencySymbol}{formatCompactNumber(stats.monthlyTotal)}
              </Text>
            </View>

            <View style={{ width: 1, height: 26, backgroundColor: Colors.fog, marginHorizontal: 8 }} />

            {/* Metric 2: Average Per Sub */}
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
                {currencySymbol}{formatCompactNumber(stats.averagePerSub)}
              </Text>
            </View>

            <View style={{ width: 1, height: 26, backgroundColor: Colors.fog, marginHorizontal: 8 }} />

            {/* Metric 3: Active Count */}
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
                {stats.activeCount} Services
              </Text>
            </View>
          </View>
        </View>

        {/* Status Distribution & Savings Card */}
        <View
          style={{
            backgroundColor: Colors.cloud,
            borderWidth: 1,
            borderColor: Colors.fog,
            borderRadius: Radius.card,
            padding: 16,
            marginBottom: 14,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              fontWeight: "700",
              color: Colors.pitchBlack,
              textTransform: "uppercase",
              letterSpacing: 0.8,
              marginBottom: 12,
            }}
          >
            Portfolio Status
          </Text>

          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
            <View>
              <Text style={{ fontSize: 11, color: Colors.graphite }}>Active</Text>
              <Text style={{ fontSize: 16, fontWeight: "700", color: Colors.pitchBlack }}>{stats.activeCount}</Text>
            </View>
            <View>
              <Text style={{ fontSize: 11, color: Colors.graphite }}>Paused</Text>
              <Text style={{ fontSize: 16, fontWeight: "700", color: "#d97706" }}>{stats.pausedCount}</Text>
            </View>
            <View>
              <Text style={{ fontSize: 11, color: Colors.graphite }}>Cancelled</Text>
              <Text style={{ fontSize: 16, fontWeight: "700", color: "#dc2626" }}>{stats.cancelledCount}</Text>
            </View>
            <View>
              <Text style={{ fontSize: 11, color: Colors.graphite }}>Total</Text>
              <Text style={{ fontSize: 16, fontWeight: "700", color: Colors.pitchBlack }}>{stats.totalCount}</Text>
            </View>
          </View>

          {stats.monthlySavings > 0 ? (
            <View
              style={{
                backgroundColor: "#F0FDF4",
                borderWidth: 1,
                borderColor: "#BBF7D0",
                borderRadius: Radius.tag,
                paddingVertical: 8,
                paddingHorizontal: 10,
              }}
            >
              <Text style={{ fontSize: 12, color: "#166534", fontWeight: "600" }}>
                ✓ Saving {currencySymbol}{formatCompactNumber(stats.monthlySavings)}/mo on paused & cancelled services
              </Text>
            </View>
          ) : null}
        </View>

        {/* Highlights: Top Expense & Due Soon */}
        {stats.topExpense || stats.upcomingRenewalsCount > 0 ? (
          <View
            style={{
              flexDirection: "row",
              gap: 10,
              marginBottom: 14,
            }}
          >
            {stats.topExpense ? (
              <View
                style={{
                  flex: 1,
                  backgroundColor: Colors.cloud,
                  borderWidth: 1,
                  borderColor: Colors.fog,
                  borderRadius: Radius.card,
                  padding: 14,
                }}
              >
                <Text style={{ fontSize: 11, color: Colors.graphite, textTransform: "uppercase", fontWeight: "600" }}>
                  Top Expense
                </Text>
                <Text numberOfLines={1} style={{ fontSize: 14, fontWeight: "700", color: Colors.pitchBlack, marginTop: 4 }}>
                  {stats.topExpense.name}
                </Text>
                <Text style={{ fontSize: 12, color: Colors.graphite, marginTop: 2 }}>
                  {currencySymbol}{formatCompactNumber(stats.topExpense.amount)}/mo
                </Text>
              </View>
            ) : null}

            <View
              style={{
                flex: 1,
                backgroundColor: Colors.cloud,
                borderWidth: 1,
                borderColor: Colors.fog,
                borderRadius: Radius.card,
                padding: 14,
              }}
            >
              <Text style={{ fontSize: 11, color: Colors.graphite, textTransform: "uppercase", fontWeight: "600" }}>
                Due in 7 Days
              </Text>
              <Text style={{ fontSize: 14, fontWeight: "700", color: Colors.pitchBlack, marginTop: 4 }}>
                {stats.upcomingRenewalsCount} {stats.upcomingRenewalsCount === 1 ? "Renewal" : "Renewals"}
              </Text>
              <Text style={{ fontSize: 12, color: Colors.graphite, marginTop: 2 }}>
                Upcoming cycle
              </Text>
            </View>
          </View>
        ) : null}

        {/* Category Breakdown Section */}
        <View
          style={{
            backgroundColor: Colors.cloud,
            borderWidth: 1,
            borderColor: Colors.fog,
            borderRadius: Radius.card,
            padding: 16,
            marginBottom: 14,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              fontWeight: "700",
              color: Colors.pitchBlack,
              textTransform: "uppercase",
              letterSpacing: 0.8,
              marginBottom: 16,
            }}
          >
            Spending by Category
          </Text>

          {stats.categoryBreakdown.length === 0 ? (
            <Text style={{ fontSize: 13, color: Colors.graphite, textAlign: "center", paddingVertical: 12 }}>
              No active subscriptions found.
            </Text>
          ) : (
            stats.categoryBreakdown.map((item, index) => (
              <View
                key={item.category}
                style={{
                  marginBottom: index < stats.categoryBreakdown.length - 1 ? 16 : 0,
                }}
              >
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
                      {currencySymbol}{formatCompactNumber(item.total)}
                    </Text>
                    <Text style={{ fontSize: 12, color: Colors.graphite, marginLeft: 6 }}>
                      ({item.percentage}%)
                    </Text>
                  </View>
                </View>

                {/* Progress Bar Track */}
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
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
