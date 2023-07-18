import { Codeblock } from "@vendetta/ui/components";
import { ScrollView } from "react-native";
import { useDebugInfo } from "../../utils/debug";

export default function Debug() {
    const debugInfo = useDebugInfo();

    return (
        <ScrollView>
            <Codeblock selectable style={{ margin: 12 }}>
                {debugInfo}
            </Codeblock>
        </ScrollView>
    );
}
