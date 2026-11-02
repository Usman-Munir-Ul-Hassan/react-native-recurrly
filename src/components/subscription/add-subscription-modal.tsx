import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Colors, Radius } from "@/constants/theme";
import { Subscription } from "@/types/subscription";
import {
  buildNewSubscription,
  validateSubscriptionForm,
} from "@/utils/subscription-form-validator";

const CATEGORIES = [
  "Dev Tools",
  "AI & Inference",
  "Productivity",
  "Entertainment",
  "Design",
  "Cloud & Infra",
];

interface AddSubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (sub: Subscription) => void;
}

export function AddSubscriptionModal({
  visible,
  onClose,
  onAdd,
}: AddSubscriptionModalProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Dev Tools");
  const [errors, setErrors] = useState<{ name?: string; price?: string }>({});

  const handleClose = () => {
    setName("");
    setPrice("");
    setCategory("Dev Tools");
    setErrors({});
    onClose();
  };

  const handleSubmit = () => {
    const validation = validateSubscriptionForm(name, price);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    const newSub = buildNewSubscription({
      name,
      price,
      category,
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
      <TouchableWithoutFeedback onPress={handleClose}>
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.45)",
            justifyContent: "center",
            paddingHorizontal: 20,
          }}
        >
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
              <View
                style={{
                  backgroundColor: Colors.cloud,
                  borderRadius: Radius.card,
                  padding: 24,
                  borderWidth: 1,
                  borderColor: Colors.fog,
                  maxHeight: 580,
                }}
              >
                <ScrollView showsVerticalScrollIndicator={false}>
                  {/* Title & Description */}
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "700",
                      color: Colors.pitchBlack,
                      letterSpacing: -0.3,
                      marginBottom: 4,
                    }}
                  >
                    Add Subscription
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      color: Colors.graphite,
                      marginBottom: 20,
                    }}
                  >
                    Track a recurring software service or commitment.
                  </Text>

                  {/* Name Input */}
                  <View style={{ marginBottom: 16 }}>
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
                    <TextInput
                      value={name}
                      onChangeText={(val) => {
                        setName(val);
                        if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                      }}
                      placeholder="e.g. Spotify, ChatGPT, Linear"
                      placeholderTextColor={Colors.ash}
                      style={{
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
                    {errors.name && (
                      <Text style={{ fontSize: 11, color: "#dc2626", marginTop: 4 }}>
                        {errors.name}
                      </Text>
                    )}
                  </View>

                  {/* Price Input */}
                  <View style={{ marginBottom: 16 }}>
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
                      Monthly Price ($)
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
                  <View style={{ marginBottom: 24 }}>
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

                  {/* Action Buttons */}
                  <View style={{ flexDirection: "row", gap: 10, marginTop: 4 }}>
                    <Pressable
                      onPress={handleClose}
                      style={{
                        flex: 1,
                        paddingVertical: 12,
                        borderRadius: Radius.button,
                        borderWidth: 1,
                        borderColor: Colors.fog,
                        alignItems: "center",
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
                </ScrollView>
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
