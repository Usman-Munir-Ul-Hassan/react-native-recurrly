import React from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/theme";
import { SETTINGS_SECTIONS } from "@/data/settings.data";
import { SettingsSectionCard } from "@/components/settings/settings-section-card";

export default function SettingsScreen() {
  const router = useRouter();

  const handleItemPress = (itemId: string) => {
    if (itemId === "privacy-policy") {
      Alert.alert("Privacy Policy", "Chronicle does not sell or share your data.");
    } else if (itemId === "export-data") {
      Alert.alert("Export", "CSV export generated successfully.");
    }
  };

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: () => router.replace("/login") },
    ]);
  };

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
            Settings
          </Text>
          <Text style={{ fontSize: 13, color: Colors.graphite, marginTop: 2 }}>
            Manage preferences, backups, and account sessions
          </Text>
        </View>

        {/* Dynamic Settings Sections */}
        {SETTINGS_SECTIONS.map((section) => (
          <SettingsSectionCard
            key={section.id}
            section={section}
            onItemPress={handleItemPress}
          />
        ))}

        {/* Session Card with Leaf Curvature */}
        <View
          style={{
            backgroundColor: Colors.surface,
            borderWidth: 1,
            borderColor: Colors.cardBorder,
            borderTopLeftRadius: 18,
            borderTopRightRadius: 36,
            borderBottomRightRadius: 18,
            borderBottomLeftRadius: 36,
            padding: 18,
            marginBottom: 20,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: "700",
              color: Colors.pitchBlack,
              marginBottom: 4,
            }}
          >
            Session & Account
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: Colors.graphite,
              marginBottom: 14,
            }}
          >
            Switch accounts or return to the authentication screen.
          </Text>

          <Pressable
            onPress={handleSignOut}
            style={{
              backgroundColor: Colors.action,
              borderRadius: 9999,
              paddingVertical: 12,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: Colors.cloud,
              }}
            >
              Sign Out
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
