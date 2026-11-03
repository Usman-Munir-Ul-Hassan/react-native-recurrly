import {
  detectDuplicateSubscription,
  normalizeEmail,
} from "@/services/subscription/duplicate-detection-orchestrator";
import { Subscription } from "@/types/subscription";

const mockSubscriptions: Subscription[] = [
  {
    id: "sub-1",
    name: "Google Cloud",
    initials: "GC",
    status: "Active",
    category: "Dev Tools",
    price: "$20.00/mo",
    amountNumeric: 20,
    cadence: "Monthly",
    daysRemaining: 15,
    renewalDateShort: "Nov 18",
    nextRenewalFull: "November 18, 2026",
    billingCycle: "Monthly",
    paymentMethod: "Card",
    invoiceEmail: "work@company.com",
  },
  {
    id: "sub-2",
    name: "Netflix",
    initials: "NF",
    status: "Active",
    category: "Entertainment",
    price: "$15.00/mo",
    amountNumeric: 15,
    cadence: "Monthly",
    daysRemaining: 10,
    renewalDateShort: "Nov 13",
    nextRenewalFull: "November 13, 2026",
    billingCycle: "Monthly",
    paymentMethod: "Card",
    invoiceEmail: "personal@gmail.com",
  },
  {
    id: "sub-3",
    name: "Amazon Web Services",
    initials: "AW",
    status: "Active",
    category: "Dev Tools",
    price: "$50.00/mo",
    amountNumeric: 50,
    cadence: "Monthly",
    daysRemaining: 20,
    renewalDateShort: "Nov 23",
    nextRenewalFull: "November 23, 2026",
    billingCycle: "Monthly",
    paymentMethod: "Card",
    invoiceEmail: "dev@startup.io",
  },
];

describe("duplicate-detection-orchestrator", () => {
  describe("normalizeEmail", () => {
    it("lowercases and trims whitespace", () => {
      expect(normalizeEmail("  User@Example.Com  ")).toBe("user@example.com");
      expect(normalizeEmail(undefined)).toBe("");
    });
  });

  describe("detectDuplicateSubscription (Local Fast-Path)", () => {
    it("flags exact match under the same account email", async () => {
      const result = await detectDuplicateSubscription({
        candidateName: "Netflix",
        candidateEmail: "personal@gmail.com",
        existingSubscriptions: mockSubscriptions,
        enableAiCheck: false,
      });

      expect(result.isDuplicate).toBe(true);
      expect(result.detectedBy).toBe("local");
      expect(result.matchedSubscription?.id).toBe("sub-2");
    });

    it("flags typo 'Google Cload' under the same account email (92% similarity)", async () => {
      const result = await detectDuplicateSubscription({
        candidateName: "Google Cload",
        candidateEmail: "work@company.com",
        existingSubscriptions: mockSubscriptions,
        enableAiCheck: false,
      });

      expect(result.isDuplicate).toBe(true);
      expect(result.detectedBy).toBe("local");
      expect(result.matchedSubscription?.name).toBe("Google Cloud");
    });

    it("flags multi-word typo 'amzaan web servoces' against 'amazon web service' locally (73.7% similarity)", async () => {
      const customSubs = [
        {
          ...mockSubscriptions[0],
          name: "amzaan web servoces",
          invoiceEmail: "dev@startup.io",
        },
      ];

      const result = await detectDuplicateSubscription({
        candidateName: "amazon web service",
        candidateEmail: "dev@startup.io",
        existingSubscriptions: customSubs,
        enableAiCheck: false,
      });

      expect(result.isDuplicate).toBe(true);
      expect(result.detectedBy).toBe("local");
      expect(result.matchedSubscription?.name).toBe("amzaan web servoces");
    });

    it("does not flag genuinely distinct services like GitHub vs GitLab", async () => {
      const gitSubs = [
        {
          ...mockSubscriptions[0],
          name: "GitHub",
          invoiceEmail: "dev@startup.io",
        },
      ];

      const result = await detectDuplicateSubscription({
        candidateName: "GitLab",
        candidateEmail: "dev@startup.io",
        existingSubscriptions: gitSubs,
        enableAiCheck: false,
      });

      expect(result.isDuplicate).toBe(false);
      expect(result.detectedBy).toBe("none");
    });

    it("ALLOWS duplicate name if the account email is different (Multi-Account Support)", async () => {
      // User already has Google Cloud under work@company.com, now adding for personal@gmail.com
      const result = await detectDuplicateSubscription({
        candidateName: "Google Cloud",
        candidateEmail: "personal@gmail.com",
        existingSubscriptions: mockSubscriptions,
        enableAiCheck: false,
      });

      // Permitted! User has 2 separate accounts with different emails
      expect(result.isDuplicate).toBe(false);
      expect(result.detectedBy).toBe("none");
    });

    it("allows completely different new service under the same email", async () => {
      const result = await detectDuplicateSubscription({
        candidateName: "Spotify",
        candidateEmail: "personal@gmail.com",
        existingSubscriptions: mockSubscriptions,
        enableAiCheck: false,
      });

      expect(result.isDuplicate).toBe(false);
      expect(result.detectedBy).toBe("none");
    });
  });

  describe("detectDuplicateSubscription (AI Semantic Fallback)", () => {
    it("detects semantic acronym duplicate ('AWS' vs 'Amazon Web Services') via AI service", async () => {
      const mockAiFn = jest.fn().mockResolvedValue({
        isDuplicate: true,
        matchedName: "Amazon Web Services",
        confidence: 0.95,
        reason: "AWS is the commonly used acronym for Amazon Web Services",
        isAvailable: true,
      });

      const result = await detectDuplicateSubscription({
        candidateName: "AWS",
        candidateEmail: "dev@startup.io",
        existingSubscriptions: mockSubscriptions,
        enableAiCheck: true,
        aiServiceFn: mockAiFn,
      });

      expect(mockAiFn).toHaveBeenCalledTimes(1);
      expect(result.isDuplicate).toBe(true);
      expect(result.detectedBy).toBe("ai");
      expect(result.matchedSubscription?.id).toBe("sub-3");
    });

    it("gracefully falls back when AI service throws a network error", async () => {
      const mockFailingAiFn = jest.fn().mockRejectedValue(new Error("Network timeout"));

      const result = await detectDuplicateSubscription({
        candidateName: "DigitalOcean",
        candidateEmail: "dev@startup.io",
        existingSubscriptions: mockSubscriptions,
        enableAiCheck: true,
        aiServiceFn: mockFailingAiFn,
      });

      // Does not throw or crash; falls back gracefully
      expect(result.isDuplicate).toBe(false);
      expect(result.detectedBy).toBe("none");
    });
  });
});
