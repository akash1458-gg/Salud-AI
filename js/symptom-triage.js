const SYMPTOM_MAP = {
  head: ['Headache', 'Dizziness', 'Migraine', 'Pressure', 'Blurred vision'],
  face: ['Facial pain', 'Swelling', 'Numbness', 'Jaw pain', 'Sinus pressure'],
  neck: ['Stiffness', 'Pain', 'Swelling', 'Limited motion', 'Sore throat'],
  chest: ['Chest pain', 'Tightness', 'Shortness of breath', 'Palpitations', 'Cough'],
  upperAbdomen: ['Nausea', 'Bloating', 'Acid reflux', 'Upper pain', 'Loss of appetite'],
  lowerAbdomen: ['Cramping', 'Lower pain', 'Bloating', 'Constipation', 'Diarrhea'],
  leftShoulder: ['Pain', 'Stiffness', 'Swelling', 'Weakness', 'Clicking'],
  rightShoulder: ['Pain', 'Stiffness', 'Swelling', 'Weakness', 'Clicking'],
  leftArm: ['Pain', 'Numbness', 'Tingling', 'Weakness', 'Swelling'],
  rightArm: ['Pain', 'Numbness', 'Tingling', 'Weakness', 'Swelling'],
  leftHand: ['Pain', 'Numbness', 'Swelling', 'Stiffness', 'Tremor'],
  rightHand: ['Pain', 'Numbness', 'Swelling', 'Stiffness', 'Tremor'],
  leftThigh: ['Pain', 'Cramping', 'Numbness', 'Weakness', 'Swelling'],
  rightThigh: ['Pain', 'Cramping', 'Numbness', 'Weakness', 'Swelling'],
  leftKnee: ['Pain', 'Swelling', 'Stiffness', 'Clicking', 'Instability'],
  rightKnee: ['Pain', 'Swelling', 'Stiffness', 'Clicking', 'Instability'],
  leftFoot: ['Pain', 'Swelling', 'Numbness', 'Cramping', 'Tingling'],
  rightFoot: ['Pain', 'Swelling', 'Numbness', 'Cramping', 'Tingling']
};

window.SymptomTriage = {
  selectedRegions: new Set(),
  selectedSymptoms: new Set(),
  isBackView: false,
  intakeState: {
    active: false,
    questionIndex: 0,
    questions: [
      { key: 'firstTime', text: "Is this the first time you've experienced these symptoms?", answer: null },
      { key: 'activity', text: "Are the symptoms worse during physical activity or stress?", answer: null },
      { key: 'familyHistory', text: "Do you have any family history of chronic conditions related to these symptoms?", answer: null },
      { key: 'associated', text: "Are you experiencing any associated symptoms like fever, nausea, or dizziness?", answer: null }
    ],
    data: null
  },

  init() {
    this.renderBodyMap();
    this.bindEvents();
  },

  renderBodyMap() {
    const container = document.getElementById('body-map-container');
    if (!container) return;

    const svgContent = `
      <svg viewBox="0 0 200 480" style="width:100%; height:100%; position:relative;" class="human-body-svg" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bodyFill" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#C9DBCF" stop-opacity="0.2" />
            <stop offset="50%" stop-color="#2F6F63" stop-opacity="0.3" />
            <stop offset="100%" stop-color="#C9DBCF" stop-opacity="0.2" />
          </linearGradient>
          <radialGradient id="bodyCenter" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#2F6F63" stop-opacity="0.15" />
            <stop offset="100%" stop-color="#2F6F63" stop-opacity="0" />
          </radialGradient>
          <linearGradient id="scanGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="transparent" />
            <stop offset="50%" stop-color="#2F6F63" stop-opacity="0.4" />
            <stop offset="100%" stop-color="transparent" />
          </linearGradient>
        </defs>

        <!-- Background body silhouette -->
        <path d="M100,12 
                 C120,12 125,30 120,55 
                 C118,60 115,66 110,68 
                 C130,70 150,75 160,95
                 C165,120 170,170 175,190
                 C175,200 160,205 155,195
                 C150,170 145,120 140,105
                 C135,160 135,220 135,240
                 C135,300 135,440 135,450
                 C135,465 110,465 110,450
                 C110,380 110,300 105,250
                 C100,250 100,250 95,250
                 C90,300 90,380 90,450
                 C90,465 65,465 65,450
                 C65,440 65,300 65,240
                 C65,220 65,160 60,105
                 C55,120 50,170 45,195
                 C40,205 25,200 25,190
                 C30,170 35,120 40,95
                 C50,75 70,70 90,68
                 C85,66 82,60 80,55
                 C75,30 80,12 100,12 Z" 
              fill="url(#bodyFill)" opacity="0.8" />
              
        <circle cx="100" cy="115" r="50" fill="url(#bodyCenter)" opacity="0.5" />

        <!-- 3D contours (simplified, clean) -->
        <path d="M82,42 C90,48 110,48 118,42" stroke="rgba(47, 111, 99, 0.15)" stroke-width="1" fill="none" />
        <path d="M92,68 C96,72 104,72 108,68" stroke="rgba(47, 111, 99, 0.15)" stroke-width="1" fill="none" />
        <path d="M64,110 C80,122 120,122 136,110" stroke="rgba(47, 111, 99, 0.15)" stroke-width="1" fill="none" />
        <path d="M64,135 C80,147 120,147 136,135" stroke="rgba(47, 111, 99, 0.15)" stroke-width="1" fill="none" />
        <path d="M67,165 C80,175 120,175 133,165" stroke="rgba(47, 111, 99, 0.15)" stroke-width="1" fill="none" />
        <path d="M67,195 C80,205 120,205 133,195" stroke="rgba(47, 111, 99, 0.12)" stroke-width="1" fill="none" />
        <path d="M66,225 C80,235 120,235 134,225" stroke="rgba(47, 111, 99, 0.12)" stroke-width="1" fill="none" />
        <path d="M58,260 C68,265 80,265 88,260" stroke="rgba(47, 111, 99, 0.12)" stroke-width="0.75" fill="none" />
        <path d="M112,260 C120,265 132,265 142,260" stroke="rgba(47, 111, 99, 0.12)" stroke-width="0.75" fill="none" />
        <path d="M60,380 C68,385 80,385 88,380" stroke="rgba(47, 111, 99, 0.12)" stroke-width="0.75" fill="none" />
        <path d="M112,380 C120,385 132,385 142,380" stroke="rgba(47, 111, 99, 0.12)" stroke-width="0.75" fill="none" />

        <!-- Detail Spine / Core -->
        <line x1="100" y1="75" x2="100" y2="238" stroke="rgba(47, 111, 99, 0.15)" stroke-width="1.5" stroke-dasharray="2,3" />
        
        <!-- Pulse Core -->
        <circle cx="100" cy="115" r="4" fill="#2F6F63" />
        <circle cx="100" cy="115" r="10" stroke="#2F6F63" stroke-width="1.2" fill="none" opacity="0.4" style="transform-origin: center; animation: pulse-ring 3s infinite ease-out;" />

        <circle cx="56" cy="92" r="3" stroke="rgba(47, 111, 99, 0.1)" fill="none" />
        <circle cx="144" cy="92" r="3" stroke="rgba(47, 111, 99, 0.1)" fill="none" />
        <circle cx="76" cy="342" r="3" stroke="rgba(47, 111, 99, 0.1)" fill="none" />
        <circle cx="124" cy="342" r="3" stroke="rgba(47, 111, 99, 0.1)" fill="none" />

        <!-- Clickable Regions -->
        <g stroke="rgba(47, 111, 99, 0.15)" stroke-width="1" fill="transparent" class="interactive-regions" style="cursor:pointer;">
          <ellipse class="body-region" data-region="head" data-label="Head" cx="100" cy="40" rx="22" ry="28" />
          <path class="body-region" data-region="neck" data-label="Neck" d="M91,66 C98,66 102,66 109,66 C111,74 111,80 111,82 C104,82 96,82 89,82 C89,80 89,74 91,66 Z" />
          <path class="body-region" data-region="chest" data-label="Chest" d="M62,82 C80,75 120,75 138,82 C140,105 138,130 134,152 C115,155 85,155 66,152 C62,130 60,105 62,82 Z" />
          <path class="body-region" data-region="upperAbdomen" data-label="Upper Abdomen" d="M66,152 C85,155 115,155 134,152 C132,170 132,185 132,192 C115,195 85,195 68,192 C68,185 68,170 66,152 Z" />
          <path class="body-region" data-region="lowerAbdomen" data-label="Lower Abdomen" d="M68,192 C85,195 115,195 132,192 C134,210 136,225 134,238 C115,242 85,242 66,238 C64,225 66,210 68,192 Z" />
          <ellipse class="body-region" data-region="leftShoulder" data-label="Left Shoulder" cx="56" cy="92" rx="14" ry="10" />
          <ellipse class="body-region" data-region="rightShoulder" data-label="Right Shoulder" cx="144" cy="92" rx="14" ry="10" />
          <path class="body-region" data-region="leftArm" data-label="Left Arm" d="M48,100 C45,120 42,140 40,165 C33,165 30,140 34,100 C40,98 45,98 48,100 Z" />
          <path class="body-region" data-region="rightArm" data-label="Right Arm" d="M152,100 C155,120 158,140 160,165 C167,165 170,140 166,100 C160,98 155,98 152,100 Z" />
          <ellipse class="body-region" data-region="leftHand" data-label="Left Hand" cx="34" cy="195" rx="7" ry="12" />
          <ellipse class="body-region" data-region="rightHand" data-label="Right Hand" cx="166" cy="195" rx="7" ry="12" />
          <path class="body-region" data-region="leftThigh" data-label="Left Thigh" d="M78,238 C80,260 82,290 76,330 C60,330 58,290 56,238 C64,235 70,235 78,238 Z" />
          <path class="body-region" data-region="rightThigh" data-label="Right Thigh" d="M122,238 C120,260 118,290 124,330 C140,330 142,290 144,238 C136,235 130,235 122,238 Z" />
          <circle class="body-region" data-region="leftKnee" data-label="Left Knee" cx="76" cy="342" r="12" />
          <circle class="body-region" data-region="rightKnee" data-label="Right Knee" cx="124" cy="342" r="12" />
          <path class="body-region" data-region="leftFoot" data-label="Left Foot/Leg" d="M76,354 C80,380 80,410 72,458 C62,458 60,410 64,354 C68,354 72,354 76,354 Z" />
          <path class="body-region" data-region="rightFoot" data-label="Right Foot/Leg" d="M124,354 C120,380 120,410 128,458 C138,458 140,410 136,354 C132,354 128,354 124,354 Z" />
        </g>
        
        <rect id="scan-line" x="0" y="-10" width="200" height="1" fill="url(#scanGrad)" style="animation: scan-line 4s infinite linear; pointer-events:none;" />
        
        <text id="body-tooltip" x="0" y="0" font-size="14" font-family="'IBM Plex Sans', sans-serif" fill="#1C2B2A" style="display:none; pointer-events:none; font-weight: 500;">Tooltip</text>
      </svg>
    `;

    container.innerHTML = svgContent;

    const style = document.createElement('style');
    style.textContent = `
      @keyframes scan-line {
        0% { transform: translateY(0); opacity: 0; }
        10% { opacity: 1; }
        90% { opacity: 1; }
        100% { transform: translateY(480px); opacity: 0; }
      }
      @keyframes pulse-ring {
        0% { transform: scale(0.6); opacity: 0.6; }
        100% { transform: scale(2.2); opacity: 0; }
      }
      .body-region:hover {
        fill: rgba(47, 111, 99, 0.12) !important;
        stroke: #2F6F63 !important;
      }
      .body-region--selected {
        fill: rgba(47, 111, 99, 0.25) !important;
        stroke: #2F6F63 !important;
      }
    `;
    document.head.appendChild(style);
  },

  bindEvents() {
    const container = document.getElementById('body-map-container');
    if (container) {
      const tooltip = container.querySelector('#body-tooltip');
      const svg = container.querySelector('svg');
      
      container.addEventListener('click', (e) => {
        const regionEl = e.target.closest('.body-region');
        if (regionEl) {
          const region = regionEl.getAttribute('data-region');
          this.toggleRegion(region, regionEl);
        }
      });

      container.addEventListener('mousemove', (e) => {
        const regionEl = e.target.closest('.body-region');
        if (regionEl && tooltip && svg) {
          const label = regionEl.getAttribute('data-label');
          tooltip.textContent = label;
          tooltip.style.display = 'block';
          
          const pt = svg.createSVGPoint();
          pt.x = e.clientX;
          pt.y = e.clientY;
          const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());
          
          tooltip.setAttribute('x', svgP.x + 5);
          tooltip.setAttribute('y', svgP.y - 5);
        } else if (tooltip) {
          tooltip.style.display = 'none';
        }
      });
    }

    const addSymptomBtn = document.getElementById('add-symptom-btn');
    const customSymptomInput = document.getElementById('custom-symptom');
    
    if (addSymptomBtn && customSymptomInput) {
      addSymptomBtn.addEventListener('click', () => {
        const val = customSymptomInput.value.trim();
        if (val) {
          this.addCustomSymptom(val);
          customSymptomInput.value = '';
        }
      });
      customSymptomInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          addSymptomBtn.click();
        }
      });
    }

    const analyzeBtn = document.getElementById('analyze-btn');
    if (analyzeBtn) {
      analyzeBtn.addEventListener('click', () => this.startIntakeAssessment());
    }

    // Trigger emergency popup when severity slider is dragged to max (5 = Severe)
    const severitySlider = document.getElementById('severity-slider');
    if (severitySlider) {
      severitySlider.addEventListener('input', (e) => {
        if (parseInt(e.target.value) >= 5) {
          const emergencyModal = document.getElementById('emergency-modal');
          if (emergencyModal) {
            emergencyModal.classList.add('active');
          }
        }
      });
    }

    const chatCloseBtn = document.getElementById('chat-close-btn');
    if (chatCloseBtn) {
      chatCloseBtn.addEventListener('click', () => this.reset());
    }

    const chatSendBtn = document.getElementById('chat-send-btn');
    const chatInput = document.getElementById('chat-input');
    
    if (chatSendBtn && chatInput) {
      chatSendBtn.addEventListener('click', () => this.sendChatMessage());
      chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          chatSendBtn.click();
        }
      });
    }

    // Intake buttons
    const yesBtn = document.getElementById('intake-yes-btn');
    const noBtn = document.getElementById('intake-no-btn');
    const unsureBtn = document.getElementById('intake-unsure-btn');
    const backBtn = document.getElementById('intake-back-btn');
    const closeBtn = document.getElementById('intake-close-btn');

    if (yesBtn) yesBtn.addEventListener('click', () => this.answerIntakeQuestion('Yes'));
    if (noBtn) noBtn.addEventListener('click', () => this.answerIntakeQuestion('No'));
    if (unsureBtn) unsureBtn.addEventListener('click', () => this.answerIntakeQuestion('Unsure'));
    if (backBtn) backBtn.addEventListener('click', () => this.previousIntakeQuestion());
    if (closeBtn) closeBtn.addEventListener('click', () => this.abortIntakeAssessment());
  },

  toggleRegion(region, element) {
    if (this.selectedRegions.has(region)) {
      this.selectedRegions.delete(region);
      element.classList.remove('body-region--selected');
    } else {
      this.selectedRegions.add(region);
      element.classList.add('body-region--selected');
    }
    
    this.updateRegionChips();
    this.updateSymptomOptions();
    this.checkAnalyzeButton();
  },

  updateRegionChips() {
    const container = document.getElementById('selected-regions');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (this.selectedRegions.size === 0) {
      container.innerHTML = '<span style="font-size: 0.75rem; color: var(--color-text-dim); font-style: italic;">Click body regions to select</span>';
      return;
    }

    this.selectedRegions.forEach(region => {
      const el = document.querySelector(`.body-region[data-region="${region}"]`);
      const label = el ? el.getAttribute('data-label') : this.formatRegionName(region);
      
      const chip = document.createElement('div');
      chip.className = 'chip chip--removable';
      chip.innerHTML = `
        ${label}
        <span class="remove-region" data-region="${region}" style="cursor: pointer; font-size: 1.2em; margin-left: 0.25rem;">&times;</span>
      `;
      container.appendChild(chip);
    });

    container.querySelectorAll('.remove-region').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const region = e.currentTarget.getAttribute('data-region');
        const el = document.querySelector(`.body-region[data-region="${region}"]`);
        if (el) {
          this.toggleRegion(region, el);
        }
      });
    });
  },

  formatRegionName(region) {
    return region.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  },

  updateSymptomOptions() {
    const container = document.getElementById('symptom-chips');
    if (!container) return;
    
    const availableSymptoms = new Set();
    this.selectedRegions.forEach(region => {
      const symptoms = SYMPTOM_MAP[region] || [];
      symptoms.forEach(s => availableSymptoms.add(s));
    });

    if (availableSymptoms.size === 0 && this.selectedSymptoms.size === 0) {
      container.innerHTML = '<p style="font-size: 0.75rem; color: var(--color-text-dim); font-style: italic;">Select a body region to see common symptoms.</p>';
      return;
    }

    container.innerHTML = '';
    
    const sortedSymptoms = Array.from(availableSymptoms).sort();
    
    sortedSymptoms.forEach(symptom => {
      const chip = document.createElement('button');
      chip.className = 'chip';
      if (this.selectedSymptoms.has(symptom)) {
        chip.classList.add('chip--active');
      }
      chip.textContent = symptom;
      
      chip.addEventListener('click', () => {
        if (this.selectedSymptoms.has(symptom)) {
          this.selectedSymptoms.delete(symptom);
        } else {
          this.selectedSymptoms.add(symptom);
        }
        this.updateSymptomOptions();
        this.checkAnalyzeButton();
      });
      
      container.appendChild(chip);
    });

    this.selectedSymptoms.forEach(s => {
      if (!availableSymptoms.has(s)) {
        const customChip = document.createElement('button');
        customChip.className = 'chip chip--active chip--removable';
        customChip.innerHTML = `${s} <span style="margin-left: 0.25rem; font-size: 1.2em;">&times;</span>`;
        
        customChip.addEventListener('click', () => {
          this.selectedSymptoms.delete(s);
          this.updateSymptomOptions();
          this.checkAnalyzeButton();
        });
        
        container.appendChild(customChip);
      }
    });

    this.updateAbnormalRegions();
  },

  addCustomSymptom(symptom) {
    if (!symptom || this.selectedSymptoms.has(symptom)) return;
    this.selectedSymptoms.add(symptom);
    this.updateSymptomOptions();
    this.checkAnalyzeButton();
  },

  updateAbnormalRegions() {
    // 1. Remove all red alert highlights first
    document.querySelectorAll('.body-region').forEach(r => {
      r.classList.remove('body-region--abnormal');
    });
    
    // 2. Scan all selected symptoms (both default chips and custom ones)
    this.selectedSymptoms.forEach(symptom => {
      const text = symptom.toLowerCase();
      
      // Keywords mapping to SVG region name selectors
      if (text.includes('head') || text.includes('migraine') || text.includes('brain') || text.includes('dizzy') || text.includes('forehead') || text.includes('scalp') || text.includes('temple')) {
        this.highlightRegion('head');
      }
      if (text.includes('neck') || text.includes('throat') || text.includes('swallow')) {
        this.highlightRegion('neck');
      }
      if (text.includes('chest') || text.includes('heart') || text.includes('lung') || text.includes('breath') || text.includes('cough') || text.includes('cardiac') || text.includes('rib') || text.includes('sternum') || text.includes('tightness') || text.includes('pressure')) {
        this.highlightRegion('chest');
      }
      if (text.includes('stomach') || text.includes('belly') || text.includes('abdominal') || text.includes('stomachache') || text.includes('nausea') || text.includes('vomit') || text.includes('digest') || text.includes('gut') || text.includes('cramping')) {
        this.highlightRegion('upperAbdomen');
        this.highlightRegion('lowerAbdomen');
      }
      if (text.includes('pelvis') || text.includes('hip') || text.includes('groin') || text.includes('bladder')) {
        this.highlightRegion('lowerAbdomen');
      }
      
      // Left limb checks
      if (text.includes('left shoulder')) {
        this.highlightRegion('leftShoulder');
      } else if (text.includes('left arm') || text.includes('left hand') || text.includes('left elbow') || text.includes('left wrist') || text.includes('left finger') || text.includes('left bicep')) {
        this.highlightRegion('leftArm');
        this.highlightRegion('leftHand');
      }
      
      // Right limb checks
      if (text.includes('right shoulder')) {
        this.highlightRegion('rightShoulder');
      } else if (text.includes('right arm') || text.includes('right hand') || text.includes('right elbow') || text.includes('right wrist') || text.includes('right finger') || text.includes('right bicep')) {
        this.highlightRegion('rightArm');
        this.highlightRegion('rightHand');
      }
      
      // Left leg checks
      if (text.includes('left leg') || text.includes('left thigh') || text.includes('left knee') || text.includes('left foot') || text.includes('left toe') || text.includes('left ankle') || text.includes('left calf') || text.includes('left shin') || text.includes('left heel')) {
        this.highlightRegion('leftThigh');
        this.highlightRegion('leftKnee');
        this.highlightRegion('leftFoot');
      }
      
      // Right leg checks
      if (text.includes('right leg') || text.includes('right thigh') || text.includes('right knee') || text.includes('right foot') || text.includes('right toe') || text.includes('right ankle') || text.includes('right calf') || text.includes('right shin') || text.includes('right heel')) {
        this.highlightRegion('rightThigh');
        this.highlightRegion('rightKnee');
        this.highlightRegion('rightFoot');
      }
      
      // General leg checks (without left/right specified)
      if ((text.includes('leg') || text.includes('foot') || text.includes('knee') || text.includes('ankle') || text.includes('calf')) && !text.includes('left') && !text.includes('right')) {
        this.highlightRegion('leftThigh');
        this.highlightRegion('leftKnee');
        this.highlightRegion('leftFoot');
        this.highlightRegion('rightThigh');
        this.highlightRegion('rightKnee');
        this.highlightRegion('rightFoot');
      }
      
      // General arm checks (without left/right specified)
      if ((text.includes('arm') || text.includes('hand') || text.includes('shoulder')) && !text.includes('left') && !text.includes('right')) {
        this.highlightRegion('leftShoulder');
        this.highlightRegion('leftArm');
        this.highlightRegion('leftHand');
        this.highlightRegion('rightShoulder');
        this.highlightRegion('rightArm');
        this.highlightRegion('rightHand');
      }
    });
  },

  highlightRegion(regionName) {
    const el = document.querySelector(`.body-region[data-region="${regionName}"]`);
    if (el) {
      el.classList.add('body-region--abnormal');
    }
  },

  checkAnalyzeButton() {
    const analyzeBtn = document.getElementById('analyze-btn');
    if (!analyzeBtn) return;
    
    // Enable if user has selected symptoms OR typed custom symptoms
    if (this.selectedSymptoms.size > 0) {
      analyzeBtn.removeAttribute('disabled');
    } else {
      analyzeBtn.setAttribute('disabled', 'true');
    }
  },

  startIntakeAssessment() {
    if (!window.AIEngine) {
      if (window.App) window.App.showToast('System error: AI Engine missing', 'error');
      return;
    }

    if (!window.AIEngine.isConfigured() && !window.AIEngine.isDemoMode()) {
      if (window.App) window.App.showModal('api-key-modal');
      return;
    }

    // Reset questions answers
    this.intakeState.questions.forEach(q => q.answer = null);
    this.intakeState.questionIndex = 0;
    this.intakeState.active = true;

    // Gather initial symptoms data
    const severitySlider = document.getElementById('severity-slider');
    const durationSelect = document.getElementById('duration-select');
    
    this.intakeState.data = {
      regions: Array.from(this.selectedRegions),
      symptoms: Array.from(this.selectedSymptoms),
      severity: severitySlider ? severitySlider.value : 3,
      duration: durationSelect ? durationSelect.value : 'days'
    };

    // Show intake UI, hide selector
    const selector = document.getElementById('symptom-selector');
    const intakeEl = document.getElementById('intake-questionnaire');
    const chatContainer = document.getElementById('chat-container');
    const triageResult = document.getElementById('triage-result');

    if (selector) selector.style.display = 'none';
    if (chatContainer) chatContainer.style.display = 'none';
    if (triageResult) triageResult.style.display = 'none';
    if (intakeEl) {
      intakeEl.style.display = 'flex';
      this.renderIntakeQuestion();
    }
  },

  renderIntakeQuestion() {
    const questions = this.intakeState.questions;
    const index = this.intakeState.questionIndex;

    if (index >= questions.length) {
      this.finishIntake();
      return;
    }

    const progressText = document.getElementById('intake-progress-text');
    const progressBar = document.getElementById('intake-progress-bar');
    const questionText = document.getElementById('intake-question-text');

    if (progressText) progressText.textContent = `Question ${index + 1} of ${questions.length}`;
    if (progressBar) progressBar.style.width = `${((index + 1) / questions.length) * 100}%`;
    if (questionText) questionText.textContent = questions[index].text;
  },

  answerIntakeQuestion(answer) {
    const questions = this.intakeState.questions;
    const index = this.intakeState.questionIndex;
    
    questions[index].answer = answer;
    this.intakeState.questionIndex++;
    this.renderIntakeQuestion();
  },

  previousIntakeQuestion() {
    if (this.intakeState.questionIndex > 0) {
      this.intakeState.questionIndex--;
      this.renderIntakeQuestion();
    } else {
      this.abortIntakeAssessment();
    }
  },

  abortIntakeAssessment() {
    this.intakeState.active = false;
    const selector = document.getElementById('symptom-selector');
    const intakeEl = document.getElementById('intake-questionnaire');
    
    if (intakeEl) intakeEl.style.display = 'none';
    if (selector) selector.style.display = 'block';
  },

  async finishIntake() {
    const intakeEl = document.getElementById('intake-questionnaire');
    if (intakeEl) intakeEl.style.display = 'none';

    const chatContainer = document.getElementById('chat-container');
    if (chatContainer) chatContainer.style.display = 'flex';

    this.clearChat();
    this.showTypingIndicator();

    const formattedAnswers = this.intakeState.questions.map(q => `${q.text} -> ${q.answer}`);
    
    // Enrich payload with dynamic intake responses
    const payload = {
      ...this.intakeState.data,
      intakeAnswers: formattedAnswers
    };

    try {
      const result = await window.AIEngine.analyzeSymptoms(payload);
      this.hideTypingIndicator();
      this.addChatMessage('AI', result.summary || 'Here is my initial analysis based on your symptoms.', 'ai');
      this.displayTriageResult(result);
    } catch (error) {
      this.hideTypingIndicator();
      this.addChatMessage('System', 'Sorry, I encountered an error analyzing your symptoms. Please try again.', 'error');
      console.error('Analysis error:', error);
    }
  },

  displayTriageResult(result) {
    if (!result) return;
    
    const resultContainer = document.getElementById('triage-result');
    if (!resultContainer) return;
    
    const urgency = (result.urgency || 'low').toLowerCase();
    const urgencyClass = `urgency-${urgency}`;

    // Trigger emergency response alert automatically
    if (urgency === 'emergency') {
      setTimeout(() => {
        if (window.App && typeof window.App.showModal === 'function') {
          window.App.showModal('emergency-modal');
        }
      }, 500);
    }

    let html = `<div class="urgency-card ${urgencyClass}">`;
    
    html += `<h3 style="text-transform: capitalize; margin-top: 0; display: flex; align-items: center; justify-content: space-between;">
      Urgency: ${urgency}
      ${urgency === 'emergency' ? `<button class="glow-btn btn-emergency-red glow-btn--sm" onclick="window.App.showModal('emergency-modal')">🚨 View Emergency Actions</button>` : ''}
    </h3>`;
    
    const conditions = result.possibleConditions || result.conditions || [];
    if (conditions.length > 0) {
      html += `
        <div style="margin-bottom: 1.5rem; margin-top: 1rem;">
          <h4 style="margin-bottom: 0.75rem; color:var(--color-secondary); font-size:0.95rem; font-weight:600;">Possible Conditions & Probability</h4>
          <div style="display:flex; flex-direction:column; gap:12px;">
            ${conditions.map((c, i) => {
              const probabilities = [85, 55, 30, 15];
              const prob = probabilities[i] || 10;
              let barColor = 'var(--color-primary)';
              if (prob > 70) barColor = 'var(--color-danger)';
              else if (prob > 40) barColor = 'var(--color-warning)';
              return `
                <div>
                  <div style="display:flex; justify-content:space-between; font-size:0.875rem; margin-bottom:4px; font-weight:500;">
                    <span style="color:var(--color-text-bright);">${c}</span>
                    <span style="color:${barColor}; font-weight:600;">${prob}% Likelihood</span>
                  </div>
                  <div style="width:100%; height:6px; background:var(--bg-surface-hover); border-radius:var(--radius-full); overflow:hidden;">
                    <div style="width:${prob}%; height:100%; background:${barColor}; border-radius:var(--radius-full); box-shadow:0 0 8px ${barColor}80;"></div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }
    
    const recommendations = result.recommendations || [];
    if (recommendations.length > 0) {
      html += `
        <div style="margin-bottom: 1rem;">
          <h4 style="margin-bottom: 0.5rem; font-size:0.95rem;">Recommendations</h4>
          <ul style="padding-left: 1.25rem; list-style-type: disc; color: var(--color-text);">
            ${recommendations.map(r => `<li style="margin-bottom:4px;">${r}</li>`).join('')}
          </ul>
        </div>
      `;
    }

    const homeRemedies = result.homeRemedies || [];
    if (homeRemedies.length > 0) {
      html += `
        <div style="margin-bottom: 1rem;">
          <h4 style="margin-bottom: 0.5rem; font-size:0.95rem;">🏠 Home Remedies</h4>
          <ul style="padding-left: 1.25rem; list-style-type: disc; color: var(--color-text);">
            ${homeRemedies.map(r => `<li style="margin-bottom:4px;">${r}</li>`).join('')}
          </ul>
        </div>
      `;
    }
    
    if (result.warningSign || (result.warningSigns && result.warningSigns.length > 0)) {
      html += `
        <div class="alert-banner alert-banner--danger" style="margin-top: 1rem;">
          <h4 style="margin-top: 0; font-size:0.95rem;">⚠️ When to seek immediate care</h4>
          <p style="margin-bottom: 0;">${result.warningSign || (result.warningSigns ? result.warningSigns.join('; ') : '')}</p>
        </div>
      `;
    }

    // ---- TREATMENT PROTOCOL (Hackathon Differentiator) ----
    const tp = result.treatmentProtocol;
    if (tp) {
      html += `<div style="margin-top: 1.5rem; border-top: 1px solid var(--glass-border); padding-top: 1.5rem;">`;
      html += `<h3 style="margin-top: 0; margin-bottom: 1.25rem; font-size: 1.1rem; color: var(--color-primary-dim); font-family: var(--font-heading);">📋 Treatment Protocol</h3>`;
      
      // Immediate Actions
      if (tp.immediateActions && tp.immediateActions.length > 0) {
        html += `
          <div style="margin-bottom: 1.25rem; background: var(--color-danger-glow); border-radius: var(--radius-md); padding: 16px; border-left: 3px solid var(--color-danger);">
            <h4 style="margin-top: 0; margin-bottom: 0.5rem; font-size: 0.9rem; color: #6E2A20;">🚨 Immediate Actions</h4>
            <ol style="padding-left: 1.25rem; color: #6E2A20; margin: 0;">
              ${tp.immediateActions.map(a => `<li style="margin-bottom:4px; font-size:0.875rem;">${a}</li>`).join('')}
            </ol>
          </div>
        `;
      }
      
      // 24-Hour Care Plan
      if (tp.careplan24h && tp.careplan24h.length > 0) {
        html += `
          <div style="margin-bottom: 1.25rem; background: var(--color-primary-glow); border-radius: var(--radius-md); padding: 16px; border-left: 3px solid var(--color-primary);">
            <h4 style="margin-top: 0; margin-bottom: 0.5rem; font-size: 0.9rem; color: var(--color-primary-dim);">🕐 24-Hour Care Plan</h4>
            <ol style="padding-left: 1.25rem; color: var(--color-text); margin: 0;">
              ${tp.careplan24h.map(a => `<li style="margin-bottom:4px; font-size:0.875rem;">${a}</li>`).join('')}
            </ol>
          </div>
        `;
      }
      
      // OTC Medications
      if (tp.otcMedications && tp.otcMedications.length > 0) {
        html += `
          <div style="margin-bottom: 1.25rem; background: var(--bg-surface); border-radius: var(--radius-md); padding: 16px; border: 1px solid var(--glass-border);">
            <h4 style="margin-top: 0; margin-bottom: 0.5rem; font-size: 0.9rem; color: var(--color-text-bright);">💊 OTC Medication Guidance</h4>
            <ul style="padding-left: 1.25rem; list-style-type: disc; color: var(--color-text); margin: 0;">
              ${tp.otcMedications.map(m => `<li style="margin-bottom:4px; font-size:0.875rem;">${m}</li>`).join('')}
            </ul>
          </div>
        `;
      }
      
      // Dietary Advice
      if (tp.dietaryAdvice && tp.dietaryAdvice.length > 0) {
        html += `
          <div style="margin-bottom: 1.25rem; background: var(--color-accent-glow); border-radius: var(--radius-md); padding: 16px; border-left: 3px solid var(--color-accent);">
            <h4 style="margin-top: 0; margin-bottom: 0.5rem; font-size: 0.9rem; color: #204F2E;">🥗 Dietary Recommendations</h4>
            <ul style="padding-left: 1.25rem; list-style-type: disc; color: #204F2E; margin: 0;">
              ${tp.dietaryAdvice.map(d => `<li style="margin-bottom:4px; font-size:0.875rem;">${d}</li>`).join('')}
            </ul>
          </div>
        `;
      }
      
      // Escalation Signs
      if (tp.escalationSigns && tp.escalationSigns.length > 0) {
        html += `
          <div style="margin-bottom: 0; background: var(--color-warning-glow); border-radius: var(--radius-md); padding: 16px; border-left: 3px solid var(--color-warning);">
            <h4 style="margin-top: 0; margin-bottom: 0.5rem; font-size: 0.9rem; color: #6E5320;">⚡ When to Escalate</h4>
            <ul style="padding-left: 1.25rem; list-style-type: disc; color: #6E5320; margin: 0;">
              ${tp.escalationSigns.map(s => `<li style="margin-bottom:4px; font-size:0.875rem;">${s}</li>`).join('')}
            </ul>
          </div>
        `;
      }
      
      html += `</div>`;
    }

    // Add buttons for Exporting Report and Adding to Diary
    html += `
      <div style="margin-top: 1.5rem; display:flex; gap:12px;">
        <button class="glow-btn glow-btn--outline glow-btn--sm" onclick="window.print()" style="width:100%; justify-content:center;">🖨️ Export Report</button>
        <button class="glow-btn glow-btn--secondary glow-btn--sm" id="triage-log-diary-btn" style="width:100%; justify-content:center;">📝 Log in Diary</button>
      </div>
    `;
    
    html += `</div>`;
    
    resultContainer.innerHTML = html;
    resultContainer.style.display = 'block';

    // Bind log in diary button click handler
    setTimeout(() => {
      const diaryBtn = document.getElementById('triage-log-diary-btn');
      if (diaryBtn) {
        diaryBtn.addEventListener('click', () => {
          const symptomsText = Array.from(this.selectedSymptoms).join(', ');
          if (window.Dashboard && typeof window.Dashboard.openDiaryModalWithSymptom === 'function') {
            window.Dashboard.openDiaryModalWithSymptom(symptomsText, urgency);
          }
        });
      }
    }, 100);

    if (result.followUpQuestion) {
      this.addChatMessage('AI', result.followUpQuestion, 'ai');
    }
    
    this.saveToHistory(result);
  },

  async sendChatMessage() {
    const input = document.getElementById('chat-input');
    if (!input || !input.value.trim()) return;
    
    const message = input.value.trim();
    input.value = '';
    
    this.addChatMessage('You', message, 'user');
    
    // Emergency keyword detection — trigger ambulance popup immediately
    const msgLower = message.toLowerCase();
    const emergencyKeywords = ['severe', 'heart attack', 'stroke', 'dying', 'unconscious', 'chest pain', 'cannot breathe', 'not breathing', 'seizure', 'bleeding heavily', 'fainting'];
    const isEmergency = emergencyKeywords.some(kw => msgLower.includes(kw));
    
    if (isEmergency) {
      const emergencyModal = document.getElementById('emergency-modal');
      if (emergencyModal) {
        emergencyModal.classList.add('active');
      }
      this.addChatMessage('AI', '⚠️ **CRITICAL ALERT:** Your message indicates a potentially life-threatening emergency. I have triggered the emergency response panel. Please call 112 / 108 immediately or find the nearest hospital.', 'ai');
      return;
    }
    
    this.showTypingIndicator();
    
    try {
      const history = window.AIEngine.getConversationHistory ? window.AIEngine.getConversationHistory() : [];
      const response = await window.AIEngine.sendFollowUp(message, history);
      this.hideTypingIndicator();
      this.addChatMessage('AI', response, 'ai');
    } catch (error) {
      this.hideTypingIndicator();
      this.addChatMessage('System', 'Failed to send message.', 'error');
    }
  },

  addChatMessage(sender, text, type) {
    const messagesContainer = document.getElementById('chat-messages');
    if (!messagesContainer) return;
    
    const msgDiv = document.createElement('div');
    
    let bubbleClass = 'chat-bubble';
    if (type === 'user') {
      bubbleClass += ' chat-bubble--user';
    } else if (type === 'ai') {
      bubbleClass += ' chat-bubble--ai';
    }

    let formattedText = text;
    if (type === 'ai') {
      formattedText = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br>')
        .replace(/• /g, '<br>• ');
    }

    msgDiv.style.marginBottom = '1rem';
    msgDiv.style.width = '100%';
    msgDiv.style.display = 'flex';
    msgDiv.style.flexDirection = 'column';
    msgDiv.style.alignItems = type === 'user' ? 'flex-end' : 'flex-start';

    if (type === 'error') {
      msgDiv.innerHTML = `<div class="alert-banner alert-banner--danger">${formattedText}</div>`;
    } else {
      msgDiv.innerHTML = `
        <div class="${bubbleClass}">
          ${type !== 'user' ? `<div style="font-size: 0.75rem; opacity: 0.7; margin-bottom: 0.25rem; font-weight: bold;">${sender}</div>` : ''}
          <div style="font-size: 0.875rem;">${formattedText}</div>
        </div>
      `;
    }
    
    messagesContainer.appendChild(msgDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  },

  showTypingIndicator() {
    const messagesContainer = document.getElementById('chat-messages');
    const statusEl = document.getElementById('chat-status');
    
    if (statusEl) {
      statusEl.textContent = 'Analyzing...';
    }
    
    if (messagesContainer) {
      const indicator = document.createElement('div');
      indicator.id = 'typing-indicator';
      indicator.style.marginBottom = '1rem';
      indicator.style.width = '100%';
      indicator.style.display = 'flex';
      indicator.innerHTML = `
        <div class="chat-bubble chat-bubble--ai">
          <span class="typing-indicator"><span>.</span><span>.</span><span>.</span></span>
        </div>
      `;
      messagesContainer.appendChild(indicator);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  },

  hideTypingIndicator() {
    const statusEl = document.getElementById('chat-status');
    const indicator = document.getElementById('typing-indicator');
    
    if (statusEl) statusEl.textContent = 'Online';
    if (indicator) indicator.remove();
  },

  clearChat() {
    const messagesContainer = document.getElementById('chat-messages');
    const resultContainer = document.getElementById('triage-result');
    
    if (messagesContainer) messagesContainer.innerHTML = '';
    if (resultContainer) {
      resultContainer.innerHTML = '';
      resultContainer.style.display = 'none';
    }
    
    if (window.AIEngine && window.AIEngine.clearConversation) {
      window.AIEngine.clearConversation();
    }
  },

  reset() {
    this.selectedRegions.clear();
    this.selectedSymptoms.clear();
    
    document.querySelectorAll('.body-region--selected').forEach(el => {
      el.classList.remove('body-region--selected');
    });
    document.querySelectorAll('.body-region--abnormal').forEach(el => {
      el.classList.remove('body-region--abnormal');
    });
    
    const severitySlider = document.getElementById('severity-slider');
    if (severitySlider) severitySlider.value = 3;
    
    this.updateRegionChips();
    this.updateSymptomOptions();
    this.checkAnalyzeButton();
    this.clearChat();
    
    const selector = document.getElementById('symptom-selector');
    const chatContainer = document.getElementById('chat-container');
    const resultContainer = document.getElementById('triage-result');
    const intakeEl = document.getElementById('intake-questionnaire');
    
    if (chatContainer) chatContainer.style.display = 'none';
    if (intakeEl) intakeEl.style.display = 'none';
    if (selector) selector.style.display = 'block';
    if (resultContainer) resultContainer.style.display = 'none';
    
    this.renderBodyMap();
  },

  getActiveProfilePrefix() {
    const active = localStorage.getItem('healthPulse_activeProfile') || 'Self';
    return `healthPulse_profile_${active}_`;
  },

  saveToHistory(result) {
    try {
      const prefix = this.getActiveProfilePrefix();
      const historyStr = localStorage.getItem(prefix + 'symptomHistory');
      let history = historyStr ? JSON.parse(historyStr) : [];
      
      const entry = {
        date: new Date().toISOString(),
        regions: Array.from(this.selectedRegions),
        symptoms: Array.from(this.selectedSymptoms),
        result: result
      };
      
      history.unshift(entry);
      
      if (history.length > 20) history = history.slice(0, 20);
      
      localStorage.setItem(prefix + 'symptomHistory', JSON.stringify(history));
    } catch (e) {
      console.error('Could not save history', e);
    }
  },

  getSelectedSymptoms() {
    return {
      regions: Array.from(this.selectedRegions),
      symptoms: Array.from(this.selectedSymptoms)
    };
  }
};
