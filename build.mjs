/* eslint-disable indent */
import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import { createHash } from "crypto";
import { readdirSync, readFileSync, writeFileSync } from "fs";
import { argv } from "process";
import { watch } from "rollup";
import esbuild from "rollup-plugin-esbuild";

const args = argv.slice(2);

const plugin = args.find(x => !x.startsWith("-"));
const flags = args.map(x => x.toLowerCase()).filter(x => x.startsWith("-"));

const isWatching = flags.includes("--watch") || flags.includes("-w");

console.clear();

for (const plug of plugin ? [plugin] : readdirSync("./plugins")) {
    const manifest = JSON.parse(readFileSync(`./plugins/${plug}/manifest.json`).toString());
    const entry = "index.js";
    const outPath = `./dist/${plug}/${entry}`;

    try {
        const config = {
            input: `./plugins/${plug}/${manifest.main}`,
            output: {
                file: outPath,
                globals(id) {
                    if (id.startsWith("@vendetta")) return id.substring(1).replace(/\//g, ".");
                    const map = {
                        react: "window.React",
                    };

                    return map[id] || null;
                },
                format: "iife",
                compact: true,
                exports: "named",
            },
            onwarn: (warning) => {
                ![
                    "UNRESOLVED_IMPORT",
                    "MISSING_NAME_OPTION_FOR_IIFE_EXPORT",
                    "CIRCULAR_DEPENDENCY"
                ].includes(warning.code) && console.warn(warning);
            },
            plugins: [
                nodeResolve(),
                commonjs(),
                esbuild({
                    target: "esnext",
                    minify: true,
                })
            ]
        };

        const watchPlugin = new Promise((resolve, reject) => {
            const watcher = watch(config);
            watcher.on("event", (event) => {
                switch (event.code) {
                    case "START":
                        process.stdout.write(`Building ${plug}... `);
                        break;
                    case "BUNDLE_END": {
                        console.log("\x1b[32m", `Succeed! (${event.duration}ms)`, "\x1b[0m");
                        const toHash = readFileSync(outPath);
                        manifest.hash = createHash("sha256").update(toHash).digest("hex");
                        manifest.main = "index.js";
                        writeFileSync(`./dist/${plug}/manifest.json`, JSON.stringify(manifest));

                        resolve();
                        break;
                    }
                    case "ERROR":
                        console.error("\x1b[31m", "Failed! :(", "\x1b[0m");
                        console.error(event.error);
                        reject(event.error);
                        break;
                    case "FATAL":
                        reject(event.error);
                        process.exit(1);
                }
            });
        });

        await watchPlugin.catch(console.error);
    } catch (e) {
        console.error(`Failed to build ${plug}...`, e);
        process.exit(1);
    }
}

if (!isWatching) process.exit(0);
else console.log("\nWatching for changes...");
