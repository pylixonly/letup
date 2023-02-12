import { NavigationNative, React, ReactNative } from "@vendetta/metro/common";
import { storage } from "@vendetta/plugin";
import { useProxy } from "@vendetta/storage";
import { Forms } from "@vendetta/ui/components";
import { currentSettings, flush, initialize } from ".";

const { ScrollView, TouchableOpacity } = ReactNative;
const { FormInput, FormDivider, FormSwitchRow, FormText } = Forms;

export default function Settings() {
    const settings = useProxy(storage) as PluginSettings;
    const navigation = NavigationNative.useNavigation();

    React.useEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity onPress={() => {
                    for (const key in storage) {
                        currentSettings[key] = settings[key];
                    }
                    flush().then(() => initialize()).then(() => navigation.goBack()).catch(console.error);
                }}>
                    <FormText style={{ marginRight: 12 }}>UPDATE</FormText>
                </TouchableOpacity>
            )
        });
    }, []);

    return (
        <ScrollView>
            <FormInput
                value={settings.appName}
                onChangeText={(value: string) => settings.appName = value.trim()}
                title="Application Name"
                placeholder="Music"
                returnKeyType="done"
            />
            <FormDivider />
            <FormInput
                value={settings.username}
                onChangeText={(value: string) => settings.username = value.trim()}
                title="Username"
                placeholder="wumpus123"
                returnKeyType="done"
            />
            <FormDivider />
            <FormSwitchRow
                label="Show time elapsed"
                subLabel="Show the time elapsed since the song started playing"
                value={settings.showTimestamp}
                onValueChange={(value: boolean) => settings.showTimestamp = value}
            />
            <FormDivider />
            <FormSwitchRow
                label="Set status as listening"
                subLabel='Set your status as "Listening to" instead of "Playing"'
                value={settings.listeningTo}
                onValueChange={(value: boolean) => settings.listeningTo = value}
            />
            <FormDivider />
            <FormSwitchRow
                label="Verbose logging"
                subLabel="Log more information to the console for debugging purposes"
                value={settings.verboseLogging}
                onValueChange={(value: boolean) => settings.verboseLogging = value}
            />
        </ScrollView>
    )
}
