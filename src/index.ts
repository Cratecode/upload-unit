import * as core from "@actions/core";
import { upload } from "@cratecode/client";

(async () => {
    const manifest = core.getInput("manifest");
    const key = core.getInput("key");

    await upload(manifest, key);
})();
