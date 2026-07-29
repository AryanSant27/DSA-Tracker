// State Management
const State = {
    currentView: 'roadmap',
    xp: parseInt(localStorage.getItem('dsa_xp')) || 0,
    streak: parseInt(localStorage.getItem('dsa_streak')) || 0,
    solved: JSON.parse(localStorage.getItem('dsa_solved')) || [],
    badges: JSON.parse(localStorage.getItem('dsa_badges_earned')) || [],
    notes: JSON.parse(localStorage.getItem('dsa_notes')) || {},
    
    save() {
        localStorage.setItem('dsa_xp', this.xp);
        localStorage.setItem('dsa_streak', this.streak);
        localStorage.setItem('dsa_solved', JSON.stringify(this.solved));
        localStorage.setItem('dsa_badges_earned', JSON.stringify(this.badges));
        localStorage.setItem('dsa_notes', JSON.stringify(this.notes));
        updateGlobalUI();
    },
    
    markSolved(problemId, xpReward) {
        if (!this.solved.includes(problemId)) {
            this.solved.push(problemId);
            this.xp += xpReward;
            this.save();
            triggerConfetti();
        }
    },
    
    saveNote(problemId, text) {
        this.notes[problemId] = text;
        this.save();
    },
    
    reset() {
        if (confirm("Are you sure you want to delete all your progress? This cannot be undone.")) {
            localStorage.clear();
            location.reload();
        }
    },
    
    exportData() {
        const data = {
            xp: this.xp, streak: this.streak, solved: this.solved, badges: this.badges, notes: this.notes
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `dsa_mastery_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
    }
};

// UI Initialization & Navigation
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    updateGlobalUI();
    loadView('roadmap');
    
    // Bind search
    document.getElementById('nav-search-btn').addEventListener('click', openSearch);
    document.getElementById('close-search-btn').addEventListener('click', closeSearch);
    
    // Bind settings if on settings page later
});

function initNavigation() {
    const btns = document.querySelectorAll('.nav-btn[data-view]');
    btns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const view = btn.dataset.view;
            if (view === 'search') return; // Handled separately via modal
            
            // Update active state
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            if (btn.id !== 'nav-search-btn') {
                btn.classList.add('active');
            }
            
            loadView(view);
        });
    });
    
    // Keyboard shortcut for search
    document.addEventListener('keydown', (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            openSearch();
        }
    });
}

function updateGlobalUI() {
    // Level calculation (1 level per 100 XP)
    const level = Math.floor(State.xp / 100) + 1;
    const progress = State.xp % 100;
    
    document.getElementById('nav-level-text').textContent = `Lvl ${level}`;
    document.getElementById('nav-xp-fill').style.width = `${progress}%`;
}

// View Router
function loadView(viewName) {
    const main = document.getElementById('main-content');
    main.innerHTML = ''; // Clear current
    
    // Animate transition
    main.classList.remove('animate-fade-in');
    void main.offsetWidth; // Trigger reflow
    main.classList.add('animate-fade-in');
    
    const template = document.getElementById(`tpl-${viewName}-view`);
    if (!template) return;
    
    const content = template.content.cloneNode(true);
    main.appendChild(content);
    
    // Initialize specific view logic
    if (viewName === 'roadmap') initRoadmap();
    else if (viewName === 'skilltree') initSkillTree();
    else if (viewName === 'encyclopedia') initEncyclopedia();
    else if (viewName === 'stats') initStats();
    else if (viewName === 'settings') initSettings();
    
    lucide.createIcons();
}

// ==========================================
// VIEW: ROADMAP
// ==========================================
function initRoadmap() {
    document.getElementById('header-streak-count').textContent = `${State.streak} Day Streak`;
    
    const grid = document.getElementById('roadmap-grid');
    
    // Group by weeks
    let currentWeek = null;
    let daysContainer = null;
    
    APP_DATA.curriculum.forEach(dayInfo => {
        const weekNum = Math.ceil(dayInfo.day / 7);
        
        if (!currentWeek || currentWeek !== weekNum) {
            currentWeek = weekNum;
            const weekBlock = document.createElement('div');
            weekBlock.className = 'roadmap-week';
            
            const header = document.createElement('h3');
            header.className = 'roadmap-week-header';
            header.textContent = `Week ${weekNum}`;
            
            daysContainer = document.createElement('div');
            daysContainer.className = 'roadmap-days';
            
            weekBlock.appendChild(header);
            weekBlock.appendChild(daysContainer);
            grid.appendChild(weekBlock);
        }
        
        // Build Day Card
        const card = document.createElement('div');
        card.className = `day-card ${dayInfo.type === 'boss' ? 'boss-day' : ''}`;
        
        // Check if all mandatory are completed
        const isCompleted = dayInfo.mandatory.length > 0 && dayInfo.mandatory.every(id => State.solved.includes(id));
        if (isCompleted) card.classList.add('completed');
        
        const patternName = APP_DATA.patterns[dayInfo.patternId] ? APP_DATA.patterns[dayInfo.patternId].name : 'Mixed Review';
        
        card.innerHTML = `
            <div class="day-header">
                <span class="day-title">Day ${dayInfo.day}${dayInfo.type === 'revision' ? ' (Revision)' : ''}${dayInfo.type === 'boss' ? ' ⚔️ Boss' : ''}</span>
                <span class="day-pattern">${patternName}</span>
            </div>
            <div class="problem-list">
                ${dayInfo.mandatory.map(id => renderProblemItem(id, 'mandatory', dayInfo.type)).join('')}
                ${dayInfo.bonus.map(id => renderProblemItem(id, 'bonus', dayInfo.type)).join('')}
            </div>
        `;
        
        // Bind clicks
        card.querySelectorAll('.problem-item').forEach(item => {
            item.addEventListener('click', () => openProblemModal(item.dataset.id));
        });
        
        daysContainer.appendChild(card);
    });
}

function renderProblemItem(id, type, dayType) {
    const prob = APP_DATA.problems[id];
    if (!prob) return '';
    
    const solved = State.solved.includes(id);
    let classNames = 'problem-item';
    if (type === 'bonus') classNames += ' bonus';
    if (dayType === 'revision') classNames += ' revision';
    
    return `
        <div class="${classNames}" data-id="${id}">
            <div class="problem-type-indicator"></div>
            <div class="problem-info">
                <div class="problem-name">${prob.name}</div>
                <div class="problem-meta">
                    <span>${prob.difficulty}</span>
                    <span>${prob.estimatedTime}m</span>
                </div>
            </div>
            ${solved ? '<div class="problem-status"><i data-lucide="check-circle-2"></i></div>' : ''}
        </div>
    `;
}

// ==========================================
// VIEW: ENCYCLOPEDIA
// ==========================================
function initEncyclopedia() {
    const list = document.getElementById('encyclopedia-list');
    const detail = document.getElementById('encyclopedia-detail');
    
    Object.keys(APP_DATA.patterns).forEach(key => {
        const pattern = APP_DATA.patterns[key];
        const item = document.createElement('div');
        item.className = 'pattern-list-item';
        item.innerHTML = `<h4>${pattern.name}</h4>`;
        
        item.addEventListener('click', () => {
            document.querySelectorAll('.pattern-list-item').forEach(el => el.classList.remove('active'));
            item.classList.add('active');
            
            detail.innerHTML = `
                <div class="encyclopedia-content animate-fade-in">
                    <h2>${pattern.name}</h2>
                    
                    <div class="pattern-section">
                        <h3>Keywords to Listen For</h3>
                        <div class="pattern-keywords">
                            ${pattern.keywords.map(k => `<span class="keyword-tag">${k}</span>`).join('')}
                        </div>
                    </div>

                    <div class="pattern-section">
                        <h3>How to Recognize</h3>
                        <p>${pattern.recognition}</p>
                    </div>
                    
                    <div class="pattern-section">
                        <h3>Mental Model</h3>
                        <p>${pattern.mentalModel}</p>
                    </div>

                    <div class="pattern-section">
                        <h3>Time / Space Complexity</h3>
                        <p>${pattern.complexity}</p>
                    </div>
                    
                    <div class="pattern-section">
                        <h3>Code Template</h3>
                        <div class="code-block">${pattern.template}</div>
                    </div>
                </div>
            `;
        });
        list.appendChild(item);
    });
}

// ==========================================
// VIEW: SKILL TREE
// ==========================================
function initSkillTree() {
    const svg = document.getElementById('skill-tree-svg');
    const container = document.getElementById('skill-tree-nodes');
    
    // Draw edges first
    APP_DATA.skillTreeNodes.forEach(node => {
        if (!node.unlocks || node.unlocks.length === 0) return;
        
        const fromX = node.x;
        const fromY = node.y;
        
        node.unlocks.forEach(targetId => {
            const target = APP_DATA.skillTreeNodes.find(n => n.id === targetId);
            if (target) {
                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', fromX);
                line.setAttribute('y1', fromY);
                line.setAttribute('x2', target.x);
                line.setAttribute('y2', target.y);
                line.setAttribute('class', 'skill-tree-line unlocked');
                svg.appendChild(line);
            }
        });
    });
    
    // Draw nodes
    APP_DATA.skillTreeNodes.forEach(node => {
        const div = document.createElement('div');
        div.className = 'skill-node unlocked'; // For UI demo, everything unlocked
        div.style.left = node.x + 'px';
        div.style.top = node.y + 'px';
        
        div.innerHTML = `
            <div class="node-circle">
                <i data-lucide="check"></i>
            </div>
            <div class="node-label">${node.label}</div>
        `;
        
        container.appendChild(div);
    });
}

// ==========================================
// VIEW: STATS
// ==========================================
function initStats() {
    document.getElementById('stat-total-xp').textContent = State.xp;
    document.getElementById('stat-total-solved').textContent = State.solved.length;
    document.getElementById('stat-longest-streak').textContent = `${State.streak} Days`;
    
    // Mock heatmap
    const heatmap = document.getElementById('contribution-heatmap');
    for (let c = 0; c < 20; c++) { // cols
        const col = document.createElement('div');
        col.className = 'heatmap-col';
        for (let r = 0; r < 7; r++) { // rows
            const cell = document.createElement('div');
            // Randomly populate for visual demo
            if (Math.random() > 0.6) {
                const lvl = Math.floor(Math.random() * 4) + 1;
                cell.className = `heatmap-cell lvl-${lvl}`;
            } else {
                cell.className = 'heatmap-cell';
            }
            col.appendChild(cell);
        }
        heatmap.appendChild(col);
    }
    
    // Badges
    const badgesContainer = document.getElementById('badges-container');
    APP_DATA.badges.forEach((badge, index) => {
        // Mock earned logic: earn first two
        const isEarned = index < 2; 
        const div = document.createElement('div');
        div.className = `badge-card ${isEarned ? 'earned' : ''}`;
        div.innerHTML = `
            <div class="badge-icon"><i data-lucide="${badge.icon}"></i></div>
            <div class="badge-info">
                <h4>${badge.name}</h4>
                <p>${badge.desc}</p>
            </div>
        `;
        badgesContainer.appendChild(div);
    });
}

// ==========================================
// VIEW: SETTINGS
// ==========================================
function initSettings() {
    document.getElementById('btn-export-data').addEventListener('click', () => State.exportData());
    document.getElementById('btn-reset-data').addEventListener('click', () => State.reset());
    
    document.getElementById('btn-import-data').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(evt) {
                try {
                    const data = JSON.parse(evt.target.result);
                    if (data.xp !== undefined) {
                        localStorage.setItem('dsa_xp', data.xp);
                        localStorage.setItem('dsa_streak', data.streak || 0);
                        localStorage.setItem('dsa_solved', JSON.stringify(data.solved || []));
                        localStorage.setItem('dsa_badges_earned', JSON.stringify(data.badges || []));
                        localStorage.setItem('dsa_notes', JSON.stringify(data.notes || {}));
                        alert("Data imported successfully! Reloading...");
                        location.reload();
                    }
                } catch(e) {
                    alert("Invalid backup file.");
                }
            };
            reader.readAsText(file);
        }
    });
}


// ==========================================
// MODAL LOGIC (Problem Detail)
// ==========================================
function openProblemModal(id) {
    const prob = APP_DATA.problems[id];
    if (!prob) return;
    
    const overlay = document.getElementById('modal-overlay');
    overlay.classList.remove('hidden');
    
    document.getElementById('modal-problem-name').textContent = prob.name;
    document.getElementById('modal-problem-diff').textContent = prob.difficulty;
    document.getElementById('modal-problem-diff').className = `badge diff-badge ${prob.difficulty.toLowerCase()}`;
    document.getElementById('modal-problem-lc').textContent = prob.lcNumber;
    document.getElementById('modal-problem-time').textContent = prob.estimatedTime;
    document.getElementById('modal-problem-pattern').textContent = prob.pattern;
    
    document.getElementById('modal-problem-why').textContent = prob.whyToday;
    document.getElementById('modal-problem-concept').textContent = prob.concept;
    document.getElementById('modal-problem-time-comp').textContent = prob.complexity.time;
    document.getElementById('modal-problem-space-comp').textContent = prob.complexity.space;
    
    const mistakesHtml = prob.mistakes.map(m => `<li>${m}</li>`).join('');
    document.getElementById('modal-problem-mistakes').innerHTML = mistakesHtml;
    
    const hintEl = document.getElementById('modal-problem-hint');
    hintEl.textContent = prob.hint;
    hintEl.classList.remove('visible');
    
    document.querySelector('.reveal-hint-btn').onclick = function() {
        hintEl.classList.add('visible');
        this.style.display = 'none';
    };
    document.querySelector('.reveal-hint-btn').style.display = 'flex';
    
    const comps = document.getElementById('modal-problem-companies');
    comps.innerHTML = prob.companies.map(c => `<span class="company-tag">${c}</span>`).join('');
    
    const notesEl = document.getElementById('modal-problem-notes');
    notesEl.value = State.notes[id] || '';
    
    const btn = document.getElementById('modal-complete-btn');
    const timestamp = document.getElementById('modal-completed-timestamp');
    
    if (State.solved.includes(id)) {
        btn.innerHTML = `<i data-lucide="check"></i> Completed`;
        btn.className = 'btn-primary completed-state';
        btn.onclick = null;
        timestamp.textContent = "Solved recently";
        timestamp.classList.remove('hidden');
    } else {
        const xpAmount = prob.difficulty === 'Hard' ? 30 : prob.difficulty === 'Medium' ? 20 : 10;
        document.getElementById('modal-xp-reward').textContent = xpAmount;
        btn.innerHTML = `<span class="btn-text">Mark as Completed</span><span class="xp-reward">+<span id="modal-xp-reward">${xpAmount}</span> XP</span>`;
        btn.className = 'btn-primary';
        timestamp.classList.add('hidden');
        
        btn.onclick = () => {
            State.saveNote(id, notesEl.value);
            State.markSolved(id, xpAmount);
            closeModal();
            loadView('roadmap'); // refresh roadmap state
        };
    }
    
    // Save note when typing finishes (simple debounce)
    let typingTimer;
    notesEl.onkeyup = () => {
        clearTimeout(typingTimer);
        typingTimer = setTimeout(() => {
            State.saveNote(id, notesEl.value);
        }, 1000);
    };
    
    lucide.createIcons();
    
    overlay.querySelector('.close-modal-btn').onclick = closeModal;
    overlay.onclick = (e) => {
        if(e.target === overlay) closeModal();
    }
}

function closeModal() {
    document.getElementById('modal-overlay').classList.add('hidden');
}


// ==========================================
// SEARCH LOGIC
// ==========================================
function openSearch() {
    // We reuse modal overlay but inject search template
    const overlay = document.getElementById('modal-overlay');
    const container = document.getElementById('modal-container');
    container.innerHTML = ''; // clear
    
    const tpl = document.getElementById('tpl-search-modal');
    container.appendChild(tpl.content.cloneNode(true));
    
    overlay.classList.remove('hidden');
    const input = document.getElementById('global-search-input');
    input.focus();
    lucide.createIcons();
    
    document.getElementById('close-search-btn').onclick = closeSearch;
    overlay.onclick = (e) => { if(e.target === overlay) closeSearch(); }
    
    input.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const results = document.getElementById('search-results-container');
        results.innerHTML = '';
        
        if (query.length < 2) return;
        
        // Search problems
        Object.values(APP_DATA.problems).forEach(prob => {
            if (prob.name.toLowerCase().includes(query) || prob.pattern.toLowerCase().includes(query)) {
                const item = document.createElement('div');
                item.className = 'search-result-item';
                item.innerHTML = `
                    <div class="search-result-title">${prob.name}</div>
                    <div class="search-result-meta">${prob.pattern} • LC #${prob.lcNumber}</div>
                `;
                item.onclick = () => {
                    closeSearch();
                    openProblemModal(prob.id);
                };
                results.appendChild(item);
            }
        });
    });
}

function closeSearch() {
    document.getElementById('modal-overlay').classList.add('hidden');
    // revert to empty so problem modal can use it later
    setTimeout(() => {
        const container = document.getElementById('modal-container');
        container.innerHTML = '';
        container.appendChild(document.getElementById('tpl-problem-modal').content.cloneNode(true));
    }, 200);
}

// Confetti Effect (mock)
function triggerConfetti() {
    for(let i=0; i<30; i++) {
        const conf = document.createElement('div');
        conf.className = 'confetti';
        conf.style.left = Math.random() * 100 + 'vw';
        conf.style.top = '-10px';
        conf.style.backgroundColor = ['#5E6AD2', '#2EA043', '#D29922', '#F85149'][Math.floor(Math.random()*4)];
        document.body.appendChild(conf);
        
        // simple animate
        let top = -10;
        let left = parseFloat(conf.style.left);
        const iv = setInterval(() => {
            top += 5 + Math.random() * 5;
            left += (Math.random() - 0.5) * 5;
            conf.style.top = top + 'px';
            conf.style.left = left + 'vw';
            if (top > window.innerHeight) {
                clearInterval(iv);
                conf.remove();
            }
        }, 20);
    }
}
