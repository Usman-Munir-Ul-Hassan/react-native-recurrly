import { renderHook, act } from "@testing-library/react-native";
import { Alert } from "react-native";
import { useSocialAuth, SOCIAL_STRATEGIES, getRedirectUrl } from "@/hooks/use-social-auth";

// Mock router
const mockReplace = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

// Mock Clerk useSSO
const mockStartSSOFlow = jest.fn();
jest.mock("@clerk/expo", () => ({
  useSSO: () => ({
    startSSOFlow: mockStartSSOFlow,
  }),
  isClerkAPIResponseError: (err: any) => Boolean(err?.clerkError || err?.errors),
}));

describe("useSocialAuth (Strategy Pattern)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, "alert").mockImplementation(() => {});
  });

  describe("Strategy Pattern Registry", () => {
    it("should have valid strategies configured for google and github", () => {
      expect(SOCIAL_STRATEGIES.google).toBeDefined();
      expect(SOCIAL_STRATEGIES.google.strategy).toBe("oauth_google");
      expect(SOCIAL_STRATEGIES.google.displayName).toBe("Google");

      expect(SOCIAL_STRATEGIES.github).toBeDefined();
      expect(SOCIAL_STRATEGIES.github.strategy).toBe("oauth_github");
      expect(SOCIAL_STRATEGIES.github.displayName).toBe("GitHub");
    });
  });

  describe("Redirect URL Resolution", () => {
    it("should return exp:// URL with host in development for Expo Go", () => {
      const url = getRedirectUrl();
      expect(url).toMatch(/^exp:\/\/.+\/--\/sso-callback$/);
    });
  });

  describe("Authentication Lifecycle", () => {
    it("should successfully authenticate with Google, activate session, and navigate to /(tabs)", async () => {
      const mockSetActive = jest.fn().mockResolvedValue(undefined);
      mockStartSSOFlow.mockResolvedValueOnce({
        createdSessionId: "session_google_123",
        setActive: mockSetActive,
      });

      const { result } = await renderHook(() => useSocialAuth());
      expect(result.current.loadingProvider).toBeNull();

      let success: boolean | undefined;
      await act(async () => {
        success = await result.current.authenticate("google");
      });

      expect(mockStartSSOFlow).toHaveBeenCalledWith(
        expect.objectContaining({
          strategy: "oauth_google",
        })
      );
      expect(success).toBe(true);
      expect(mockSetActive).toHaveBeenCalledWith({ session: "session_google_123" });
      expect(mockReplace).toHaveBeenCalledWith("/(tabs)");
      expect(result.current.loadingProvider).toBeNull();
    });

    it("should handle user cancellation gracefully without error alert", async () => {
      mockStartSSOFlow.mockResolvedValueOnce({
        createdSessionId: null,
      });

      const { result } = await renderHook(() => useSocialAuth());

      let success: boolean | undefined;
      await act(async () => {
        success = await result.current.authenticate("google");
      });

      expect(success).toBe(false);
      expect(Alert.alert).not.toHaveBeenCalled();
      expect(mockReplace).not.toHaveBeenCalled();
      expect(result.current.loadingProvider).toBeNull();
    });

    it("should alert error when SSO authentication fails with an exception", async () => {
      mockStartSSOFlow.mockRejectedValueOnce(new Error("Network error during OAuth"));

      const { result } = await renderHook(() => useSocialAuth());

      let success: boolean | undefined;
      await act(async () => {
        success = await result.current.authenticate("google");
      });

      expect(success).toBe(false);
      expect(Alert.alert).toHaveBeenCalledWith(
        "Google Sign-In Failed",
        "Network error during OAuth"
      );
      expect(mockReplace).not.toHaveBeenCalled();
      expect(result.current.loadingProvider).toBeNull();
    });

    it("should support adding GitHub via strategy pattern without changing authentication logic", async () => {
      const mockSetActive = jest.fn().mockResolvedValue(undefined);
      mockStartSSOFlow.mockResolvedValueOnce({
        createdSessionId: "session_github_456",
        setActive: mockSetActive,
      });

      const { result } = await renderHook(() => useSocialAuth());

      let success: boolean | undefined;
      await act(async () => {
        success = await result.current.authenticate("github");
      });

      expect(mockStartSSOFlow).toHaveBeenCalledWith(
        expect.objectContaining({
          strategy: "oauth_github",
        })
      );
      expect(success).toBe(true);
      expect(mockSetActive).toHaveBeenCalledWith({ session: "session_github_456" });
      expect(mockReplace).toHaveBeenCalledWith("/(tabs)");
    });

    it("should activate session when existing account session is returned via signIn.createdSessionId", async () => {
      const mockSetActive = jest.fn().mockResolvedValue(undefined);
      mockStartSSOFlow.mockResolvedValueOnce({
        createdSessionId: null,
        signIn: { createdSessionId: "existing_session_789", status: "complete" },
        setActive: mockSetActive,
      });

      const { result } = await renderHook(() => useSocialAuth());

      let success: boolean | undefined;
      await act(async () => {
        success = await result.current.authenticate("google");
      });

      expect(success).toBe(true);
      expect(mockSetActive).toHaveBeenCalledWith({ session: "existing_session_789" });
      expect(mockReplace).toHaveBeenCalledWith("/(tabs)");
    });

    it("should alert when account already exists and linking requires password login (form_identifier_exists)", async () => {
      const clerkError = {
        clerkError: true,
        errors: [
          {
            code: "form_identifier_exists",
            message: "That email address is already in use. Please sign in.",
          },
        ],
      };
      mockStartSSOFlow.mockRejectedValueOnce(clerkError);

      const { result } = await renderHook(() => useSocialAuth());

      let success: boolean | undefined;
      await act(async () => {
        success = await result.current.authenticate("google");
      });

      expect(success).toBe(false);
      expect(Alert.alert).toHaveBeenCalledWith(
        "Account Already Exists",
        "An account with this email address already exists. Please log in with your email and password to access your account."
      );
      expect(mockReplace).not.toHaveBeenCalled();
    });

    it("should alert when signIn requires account linking factor", async () => {
      mockStartSSOFlow.mockResolvedValueOnce({
        createdSessionId: null,
        signIn: { status: "needs_first_factor" },
      });

      const { result } = await renderHook(() => useSocialAuth());

      let success: boolean | undefined;
      await act(async () => {
        success = await result.current.authenticate("google");
      });

      expect(success).toBe(false);
      expect(Alert.alert).toHaveBeenCalledWith(
        "Account Linking Required",
        "An account with this email already exists. Please log in with your email and password first to link your account."
      );
      expect(mockReplace).not.toHaveBeenCalled();
    });
  });
});
