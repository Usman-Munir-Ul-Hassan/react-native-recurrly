import { Ionicons } from "@expo/vector-icons";
import { ComponentProps } from "react";

export type IconName = ComponentProps<typeof Ionicons>["name"];

export interface TabItem {
    name: string;
    title: string;
    iconFocused: IconName;
    iconUnfocused: IconName;
}

export const TAB_ITEMS: TabItem[] = [
    {
        name: "index",
        title: "Subscriptions",
        iconFocused: "layers",
        iconUnfocused: "layers-outline",
    },
    {
        name: "subscription",
        title: "Analytics",
        iconFocused: "bar-chart",
        iconUnfocused: "bar-chart-outline",
    },
    {
        name: "settings",
        title: "Settings",
        iconFocused: "settings",
        iconUnfocused: "settings-outline",
    },
];
