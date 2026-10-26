import React, { useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Colors, Radius } from "@/constants/theme";
import { useSubscriptions } from "@/context/subscription-context";
import { MetricCard } from "@/components/subscription/metric-card";
import { FilterDropdown } from "@/components/subscription/filter-dropdown";
import { TabType } from "@/components/subscription/filter-tabs";
import { SubscriptionCard } from "@/components/subscription/subscription-card";

export default function SubscriptionsFeedScreen() {
  const router = useRouter();
  const { subscriptions, activeCount, totalMonthlyAmount, nextRenewalDate } =
    useSubscriptions();

  const [selectedTab, setSelectedTab] = useState<TabType>("All");

  // Filtered subscriptions calculation
  const displayedSubscriptions = subscriptions.filter((sub) => {
    if (selectedTab === "Active") return sub.status === "Active";
    if (selectedTab === "Upcoming renewal") {
      return sub.status === "Active" && sub.renewalDateShort.includes("Nov");
    }
    return true; // "All"
  });

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: "#F8F8F8" }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 6, paddingBottom: 40 }}
      >
        {/* Top Clean Header: CHRONICLE (Left) <-----------------> JD Avatar (Right) */}
        <View className="flex-row items-center justify-between py-3 mb-2">
          <Text
            style={{
              fontSize: 16,
              fontWeight: "800",
              color: Colors.pitchBlack,
              letterSpacing: 1.5,
            }}
          >
            CHRONICLE
          </Text>

          {/* User Profile Avatar */}
          <View
            className="items-center justify-center"
            style={{
              width: 34,
              height: 34,
              borderRadius: 17,
              backgroundColor: Colors.cloud,
              borderWidth: 1,
              borderColor: Colors.fog,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: "600",
                color: Colors.pitchBlack,
              }}
            >
              JD
            </Text>
          </View>
        </View>

        {/* Dynamic Metric Widget */}
        <MetricCard
          totalAmount={totalMonthlyAmount}
          activeCount={activeCount}
          nextRenewalDate={nextRenewalDate}
        />

        {/* Action & Filter Row: Dropdown (Left) <----------------> + Add Button (Right) */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          {/* Unified Dropdown (All, Active, Upcoming) */}
          <FilterDropdown
            selectedTab={selectedTab}
            onSelectTab={setSelectedTab}
          />

          {/* + Add Button */}
          <Pressable
            onPress={() => Alert.alert("Add Subscription", "Opening add commitment modal...")}
            style={{
              backgroundColor: Colors.pitchBlack,
              borderRadius: Radius.tag,
              paddingVertical: 7,
              paddingHorizontal: 14,
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: Colors.cloud,
              }}
            >
              + Add
            </Text>
          </Pressable>
        </View>

        {/* Subscriptions List */}
        <View>
          {displayedSubscriptions.map((item) => (
            <SubscriptionCard
              key={item.id}
              subscription={item}
              onPress={() => router.push(`/details/${item.id}`)}
            />
          ))}

          {displayedSubscriptions.length === 0 && (
            <View className="py-10 items-center justify-center">
              <Text style={{ fontSize: 13, color: Colors.graphite }}>
                No subscriptions found in this category.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
