// ==========================================================================
// Interactive NLP Life Coach - Client-Side Checkout Scripting
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
    // --- Application Constants & Defaults ---
    const DEFAULTS = {
        whatsappLink: 'https://chat.whatsapp.com/Ky6tGrN9THs6xEndeuNrqy',
        upiId: '94664771641@axl',
        payeeName: 'GAJENDER SINGH',
        fee: '99/-',
        date: '12 July 2026',
        time: '9:00 PM',
        day: 'SUNDAY',
        qrMode: 'dynamic',
        staticQrPath: 'assets/phonepe_qr.jpg'
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
    const configQrModeSelect = document.getElementById('config-qr-mode');
    const configStaticPathInput = document.getElementById('config-static-path');
    const configAdminPasswordInput = document.getElementById('config-admin-password');
    const resetSettingsBtn = document.getElementById('reset-settings-btn');

    // Admin Logs UI elements
    const adminTabSettings = document.getElementById('admin-tab-settings');
    const adminTabLogs = document.getElementById('admin-tab-logs');
    const adminSettingsTabPanel = document.getElementById('admin-settings-tab');
    const adminLogsTabPanel = document.getElementById('admin-logs-tab');
    const logsAuthForm = document.getElementById('logs-auth-form');
    const logsPasswordInput = document.getElementById('logs-password');
    const logsAuthError = document.getElementById('logs-auth-error');
    const logsTableContainer = document.getElementById('logs-table-container');
    const logsTableBody = document.getElementById('logs-table-body');

    // Client QR code elements
    const qrToggleDynamic = document.getElementById('qr-toggle-dynamic');
    const qrToggleStatic = document.getElementById('qr-toggle-static');
    const upiInstructions = document.getElementById('upi-instructions');
    const upiQrCanvas = document.getElementById('upi-qr-canvas');
    const upiQrStaticImg = document.getElementById('upi-qr-static-img');
    const upiDeeplink = document.getElementById('upi-deeplink');
    const upiMobilePayBtn = document.getElementById('upi-mobile-pay-btn');

    // --- App State ---
    let activeTimer = null;
    let serverConfig = { ...DEFAULTS };
    let clientRegistration = { name: '', email: '', phone: '' };
    let currentSelectedQrMode = 'dynamic'; // 'dynamic' or 'static'

    // --- Core Functions ---

    // Fetch config from server and update interface
    function fetchAndApplyConfig() {
        fetch('/api/config')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    serverConfig = data;
                    updateUIWithConfig();
                } else {
                    loadFallbackConfig();
                }
            })
            .catch(err => {
                console.error('Failed to fetch server config, using local fallback:', err);
                loadFallbackConfig();
            });
    }

    // Load configurations fallback from LocalStorage or Defaults
    function loadFallbackConfig() {
        serverConfig = {
            whatsappLink: localStorage.getItem('nlp_whatsapp') || DEFAULTS.whatsappLink,
            upiId: localStorage.getItem('nlp_upi') || DEFAULTS.upiId,
            payeeName: localStorage.getItem('nlp_payee_name') || DEFAULTS.payeeName,
            fee: localStorage.getItem('nlp_fee') || DEFAULTS.fee,
            date: localStorage.getItem('nlp_date') || DEFAULTS.date,
            time: localStorage.getItem('nlp_time') || DEFAULTS.time,
            day: localStorage.getItem('nlp_day') || DEFAULTS.day,
            qrMode: localStorage.getItem('nlp_qr_mode') || DEFAULTS.qrMode,
            staticQrPath: localStorage.getItem('nlp_static_qr_path') || DEFAULTS.staticQrPath
        };
        updateUIWithConfig();
    }

    // Render interface components matching the configuration
    function updateUIWithConfig() {
        // Update summaries
        if (displayDate) displayDate.textContent = serverConfig.date;
        if (displayTime) displayTime.textContent = serverConfig.time;

        // Update fee texts inside step panels
        configFeeTexts.forEach(el => el.textContent = serverConfig.fee);

        // Prepopulate Settings inputs
        if (configWhatsapp) configWhatsapp.value = serverConfig.whatsappLink;
        if (configFee) configFee.value = serverConfig.fee;
        if (configDate) configDate.value = serverConfig.date;
        if (configTime) configTime.value = serverConfig.time;
        if (configDay) configDay.value = serverConfig.day;
        if (configUpi) configUpi.value = serverConfig.upiId;
        if (configPayeeName) configPayeeName.value = serverConfig.payeeName;
        if (configQrModeSelect) configQrModeSelect.value = serverConfig.qrMode;
        if (configStaticPathInput) configStaticPathInput.value = serverConfig.staticQrPath;

        // Apply settings default QR mode
        setQrMode(serverConfig.qrMode);
    }

    // Apply selected QR mode (dynamic/static)
    function setQrMode(mode) {
        currentSelectedQrMode = mode;
        const numericFee = serverConfig.fee.replace(/\D/g, '') || '99';
        
        // Generate UPI URI
        const upiUri = `upi://pay?pa=${encodeURIComponent(serverConfig.upiId)}&pn=${encodeURIComponent(serverConfig.payeeName)}&am=${encodeURIComponent(numericFee)}&cu=INR&tn=NLP%20Seminar%20Registration`;

        // Update Deep Links for scanning / mobile redirect
        if (upiDeeplink) upiDeeplink.href = upiUri;
        if (upiMobilePayBtn) upiMobilePayBtn.href = upiUri;

        if (mode === 'dynamic') {
            // Set toggle button states
            if (qrToggleDynamic) qrToggleDynamic.classList.add('active');
            if (qrToggleStatic) qrToggleStatic.classList.remove('active');

            // Toggle visual elements
            if (upiQrCanvas) upiQrCanvas.style.display = 'block';
            if (upiQrStaticImg) upiQrStaticImg.style.display = 'none';

            // Set dynamic instruction text
            if (upiInstructions) {
                upiInstructions.innerHTML = `Scan QR to pay exact fee <strong class="config-fee-text">${serverConfig.fee}</strong>. Payee & amount pre-filled.`;
            }

            // Draw QR Code onto Canvas
            if (typeof QRCode !== 'undefined' && upiQrCanvas) {
                QRCode.toCanvas(upiQrCanvas, upiUri, {
                    width: 220,
                    margin: 2,
                    color: {
                        dark: '#030816',
                        light: '#ffffff'
                    }
                }, (err) => {
                    if (err) console.error('Failed to render dynamic QR code:', err);
                });
            }
        } else {
            // Set toggle button states
            if (qrToggleDynamic) qrToggleDynamic.classList.remove('active');
            if (qrToggleStatic) qrToggleStatic.classList.add('active');

            // Toggle visual elements
            if (upiQrCanvas) upiQrCanvas.style.display = 'none';
            if (upiQrStaticImg) {
                upiQrStaticImg.src = serverConfig.staticQrPath || 'assets/phonepe_qr.jpg';
                upiQrStaticImg.style.display = 'block';
            }

            // Set static instruction text
            if (upiInstructions) {
                upiInstructions.innerHTML = `Scan QR to pay. Enter fee amount <strong class="config-fee-text">${serverConfig.fee}</strong> manually in your app.`;
            }
        }
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

    // Submit payment verification request (Real API Verification)
    function submitPaymentVerification(utrCode) {
        upiErrorMsg.textContent = '';
        switchStep(stepProcessing);

        const payload = {
            name: clientRegistration.name,
            email: clientRegistration.email,
            phone: clientRegistration.phone,
            utr: utrCode
        };

        fetch('/api/verify-utr', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                // Populate WhatsApp Join redirect button link
                if (whatsappJoinBtn) whatsappJoinBtn.href = data.whatsappLink;
                
                // Play audio chime
                triggerAudioChime();
                
                // Transition to success step
                switchStep(stepSuccess);
            } else {
                // Handle backend validation or duplicate UTR failures
                switchStep(stepPayment);
                upiErrorMsg.textContent = data.error || 'Failed to verify transaction. Please check UTR and try again.';
            }
        })
        .catch(err => {
            console.error('Network error during UTR verification:', err);
            switchStep(stepPayment);
            upiErrorMsg.textContent = 'Connection error. Please check your internet and try again.';
        });
    }

    // Audio chime on successful verification
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

    // Toggle QR code modes
    if (qrToggleDynamic) {
        qrToggleDynamic.addEventListener('click', () => setQrMode('dynamic'));
    }
    if (qrToggleStatic) {
        qrToggleStatic.addEventListener('click', () => setQrMode('static'));
    }

    // Step 1 Details Form Submit
    if (detailsForm) {
        detailsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Extract user fields
            const userNameInput = document.getElementById('user-name');
            const userEmailInput = document.getElementById('user-email');
            const userPhoneInput = document.getElementById('user-phone');

            clientRegistration = {
                name: userNameInput ? userNameInput.value.trim() : 'Anonymous',
                email: userEmailInput ? userEmailInput.value.trim() : '',
                phone: userPhoneInput ? userPhoneInput.value.trim() : ''
            };

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
            // Ignore settings modal internal tabs
            if (tab.id === 'admin-tab-settings' || tab.id === 'admin-tab-logs') return;

            payTabs.forEach(t => {
                if (t.id !== 'admin-tab-settings' && t.id !== 'admin-tab-logs') {
                    t.classList.remove('active');
                }
            });
            paymentPanels.forEach(p => {
                if (p.id !== 'admin-settings-tab' && p.id !== 'admin-logs-tab') {
                    p.classList.remove('active');
                }
            });

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
            // Default to settings tab
            showAdminTab('settings');
        });
    }

    // Close settings panel
    if (closeSettings) {
        closeSettings.addEventListener('click', () => {
            settingsModal.classList.remove('active');
        });
    }

    // Tab toggles inside Settings Modal
    if (adminTabSettings) {
        adminTabSettings.addEventListener('click', () => showAdminTab('settings'));
    }
    if (adminTabLogs) {
        adminTabLogs.addEventListener('click', () => showAdminTab('logs'));
    }

    function showAdminTab(tabName) {
        if (tabName === 'settings') {
            adminTabSettings.classList.add('active');
            adminTabLogs.classList.remove('active');
            adminSettingsTabPanel.classList.add('active');
            adminLogsTabPanel.classList.remove('active');
        } else {
            adminTabSettings.classList.remove('active');
            adminTabLogs.classList.add('active');
            adminSettingsTabPanel.classList.remove('active');
            adminLogsTabPanel.classList.add('active');
        }
    }

    // Save configurations form submission to server config
    if (settingsForm) {
        settingsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const payload = {
                upiId: configUpi.value,
                payeeName: configPayeeName.value,
                whatsappLink: configWhatsapp.value,
                fee: configFee.value,
                date: configDate.value,
                time: configTime.value,
                day: configDay.value,
                qrMode: configQrModeSelect.value,
                staticQrPath: configStaticPathInput.value
            };

            // Optional Admin Password Change
            if (configAdminPasswordInput && configAdminPasswordInput.value.trim() !== '') {
                payload.adminPassword = configAdminPasswordInput.value.trim();
            }

            fetch('/api/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    alert('Configuration saved successfully on the server!');
                    if (configAdminPasswordInput) configAdminPasswordInput.value = '';
                    fetchAndApplyConfig();
                    settingsModal.classList.remove('active');
                } else {
                    alert('Failed to save settings: ' + data.message);
                }
            })
            .catch(err => {
                console.error('Error saving server settings:', err);
                alert('Connection error occurred while saving.');
            });
        });
    }

    // Reset config trigger on Server
    if (resetSettingsBtn) {
        resetSettingsBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to revert all changes to server defaults?')) {
                fetch('/api/config/reset', { method: 'POST' })
                    .then(res => res.json())
                    .then(data => {
                        if (data.success) {
                            alert('All server settings reset to standard defaults!');
                            fetchAndApplyConfig();
                            settingsModal.classList.remove('active');
                        } else {
                            alert('Reset failed: ' + data.message);
                        }
                    })
                    .catch(err => {
                        console.error('Error resetting server config:', err);
                        alert('Connection error occurred while resetting.');
                    });
            }
        });
    }

    // Admin Logs Authenticate and fetch
    if (logsAuthForm) {
        logsAuthForm.addEventListener('submit', (e) => {
            e.preventDefault();
            logsAuthError.textContent = '';

            const password = logsPasswordInput.value;

            fetch('/api/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    renderLogsTable(data.registrations);
                    logsTableContainer.style.display = 'block';
                    logsAuthForm.style.display = 'none';
                } else {
                    logsAuthError.textContent = data.error || 'Incorrect Admin Password.';
                }
            })
            .catch(err => {
                console.error('Error fetching transactions:', err);
                logsAuthError.textContent = 'Network error fetching transactions logs.';
            });
        });
    }

    function renderLogsTable(registrations) {
        logsTableBody.innerHTML = '';
        if (registrations.length === 0) {
            logsTableBody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 15px; color: var(--text-gray);">No logs found.</td></tr>`;
            return;
        }

        registrations.forEach(row => {
            const tr = document.createElement('tr');
            
            // Format creation date
            const dateStr = new Date(row.created_at).toLocaleString();

            tr.innerHTML = `
                <td style="padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.08); font-weight: 500;">${escapeHtml(row.name)}</td>
                <td style="padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.08); color: var(--text-gray);">${escapeHtml(row.phone)}</td>
                <td style="padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.08); font-family: monospace; color: var(--text-gold);">${escapeHtml(row.utr)}</td>
                <td style="padding: 10px; border-bottom: 1px solid rgba(255,255,255,0.08); color: var(--text-gray); font-size: 0.78rem;">${dateStr}</td>
            `;
            logsTableBody.appendChild(tr);
        });
    }

    function escapeHtml(unsafe) {
        if (!unsafe) return '';
        return unsafe
             .replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;");
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
            navigator.clipboard.writeText(serverConfig.upiId).then(() => {
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
    fetchAndApplyConfig();
});
