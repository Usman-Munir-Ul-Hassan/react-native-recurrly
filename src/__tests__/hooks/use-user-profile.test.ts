import { renderHook } from "@testing-library/react-native";
import { useUser } from "@clerk/expo";
import { useUserProfile } from "@/hooks/use-user-profile";

jest.mock("@clerk/expo", () => ({
    useUser: jest.fn(),
}));

describe("useUserProfile", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return fallback data when user is not loaded or null", async () => {
        (useUser as jest.Mock).mockReturnValue({
            isLoaded: false,
            user: null,
        });

        const { result } = await renderHook(() => useUserProfile());

        expect(result.current.displayName).toBe("...");
        expect(result.current.initials).toBe("—");
        expect(result.current.imageUrl).toBeNull();
        expect(result.current.email).toBeNull();
        expect(result.current.isLoaded).toBe(false);
    });

    it("should format display name and initials from fullName and image from SSO session", async () => {
        (useUser as jest.Mock).mockReturnValue({
            isLoaded: true,
            user: {
                fullName: "Usman Munir",
                firstName: "Usman",
                lastName: "Munir",
                hasImage: true,
                imageUrl: "https://lh3.googleusercontent.com/avatar123",
                primaryEmailAddress: { emailAddress: "contact.usman.munir@gmail.com" },
            },
        });

        const { result } = await renderHook(() => useUserProfile());

        expect(result.current.displayName).toBe("Usman Munir");
        expect(result.current.initials).toBe("UM");
        expect(result.current.imageUrl).toBe("https://lh3.googleusercontent.com/avatar123");
        expect(result.current.email).toBe("contact.usman.munir@gmail.com");
        expect(result.current.isLoaded).toBe(true);
    });

    it("should fallback to email prefix when only email is provided", async () => {
        (useUser as jest.Mock).mockReturnValue({
            isLoaded: true,
            user: {
                fullName: null,
                firstName: null,
                lastName: null,
                username: null,
                hasImage: false,
                imageUrl: null,
                primaryEmailAddress: { emailAddress: "developer@example.com" },
            },
        });

        const { result } = await renderHook(() => useUserProfile());

        expect(result.current.displayName).toBe("developer");
        expect(result.current.initials).toBe("DE");
        expect(result.current.imageUrl).toBeNull();
        expect(result.current.email).toBe("developer@example.com");
    });
});
