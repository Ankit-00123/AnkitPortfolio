// ==========================================
// CONTACT FORM: Mailto Integration
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    const messageInput = document.getElementById("contact-message");
    const errorMsg = document.getElementById("contact-error");
    const sendBtn = document.getElementById("send-msg-btn");
    const sendBtnText = sendBtn.querySelector("span");
    const sendBtnIcon = sendBtn.querySelector("i");
    
    const modal = document.getElementById("contact-modal");
    const cancelBtn = document.getElementById("modal-cancel-btn");
    const confirmBtn = document.getElementById("modal-confirm-btn");

    let isSending = false;

    // --- Audio Synthesis for Success Ding ---
    function playSuccessSound() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            const audioCtx = new AudioContext();
            
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
            oscillator.frequency.exponentialRampToValueAtTime(1046.50, audioCtx.currentTime + 0.1); // C6
            
            gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
            
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            
            oscillator.start(audioCtx.currentTime);
            oscillator.stop(audioCtx.currentTime + 0.5);
        } catch(e) {
            console.log("Audio not supported or blocked");
        }
    }

    // --- Validation Logic ---
    function validateForm() {
        const message = messageInput.value.trim();
        
        if (!message) {
            showError("Please enter a message to send.");
            return false;
        }
        
        if(message.length < 5) {
            showError("Message must be at least 5 characters long.");
            return false;
        }

        hideError();
        return true;
    }

    function showError(msg) {
        errorMsg.textContent = msg;
        errorMsg.style.display = "block";
        // Shake effect
        errorMsg.style.transform = "translateX(5px)";
        setTimeout(() => errorMsg.style.transform = "translateX(-5px)", 50);
        setTimeout(() => errorMsg.style.transform = "translateX(5px)", 100);
        setTimeout(() => errorMsg.style.transform = "translateX(0)", 150);
    }

    function hideError() {
        errorMsg.style.display = "none";
    }

    // --- Main Button Click ---
    sendBtn.addEventListener("click", () => {
        if (isSending) return;
        
        if (validateForm()) {
            modal.classList.add("active");
        }
    });

    // --- Modal Cancel ---
    cancelBtn.addEventListener("click", () => {
        modal.classList.remove("active");
    });

    // --- Modal Confirm (Send Action) ---
    confirmBtn.addEventListener("click", () => {
        modal.classList.remove("active");
        startSendingProcess();
    });

    // --- Close Modal gracefully if clicked outside content ---
    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.classList.remove("active");
        }
    });

    function startSendingProcess() {
        isSending = true;
        
        // UI Change to Loading State
        sendBtn.classList.add("btn-loading");
        sendBtnText.textContent = "Opening Mail...";
        sendBtnIcon.className = "bx bx-loader-alt"; 

        const messageBody = encodeURIComponent(messageInput.value.trim());

        // Open Mail Client
        window.location.href = `mailto:mr.ankit00789@gmail.com?subject=Message from Portfolio&body=${messageBody}`;

        // Set to success state instantly since we just redirected
        setTimeout(handleSuccess, 500);
    }

    function handleSuccess() {
        isSending = false;
        
        // Play success sound
        playSuccessSound();

        // UI Change to Success State
        sendBtn.classList.remove("btn-loading");
        sendBtn.classList.add("btn-success");
        sendBtnText.textContent = "Draft Ready to Send 🚀";
        sendBtnIcon.className = "bx bx-check-circle";

        // Clear Form
        messageInput.value = "";

        // Revert button back after a delay
        setTimeout(() => {
            sendBtn.classList.remove("btn-success");
            sendBtnText.textContent = "Send Message";
            sendBtnIcon.className = "bx bx-mail-send";
        }, 4000);
    }
});
