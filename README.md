# lovro.oreskovic.me

Personal landing page for Lovro Orešković — <https://lovro.oreskovic.me>.

Static HTML, CSS and JavaScript served straight from the repo root by GitHub
Pages. **No build step:** edit the files and push. (The Ruby Sass + Bourbon
sources this page used to be generated from were removed with the modernisation —
Ruby Sass itself is end-of-life, and nothing in the stylesheet needed a
preprocessor any more.)

## Files

| Path | What it is |
| --- | --- |
| `index.html` | The page. |
| `css/main.css` | All styling. Hand-written, custom properties, one fluid type scale. |
| `js/main.js` | The peek effect. ~120 lines, no dependencies. |
| `img/*.webm`, `img/*.mp4` | The clips revealed by the peek words, one pair each. |
| `img/*.gif` | Masters the clips were encoded from. Not served. |
| `img-social.png` | 1200×630 Open Graph / Twitter card. |
| `404.html` | GitHub Pages not-found page. |
| `.nojekyll` | Tells Pages to skip Jekyll and serve the files verbatim. |
| `images/books/` | Source photos that `img/books.gif` was built from. Not referenced by the page. |

## The peek effect

Hovering *car*, *sail* or *books* in the bio fills the screen with the matching
clip and inverts the text to white so it stays readable. On touch devices, where
there is no hover, a tap toggles it.

Each layer is a muted looping `<video>` drawn full-bleed with `object-fit: cover`,
so the clip is cropped to the window's shape. Nothing is fetched until a word is
hovered or tapped: warming all three up front spent 1.5 MB on every visitor who
never touched one, and playing a layer that had already been preloaded made the
media stack fetch the whole file a second time.

## Encoding

`img/*.gif` are the masters. These are 1–2 fps slideshows, not motion, so the
encoders are tuned for stills:

```sh
for g in miata sail books; do
  ffmpeg -i img/$g.gif -c:v libx264 -preset veryslow -tune stillimage -crf 22 \
         -pix_fmt yuv420p -movflags +faststart -an img/$g.mp4
  ffmpeg -i img/$g.gif -c:v libvpx-vp9 -crf 26 -b:v 0 -deadline good -cpu-used 1 \
         -row-mt 1 -pix_fmt yuv420p -an img/$g.webm
done
```

Totals: **1520 KB** of webm or **3292 KB** of mp4 for all three, against 6504 KB
for the GIFs, and only one clip is ever fetched per hover. crf 32 / vp9 36 — about
half those bytes — visibly smeared text, which is not worth the savings here.

`miata.gif`'s frame 1 used to declare a 640×480 sub-frame inside a 360×480 canvas,
which ffmpeg decodes as scanline garbage; the master was rebuilt from
ImageMagick's decode and its geometry is uniform now. If a clip ever looks wrong,
check for a frame whose size differs from the rest:

```sh
identify -format 'frame %s: %wx%h\n' img/NAME.gif
```

To add another one: encode a pair into `img/`, then add a layer:

```html
<video class="peek-stage__media" data-media="NAME" muted loop playsinline preload="none">
    <source src="img/NAME.webm" type="video/webm">
    <source src="img/NAME.mp4" type="video/mp4">
</video>
```

and mark the word in the bio as `<span class="peek" data-peek="NAME">word</span>`.

## Deploy

Push to `main`; Pages publishes the repo root and `CNAME` points it at
`lovro.oreskovic.me`. To preview locally:

```
python3 -m http.server 8099
```

## Credits

Design after [maxinetsang.com](http://maxinetsang.com/) by Maxine Tsang, via the
HTML5 Boilerplate + Bourbon starter by Christian Gimber (see `LICENSE`).
Typeface: [Poppins](https://fonts.google.com/specimen/Poppins) by Indian Type
Foundry.
