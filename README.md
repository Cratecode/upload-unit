# Upload Unit
Upload Unit is a GitHub Action to upload a unit to Cratecode. It handles uploading lessons, subunits, and units, all under a single repository.

Uploading works by creating a manifest file which imports other manifest files, and can also specify a unit to upload. This "root" manifest file commonly links to either subunits (which in turn link to lessons or other subunits) or lessons, which will be uploaded.

Instead of working with IDs directly, items are linked and mapped with "friendly names", which are human-readable identifiers that are only used during the uploading process. Instead of specifying an ID for a unit/project, specify a friendly name. If the item doesn't already exist, it will be created.

Units can reference lessons or other units. If you need to use someone else's unit/lesson, you can use their ID by starting the ID with a ":" and placing it in the friendly name field.

Unit manifest files contain the definition for the unit. That is, they include a starting lesson for the unit, and what lessons other lessons point to. They follow the following format:
```json
{
  "type": "unit",
  "id": "Friendly Name",
  "name": "Display Name",
  "upload": [
    "folder1/manifest.json"
  ],
  "start": "first_lesson",
  "lessons": {
    "first_lesson": {
      "next": "next_lesson",
      "requires": []
    },
    "next_lesson": {
      "next": [],
      "requires": [
        "next_lesson"
      ]
    }
  }
}
```

Lesson manifest files include information about the lesson. They should be included in the directory containing the lesson's contents. For example, a lesson manifest might be in a folder that looks like:
```
folder
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