/* Peek — hovering (or tapping) the words car / sail / books fills the screen
   with the matching image. Progressive enhancement: without this file the
   page is complete, the images are simply never shown.

   Replaces the old jQuery version, which set a background-image per hover
   without ever preloading it, so the first hover showed nothing until the
   multi-megabyte GIF had downloaded. */
(() => {
    'use strict';

    const stage = document.querySelector('.peek-stage');
    const triggers = document.querySelectorAll('[data-peek]');
    if (!stage || !triggers.length) return;

    const layers = new Map();
    for (const img of stage.querySelectorAll('[data-media]')) layers.set(img.dataset.media, img);

    const root = document.documentElement;
    const canHover = matchMedia('(hover: hover) and (pointer: fine)');
    let shown = null;   // name of the layer currently on screen
    let pending = 0;    // bumped to abandon a load that a newer hover replaced
    let unhover;        // pending hide, cancelled when the pointer moves to another word

    function load(img) {
        if (!img.src) img.src = img.dataset.src;
        return img.decode ? img.decode().then(() => true, () => false) : Promise.resolve(true);
    }

    async function show(name) {
        const img = layers.get(name);
        if (!img || shown === name) return;

        const token = ++pending;
        const previous = shown ? layers.get(shown) : null;
        shown = name;
        // Dim the page and invert the text on the same frame as the hover/tap.
        // The fade-in below only starts once the image is decodable, which on a
        // cold phone cache can take seconds — silence there reads as "the tap
        // did nothing", which is how the old jQuery version behaved everywhere.
        root.classList.add('peeking');

        if (!await load(img)) { hide(); return; }
        if (token !== pending) return;   // a different word won the race

        img.classList.add('is-visible'); // fade in the new layer before dropping
        if (previous) previous.classList.remove('is-visible');   // the old one: crossfade

        // Touch devices get no idle prefetch, so spend the bandwidth only once
        // the user has actually asked for a picture: the next tap is instant.
        if (!canHover.matches) {
            for (const [other, layer] of layers) if (other !== name) load(layer);
        }
    }

    function hide() {
        pending++;
        shown = null;
        for (const img of layers.values()) img.classList.remove('is-visible');
        root.classList.remove('peeking');
    }

    for (const el of triggers) {
        const name = el.dataset.peek;

        el.addEventListener('pointerenter', (event) => {
            if (event.pointerType !== 'mouse') return;
            clearTimeout(unhover);
            show(name);
        });

        el.addEventListener('pointerleave', (event) => {
            if (event.pointerType !== 'mouse') return;
            clearTimeout(unhover);
            unhover = setTimeout(hide, 0);
        });

        // Touch has no hover state, so a tap toggles the image on and off.
        el.addEventListener('click', (event) => {
            if (event.pointerType === 'mouse') return;
            if (shown === name) hide();
            else show(name);
        });
    }

    document.addEventListener('pointerdown', (event) => {
        if (!event.target.closest('[data-peek]')) hide();
    });

    // Warm the cache once the page is idle so the first hover is instant. Skipped
    // on touch-only devices and for visitors who asked to save data.
    (window.requestIdleCallback || ((fn) => setTimeout(fn, 200)))(() => {
        if (!canHover.matches || navigator.connection?.saveData) return;
        for (const img of layers.values()) load(img);
    }, { timeout: 2000 });
})();
