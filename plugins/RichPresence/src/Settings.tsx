import plugin from "@vendetta/plugin";
import ConfigEditor from "./ConfigEditor";

const storage = plugin.storage as typeof plugin.storage & {
    selected: string;
    selections: Record<string, Activity>;
};

export default () => (
    <ConfigEditor selection={storage.selected} />
)
