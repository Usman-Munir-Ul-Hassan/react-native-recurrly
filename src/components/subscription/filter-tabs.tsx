import React from "react";
import { Pressable, ScrollView, Text } from "react-native";
import { Colors, Radius } from "@/constants/theme";

export type TabType = "All" | "Active" | "Upcoming renewal";

interface FilterTabsProps {
  selectedTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

const TABS: TabType[] = ["All", "Active", "Upcoming renewal"];

export function FilterTabs({ selectedTab, onSelectTab }: FilterTabsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="mb-4"
      contentContainerStyle={{ gap: 8 }}
    >
      {TABS.map((tab) => {
        const isActive = selectedTab === tab;
        return (
          <Pressable
            key={tab}
            onPress={() => onSelectTab(tab)}
            style={{
              backgroundColor: isActive ? Colors.pitchBlack : Colors.limestone,
              borderRadius: Radius.tag,
              paddingVertical: 7,
              paddingHorizontal: 14,
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: "500",
                color: isActive ? Colors.cloud : Colors.graphite,
              }}
            >
              {tab}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
