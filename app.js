/**
 * Quick Explainer - Application Logic
 * Handles API calls, UI interactions, and localStorage
 */

// Application State
const state = {
    history: [],
    isExplaining: false
};

// DOM Elements
const elements = {
    settingsToggle: document.querySelector('.settings-toggle'),
    settingsPanel: document.getElementById('settings-panel'),
    themeToggle: document.getElementById('theme-toggle'),
    userInput: document.getElementById('user-input'),
    charCount: document.getElementById('char-count'),
    levelSelect: document.getElementById('level-select'),
    explainBtn: document.getElementById('explain-btn'),
    btnText: document.querySelector('.btn-text'),
    btnLoading: document.querySelector('.btn-loading'),
    outputSection: document.getElementById('output-section'),
    explanationOutput: document.getElementById('explanation-output'),
    modelUsed: document.getElementById('model-used'),
    timeTaken: document.getElementById('time-taken'),
    copyBtn: document.querySelector('.copy-btn'),
    retryBtn: document.querySelector('.retry-btn'),
    historySection: document.getElementById('history-section'),
    historyList: document.getElementById('history-list'),
    clearHistoryBtn: document.getElementById('clear-history')
};

// Level instructions for the AI
const levelInstructions = {
    simple: 'Explain this simply and clearly. Avoid jargon and technical terms. Use everyday language that anyone can understand.',
    detailed: 'Provide a detailed explanation. Include key concepts, context, and nuances. Make it comprehensive but still accessible.',
    eli5: 'Explain this like you\'re talking to a 5-year-old. Use very simple concepts, analogies, and avoid all technical terms. Be playful and engaging.'
};

const MAX_INPUT_LENGTH = 5000;

// Initialize App
function init() {
    try {
        // Initialize MiniSnackbar
        if (typeof Snackbar !== 'undefined') {
            Snackbar.init();
        }
        loadSettings();
        loadHistory();
        setupEventListeners();
        applyTheme();
        updateExplainButton();
        console.log('Quick Explainer initialized successfully');
    } catch (error) {
        console.error('Initialization error:', error);
    }
}

// Load settings from localStorage
function loadSettings() {
    // Theme is the only setting stored locally now
    // API calls are handled server-side
}

// Save settings to localStorage
function saveSettings() {
    // Theme is the only setting stored locally now
}

// Load history from localStorage
function loadHistory() {
    const savedHistory = localStorage.getItem('qe_history');
    if (savedHistory) {
        state.history = JSON.parse(savedHistory);
        renderHistory();
    }
}

// Save history to localStorage
function saveHistory() {
    // Keep only last 10 items
    state.history = state.history.slice(0, 10);
    localStorage.setItem('qe_history', JSON.stringify(state.history));
    renderHistory();
}



// Setup event listeners
function setupEventListeners() {
    // Settings toggle
    elements.settingsToggle.addEventListener('click', toggleSettings);
    
    // Theme toggle
    elements.themeToggle.addEventListener('click', toggleTheme);
    
    // Textarea
    elements.userInput.addEventListener('input', (e) => {
        updateCharCount();
        updateExplainButton();
    });
    
    // Explain button
    elements.explainBtn.addEventListener('click', handleExplain);
    
    // Output actions
    elements.copyBtn.addEventListener('click', copyExplanation);
    elements.retryBtn.addEventListener('click', handleExplain);
    
    // History
    elements.clearHistoryBtn.addEventListener('click', clearHistory);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

// Toggle settings panel
function toggleSettings() {
    const isExpanded = elements.settingsToggle.getAttribute('aria-expanded') === 'true';
    elements.settingsToggle.setAttribute('aria-expanded', !isExpanded);
    elements.settingsPanel.hidden = isExpanded;
}

// Toggle theme
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('qe_theme', newTheme);
    updateThemeIcons(newTheme);
}

// Apply saved theme
function applyTheme() {
    const savedTheme = localStorage.getItem('qe_theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateThemeIcons(savedTheme);
    }
}

// Update theme icons visibility
function updateThemeIcons(theme) {
    const sunIcon = elements.themeToggle.querySelector('.theme-icon-sun');
    const moonIcon = elements.themeToggle.querySelector('.theme-icon-moon');
    if (sunIcon && moonIcon) {
        sunIcon.style.display = theme === 'dark' ? 'none' : 'block';
        moonIcon.style.display = theme === 'dark' ? 'block' : 'none';
    }
}

// Update character count
function updateCharCount() {
    const count = elements.userInput.value.length;
    const remaining = MAX_INPUT_LENGTH - count;
    elements.charCount.textContent = `${count} / ${MAX_INPUT_LENGTH} character${count !== 1 ? 's' : ''}`;
    
    if (remaining < 100) {
        elements.charCount.style.color = 'var(--accent)';
    } else {
        elements.charCount.style.color = '';
    }
}

// Update explain button state
function updateExplainButton() {
    const hasInput = elements.userInput.value.trim().length > 0;
    
    elements.explainBtn.disabled = !hasInput;
}

// Handle explain request
async function handleExplain() {
    if (state.isExplaining) return;
    
    const userInput = elements.userInput.value.trim();
    if (!userInput) return;
    
    if (userInput.length > MAX_INPUT_LENGTH) {
        if (typeof Snackbar !== 'undefined') {
            Snackbar.add(`Input exceeds maximum length of ${MAX_INPUT_LENGTH} characters`, null, 5000);
        }
        return;
    }
    
    state.isExplaining = true;
    setLoading(true);
    
    const startTime = Date.now();
    const level = elements.levelSelect.value;
    
    try {
        const result = await fetchExplanation(userInput, level);
        const duration = ((Date.now() - startTime) / 1000).toFixed(1);
        
        displayExplanation(result.content, result.model, duration);
        addToHistory(userInput, result.content, result.model, duration);
        
    } catch (error) {
        console.error('Explanation error:', error);
        if (typeof Snackbar !== 'undefined') {
            Snackbar.add(error.message || 'Failed to get explanation. Please try again.', null, 5000);
        }
    } finally {
        state.isExplaining = false;
        setLoading(false);
    }
}

// Fetch explanation from Cloudflare Function
async function fetchExplanation(userInput, level) {
    const systemMessage = levelInstructions[level];
    
    const response = await fetch('/api/explain', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            messages: [
                {
                    role: 'system',
                    content: systemMessage
                },
                {
                    role: 'user',
                    content: `Please explain this:\n\n${userInput}`
                }
            ],
            temperature: 0.7,
            max_tokens: 2000
        })
    });
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API error: ${response.status}`);
    }
    
    const data = await response.json();
    return {
        content: data.choices[0].message.content,
        model: data.model_used || 'openai'
    };
}

// Get display name for model
function getModelDisplayName(modelId) {
    if (modelId === 'openai') return 'GPT-5 Mini';
    return modelId;
}

// Display explanation with markdown parsing
function displayExplanation(explanation, model, duration) {
    elements.explanationOutput.innerHTML = '';
    elements.outputSection.hidden = false;
    elements.outputSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    elements.modelUsed.textContent = getModelDisplayName(model);
    elements.timeTaken.textContent = `${duration}s`;
    
    // Parse markdown using marked library
    const htmlContent = marked.parse(explanation, {
        breaks: true,
        gfm: true
    });
    
    elements.explanationOutput.innerHTML = htmlContent;
}

// Copy explanation to clipboard
async function copyExplanation() {
    const text = elements.explanationOutput.innerText;
    
    try {
        await navigator.clipboard.writeText(text);
        
        // Visual feedback
        elements.copyBtn.classList.add('copied');
        elements.copyBtn.innerHTML = `
            <svg class="copy-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span class="copy-text">Copied!</span>
        `;
        
        if (typeof Snackbar !== 'undefined') {
            Snackbar.add('Explanation copied to clipboard');
        }
        
        setTimeout(() => {
            elements.copyBtn.classList.remove('copied');
            elements.copyBtn.innerHTML = `
                <svg class="copy-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                <span class="copy-text">Copy</span>
            `;
        }, 2000);
        
    } catch (err) {
        if (typeof Snackbar !== 'undefined') {
            Snackbar.add('Failed to copy. Please try manually.', null, 5000);
        }
    }
}

// Add to history
function addToHistory(input, explanation, model, duration) {
    const historyItem = {
        id: Date.now(),
        input: input.substring(0, 200), // Truncate for display
        explanation: explanation.substring(0, 500),
        fullInput: input,
        fullExplanation: explanation,
        model: model,
        level: elements.levelSelect.value,
        duration: duration,
        timestamp: new Date().toISOString()
    };
    
    state.history.unshift(historyItem);
    saveHistory();
}

// Render history
function renderHistory() {
    if (state.history.length === 0) {
        elements.historySection.hidden = true;
        return;
    }
    
    elements.historySection.hidden = false;
    elements.historyList.innerHTML = '';
    
    state.history.forEach((item, index) => {
        const historyEl = document.createElement('div');
        historyEl.className = 'history-item';
        historyEl.innerHTML = `
            <div class="history-input">${escapeHtml(item.input)}${item.fullInput.length > 200 ? '...' : ''}</div>
            <div class="history-meta">
                <span>${formatDate(item.timestamp)}</span>
                <span>${getModelDisplayName(item.model)}</span>
            </div>
        `;
        
        historyEl.addEventListener('click', () => loadHistoryItem(index));
        elements.historyList.appendChild(historyEl);
    });
}

// Load history item
function loadHistoryItem(index) {
    const item = state.history[index];
    elements.userInput.value = item.fullInput;
    elements.levelSelect.value = item.level;
    
    // Parse markdown using marked library
    elements.explanationOutput.innerHTML = marked.parse(item.fullExplanation, {
        breaks: true,
        gfm: true
    });
    
    elements.modelUsed.textContent = getModelDisplayName(item.model);
    elements.timeTaken.textContent = `${item.duration}s`;
    
    elements.outputSection.hidden = false;
    elements.outputSection.scrollIntoView({ behavior: 'smooth' });
    
    updateCharCount();
    updateExplainButton();
}

// Clear history
function clearHistory() {
    if (confirm('Clear all recent explanations?')) {
        state.history = [];
        localStorage.removeItem('qe_history');
        renderHistory();
        if (typeof Snackbar !== 'undefined') {
            Snackbar.add('History cleared');
        }
    }
}

// Set loading state
function setLoading(loading) {
    elements.btnText.hidden = loading;
    elements.btnLoading.hidden = !loading;
    elements.explainBtn.disabled = loading;
    
    if (loading) {
        elements.userInput.disabled = true;
        elements.levelSelect.disabled = true;
    } else {
        elements.userInput.disabled = false;
        elements.levelSelect.disabled = false;
        elements.userInput.focus();
    }
}

// Handle keyboard shortcuts
function handleKeyboardShortcuts(e) {
    // Ctrl/Cmd + Enter to submit
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (!state.isExplaining && elements.userInput.value.trim()) {
            handleExplain();
        }
    }
    
    // Ctrl/Cmd + / to toggle settings
    if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        toggleSettings();
    }
    
    // Escape to close settings
    if (e.key === 'Escape') {
        if (elements.settingsToggle.getAttribute('aria-expanded') === 'true') {
            toggleSettings();
        }
    }
}



// Utility: Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Utility: Format date
function formatDate(isoString) {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
