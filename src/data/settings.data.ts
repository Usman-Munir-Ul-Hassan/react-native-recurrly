import { SettingSection } from "@/types/settings";

export const SETTINGS_SECTIONS: SettingSection[] = [
  {
    id: "account-preferences",
    title: "Account Preferences",
    items: [
      {
        id: "notifications",
        label: "Renewal Alerts",
        value: "Enabled",
        highlight: true,
      },
      {
        id: "currency",
        label: "Default Currency",
        value: "USD ($)",
      },
      {
        id: "dark-mode",
        label: "Appearance",
        value: "System",
      },
    ],
  },
  {
    id: "data-sync",
    title: "Data & Storage",
    items: [
      {
        id: "cloud-sync",
        label: "Cloud Backup",
        value: "Synced",
        highlight: true,
      },
      {
        id: "export-data",
        label: "Export CSV",
        value: "Ready",
      },
    ],
  },
  {
    id: "app-info",
    title: "Application",
    items: [
      {
        id: "app-version",
        label: "App Version",
        value: "1.0.0 (Build 42)",
      },
      {
        id: "privacy-policy",
        label: "Privacy Policy",
        value: "View",
      },
    ],
  },
];
