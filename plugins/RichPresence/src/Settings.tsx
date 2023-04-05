import { React, stylesheet } from "@vendetta/metro/common";
import { storage } from "@vendetta/plugin";
import { useProxy } from "@vendetta/storage";
import { semanticColors } from "@vendetta/ui";
import { Forms } from "@vendetta/ui/components";

import { ScrollView } from "react-native";

const { FormSection, FormInput, FormRow, FormSwitch, FormText } = Forms;

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

export default function Settings() {
    const settings = useProxy(storage) as { [key: string]: any };

    return (
        <ScrollView>
            <FormSection title="Basic">
                <FormInput
                    title="Application Name"
                    value={settings.app_name}
                    placeholder="Vendetta"
                    onChange={v => settings.app_name = v}
                />
                <FormInput
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
                    value={settings.large_image}
                    placeholder="large_image_here"
                    onChange={v => settings.large_image = v}
                />
                <FormInput
                    title="Large Image Text"
                    value={settings.large_image_text}
                    placeholder="Playing on Joe's lobby"
                    disabled={!settings.large_image}
                    onChange={v => settings.large_image_text = v}
                />
                <FormInput
                    title="Small Image Asset Key or URL"
                    value={settings.small_image}
                    placeholder="small_image_here"
                    onChange={v => settings.small_image = v}
                />
                <FormInput
                    title="Small Image Text"
                    value={settings.small_image_text}
                    placeholder="Solo"
                    disabled={!settings.small_image}
                    onChange={v => settings.small_image_text = v}
                />
                <FormText style={styles.subText}>
                    {"Image assets key can be either a Discord app asset's name or a URL to an image."}
                </FormText>
            </FormSection>
            <FormSection title="Timestamps">
                <FormRow
                    label="Enable timestamps"
                    subLabel="Set whether to show timestamps or not"
                    trailing={<FormSwitch
                        value={settings.enable_timestamps}
                        onValueChange={v => settings.enable_timestamps = v}
                    />}
                />
                <FormInput
                    title="Start Timestamp (seconds)"
                    value={settings.start_timestamp}
                    placeholder="1234567890"
                    disabled={!settings.enable_timestamps}
                    onChange={v => settings.start_timestamp = v}
                    keyboardType="numeric"
                />
                <FormInput
                    title="End Timestamp (seconds)"
                    value={settings.end_timestamp}
                    placeholder="1234567890"
                    disabled={!settings.enable_timestamps}
                    onChange={v => settings.end_timestamp = v}
                    keyboardType="numeric"
                />
                <FormRow
                    label="Use current time as start timestamp"
                    subLabel="This will override the start timestamp you set above"
                    disabled={!settings.enable_timestamps}
                    onPress={() => settings.start_timestamp = String(Date.now())}
                    trailing={FormRow.Arrow}
                />
                <FormText style={styles.subText}>
                    Leaving start timestamp blank will use the time the Discord started.
                </FormText>
            </FormSection>
            <FormSection title="Buttons">
                <FormInput
                    title="First Button Text"
                    value={settings.button1_text}
                    placeholder="random link #1"
                    onChange={v => settings.button1_text = v}
                />
                <FormInput
                    title="First Button URL"
                    value={settings.button1_URL}
                    placeholder="https://discord.com/vanityurl/dotcom/steakpants/flour/flower/index11.html"
                    disabled={!settings.button1_text}
                    onChange={v => settings.button1_URL = v}
                />
                <FormInput
                    title="Second Button Text"
                    value={settings.button2_text}
                    placeholder="random link #2"
                    onChange={v => settings.button2_text = v}
                />
                <FormInput
                    title="Second Button URL"
                    value={settings.button2_URL}
                    placeholder="https://youtu.be/w0AOGeqOnFY"
                    disabled={!settings.button2_text}
                    onChange={v => settings.button2_URL = v}
                />
            </FormSection>
        </ScrollView>
    );
}
