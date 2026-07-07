// ==========================================================================
// Interactive NLP Life Coach - Client-Side Checkout Scripting
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
    // --- Application Constants & Defaults ---
    const DEFAULTS = {
        whatsappLink: 'https://chat.whatsapp.com/Ky6tGrN9THs6xEndeuNrqy',
        fee: '99/-',
        date: '12 July 2026',
        time: '9:00 PM',
        day: 'SUNDAY'
    };

    // --- DOM Elements ---
    // Checkout summary labels
    const displayDate = document.getElementById('summary-date');
    const displayTime = document.getElementById('summary-time');

    // Steps
    const stepDetails = document.getElementById('step-details');
    const stepPayment = document.getElementById('step-payment');
    const stepProcessing = document.getElementById('step-processing');
    const stepSuccess = document.getElementById('step-success');

    // Forms & Inputs
    const detailsForm = document.getElementById('details-form');
    const upiPaymentForm = document.getElementById('upi-payment-form');
    const userUtrInput = document.getElementById('user-utr');
    const upiErrorMsg = document.getElementById('upi-error-msg');

    const cardForm = document.getElementById('card-form');
    const cardNumInput = document.getElementById('card-num');
    const cardExpiryInput = document.getElementById('card-expiry');
    const cardCvvInput = document.getElementById('card-cvv');
    const configFeeTexts = document.querySelectorAll('.config-fee-text');
    const whatsappJoinBtn = document.getElementById('whatsapp-join-btn');

    // Tabs
    const payTabs = document.querySelectorAll('.pay-tab');
    const paymentPanels = document.querySelectorAll('.payment-panel');

    // Settings Modal elements
    const adminTrigger = document.getElementById('admin-trigger');
    const settingsModal = document.getElementById('settings-modal');
    const closeSettings = document.getElementById('close-settings');
    const settingsForm = document.getElementById('settings-form');
    const configUpi = document.getElementById('config-upi');
    const configPayeeName = document.getElementById('config-payee-name');
    const configWhatsapp = document.getElementById('config-whatsapp');
    const configFee = document.getElementById('config-fee');
    const configDate = document.getElementById('config-date');
    const configTime = document.getElementById('config-time');
    const configDay = document.getElementById('config-day');
    const resetSettingsBtn = document.getElementById('reset-settings-btn');

    // --- App State ---
    let activeTimer = null;

    // --- Core Functions ---

    // Load configurations from LocalStorage
    function loadConfig() {
        const whatsapp = localStorage.getItem('nlp_whatsapp') || DEFAULTS.whatsappLink;
        const fee = localStorage.getItem('nlp_fee') || DEFAULTS.fee;
        const date = localStorage.getItem('nlp_date') || DEFAULTS.date;
        const time = localStorage.getItem('nlp_time') || DEFAULTS.time;
        const day = localStorage.getItem('nlp_day') || DEFAULTS.day;
        const upiId = localStorage.getItem('nlp_upi') || '94664771641@axl';
        const payeeName = localStorage.getItem('nlp_payee_name') || 'GAJENDER SINGH';

        // Update displays in the checkout form summary card
        if (displayDate) displayDate.textContent = date;
        if (displayTime) displayTime.textContent = time;

        // Update fee texts inside registration steps
        configFeeTexts.forEach(el => el.textContent = fee);

        // Prepopulate Settings inputs
        if (configWhatsapp) configWhatsapp.value = whatsapp;
        if (configFee) configFee.value = fee;
        if (configDate) configDate.value = date;
        if (configTime) configTime.value = time;
        if (configDay) configDay.value = day;
        if (configUpi) configUpi.value = upiId;
        if (configPayeeName) configPayeeName.value = payeeName;

        // Dynamically update the UPI deep link target (targeting PhonePe custom scheme)
        const upiDeeplink = document.getElementById('upi-deeplink');
        if (upiDeeplink) {
            upiDeeplink.href = `phonepe://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}`;
        }
    }

    // Save configurations to LocalStorage
    function saveConfig(upi, payee, whatsapp, fee, date, time, day) {
        localStorage.setItem('nlp_upi', upi.trim());
        localStorage.setItem('nlp_payee_name', payee.trim());
        localStorage.setItem('nlp_whatsapp', whatsapp.trim());
        localStorage.setItem('nlp_fee', fee.trim());
        localStorage.setItem('nlp_date', date.trim());
        localStorage.setItem('nlp_time', time.trim());
        localStorage.setItem('nlp_day', day.trim());

        loadConfig();
    }

    // Reset settings to default
    function resetConfig() {
        localStorage.removeItem('nlp_upi');
        localStorage.removeItem('nlp_payee_name');
        localStorage.removeItem('nlp_whatsapp');
        localStorage.removeItem('nlp_fee');
        localStorage.removeItem('nlp_date');
        localStorage.removeItem('nlp_time');
        localStorage.removeItem('nlp_day');

        loadConfig();
    }

    // Switch active step in checkout card
    function switchStep(activeStepElement) {
        stepDetails.classList.remove('active');
        stepPayment.classList.remove('active');
        stepProcessing.classList.remove('active');
        stepSuccess.classList.remove('active');

        activeStepElement.classList.add('active');
    }

    // Start checkout UPI QR code expiration countdown
    function startUPITimer(durationSeconds) {
        const timerVal = document.getElementById('timer-val');
        if (!timerVal) return;

        clearInterval(activeTimer);
        let timeRemaining = durationSeconds;

        const updateTimerDisplay = () => {
            const minutes = Math.floor(timeRemaining / 60);
            const seconds = timeRemaining % 60;
            timerVal.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        };

        updateTimerDisplay();

        activeTimer = setInterval(() => {
            timeRemaining--;
            if (timeRemaining <= 0) {
                clearInterval(activeTimer);
                timerVal.textContent = "EXPIRED";
                timerVal.style.color = "#ef4444";
            } else {
                updateTimerDisplay();
            }
        }, 1000);
    }

    // Submit payment verification request (Simulated Client-Side)
    function submitPaymentVerification(utrCode) {
        upiErrorMsg.textContent = '';
        switchStep(stepProcessing);

        // Simulate processing delay (1.5 seconds)
        setTimeout(() => {
            const whatsapp = localStorage.getItem('nlp_whatsapp') || DEFAULTS.whatsappLink;
            whatsappJoinBtn.href = whatsapp;

            // Success transition chime
            triggerAudioChime();
            
            // Show success screen
            switchStep(stepSuccess);
        }, 1500);
    }

    function triggerAudioChime() {
        try {
            const context = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = context.createOscillator();
            const gainNode = context.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(context.destination);
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(587.33, context.currentTime); // D5
            gainNode.gain.setValueAtTime(0.1, context.currentTime);
            oscillator.start();
            gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.4);
            oscillator.stop(context.currentTime + 0.45);

            setTimeout(() => {
                const osc2 = context.createOscillator();
                const gain2 = context.createGain();
                osc2.connect(gain2);
                gain2.connect(context.destination);
                osc2.type = 'sine';
                osc2.frequency.setValueAtTime(880, context.currentTime); // A5
                gain2.gain.setValueAtTime(0.1, context.currentTime);
                osc2.start();
                gain2.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.6);
                osc2.stop(context.currentTime + 0.65);
            }, 150);
        } catch (e) {
            console.log('Audio chime played.');
        }
    }

    // --- Interactive Listeners ---

    // Step 1 Details Form Submit
    if (detailsForm) {
        detailsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            switchStep(stepPayment);
            startUPITimer(300); // 5 minute countdown
        });
    }

    // Step 2 UPI Payment UTR form submit
    if (upiPaymentForm) {
        upiPaymentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            clearInterval(activeTimer);
            submitPaymentVerification(userUtrInput.value);
        });
    }

    // Step 2 Simulated Card Payment submit (auto-generate simulated UTR)
    if (cardForm) {
        cardForm.addEventListener('submit', (e) => {
            e.preventDefault();
            clearInterval(activeTimer);
            
            // Generate a dummy card-transaction UTR (e.g. 1000xxxxxxxx)
            const mockUtr = '1000' + Math.floor(10000000 + Math.random() * 90000000).toString();
            submitPaymentVerification(mockUtr);
        });
    }

    // Payment Methods Tabs controller
    payTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            payTabs.forEach(t => t.classList.remove('active'));
            paymentPanels.forEach(p => p.classList.remove('active'));

            tab.classList.add('active');
            const targetId = tab.getAttribute('data-target');
            const targetPanel = document.getElementById(targetId);
            if (targetPanel) {
                targetPanel.classList.add('active');
            }
        });
    });

    // Format Card Number (adds spaces every 4 digits)
    if (cardNumInput) {
        cardNumInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            let formatted = '';
            for (let i = 0; i < value.length; i++) {
                if (i > 0 && i % 4 === 0) {
                    formatted += ' ';
                }
                formatted += value[i];
            }
            e.target.value = formatted;
        });
    }

    // Format Card Expiry Date (adds slash after 2 digits)
    if (cardExpiryInput) {
        cardExpiryInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 2) {
                e.target.value = value.substring(0, 2) + '/' + value.substring(2, 4);
            } else {
                e.target.value = value;
            }
        });
    }

    // --- Admin Settings Modal Logic ---

    // Open settings panel
    if (adminTrigger) {
        adminTrigger.addEventListener('click', () => {
            settingsModal.classList.add('active');
        });
    }

    // Close settings panel
    if (closeSettings) {
        closeSettings.addEventListener('click', () => {
            settingsModal.classList.remove('active');
        });
    }

    // Save configurations form submission
    if (settingsForm) {
        settingsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            saveConfig(
                configUpi.value,
                configPayeeName.value,
                configWhatsapp.value,
                configFee.value,
                configDate.value,
                configTime.value,
                configDay.value
            );
            settingsModal.classList.remove('active');
        });
    }

    // Reset config trigger
    if (resetSettingsBtn) {
        resetSettingsBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to revert all changes to standard defaults?')) {
                resetConfig();
                settingsModal.classList.remove('active');
            }
        });
    }

    // Close settings modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === settingsModal) {
            settingsModal.classList.remove('active');
        }
    });

    // Copy UPI ID button listener
    const copyUpiBtn = document.getElementById('copy-upi-btn');
    const copyBtnText = document.getElementById('copy-btn-text');

    if (copyUpiBtn && copyBtnText) {
        copyUpiBtn.addEventListener('click', () => {
            const currentUpi = localStorage.getItem('nlp_upi') || '94664771641@axl';
            navigator.clipboard.writeText(currentUpi).then(() => {
                copyBtnText.textContent = 'Copied!';
                copyUpiBtn.style.borderColor = 'var(--gold-primary)';
                copyUpiBtn.style.color = 'var(--text-gold)';
                setTimeout(() => {
                    copyBtnText.textContent = 'Copy UPI ID';
                    copyUpiBtn.style.borderColor = 'rgba(255,255,255,0.15)';
                    copyUpiBtn.style.color = 'var(--text-gray)';
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy text: ', err);
            });
        });
    }

    // --- Initialization ---
    loadConfig();
});
