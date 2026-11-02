import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import LoginScreen from "../login";

// Mock router
const mockReplace = jest.fn();
const mockPush = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: mockPush,
  }),
}));

// Mock Clerk useSSO
const mockStartSSOFlow = jest.fn();
jest.mock("@clerk/expo", () => ({
  useSSO: () => ({
    startSSOFlow: mockStartSSOFlow,
  }),
  useSignIn: () => ({
    signIn: { password: jest.fn(), finalize: jest.fn() },
    fetchStatus: "idle",
  }),
  isClerkAPIResponseError: (err: any) => Boolean(err?.clerkError || err?.errors),
}));

describe("LoginScreen - Social Authentication Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should trigger Google SSO flow when Google button is clicked", async () => {
    const mockSetActive = jest.fn().mockResolvedValue(undefined);
    mockStartSSOFlow.mockResolvedValueOnce({
      createdSessionId: "session_google_integration_789",
      setActive: mockSetActive,
    });

    const { getByText } = await render(<LoginScreen />);

    // SocialButton renders "Continue with Google SSO"
    const googleButton = getByText(/Google/i);
    expect(googleButton).toBeTruthy();

    await act(async () => {
      fireEvent.press(googleButton);
    });

    await waitFor(() => {
      expect(mockStartSSOFlow).toHaveBeenCalledWith(
        expect.objectContaining({
          strategy: "oauth_google",
        })
      );
      expect(mockSetActive).toHaveBeenCalledWith({
        session: "session_google_integration_789",
      });
      expect(mockReplace).toHaveBeenCalledWith("/(tabs)");
    });
  });
});
