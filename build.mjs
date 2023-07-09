import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import { createHash } from "crypto";
import { readFile, readdir, writeFile } from "fs/promises";
import { argv } from "process";
import { rollup, watch } from "rollup";

import swc from "@swc/core";
import esbuild from "rollup-plugin-esbuild";

const args = argv.slice(2);
console.clear();

const inputPlugins = args.filter(x => !x.startsWith("-"));
const flags = args.map(x => x.toLowerCase()).filter(x => x.startsWith("-"));

const isWatch = flags.includes("--watch") || flags.includes("-w");
const toBuild = inputPlugins.length ? inputPlugins : await readdir("./plugins");

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
    if (plugin.endsWith(".ts")) return;

    const manifest = Object.assign(
        JSON.parse(await readFile("./base_manifest.json")),
        JSON.parse(await readFile(`./plugins/${plugin}/manifest.json`))
    );

    const entry = "index.js";
    const outPath = `./dist/${plugin}/${entry}`;

    /** @type {import("rollup").RollupOptions} */
    const options = {
        input: `./plugins/${plugin}/${manifest.main}`,
        output: {
            file: outPath,
            globals(id) {
                if (id.startsWith("@vendetta"))
                    return id.substring(1).replace(/\//g, ".");

                const map = {
                    "react": "window.React",
                    "react-native": "vendetta.metro.common.ReactNative"
                };

                return map[id] || null;
            },
            format: "iife",
            compact: true,
            exports: "named",
            inlineDynamicImports: true,
        },
        onwarn: (warning) => {
            ![
                "UNRESOLVED_IMPORT",
                "MISSING_NAME_OPTION_FOR_IIFE_EXPORT",
                "CIRCULAR_DEPENDENCY"
            ].includes(warning.code) && console.warn(warning);
        },
        plugins: [
            nodeResolve({
                resolveOnly: (id) => !["react", "react-native"].includes(id)
            }),
            commonjs(),
            {
                name: "swc",
                transform(code, id) {
                    return swc.transform(code, {
                        filename: id,
                        jsc: {
                            parser: {
                                syntax: "typescript",
                                tsx: true,
                            },
                            externalHelpers: true,
                        },
                        env: {
                            targets: "defaults",
                            include: [
                                "transform-classes",
                                "transform-arrow-functions",
                            ],
                        },
                    });
                },
            },
            esbuild({ minify: true }),
        ]
    };

    const applyHash = async () => Object.assign(manifest, {
        hash: createHash("sha256").update(await readFile(outPath)).digest("hex"),
        main: entry
    });

    if (!isWatch) {
        const bundle = await rollup(options);
        await bundle.write(options.output);
        await bundle.close();

        await applyHash();
        await writeFile(`./dist/${plugin}/manifest.json`, JSON.stringify(manifest));

        console.log(`${plugin}: ` + "\x1b[32m" + "Build succeed!" + "\x1b[0m");
        return;
    }

    const watcher = watch(options);

    return await new Promise((resolve, reject) => {
        watcher.on("event", async (event) => {
            switch (event.code) {
                case "BUNDLE_END": {
                    event.result.close();

                    await applyHash();
                    await writeFile(`./dist/${plugin}/manifest.json`, JSON.stringify(manifest));

                    console.log(`${plugin}: ` + "\x1b[32m" + `Build succeed! (${event.duration}ms)` + "\x1b[0m");
                    resolve();
                    break;
                }
                case "ERROR":
                case "FATAL":
                    console.error(`${plugin}: ` + "\x1b[31m", "Failed! :(", "\x1b[0m");
                    reject(event.error);
                    break;
            }
        });
    });
}
