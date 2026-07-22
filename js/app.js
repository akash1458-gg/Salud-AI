const App = {
    init: function() {
        // 2. Init AIEngine
        if (window.AIEngine && typeof window.AIEngine.init === 'function') {
            window.AIEngine.init();
        }

        // 3. Init SymptomTriage
        if (window.SymptomTriage && typeof window.SymptomTriage.init === 'function') {
            window.SymptomTriage.init();
        }

        // 4. Init Dashboard
        if (window.Dashboard && typeof window.Dashboard.init === 'function') {
            window.Dashboard.init();
        }

        // 4.5. Init Profiles
        this.initProfiles();

        // 4.6. Init Login
        this.initLogin();

        // 5, 6, 7. Bindings
        this.bindNavigation();
        this.bindModals();
        this.setupKeyboardShortcuts();

        // 8. After 800ms delay: if AI not configured, show api-key-modal
        setTimeout(() => {
            if (window.AIEngine && typeof window.AIEngine.isConfigured === 'function') {
                if (!window.AIEngine.isConfigured()) {
                    this.showModal('api-key-modal');
                }
            }
        }, 800);

        // 9. Trigger hero entrance animation
        this.triggerEntranceAnimation('hero');
        
        // Expose globally
        window.showToast = (message, type, duration) => this.showToast(message, type, duration);
    },

    navigate: function(sectionName) {
        const sectionMap = {
            'hero': '#hero-section',
            'triage': '#triage-section',
            'dashboard': '#dashboard-section'
        };

        const targetId = sectionMap[sectionName];
        if (!targetId) return;

        // Update nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            if (link.getAttribute('data-section') === sectionName) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Update sections
        document.querySelectorAll('.section.active').forEach(sec => {
            sec.classList.remove('active');
        });

        const newSection = document.querySelector(targetId);
        if (newSection) {
            newSection.classList.add('active');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
            if (sectionName === 'dashboard' && window.Dashboard && typeof window.Dashboard.refresh === 'function') {
                window.Dashboard.refresh();
            }

            this.triggerEntranceAnimation(sectionName);
        }
    },

    initProfiles: function() {
        let profiles = [];
        try {
            const listStr = localStorage.getItem('healthPulse_profilesList');
            if (listStr) {
                profiles = JSON.parse(listStr);
            }
        } catch (e) {}

        if (profiles.length === 0) {
            profiles = ['Self', 'Sarah', 'Leo'];
            localStorage.setItem('healthPulse_profilesList', JSON.stringify(profiles));
        }

        let activeProfile = localStorage.getItem('healthPulse_activeProfile');
        if (!activeProfile || !profiles.includes(activeProfile)) {
            activeProfile = 'Self';
            localStorage.setItem('healthPulse_activeProfile', 'Self');
        }

        const select = document.getElementById('profile-select');
        if (select) {
            select.innerHTML = '';
            profiles.forEach(p => {
                const opt = document.createElement('option');
                opt.value = p;
                opt.textContent = p === 'Self' ? 'Self (Primary)' : p;
                if (p === activeProfile) opt.selected = true;
                select.appendChild(opt);
            });

            const newOpt = document.createElement('option');
            newOpt.value = 'new';
            newOpt.textContent = '+ Add Profile';
            select.appendChild(newOpt);

            // Bind change listener
            select.onchange = (e) => {
                const val = e.target.value;
                if (val === 'new') {
                    // Revert select back to active
                    select.value = localStorage.getItem('healthPulse_activeProfile') || 'Self';
                    this.showModal('add-profile-modal');
                } else {
                    localStorage.setItem('healthPulse_activeProfile', val);
                    this.showToast(`Switched to profile: ${val}`, 'success');
                    
                    // Reload dashboard & triage for new profile
                    if (window.Dashboard && typeof window.Dashboard.loadState === 'function') {
                        window.Dashboard.loadState();
                        window.Dashboard.refresh();
                    }
                    if (window.SymptomTriage && typeof window.SymptomTriage.reset === 'function') {
                        window.SymptomTriage.reset();
                    }
                }
            };
        }
    },

    initLogin: function() {
        const user = localStorage.getItem('salud_user');
        const label = document.getElementById('nav-user-label');
        
        if (!user) {
            setTimeout(() => {
                this.showModal('login-modal');
            }, 500);
        } else {
            if (label) label.textContent = `👤 ${user}`;
        }
    },

    showModal: function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
        }
    },

    hideModal: function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    },

    showToast: function(message, type = 'info', duration = 3500) {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.style.display = 'flex';
        toast.style.alignItems = 'center';
        toast.style.gap = '10px';
        toast.style.padding = '12px 20px';
        toast.style.margin = '10px 0';
        toast.style.borderRadius = '8px';
        toast.style.backgroundColor = 'var(--bg-surface, #FFFFFF)';
        toast.style.color = 'var(--color-text-bright, #1C2B2A)';
        toast.style.boxShadow = '0 8px 24px rgba(28, 43, 42, 0.12)';
        toast.style.border = '1px solid var(--glass-border)';
        toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        toast.style.borderLeft = '4px solid';

        let icon = '💡';
        let borderColor = 'var(--color-secondary, #a8b2d1)';

        switch(type) {
            case 'success':
                icon = '✅';
                borderColor = 'var(--color-accent, #64ffda)';
                break;
            case 'error':
                icon = '❌';
                borderColor = 'var(--color-danger, #ff6b6b)';
                break;
            case 'warning':
                icon = '⚠️';
                borderColor = 'var(--color-warning, #ffd166)';
                break;
            case 'info':
            default:
                icon = '💡';
                borderColor = 'var(--color-secondary, #a8b2d1)';
                break;
        }

        toast.style.borderLeftColor = borderColor;
        toast.innerHTML = `<span>${icon}</span><span style="font-size:14px;font-weight:500;">${message}</span>`;
        
        container.appendChild(toast);

        // Animate in
        requestAnimationFrame(() => {
            toast.style.transform = 'translateY(0)';
            toast.style.opacity = '1';
        });

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300); // match transition duration
        }, duration);
    },

    bindNavigation: function() {
        document.querySelectorAll('.nav-link[data-section]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigate(link.getAttribute('data-section'));
            });
        });

        document.querySelectorAll('.glow-btn[data-navigate]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigate(btn.getAttribute('data-navigate'));
            });
        });

        const settingsBtn = document.getElementById('settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showModal('api-key-modal');
            });
        }
    },

    bindModals: function() {
        const saveApiKeyBtn = document.getElementById('save-api-key-btn');
        if (saveApiKeyBtn) {
            saveApiKeyBtn.addEventListener('click', () => {
                const input = document.getElementById('api-key-input');
                if (input && input.value.trim() !== '') {
                    if (window.AIEngine && typeof window.AIEngine.setApiKey === 'function') {
                        window.AIEngine.setApiKey(input.value.trim());
                    }
                    localStorage.removeItem('healthPulse_demoMode');
                    this.hideModal('api-key-modal');
                    this.showToast('API Key saved successfully', 'success');
                } else {
                    this.showToast('Please enter a valid API key', 'warning');
                }
            });
        }

        const demoModeBtn = document.getElementById('demo-mode-btn');
        if (demoModeBtn) {
            demoModeBtn.addEventListener('click', () => {
                localStorage.setItem('healthPulse_demoMode', 'true');
                if (window.AIEngine && typeof window.AIEngine.init === 'function') {
                    window.AIEngine.init();
                }
                this.hideModal('api-key-modal');
                this.showToast('Demo mode enabled', 'info');
            });
        }

        // Close on overlay click
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    overlay.classList.remove('active');
                }
            });
        });
        
        // Bind any explicit close buttons if they exist
        document.querySelectorAll('.modal-close, [data-close-modal]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal-overlay');
                if (modal) {
                    modal.classList.remove('active');
                }
            });
        });

        // Save Profile button
        const saveProfileBtn = document.getElementById('save-profile-btn');
        if (saveProfileBtn) {
            saveProfileBtn.addEventListener('click', () => {
                const nameInput = document.getElementById('new-profile-name');
                if (!nameInput || !nameInput.value.trim()) {
                    this.showToast('Please enter a profile name', 'warning');
                    return;
                }

                const name = nameInput.value.trim();
                let profiles = [];
                try {
                    const listStr = localStorage.getItem('healthPulse_profilesList');
                    if (listStr) profiles = JSON.parse(listStr);
                } catch (e) {}

                if (profiles.includes(name)) {
                    this.showToast('Profile name already exists', 'error');
                    return;
                }

                profiles.push(name);
                localStorage.setItem('healthPulse_profilesList', JSON.stringify(profiles));
                localStorage.setItem('healthPulse_activeProfile', name);

                this.initProfiles();
                this.hideModal('add-profile-modal');
                nameInput.value = '';

                this.showToast(`Profile "${name}" created successfully`, 'success');

                // Reload data
                if (window.Dashboard && typeof window.Dashboard.loadState === 'function') {
                    window.Dashboard.loadState();
                    window.Dashboard.refresh();
                }
                if (window.SymptomTriage && typeof window.SymptomTriage.reset === 'function') {
                    window.SymptomTriage.reset();
                }
            });
        }

        // Login Submit binding
        const loginSubmitBtn = document.getElementById('login-submit-btn');
        if (loginSubmitBtn) {
            loginSubmitBtn.addEventListener('click', () => {
                const emailEl = document.getElementById('login-email');
                const passEl = document.getElementById('login-password');
                const email = emailEl ? emailEl.value.trim() : '';
                const pass = passEl ? passEl.value.trim() : '';
                
                if (email === 'itadori@salud.ai' && pass === 'demo') {
                    localStorage.setItem('salud_user', 'Itadori');
                    const label = document.getElementById('nav-user-label');
                    if (label) label.textContent = '👤 Itadori';
                    
                    // Switch profile to Self
                    localStorage.setItem('healthPulse_activeProfile', 'Self');
                    this.initProfiles();
                    
                    this.hideModal('login-modal');
                    this.showToast('Welcome, Itadori!', 'success');
                    
                    if (window.Dashboard && typeof window.Dashboard.loadState === 'function') {
                        window.Dashboard.loadState();
                        window.Dashboard.refresh();
                    }
                    if (window.SymptomTriage && typeof window.SymptomTriage.reset === 'function') {
                        window.SymptomTriage.reset();
                    }
                } else {
                    this.showToast('Invalid credentials. Use: itadori@salud.ai / demo', 'error');
                }
            });
        }

        // Login Guest binding
        const loginGuestBtn = document.getElementById('login-guest-btn');
        if (loginGuestBtn) {
            loginGuestBtn.addEventListener('click', () => {
                localStorage.setItem('salud_user', 'Guest');
                const label = document.getElementById('nav-user-label');
                if (label) label.textContent = '👤 Guest';
                this.hideModal('login-modal');
                this.showToast('Logged in as Guest', 'info');
            });
        }

        // User status label logout
        const userLabel = document.getElementById('nav-user-label');
        if (userLabel) {
            userLabel.style.cursor = 'pointer';
            userLabel.title = 'Click to Logout';
            userLabel.addEventListener('click', () => {
                localStorage.removeItem('salud_user');
                userLabel.textContent = '👤 Guest';
                this.showModal('login-modal');
                this.showToast('You have logged out', 'info');
            });
        }
    },

    setupKeyboardShortcuts: function() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal-overlay.active').forEach(modal => {
                    modal.classList.remove('active');
                });
            }
        });
    },

    triggerEntranceAnimation: function(sectionName) {
        const sectionMap = {
            'hero': '#hero-section',
            'triage': '#triage-section',
            'dashboard': '#dashboard-section'
        };
        const targetId = sectionMap[sectionName];
        if (!targetId) return;

        const section = document.querySelector(targetId);
        if (!section) return;

        const animatables = section.querySelectorAll('.glass-card, .hero-content, .section-header, .dashboard-card');
        
        animatables.forEach((el, index) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            
            setTimeout(() => {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
                
                // Clean up inline styles after animation
                setTimeout(() => {
                    el.style.transition = '';
                    el.style.opacity = '';
                    el.style.transform = '';
                }, 500);
            }, 100 * index);
        });
    }
};

window.App = App;

document.addEventListener('DOMContentLoaded', () => {
    window.App.init();
});
