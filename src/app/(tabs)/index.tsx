import React, { useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";
import { useSubscriptions } from "@/context/subscription-context";
import { AppHeader } from "@/components/navigation/app-header";
import { MetricCard } from "@/components/subscription/metric-card";
import { FilterDropdown } from "@/components/subscription/filter-dropdown";
import { TabType } from "@/components/subscription/filter-tabs";
import { SubscriptionCard } from "@/components/subscription/subscription-card";
import { HorizontalSubscriptionCard } from "@/components/subscription/horizontal-card";
import { AddSubscriptionModal } from "@/components/subscription/add-subscription-modal";
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
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const carouselRef = useRef<ScrollView>(null);
  const [scrollX, setScrollX] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);
  const [layoutWidth, setLayoutWidth] = useState(0);
  const CARD_SCROLL_STEP = 190;

  const handleScrollLeft = () => {
    const targetX = Math.max(0, scrollX - CARD_SCROLL_STEP);
    carouselRef.current?.scrollTo?.({ x: targetX, animated: true });
    setScrollX(targetX);
  };

  const handleScrollRight = () => {
    const maxScroll = Math.max(0, contentWidth - layoutWidth);
    const targetX =
      contentWidth > 0 && layoutWidth > 0
        ? Math.min(maxScroll, scrollX + CARD_SCROLL_STEP)
        : scrollX + CARD_SCROLL_STEP;
    carouselRef.current?.scrollTo?.({ x: targetX, animated: true });
    setScrollX(targetX);
  };

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

  const canScrollLeft = upcomingSubs.length > 2 && scrollX > 5;
  const canScrollRight =
    upcomingSubs.length > 2 &&
    (contentWidth > 0 && layoutWidth > 0
      ? scrollX < contentWidth - layoutWidth - 5
      : true);

  // Filtered subscriptions calculation for vertical list
  const displayedSubscriptions = useMemo(
    () => filterSubscriptions(subscriptions, selectedTab, ""),
    [subscriptions, selectedTab]
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

            <View style={{ position: "relative" }}>
              {/* Left Scroll Affordance Button: disappears completely when scrolled to start */}
              {canScrollLeft && (
                <Pressable
                  onPress={handleScrollLeft}
                  hitSlop={8}
                  style={{
                    position: "absolute",
                    left: -2,
                    top: "34%",
                    zIndex: 10,
                    width: 38,
                    height: 38,
                    borderRadius: 19,
                    backgroundColor: Colors.cloud,
                    borderWidth: 1,
                    borderColor: Colors.fog,
                    alignItems: "center",
                    justifyContent: "center",
                    shadowColor: "#000000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.14,
                    shadowRadius: 5,
                    elevation: 5,
                  }}
                  accessibilityLabel="Scroll upcoming subscriptions left"
                  testID="btn-carousel-scroll-left"
                >
                  <Ionicons name="chevron-back" size={22} color={Colors.pitchBlack} />
                </Pressable>
              )}

              {/* Right Scroll Affordance Button: disappears completely when scrolled to end */}
              {canScrollRight && (
                <Pressable
                  onPress={handleScrollRight}
                  hitSlop={8}
                  style={{
                    position: "absolute",
                    right: -2,
                    top: "34%",
                    zIndex: 10,
                    width: 38,
                    height: 38,
                    borderRadius: 19,
                    backgroundColor: Colors.cloud,
                    borderWidth: 1,
                    borderColor: Colors.fog,
                    alignItems: "center",
                    justifyContent: "center",
                    shadowColor: "#000000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.14,
                    shadowRadius: 5,
                    elevation: 5,
                  }}
                  accessibilityLabel="Scroll upcoming subscriptions right"
                  testID="btn-carousel-scroll-right"
                >
                  <Ionicons name="chevron-forward" size={22} color={Colors.pitchBlack} />
                </Pressable>
              )}

              <ScrollView
                ref={carouselRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: 8 }}
                onScroll={(e) => setScrollX(e.nativeEvent.contentOffset.x)}
                onContentSizeChange={(w) => setContentWidth(w)}
                onLayout={(e) => setLayoutWidth(e.nativeEvent.layout.width)}
                scrollEventThrottle={16}
                testID="scroll-upcoming-carousel"
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
          </View>
        )}

        {/* Search Trigger Bar: Tapping navigates to dedicated /search screen */}
        <Pressable
          onPress={() => router.push("/search")}
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "#FAF9F6",
            borderWidth: 1,
            borderColor: Colors.fog,
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 10,
            marginBottom: 12,
          }}
          accessibilityLabel="Open search subscriptions screen"
          testID="btn-open-search"
        >
          <Ionicons
            name="search-outline"
            size={18}
            color={Colors.graphite}
            style={{ marginRight: 8 }}
          />
          <Text style={{ fontSize: 14, color: Colors.ash, flex: 1 }}>
            Search subscriptions by name or category...
          </Text>
        </Pressable>

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
              <Text style={{ fontSize: 13, color: Colors.graphite }}>
                No subscriptions found in this category.
              </Text>
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
