import { findByStoreName } from "@vendetta/metro";
import { NavigationNative, React, stylesheet } from "@vendetta/metro/common";
import { useProxy } from "@vendetta/storage";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { Forms } from "@vendetta/ui/components";
import { useEffect, useState } from "react";
import { FlatList, Image, ScrollView, TouchableOpacity } from "react-native";
import { SettingsSchema, settings } from ".";

const UserStore = findByStoreName("UserStore");

const { FormInput, FormDivider, FormText, FormIcon, FormRow, FormSection, FormSwitchRow } = Forms;

const styles = stylesheet.createThemedStyleSheet({
    avatar: {
        height: 36,
        width: 36,
        borderRadius: 18,
    },
    button: {
        marginRight: 12,
    }
});

function AddButton({ callback }: { callback: () => void }) {
    return <TouchableOpacity onPress={callback}>
        <FormText style={styles.button}>ADD</FormText>
    </TouchableOpacity>;
}

function AddRow({ onFinish }: { onFinish: () => void }) {
    const [value, setValue] = useState("");

    const onPressCallback = () => {
        if (!isNaN(parseInt(value)) && UserStore.getUser(value) && !settings.exempted.includes(value)) {
            settings.exempted = [...settings.exempted, value];
            setValue("");
        }
        onFinish();
    };

    return (
        <FormRow
            leading={<FormIcon source={getAssetIDByName("ic_add_friend")} />}
            label={<FormInput autoFocus
                title="User ID"
                placeholder="123456789012345678"
                value={value}
                keyboardType="numeric"
                onChangeText={(value: string) => setValue(value.replace(/[^0-9]/g, "").trim())}
                returnKeyType="done"
            />}
            trailing={(
                <TouchableOpacity onPress={onPressCallback}>
                    <FormIcon source={getAssetIDByName("ic_add_24px")} />
                </TouchableOpacity>
            )}
        />
    );
}

export default function Settings() {
    useProxy(settings) as SettingsSchema;

    const [shouldShowAdd, setShouldShowAdd] = useState(false);
    const navigation = NavigationNative.useNavigation();

    useEffect(() => {
        navigation.setOptions({
            headerRight: () => <AddButton callback={() => setShouldShowAdd(true)} />
        });
    }, []);

    return (
        <ScrollView>
            <FormSwitchRow
                label="Enable blacklist mode"
                subLabel="If enabled, only users in the exempted list will be affected by the plugin."
                leading={<FormIcon source={getAssetIDByName("ic_block")} />}
                value={settings.isBlacklistMode}
                onValueChange={(value: boolean) => settings.isBlacklistMode = value}
            />
            <FormSection title="Exempted Users">
                {settings.exempted?.length > 0 && <FlatList
                    data={settings.exempted}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => {
                        const user = UserStore.getUser(item);
                        if (!user) throw new Error("User not found/is not cached");

                        return (<FormRow
                            label={user.username}
                            leading={<Image style={styles.avatar} source={{ uri: user.getAvatarURL() }} />}
                            trailing={<TouchableOpacity onPress={() => {
                                settings.exempted = settings.exempted.filter((id) => id !== item);
                            }}>
                                <FormIcon source={getAssetIDByName("Small")} disableColor />
                            </TouchableOpacity>}
                        />);
                    }}
                    ItemSeparatorComponent={FormDivider}
                />}
                {shouldShowAdd && <>
                    <FormDivider />
                    <AddRow onFinish={() => setShouldShowAdd(false)} />
                </>}
            </FormSection>
        </ScrollView>
    );
}
