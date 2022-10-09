# Upload Unit

Upload Unit is a GitHub Action to upload a unit to [Cratecode](https://cratecode.com). It handles uploading lessons, subunits, and units, all under a single action.

# Examples

## Upload a Manifest

```yaml
steps:
    - uses: actions/checkout@v2

    - uses: cratecode/upload-manifest@v1
      with:
          manifest: path/to/manifest.json
          key: ${{ secrets.CRATECODE_API_KEY }}
```
You can get an API key at https://cratecode.com/account (`API` tab).

## Creating Manifests

For more info on how to create lessons and units, head over to the [CLI repository](https://github.com/Cratecode/cli.git).
