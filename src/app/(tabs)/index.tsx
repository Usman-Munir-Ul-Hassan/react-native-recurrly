import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Colors, Radius } from "@/constants/theme";
import { useSubscriptions } from "@/context/subscription-context";
import { AppHeader } from "@/components/navigation/app-header";
import { MetricCard } from "@/components/subscription/metric-card";
import { FilterDropdown } from "@/components/subscription/filter-dropdown";
import { TabType } from "@/components/subscription/filter-tabs";
import { SubscriptionCard } from "@/components/subscription/subscription-card";
import { HorizontalSubscriptionCard } from "@/components/subscription/horizontal-card";
import { AddSubscriptionModal } from "@/components/subscription/add-subscription-modal";
import { SearchInput } from "@/components/subscription/search-input";
import { filterSubscriptions } from "@/utils/subscription-filter";
import { useUserProfile } from "@/hooks/use-user-profile";

export default function SubscriptionsFeedScreen() {
  const router = useRouter();
  const { email } = useUserProfile();
  const {
    subscriptions,
    activeCount,
    totalMonthlyAmount,
    nextRenewalDate,
    addSubscription,
  } = useSubscriptions();

  const [selectedTab, setSelectedTab] = useState<TabType>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Upcoming renewals for the X-direction horizontal carousel
  const upcomingSubs = [...subscriptions]
    .filter((sub) => sub.status === "Active")
    .sort((a, b) => {
      const order = ["notion-team", "dropbox", "netflix", "claude-pro", "figma"];
      const aIdx = order.indexOf(a.id);
      const bIdx = order.indexOf(b.id);
      if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
      if (aIdx !== -1) return -1;
      if (bIdx !== -1) return 1;
      return a.daysRemaining - b.daysRemaining;
    });

  // Filtered subscriptions calculation for vertical list combining tab & search
  const displayedSubscriptions = useMemo(
    () => filterSubscriptions(subscriptions, selectedTab, searchQuery),
    [subscriptions, selectedTab, searchQuery]
  );

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: Colors.canvas }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 6, paddingBottom: 40 }}
      >
        {/* Top Header: Real-time User Profile & Avatar */}
        <AppHeader />

        {/* Dynamic Metric Widget */}
        <MetricCard
          totalAmount={totalMonthlyAmount}
          activeCount={activeCount}
          nextRenewalDate={nextRenewalDate}
        />

        {/* Horizontal Carousel Section: Upcoming (X-Direction) */}
        {upcomingSubs.length > 0 && (
          <View className="mb-5">
            <View className="flex-row items-center justify-between mb-3">
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "700",
                  color: Colors.pitchBlack,
                }}
              >
                Upcoming
              </Text>
              <Pressable
                onPress={() => router.push("/(tabs)/subscription")}
                style={{
                  borderWidth: 1,
                  borderColor: Colors.badgeBorder,
                  borderRadius: 9999,
                  paddingHorizontal: 14,
                  paddingVertical: 5,
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "600",
                    color: Colors.pitchBlack,
                  }}
                >
                  View all
                </Text>
              </Pressable>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: 8 }}
            >
              {upcomingSubs.map((item) => (
                <HorizontalSubscriptionCard
                  key={`upcoming-${item.id}`}
                  subscription={item}
                  onPress={() => router.push(`/details/${item.id}`)}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Search Input Bar */}
        <SearchInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search subscriptions by name or category..."
        />

        {/* Action & Filter Row: Dropdown (Left) <----------------> + Add Button (Right) */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
            marginTop: 4,
          }}
        >
          {/* Unified Dropdown (All, Active, Upcoming) */}
          <FilterDropdown
            selectedTab={selectedTab}
            onSelectTab={setSelectedTab}
          />

          {/* + Add Button */}
          <Pressable
            onPress={() => setIsAddModalOpen(true)}
            style={{
              backgroundColor: Colors.action,
              borderRadius: 9999,
              paddingVertical: 7,
              paddingHorizontal: 16,
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

        {/* Vertical Subscriptions List */}
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
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: Colors.pitchBlack,
                  marginBottom: 4,
                }}
              >
                {searchQuery ? "No matching subscriptions" : "No subscriptions found"}
              </Text>
              <Text style={{ fontSize: 13, color: Colors.graphite, marginBottom: searchQuery ? 12 : 0 }}>
                {searchQuery
                  ? `No subscriptions match "${searchQuery}".`
                  : "No subscriptions in this category."}
              </Text>

              {Boolean(searchQuery) && (
                <Pressable
                  onPress={() => setSearchQuery("")}
                  style={{
                    paddingVertical: 6,
                    paddingHorizontal: 14,
                    borderRadius: Radius.button,
                    borderWidth: 1,
                    borderColor: Colors.fog,
                    backgroundColor: Colors.cloud,
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: "500", color: Colors.pitchBlack }}>
                    Clear search
                  </Text>
                </Pressable>
              )}
            </View>
          )}
        </View>

        {/* Add Subscription Modal */}
        <AddSubscriptionModal
          visible={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={addSubscription}
          userEmail={email}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
