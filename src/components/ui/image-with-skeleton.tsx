import React, { useState } from "react";
import {
  Image,
  ImageResizeMode,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { Skeleton } from "./skeleton";
import { Colors } from "@/constants/theme";

export interface ImageWithSkeletonProps {
  uri?: string | null;
  fallbackText?: string;
  width: number;
  height: number;
  borderRadius?: number;
  resizeMode?: ImageResizeMode;
  fallbackTextColor?: string;
  fallbackTextSize?: number;
  style?: StyleProp<ViewStyle>;
}

export function ImageWithSkeleton({
  uri,
  fallbackText,
  width,
  height,
  borderRadius = 8,
  resizeMode = "contain",
  fallbackTextColor = Colors.pitchBlack,
  fallbackTextSize = 14,
  style,
}: ImageWithSkeletonProps) {
  const [isLoading, setIsLoading] = useState(Boolean(uri));
  const [hasError, setHasError] = useState(false);

  // If no URI or image failed to load, display fallback text/initials
  if (!uri || hasError) {
    return (
      <View
        style={[
          {
            width,
            height,
            alignItems: "center",
            justifyContent: "center",
          },
          style,
        ]}
      >
        {fallbackText ? (
          <Text
            style={{
              fontSize: fallbackTextSize,
              fontWeight: "700",
              color: fallbackTextColor,
            }}
          >
            {fallbackText}
          </Text>
        ) : null}
      </View>
    );
  }

  return (
    <View
      style={[
        {
          width,
          height,
          position: "relative",
          alignItems: "center",
          justifyContent: "center",
        },
        style,
      ]}
    >
      {/* Actual Network Image */}
      <Image
        source={{ uri }}
        resizeMode={resizeMode}
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
        style={{
          width,
          height,
          borderRadius,
        }}
      />

      {/* Pulsing Skeleton Placeholder while loading */}
      {isLoading && (
        <View style={StyleSheet.absoluteFill}>
          <Skeleton
            width={width}
            height={height}
            borderRadius={borderRadius}
          />
        </View>
      )}
    </View>
  );
}
