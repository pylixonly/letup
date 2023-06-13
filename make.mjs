import * as fs from "fs";
import { argv } from "process";

const pluginName = [...argv].pop();

if (fs.existsSync(`./plugins/${pluginName}`)) {
    console.warn(`Plugin named ${pluginName} already exists!`);
}

fs.mkdirSync(`./plugins/${pluginName}/src`, { recursive: true });

if (fs.existsSync(`./plugins/${pluginName}/manifest.json`)) {
    throw new Error(`${pluginName} already got manifest!`);
}

fs.writeFileSync(
    `./plugins/${pluginName}/manifest.json`,
    JSON.stringify({
        name: pluginName,
        description: null,
        vendetta: {}
    }, null, 4)
);

fs.writeFileSync(
    `./plugins/${pluginName}/src/index.ts`,
    "export default {};\n"
);

