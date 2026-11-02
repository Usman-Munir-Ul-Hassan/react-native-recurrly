import React, { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Radius } from "@/constants/theme";
import { useSubscriptions } from "@/context/subscription-context";
import { SubscriptionCard } from "@/components/subscription/subscription-card";
import { filterSubscriptions } from "@/utils/subscription-filter";

const SEARCH_CATEGORIES = [
  "All",
  "Dev Tools",
  "AI & Inference",
  "Productivity",
  "Entertainment",
  "Design",
];

export default function SearchScreen() {
  const router = useRouter();
  const { subscriptions } = useSubscriptions();

  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Filter subscriptions based on search query and optional category filter
  const filteredSubscriptions = useMemo(() => {
    // First apply text query search
    const results = filterSubscriptions(subscriptions, "All", query);

    // If a specific category chip is selected, refine results
    if (selectedCategory !== "All") {
      return results.filter(
        (sub) => sub.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    return results;
  }, [subscriptions, query, selectedCategory]);

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: Colors.canvas }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        {/* Pinned Top Navigation & Search Bar */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingTop: 8,
            paddingBottom: 12,
            backgroundColor: Colors.canvas,
            borderBottomWidth: 1,
            borderBottomColor: Colors.fog,
          }}
        >
          {/* Back Button */}
          <Pressable
            onPress={() => router.back()}
            hitSlop={10}
            style={{ marginRight: 12, padding: 4 }}
            accessibilityLabel="Go back"
            testID="btn-back-from-search"
          >
            <Ionicons name="arrow-back" size={24} color={Colors.pitchBlack} />
          </Pressable>

          {/* Search Input Container */}
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: Colors.cloud,
              borderWidth: 1,
              borderColor: Colors.fog,
              borderRadius: Radius.card,
              paddingHorizontal: 12,
              paddingVertical: Platform.OS === "ios" ? 10 : 8,
            }}
          >
            <Ionicons
              name="search-outline"
              size={18}
              color={Colors.graphite}
              style={{ marginRight: 8 }}
            />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search subscriptions by name or category..."
              placeholderTextColor={Colors.ash}
              autoFocus={true}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
              style={{
                flex: 1,
                fontSize: 14,
                color: Colors.pitchBlack,
                padding: 0,
              }}
              testID="input-search-screen"
            />
            {query.length > 0 && (
              <Pressable
                onPress={() => setQuery("")}
                hitSlop={8}
                testID="btn-clear-search-screen"
              >
                <Ionicons name="close-circle" size={18} color={Colors.pewter} />
              </Pressable>
            )}
          </View>
        </View>

        {/* Category Chips Bar */}
        <View style={{ paddingVertical: 10 }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 6 }}
          >
            {SEARCH_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <Pressable
                  key={cat}
                  onPress={() => setSelectedCategory(cat)}
                  style={{
                    paddingVertical: 6,
                    paddingHorizontal: 12,
                    borderRadius: 9999,
                    borderWidth: 1,
                    borderColor: isSelected ? Colors.pitchBlack : Colors.fog,
                    backgroundColor: isSelected ? Colors.pitchBlack : Colors.cloud,
                  }}
                  testID={`chip-search-cat-${cat}`}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: isSelected ? "600" : "400",
                      color: isSelected ? Colors.cloud : Colors.charcoal,
                    }}
                  >
                    {cat}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Results List */}
        <ScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 4,
            paddingBottom: 40,
          }}
        >
          {filteredSubscriptions.map((item) => (
            <SubscriptionCard
              key={item.id}
              subscription={item}
              onPress={() => router.push(`/details/${item.id}`)}
            />
          ))}

          {/* Empty Results State */}
          {filteredSubscriptions.length === 0 && (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 48,
                paddingHorizontal: 24,
              }}
            >
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "600",
                  color: Colors.pitchBlack,
                  marginBottom: 6,
                }}
              >
                No subscriptions found
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: Colors.graphite,
                  textAlign: "center",
                  lineHeight: 18,
                  marginBottom: 16,
                }}
              >
                {query
                  ? `No subscriptions match "${query}". Try searching for another name or category.`
                  : "No subscriptions available in this category."}
              </Text>

              {query.length > 0 && (
                <Pressable
                  onPress={() => {
                    setQuery("");
                    setSelectedCategory("All");
                  }}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 16,
                    borderRadius: Radius.button,
                    borderWidth: 1,
                    borderColor: Colors.fog,
                    backgroundColor: Colors.cloud,
                  }}
                >
                  <Text style={{ fontSize: 13, fontWeight: "500", color: Colors.pitchBlack }}>
                    Reset search filters
                  </Text>
                </Pressable>
              )}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
