import { delay, State } from "./index";
import * as fs from "fs";
import { handleUnit } from "./unit";
import * as Path from "path";
import { handleLesson } from "./lesson";

/**
 * Reads and handles a manifest file.
 * @param state {State} - is the state of the application.
 * @param parent {string | null} - is the manifest that referenced this manifest.
 * @param templates {string | null} - is the path to the templates.
 * @param manifest {string} - is the manifest to read.
 */
export async function readManifest(
    state: State,
    parent: string | null,
    templates: string | null,
    manifest: string,
): Promise<void> {
    try {
        const data = JSON.parse(await fs.promises.readFile(manifest, "utf-8"));
        if (typeof data !== "object" || Array.isArray(data))
            throw new Error("Manifest must be an object!");

        const newBase = Path.dirname(manifest);

        // Handle new templates.
        if (data["templates"]) {
            if (typeof data["templates"] !== "string")
                throw new Error("Templates must be a string!");

            templates = Path.join(newBase, data["templates"]);
        }

        // Read and handle other referenced manifests.
        if (data["upload"]) {
            if (typeof data !== "object" || !Array.isArray(data["upload"]))
                throw new Error("Upload must be an array!");

            for (const item of data["upload"] as unknown[]) {
                if (typeof item !== "string")
                    throw new Error("Upload must be a string array!");

                await readManifest(
                    state,
                    manifest,
                    templates,
                    Path.join(newBase, item, "manifest.json"),
                );
            }
        }

        // Figure out which type of manifest this is.
        // If no type is defined, it's probably only being
        // used for uploading, so we can ignore it.
        if (!data["type"]) return;

        switch (data["type"]) {
            case "unit": {
                const id = data["id"];
                const name = data["name"];
                const lessons = data["lessons"];

                if (typeof id !== "string")
                    throw new Error("id must be a string!");
                if (typeof name !== "string")
                    throw new Error("name must be a string!");
                if (typeof lessons !== "object" || Array.isArray(lessons))
                    throw new Error("lessons must be an object!");

                await handleUnit(state, id, name, lessons);
                break;
            }
            case "lesson": {
                const id = data["id"];
                const name = data["name"];
                const spec = data["spec"];
                const extends1 = data["extends"];

                if (typeof id !== "string")
                    throw new Error("id must be a string!");

                if (typeof name !== "string")
                    throw new Error("name must be a string!");

                // Spec must be explicitly defined as null.
                if (typeof spec !== "string" && spec !== null)
                    throw new Error("spec must be a string or null!");

                if (typeof extends1 !== "string" && extends1 != null)
                    throw new Error("extends must be a string or null!");
                else if (templates == null)
                    throw new Error("extends must be used with templates!");

                await handleLesson(
                    state,
                    id,
                    name,
                    spec,
                    extends1 ? Path.join(templates, extends1) : null,
                    Path.dirname(manifest),
                );
                break;
            }
            default: {
                throw new Error(
                    'Type must be either undefined, "unit", or "lesson".',
                );
            }
        }

        console.log(`Uploaded ${manifest}.`);

        // Handle delays.
        await delay(state);
    } catch (e) {
        if (parent) {
            console.error(
                `An error occurred while reading ${manifest} (called by ${parent}):`,
            );
        } else {
            console.error(`An error occurred while reading ${manifest}:`);
        }

        throw e;
    }
}
