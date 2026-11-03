/**
 * External transport service calling Google Gemini 1.5 Flash for semantic brand duplicate detection.
 * Designed with strict AbortController timeout and graceful offline fallback.
 */

export interface GeminiDuplicateResult {
  isDuplicate: boolean;
  matchedName: string | null;
  confidence: number;
  reason: string;
  isAvailable: boolean;
}

const DEFAULT_TIMEOUT_MS = 3500;

export async function checkSemanticDuplicateWithGemini(
  candidateName: string,
  existingNames: string[],
  apiKey: string | undefined = process.env.EXPO_PUBLIC_GEMINI_API_KEY,
  timeoutMs = DEFAULT_TIMEOUT_MS
): Promise<GeminiDuplicateResult> {
  // If no API key configured or list is empty, smoothly fallback to local-only
  if (!apiKey || existingNames.length === 0) {
    console.log("[GeminiService] Skipped check: apiKey configured?", Boolean(apiKey), "existing count:", existingNames.length);
    return {
      isDuplicate: false,
      matchedName: null,
      confidence: 0,
      reason: "Gemini API key not configured or no existing subscriptions",
      isAvailable: false,
    };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`;

  const prompt = `You are a subscription duplicate detector.
Compare the candidate subscription name against the list of existing subscription names for the same account.
Determine if the candidate refers to the exact same software/service (such as acronyms e.g. AWS vs Amazon Web Services, GCP vs Google Cloud, or brand aliases).

Candidate: "${candidateName}"
Existing Subscriptions: ${JSON.stringify(existingNames)}

Respond with a raw JSON object ONLY, no markdown, no backticks:
{"isDuplicate": boolean, "matchedName": string | null, "confidence": number, "reason": string}`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: "application/json",
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!response.ok) {
      console.warn(`[GeminiService] API returned error status: ${response.status}`);
      return {
        isDuplicate: false,
        matchedName: null,
        confidence: 0,
        reason: `Gemini API returned status ${response.status}`,
        isAvailable: false,
      };
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      return {
        isDuplicate: false,
        matchedName: null,
        confidence: 0,
        reason: "Empty response from Gemini API",
        isAvailable: false,
      };
    }

    const parsed = JSON.parse(rawText.trim());
    console.log(`[GeminiService] AI Decision: duplicate=${parsed.isDuplicate}, matched=${parsed.matchedName}`);
    return {
      isDuplicate: Boolean(parsed.isDuplicate),
      matchedName: parsed.matchedName || null,
      confidence: Number(parsed.confidence) || 0,
      reason: parsed.reason || "Semantic match identified by AI",
      isAvailable: true,
    };
  } catch (error) {
    clearTimeout(timer);
    console.warn(`[GeminiService] Fallback triggered:`, error instanceof Error ? error.message : error);
    // Offline, aborted timeout, or parse failure -> graceful fallback
    return {
      isDuplicate: false,
      matchedName: null,
      confidence: 0,
      reason: error instanceof Error ? error.message : "Network/service unreachable",
      isAvailable: false,
    };
  }
}
