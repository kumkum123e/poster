// ==========================================================================
// Interactive NLP Life Coach - Client-Side Scripting
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
    // --- Application Constants & Defaults ---
    const DEFAULTS = {
        whatsappLink: 'https://chat.whatsapp.com/Ky6tGrN9THs6xEndeuNrqy'
    };

    const whatsappJoinBtn = document.getElementById('whatsapp-join-btn');

    // Fetch config from server and update WhatsApp link
    function fetchAndApplyConfig() {
        fetch('/api/config')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.whatsappLink) {
                    if (whatsappJoinBtn) {
                        whatsappJoinBtn.href = data.whatsappLink;
                    }
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
        const fallbackLink = localStorage.getItem('nlp_whatsapp') || DEFAULTS.whatsappLink;
        if (whatsappJoinBtn) {
            whatsappJoinBtn.href = fallbackLink;
        }
    }

    // Initialize
    fetchAndApplyConfig();
});
