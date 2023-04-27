import RPInstance from ".";

import { NavigationNative } from "@vendetta/metro/common";
import plugin from "@vendetta/plugin";
import { Forms } from "@vendetta/ui/components";
import ConfigEditor from "./ConfigEditor";

import { useEffect } from "react";
import { TouchableOpacity } from "react-native";

const { FormText } = Forms;
const storage = plugin.storage as typeof plugin.storage & {
    selected: string;
    selections: Record<string, Activity>;
};

function UpdateButton() {
    async function onPressCallback() {
        RPInstance.onUnload();
        RPInstance.onLoad();
    }

    return <TouchableOpacity onPress={onPressCallback}>
        <FormText style={{ marginRight: 12 }}>UPDATE</FormText>
    </TouchableOpacity>;
}

export default function Settings() {
    const navigation = NavigationNative.useNavigation();

    useEffect(() => {
        navigation.setOptions({
            headerRight: UpdateButton
        });
    }, []);

    return (
        <ConfigEditor selection={storage.selected} />
    );
}
