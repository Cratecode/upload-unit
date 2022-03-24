import axios, { AxiosError } from "axios";
import * as core from "@actions/core";
import { delay, State } from "./index";

/**
 * Handles a unit manifest.
 * @param state {State} - is the application's state.
 * @param id {string} - is the friendly name of the unit.
 * @param name {string} - is the display name of the unit.
 * @param lessons {Record<string, object>} - is the lessons map for the unit.
 */
export async function handleUnit(
    state: State,
    id: string,
    name: string,
    lessons: Record<string, { next: string[]; requires: string[] }>,
): Promise<void> {
    // First, we need to figure out what the actual ID of our unit is.
    // If there isn't one, we'll just set it to null.
    const actualID: string | null = await axios
        .get(
            new URL(
                "/internal/api/id/" + id,
                core.getInput("domain"),
            ).toString(),
            {
                headers: {
                    authorization: core.getInput("key"),
                },
            },
        )
        .then((res) => res.data.id)
        .catch((e: AxiosError) => {
            // If none was found, just use null.
            if (e.response?.status === 404) return null;
            throw e;
        });
    await delay(state);

    // Next, we need to go through the lessons and map from friendly names to ids.
    const map: Record<string, { next: string[]; requires: string[] }> = {};

    for (const key in lessons) {
        // Map the key.
        const newKey = await mapKey(key, state);

        // Map next and requires.
        const next = lessons[key].next;
        const requires = lessons[key].requires;

        if (typeof next !== "object" || !Array.isArray(next))
            throw new Error("next must be a string array!");
        if (typeof requires !== "object" || !Array.isArray(requires))
            throw new Error("requires must be a string array!");

        const newNext: string[] = [];
        const newRequires: string[] = [];

        for (const item of next) {
            newNext.push(await mapKey(item, state));
        }

        for (const item of requires) {
            newRequires.push(await mapKey(item, state));
        }

        map[newKey] = { next: newNext, requires: newRequires };
    }

    // Create or update the unit.
    await axios.put(
        new URL("/internal/api/unit/new", core.getInput("domain")).toString(),
        {
            id: actualID,
            friendlyName: id,
            name,
            data: map,
        },
        {
            headers: {
                authorization: core.getInput("key"),
            },
        },
    );
    await delay(state);
}

async function mapKey(key: string, state: State): Promise<string> {
    const newKey =
        state.idsMap[key] ||
        (await axios
            .get(
                new URL(
                    "/internal/api/id/" + key,
                    core.getInput("domain"),
                ).toString(),
                {
                    headers: {
                        authorization: core.getInput("key"),
                    },
                },
            )
            .then((res) => {
                state.idsMap[key] = res.data.id;
                return res.data.id;
            }));
    await delay(state);

    return newKey;
}
