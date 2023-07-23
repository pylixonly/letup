import { findByProps, findByStoreName } from "@vendetta/metro";

const FluxUtils = findByProps("useStateFromStores");
const SpotifyStore = findByStoreName("SpotifyStore");
const GamePartyStore = findByStoreName("GamePartyStore");
const UserStore = findByStoreName("UserStore");

export default function useListeningParty() {
    const partySet = FluxUtils.useStateFromStores([GamePartyStore, SpotifyStore], () => {
        const party = GamePartyStore.getParty(SpotifyStore.getActivity()?.party?.id);
        return party?.size > 1 ? party : null;
    });

    return partySet ? [...partySet].map(id => UserStore.getUser(id)) : [];
}
