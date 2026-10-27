import React, { useState } from "react";
import { Alert, Image, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Colors, Radius } from "@/constants/theme";
import { useSubscriptions } from "@/context/subscription-context";
import { AppButton } from "@/components/ui/app-button";

export default function SubscriptionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getSubscription, cancelSubscription } = useSubscriptions();
  const [imageError, setImageError] = useState(false);

  const subscription = getSubscription(id);

  if (!subscription) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center p-6">
        <Text style={{ fontSize: 16, color: Colors.pitchBlack, marginBottom: 16 }}>
          Subscription not found
        </Text>
        <AppButton title="← Back to Subscriptions" onPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  const isCancelled = subscription.status === "Cancelled";

  const handleCancel = () => {
    Alert.alert(
      "Cancel Subscription",
      `Are you sure you want to cancel your ${subscription.name} subscription?`,
      [
        { text: "Keep Subscription", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: () => {
            cancelSubscription(subscription.id);
            Alert.alert("Subscription Cancelled", `${subscription.name} has been cancelled.`);
          },
        },
      ]
    );
  };

  const detailsRows = [
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
          <Text style={{ fontSize: 18, color: Colors.pitchBlack, marginRight: 6 }}>
            ←
          </Text>
          <Text style={{ fontSize: 13, fontWeight: "500", color: Colors.pitchBlack }}>
            Subscriptions
          </Text>
        </Pressable>

        {/* User Avatar */}
        <View
          className="items-center justify-center"
          style={{
            width: 30,
            height: 30,
            borderRadius: 15,
            backgroundColor: Colors.limestone,
            borderWidth: 1,
            borderColor: Colors.fog,
          }}
        >
          <Text style={{ fontSize: 11, fontWeight: "600", color: Colors.pitchBlack }}>
            JD
          </Text>
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
            {subscription.logoUrl && !imageError ? (
              <Image
                source={{ uri: subscription.logoUrl }}
                onError={() => setImageError(true)}
                style={{ width: 34, height: 34, resizeMode: "contain" }}
              />
            ) : (
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "700",
                  color: Colors.pitchBlack,
                  letterSpacing: 0.5,
                }}
              >
                {subscription.initials}
              </Text>
            )}
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
              {subscription.price} • {subscription.cadence}
            </Text>
          </View>
        </View>

        {/* Status & Billing Tag Row */}
        <View className="flex-row items-center mb-6">
          <View
            className="px-2.5 py-1 mr-3"
            style={{
              backgroundColor: isCancelled ? "#FEE2E2" : Colors.limestone,
              borderRadius: Radius.tag,
            }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: "600",
                color: isCancelled ? "#991B1B" : Colors.pitchBlack,
              }}
            >
              {subscription.status}
            </Text>
          </View>
          <Text style={{ fontSize: 13, color: Colors.graphite }}>
            {isCancelled ? "Subscription discontinued" : `Renews ${subscription.renewalDateShort}`}
          </Text>
        </View>

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
            title="Manage subscription →"
            onPress={() => Alert.alert("Manage", `Redirecting to ${subscription.name} portal...`)}
          />

          <AppButton
            title="Download invoice (PDF)"
            variant="secondary"
            onPress={() => Alert.alert("Invoice", "Downloading latest invoice...")}
          />

          {!isCancelled && (
            <Pressable
              onPress={handleCancel}
              className="items-center py-3 mt-1"
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "500",
                  color: "#DC2626",
                }}
              >
                Cancel subscription
              </Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
