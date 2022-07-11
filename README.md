# Upload Unit

Upload Unit is a GitHub Action to upload a unit to Cratecode. It handles uploading lessons, subunits, and units, all under a single action.

# Examples

## Upload a Manifest

```yaml
steps:
    - uses: actions/checkout@v2

    - uses: cratecode/upload-manifest@v1
      with:
          manifest: path/to/manifest
          key: ${{ secrets.CRATECODE_API_KEY }}
```

# Usage

Uploading works by creating a manifest file which imports other manifest files, and can also specify a unit to upload. This "root" manifest file commonly links to either subunits (which in turn link to lessons or other subunits) or lessons, which will be uploaded.

Instead of working with IDs directly, items are linked and mapped with "friendly names", which are human-readable identifiers that are only used during the uploading process. Instead of specifying an ID for a unit/project, specify a friendly name. If the item doesn't already exist, it will be created.

Units can reference lessons or other units. If you need to use someone else's unit/lesson, you can use their ID by starting the ID with a ":" and placing it in the friendly name field.

Unit manifest files contain the definition for the unit. That is, they include a starting lesson for the unit, and what lessons other lessons point to. They follow the following format:

```json
{
    "type": "unit",
    "id": "Friendly Name",
    "name": "Display Name",
    "upload": ["folder1/manifest.json"],
    "start": "first_lesson",
    "lessons": {
        "first_lesson": {
            "next": "next_lesson"
        },
        "next_lesson": {
            "next": []
        }
    }
}
```

Lesson manifest files include information about the lesson. They should be included in the directory containing the lesson's contents. For example, a lesson manifest might be in a folder that looks like:

```
folder/
-- index.js
-- manifest.json
-- README.md
```

During the uploading process, the manifest will not be uploaded. For a lesson manifest, the following format is used:

```json
{
    "type": "lesson",
    "id": "Friendly Name",
    "name": "Display Name"
}
```

A typical setup might look like the below file tree, where the first manifest is the first example manifest and the second manifest is the second example manifest:

```
folder/
-- manifest.json
-- lessons/
   -- lesson_1/
      -- index.js
      -- manifest.json
      -- README.md
```

You may also subdivide your unit into multiple smaller units. In the example below, the first two manifests are unit manifests (like the first example manifest), while the second is a lesson manifest (like the second example manifest). In this example, the first manifest may upload the second manifest and link to the unit described by the second manifest, while the second manifest may upload the third and link to the lesson described by the third.

```
folder/
-- manifest.json
-- units/
   -- unit_1/
      -- manifest.json
      -- lessons/
         -- lesson_1/
            -- index.js
            -- manifest.json
            -- README.md
```

As you can see, many configurations are possible. To look at an actual example, please head over to the [Cratecode Intro](https://github.com/Cratecode/intro.git) repository.
