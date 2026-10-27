// Page-side, for the scripts the card tools inject: `whenSettled(then)` calls `then` once the page
// has stopped changing. Built is not settled: a component that MEASURES writes its result later -
// Table's sticky scrollbar pins `.scroll-wrap` to a computed height, a chart draws at a fallback
// width until its ResizeObserver reports. Fonts first, because a measure taken against the fallback
// face is the wrong number. Quiet is counted in FRAMES as well as in time, because ResizeObserver
// and IntersectionObserver deliver only in a frame; 300 frames is the cap.
export const WHEN_SETTLED = `
function whenSettled(then) {
  document.fonts.ready.then(function () {
    var frames = 0;
    var total = 0;
    var lastChange = performance.now();
    var observer = new MutationObserver(function () {
      frames = 0;
      lastChange = performance.now();
    });
    observer.observe(document.body, { subtree: true, childList: true, attributes: true, characterData: true });
    (function frame() {
      frames += 1;
      total += 1;
      if ((frames < 3 || performance.now() - lastChange < 150) && total < 300) {
        return requestAnimationFrame(frame);
      }
      observer.disconnect();
      then();
    })();
  });
}`;

/** A read expression for `render`: resolves with `read` once `done` holds, or after 30 s, so a
 *  page that never settles comes back as whatever it got to. Both are page-side expressions. */
export const readWhen = (done, read) => `new Promise(function (resolve) {
  var t0 = Date.now();
  (function wait() {
    if (${done} || Date.now() - t0 > 30000) return resolve(${read});
    setTimeout(wait, 25);
  })();
})`;
