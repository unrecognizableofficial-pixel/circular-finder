# Training narration assets

The Recovery training player now looks for local narration clips before it falls back to the browser voice.

## Supported lesson paths

Add one narration file per scene under `frontend/public/audio/training/<lesson-id>/`.

Current lesson ids:

- `training-logo`
- `training-marketplace`
- `training-social`

Current scene filenames:

- `scene-1.mp3`
- `scene-2.mp3`
- `scene-3.mp3`

The player will also check these extensions if you prefer them:

- `.m4a`
- `.wav`
- `.webm`
- `.ogg`

## Example structure

```text
frontend/public/audio/training/
  training-logo/
    scene-1.mp3
    scene-2.mp3
    scene-3.mp3
  training-marketplace/
    scene-1.mp3
    scene-2.mp3
    scene-3.mp3
  training-social/
    scene-1.mp3
    scene-2.mp3
    scene-3.mp3
```

## How it behaves

- If a scene clip exists, the player uses that clip and times the scene to its real duration.
- If some clips exist and others do not, the lesson runs in hybrid mode.
- If no clips exist, the player falls back to the browser narrator voice.
- No code change is needed after dropping in the files. Refresh the page and the player will pick them up.
