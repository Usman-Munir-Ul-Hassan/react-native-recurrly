import React, { useState } from "react";
import { Alert, Linking, Pressable, ScrollView, Share, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Radius } from "@/constants/theme";
import { getSubscriptionCurrency } from "@/types/subscription";
import { useSubscriptions } from "@/context/subscription-context";
import { useUserProfile } from "@/hooks/use-user-profile";
import { usePreferences } from "@/context/preferences-context";
import { AppButton } from "@/components/ui/app-button";
import { ImageWithSkeleton } from "@/components/ui/image-with-skeleton";
import { UserAvatar } from "@/components/ui/user-avatar";
import { AddSubscriptionModal } from "@/components/subscription/add-subscription-modal";
import { StatusPickerModal, SubscriptionStatus } from "@/components/subscription/status-picker-modal";

export default function SubscriptionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { imageUrl, initials: userInitials } = useUserProfile();
  const { formatPrice } = usePreferences();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const {
    subscriptions,
    getSubscription,
    cancelSubscription,
    pauseSubscription,
    resumeSubscription,
    deleteSubscription,
    updateSubscription,
  } = useSubscriptions();

  const subscription = getSubscription(id);

  if (!subscription) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center p-6">
        <Text style={{ fontSize: 16, color: Colors.pitchBlack, marginBottom: 16 }}>
          Subscription not found
        </Text>
        <AppButton title="Back to Subscriptions" showArrow={false} onPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  const isCancelled = subscription.status === "Cancelled";
  const isPaused = subscription.status === "Paused";

  const handleSelectStatus = (newStatus: SubscriptionStatus) => {
    if (newStatus === subscription.status) return;

    if (newStatus === "Active") {
      resumeSubscription(subscription.id);
      Alert.alert("Subscription Resumed", `${subscription.name} is now active.`);
    } else if (newStatus === "Paused") {
      pauseSubscription(subscription.id);
      Alert.alert("Subscription Paused", `${subscription.name} has been paused.`);
    } else if (newStatus === "Cancelled") {
      cancelSubscription(subscription.id);
      Alert.alert("Subscription Cancelled", `${subscription.name} has been cancelled.`);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Subscription",
      `Are you sure you want to permanently remove ${subscription.name} from your chronicle?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteSubscription(subscription.id);
            router.back();
          },
        },
      ]
    );
  };

  const handleManage = async () => {
    const serviceUrls: Record<string, string> = {
      chatgpt: "https://chatgpt.com",
      openai: "https://chatgpt.com",
      spotify: "https://www.spotify.com/account/overview",
      netflix: "https://www.netflix.com/youraccount",
      github: "https://github.com/settings/billing",
      claude: "https://claude.ai/settings/billing",
      figma: "https://www.figma.com/settings",
      dropbox: "https://www.dropbox.com/account/plan",
      notion: "https://www.notion.so/profile",
      linear: "https://linear.app/settings/billing",
    };

    const key = Object.keys(serviceUrls).find((k) =>
      subscription.name.toLowerCase().includes(k)
    );
    const targetUrl = key
      ? serviceUrls[key]
      : `https://www.google.com/search?q=${encodeURIComponent(subscription.name + " manage subscription")}`;

    const supported = await Linking.canOpenURL(targetUrl);
    if (supported) {
      await Linking.openURL(targetUrl);
    } else {
      Alert.alert("Manage Portal", `Opening ${subscription.name} portal: ${targetUrl}`);
    }
  };

  const subCurrency = subscription ? getSubscriptionCurrency(subscription) : undefined;
  const displayPrice = subscription
    ? formatPrice(subscription.amountNumeric, subscription.cadence, subCurrency)
    : "";

  const cleanRenewalDate = subscription?.renewalDateShort?.replace(/^Renews\s*/i, "") || "";
  const statusSubtitle = isCancelled
    ? "Discontinued"
    : isPaused
    ? "Subscription paused"
    : cleanRenewalDate
    ? `Renews ${cleanRenewalDate}`
    : "Active";

  const handleShareReceipt = async () => {
    if (!subscription) return;
    const receiptText = [
      `===============================`,
      `       CHRONICLE RECEIPT       `,
      `===============================`,
      `Service:        ${subscription.name}`,
      `Category:       ${subscription.category}`,
      `Status:         ${subscription.status}`,
      `Amount:         ${displayPrice}`,
      `Billing Cycle:  ${subscription.billingCycle}`,
      `Next Renewal:   ${subscription.nextRenewalFull}`,
      `Payment Method: ${subscription.paymentMethod}`,
      `Billed To:      ${subscription.invoiceEmail}`,
      `Receipt Ref:    ${subscription.id.toUpperCase()}`,
      `===============================`,
      `Generated by Chronicle App`,
    ].join("\n");

    try {
      await Share.share({
        title: `${subscription.name} - Receipt`,
        message: receiptText,
      });
    } catch {
      // Ignored if user dismissed
    }
  };

  const detailsRows = [
    { label: "Cycle started", value: subscription.startDate || "Active anchor" },
    { label: "Billing cycle", value: subscription.billingCycle },
    { label: "Next renewal", value: subscription.nextRenewalFull },
    { label: "Payment method", value: subscription.paymentMethod },
    { label: "Category", value: subscription.category },
    { label: "Invoice email", value: subscription.invoiceEmail },
  ];

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-white">
      {/* Top Header Bar */}
      <View className="flex-row items-center justify-between px-5 py-3 border-b border-[#E2E2E2]">
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          className="flex-row items-center py-1"
        >
          <Ionicons
            name="arrow-back"
            size={20}
            color={Colors.pitchBlack}
            style={{ marginRight: 6 }}
          />
          <Text style={{ fontSize: 13, fontWeight: "500", color: Colors.pitchBlack }}>
            Subscriptions
          </Text>
        </Pressable>

        <View className="flex-row items-center">
          <Pressable
            onPress={handleShareReceipt}
            hitSlop={10}
            style={{ padding: 6, marginRight: 8 }}
            accessibilityLabel="Share Receipt"
          >
            <Ionicons name="share-outline" size={20} color={Colors.pitchBlack} />
          </Pressable>
          {/* Real User Profile Avatar */}
          <UserAvatar imageUrl={imageUrl} initials={userInitials} size={30} />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 }}
      >
        {/* Brand Logo / Monogram Box & Titles */}
        <View className="flex-row items-center mb-6">
          <View
            className="items-center justify-center mr-4"
            style={{
              width: 52,
              height: 52,
              backgroundColor: Colors.limestone,
              borderRadius: Radius.tag,
              borderWidth: 1,
              borderColor: Colors.fog,
              overflow: "hidden",
            }}
          >
            <ImageWithSkeleton
              uri={subscription.logoUrl}
              fallbackText={subscription.initials}
              width={34}
              height={34}
              borderRadius={Radius.tag}
              fallbackTextColor={Colors.pitchBlack}
              fallbackTextSize={18}
            />
          </View>

          <View className="flex-1">
            <Text
              style={{
                fontSize: 20,
                fontWeight: "700",
                color: Colors.pitchBlack,
                letterSpacing: -0.5,
                marginBottom: 2,
              }}
            >
              {subscription.name}
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: Colors.graphite,
              }}
            >
              {displayPrice} • {subscription.cadence}
            </Text>
          </View>
        </View>

        {/* Interactive Status Selector Card */}
        <Pressable
          onPress={() => setIsStatusModalOpen(true)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "#F9FAFB",
            borderWidth: 1,
            borderColor: Colors.fog,
            borderRadius: 12,
            paddingHorizontal: 14,
            paddingVertical: 12,
            marginBottom: 20,
          }}
          accessibilityRole="button"
          accessibilityLabel={`Subscription status: ${subscription.status}. Tap to change status`}
          testID="btn-open-status-picker"
        >
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
            <View
              style={{
                backgroundColor: isCancelled
                  ? "#FEF2F2"
                  : isPaused
                  ? "#FFFBEB"
                  : "#ECFDF5",
                borderWidth: 1,
                borderColor: isCancelled
                  ? "#FECACA"
                  : isPaused
                  ? "#FDE68A"
                  : "#A7F3D0",
                borderRadius: Radius.tag,
                paddingHorizontal: 10,
                paddingVertical: 3,
                marginRight: 10,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  color: isCancelled
                    ? "#991B1B"
                    : isPaused
                    ? "#92400E"
                    : "#065F46",
                }}
              >
                {subscription.status}
              </Text>
            </View>

            <Text
              numberOfLines={1}
              style={{
                fontSize: 13,
                color: Colors.graphite,
                flex: 1,
              }}
            >
              {statusSubtitle}
            </Text>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={{ fontSize: 11, color: Colors.ash, marginRight: 4, fontWeight: "500" }}>
              Change
            </Text>
            <Ionicons name="chevron-down" size={15} color={Colors.graphite} />
          </View>
        </Pressable>

        {/* Subscription Details Table Card */}
        <View
          className="mb-8 overflow-hidden"
          style={{
            backgroundColor: Colors.cloud,
            borderWidth: 1,
            borderColor: Colors.fog,
            borderRadius: Radius.card,
          }}
        >
          <View className="p-4 bg-[#F8F8F8] border-b border-[#E2E2E2]">
            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: Colors.pitchBlack,
                textTransform: "uppercase",
                letterSpacing: 0.8,
              }}
            >
              Subscription details
            </Text>
          </View>

          {detailsRows.map((row, index) => (
            <View
              key={row.label}
              className="flex-row justify-between items-center p-4"
              style={{
                borderBottomWidth: index < detailsRows.length - 1 ? 1 : 0,
                borderBottomColor: Colors.fog,
              }}
            >
              <Text style={{ fontSize: 13, color: Colors.graphite, flex: 1 }}>
                {row.label}
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "500",
                  color: Colors.pitchBlack,
                  flex: 1.5,
                  textAlign: "right",
                }}
              >
                {row.value}
              </Text>
            </View>
          ))}
        </View>

        {/* Action Buttons */}
        <View className="gap-3">
          <AppButton
            title="Edit Subscription & Cycle"
            showArrow={false}
            onPress={() => setIsEditModalOpen(true)}
          />

          <Pressable
            onPress={handleManage}
            className="flex-row items-center justify-center py-3 px-4 border border-[#E2E2E2]"
            style={{
              backgroundColor: Colors.limestone,
              borderRadius: Radius.card,
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: Colors.pitchBlack,
                marginRight: 6,
              }}
            >
              Manage on {subscription.name} website
            </Text>
            <Ionicons name="open-outline" size={15} color={Colors.pitchBlack} />
          </Pressable>

          <Pressable
            onPress={handleDelete}
            className="items-center py-2 mt-1"
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: "500",
                color: Colors.ash,
              }}
            >
              Delete from Chronicle
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      <AddSubscriptionModal
        visible={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialSubscription={subscription}
        existingSubscriptions={subscriptions}
        onAdd={() => {}}
        onUpdate={(updated) => {
          updateSubscription(subscription.id, updated);
          Alert.alert("Subscription Updated", `${updated.name} has been updated.`);
        }}
      />

      <StatusPickerModal
        visible={isStatusModalOpen}
        currentStatus={subscription.status as SubscriptionStatus}
        subscriptionName={subscription.name}
        onSelectStatus={handleSelectStatus}
        onClose={() => setIsStatusModalOpen(false)}
      />
    </SafeAreaView>
  );
}
