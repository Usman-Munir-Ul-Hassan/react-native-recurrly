import Constants from "expo-constants";
import * as Linking from "expo-linking";

/**
 * Resolves the appropriate OAuth redirect URL based on runtime environment.
 * In development / Expo Go, the custom native scheme is not registered in Android OS,
 * so it must use the exp:// scheme to be handled by the Expo Go client.
 */
export function getRedirectUrl(): string {
    if (__DEV__) {
        const hostUri =
            Constants.expoConfig?.hostUri ||
            Constants.expoGoConfig?.debuggerHost ||
            "192.168.212.10:8081";
        return `exp://${hostUri}/--/sso-callback`;
    }

    return Linking.createURL("sso-callback");
}
