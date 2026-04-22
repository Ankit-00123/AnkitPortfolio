// ============================================
// PROJECTS — Video hover play/pause
// Related: Sections/projects.css
// ============================================

const video1 = document.getElementById('projectVideo1');
const video2 = document.getElementById('projectVideo2');
const video3 = document.getElementById('projectVideo3');

const hoverSign = document.querySelector('.hover-sign');

const videoList = [video1, video2, video3];

videoList.forEach(function (video) {
    video.addEventListener('mouseover', function () {
        video.play();
        hoverSign.classList.add('active');
    });
    video.addEventListener('mouseout', function () {
        video.pause();
        hoverSign.classList.remove('active');
    });
});


// ============================================
// SIDEBAR — Mobile nav open / close
// Related: Sections/sidebar.css
// ============================================

const sideBar = document.querySelector('.sidebar');
const menu = document.querySelector('.menu-icon');
const closeIcon = document.querySelector('.close-icon');

menu.addEventListener('click', function () {
    sideBar.classList.remove('close-sidebar');
    sideBar.classList.add('open-sidebar');
});

closeIcon.addEventListener('click', function () {
    sideBar.classList.remove('open-sidebar');
    sideBar.classList.add('close-sidebar');
});

// ============================================
// TEXT PRESSURE — Mouse-reactive variable font
// Related: Sections/hero.css
// ============================================
(function () {
    var container = document.getElementById('textPressureContainer');
    var title = document.getElementById('textPressureTitle');
    if (!container || !title) return;

    var text = 'I am Ankit';
    var accentWord = 'Ankit';
    var accentStart = text.indexOf(accentWord);
    var accentEnd = accentStart + accentWord.length;

    // Split text into individual character spans
    var spans = [];
    for (var i = 0; i < text.length; i++) {
        var ch = text[i];
        if (ch === ' ') {
            var space = document.createElement('span');
            space.className = 'tp-char tp-space';
            space.textContent = '\u00A0';
            title.appendChild(space);
            spans.push(space);
        } else {
            var span = document.createElement('span');
            span.className = 'tp-char';
            span.textContent = ch;
            span.setAttribute('data-char', ch);
            // Apply gradient accent to "Ankit" characters
            if (i >= accentStart && i < accentEnd) {
                span.classList.add('tp-accent');
            }
            title.appendChild(span);
            spans.push(span);
        }
    }

    // Mouse tracking with smooth lerp
    var mouse = { x: 0, y: 0 };
    var cursor = { x: 0, y: 0 };

    // Initialize to center of container
    var rect = container.getBoundingClientRect();
    mouse.x = rect.left + rect.width / 2;
    mouse.y = rect.top + rect.height / 2;
    cursor.x = mouse.x;
    cursor.y = mouse.y;

    window.addEventListener('mousemove', function (e) {
        cursor.x = e.clientX;
        cursor.y = e.clientY;
    });
    window.addEventListener('touchmove', function (e) {
        cursor.x = e.touches[0].clientX;
        cursor.y = e.touches[0].clientY;
    }, { passive: true });

    function dist(a, b) {
        var dx = b.x - a.x;
        var dy = b.y - a.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    function getAttr(distance, maxDist, minVal, maxVal) {
        var val = maxVal - Math.abs((maxVal * distance) / maxDist);
        return Math.max(minVal, val + minVal);
    }

    // Animation loop
    function animate() {
        mouse.x += (cursor.x - mouse.x) / 15;
        mouse.y += (cursor.y - mouse.y) / 15;

        var titleRect = title.getBoundingClientRect();
        var maxDist = titleRect.width / 2;

        for (var i = 0; i < spans.length; i++) {
            var span = spans[i];
            var r = span.getBoundingClientRect();
            var charCenter = {
                x: r.x + r.width / 2,
                y: r.y + r.height / 2
            };
            var d = dist(mouse, charCenter);

            var wdth = Math.floor(getAttr(d, maxDist, 20, 200));
            var wght = Math.floor(getAttr(d, maxDist, 300, 900)); // Increased base boldness from 100 to 300
            var ital = getAttr(d, maxDist, 0, 1).toFixed(2);

            var fvs = "'wght' " + wght + ", 'wdth' " + wdth + ", 'ital' " + ital;
            if (span.style.fontVariationSettings !== fvs) {
                span.style.fontVariationSettings = fvs;
            }
        }

        requestAnimationFrame(animate);
    }
    animate();
})();


// ============================================
// TYPEWRITER — Cycling role descriptions
// Related: Sections/hero.css
// ============================================
(function () {
    var textEl = document.getElementById('typewriterText');
    if (!textEl) return;

    var phrases = [
        'GST & TDS Compliance Expert',
        'Excel & Python Automation',
        'Payroll & Tax Audit Specialist',
        'Custom Tax Software Builder'
    ];

    var phraseIndex = 0;
    var charIndex = 0;
    var isDeleting = false;
    var typingSpeed = 75;
    var deletingSpeed = 40;
    var pauseDuration = 1800;

    function tick() {
        var currentPhrase = phrases[phraseIndex];
        var displayed;

        if (isDeleting) {
            charIndex--;
            displayed = currentPhrase.substring(0, charIndex);
            textEl.textContent = displayed;

            if (charIndex === 0) {
                isDeleting = false;
                phraseIndex = (phraseIndex + 1) % phrases.length;
                setTimeout(tick, 400);
                return;
            }
            // Variable speed when deleting: faster in middle, slight pause at ends
            var delSpeed = deletingSpeed + Math.random() * 20;
            setTimeout(tick, delSpeed);
        } else {
            charIndex++;
            displayed = currentPhrase.substring(0, charIndex);
            textEl.textContent = displayed;

            if (charIndex === currentPhrase.length) {
                isDeleting = true;
                setTimeout(tick, pauseDuration);
                return;
            }
            // Variable speed when typing: occasional slight pause
            var typeSpeed = typingSpeed + Math.random() * 40;
            setTimeout(tick, typeSpeed);
        }
    }

    // Start after a short delay
    setTimeout(tick, 600);
})();


// ============================================
// 3D TILT CARD ENGINE — Interactive cards
// Related: Sections/about.css
// ============================================
/*
  PRESS & HOLD ANIMATION — how it works:
  ────────────────────────────────────────
  Each card maintains two values lerped every frame:
    currentScale  → lerps toward targetScale
    currentRx/Ry  → lerps toward targetRx/Ry (tilt)

  On mousedown  : targetScale = SCALE_PRESSED (1.16)
                  .is-pressing class added → CSS ripple expands,
                  hold-ring SVG circle strokes in over 0.65s
  On mouseup    : targetScale = SCALE_HOVER (1.03) or 1.0
                  .is-pressing removed → ripple fades (release-ripple)
                  spring cubic-bezier overshoots for bouncy settle

  Scale lerp speed:
    pressing = 0.09  (ramps up fast)
    releasing = 0.06 (settles slower, feels springy)
*/

(function () {
    const MAX_TILT        = 18;
    const SCALE_IDLE      = 1.00;
    const SCALE_HOVER     = 1.03;
    const SCALE_PRESSED   = 1.16;   // vertical scale on press (top/bottom — keep as-is)
    const SCALE_PRESSED_X = 1.40;   // horizontal scale on press (left/right — expanded more)

    function lerp(a, b, t) { return a + (b - a) * t; }

    document.querySelectorAll('.tilt-scene').forEach(function (scene) {
        var card     = scene.querySelector('.tilt-card');
        var glowHex  = scene.dataset.glow || '#6c63ff';
        card.style.setProperty('--glow', glowHex + '99');

        var raf           = null;
        var targetRx      = 0, targetRy     = 0;
        var currentRx     = 0, currentRy    = 0;
        var currentScale  = 1, targetScale  = 1;
        var currentScaleX = 1, targetScaleX = 1;   // ← separate horizontal scale
        var hovering      = false;
        var pressing      = false;
        var idleT        = Math.random() * Math.PI * 2;
        var idleRunning  = false;

        /* ── unified render tick ── */
        function tick() {
            var sp = pressing ? 0.09 : 0.06;
            currentScale  = lerp(currentScale,  targetScale,  sp);
            currentScaleX = lerp(currentScaleX, targetScaleX, sp);   // ← horizontal lerp
            currentRx     = lerp(currentRx, targetRx, 0.12);
            currentRy     = lerp(currentRy, targetRy, 0.12);

            card.style.transform =
                'rotateX(' + currentRx + 'deg) rotateY(' + currentRy + 'deg) scale3d(' +
                currentScaleX + ',' + currentScale + ',' + currentScale + ')';  // ← asymmetric

            var moving =
                Math.abs(currentScale  - targetScale)  > 0.0005 ||
                Math.abs(currentScaleX - targetScaleX) > 0.0005 ||   // ← include X
                Math.abs(currentRx     - targetRx)     > 0.01   ||
                Math.abs(currentRy     - targetRy)     > 0.01;

            if (moving) {
                raf = requestAnimationFrame(tick);
            } else {
                raf = null;
                if (!hovering && !pressing) startIdle();
            }
        }

        function kickTick() { if (!raf) raf = requestAnimationFrame(tick); }

        /* ── idle sway (only when nothing else is going on) ── */
        function startIdle() {
            if (idleRunning) return;
            idleRunning = true;
            (function sway() {
                if (hovering || pressing) { idleRunning = false; return; }
                idleT += 0.005;
                var s = Math.sin(idleT) * 1.1;
                card.style.transform =
                    'rotateX(' + (s * 0.45) + 'deg) rotateY(' + s + 'deg) scale3d(1,1,1)';
                requestAnimationFrame(sway);
            })();
        }
        startIdle();

        /* ── HOVER: mousemove → tilt ── */
        scene.addEventListener('mousemove', function (e) {
            hovering = true;
            var r  = card.getBoundingClientRect();
            var nx = Math.max(-1, Math.min(1, (e.clientX - r.left - r.width / 2) / (r.width / 2)));
            var ny = Math.max(-1, Math.min(1, (e.clientY - r.top  - r.height / 2) / (r.height / 2)));
            targetRy =  nx * MAX_TILT;
            targetRx = -ny * MAX_TILT;
            card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
            card.style.setProperty('--my', ((e.clientY - r.top)  / r.height * 100) + '%');
            if (!pressing) { targetScale = SCALE_HOVER; targetScaleX = SCALE_HOVER; }
            kickTick();
        });

        /* ── LEAVE: reset everything ── */
        scene.addEventListener('mouseleave', function () {
            hovering = false;
            pressing = false;
            targetRx = 0;
            targetRy = 0;
            targetScale  = SCALE_IDLE;
            targetScaleX = SCALE_IDLE;
            card.classList.remove('is-pressing', 'release-ripple');
            scene.classList.remove('pressing');
            card.style.setProperty('--mx', '50%');
            card.style.setProperty('--my', '50%');
            kickTick();
        });

        /* ── PRESS: mousedown / touchstart ── */
        function onPress(e) {
            pressing = true;
            targetScale  = SCALE_PRESSED;
            targetScaleX = SCALE_PRESSED_X;
            card.classList.add('is-pressing');
            card.classList.remove('release-ripple');
            scene.classList.add('pressing');

            /* position ripple & ring at press point */
            var r  = card.getBoundingClientRect();
            var cx = e.touches ? e.touches[0].clientX : e.clientX;
            var cy = e.touches ? e.touches[0].clientY : e.clientY;
            card.style.setProperty('--rx', ((cx - r.left) / r.width * 100) + '%');
            card.style.setProperty('--ry', ((cy - r.top)  / r.height * 100) + '%');

            kickTick();
        }

        /* ── RELEASE: mouseup / touchend → spring back ── */
        function onRelease() {
            if (!pressing) return;
            pressing = false;
            targetScale  = hovering ? SCALE_HOVER : SCALE_IDLE;
            targetScaleX = hovering ? SCALE_HOVER : SCALE_IDLE;
            card.classList.remove('is-pressing');
            scene.classList.remove('pressing');
            /* trigger CSS ripple fade */
            card.classList.add('release-ripple');
            setTimeout(function () { card.classList.remove('release-ripple'); }, 500);
            kickTick();
        }

        scene.addEventListener('mousedown',  onPress);
        scene.addEventListener('touchstart', onPress, { passive: true });
        window.addEventListener('mouseup',   onRelease);
        window.addEventListener('touchend',  onRelease);
    });


    // ============================================
    // TILT CARDS — Stagger reveal on scroll
    // ============================================

    var tiltObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                var scene = entry.target;
                var idx = Array.prototype.indexOf.call(
                    document.querySelectorAll('.tilt-scene'), scene
                );
                var delay = idx * 0.12 + 0.15;
                scene.style.transitionDelay = delay + 's';
                scene.classList.add('tilt-revealed');
                tiltObserver.unobserve(scene);
            }
        });
    }, { threshold: 0.15 });

    document.querySelectorAll('.tilt-scene').forEach(function (scene) {
        tiltObserver.observe(scene);
    });
})();


// ============================================
// AMBIENT SPACE AUDIO — Floating Toggle
// Related: Sections/audio.css
// ============================================

(function () {
    const audio = document.getElementById('mainAudio');
    const toggleBtn = document.getElementById('floatingAudioBtn');
    const audioIcon = document.getElementById('audioIcon');

    if (!audio || !toggleBtn || !audioIcon) return;

    // Optional: Lower ambient volume
    audio.volume = 0.5;

    let isPlaying = false;

    function toggleAudio() {
        if (isPlaying) {
            audio.pause();
            audioIcon.className = "bx bx-volume-mute";
            toggleBtn.classList.remove('is-playing');
        } else {
            // Because autoplay is often blocked, calling play() on click is best.
            audio.play().catch(e => console.log("Audio play failed:", e));
            audioIcon.className = "bx bx-volume-full";
            toggleBtn.classList.add('is-playing');
        }
        isPlaying = !isPlaying;
    }

    toggleBtn.addEventListener('click', toggleAudio);

})();


// ============================================
// CAREER JOURNEY — Scroll-reveal, counters, live feed
// Related: Sections/journey.css
// ============================================

(function () {

    // ---- Scroll-reveal: Timeline stages, KPI cards, panels ----
    var journeyObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                journeyObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('[data-journey-stage], [data-journey-kpi], [data-journey-panel]').forEach(function (el) {
        journeyObserver.observe(el);
    });


    // ---- Animated Counters ----
    var counterStarted = {};
    var counterObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            var el = entry.target;
            var id = el.getAttribute('data-target');
            if (counterStarted[id]) return;
            counterStarted[id] = true;

            var target = parseInt(id, 10);
            var duration = 2000;
            var startTime = null;

            function animateCounter(timestamp) {
                if (!startTime) startTime = timestamp;
                var elapsed = timestamp - startTime;
                var progress = Math.min(elapsed / duration, 1);
                // Ease-out cubic
                var eased = 1 - Math.pow(1 - progress, 3);
                var current = Math.round(target * eased);
                el.textContent = current.toLocaleString();
                if (progress < 1) {
                    requestAnimationFrame(animateCounter);
                }
            }
            requestAnimationFrame(animateCounter);
            counterObserver.unobserve(el);
        });
    }, { threshold: 0.3 });

    document.querySelectorAll('.journey-counter').forEach(function (el) {
        counterObserver.observe(el);
    });


    // ---- Live Log Feed ----
    var logFeed = document.getElementById('journeyLogFeed');
    if (logFeed) {
        var logMessages = [
            { text: 'Invoice #INV-4521 processed via OCR', type: 'success', icon: '✓' },
            { text: 'TDS calculation completed for Q4', type: 'process', icon: '⚡' },
            { text: 'GSTR-3B auto-filed for March 2026', type: 'success', icon: '✓' },
            { text: 'Payroll batch processing 248 employees', type: 'process', icon: '⚡' },
            { text: 'AI model detected anomaly in ledger entry', type: 'info', icon: '→' },
            { text: 'Tax audit report generated automatically', type: 'success', icon: '✓' },
            { text: 'Reconciliation matched 99.7% entries', type: 'success', icon: '✓' },
            { text: 'GST notice response drafted by AI', type: 'process', icon: '⚡' },
            { text: 'MIS dashboard data refreshed', type: 'info', icon: '→' },
            { text: 'Expense categorization ML model updated', type: 'process', icon: '⚡' },
        ];

        var logIndex = 0;
        var logVisible = false;

        // Only start cycling when panel is visible
        var logPanelObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting && !logVisible) {
                    logVisible = true;
                    startLogCycle();
                }
            });
        }, { threshold: 0.2 });

        logPanelObserver.observe(logFeed.closest('.journey-panel') || logFeed);

        function startLogCycle() {
            setInterval(function () {
                var msg = logMessages[logIndex % logMessages.length];
                var now = new Date().toLocaleTimeString();
                var line = document.createElement('div');
                line.className = 'journey-log-line log-' + msg.type;
                line.innerHTML = '<span class="log-time">' + now + '</span><span class="log-icon">' + msg.icon + '</span> ' + msg.text;
                logFeed.appendChild(line);

                // Keep max 7 lines
                while (logFeed.children.length > 7) {
                    logFeed.removeChild(logFeed.firstChild);
                }

                logIndex++;
            }, 2200);
        }
    }


    // ---- Animated Bar Chart ----
    var barsContainer = document.getElementById('journeyBars');
    if (barsContainer) {
        var barElements = barsContainer.querySelectorAll('.journey-bar');
        var barHeights = [40, 65, 50, 80, 55, 70, 45, 75];
        var barIntervalId = null;

        function applyBarHeights() {
            barElements.forEach(function (bar, i) {
                bar.style.height = barHeights[i] + '%';
            });
        }

        function updateBars() {
            barHeights = barHeights.map(function (h) {
                var delta = (Math.random() - 0.5) * 22;
                return Math.max(12, Math.min(96, h + delta));
            });
            applyBarHeights();
        }

        // Apply initial heights right away so bars are visible on page load
        applyBarHeights();

        // Start live updates only when the bar chart is visible
        var barObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting && !barIntervalId) {
                    // Immediately show current values
                    applyBarHeights();
                    // Then update on interval
                    barIntervalId = setInterval(updateBars, 1600);
                } else if (!entry.isIntersecting && barIntervalId) {
                    clearInterval(barIntervalId);
                    barIntervalId = null;
                }
            });
        }, { threshold: 0.1 });

        barObserver.observe(barsContainer);
    }

})();

// ============================================
// AUDIO — Background Music Loop Logic
// ============================================
const audioBtn = document.getElementById('floatingAudioBtn');
const mainAudio = document.getElementById('mainAudio');

if (audioBtn && mainAudio) {
    // Toggling relies firmly on the audio's paused state
    audioBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // prevent body click from interacting
        if (mainAudio.paused) {
            mainAudio.play().catch(() => {});
        } else {
            mainAudio.pause();
        }
    });

    // Keep UI totally in sync automatically
    mainAudio.addEventListener('play', () => {
        audioBtn.classList.add('is-playing');
        if (mainAudio.currentTime < 12) {
            mainAudio.currentTime = 12;
        }
    });

    mainAudio.addEventListener('pause', () => {
        audioBtn.classList.remove('is-playing');
    });

    // Custom loop constraint: Play between 12s and 60s (1.00m)
    mainAudio.addEventListener('timeupdate', () => {
        if (mainAudio.currentTime >= 60) {
            mainAudio.currentTime = 12;
            mainAudio.play().catch(() => {});
        }
    });

    // 1-Click Browser Bypass: Autoplay is blocked globally by Chrome/Safari
    // We launch it smoothly the moment the user clicks anywhere on the site
    const startAudio = () => {
        if (mainAudio.paused) {
            mainAudio.play().then(() => {
                document.removeEventListener('click', startAudio);
                document.removeEventListener('touchstart', startAudio);
            }).catch(() => {});
        }
    };
    
    document.addEventListener('click', startAudio);
    document.addEventListener('touchstart', startAudio);
}
