import {
    loadSubscriptionsFromUser,
    saveSubscriptionsToUser,
} from "../clerk-subscription-storage";
import { MOCK_SUBSCRIPTIONS } from "@/data/subscriptions.data";
import { Subscription } from "@/types/subscription";

describe("clerkSubscriptionStorage", () => {
    describe("loadSubscriptionsFromUser", () => {
        it("should return MOCK_SUBSCRIPTIONS when user is null or undefined", () => {
            expect(loadSubscriptionsFromUser(null)).toEqual(MOCK_SUBSCRIPTIONS);
            expect(loadSubscriptionsFromUser(undefined)).toEqual(MOCK_SUBSCRIPTIONS);
        });

        it("should return MOCK_SUBSCRIPTIONS when unsafeMetadata has no subscriptions", () => {
            const mockUser = {
                unsafeMetadata: {},
            };
            expect(loadSubscriptionsFromUser(mockUser)).toEqual(MOCK_SUBSCRIPTIONS);
        });

        it("should return saved subscriptions when present in unsafeMetadata", () => {
            const customSubs: Subscription[] = [
                {
                    id: "custom-spotify",
                    name: "Spotify Premium",
                    initials: "SP",
                    status: "Active",
                    category: "Entertainment",
                    price: "$10.99/mo",
                    amountNumeric: 10.99,
                    cadence: "in 12 days",
                    daysRemaining: 12,
                    renewalDateShort: "Renews Nov 15",
                    nextRenewalFull: "November 15, 2026",
                    billingCycle: "Monthly",
                    paymentMethod: "Visa •••• 1234",
                    invoiceEmail: "user@example.com",
                },
            ];

            const mockUser = {
                unsafeMetadata: {
                    subscriptions: customSubs,
                },
            };

            expect(loadSubscriptionsFromUser(mockUser)).toEqual(customSubs);
        });
    });

    describe("saveSubscriptionsToUser", () => {
        it("should return false when user is null or update is not a function", async () => {
            const successNull = await saveSubscriptionsToUser(null, []);
            expect(successNull).toBe(false);

            const successNoUpdate = await saveSubscriptionsToUser({ unsafeMetadata: {} }, []);
            expect(successNoUpdate).toBe(false);
        });

        it("should call user.update with preserved metadata and return true", async () => {
            const mockUpdate = jest.fn().mockResolvedValue({});
            const mockUser = {
                unsafeMetadata: { theme: "dark" },
                update: mockUpdate,
            };

            const sampleSubs: Subscription[] = [
                {
                    id: "sub-1",
                    name: "Test Sub",
                    initials: "TS",
                    status: "Active",
                    category: "Dev",
                    price: "$5.00/mo",
                    amountNumeric: 5.0,
                    cadence: "in 1 day",
                    daysRemaining: 1,
                    renewalDateShort: "Renews Tomorrow",
                    nextRenewalFull: "Tomorrow",
                    billingCycle: "Monthly",
                    paymentMethod: "Card",
                    invoiceEmail: "test@example.com",
                },
            ];

            const success = await saveSubscriptionsToUser(mockUser, sampleSubs);

            expect(success).toBe(true);
            expect(mockUpdate).toHaveBeenCalledWith({
                unsafeMetadata: {
                    theme: "dark",
                    subscriptions: sampleSubs,
                },
            });
        });

        it("should catch errors and return false when user.update throws", async () => {
            const mockUpdate = jest.fn().mockRejectedValue(new Error("Network failed"));
            const mockUser = {
                unsafeMetadata: {},
                update: mockUpdate,
            };

            const success = await saveSubscriptionsToUser(mockUser, []);
            expect(success).toBe(false);
        });
    });
});
