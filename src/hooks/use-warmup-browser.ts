import * as WebBrowser from "expo-web-browser";
import { useEffect } from "react";
import { Platform } from "react-native";

/**
 * Warms up the mobile browser instance on native platforms (iOS / Android)
 * to ensure smooth, non-blocking OAuth popup transitions.
 */
export function useWarmUpBrowser(): void {
    useEffect(() => {
        if (Platform.OS !== "web") {
            void WebBrowser.warmUpAsync();
            return () => {
                void WebBrowser.coolDownAsync();
            };
        }
    }, []);
}
