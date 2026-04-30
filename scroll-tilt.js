// ==========================================
// SCROLL-TILT: Smooth 3D Card Animation
// Vanilla JS — requestAnimationFrame + lerp
// ==========================================

(function () {
    "use strict";

    const container = document.querySelector(".scroll-container");
    if (!container) return;

    const header = container.querySelector(".scroll-header");
    const cardFrame = container.querySelector(".scroll-card-frame");
    if (!header || !cardFrame) return;

    // ── Config ──
    const ROTATE_START = 20;
    const ROTATE_END = 0;
    const SCALE_DESKTOP = [1.05, 1];
    const SCALE_MOBILE  = [0.75, 0.95];
    const TRANSLATE_END = -100;

    // ── Smoothed state ──
    let currentRotate   = ROTATE_START;
    let currentScale    = SCALE_DESKTOP[0];
    let currentTranslate = 0;
    let targetRotate    = ROTATE_START;
    let targetScale     = SCALE_DESKTOP[0];
    let targetTranslate = 0;

    const SMOOTHING = 0.08; // lower = smoother (0.05–0.12 sweet spot)

    function isMobile() {
        return window.innerWidth <= 768;
    }

    function lerp(a, b, t) {
        return a + (b - a) * t;
    }

    function clamp(val, min, max) {
        return Math.min(Math.max(val, min), max);
    }

    function getScrollProgress() {
        const rect = container.getBoundingClientRect();
        const windowH = window.innerHeight;
        const totalTravel = rect.height + windowH;
        const scrolled = windowH - rect.top;
        return clamp(scrolled / totalTravel, 0, 1);
    }

    function computeTargets() {
        const raw = getScrollProgress();

        // Smooth ease-in-out curve
        const t = raw < 0.5
            ? 2 * raw * raw
            : 1 - Math.pow(-2 * raw + 2, 2) / 2;

        targetRotate = lerp(ROTATE_START, ROTATE_END, t);

        const mobile = isMobile();
        const [sStart, sEnd] = mobile ? SCALE_MOBILE : SCALE_DESKTOP;
        targetScale = lerp(sStart, sEnd, t);

        targetTranslate = lerp(0, TRANSLATE_END, t);
    }

    function animate() {
        // Lerp current toward target for buttery smoothness
        currentRotate    = lerp(currentRotate, targetRotate, SMOOTHING);
        currentScale     = lerp(currentScale, targetScale, SMOOTHING);
        currentTranslate = lerp(currentTranslate, targetTranslate, SMOOTHING);

        // Snap to avoid sub-pixel jitter
        const r = Math.round(currentRotate * 100) / 100;
        const s = Math.round(currentScale * 1000) / 1000;
        const ty = Math.round(currentTranslate * 10) / 10;

        cardFrame.style.transform = `rotateX(${r}deg) scale(${s})`;
        header.style.transform = `translateY(${ty}px)`;

        requestAnimationFrame(animate);
    }

    // Recompute targets on scroll
    window.addEventListener("scroll", computeTargets, { passive: true });
    window.addEventListener("resize", computeTargets, { passive: true });

    // Initial compute + start animation loop
    computeTargets();
    animate();
})();
