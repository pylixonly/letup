import commonjs from "@rollup/plugin-commonjs";
import nodeResolve from "@rollup/plugin-node-resolve";
import { createHash } from "crypto";
import { readdir, readFile, writeFile } from "fs/promises";
import { rollup } from "rollup";
import esbuild from "rollup-plugin-esbuild";

for (const plug of await readdir("./plugins")) {
    const manifest = JSON.parse(await readFile(`./plugins/${plug}/manifest.json`));
    const entry = "index.js";
    const outPath = `./dist/${plug}/${entry}`;

    try {
        const bundle = await rollup({
            input: `./plugins/${plug}/${manifest.main}`,
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
            ],
        });

        await bundle.write({
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
        });
        await bundle.close();

        const toHash = await readFile(outPath);
        manifest.hash = createHash("sha256").update(toHash).digest("hex");
        manifest.main = entry;
        await writeFile(`./dist/${plug}/manifest.json`, JSON.stringify(manifest));

        console.log(`Successfully built ${manifest.name}!`);
    } catch (e) {
        console.error("Failed to build plugin...", e);
        process.exit(1);
    }
}
