import { NavigationNative, React } from "@vendetta/metro/common";
import { storage } from "@vendetta/plugin";
import { useProxy } from "@vendetta/storage";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { Forms } from "@vendetta/ui/components";
import { showToast } from "@vendetta/ui/toasts";

import { lazy, useEffect } from "react";
import { ScrollView, Text, TouchableOpacity } from "react-native";
import { currentSettings } from "../..";
import { LFMSettings } from "../../../../defs";
import Constants from "../../constants";
import { initialize } from "../../manager";

const { FormRow, FormInput, FormDivider, FormSwitchRow, FormText, FormIcon } = Forms;

function UpdateButton() {
    async function onPressCallback() {
        for (const key in storage) {
            if (storage[key] != null) {
                currentSettings[key] = storage[key];
            }
        }

        await initialize();
        showToast("Settings updated!", getAssetIDByName("Check"));
    }

    return <TouchableOpacity onPress={onPressCallback}>
        <FormText style={{ marginRight: 12 }}>UPDATE</FormText>
    </TouchableOpacity>;
}

export default React.memo(function Settings() {
    const settings = useProxy(storage) as LFMSettings;
    const navigation = NavigationNative.useNavigation();

    useEffect(() => {
        navigation.setOptions({
            title: "Last.fm Configuration",
            headerRight: UpdateButton
        });
    }, []);

    return (
        <ScrollView>
            <FormInput
                value={settings.appName || undefined}
                onChangeText={(value: string) => settings.appName = value.trim()}
                title="Discord Application Name"
                placeholder={Constants.DEFAULT_APP_NAME}
                returnKeyType="done"
            />
            <FormDivider />
            <FormInput required
                value={settings.username || undefined}
                onChangeText={(value: string) => settings.username = value.trim()}
                title="Last.fm username"
                helpText={!settings.username && <Text style={{ color: "#FF0000" }}>{"This field is required!"}</Text>}
                placeholder="wumpus123"
                returnKeyType="done"
            />
            <FormDivider />
            <FormInput
                value={settings.timeInterval}
                onChangeText={(value: string) => settings.timeInterval = value}
                title="Update interval (in seconds)"
                placeholder={Constants.DEFAULT_TIME_INTERVAL.toString()}
                keyboardType="numeric"
                returnKeyType="done"
            />
            <FormDivider />
            <FormSwitchRow
                label="Show time elapsed"
                subLabel="Show the time elapsed since the song started playing"
                leading={<FormIcon source={getAssetIDByName("clock")} />}
                value={settings.showTimestamp}
                onValueChange={(value: boolean) => settings.showTimestamp = value}
            />
            <FormDivider />
            <FormSwitchRow
                label="Set status as listening"
                subLabel='Set your status as "Listening to" instead of "Playing"'
                leading={<FormIcon source={getAssetIDByName("ic_headset_neutral")} />}
                value={settings.listeningTo}
                onValueChange={(value: boolean) => settings.listeningTo = value}
            />
            <FormDivider />
            <FormSwitchRow
                label="Use alternate activity name"
                subLabel='Use "artist - songname" as activity name instead of the set Application Name'
                leading={<FormIcon source={getAssetIDByName("ic_information_24px")} />}
                value={settings.altActivityName}
                onValueChange={(value: boolean) => settings.altActivityName = value}
            />
            <FormDivider />
            <FormSwitchRow
                label="Hide when Spotify is running"
                subLabel="Hide the status when a Spotify activity is detected"
                leading={<FormIcon source={getAssetIDByName("img_account_sync_spotify_light_and_dark")} />}
                value={settings.ignoreSpotify}
                onValueChange={(value: boolean) => settings.ignoreSpotify = value}
            />
            <FormDivider />
            <FormRow
                label="Debug"
                subLabel="View debug information"
                leading={<FormIcon source={getAssetIDByName("debug")} />}
                trailing={FormRow.Arrow}
                onPress={() => {
                    navigation.push("VendettaCustomPage", {
                        title: "Debug",
                        render: lazy(() => import("./Debug"))
                    });
                }}
            />
        </ScrollView>
    );
});
