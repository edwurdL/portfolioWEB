# Project photos

One folder per project, named by the argument to `photosFor(...)` on that project's entry in `src/pages/Projects.tsx`.

Drop up to **two** images (`.png`, `.jpg`, `.jpeg`, `.webp`, `.avif`, `.svg`) into a
folder and they appear in that project's detail modal, ordered by filename — so
prefix them `1-`, `2-` to control which comes first. Extra files past the first
two are ignored (the dev server logs a warning).

Prefer **WebP, about 800px wide** — the modal renders each photo in a 16:9 tile
roughly 300px across, so 800px covers retina without making the browser
downscale from something huge (which is what makes edges look ragged):

```sh
cwebp -q 85 -sharp_yuv -resize 800 0 shot.jpg -o 1-shot.webp
```

A folder with no images renders nothing at all: no photo grid, no placeholder.
