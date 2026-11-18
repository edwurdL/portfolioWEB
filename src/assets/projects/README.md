# Project photos

One folder per project, named after the project's slug in `src/posts/index.ts`.

A project's post (e.g. `src/posts/RobotControlsLibrary.tsx`) places any image
(`.png`, `.jpg`, `.jpeg`, `.webp`, `.avif`, `.gif`, `.svg`) from its folder by
name with `<Figure folder={FOLDER} file="..." caption="..." />`. A figure whose
file doesn't exist yet shows as a dashed slot under `pnpm dev` and is left out
of the built site.

Prefer **WebP, about 1600px wide** — figures render up to the post's column
width and enlarge to the full screen on click:

```sh
cwebp -q 85 -sharp_yuv -resize 1600 0 shot.jpg -o 1-shot.webp
```

## Card covers

Each project's card on the Projects page shows the photo named by `cover:` on
its entry in `src/pages/Projects.tsx`, cropped to 4:3. A project without one
shows its name (or course code) set large instead.

A project with a GIF in its folder also gets `animated:`, a small looping
`card-preview.webp` made from the GIF, with `card-still.webp` (its first frame)
as the cover for visitors who ask for reduced motion:

```sh
ffmpeg -t 6 -i clip.gif -vf "fps=12,scale=-2:480" -c:v libwebp_anim -loop 0 -quality 60 card-preview.webp
ffmpeg -i clip.gif -vf "scale=-2:480" -frames:v 1 -quality 80 card-still.webp
```
