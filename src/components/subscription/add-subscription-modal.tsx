import React, { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Colors, Radius } from "@/constants/theme";
import { Subscription } from "@/types/subscription";
import {
  buildNewSubscription,
  generateInitials,
  validateSubscriptionForm,
} from "@/utils/subscription-form-validator";
import { resolveBrandIconUrl } from "@/services/subscription/brand-icon-service";
import { ImageWithSkeleton } from "@/components/ui/image-with-skeleton";
import { usePreferences } from "@/context/preferences-context";

const CATEGORIES = [
  "Dev Tools",
  "AI & Inference",
  "Productivity",
  "Entertainment",
  "Design",
  "Cloud & Infra",
];

const PAYMENT_METHODS = [
  "Apple Pay",
  "Google Pay",
  "Visa •••• 4242",
  "Mastercard •••• 8821",
  "PayPal",
];

interface AddSubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (sub: Subscription) => void;
  userEmail?: string;
}

export function AddSubscriptionModal({
  visible,
  onClose,
  onAdd,
  userEmail,
}: AddSubscriptionModalProps) {
  const { currencySymbol } = usePreferences();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [cadence, setCadence] = useState<"Monthly" | "Yearly">("Monthly");
  const [category, setCategory] = useState("Dev Tools");
  const [paymentMethod, setPaymentMethod] = useState("Apple Pay");
  const [errors, setErrors] = useState<{ name?: string; price?: string }>({});

  const iconPreviewUrl = useMemo(() => resolveBrandIconUrl(name), [name]);
  const previewInitials = useMemo(() => generateInitials(name || "SB"), [name]);

  const handleClose = () => {
    setName("");
    setPrice("");
    setCadence("Monthly");
    setCategory("Dev Tools");
    setPaymentMethod("Apple Pay");
    setErrors({});
    onClose();
  };

  const handleSubmit = () => {
    const validation = validateSubscriptionForm(name, price);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    const realUserEmail = userEmail || "user@chronicle.app";
    const newSub = buildNewSubscription({
      name,
      price,
      category,
      billingCadence: cadence,
      currencySymbol,
      paymentMethod,
      invoiceEmail: realUserEmail,
      logoUrl: iconPreviewUrl,
    });

    onAdd(newSub);
    handleClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.45)",
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 20,
          paddingVertical: 30,
        }}
      >
        {/* Backdrop: tapping outside dismisses modal without blocking inner scroll */}
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={handleClose}
          accessibilityLabel="Close modal backdrop"
        />

        {/* Modal Card */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ width: "100%", maxWidth: 440 }}
        >
          <View
            style={{
              backgroundColor: Colors.cloud,
              borderRadius: Radius.card,
              borderWidth: 1,
              borderColor: Colors.fog,
              maxHeight: 560,
              overflow: "hidden",
            }}
          >
            {/* Pinned Header */}
            <View
              style={{
                paddingHorizontal: 20,
                paddingTop: 20,
                paddingBottom: 10,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "700",
                  color: Colors.pitchBlack,
                  letterSpacing: -0.3,
                  marginBottom: 2,
                }}
              >
                Add Subscription
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: Colors.graphite,
                }}
              >
                Track a recurring software service or commitment.
              </Text>
            </View>

            {/* Scrollable Form Body */}
            <ScrollView
              showsVerticalScrollIndicator={true}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{
                paddingHorizontal: 20,
                paddingBottom: 16,
              }}
            >
              {/* Name Input with Live Brand Icon Preview */}
              <View style={{ marginBottom: 14, marginTop: 6 }}>
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "600",
                    color: Colors.graphite,
                    letterSpacing: 0.5,
                    textTransform: "uppercase",
                    marginBottom: 6,
                  }}
                >
                  Service Name
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  {/* Live Icon Preview Badge */}
                  <View
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: Radius.tag,
                      backgroundColor: "#FAF9F6",
                      borderWidth: 1,
                      borderColor: Colors.fog,
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                    }}
                  >
                    <ImageWithSkeleton
                      uri={iconPreviewUrl}
                      fallbackText={previewInitials}
                      width={28}
                      height={28}
                      borderRadius={Radius.tag}
                      fallbackTextColor={Colors.pitchBlack}
                      fallbackTextSize={14}
                    />
                  </View>

                  <TextInput
                    value={name}
                    onChangeText={(val) => {
                      setName(val);
                      if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                    }}
                    placeholder="e.g. Spotify, ChatGPT, Netflix"
                    placeholderTextColor={Colors.ash}
                    style={{
                      flex: 1,
                      borderWidth: 1,
                      borderColor: errors.name ? "#dc2626" : Colors.fog,
                      borderRadius: Radius.input,
                      paddingVertical: 10,
                      paddingHorizontal: 12,
                      fontSize: 14,
                      color: Colors.pitchBlack,
                      backgroundColor: "#FAF9F6",
                    }}
                    testID="input-subscription-name"
                  />
                </View>
                {errors.name && (
                  <Text style={{ fontSize: 11, color: "#dc2626", marginTop: 4 }}>
                    {errors.name}
                  </Text>
                )}
              </View>

              {/* Billing Cadence Selector */}
              <View style={{ marginBottom: 14 }}>
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "600",
                    color: Colors.graphite,
                    letterSpacing: 0.5,
                    textTransform: "uppercase",
                    marginBottom: 6,
                  }}
                >
                  Billing Cycle
                </Text>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  {(["Monthly", "Yearly"] as const).map((cycle) => {
                    const isSelected = cadence === cycle;
                    return (
                      <Pressable
                        key={cycle}
                        onPress={() => setCadence(cycle)}
                        style={{
                          flex: 1,
                          paddingVertical: 9,
                          borderRadius: Radius.tag,
                          borderWidth: 1,
                          borderColor: isSelected ? Colors.pitchBlack : Colors.fog,
                          backgroundColor: isSelected ? Colors.pitchBlack : "#FAF9F6",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 13,
                            fontWeight: "600",
                            color: isSelected ? "#FFFFFF" : Colors.pitchBlack,
                          }}
                        >
                          {cycle} {cycle === "Yearly" ? "(1 Year)" : "(30 Days)"}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Price Input */}
              <View style={{ marginBottom: 14 }}>
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "600",
                    color: Colors.graphite,
                    letterSpacing: 0.5,
                    textTransform: "uppercase",
                    marginBottom: 6,
                  }}
                >
                  {cadence === "Yearly" ? "Yearly Price" : "Monthly Price"} ({currencySymbol})
                </Text>
                <TextInput
                  value={price}
                  onChangeText={(val) => {
                    setPrice(val);
                    if (errors.price) setErrors((prev) => ({ ...prev, price: undefined }));
                  }}
                  placeholder="e.g. 12.99"
                  placeholderTextColor={Colors.ash}
                  keyboardType="decimal-pad"
                  style={{
                    borderWidth: 1,
                    borderColor: errors.price ? "#dc2626" : Colors.fog,
                    borderRadius: Radius.input,
                    paddingVertical: 10,
                    paddingHorizontal: 12,
                    fontSize: 14,
                    color: Colors.pitchBlack,
                    backgroundColor: "#FAF9F6",
                  }}
                  testID="input-subscription-price"
                />
                {errors.price && (
                  <Text style={{ fontSize: 11, color: "#dc2626", marginTop: 4 }}>
                    {errors.price}
                  </Text>
                )}
              </View>

              {/* Category Selector Chips */}
              <View style={{ marginBottom: 16 }}>
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "600",
                    color: Colors.graphite,
                    letterSpacing: 0.5,
                    textTransform: "uppercase",
                    marginBottom: 8,
                  }}
                >
                  Category
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: 6,
                  }}
                >
                  {CATEGORIES.map((cat) => {
                    const isSelected = category === cat;
                    return (
                      <Pressable
                        key={cat}
                        onPress={() => setCategory(cat)}
                        style={{
                          paddingVertical: 6,
                          paddingHorizontal: 10,
                          borderRadius: Radius.tag,
                          borderWidth: 1,
                          borderColor: isSelected ? Colors.pitchBlack : Colors.fog,
                          backgroundColor: isSelected ? Colors.pitchBlack : "#FAF9F6",
                        }}
                        testID={`chip-category-${cat}`}
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
                </View>
              </View>

              {/* Payment Method Selector Chips */}
              <View style={{ marginBottom: 10 }}>
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "600",
                    color: Colors.graphite,
                    letterSpacing: 0.5,
                    textTransform: "uppercase",
                    marginBottom: 8,
                  }}
                >
                  Payment Method
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: 6,
                  }}
                >
                  {PAYMENT_METHODS.map((pm) => {
                    const isSelected = paymentMethod === pm;
                    return (
                      <Pressable
                        key={pm}
                        onPress={() => setPaymentMethod(pm)}
                        style={{
                          paddingVertical: 6,
                          paddingHorizontal: 10,
                          borderRadius: Radius.tag,
                          borderWidth: 1,
                          borderColor: isSelected ? Colors.pitchBlack : Colors.fog,
                          backgroundColor: isSelected ? Colors.pitchBlack : "#FAF9F6",
                        }}
                        testID={`chip-payment-${pm}`}
                      >
                        <Text
                          style={{
                            fontSize: 12,
                            fontWeight: isSelected ? "600" : "400",
                            color: isSelected ? Colors.cloud : Colors.charcoal,
                          }}
                        >
                          {pm}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </ScrollView>

            {/* Pinned Footer Action Buttons */}
            <View
              style={{
                flexDirection: "row",
                gap: 10,
                paddingHorizontal: 20,
                paddingVertical: 14,
                borderTopWidth: 1,
                borderTopColor: Colors.fog,
                backgroundColor: "#FAF9F6",
              }}
            >
              <Pressable
                onPress={handleClose}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: Radius.button,
                  borderWidth: 1,
                  borderColor: Colors.fog,
                  alignItems: "center",
                  backgroundColor: Colors.cloud,
                }}
                testID="btn-cancel"
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "500",
                    color: Colors.graphite,
                  }}
                >
                  Cancel
                </Text>
              </Pressable>

              <Pressable
                onPress={handleSubmit}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: Radius.button,
                  backgroundColor: Colors.action,
                  alignItems: "center",
                }}
                testID="btn-submit-subscription"
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: Colors.cloud,
                  }}
                >
                  Add
                </Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
