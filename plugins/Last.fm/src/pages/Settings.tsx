import { NavigationNative, React } from "@vendetta/metro/common";
import { storage } from "@vendetta/plugin";
import { useProxy } from "@vendetta/storage";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { Forms } from "@vendetta/ui/components";
import { showToast } from "@vendetta/ui/toasts";

import { currentSettings } from "..";
import Constants from "../constants";
import { initialize } from "../utils";

import { FlatList, ScrollView, TouchableOpacity } from "react-native";
import { LFMSettings } from "../../../defs";

const { FormInput, FormDivider, FormSwitchRow, FormText, FormIcon, FormRow } = Forms;

function UpdateButton() {
    async function onPressCallback() {
        for (const key in storage) {
            if (storage[key] === false || storage[key]) {
                currentSettings[key] = storage[key];
            }
        }

        console.log("Applying settings...");
        await initialize();
        showToast("Settings updated!", getAssetIDByName("Check"));
    }

    return <TouchableOpacity onPress={onPressCallback}>
        <FormText style={{ marginRight: 12 }}>UPDATE</FormText>
    </TouchableOpacity>;
}

type FormRowProps = {
    label: string;
    subLabel: string;
    leading: React.ReactNode;
    trailing: React.ReactNode;
    onPress: () => void;
};

type RowProps = Partial<FormRowProps & ({
    type: "switch";
    value: boolean;
    onValueChange: (value: boolean) => void;
} | {
    label: never;
    subLabel: never;

    type: "input";
    title: string;
    value: string;
    required?: boolean;
    onChangeText: (value: string) => void;
    placeholder: string;
    keyboardType?: "default" | "numeric";
    returnKeyType?: "done";
})>;

function Rows({ rows }: { rows: RowProps[] }) {
    const Row = ({ type, ...props }: RowProps) => {
        switch (type) {
            case "switch": return <FormSwitchRow {...props} />;
            case "input": return <FormInput {...props} />;
            default: return <FormRow {...props} />;
        }
    };

    return <FlatList
        data={rows}
        renderItem={({ item }) => <Row {...item} />}
        keyExtractor={(item) => item.label}
        ItemSeparatorComponent={FormDivider}
    />;
}

export default function Settings() {
    const settings = useProxy(storage) as LFMSettings;
    const navigation = NavigationNative.useNavigation();

    navigation.addListener("focus", () => {
        navigation.setOptions({
            headerRight: UpdateButton
        });
    });

    return (
        <ScrollView>
            <Rows rows={[
                {
                    type: "input",
                    title: "Discord Application Name",
                    value: settings.appName || void 0,
                    onChangeText: (value: string) => settings.appName = value.trim(),
                    placeholder: Constants.DEFAULT_APP_NAME,
                    returnKeyType: "done"
                },
                {
                    type: "input",
                    title: "Last.fm username",
                    value: settings.username || void 0,
                    onChangeText: (value: string) => settings.username = value.trim(),
                    placeholder: "wumpus123",
                    returnKeyType: "done",
                    required: true
                },
                {
                    type: "input",
                    title: "Update interval (in seconds)",
                    value: String(settings.timeInterval),
                    onChangeText: (value: string) => settings.timeInterval = value,
                    placeholder: Constants.DEFAULT_TIME_INTERVAL.toString(),
                    keyboardType: "numeric",
                    returnKeyType: "done"
                },
                {
                    type: "switch",
                    label: "Show time elapsed",
                    subLabel: "Show the time elapsed since the song started playing",
                    leading: <FormIcon source={getAssetIDByName("clock")} />,
                    value: settings.showTimestamp,
                    onValueChange: (value: boolean) => settings.showTimestamp = value
                },
                {
                    type: "switch",
                    label: "Set status as listening",
                    subLabel: "Set your status as \"Listening to\" instead of \"Playing\"",
                    leading: <FormIcon source={getAssetIDByName("ic_headset_neutral")} />,
                    value: settings.listeningTo,
                    onValueChange: (value: boolean) => settings.listeningTo = value
                },
                {
                    type: "switch",
                    label: "Hide when Spotify is running",
                    subLabel: "Hide the status when a Spotify activity is detected",
                    leading: <FormIcon source={getAssetIDByName("img_account_sync_spotify_light_and_dark")} />,
                    value: settings.ignoreSpotify,
                    onValueChange: (value: boolean) => settings.ignoreSpotify = value
                },
                {
                    label: "Debug",
                    subLabel: "View debug information",
                    leading: <FormIcon source={getAssetIDByName("debug")} />,
                    trailing: FormRow.Arrow,
                    onPress: async () => {
                        const imported = await import("./Debug");

                        navigation.push("VendettaCustomPage", {
                            title: "Debug",
                            render: imported.default
                        });
                    }
                }
            ]} />
        </ScrollView>
    );
}
