const VITAL_TYPES = {
    heartRate: { label: 'Heart Rate', unit: 'bpm', icon: '❤️', min: 40, max: 200, normalMin: 60, normalMax: 100, color: '#e64d4d' },
    bloodPressure: { label: 'Blood Pressure', unit: 'mmHg', icon: '🩸', dual: true, color: '#8b6cf6' },
    bloodSugar: { label: 'Blood Sugar', unit: 'mg/dL', icon: '🍬', min: 30, max: 500, normalMin: 70, normalMax: 140, color: '#e6a733' },
    weight: { label: 'Weight', unit: 'kg', icon: '⚖️', min: 20, max: 300, color: '#2ee6c8' },
    temperature: { label: 'Temperature', unit: '°F', icon: '🌡️', min: 95, max: 107, normalMin: 97, normalMax: 99.5, color: '#3dd97a' },
    oxygenSat: { label: 'O₂ Saturation', unit: '%', icon: '💨', min: 70, max: 100, normalMin: 95, normalMax: 100, color: '#2ee6c8' }
};

const Dashboard = {
    state: {
        condition: 'general',
        vitals: [],
        medications: [],
        diary: []
    },

    getActiveProfilePrefix: function() {
        const active = localStorage.getItem('healthPulse_activeProfile') || 'Self';
        return `healthPulse_profile_${active}_`;
    },

    init: function() {
        this.loadState();
        this.bindEvents();
        
        // Initial defaults for form dates
        const dateInputs = document.querySelectorAll('input[type="date"]');
        const today = new Date().toISOString().split('T')[0];
        dateInputs.forEach(input => {
            if (!input.value) input.value = today;
        });
        
        this.refresh();
    },

    loadState: function() {
        try {
            const prefix = this.getActiveProfilePrefix();
            
            // Reset state defaults
            this.state.vitals = [];
            this.state.medications = [];
            this.state.condition = 'general';
            this.state.diary = [];

            const vitalsStr = localStorage.getItem(prefix + 'vitals');
            if (vitalsStr) this.state.vitals = JSON.parse(vitalsStr);

            const medsStr = localStorage.getItem(prefix + 'medications');
            if (medsStr) this.state.medications = JSON.parse(medsStr);
            
            const condStr = localStorage.getItem(prefix + 'conditions');
            if (condStr) {
                const conds = JSON.parse(condStr);
                if (conds.length > 0) {
                    this.state.condition = conds[0];
                }
            }

            const diaryStr = localStorage.getItem(prefix + 'diary');
            if (diaryStr) this.state.diary = JSON.parse(diaryStr);
            
            const conditionSelect = document.getElementById('condition-select');
            if (conditionSelect) {
                conditionSelect.value = this.state.condition;
            }
        } catch (e) {
            console.error('Error loading state:', e);
        }
    },

    saveState: function() {
        try {
            const prefix = this.getActiveProfilePrefix();
            localStorage.setItem(prefix + 'vitals', JSON.stringify(this.state.vitals));
            localStorage.setItem(prefix + 'medications', JSON.stringify(this.state.medications));
            localStorage.setItem(prefix + 'diary', JSON.stringify(this.state.diary));
            if (this.state.condition) {
                localStorage.setItem(prefix + 'conditions', JSON.stringify([this.state.condition]));
            }
        } catch (e) {
            console.error('Error saving state:', e);
        }
    },

    bindEvents: function() {
        // 1. Condition select
        const conditionSelect = document.getElementById('condition-select');
        if (conditionSelect) {
            conditionSelect.addEventListener('change', (e) => {
                this.state.condition = e.target.value;
                this.saveState();
                this.refresh();
                if (window.showToast) window.showToast('Condition updated', 'success');
            });
        }

        // 2. Add Vital button
        const addVitalBtn = document.getElementById('add-vital-btn');
        if (addVitalBtn) {
            addVitalBtn.addEventListener('click', () => {
                if (window.App) window.App.showModal('add-vital-modal');
                // Set current date/time as default
                const dateInput = document.getElementById('vital-date-input');
                if (dateInput) {
                    const now = new Date();
                    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
                    dateInput.value = now.toISOString().slice(0,16);
                }
            });
        }

        // 3. Save Vital button
        const saveVitalBtn = document.getElementById('save-vital-btn');
        if (saveVitalBtn) {
            saveVitalBtn.addEventListener('click', () => {
                const typeSelect = document.getElementById('vital-type-select');
                const valueInput = document.getElementById('vital-value-input');
                const dateInput = document.getElementById('vital-date-input');
                
                if (!typeSelect || !valueInput || !dateInput) return;
                
                const type = typeSelect.value;
                const rawValue = valueInput.value.trim();
                const dateVal = dateInput.value;
                
                if (!type) {
                    if (window.showToast) window.showToast('Please select a vital type', 'warning');
                    return;
                }
                if (!rawValue) {
                    if (window.showToast) window.showToast('Please enter a value', 'warning');
                    return;
                }
                if (!dateVal) {
                    if (window.showToast) window.showToast('Please enter a date', 'warning');
                    return;
                }

                let value, value2;
                const vitalDef = VITAL_TYPES[type];

                if (type === 'bloodPressure' && rawValue.includes('/')) {
                    const parts = rawValue.split('/');
                    value = parseFloat(parts[0]);
                    value2 = parseFloat(parts[1]);
                    if (isNaN(value) || isNaN(value2)) {
                        if (window.showToast) window.showToast('Invalid blood pressure format (use SYS/DIA)', 'error');
                        return;
                    }
                } else {
                    value = parseFloat(rawValue);
                    if (isNaN(value)) {
                        if (window.showToast) window.showToast('Value must be a number', 'error');
                        return;
                    }
                    if (vitalDef && !vitalDef.dual && (value < vitalDef.min || value > vitalDef.max)) {
                         if (window.showToast) window.showToast(`Value out of reasonable range (${vitalDef.min}-${vitalDef.max})`, 'warning');
                         return;
                    }
                }

                const vitalObj = {
                    id: Date.now(),
                    type: type,
                    value: value,
                    value2: value2,
                    unit: vitalDef ? vitalDef.unit : '',
                    date: new Date(dateVal).toISOString(),
                    timestamp: new Date(dateVal).getTime()
                };

                this.state.vitals.push(vitalObj);
                this.state.vitals.sort((a, b) => a.timestamp - b.timestamp); // sort chronological
                
                this.saveState();
                
                if (window.App) window.App.hideModal('add-vital-modal');
                
                // reset
                typeSelect.value = '';
                valueInput.value = '';
                
                this.refresh();
                if (window.showToast) window.showToast('Vital added successfully', 'success');
            });
        }

        // 4. Chart vital select
        const chartSelect = document.getElementById('chart-vital-select');
        if (chartSelect) {
            chartSelect.addEventListener('change', () => {
                this.renderChart();
            });
        }

        // 5. Add Med button
        const addMedBtn = document.getElementById('add-med-btn');
        if (addMedBtn) {
            addMedBtn.addEventListener('click', () => {
                if (window.App) window.App.showModal('add-med-modal');
            });
        }

        // 6. Save Med button
        const saveMedBtn = document.getElementById('save-med-btn');
        if (saveMedBtn) {
            saveMedBtn.addEventListener('click', () => {
                const nameInput = document.getElementById('med-name-input');
                const dosageInput = document.getElementById('med-dosage-input');
                const freqSelect = document.getElementById('med-frequency-select');
                const timeInput = document.getElementById('med-time-input');

                if (!nameInput || !nameInput.value.trim()) {
                    if (window.showToast) window.showToast('Medication name is required', 'warning');
                    return;
                }

                const medObj = {
                    id: Date.now(),
                    name: nameInput.value.trim(),
                    dosage: dosageInput ? dosageInput.value.trim() : '',
                    frequency: freqSelect ? freqSelect.value : '',
                    time: timeInput ? timeInput.value : '',
                    taken: false
                };

                this.state.medications.push(medObj);
                this.saveState();

                if (window.App) window.App.hideModal('add-med-modal');

                nameInput.value = '';
                if(dosageInput) dosageInput.value = '';
                if(freqSelect) freqSelect.value = '';
                if(timeInput) timeInput.value = '';

                this.refresh();
                if (window.showToast) window.showToast('Medication added', 'success');
            });
        }

        // 8. Generate Insights button
        const insightsBtn = document.getElementById('get-insights-btn');
        if (insightsBtn) {
            insightsBtn.addEventListener('click', async () => {
                if (window.AIEngine && typeof window.AIEngine.isConfigured === 'function') {
                    if (!window.AIEngine.isConfigured() && !localStorage.getItem('healthPulse_demoMode')) {
                        if (window.App) window.App.showModal('api-key-modal');
                        return;
                    }
                }
                
                const originalText = insightsBtn.innerText;
                insightsBtn.innerText = 'Analyzing...';
                insightsBtn.disabled = true;
                
                try {
                    if (window.AIEngine && typeof window.AIEngine.getHealthInsights === 'function') {
                        const insights = await window.AIEngine.getHealthInsights(this.state.vitals, this.state.condition);
                        this.displayInsights(insights);
                        if (window.showToast) window.showToast('Insights generated successfully', 'success');
                    }
                } catch (error) {
                    console.error("Error generating insights:", error);
                    if (window.showToast) window.showToast(error.message || 'Error generating insights', 'error');
                } finally {
                    insightsBtn.innerText = originalText;
                    insightsBtn.disabled = false;
                }
            });
        }

        // 9. Add Diary entry button
        const addDiaryBtn = document.getElementById('add-diary-btn');
        if (addDiaryBtn) {
            addDiaryBtn.addEventListener('click', () => {
                if (window.App) window.App.showModal('log-diary-modal');
                // Set default date/time
                const dateInput = document.getElementById('diary-date-input');
                if (dateInput) {
                    const now = new Date();
                    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
                    dateInput.value = now.toISOString().slice(0, 16);
                }
            });
        }

        // 10. Save Diary entry button
        const saveDiaryBtn = document.getElementById('save-diary-btn');
        if (saveDiaryBtn) {
            saveDiaryBtn.addEventListener('click', () => {
                const symptomInput = document.getElementById('diary-symptom-input');
                const severitySlider = document.getElementById('diary-severity-slider');
                const notesInput = document.getElementById('diary-notes-input');
                const dateInput = document.getElementById('diary-date-input');

                if (!symptomInput || !symptomInput.value.trim()) {
                    if (window.showToast) window.showToast('Symptom name is required', 'warning');
                    return;
                }

                const entry = {
                    id: Date.now(),
                    symptom: symptomInput.value.trim(),
                    severity: parseInt(severitySlider ? severitySlider.value : '3', 10),
                    notes: notesInput ? notesInput.value.trim() : '',
                    timestamp: dateInput && dateInput.value ? new Date(dateInput.value).getTime() : Date.now()
                };

                if (!this.state.diary) this.state.diary = [];
                this.state.diary.push(entry);
                this.saveState();

                if (window.App) window.App.hideModal('log-diary-modal');

                // Reset
                symptomInput.value = '';
                if (severitySlider) severitySlider.value = 3;
                if (notesInput) notesInput.value = '';

                this.refresh();
                if (window.showToast) window.showToast('Symptom entry logged', 'success');
            });
        }
    },

    refresh: function() {
        this.renderHealthScore();
        this.renderChart();
        this.renderVitalsList();
        this.renderMedications();
        this.renderSymptomDiary();
    },

    renderHealthScore: function() {
        // Calculate a basic health score based on vitals being in normal range
        let score = 85; // default good score
        let abnormalCount = 0;
        
        if (this.state.vitals.length > 0) {
            const recentVitals = this.state.vitals.slice(-10); // Check last 10
            recentVitals.forEach(v => {
                const def = VITAL_TYPES[v.type];
                if (def && !def.dual && def.normalMin !== undefined && def.normalMax !== undefined) {
                    if (v.value < def.normalMin || v.value > def.normalMax) {
                        abnormalCount++;
                    }
                }
            });
            score = Math.max(30, 95 - (abnormalCount * 10)); // Deduct points for abnormals
        }

        const scoreContainer = document.getElementById('health-score-svg');
        const scoreLabel = document.getElementById('health-score-label');
        const scoreDesc = document.getElementById('health-score-desc');
        
        if (scoreLabel) scoreLabel.textContent = score;
        
        let desc = "Good";
        let color = "var(--color-accent)";
        if (score < 60) { desc = "Needs Attention"; color = "var(--color-danger)"; }
        else if (score < 80) { desc = "Fair"; color = "var(--color-warning)"; }
        else { desc = "Excellent"; color = "var(--color-accent)"; }
        
        if (scoreDesc) {
            scoreDesc.textContent = desc;
            scoreDesc.style.color = color;
        }

        if (scoreContainer && window.Charts) {
            if (scoreContainer.innerHTML.trim() === '') {
                if (typeof window.Charts.createCircularProgress === 'function') {
                    window.Charts.createCircularProgress(scoreContainer, score, 100, { color: color, size: 160, strokeWidth: 10, showText: false });
                }
            } else {
                if (typeof window.Charts.updateCircularProgress === 'function') {
                    window.Charts.updateCircularProgress(scoreContainer, score, 100);
                }
            }
        }
    },

    renderChart: function() {
        const chartContainer = document.getElementById('vitals-chart-svg');
        const select = document.getElementById('chart-vital-select');
        if (!chartContainer || !select || !window.Charts) return;

        const type = select.value;
        const relevantVitals = this.state.vitals.filter(v => v.type === type).sort((a,b) => a.timestamp - b.timestamp);

        if (relevantVitals.length === 0) {
            chartContainer.innerHTML = '<text x="50%" y="50%" text-anchor="middle" fill="var(--color-text-dim)">No data available</text>';
            return;
        }

        // Format for Charts helper
        const chartData = relevantVitals.map(v => {
            const date = new Date(v.timestamp);
            return {
                label: `${date.getMonth()+1}/${date.getDate()}`,
                value: v.value,
                value2: v.value2
            };
        });

        const color = VITAL_TYPES[type] ? VITAL_TYPES[type].color : 'var(--color-accent)';

        if (chartContainer.querySelector('path.line-path')) {
            if (typeof window.Charts.updateLineChart === 'function') {
                window.Charts.updateLineChart(chartContainer, chartData, { color: color });
            }
        } else {
            chartContainer.innerHTML = ''; // clear "no data" message
            if (typeof window.Charts.createLineChart === 'function') {
                window.Charts.createLineChart(chartContainer, chartData, { color: color, showDots: true, showGrid: true, showLabels: true });
            }
        }
    },

    renderVitalsList: function() {
        const list = document.getElementById('vitals-list');
        if (!list) return;
        
        list.innerHTML = '';
        
        if (this.state.vitals.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'empty-state';
            empty.style.padding = '20px';
            empty.style.textAlign = 'center';
            empty.style.color = 'var(--color-text-dim)';
            empty.textContent = 'No vitals recorded yet. Add some to get started.';
            list.appendChild(empty);
            return;
        }

        const recent = [...this.state.vitals].sort((a,b) => b.timestamp - a.timestamp).slice(0, 10);

        recent.forEach(v => {
            const def = VITAL_TYPES[v.type] || { icon: '📊', label: v.type, unit: '' };
            let isAbnormal = false;
            let displayVal = `${v.value}`;
            
            if (def.dual && v.value !== undefined && v.value2 !== undefined) {
                displayVal = `${v.value}/${v.value2}`;
            }

            if (!def.dual && def.normalMin !== undefined && def.normalMax !== undefined) {
                if (v.value < def.normalMin || v.value > def.normalMax) {
                    isAbnormal = true;
                }
            }

            const card = document.createElement('div');
            card.className = 'vital-card glass-card';
            card.style.display = 'flex';
            card.style.justifyContent = 'space-between';
            card.style.alignItems = 'center';
            card.style.padding = '15px';
            card.style.marginBottom = '10px';
            if (isAbnormal) {
                card.style.borderLeft = '4px solid var(--color-danger)';
            }

            const left = document.createElement('div');
            left.style.display = 'flex';
            left.style.alignItems = 'center';
            left.style.gap = '15px';
            left.innerHTML = `
                <div style="font-size: 24px;">${def.icon}</div>
                <div>
                    <div style="font-weight: 600; color: var(--color-text);">${def.label}</div>
                    <div style="font-size: 12px; color: var(--color-text-dim);">${new Date(v.timestamp).toLocaleString()}</div>
                </div>
            `;

            const right = document.createElement('div');
            right.style.display = 'flex';
            right.style.alignItems = 'center';
            right.style.gap = '10px';
            
            const valSpan = document.createElement('span');
            valSpan.style.fontSize = '18px';
            valSpan.style.fontWeight = 'bold';
            valSpan.style.color = isAbnormal ? 'var(--color-danger)' : 'var(--color-accent)';
            valSpan.textContent = `${displayVal} ${v.unit}`;
            
            right.appendChild(valSpan);
            
            if (isAbnormal) {
                const warn = document.createElement('span');
                warn.textContent = '⚠️';
                warn.title = 'Outside normal range';
                right.appendChild(warn);
            }

            card.appendChild(left);
            card.appendChild(right);
            list.appendChild(card);
        });
    },

    renderMedications: function() {
        const list = document.getElementById('med-list');
        if (!list) return;
        
        list.innerHTML = '';

        if (this.state.medications.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'empty-state';
            empty.style.padding = '20px';
            empty.style.textAlign = 'center';
            empty.style.color = 'var(--color-text-dim)';
            empty.textContent = 'No medications added yet.';
            list.appendChild(empty);
            return;
        }

        this.state.medications.forEach(med => {
            const card = document.createElement('div');
            card.className = 'med-card glass-card';
            card.style.display = 'flex';
            card.style.justifyContent = 'space-between';
            card.style.alignItems = 'center';
            card.style.padding = '15px';
            card.style.marginBottom = '10px';
            card.style.cursor = 'pointer';
            card.style.transition = 'all 0.3s ease';
            
            if (med.taken) {
                card.style.opacity = '0.6';
                card.style.backgroundColor = 'rgba(100, 255, 218, 0.1)';
            }

            // 7. Click toggles taken
            card.addEventListener('click', () => {
                med.taken = !med.taken;
                this.saveState();
                this.refresh();
            });

            const left = document.createElement('div');
            left.style.display = 'flex';
            left.style.alignItems = 'center';
            left.style.gap = '15px';
            left.innerHTML = `
                <div style="font-size: 24px;">💊</div>
                <div>
                    <div style="font-weight: 600; color: var(--color-text); text-decoration: ${med.taken ? 'line-through' : 'none'};">${med.name}</div>
                    <div style="font-size: 13px; color: var(--color-text-dim);">${med.dosage} - ${med.frequency} at ${med.time}</div>
                </div>
            `;

            const right = document.createElement('div');
            const check = document.createElement('div');
            check.style.width = '24px';
            check.style.height = '24px';
            check.style.borderRadius = '50%';
            check.style.border = `2px solid ${med.taken ? 'var(--color-accent)' : 'var(--color-text-dim)'}`;
            check.style.display = 'flex';
            check.style.alignItems = 'center';
            check.style.justifyContent = 'center';
            check.style.backgroundColor = med.taken ? 'var(--color-accent)' : 'transparent';
            
            if (med.taken) {
                check.innerHTML = '<span style="color: #0a192f; font-size: 14px;">✓</span>';
            }

            right.appendChild(check);
            card.appendChild(left);
            card.appendChild(right);
            list.appendChild(card);
        });
    },

    displayInsights: function(insights) {
        const container = document.getElementById('insights-content');
        if (!container) return;

        container.innerHTML = '';
        
        // Assessment
        const assessment = insights.overallAssessment || insights.assessment;
        if (assessment) {
            const p = document.createElement('p');
            p.style.marginBottom = '20px';
            p.style.color = 'var(--color-text)';
            p.textContent = assessment;
            container.appendChild(p);
        }

        // Alerts
        if (insights.alerts && insights.alerts.length > 0) {
            const alertsDiv = document.createElement('div');
            alertsDiv.style.marginBottom = '20px';
            insights.alerts.forEach(alert => {
                const alertEl = document.createElement('div');
                alertEl.className = 'alert-banner alert-banner--warning glass-card';
                alertEl.style.padding = '12px 15px';
                alertEl.style.marginBottom = '10px';
                alertEl.style.borderLeft = '4px solid var(--color-danger)';
                alertEl.style.backgroundColor = 'rgba(255, 107, 107, 0.1)';
                alertEl.style.color = 'var(--color-danger)';
                alertEl.innerHTML = `<strong>⚠️ Alert:</strong> ${alert}`;
                alertsDiv.appendChild(alertEl);
            });
            container.appendChild(alertsDiv);
        }

        // Trends
        if (insights.trends && insights.trends.length > 0) {
            const trendsTitle = document.createElement('h4');
            trendsTitle.textContent = 'Trends';
            trendsTitle.style.color = 'var(--color-secondary)';
            trendsTitle.style.marginBottom = '10px';
            container.appendChild(trendsTitle);
            
            const trendsDiv = document.createElement('div');
            trendsDiv.style.display = 'grid';
            trendsDiv.style.gridTemplateColumns = 'repeat(auto-fit, minmax(200px, 1fr))';
            trendsDiv.style.gap = '15px';
            trendsDiv.style.marginBottom = '20px';
            
            insights.trends.forEach(trendItem => {
                const trendStr = typeof trendItem === 'string' ? trendItem : (trendItem.trend || trendItem.direction || JSON.stringify(trendItem));
                const trendEl = document.createElement('div');
                trendEl.className = 'glass-card';
                trendEl.style.padding = '15px';
                trendEl.innerHTML = `<span style="font-size: 20px; display: block; margin-bottom: 5px;">📈</span> <span style="color: var(--color-text); font-size: 14px;">${trendStr}</span>`;
                trendsDiv.appendChild(trendEl);
            });
            container.appendChild(trendsDiv);
        }

        // Recommendations
        if (insights.recommendations && insights.recommendations.length > 0) {
            const recTitle = document.createElement('h4');
            recTitle.textContent = 'Recommendations';
            recTitle.style.color = 'var(--color-secondary)';
            recTitle.style.marginBottom = '10px';
            container.appendChild(recTitle);

            const recList = document.createElement('ul');
            recList.style.listStyleType = 'none';
            recList.style.padding = '0';
            recList.style.margin = '0 0 20px 0';

            insights.recommendations.forEach(rec => {
                const li = document.createElement('li');
                li.style.padding = '8px 0';
                li.style.color = 'var(--color-text)';
                li.style.display = 'flex';
                li.style.alignItems = 'flex-start';
                li.style.gap = '10px';
                li.innerHTML = `<span style="color: var(--color-accent);">→</span> <span>${rec}</span>`;
                recList.appendChild(li);
            });
            container.appendChild(recList);
        }

        // Encouragement
        if (insights.encouragement) {
            const enc = document.createElement('p');
            enc.style.fontStyle = 'italic';
            enc.style.color = 'var(--color-text-dim)';
            enc.style.marginTop = '20px';
            enc.style.textAlign = 'center';
            enc.textContent = `"${insights.encouragement}"`;
            container.appendChild(enc);
        }
    },

    openDiaryModalWithSymptom: function(symptom, urgency) {
        if (window.App) window.App.showModal('log-diary-modal');
        
        const symptomInput = document.getElementById('diary-symptom-input');
        const severitySlider = document.getElementById('diary-severity-slider');
        const notesInput = document.getElementById('diary-notes-input');
        const dateInput = document.getElementById('diary-date-input');

        if (symptomInput) symptomInput.value = symptom;
        if (notesInput) notesInput.value = `Logged via AI Triage Assessment. Urgency level: ${urgency.toUpperCase()}.`;
        
        if (severitySlider) {
            if (urgency === 'emergency') severitySlider.value = 5;
            else if (urgency === 'high') severitySlider.value = 4;
            else if (urgency === 'medium') severitySlider.value = 3;
            else severitySlider.value = 2;
        }

        if (dateInput) {
            const now = new Date();
            now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
            dateInput.value = now.toISOString().slice(0, 16);
        }
    },

    renderSymptomDiary: function() {
        const list = document.getElementById('diary-list');
        if (!list) return;

        list.innerHTML = '';

        if (!this.state.diary || this.state.diary.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'empty-state';
            empty.style.padding = '20px';
            empty.style.textAlign = 'center';
            empty.style.color = 'var(--color-text-dim)';
            empty.innerHTML = `
                <span class="empty-icon">📝</span>
                <p>No symptoms logged yet</p>
                <p class="empty-hint">Track daily symptoms to identify wellness patterns</p>
            `;
            list.appendChild(empty);
            return;
        }

        // Sort descending by timestamp
        const sortedDiary = [...this.state.diary].sort((a, b) => b.timestamp - a.timestamp);

        const listContainer = document.createElement('div');
        listContainer.className = 'diary-list';

        sortedDiary.forEach(item => {
            const itemDiv = document.createElement('div');
            let severityClass = '';
            if (item.severity >= 4) severityClass = 'diary-item--severe';
            else if (item.severity >= 3) severityClass = 'diary-item--moderate';
            
            itemDiv.className = `diary-item ${severityClass}`;

            const timeStr = new Date(item.timestamp).toLocaleString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            itemDiv.innerHTML = `
                <div class="diary-item-time">${timeStr}</div>
                <div class="diary-item-content">
                  <div class="diary-item-title">${item.symptom} <span style="float:right; font-size:0.75rem; padding: 2px 8px; border-radius:10px; background: rgba(255,255,255,0.05); color: var(--color-primary);">Severity: ${item.severity}/5</span></div>
                  ${item.notes ? `<div class="diary-item-notes">${item.notes}</div>` : ''}
                </div>
            `;
            listContainer.appendChild(itemDiv);
        });

        list.appendChild(listContainer);
    }
};

window.Dashboard = Dashboard;
