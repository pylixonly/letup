import { findByStoreName } from "@vendetta/metro";
import { NavigationNative, React, ReactNative, stylesheet } from "@vendetta/metro/common";
import { storage } from "@vendetta/plugin";
import { useProxy } from "@vendetta/storage";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { Forms } from "@vendetta/ui/components";
import { SettingsSchema } from ".";

const UserStore = findByStoreName("UserStore");

const { ScrollView, TouchableOpacity, Image, FlatList } = ReactNative;
const { FormInput, FormDivider, FormText, FormIcon, FormRow, FormSection } = Forms;

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
    const [value, setValue] = React.useState("");

    const onPressCallback = () => {
        if (value && +value && UserStore.getUser(value) && !storage.exempted.includes(value)) {
            storage.exempted = [...storage.exempted, value];
            setValue("");
        }
        onFinish();
    };

    return <>
        <FormDivider />
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
    </>;
}

export default function Settings() {
    const [shouldShowAdd, setShouldShowAdd] = React.useState(false);
    const settings = useProxy(storage) as SettingsSchema;
    const navigation = NavigationNative.useNavigation();

    React.useEffect(() => {
        navigation.setOptions({
            headerRight: () => <AddButton callback={() => setShouldShowAdd(true)} />
        });
    }, []);

    return (
        <ScrollView>
            <FormSection title="Exempted Users" titleStyleType="no_border">
                {settings.exempted?.length > 0 && <FlatList
                    data={settings.exempted}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => {
                        const user = UserStore.getUser(item);

                        return (<FormRow
                            label={user.username}
                            leading={<Image style={styles.avatar} source={{ uri: user.getAvatarURL() }} />}
                            trailing={<TouchableOpacity onPress={() => {
                                storage.exempted = storage.exempted.filter((id) => id !== item);
                            }}>
                                <FormIcon source={getAssetIDByName("Small")} disableColor />
                            </TouchableOpacity>}
                        />);
                    }}
                    ItemSeparatorComponent={FormDivider}
                />}
                {shouldShowAdd && <AddRow onFinish={() => setShouldShowAdd(false)} />}
            </FormSection>
        </ScrollView>
    );
}
