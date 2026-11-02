import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useClerk } from "@clerk/expo";
import * as Notifications from "expo-notifications";
import { Colors, Radius } from "@/constants/theme";
import { SettingSection } from "@/types/settings";
import { SettingsSectionCard } from "@/components/settings/settings-section-card";
import { useUserProfile } from "@/hooks/use-user-profile";
import { useSubscriptions } from "@/context/subscription-context";
import { usePreferences } from "@/context/preferences-context";
import {
  SUPPORTED_CURRENCIES,
} from "@/utils/currency-formatter";
import { exportAndShareSubscriptionsCsv } from "@/services/subscription/csv-export-service";
import { requestNotificationPermissions } from "@/services/notification/renewal-notification-service";

export default function SettingsScreen() {
  const router = useRouter();
  const { signOut } = useClerk();
  const { displayName, email, initials, imageUrl } = useUserProfile();
  const { subscriptions, isSyncing } = useSubscriptions();
  const {
    currency,
    currencySymbol,
    alertsEnabled,
    setCurrency,
    setAlertsEnabled,
  } = usePreferences();

  const [notificationStatus, setNotificationStatus] = useState<string>("Checking...");
  const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);

  // Check actual device permission on mount
  useEffect(() => {
    let isMounted = true;
    Notifications.getPermissionsAsync()
      .then(({ status }) => {
        if (isMounted) {
          setNotificationStatus(status === "granted" ? "Enabled" : "Tap to Allow");
        }
      })
      .catch(() => {
        if (isMounted) setNotificationStatus("Unknown");
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleToggleNotifications = async () => {
    if (alertsEnabled) {
      Alert.alert(
        "Disable Renewal Alerts",
        "Turn off 1-day renewal push notifications?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Turn Off",
            style: "destructive",
            onPress: async () => {
              await setAlertsEnabled(false);
            },
          },
        ]
      );
    } else {
      const granted = await requestNotificationPermissions();
      await setAlertsEnabled(true);
      setNotificationStatus(granted ? "Enabled" : "Denied");
      Alert.alert(
        "Renewal Alerts",
        granted
          ? "Renewal alerts enabled! You will receive reminders 1 day before subscriptions renew."
          : "Notification permissions were not granted in device settings."
      );
    }
  };

  const handleExportCsv = async () => {
    if (subscriptions.length === 0) {
      Alert.alert("Export CSV", "No subscriptions to export yet. Add subscriptions first!");
      return;
    }

    const success = await exportAndShareSubscriptionsCsv(subscriptions);
    if (!success) {
      Alert.alert("Export CSV", "Export canceled or unavailable on this device.");
    }
  };

  const handleItemPress = (itemId: string) => {
    if (itemId === "notifications") {
      handleToggleNotifications();
    } else if (itemId === "currency") {
      setIsCurrencyModalOpen(true);
    } else if (itemId === "export-data") {
      handleExportCsv();
    } else if (itemId === "privacy-policy") {
      Alert.alert(
        "Privacy Policy",
        "Chronicle encrypts all subscription metadata with Clerk. Your financial credentials are never accessed or stored."
      );
    }
  };

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out of your account?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut();
            router.replace("/(auth)/login");
          } catch (err: any) {
            Alert.alert("Sign Out Error", err?.message || "Failed to sign out.");
          }
        },
      },
    ]);
  };

  // Dynamic sections with live preference values
  const sections: SettingSection[] = useMemo(
    () => [
      {
        id: "account-preferences",
        title: "Account Preferences",
        items: [
          {
            id: "notifications",
            label: "Renewal Alerts",
            value: !alertsEnabled
              ? "Disabled"
              : notificationStatus === "Enabled"
              ? "Enabled"
              : "Tap to Allow",
            highlight: alertsEnabled && notificationStatus === "Enabled",
          },
          {
            id: "currency",
            label: "Default Currency",
            value: `${currency} (${currencySymbol.trim()})`,
            highlight: true,
          },
          {
            id: "dark-mode",
            label: "Appearance",
            value: "System",
          },
        ],
      },
      {
        id: "data-sync",
        title: "Data & Storage",
        items: [
          {
            id: "cloud-sync",
            label: "Cloud Backup",
            value: isSyncing ? "Syncing..." : `Synced (${subscriptions.length} items)`,
            highlight: true,
          },
          {
            id: "export-data",
            label: "Export CSV",
            value: `Export (${subscriptions.length})`,
          },
        ],
      },
      {
        id: "app-info",
        title: "Application",
        items: [
          {
            id: "app-version",
            label: "App Version",
            value: "1.0.0 (SDK 58)",
          },
          {
            id: "privacy-policy",
            label: "Privacy Policy",
            value: "View",
          },
        ],
      },
    ],
    [alertsEnabled, notificationStatus, currency, currencySymbol, isSyncing, subscriptions.length]
  );

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

        {/* Real User Profile Card */}
        <View
          style={{
            backgroundColor: Colors.surface,
            borderWidth: 1,
            borderColor: Colors.cardBorder,
            borderRadius: 18,
            padding: 16,
            marginBottom: 16,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={{ width: 48, height: 48, borderRadius: 24, marginRight: 14 }}
            />
          ) : (
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: Colors.pitchBlack,
                alignItems: "center",
                justifyContent: "center",
                marginRight: 14,
              }}
            >
              <Text style={{ color: "#FFFFFF", fontSize: 16, fontWeight: "700" }}>{initials}</Text>
            </View>
          )}

          <View style={{ flex: 1 }}>
            <Text numberOfLines={1} style={{ fontSize: 16, fontWeight: "700", color: Colors.pitchBlack }}>
              {displayName}
            </Text>
            <Text numberOfLines={1} style={{ fontSize: 12, color: Colors.graphite, marginTop: 2 }}>
              {email || "Clerk Authenticated User"}
            </Text>
          </View>
        </View>

        {/* Dynamic Settings Sections */}
        {sections.map((section) => (
          <SettingsSectionCard key={section.id} section={section} onItemPress={handleItemPress} />
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
            Sign out of your Chronicle subscription account.
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

      {/* Currency Selection Dialog Modal */}
      <Modal
        visible={isCurrencyModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsCurrencyModalOpen(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.45)",
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 20,
          }}
        >
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setIsCurrencyModalOpen(false)}
          />

          <View
            style={{
              width: "100%",
              maxWidth: 380,
              backgroundColor: Colors.cloud,
              borderRadius: Radius.card,
              borderWidth: 1,
              borderColor: Colors.fog,
              padding: 20,
              zIndex: 1,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: Colors.pitchBlack,
                marginBottom: 4,
              }}
            >
              Select Default Currency
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: Colors.graphite,
                marginBottom: 16,
              }}
            >
              Choose your preferred currency symbol for subscriptions and totals.
            </Text>

            {SUPPORTED_CURRENCIES.map((curr) => {
              const isSelected = currency === curr.code;
              return (
                <Pressable
                  key={curr.code}
                  onPress={async () => {
                    await setCurrency(curr.code);
                    setIsCurrencyModalOpen(false);
                  }}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingVertical: 12,
                    paddingHorizontal: 14,
                    borderRadius: Radius.tag,
                    backgroundColor: isSelected ? "#F3F4F6" : "transparent",
                    marginBottom: 6,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: isSelected ? "700" : "500",
                      color: Colors.pitchBlack,
                    }}
                  >
                    {curr.label}
                  </Text>
                  {isSelected && (
                    <Text style={{ fontSize: 14, fontWeight: "700", color: Colors.pitchBlack }}>
                      ✓
                    </Text>
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
