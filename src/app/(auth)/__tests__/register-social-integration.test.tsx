import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import RegisterScreen from "../register";

// Mock router
const mockReplace = jest.fn();
const mockBack = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({
    replace: mockReplace,
    back: mockBack,
  }),
}));

// Mock Clerk useSSO & useSignUp
const mockStartSSOFlow = jest.fn();
jest.mock("@clerk/expo", () => ({
  useSSO: () => ({
    startSSOFlow: mockStartSSOFlow,
  }),
  useSignUp: () => ({
    signUp: {
      password: jest.fn(),
      verifications: { sendEmailCode: jest.fn(), verifyEmailCode: jest.fn() },
      finalize: jest.fn(),
    },
    fetchStatus: "idle",
  }),
  isClerkAPIResponseError: (err: any) => Boolean(err?.clerkError || err?.errors),
}));

describe("RegisterScreen - Social Authentication Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should trigger Google SSO flow when Google button is clicked on Register", async () => {
    const mockSetActive = jest.fn().mockResolvedValue(undefined);
    mockStartSSOFlow.mockResolvedValueOnce({
      createdSessionId: "session_google_register_123",
      setActive: mockSetActive,
    });

    const { getByText } = await render(<RegisterScreen />);

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
        session: "session_google_register_123",
      });
      expect(mockReplace).toHaveBeenCalledWith("/(tabs)");
    });
  });
});
