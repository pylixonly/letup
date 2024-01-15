import { plugin, plugins } from "@vendetta";
import { config } from "@vendetta/loader";
import { showConfirmationAlert } from "@vendetta/ui/alerts";

export default {
    onLoad() {
        plugins.removePlugin(plugin.id);

        setTimeout(() => showConfirmationAlert({
            title: "Install Pyoncord?",
            content: "Loader's settings will be overriden to load Pyoncord instead. You may not be able to revert to Vendetta whenever Pyoncord breaks!",
            confirmText: "Continue and Restart",
            cancelText: "Nevermind",
            onConfirm: this.install
        }), 300);
    },

    async install() {
        if (config.customLoadUrl) {
            config.customLoadUrl.enabled = true;
            config.customLoadUrl.url = "https://raw.githubusercontent.com/pyoncord/pyoncord/builds/pyoncord.js";

            setTimeout(globalThis.nativeModuleProxy.BundleUpdaterManager.reload, 100);
        } else {
            alert("not a proper vendetta loader!");
        }
    }
};
