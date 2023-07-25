import { findByProps, findByStoreName } from "@vendetta/metro";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { Image, View } from "react-native";

const FluxUtils = findByProps("useStateFromStores");
const SpotifyStore = findByStoreName("SpotifyStore");

const Button = findByProps("Sizes", "Looks") as any;
const SpotifySyncUtil = findByProps("play", "sync");

type ListenAlongButtonProps = Partial<{
    activity: any;
    user: any;
    isCurrentUser: boolean;
    activityButtonColor: string;
    [key: string]: any;
}>

export default function ListenAlongButton(props: ListenAlongButtonProps) {
    const currentPartyId = FluxUtils.useStateFromStores([SpotifyStore], () => SpotifyStore.getActivity()?.party?.id);
    const alreadySync = props.isCurrentUser || props.activity?.party?.id === currentPartyId;

    return <View pointerEvents={alreadySync ? "none" : "auto"}>
        <Button
            text={!alreadySync ? "Listen Along" : "You are already along for this ride"}
            size={Button.Sizes.SMALL}
            style={{
                marginTop: 12,
                backgroundColor: props.activityButtonColor,
                opacity: alreadySync ? 0.5 : 1
            }}
            renderIcon={() => <Image
                style={{ height: 16, width: 16, marginRight: 8, tintColor: "white" }}
                source={getAssetIDByName("ic_headphone")}
            />}
            onPress={() => void SpotifySyncUtil.sync(props.activity, props.user.id)}
        />
    </View>;
}
