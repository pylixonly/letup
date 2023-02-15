/* eslint-disable indent */
import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import { createHash } from "crypto";
import { readdirSync, readFileSync, writeFileSync } from "fs";
import { argv } from "process";
import { rollup, watch } from "rollup";
import esbuild from "rollup-plugin-esbuild";

const args = argv.slice(2);
console.clear();

const inputPlugins = args.filter(x => !x.startsWith("-"));
const flags = args.map(x => x.toLowerCase()).filter(x => x.startsWith("-"));

const isWatch = flags.includes("--watch") || flags.includes("-w");
const toBuild = inputPlugins.length ? inputPlugins : readdirSync("./plugins");

console.log(`Building ${toBuild.length} plugin(s)...`);

let failed = 0;

for (const plugin of toBuild) {
    try {
        await buildPlugin(plugin);
    } catch (e) {
        console.error(e.stack || e);
        failed++;
    }
}

console.log("\n" + (
    failed
        ? "\x1b[31m" + `Failed to build ${failed} plugin(s)` + "\x1b[0m"
        : "\x1b[32m" + "All plugin(s) built successfully!" + "\x1b[0m"
));

isWatch && console.log("\nWatching for changes...");

async function buildPlugin(plugin) {
    const manifest = JSON.parse(readFileSync(`./plugins/${plugin}/manifest.json`).toString());
    const entry = "index.js";
    const outPath = `./dist/${plugin}/${entry}`;

    /** @type {import("rollup").RollupOptions} */
    const options = {
        input: `./plugins/${plugin}/${manifest.main}`,
        output: {
            file: outPath,
            globals(id) {
                if (id.startsWith("@vendetta")) return id.substring(1).replace(/\//g, ".");
                const map = {
                    react: "window.React"
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
                supported: {
                    "arrow": false, // arrows are supported but not with async await
                    "class": false,
                    "bigint": false,
                },
                minify: true,
            })
        ]
    };

    if (!isWatch) {
        const bundle = await rollup(options);
        await bundle.write(options.output);
        await bundle.close();

        console.log(`${plugin}: ` + "\x1b[32m" + "Build succeed!" + "\x1b[0m");
        return;
    }

    const watcher = watch(options);

    return await new Promise((resolve, reject) => {
        watcher.on("event", (event) => {
            switch (event.code) {
                case "BUNDLE_END": {
                    event.result.close();

                    const toHash = readFileSync(outPath);
                    manifest.hash = createHash("sha256").update(toHash).digest("hex");
                    manifest.main = "index.js";
                    writeFileSync(`./dist/${plugin}/manifest.json`, JSON.stringify(manifest));

                    console.log(`${plugin}: ` + "\x1b[32m" + `Build succeed! (${event.duration}ms)` + "\x1b[0m");
                    resolve();
                    break;
                }
                case "ERROR":
                    console.error(`${plugin}: ` + "\x1b[31m", "Failed! :(", "\x1b[0m");
                    reject(event.error);
                    break;
                case "FATAL":
                    console.error(`${plugin}: ` + "\x1b[31m", "Failed! :(", "\x1b[0m");
                    reject(event.error);
                    process.exit(1);
            }
        });
    });
}
