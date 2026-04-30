// ==========================================
// CONTACT FORM: Pendulum Bulb — Direct Follow
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    // ── DOM References ──
    const section       = document.getElementById("contact-section");
    const bulbAssembly  = document.getElementById("bulbAssembly");
    const wireLine      = document.getElementById("wireLine");      // SVG <line>
    const bulbGroup     = document.getElementById("bulbGroup");      // SVG <g>
    const lightText     = document.getElementById("lightText");

    const messageInput  = document.getElementById("contact-message");
    const errorMsg      = document.getElementById("contact-error");
    const sendBtn       = document.getElementById("send-msg-btn");
    const sendBtnText   = sendBtn ? sendBtn.querySelector("span") : null;
    const sendBtnIcon   = sendBtn ? sendBtn.querySelector("i") : null;

    const modal         = document.getElementById("contact-modal");
    const cancelBtn     = document.getElementById("modal-cancel-btn");
    const confirmBtn    = document.getElementById("modal-confirm-btn");

    let isOn      = false;
    let isSending = false;

    // ════════════════════════════════════════════
    //  PENDULUM — Direct XY follow, spring back
    // ════════════════════════════════════════════

    const WIRE_REST    = 80;   // base wire height px
    const MAX_X        = 120;  // max horizontal offset px
    const MAX_Y        = 100;  // max downward pull px
    const TOGGLE_DIST  = 40;   // min drag px to toggle
    const SPRING       = 0.10;
    const DAMP         = 0.82;

    let isDragging  = false;
    let isAnimating = false;
    let startX = 0, startY = 0;

    // Current position of bulb relative to rest
    let bx = 0, by = 0;   // actual rendered offset
    let vx = 0, vy = 0;   // velocities

    // Raw drag offset (before clamping)
    let dragX = 0, dragY = 0;

    function px(e) { return e.touches ? e.touches[0].clientX : e.clientX; }
    function py(e) { return e.touches ? e.touches[0].clientY : e.clientY; }
    function clamp(v, lo, hi) { return Math.min(Math.max(v, lo), hi); }

    // ── Render: update SVG wire endpoint + bulb group transform together ──
    // Wire x2/y2 == bulb translate == ALWAYS connected, no separate math
    function render() {
        if (wireLine) {
            wireLine.setAttribute("x2", bx);
            wireLine.setAttribute("y2", 80 + by);
        }
        if (bulbGroup) {
            bulbGroup.setAttribute("transform", `translate(${bx}, ${80 + by})`);
        }
        // Shift light cone
        const cone = section ? section.querySelector(".light-cone") : null;
        if (cone) cone.style.transform = `translateX(calc(-50% + ${bx * 0.6}px))`;
    }

    // ── Mouse/Touch down ──
    function onDown(e) {
        e.preventDefault();
        isAnimating = false;
        isDragging  = true;
        startX = px(e);
        startY = py(e);
        dragX = bx;  // start from current position if already offset
        dragY = by;

        document.addEventListener("mousemove", onMove, { passive: false });
        document.addEventListener("touchmove", onMove, { passive: false });
        document.addEventListener("mouseup",   onUp);
        document.addEventListener("touchend",  onUp);
    }

    // ── Move ──
    function onMove(e) {
        if (!isDragging) return;
        e.preventDefault();

        // Direct 1:1 follow — bulb goes exactly where pointer goes
        const rawX = dragX + (px(e) - startX);
        const rawY = dragY + (py(e) - startY);

        // Rubber-band on X edges
        bx = rawX > MAX_X  ? MAX_X  + (rawX - MAX_X)  * 0.25
           : rawX < -MAX_X ? -MAX_X + (rawX + MAX_X)  * 0.25
           : rawX;

        // Only allow downward stretch (no negative Y)
        const rawY_clamped = Math.max(0, rawY);
        by = rawY_clamped > MAX_Y ? MAX_Y + (rawY_clamped - MAX_Y) * 0.2 : rawY_clamped;

        render();
    }

    // ── Release ──
    function onUp() {
        if (!isDragging) return;
        isDragging = false;

        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("touchmove", onMove);
        document.removeEventListener("mouseup",   onUp);
        document.removeEventListener("touchend",  onUp);

        // Toggle if pulled far enough
        const dist = Math.sqrt(bx * bx + by * by);
        if (dist >= TOGGLE_DIST) {
            playSwitchSound();
            if (!isOn) {
                setTimeout(() => triggerFlicker(), 100);
                setTimeout(() => {
                    isOn = true;
                    section.classList.add("light-on");
                }, 400);
                setTimeout(() => { if (messageInput) messageInput.focus(); }, 1200);
            } else {
                isOn = false;
                section.classList.remove("light-on");
            }
        }

        // Give a kick velocity from release position then spring back
        vx = bx * 0.08;
        vy = by * 0.06;
        isAnimating = true;
        springLoop();
    }

    // ── Spring physics loop ──
    function springLoop() {
        if (!isAnimating) return;

        vx += -bx * SPRING;
        vx *= DAMP;
        bx += vx;

        vy += -by * SPRING;
        vy *= DAMP;
        by += vy;

        if (by < 0) { by = 0; vy = Math.abs(vy) * 0.15; }

        render();

        if (Math.abs(bx) < 0.08 && Math.abs(vx) < 0.05 &&
            Math.abs(by) < 0.05 && Math.abs(vy) < 0.03) {
            bx = 0; by = 0; vx = 0; vy = 0;
            render();
            isAnimating = false;
            return;
        }
        requestAnimationFrame(springLoop);
    }

    // ── Idle sway ──
    (function idleSway() {
        if (!bulbGroup) return;
        let t = Math.random() * Math.PI * 2;
        function tick() {
            if (!isDragging && !isAnimating) {
                t += 0.007;
                bx = Math.sin(t) * 2;
                render();
            }
            requestAnimationFrame(tick);
        }
        tick();
    })();

    // ── Attach to bulbGroup (inside SVG) ──
    if (bulbGroup) {
        bulbGroup.addEventListener("mousedown",  onDown);
        bulbGroup.addEventListener("touchstart", onDown, { passive: false });
        bulbGroup.style.cursor = "grab";
    }
    if (bulbAssembly) {
        bulbAssembly.style.userSelect       = "none";
        bulbAssembly.style.webkitUserSelect = "none";
        bulbAssembly.style.touchAction      = "none";
    }

    // Remove the CSS rotation transform-origin approach
    if (bulbAssembly) {
        bulbAssembly.style.transformOrigin = "top center";
    }


    // ════════════════════════════════════════════
    //  LIGHT FX
    // ════════════════════════════════════════════

    function triggerFlicker() {
        if (!bulbAssembly) return;
        bulbAssembly.classList.remove("flickering");
        void bulbAssembly.offsetWidth;
        bulbAssembly.classList.add("flickering");
        setTimeout(() => bulbAssembly.classList.remove("flickering"), 700);
    }

    function playSwitchSound() {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const o = ctx.createOscillator(), g = ctx.createGain();
            o.type = "square";
            o.frequency.setValueAtTime(1800, ctx.currentTime);
            o.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.03);
            g.gain.setValueAtTime(0.06, ctx.currentTime);
            g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
            o.connect(g).connect(ctx.destination);
            o.start(); o.stop(ctx.currentTime + 0.06);
            if (!isOn) {
                const h = ctx.createOscillator(), hg = ctx.createGain();
                h.type = "sine";
                h.frequency.setValueAtTime(120, ctx.currentTime + 0.05);
                hg.gain.setValueAtTime(0, ctx.currentTime);
                hg.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 0.15);
                hg.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
                h.connect(hg).connect(ctx.destination);
                h.start(ctx.currentTime + 0.05);
                h.stop(ctx.currentTime + 0.5);
            }
        } catch (e) {}
    }


    // ════════════════════════════════════════════
    //  FORM
    // ════════════════════════════════════════════

    function playSuccessSound() {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const o = ctx.createOscillator(), g = ctx.createGain();
            o.type = "sine";
            o.frequency.setValueAtTime(523.25, ctx.currentTime);
            o.frequency.exponentialRampToValueAtTime(1046.50, ctx.currentTime + 0.1);
            g.gain.setValueAtTime(0, ctx.currentTime);
            g.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
            g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
            o.connect(g).connect(ctx.destination);
            o.start(); o.stop(ctx.currentTime + 0.5);
        } catch (e) {}
    }

    function validateForm() {
        const msg = messageInput.value.trim();
        if (!msg) { showError("Please enter a message."); return false; }
        if (msg.length < 5) { showError("Message too short (min 5 chars)."); return false; }
        hideError(); return true;
    }
    function showError(msg) {
        errorMsg.textContent = msg; errorMsg.style.display = "block";
        [5, -5, 5, 0].forEach((v, i) =>
            setTimeout(() => errorMsg.style.transform = `translateX(${v}px)`, i * 50));
    }
    function hideError() { errorMsg.style.display = "none"; }

    if (sendBtn) sendBtn.addEventListener("click", () => {
        if (isSending) return;
        if (validateForm()) modal.classList.add("active");
    });
    if (cancelBtn) cancelBtn.addEventListener("click", () => modal.classList.remove("active"));
    if (confirmBtn) confirmBtn.addEventListener("click", () => {
        modal.classList.remove("active"); startSending();
    });
    if (modal) modal.addEventListener("click", e => {
        if (e.target === modal) modal.classList.remove("active");
    });

    function startSending() {
        isSending = true;
        sendBtn.classList.add("btn-loading");
        sendBtnText.textContent = "Opening Mail...";
        sendBtnIcon.className = "bx bx-loader-alt";
        const body = encodeURIComponent(messageInput.value.trim());
        window.location.href = `mailto:mr.ankit00789@gmail.com?subject=Message from Portfolio&body=${body}`;
        setTimeout(() => {
            isSending = false; playSuccessSound();
            sendBtn.classList.remove("btn-loading");
            sendBtn.classList.add("btn-success");
            sendBtnText.textContent = "Draft Ready to Send 🚀";
            sendBtnIcon.className = "bx bx-check-circle";
            messageInput.value = "";
            setTimeout(() => {
                sendBtn.classList.remove("btn-success");
                sendBtnText.textContent = "Send Message";
                sendBtnIcon.className = "bx bx-mail-send";
            }, 4000);
        }, 500);
    }
});
