/* eslint-disable indent */
import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import { createHash } from "crypto";
import { readdirSync, readFileSync, writeFileSync } from "fs";
import { argv } from "process";
import { watch } from "rollup";
import esbuild from "rollup-plugin-esbuild";

const args = argv.slice(2);

const inputPlugins = args.filter(x => !x.startsWith("-"));
const flags = args.map(x => x.toLowerCase()).filter(x => x.startsWith("-"));

const isWatch = flags.includes("--watch") || flags.includes("-w");

console.clear();

const toBuild = inputPlugins.length ? inputPlugins : readdirSync("./plugins");

console.log(`Building ${toBuild.length} plugin${toBuild.length === 1 ? "" : "s"}...`);

let failed = 0;

await Promise.allSettled(toBuild.map(x => buildPlugin(x).catch(() => failed++)));

console.log("\nDone! " + (
    failed
        ? "\x1b[31m" + `Failed to build ${failed} plugin${failed === 1 ? "" : "s"}` + "\x1b[0m"
        : "\x1b[32m" + "All plugins built successfully!" + "\x1b[0m"
));

if (!isWatch) process.exit(0);
else console.log("\nWatching for changes...");

async function buildPlugin(plugin) {
    const manifest = JSON.parse(readFileSync(`./plugins/${plugin}/manifest.json`).toString());
    const entry = "index.js";
    const outPath = `./dist/${plugin}/${entry}`;

    const watcher = watch({
        input: `./plugins/${plugin}/${manifest.main}`,
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
    });

    return await new Promise((resolve, reject) => {
        watcher.on("event", (event) => {
            switch (event.code) {
                case "START":
                    break;
                case "BUNDLE_END": {
                    const toHash = readFileSync(outPath);
                    manifest.hash = createHash("sha256").update(toHash).digest("hex");
                    manifest.main = "index.js";
                    writeFileSync(`./dist/${plugin}/manifest.json`, JSON.stringify(manifest));

                    console.log(`${plugin}: ` + "\x1b[32m" + `Build succeed! (${event.output})` + "\x1b[0m");
                    resolve();
                    break;
                }
                case "ERROR":
                    console.error(`${plugin}: ` + "\x1b[31m", "Failed! :(", "\x1b[0m");
                    console.error(event.error.stack);
                    reject(event.error.stack);
                    break;
                case "FATAL":
                    console.error(`${plugin}: ` + "\x1b[31m", "Failed! :(", "\x1b[0m");
                    console.error(event.error.stack);
                    reject(event.error.stack);
                    process.exit(1);
            }
        });
    });
}
