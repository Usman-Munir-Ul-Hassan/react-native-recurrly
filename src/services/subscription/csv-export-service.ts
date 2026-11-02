import { Share } from "react-native";
import { Subscription } from "@/types/subscription";

/**
 * Escapes CSV field value conforming to RFC 4180 standard.
 */
function escapeCsvField(value: string | number | undefined | null): string {
  if (value === undefined || value === null) return '""';
  const stringValue = String(value);
  if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

/**
 * Converts a list of subscriptions into valid CSV string content.
 */
export function generateSubscriptionCsv(subscriptions: Subscription[]): string {
  const headers = [
    "Name",
    "Status",
    "Category",
    "Price",
    "AmountNumeric",
    "Cadence",
    "DaysRemaining",
    "NextRenewal",
    "BillingCycle",
    "PaymentMethod",
    "InvoiceEmail",
  ];

  const rows = subscriptions.map((sub) => [
    escapeCsvField(sub.name),
    escapeCsvField(sub.status),
    escapeCsvField(sub.category),
    escapeCsvField(sub.price),
    escapeCsvField(sub.amountNumeric),
    escapeCsvField(sub.cadence),
    escapeCsvField(sub.daysRemaining),
    escapeCsvField(sub.nextRenewalFull),
    escapeCsvField(sub.billingCycle),
    escapeCsvField(sub.paymentMethod),
    escapeCsvField(sub.invoiceEmail),
  ]);

  return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
}

/**
 * Triggers the native platform share dialog to export or send the CSV file content.
 */
export async function exportAndShareSubscriptionsCsv(
  subscriptions: Subscription[]
): Promise<boolean> {
  if (subscriptions.length === 0) {
    return false;
  }

  const csvContent = generateSubscriptionCsv(subscriptions);

  try {
    const result = await Share.share({
      title: "Chronicle_Subscriptions.csv",
      message: csvContent,
    });
    return result.action !== Share.dismissedAction;
  } catch (error) {
    console.error("[CsvExportService] Share failed:", error);
    return false;
  }
}
