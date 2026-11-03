import { Subscription } from "@/types/subscription";
import { isFuzzyMatch } from "@/utils/fuzzy-matcher";
import {
  checkSemanticDuplicateWithGemini,
  GeminiDuplicateResult,
} from "@/services/ai/gemini-duplicate-service";

export interface DuplicateDetectionOptions {
  candidateName: string;
  candidateEmail: string;
  existingSubscriptions: Subscription[];
  enableAiCheck?: boolean;
  geminiApiKey?: string;
  // Optional dependency injection for testing
  aiServiceFn?: (
    candidateName: string,
    existingNames: string[],
    apiKey?: string
  ) => Promise<GeminiDuplicateResult>;
}

export interface DuplicateDetectionResult {
  isDuplicate: boolean;
  matchedSubscription?: Subscription;
  detectedBy: "local" | "ai" | "none";
  reason?: string;
}

/**
 * Normalizes email strings for safe case-insensitive comparison.
 */
export function normalizeEmail(email?: string): string {
  return (email || "").trim().toLowerCase();
}

/**
 * Orchestrator that detects duplicate subscriptions:
 * 1. Multi-account distinction: Different emails are always allowed.
 * 2. Local-first fuzzy check (0ms, offline-safe): Catches typos like "Cload" vs "Cloud".
 * 3. AI semantic check (Gemini Flash): Catches brand acronyms like "AWS" vs "Amazon Web Services".
 */
export async function detectDuplicateSubscription({
  candidateName,
  candidateEmail,
  existingSubscriptions,
  enableAiCheck = true,
  geminiApiKey,
  aiServiceFn = checkSemanticDuplicateWithGemini,
}: DuplicateDetectionOptions): Promise<DuplicateDetectionResult> {
  const normalizedCandidateEmail = normalizeEmail(candidateEmail);
  const trimmedCandidateName = candidateName.trim();

  if (!trimmedCandidateName) {
    return { isDuplicate: false, detectedBy: "none" };
  }

  // Filter only existing subscriptions belonging to the same account/email.
  // Subscriptions with a different email are distinct accounts and permitted.
  const sameAccountSubscriptions = existingSubscriptions.filter((sub) => {
    const subEmail = normalizeEmail(sub.invoiceEmail);
    // If either has an email, compare them; if both empty, treat as same account
    return subEmail === normalizedCandidateEmail;
  });

  if (sameAccountSubscriptions.length === 0) {
    return { isDuplicate: false, detectedBy: "none" };
  }

  // --- Step 1: Local Fast-Path Fuzzy Matching (0ms, 100% Free) ---
  for (const sub of sameAccountSubscriptions) {
    if (isFuzzyMatch(trimmedCandidateName, sub.name, 0.85)) {
      return {
        isDuplicate: true,
        matchedSubscription: sub,
        detectedBy: "local",
        reason: `A subscription for "${sub.name}" already exists for account ${candidateEmail}`,
      };
    }
  }

  // --- Step 2: Gemini AI Semantic Check (Acronyms & Synonyms) ---
  if (enableAiCheck) {
    const existingNames = sameAccountSubscriptions.map((s) => s.name);
    try {
      const aiResult = await aiServiceFn(
        trimmedCandidateName,
        existingNames,
        geminiApiKey
      );

      if (aiResult.isDuplicate && aiResult.matchedName) {
        const matchedSub =
          sameAccountSubscriptions.find(
            (s) =>
              s.name.toLowerCase() === aiResult.matchedName?.toLowerCase() ||
              isFuzzyMatch(s.name, aiResult.matchedName || "", 0.85) ||
              s.name.toLowerCase().includes(aiResult.matchedName?.toLowerCase() || "") ||
              (aiResult.matchedName || "").toLowerCase().includes(s.name.toLowerCase())
          ) || sameAccountSubscriptions[0];

        return {
          isDuplicate: true,
          matchedSubscription: matchedSub,
          detectedBy: "ai",
          reason: aiResult.reason || `AI detected duplicate service: ${aiResult.matchedName}`,
        };
      }
    } catch {
      // Graceful degradation: AI failure never crashes the application
    }
  }

  return { isDuplicate: false, detectedBy: "none" };
}
