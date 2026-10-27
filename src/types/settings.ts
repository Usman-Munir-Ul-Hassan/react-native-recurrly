export type SettingItemType = "value" | "link" | "toggle";

export interface SettingItem {
  id: string;
  label: string;
  value?: string;
  type?: SettingItemType;
  highlight?: boolean;
}

export interface SettingSection {
  id: string;
  title: string;
  items: SettingItem[];
}
