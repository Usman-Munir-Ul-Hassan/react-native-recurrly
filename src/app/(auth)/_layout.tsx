import { Stack } from "expo-router";

export default function AuthLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen
                name="login"
                options={{ title: "Sign In", headerLeft: () => null }}
            />
            <Stack.Screen
                name="register"
                options={{ title: "Create Account" }}
            />
            <Stack.Screen
                name="forgot-password"
                options={{ title: "Reset Password" }}
            />
        </Stack>
    );
}
