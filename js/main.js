/* Peek — hovering (or tapping) the words car / sail / books fills the screen
   with the matching clip. Progressive enhancement: without this file the page
   is complete, the media is simply never shown.

   Replaces the old jQuery version, which set a background-image on hover with
   no prefetch, so the first hover showed nothing until the multi-megabyte GIF
   had arrived — and which did nothing at all on a phone, where there is no
   hover and the words were fake links. */
(() => {
    'use strict';

    const stage = document.querySelector('.peek-stage');
    const triggers = document.querySelectorAll('[data-peek]');
    if (!stage || !triggers.length) return;

    const layers = new Map();
    for (const video of stage.querySelectorAll('[data-media]')) layers.set(video.dataset.media, video);

    const html = document.documentElement;
    let shown = null;   // name of the layer currently on screen
    let pending = 0;    // bumped to abandon a load that a newer hover replaced
    let unhover;        // pending hide, cancelled when the pointer moves to another word

    /* Resolves true once the video has a frame it can paint. */
    function ready(video) {
        if (video.readyState >= 2 && !video.seeking) return Promise.resolve(true);

        return new Promise((resolve) => {
            let timer;
            const settle = (ok) => {
                clearTimeout(timer);
                video.removeEventListener('loadeddata', onReady);
                video.removeEventListener('seeked', onReady);
                video.removeEventListener('error', onError);
                resolve(ok);
            };
            const onReady = () => settle(true);
            const onError = () => settle(false);
            // loadeddata for the first frame of a cold fetch; seeked for the
            // restart below. Both drop readyState below HAVE_CURRENT_DATA, and
            // loadeddata never fires a second time for media that is already
            // buffered — waiting on it alone left every re-hover playing
            // invisibly until the timeout.
            video.addEventListener('loadeddata', onReady);
            video.addEventListener('seeked', onReady);
            video.addEventListener('error', onError);
            // A stalled fetch must not leave the page sitting behind the scrim.
            timer = setTimeout(() => settle(false), 10000);
        });
    }

    async function show(name) {
        const video = layers.get(name);
        if (!video || shown === name) return;

        const token = ++pending;
        const previous = shown ? layers.get(shown) : null;
        shown = name;
        // Dim the page and invert the text on the same frame as the hover/tap.
        // The fade-in below waits for a decodable frame, which on a cold cache
        // is not instant — silence there reads as "nothing happened", which is
        // how the old version behaved on touch.
        html.classList.add('peeking');

        // play() is what starts the fetch, and muted + playsinline means nothing
        // can refuse it. It is also what nudges iOS, which treats preload as a
        // hint and otherwise sits on metadata forever.
        if (video.currentTime > 0) video.currentTime = 0;
        video.play().catch(() => {});

        const ok = await ready(video);
        if (token !== pending) {                       // a different word won the race
            if (shown !== name) video.pause();
            return;
        }
        if (!ok) { hide(); return; }

        video.classList.add('is-visible');  // fade the new layer in before dropping
        if (previous) {
            previous.classList.remove('is-visible');   // the old one: crossfade
            previous.pause();
        }
    }

    function hide() {
        pending++;
        shown = null;
        for (const video of layers.values()) {
            video.classList.remove('is-visible');
            video.pause();               // stop decoding offscreen
        }
        html.classList.remove('peeking');
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

        // Touch has no hover state, so a tap toggles the clip on and off.
        el.addEventListener('click', (event) => {
            if (event.pointerType === 'mouse') return;
            if (shown === name) hide();
            else show(name);
        });
    }

    document.addEventListener('pointerdown', (event) => {
        if (!event.target.closest('[data-peek]')) hide();
    });
})();
