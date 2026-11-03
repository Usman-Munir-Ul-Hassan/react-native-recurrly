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
import { getSubscriptionCurrency, Subscription } from "@/types/subscription";
import { getCurrencySymbol } from "@/utils/currency-formatter";
import {
  PAYMENT_METHODS,
  SUBSCRIPTION_CATEGORIES,
} from "@/constants/subscriptions";
import {
  buildNewSubscription,
  buildUpdatedSubscription,
  generateInitials,
  validateSubscriptionForm,
} from "@/utils/subscription-form-validator";
import { resolveBrandIconUrl } from "@/services/subscription/brand-icon-service";
import { ImageWithSkeleton } from "@/components/ui/image-with-skeleton";
import { usePreferences } from "@/context/preferences-context";
import {
  calculateSubscriptionCycle,
  toIsoDateString,
} from "@/utils/subscription-cycle-calculator";
import { formatRecurrenceNote } from "@/utils/recurrence-formatter";
import { CalendarPickerModal } from "@/components/ui/calendar-picker-modal";

interface AddSubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (sub: Subscription) => void;
  onUpdate?: (updated: Subscription) => void;
  initialSubscription?: Subscription | null;
  userEmail?: string;
}

export function AddSubscriptionModal({
  visible,
  onClose,
  onAdd,
  onUpdate,
  initialSubscription,
  userEmail,
}: AddSubscriptionModalProps) {
  const { currency: prefCurrency, currencySymbol: prefCurrencySymbol } = usePreferences();
  const isEditMode = Boolean(initialSubscription);
  const activeCurrency =
    isEditMode && initialSubscription ? getSubscriptionCurrency(initialSubscription) : prefCurrency;
  const activeCurrencySymbol =
    isEditMode && initialSubscription ? getCurrencySymbol(activeCurrency) : prefCurrencySymbol;
  const defaultToday = useMemo(() => toIsoDateString(new Date()), []);

  const [name, setName] = useState(initialSubscription?.name ?? "");
  const [price, setPrice] = useState(
    initialSubscription?.amountNumeric ? String(initialSubscription.amountNumeric) : ""
  );
  const [cadence, setCadence] = useState<"Monthly" | "Yearly">(
    initialSubscription?.billingCycle?.toLowerCase().includes("yearly") ? "Yearly" : "Monthly"
  );
  const [category, setCategory] = useState(initialSubscription?.category ?? "General");
  const [paymentMethod, setPaymentMethod] = useState(
    initialSubscription?.paymentMethod ?? "Card"
  );
  const [startDate, setStartDate] = useState(initialSubscription?.startDate ?? defaultToday);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; price?: string }>({});

  // Sync state whenever modal becomes visible or initialSubscription changes
  const [prevVisible, setPrevVisible] = useState(false);
  const [prevSubId, setPrevSubId] = useState(initialSubscription?.id);
  if ((visible && !prevVisible) || initialSubscription?.id !== prevSubId) {
    setPrevVisible(visible);
    setPrevSubId(initialSubscription?.id);
    setName(initialSubscription?.name ?? "");
    setPrice(
      initialSubscription?.amountNumeric ? String(initialSubscription.amountNumeric) : ""
    );
    setCadence(
      initialSubscription?.billingCycle?.toLowerCase().includes("yearly") ? "Yearly" : "Monthly"
    );
    setCategory(initialSubscription?.category ?? "General");
    setPaymentMethod(initialSubscription?.paymentMethod ?? "Card");
    setStartDate(initialSubscription?.startDate ?? defaultToday);
    setErrors({});
  } else if (!visible && prevVisible) {
    setPrevVisible(false);
  }

  const iconPreviewUrl = useMemo(() => resolveBrandIconUrl(name), [name]);
  const previewInitials = useMemo(() => generateInitials(name || "SB"), [name]);

  // Live cycle calculation & natural language recurrence explanation
  const cycle = useMemo(() => {
    return calculateSubscriptionCycle({
      startDateInput: startDate,
      cadence,
    });
  }, [startDate, cadence]);

  const recurrenceNote = useMemo(() => {
    return formatRecurrenceNote({
      startDate,
      cadence,
      daysRemaining: cycle.daysRemaining,
      renewalDateShort: cycle.renewalDateShort,
    });
  }, [startDate, cadence, cycle.daysRemaining, cycle.renewalDateShort]);

  const handleClose = () => {
    setName("");
    setPrice("");
    setCadence("Monthly");
    setCategory("General");
    setPaymentMethod("Card");
    setStartDate(defaultToday);
    setErrors({});
    setIsCalendarOpen(false);
    onClose();
  };

  const handleSelectStartDate = (selectedStr: string) => {
    setStartDate(selectedStr);
    setIsCalendarOpen(false);
  };

  const handleSubmit = () => {
    const validation = validateSubscriptionForm(name, price);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    const realUserEmail = userEmail || initialSubscription?.invoiceEmail || "user@chronicle.app";

    if (isEditMode && initialSubscription && onUpdate) {
      const updatedSub = buildUpdatedSubscription({
        existing: initialSubscription,
        name,
        price,
        category,
        cadence,
        paymentMethod,
        startDate: cycle.startDate,
        renewalDate: cycle.renewalDate,
        currency: activeCurrency,
        currencySymbol: activeCurrencySymbol,
        logoUrl: iconPreviewUrl,
      });
      onUpdate(updatedSub);
    } else {
      const newSub = buildNewSubscription({
        name,
        price,
        category,
        billingCadence: cadence,
        currency: activeCurrency,
        currencySymbol: activeCurrencySymbol,
        paymentMethod,
        invoiceEmail: realUserEmail,
        logoUrl: iconPreviewUrl,
        startDate: cycle.startDate,
        renewalDate: cycle.renewalDate,
      });
      onAdd(newSub);
    }

    handleClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.4)",
          justifyContent: "flex-end",
        }}
      >
        {/* Backdrop Dismiss */}
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={handleClose}
          accessibilityLabel="Close bottom sheet backdrop"
        />

        {/* Native Bottom Sheet Container */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ width: "100%" }}
        >
          <View
            style={{
              backgroundColor: Colors.cloud,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              maxHeight: "88%",
              paddingBottom: Platform.OS === "ios" ? 34 : 20,
              shadowColor: "#000000",
              shadowOffset: { width: 0, height: -3 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 10,
            }}
          >
            {/* Native Pull Pill Handle */}
            <View
              style={{
                width: 36,
                height: 4,
                backgroundColor: "#D1D5DB",
                borderRadius: 2,
                alignSelf: "center",
                marginTop: 10,
                marginBottom: 8,
              }}
            />

            {/* Top Navigation Bar */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderBottomWidth: 1,
                borderBottomColor: Colors.fog,
              }}
            >
              <Pressable onPress={handleClose} hitSlop={12} testID="btn-cancel">
                <Text style={{ fontSize: 15, color: Colors.graphite, fontWeight: "500" }}>
                  Cancel
                </Text>
              </Pressable>

              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: Colors.pitchBlack,
                  letterSpacing: -0.3,
                }}
              >
                {isEditMode ? "Edit Subscription" : "Add Subscription"}
              </Text>

              {/* Balance Spacer for true title centering */}
              <View style={{ width: 48 }} />
            </View>

            {/* Sheet Scroll Body */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 }}
            >
              {/* Hero Price & Cadence Section */}
              <View
                style={{
                  alignItems: "center",
                  paddingVertical: 12,
                  marginBottom: 16,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
                  <Text
                    style={{
                      fontSize: 32,
                      fontWeight: "700",
                      color: Colors.pitchBlack,
                      marginRight: 4,
                    }}
                  >
                    {activeCurrencySymbol}
                  </Text>
                  <TextInput
                    value={price}
                    onChangeText={(val) => {
                      setPrice(val);
                      if (errors.price) setErrors((prev) => ({ ...prev, price: undefined }));
                    }}
                    placeholder="0.00"
                    placeholderTextColor={Colors.ash}
                    keyboardType="decimal-pad"
                    style={{
                      fontSize: 40,
                      fontWeight: "700",
                      color: Colors.pitchBlack,
                      fontVariant: ["tabular-nums"],
                      minWidth: 100,
                      textAlign: "left",
                    }}
                    testID="input-subscription-price"
                  />
                </View>
                {errors.price && (
                  <Text style={{ fontSize: 12, color: "#DC2626", marginTop: 4 }}>
                    {errors.price}
                  </Text>
                )}

                {/* Cadence Segmented Pill */}
                <View
                  style={{
                    flexDirection: "row",
                    backgroundColor: Colors.limestone,
                    borderRadius: Radius.tag,
                    padding: 3,
                    borderWidth: 1,
                    borderColor: Colors.fog,
                    marginTop: 10,
                  }}
                >
                  {(["Monthly", "Yearly"] as const).map((c) => {
                    const isSelected = cadence === c;
                    return (
                      <Pressable
                        key={c}
                        onPress={() => setCadence(c)}
                        style={{
                          paddingVertical: 5,
                          paddingHorizontal: 16,
                          borderRadius: Radius.tag,
                          backgroundColor: isSelected ? Colors.pitchBlack : "transparent",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 12,
                            fontWeight: "600",
                            color: isSelected ? Colors.cloud : Colors.pitchBlack,
                          }}
                        >
                          {c}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Unified Inset Group Table */}
              <View
                style={{
                  backgroundColor: "#F9FAFB",
                  borderWidth: 1,
                  borderColor: Colors.fog,
                  borderRadius: 16,
                  overflow: "hidden",
                  marginBottom: 12,
                }}
              >
                {/* Row 1: Service Name */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: 12,
                    paddingHorizontal: 14,
                  }}
                >
                  <View
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 8,
                      backgroundColor: Colors.cloud,
                      borderWidth: 1,
                      borderColor: Colors.fog,
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 12,
                      overflow: "hidden",
                    }}
                  >
                    <ImageWithSkeleton
                      uri={iconPreviewUrl}
                      fallbackText={previewInitials}
                      width={22}
                      height={22}
                      borderRadius={6}
                      fallbackTextColor={Colors.pitchBlack}
                      fallbackTextSize={12}
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <TextInput
                      value={name}
                      onChangeText={(val) => {
                        setName(val);
                        if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                      }}
                      placeholder="Service name (e.g. Netflix, Spotify)"
                      placeholderTextColor={Colors.ash}
                      style={{
                        fontSize: 15,
                        fontWeight: "500",
                        color: Colors.pitchBlack,
                        paddingVertical: 0,
                      }}
                      testID="input-subscription-name"
                    />
                  </View>
                </View>
                {errors.name && (
                  <Text style={{ fontSize: 11, color: "#DC2626", marginHorizontal: 14, marginBottom: 8 }}>
                    {errors.name}
                  </Text>
                )}

                {/* Divider */}
                <View style={{ height: 1, backgroundColor: Colors.fog, marginLeft: 60 }} />

                {/* Row 2: First Bill Date Trigger */}
                <Pressable
                  onPress={() => setIsCalendarOpen(true)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingVertical: 13,
                    paddingHorizontal: 14,
                  }}
                  testID="btn-open-cycle-calendar"
                >
                  <Text style={{ fontSize: 14, fontWeight: "500", color: Colors.pitchBlack }}>
                    Billing Date
                  </Text>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text style={{ fontSize: 14, fontWeight: "600", color: Colors.pitchBlack, marginRight: 6 }}>
                      {cycle.startDateFormatted}
                    </Text>
                    <Text style={{ fontSize: 14, color: Colors.ash }}>›</Text>
                  </View>
                </Pressable>

                {/* Hidden input for test compatibility */}
                <TextInput
                  value={startDate}
                  onChangeText={setStartDate}
                  style={{ height: 0, width: 0, opacity: 0, position: "absolute" }}
                  testID="input-cycle-start-date"
                />

                {/* Divider */}
                <View style={{ height: 1, backgroundColor: Colors.fog, marginLeft: 14 }} />

                {/* Row 3: Category Selector */}
                <View style={{ paddingVertical: 11, paddingHorizontal: 14 }}>
                  <Text style={{ fontSize: 11, fontWeight: "600", color: Colors.graphite, textTransform: "uppercase", marginBottom: 7 }}>
                    Category <Text style={{ fontSize: 10, fontWeight: "400", textTransform: "none", color: Colors.ash }}>(Optional)</Text>
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                    {SUBSCRIPTION_CATEGORIES.map((cat) => {
                      const isSelected = category === cat;
                      return (
                        <Pressable
                          key={cat}
                          onPress={() => setCategory(cat)}
                          style={{
                            paddingVertical: 6,
                            paddingHorizontal: 11,
                            borderRadius: Radius.tag,
                            backgroundColor: isSelected ? Colors.pitchBlack : Colors.cloud,
                            borderWidth: 1,
                            borderColor: isSelected ? Colors.pitchBlack : Colors.fog,
                          }}
                          testID={`chip-category-${cat}`}
                        >
                          <Text
                            style={{
                              fontSize: 12,
                              fontWeight: isSelected ? "600" : "500",
                              color: isSelected ? Colors.cloud : Colors.pitchBlack,
                            }}
                          >
                            {cat}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                </View>

                {/* Divider */}
                <View style={{ height: 1, backgroundColor: Colors.fog, marginLeft: 14 }} />

                {/* Row 4: Payment Method Selector */}
                <View style={{ paddingVertical: 11, paddingHorizontal: 14 }}>
                  <Text style={{ fontSize: 11, fontWeight: "600", color: Colors.graphite, textTransform: "uppercase", marginBottom: 7 }}>
                    Payment Method <Text style={{ fontSize: 10, fontWeight: "400", textTransform: "none", color: Colors.ash }}>(Optional)</Text>
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                    {PAYMENT_METHODS.map((pm) => {
                      const isSelected = paymentMethod === pm;
                      return (
                        <Pressable
                          key={pm}
                          onPress={() => setPaymentMethod(pm)}
                          style={{
                            paddingVertical: 6,
                            paddingHorizontal: 11,
                            borderRadius: Radius.tag,
                            backgroundColor: isSelected ? Colors.pitchBlack : Colors.cloud,
                            borderWidth: 1,
                            borderColor: isSelected ? Colors.pitchBlack : Colors.fog,
                          }}
                          testID={`chip-payment-${pm}`}
                        >
                          <Text
                            style={{
                              fontSize: 12,
                              fontWeight: isSelected ? "600" : "500",
                              color: isSelected ? Colors.cloud : Colors.pitchBlack,
                            }}
                          >
                            {pm}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                </View>
              </View>

              {/* Human Recurrence Caption */}
              <Text
                style={{
                  fontSize: 12,
                  color: Colors.graphite,
                  textAlign: "center",
                  marginTop: 2,
                  marginBottom: 16,
                }}
              >
                {recurrenceNote}
              </Text>

              {/* Primary Pinned Action Button */}
              <Pressable
                onPress={handleSubmit}
                style={{
                  backgroundColor: Colors.pitchBlack,
                  borderRadius: Radius.button,
                  paddingVertical: 14,
                  alignItems: "center",
                  justifyContent: "center",
                }}
                testID="btn-submit-subscription"
              >
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "600",
                    color: Colors.cloud,
                    letterSpacing: -0.2,
                  }}
                >
                  {isEditMode ? "Save Changes" : "Add to Chronicle"}
                </Text>
              </Pressable>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>

      {/* Interactive Clean Calendar Modal */}
      <CalendarPickerModal
        visible={isCalendarOpen}
        selectedDate={startDate}
        onSelectDate={handleSelectStartDate}
        onClose={() => setIsCalendarOpen(false)}
        title="Select Billing Date"
      />
    </Modal>
  );
}
