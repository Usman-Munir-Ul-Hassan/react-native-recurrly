import { Share } from "react-native";
import {
  generateSubscriptionCsv,
  exportAndShareSubscriptionsCsv,
} from "../csv-export-service";
import { Subscription } from "@/types/subscription";

jest.mock("react-native", () => ({
  Share: {
    share: jest.fn(),
    dismissedAction: "dismissedAction",
    sharedAction: "sharedAction",
  },
}));

const mockSub: Subscription = {
  id: "sub-1",
  name: "Netflix, Inc.",
  initials: "NF",
  status: "Active",
  category: "Entertainment",
  price: "$15.00/mo",
  amountNumeric: 15.0,
  cadence: "in 5 days",
  daysRemaining: 5,
  renewalDateShort: "Nov 5",
  nextRenewalFull: "November 5, 2026",
  billingCycle: "Monthly",
  paymentMethod: "Apple Pay",
  invoiceEmail: "user@example.com",
};

describe("csv-export-service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("generateSubscriptionCsv", () => {
    it("generates CSV header and properly escaped row data", () => {
      const csv = generateSubscriptionCsv([mockSub]);
      const lines = csv.split("\n");

      expect(lines[0]).toBe(
        "Name,Status,Category,Price,AmountNumeric,Cadence,DaysRemaining,NextRenewal,BillingCycle,PaymentMethod,InvoiceEmail"
      );
      // "Netflix, Inc." contains comma, so it must be enclosed in quotes
      expect(lines[1]).toContain('"Netflix, Inc."');
      expect(lines[1]).toContain("Active");
      expect(lines[1]).toContain("user@example.com");
    });

    it("neutralizes potential CSV formula injection characters (CWE-1236)", () => {
      const maliciousSub: Subscription = {
        ...mockSub,
        name: "=cmd|' /C calc'!A0",
        category: "+SUM(1,2)",
        paymentMethod: "@admin",
      };
      const csv = generateSubscriptionCsv([maliciousSub]);
      expect(csv).toContain("'=cmd|' /C calc'!A0");
      expect(csv).toContain("'+SUM(1,2)");
      expect(csv).toContain("'@admin");
    });
  });

  describe("exportAndShareSubscriptionsCsv", () => {
    it("returns false without sharing if subscription list is empty", async () => {
      const result = await exportAndShareSubscriptionsCsv([]);
      expect(result).toBe(false);
      expect(Share.share).not.toHaveBeenCalled();
    });

    it("triggers Share.share with generated CSV content", async () => {
      (Share.share as jest.Mock).mockResolvedValueOnce({
        action: "sharedAction",
      });

      const result = await exportAndShareSubscriptionsCsv([mockSub]);

      expect(result).toBe(true);
      expect(Share.share).toHaveBeenCalledWith({
        title: "Chronicle_Subscriptions.csv",
        message: expect.stringContaining('"Netflix, Inc."'),
      });
    });

    it("handles sharing errors gracefully and returns false", async () => {
      (Share.share as jest.Mock).mockRejectedValueOnce(new Error("User cancelled"));

      const result = await exportAndShareSubscriptionsCsv([mockSub]);
      expect(result).toBe(false);
    });
  });
});
