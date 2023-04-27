
import { findByProps, findByStoreName } from "@vendetta/metro";
import { React, stylesheet } from "@vendetta/metro/common";
import { storage } from "@vendetta/plugin";
import { useProxy } from "@vendetta/storage";
import { semanticColors } from "@vendetta/ui";
import { Button, Forms } from "@vendetta/ui/components";

import { ScrollView } from "react-native";

const { FormSection, FormInput, FormRow, FormSwitch, FormText } = Forms;

const UserStore = findByStoreName("UserStore");
const profiles = findByProps("showUserProfile");

const styles = stylesheet.createThemedStyleSheet({
    subText: {
        fontSize: 14,
        marginLeft: 16,
        marginRight: 16,
        color: semanticColors.TEXT_MUTED
    },
    textLink: {
        color: semanticColors.TEXT_LINK,
    }
});

export default function ConfigEditor({ selection }: { selection: string }) {
    const settings = useProxy(storage.selections[selection]) as Activity;

    return (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 38 }}>
            <Button
                style={{ margin: 16 }}
                color={"brand"}
                size={Button.Sizes.MEDIUM}
                look={Button.Looks.FILLED}
                onPress={async () => {
                    profiles.showUserProfile({ userId: UserStore.getCurrentUser().id });
                }}
                text="Preview your profile"
            />
            <FormSection title="Basic" titleStyleType="no_border">
                <FormInput required autoFocus
                    title="Application Name"
                    value={settings.name}
                    placeholder="Discord"
                    onChange={v => settings.name = v}
                />
                <FormInput required
                    title="Application ID"
                    value={settings.application_id}
                    placeholder="1054951789318909972"
                    onChange={v => settings.application_id = v}
                    keyboardType="numeric"
                />
                <FormInput
                    title="Type"
                    value={settings.type}
                    placeholder="0"
                    onChange={v => settings.type = v}
                    keyboardType="numeric"
                />
                <FormInput
                    title="Details"
                    value={settings.details}
                    placeholder="Competitive"
                    onChange={v => settings.details = v}
                />
                <FormInput
                    title="State"
                    value={settings.state}
                    placeholder="Playing Solo"
                    onChange={v => settings.state = v}
                />
            </FormSection>
            <FormSection title="Images">
                <FormInput
                    title="Large Image Asset Key or URL"
                    value={settings.assets.large_image}
                    placeholder="large_image_here"
                    onChange={v => settings.assets.large_image = v}
                />
                <FormInput
                    title="Large Image Text"
                    value={settings.assets.large_text}
                    placeholder="Playing on Joe's lobby"
                    disabled={!settings.assets.large_image}
                    onChange={v => settings.assets.large_text = v}
                />
                <FormInput
                    title="Small Image Asset Key or URL"
                    value={settings.assets.small_image}
                    placeholder="small_image_here"
                    onChange={v => settings.assets.small_image = v}
                />
                <FormInput
                    title="Small Image Text"
                    value={settings.assets.small_text}
                    placeholder="Solo"
                    disabled={!settings.assets.small_image}
                    onChange={v => settings.assets.small_text = v}
                />
            </FormSection>
            <FormText style={styles.subText}>
                {"Image assets key can be either a Discord app asset's name or a URL to an image."}
            </FormText>
            <FormSection title="Timestamps">
                <FormRow
                    label="Enable timestamps"
                    subLabel="Set whether to show timestamps or not"
                    trailing={<FormSwitch
                        value={settings.timestamps._enabled}
                        onValueChange={v => settings.timestamps._enabled = v}
                    />}
                />
                <FormInput
                    title="Start Timestamp (milliseconds)"
                    value={settings.timestamps.start}
                    placeholder="1234567890"
                    disabled={!settings.timestamps._enabled}
                    onChange={v => settings.timestamps.start = v}
                    keyboardType="numeric"
                />
                <FormInput
                    title="End Timestamp (milliseconds)"
                    value={settings.timestamps.end}
                    placeholder="1234567890"
                    disabled={!settings.timestamps._enabled}
                    onChange={v => settings.timestamps.end = v}
                    keyboardType="numeric"
                />
                <FormRow
                    label="Use current time as start timestamp"
                    subLabel="This will override the start timestamp you set above"
                    disabled={!settings.timestamps._enabled}
                    onPress={() => settings.timestamps.start = String(Date.now())}
                    trailing={FormRow.Arrow}
                />
            </FormSection>
            <FormText style={styles.subText}>
                Leaving start timestamp blank will use the time the Discord started.
            </FormText>
            <FormSection title="Buttons">
                <FormInput
                    title="First Button Text"
                    value={settings.buttons[0].label}
                    placeholder="random link #1"
                    onChange={v => settings.buttons[0].label = v}
                />
                <FormInput
                    title="First Button URL"
                    value={settings.buttons[0].url}
                    placeholder="https://discord.com/vanityurl/dotcom/steakpants/flour/flower/index11.html"
                    disabled={!settings.buttons[0].label}
                    onChange={v => settings.buttons[0].url = v}
                />
                <FormInput
                    title="Second Button Text"
                    value={settings.buttons[1].label}
                    placeholder="random link #2"
                    onChange={v => settings.buttons[1].label = v}
                />
                <FormInput
                    title="Second Button URL"
                    value={settings.buttons[1].url}
                    placeholder="https://youtu.be/w0AOGeqOnFY"
                    disabled={!settings.buttons[1].label}
                    onChange={v => settings.buttons[1].url = v}
                />
            </FormSection>
        </ScrollView>
    );
}
