# lovro.oreskovic.me

Personal landing page for Lovro Orešković — <https://lovro.oreskovic.me>.

Static HTML, CSS and JavaScript served straight from the repo root by GitHub
Pages. **No build step:** edit the files and push. (The Ruby Sass + Bourbon
sources this page used to be generated from were removed with the modernisation—
Ruby Sass itself is end-of-life, and nothing in the stylesheet needed a
preprocessor any more.)

## Files

| Path | What it is |
| --- | --- |
| `index.html` | The page. |
| `css/main.css` | All styling. Hand-written, custom properties, one fluid type scale. |
| `js/main.js` | The peek effect. ~70 lines, no dependencies. |
| `img/` | The full-bleed images revealed by the peek words. |
| `img-social.png` | 1200×630 Open Graph / Twitter card. |
| `404.html` | GitHub Pages not-found page. |
| `.nojekyll` | Tells Pages to skip Jekyll and serve the files verbatim. |
| `images/books/` | Source photos that `img/books.gif` was built from. Not referenced by the page. |

## The peek effect

Hovering *car*, *sail* or *books* in the bio fades the matching image in behind
the text and inverts the text to white so it stays readable. On touch devices,
where there is no hover, a tap toggles it. The images are prefetched once the
page is idle on pointer devices that have not asked to save data.

To add another one: drop the image in `img/`, add a layer to `.peek-stage`

```html
<img class="peek-stage__media" data-media="NAME" data-src="img/FILE" alt="" decoding="async">
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
