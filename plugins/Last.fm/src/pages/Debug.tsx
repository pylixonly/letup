import { Codeblock } from "@vendetta/ui/components";
import { ScrollView } from "react-native";

export default function Debug() {
    return (
        <ScrollView>
            <Codeblock selectable>
                {JSON.stringify({ blah: "bleh" }, null, 4)}
            </Codeblock>
        </ScrollView>
    );
}
