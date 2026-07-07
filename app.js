// ==========================================================================
// Interactive NLP Life Coach - Secure Gatekeeper Checkout Scripting
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
    // --- Application Constants & Defaults ---
    const DEFAULTS = {
        whatsappLink: 'https://chat.whatsapp.com/Ky6tGrN9THs6xEndeuNrqy',
        fee: '99/-',
        date: '31-5-2026',
        time: '9:00 PM',
        day: 'SUNDAY',
        adminPassword: 'admin'
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
    const configWhatsapp = document.getElementById('config-whatsapp');
    const configFee = document.getElementById('config-fee');
    const configDate = document.getElementById('config-date');
    const configTime = document.getElementById('config-time');
    const configDay = document.getElementById('config-day');
    const configPassword = document.getElementById('config-password');
    const resetSettingsBtn = document.getElementById('reset-settings-btn');

    // Admin Logs elements
    const tabSettingsBtn = document.getElementById('tab-settings-btn');
    const tabLogsBtn = document.getElementById('tab-logs-btn');
    const adminSettingsTab = document.getElementById('admin-settings-tab');
    const adminLogsTab = document.getElementById('admin-logs-tab');
    
    const adminLoginBox = document.getElementById('admin-login-box');
    const adminAuthPwdInput = document.getElementById('admin-auth-pwd');
    const adminLoginError = document.getElementById('admin-login-error');
    const adminLoginBtn = document.getElementById('admin-login-btn');
    const adminLogsContainer = document.getElementById('admin-logs-container');
    const utrLogsTbody = document.getElementById('utr-logs-tbody');
    const refreshLogsBtn = document.getElementById('refresh-logs-btn');

    // --- App State ---
    let activeTimer = null;
    let currentUserData = {
        name: '',
        email: '',
        phone: ''
    };

    // --- Core Functions ---

    // Load configurations from LocalStorage
    function loadConfig() {
        const whatsapp = localStorage.getItem('nlp_whatsapp') || DEFAULTS.whatsappLink;
        const fee = localStorage.getItem('nlp_fee') || DEFAULTS.fee;
        const date = localStorage.getItem('nlp_date') || DEFAULTS.date;
        const time = localStorage.getItem('nlp_time') || DEFAULTS.time;
        const day = localStorage.getItem('nlp_day') || DEFAULTS.day;
        const adminPwd = localStorage.getItem('nlp_admin_pwd') || DEFAULTS.adminPassword;

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
        if (configPassword) configPassword.value = adminPwd;
    }

    // Save configurations to LocalStorage and Server config API
    async function saveConfig(whatsapp, fee, date, time, day, adminPassword) {
        localStorage.setItem('nlp_whatsapp', whatsapp.trim());
        localStorage.setItem('nlp_fee', fee.trim());
        localStorage.setItem('nlp_date', date.trim());
        localStorage.setItem('nlp_time', time.trim());
        localStorage.setItem('nlp_day', day.trim());
        localStorage.setItem('nlp_admin_pwd', adminPassword.trim());

        // Update server configuration
        try {
            await fetch('/api/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ whatsappLink: whatsapp.trim(), adminPassword: adminPassword.trim() })
            });
        } catch (e) {
            console.error('Failed to sync configs with server:', e);
        }

        loadConfig();
    }

    // Reset settings to default
    async function resetConfig() {
        localStorage.removeItem('nlp_whatsapp');
        localStorage.removeItem('nlp_fee');
        localStorage.removeItem('nlp_date');
        localStorage.removeItem('nlp_time');
        localStorage.removeItem('nlp_day');
        localStorage.removeItem('nlp_admin_pwd');

        // Update server config
        try {
            await fetch('/api/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ whatsappLink: DEFAULTS.whatsappLink, adminPassword: DEFAULTS.adminPassword })
            });
        } catch (e) {
            console.error('Failed to reset server configuration:', e);
        }

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

    // Submit payment verification request to backend
    async function submitPaymentVerification(utrCode) {
        upiErrorMsg.textContent = '';
        switchStep(stepProcessing);

        try {
            const response = await fetch('/api/verify-utr', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: currentUserData.name,
                    email: currentUserData.email,
                    phone: currentUserData.phone,
                    utr: utrCode
                })
            });

            const data = await response.json();

            if (data.success) {
                // Set the secure WhatsApp join URL returned by the server API
                whatsappJoinBtn.href = data.whatsappLink;

                // Success transition chime
                triggerAudioChime();
                
                // Show success screen
                setTimeout(() => {
                    switchStep(stepSuccess);
                }, 1000);
            } else {
                // If validation failed, return back to payment step and show error
                setTimeout(() => {
                    switchStep(stepPayment);
                    upiErrorMsg.textContent = data.error || 'Verification failed. Please check the UTR code.';
                }, 1000);
            }

        } catch (err) {
            setTimeout(() => {
                switchStep(stepPayment);
                upiErrorMsg.textContent = 'Server connection error. Please try again.';
            }, 1000);
        }
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
            currentUserData.name = document.getElementById('user-name').value;
            currentUserData.email = document.getElementById('user-email').value;
            currentUserData.phone = document.getElementById('user-phone').value;

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

    // Step 2 Simulated Card Payment submit (auto-generate simulated UTR to insert into SQLite)
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

    // --- Admin Settings Modal Logic & Tab Switching ---

    // Toggle Modal Tabs
    if (tabSettingsBtn) {
        tabSettingsBtn.addEventListener('click', () => {
            tabSettingsBtn.classList.add('active');
            tabLogsBtn.classList.remove('active');
            adminSettingsTab.classList.add('active');
            adminLogsTab.classList.remove('active');
        });
    }

    if (tabLogsBtn) {
        tabLogsBtn.addEventListener('click', () => {
            tabLogsBtn.classList.add('active');
            tabSettingsBtn.classList.remove('active');
            adminLogsTab.classList.add('active');
            adminSettingsTab.classList.remove('active');
        });
    }

    // Load UTR Audit Database Logs
    async function fetchTransactionLogs(pwd) {
        adminLoginError.textContent = '';
        try {
            const response = await fetch('/api/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: pwd })
            });

            const data = await response.json();

            if (data.success) {
                // Hide login box, show audit table
                adminLoginBox.style.display = 'none';
                adminLogsContainer.style.display = 'block';

                // Render table rows
                utrLogsTbody.innerHTML = '';
                if (data.registrations.length === 0) {
                    utrLogsTbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:15px; color:#ef4444;">No registrations recorded yet.</td></tr>`;
                } else {
                    data.registrations.forEach(row => {
                        const tr = document.createElement('tr');
                        tr.style.borderBottom = '1px solid rgba(255,255,255,0.08)';
                        tr.innerHTML = `
                            <td style="padding:10px 12px; font-weight:600; color:#fff;">${escapeHTML(row.name)}</td>
                            <td style="padding:10px 12px;">${escapeHTML(row.phone)}</td>
                            <td style="padding:10px 12px; font-family:monospace; color:var(--text-gold);">${escapeHTML(row.utr)}</td>
                            <td style="padding:10px 12px; font-size:0.75rem;">${new Date(row.created_at).toLocaleString()}</td>
                        `;
                        utrLogsTbody.appendChild(tr);
                    });
                }
            } else {
                adminLoginError.textContent = data.error || 'Authentication failed.';
            }
        } catch (e) {
            adminLoginError.textContent = 'Connection error failed to query UTR logs.';
        }
    }

    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
        );
    }

    // Access logs click handler
    if (adminLoginBtn) {
        adminLoginBtn.addEventListener('click', () => {
            fetchTransactionLogs(adminAuthPwdInput.value);
        });
    }

    // Refresh logs database handler
    if (refreshLogsBtn) {
        refreshLogsBtn.addEventListener('click', () => {
            fetchTransactionLogs(adminAuthPwdInput.value);
        });
    }

    // Open settings panel
    if (adminTrigger) {
        adminTrigger.addEventListener('click', () => {
            // Reset Admin Logs Login box view
            adminLoginBox.style.display = 'flex';
            adminLogsContainer.style.display = 'none';
            adminAuthPwdInput.value = '';
            adminLoginError.textContent = '';
            
            // Default to settings configuration tab
            tabSettingsBtn.click();

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
                configWhatsapp.value,
                configFee.value,
                configDate.value,
                configTime.value,
                configDay.value,
                configPassword.value
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

    // --- Initialization ---
    loadConfig();
});
