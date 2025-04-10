// Today I Learned Journal App

// DOM Elements
const themeToggle = document.getElementById('themeToggle');
const darkIcon = document.getElementById('darkIcon');
const lightIcon = document.getElementById('lightIcon');
const todayDateEl = document.getElementById('todayDate');
const entryContent = document.getElementById('entryContent');
const publicEntryCheckbox = document.getElementById('publicEntry');
const saveEntryBtn = document.getElementById('saveEntryBtn');
const entriesList = document.getElementById('entriesList');
const calendarDays = document.getElementById('calendarDays');
const currentMonthLabel = document.getElementById('currentMonthLabel');
const prevMonthBtn = document.getElementById('prevMonthBtn');
const nextMonthBtn = document.getElementById('nextMonthBtn');
const streakBars = document.getElementById('streakBars');
const streakCount = document.getElementById('streakCount');
const exportTxtBtn = document.getElementById('exportTxtBtn');
const exportJsonBtn = document.getElementById('exportJsonBtn');
const encryptionToggle = document.getElementById('encryptionToggle');
const encryptionKeyContainer = document.getElementById('encryptionKeyContainer');
const encryptionKey = document.getElementById('encryptionKey');
const clearDataBtn = document.getElementById('clearDataBtn');
const saveSettingsBtn = document.getElementById('saveSettingsBtn');
const settingsModal = document.getElementById('settingsModal');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const inspirationContent = document.getElementById('inspirationContent');
const refreshInspirationBtn = document.getElementById('refreshInspirationBtn');
const toggleInspirationBtn = document.getElementById('toggleInspirationBtn');
const manageInspirationBtn = document.getElementById('manageInspirationBtn');
const inspirationManagerModal = document.getElementById('inspirationManagerModal');
const closeInspirationManagerBtn = document.getElementById('closeInspirationManagerBtn');
const inspirationFilter = document.getElementById('inspirationFilter');
const inspirationSearch = document.getElementById('inspirationSearch');
const defaultInspirationsList = document.getElementById('defaultInspirationsList');
const userInspirationsList = document.getElementById('userInspirationsList');
const addNewInspirationBtn = document.getElementById('addNewInspirationBtn');
const saveInspirationChangesBtn = document.getElementById('saveInspirationChangesBtn');
const addInspirationModal = document.getElementById('addInspirationModal');
const closeAddInspirationBtn = document.getElementById('closeAddInspirationBtn');
const newInspirationText = document.getElementById('newInspirationText');
const saveNewInspirationBtn = document.getElementById('saveNewInspirationBtn');

// State
let entries = [];
let currentDate = new Date();
let currentMonth = new Date();
let selectedDate = formatDate(new Date());
let userPreferences = {
    theme: 'light',
    encryption: false,
    encryptionKey: '',
    streakCount: 0,
    lastEntryDate: null,
    showInspiration: true,
    customInspirations: []
};
let editingInspirationId = null;

// Sample inspirations
const inspirations = [
    "Today I learned that the human brain processes images in as little as 13 milliseconds.",
    "Today I learned that honey never spoils. Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old and still perfectly good to eat.",
    "Today I learned that octopuses have three hearts, nine brains, and blue blood.",
    "Today I learned that the world's oldest known living tree is over 5,000 years old.",
    "Today I learned that a day on Venus is longer than a year on Venus. It takes 243 Earth days to rotate once on its axis and 225 Earth days to orbit the sun.",
    "Today I learned that the Great Wall of China is not visible from space with the naked eye, contrary to popular belief.",
    "Today I learned that crows can recognize human faces and remember people who have threatened or harmed them.",
    "Today I learned that the shortest war in history was between Britain and Zanzibar on August 27, 1896. Zanzibar surrendered after 38 minutes.",
    "Today I learned that bananas are berries, but strawberries aren't.",
    "Today I learned that the average person will spend six months of their life waiting for red lights to turn green.",
    "Today I learned that the fingerprints of koalas are so similar to humans that they have on occasion been confused at crime scenes.",
    "Today I learned that the Hawaiian alphabet has only 12 letters.",
    "Today I learned that a group of flamingos is called a 'flamboyance'.",
    "Today I learned that the Eiffel Tower can be 15 cm taller during the summer due to thermal expansion.",
    "Today I learned that a jiffy is an actual unit of time: 1/100th of a second."
];

// Initialize
function init() {
    loadUserPreferences();
    loadEntries();
    setTheme();
    updateTodayDate();
    renderCalendar();
    updateStreakDisplay();
    renderEntries();
    setupAutoResize();
    loadTodayEntry();
    updateInspirationSection();
    
    // Check for edit parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');
    if (editId) {
        const entry = entries.find(e => e.id === editId);
        if (entry) {
            selectedDate = entry.date;
            updateTodayDate();
            entryContent.value = entry.content;
            publicEntryCheckbox.checked = entry.isPublic;
            entryContent.focus();
        }
    }
    
    // Event listeners
    themeToggle.addEventListener('click', toggleTheme);
    saveEntryBtn.addEventListener('click', saveEntry);
    prevMonthBtn.addEventListener('click', () => changeMonth(-1));
    nextMonthBtn.addEventListener('click', () => changeMonth(1));
    exportTxtBtn.addEventListener('click', exportAsTxt);
    exportJsonBtn.addEventListener('click', exportAsJson);
    encryptionToggle.addEventListener('change', toggleEncryptionKey);
    clearDataBtn.addEventListener('click', confirmClearData);
    saveSettingsBtn.addEventListener('click', saveSettings);
    closeSettingsBtn.addEventListener('click', () => settingsModal.classList.add('hidden'));
    refreshInspirationBtn.addEventListener('click', refreshInspiration);
    toggleInspirationBtn.addEventListener('click', toggleInspiration);
    
    // Inspiration Manager event listeners
    manageInspirationBtn.addEventListener('click', openInspirationManager);
    closeInspirationManagerBtn.addEventListener('click', closeInspirationManager);
    inspirationFilter.addEventListener('change', filterInspirations);
    inspirationSearch.addEventListener('input', filterInspirations);
    addNewInspirationBtn.addEventListener('click', openAddInspirationModal);
    closeAddInspirationBtn.addEventListener('click', closeAddInspirationModal);
    saveNewInspirationBtn.addEventListener('click', saveNewInspiration);
    saveInspirationChangesBtn.addEventListener('click', saveInspirationChanges);
    
    // Settings button in header
    const headerEl = document.querySelector('header');
    const settingsBtn = document.createElement('button');
    settingsBtn.className = 'p-2 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 ml-2';
    settingsBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
        </svg>
    `;
    settingsBtn.addEventListener('click', () => settingsModal.classList.remove('hidden'));
    headerEl.appendChild(settingsBtn);
    
    // Add admin link (hidden in DOM)
    const adminLink = document.createElement('a');
    adminLink.href = 'admin.html';
    adminLink.id = 'adminLink';
    adminLink.style.position = 'absolute';
    adminLink.style.left = '-9999px';
    adminLink.style.top = '-9999px';
    adminLink.setAttribute('aria-hidden', 'true');
    adminLink.textContent = 'Admin';
    document.body.appendChild(adminLink);
    
    // Add keyboard shortcut for admin panel (Ctrl+Shift+A)
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.shiftKey && e.key === 'A') {
            window.location.href = 'admin.html';
        }
    });
}

// Date Utilities
function formatDate(date) {
    return date.toISOString().split('T')[0];
}

function formatDisplayDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

function updateTodayDate() {
    todayDateEl.textContent = formatDisplayDate(selectedDate);
}

// Theme
function loadUserPreferences() {
    const savedPreferences = localStorage.getItem('tilPreferences');
    if (savedPreferences) {
        userPreferences = JSON.parse(savedPreferences);
        
        // Initialize customInspirations if it doesn't exist
        if (!userPreferences.customInspirations) {
            userPreferences.customInspirations = [];
        }
    } else {
        // Check system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            userPreferences.theme = 'dark';
        }
        saveUserPreferences();
    }
    
    // Update UI based on preferences
    encryptionToggle.checked = userPreferences.encryption;
    if (userPreferences.encryption) {
        encryptionKeyContainer.classList.remove('hidden');
        encryptionKey.value = userPreferences.encryptionKey || '';
    }
    
    // Set inspiration visibility
    if (userPreferences.showInspiration === false) {
        const inspirationSection = document.querySelector('#inspirationContent').parentNode;
        inspirationSection.classList.add('hidden');
        toggleInspirationBtn.textContent = 'Show inspiration';
    }
}

function saveUserPreferences() {
    localStorage.setItem('tilPreferences', JSON.stringify(userPreferences));
}

function setTheme() {
    if (userPreferences.theme === 'dark') {
        document.documentElement.classList.remove('light');
        document.documentElement.classList.add('dark');
        darkIcon.classList.add('hidden');
        lightIcon.classList.remove('hidden');
        localStorage.setItem('theme', 'dark');
    } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
        darkIcon.classList.remove('hidden');
        lightIcon.classList.add('hidden');
        localStorage.setItem('theme', 'light');
    }
}

function toggleTheme() {
    userPreferences.theme = userPreferences.theme === 'dark' ? 'light' : 'dark';
    saveUserPreferences();
    setTheme();
}

// Entries
function loadEntries() {
    const savedEntries = localStorage.getItem('tilEntries');
    if (savedEntries) {
        entries = JSON.parse(savedEntries);
        
        // Decrypt entries if needed
        if (userPreferences.encryption && userPreferences.encryptionKey) {
            entries = entries.map(entry => {
                if (entry.encrypted) {
                    try {
                        entry.content = decryptText(entry.content, userPreferences.encryptionKey);
                        entry.decrypted = true;
                    } catch (e) {
                        console.error('Failed to decrypt entry:', e);
                        entry.content = '[Encrypted content - incorrect key]';
                        entry.decrypted = false;
                    }
                }
                return entry;
            });
        }
        
        // Calculate streak
        calculateStreak();
    }
}

function saveEntries() {
    // Encrypt entries if needed
    let entriesToSave = [...entries];
    if (userPreferences.encryption && userPreferences.encryptionKey) {
        entriesToSave = entriesToSave.map(entry => {
            const entryCopy = {...entry};
            if (entry.decrypted || !entry.encrypted) {
                entryCopy.content = encryptText(entry.content, userPreferences.encryptionKey);
                entryCopy.encrypted = true;
                delete entryCopy.decrypted;
            }
            return entryCopy;
        });
    }
    
    localStorage.setItem('tilEntries', JSON.stringify(entriesToSave));
}

function loadTodayEntry() {
    const todayEntry = entries.find(entry => entry.date === selectedDate);
    if (todayEntry) {
        entryContent.value = todayEntry.content;
        publicEntryCheckbox.checked = todayEntry.isPublic || false;
    } else {
        entryContent.value = '';
        publicEntryCheckbox.checked = false;
    }
}

function saveEntry() {
    const content = entryContent.value.trim();
    
    // Don't save empty entries
    if (!content) {
        if (entries.some(entry => entry.date === selectedDate)) {
            // If entry exists but is now empty, remove it
            entries = entries.filter(entry => entry.date !== selectedDate);
            saveEntries();
            renderEntries();
            renderCalendar();
            calculateStreak();
            updateStreakDisplay();
        }
        return;
    }
    
    const existingEntryIndex = entries.findIndex(entry => entry.date === selectedDate);
    
    if (existingEntryIndex >= 0) {
        // Update existing entry
        entries[existingEntryIndex].content = content;
        entries[existingEntryIndex].isPublic = publicEntryCheckbox.checked;
        entries[existingEntryIndex].updatedAt = new Date().toISOString();
    } else {
        // Create new entry
        const newEntry = {
            id: Date.now().toString(),
            date: selectedDate,
            content: content,
            isPublic: publicEntryCheckbox.checked,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            decrypted: true
        };
        
        entries.push(newEntry);
    }
    
    // Sort entries by date (newest first)
    entries.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Save to localStorage
    saveEntries();
    
    // Update UI
    renderEntries();
    renderCalendar();
    calculateStreak();
    updateStreakDisplay();
    
    // Show success message
    showToast('Entry saved successfully');
}

function renderEntries() {
    entriesList.innerHTML = '';
    
    if (entries.length === 0) {
        entriesList.innerHTML = `
            <div class="text-center py-8 text-gray-500 dark:text-gray-400">
                <p>No entries yet. Start journaling today!</p>
            </div>
        `;
        return;
    }
    
    entries.forEach(entry => {
        const entryCard = document.createElement('div');
        entryCard.className = 'entry-card bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm slide-up';
        
        const date = new Date(entry.date);
        const isToday = formatDate(new Date()) === entry.date;
        
        entryCard.innerHTML = `
            <div class="flex justify-between items-start">
                <div class="text-sm ${isToday ? 'text-indigo-600 dark:text-indigo-400 font-medium' : 'text-gray-500 dark:text-gray-400'}">
                    ${formatDisplayDate(entry.date)}
                </div>
                <div class="flex space-x-2">
                    <button class="edit-entry-btn text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" data-date="${entry.date}">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                    </button>
                    <button class="delete-entry-btn text-gray-400 hover:text-red-600 dark:hover:text-red-400" data-date="${entry.date}">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>
            <div class="mt-2 whitespace-pre-wrap">${entry.content}</div>
            ${entry.isPublic ? '<div class="text-xs px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 rounded-full">Public</div>' : ''}
        `;
        
        entriesList.appendChild(entryCard);
        
        // Add event listeners to the buttons
        entryCard.querySelector('.edit-entry-btn').addEventListener('click', () => {
            selectedDate = entry.date;
            updateTodayDate();
            entryContent.value = entry.content;
            publicEntryCheckbox.checked = entry.isPublic;
            entryContent.focus();
            
            // Scroll to editor
            document.getElementById('entryEditor').scrollIntoView({ behavior: 'smooth' });
        });
        
        entryCard.querySelector('.delete-entry-btn').addEventListener('click', () => {
            if (confirm('Are you sure you want to delete this entry?')) {
                entries = entries.filter(e => e.date !== entry.date);
                saveEntries();
                renderEntries();
                renderCalendar();
                calculateStreak();
                updateStreakDisplay();
                
                if (selectedDate === entry.date) {
                    entryContent.value = '';
                }
            }
        });
    });
}

// Calendar
function renderCalendar() {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // Update month label
    currentMonthLabel.textContent = new Date(year, month, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    // Clear calendar days
    calendarDays.innerHTML = '';
    
    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Add empty cells for days before first day of month
    for (let i = 0; i < firstDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day empty-day';
        calendarDays.appendChild(emptyDay);
    }
    
    // Add days of month
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateString = formatDate(date);
        const isToday = formatDate(new Date()) === dateString;
        const isSelected = selectedDate === dateString;
        const hasEntry = entries.some(entry => entry.date === dateString);
        
        const dayEl = document.createElement('div');
        dayEl.className = `calendar-day ${isToday ? 'today' : ''} ${hasEntry ? 'has-entry' : ''} ${isSelected ? 'selected' : ''}`;
        dayEl.textContent = day;
        
        // Add click event to select date
        dayEl.addEventListener('click', () => {
            selectedDate = dateString;
            updateTodayDate();
            loadTodayEntry();
            renderCalendar(); // Re-render to update selected state
        });
        
        calendarDays.appendChild(dayEl);
    }
}

function changeMonth(delta) {
    currentMonth.setMonth(currentMonth.getMonth() + delta);
    renderCalendar();
}

// Streak
function calculateStreak() {
    if (entries.length === 0) {
        userPreferences.streakCount = 0;
        userPreferences.lastEntryDate = null;
        saveUserPreferences();
        return;
    }
    
    // Sort entries by date (oldest first)
    const sortedEntries = [...entries].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Check if there's an entry for today
    const today = formatDate(new Date());
    const hasEntryToday = sortedEntries.some(entry => entry.date === today);
    
    // Check if there's an entry for yesterday
    const yesterday = formatDate(new Date(Date.now() - 86400000));
    const hasEntryYesterday = sortedEntries.some(entry => entry.date === yesterday);
    
    // Get the most recent entry date
    const lastEntryDate = sortedEntries[sortedEntries.length - 1].date;
    
    // If there's an entry today, streak continues
    if (hasEntryToday) {
        if (userPreferences.lastEntryDate === yesterday) {
            // Continuing streak from yesterday
            userPreferences.streakCount++;
        } else if (userPreferences.lastEntryDate !== today) {
            // New streak starting today
            userPreferences.streakCount = 1;
        }
        userPreferences.lastEntryDate = today;
    } 
    // If the last entry was yesterday and no entry today, streak is maintained but not incremented
    else if (lastEntryDate === yesterday) {
        if (!userPreferences.streakCount) {
            userPreferences.streakCount = 1;
        }
        userPreferences.lastEntryDate = yesterday;
    } 
    // If the last entry is older than yesterday and no entry today, streak is broken
    else if (new Date(lastEntryDate) < new Date(yesterday)) {
        userPreferences.streakCount = 0;
        userPreferences.lastEntryDate = lastEntryDate;
    }
    
    saveUserPreferences();
}

function updateStreakDisplay() {
    streakCount.textContent = userPreferences.streakCount;
    
    // Update streak bars
    streakBars.innerHTML = '';
    
    // Get the last 7 days
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        days.push({
            date: formatDate(date),
            label: date.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0),
            hasEntry: entries.some(entry => entry.date === formatDate(date))
        });
    }
    
    // Create bars
    days.forEach(day => {
        const barContainer = document.createElement('div');
        barContainer.className = 'flex-1 flex flex-col items-center';
        
        const bar = document.createElement('div');
        bar.className = `w-full streak-bar rounded-t-md transition-all duration-500 ${
            day.hasEntry 
                ? 'bg-indigo-400 dark:bg-indigo-500 h-12' 
                : 'bg-gray-200 dark:bg-gray-700 h-4'
        }`;
        
        const label = document.createElement('div');
        label.className = 'text-xs text-gray-500 mt-1';
        label.textContent = day.label;
        
        barContainer.appendChild(bar);
        barContainer.appendChild(label);
        streakBars.appendChild(barContainer);
    });
}

// Export
function exportAsTxt() {
    if (entries.length === 0) {
        showToast('No entries to export');
        return;
    }
    
    let content = "TODAY I LEARNED JOURNAL\n\n";
    
    // Sort entries by date (oldest first)
    const sortedEntries = [...entries].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    sortedEntries.forEach(entry => {
        content += `${formatDisplayDate(entry.date)}\n`;
        content += `${entry.content}\n\n`;
    });
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `til-journal-${formatDate(new Date())}.txt`;
    a.click();
    
    URL.revokeObjectURL(url);
    showToast('Exported as TXT successfully');
}

function exportAsJson() {
    if (entries.length === 0) {
        showToast('No entries to export');
        return;
    }
    
    // Create a clean copy without decrypted flag
    const exportEntries = entries.map(entry => {
        const { decrypted, ...cleanEntry } = entry;
        return cleanEntry;
    });
    
    const blob = new Blob([JSON.stringify(exportEntries, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `til-journal-${formatDate(new Date())}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    showToast('Exported as JSON successfully');
}

// Settings
function toggleEncryptionKey() {
    if (encryptionToggle.checked) {
        encryptionKeyContainer.classList.remove('hidden');
    } else {
        encryptionKeyContainer.classList.add('hidden');
    }
}

function saveSettings() {
    const wasEncrypted = userPreferences.encryption;
    const oldKey = userPreferences.encryptionKey;
    
    userPreferences.encryption = encryptionToggle.checked;
    userPreferences.encryptionKey = encryptionToggle.checked ? encryptionKey.value : '';
    
    // Handle encryption changes
    if (!wasEncrypted && userPreferences.encryption) {
        // Turning encryption on
        if (!userPreferences.encryptionKey) {
            showToast('Please provide an encryption key', 'error');
            return;
        }
    } else if (wasEncrypted && !userPreferences.encryption) {
        // Turning encryption off - decrypt all entries
        entries = entries.map(entry => {
            if (entry.encrypted && !entry.decrypted) {
                try {
                    entry.content = decryptText(entry.content, oldKey);
                } catch (e) {
                    console.error('Failed to decrypt entry during settings change:', e);
                }
            }
            entry.encrypted = false;
            delete entry.decrypted;
            return entry;
        });
    } else if (wasEncrypted && userPreferences.encryption && oldKey !== userPreferences.encryptionKey) {
        // Changed encryption key - re-encrypt with new key
        entries = entries.map(entry => {
            if (entry.encrypted && !entry.decrypted) {
                try {
                    // Decrypt with old key first
                    const decrypted = decryptText(entry.content, oldKey);
                    // Then encrypt with new key
                    entry.content = decrypted;
                    entry.decrypted = true;
                } catch (e) {
                    console.error('Failed to re-encrypt entry with new key:', e);
                    showToast('Some entries could not be re-encrypted with the new key', 'error');
                }
            }
            return entry;
        });
    }
    
    saveUserPreferences();
    saveEntries();
    settingsModal.classList.add('hidden');
    showToast('Settings saved successfully');
}

function confirmClearData() {
    if (confirm('Are you sure you want to delete all your entries? This cannot be undone.')) {
        entries = [];
        saveEntries();
        userPreferences.streakCount = 0;
        userPreferences.lastEntryDate = null;
        saveUserPreferences();
        renderEntries();
        renderCalendar();
        updateStreakDisplay();
        entryContent.value = '';
        settingsModal.classList.add('hidden');
        showToast('All data cleared successfully');
    }
}

// Utilities
function setupAutoResize() {
    entryContent.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });
    
    // Initial resize
    entryContent.style.height = 'auto';
    entryContent.style.height = (entryContent.scrollHeight) + 'px';
}

function showToast(message, type = 'success') {
    // Remove existing toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    // Create toast
    const toast = document.createElement('div');
    toast.className = `toast fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow-lg ${
        type === 'success' 
            ? 'bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
            : 'bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    } fade-in`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// Encryption utilities
function encryptText(text, key) {
    // Simple XOR encryption for demonstration
    // In a real app, use a proper encryption library
    let result = '';
    for (let i = 0; i < text.length; i++) {
        result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return btoa(result); // Base64 encode
}

function decryptText(encryptedText, key) {
    // Decrypt XOR encryption
    const text = atob(encryptedText); // Base64 decode
    let result = '';
    for (let i = 0; i < text.length; i++) {
        result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return result;
}

// Inspiration Section
function updateInspirationSection() {
    if (!inspirationContent) return;
    
    // Combine sample inspirations with user's own public past entries and custom inspirations
    let possibleInspirations = [...inspirations, ...userPreferences.customInspirations];
    
    // Add user's own public entries if they exist (excluding today's entry)
    if (entries.length > 0) {
        const today = formatDate(new Date());
        const publicPastEntries = entries.filter(entry => entry.date !== today && entry.isPublic);
        
        // Add public past entries from the user
        if (publicPastEntries.length > 0) {
            // Shuffle and take up to 5
            const shuffled = [...publicPastEntries].sort(() => 0.5 - Math.random());
            const selectedEntries = shuffled.slice(0, Math.min(5, shuffled.length));
            
            // Add user's entries to possible inspirations
            selectedEntries.forEach(entry => {
                possibleInspirations.push(entry.content);
            });
        }
    }
    
    // Get random inspiration
    const randomIndex = Math.floor(Math.random() * possibleInspirations.length);
    inspirationContent.textContent = possibleInspirations[randomIndex];
    
    // Add animation
    inspirationContent.classList.add('fade-in');
    setTimeout(() => {
        inspirationContent.classList.remove('fade-in');
    }, 500);
}

function refreshInspiration() {
    updateInspirationSection();
    
    // Add rotation animation to refresh button
    refreshInspirationBtn.classList.add('rotate-animation');
    setTimeout(() => {
        refreshInspirationBtn.classList.remove('rotate-animation');
    }, 500);
}

function toggleInspiration() {
    const inspirationSection = document.querySelector('#inspirationContent').parentNode;
    userPreferences.showInspiration = !userPreferences.showInspiration;
    
    if (userPreferences.showInspiration) {
        inspirationSection.classList.remove('hidden');
        toggleInspirationBtn.textContent = 'Hide inspiration';
    } else {
        inspirationSection.classList.add('hidden');
        toggleInspirationBtn.textContent = 'Show inspiration';
    }
    
    saveUserPreferences();
}

// Inspiration Manager
function openInspirationManager() {
    inspirationManagerModal.classList.remove('hidden');
    renderInspirationLists();
}

function closeInspirationManager() {
    inspirationManagerModal.classList.add('hidden');
}

function renderInspirationLists() {
    // Render default inspirations
    defaultInspirationsList.innerHTML = '';
    inspirations.forEach((inspiration, index) => {
        const item = document.createElement('div');
        item.className = 'p-3 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 flex justify-between items-start';
        item.innerHTML = `
            <div class="flex-1 pr-4">
                <p class="text-gray-800 dark:text-gray-200">${inspiration}</p>
                <span class="text-xs text-gray-500 dark:text-gray-400">Default inspiration</span>
            </div>
            <div class="flex space-x-1">
                <button class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1" data-action="edit" data-type="default" data-index="${index}">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                </button>
                <button class="text-gray-400 hover:text-red-600 dark:hover:text-red-400 p-1" data-action="delete" data-type="default" data-index="${index}">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                </button>
            </div>
        `;
        
        // Add event listeners
        const editBtn = item.querySelector('[data-action="edit"]');
        const deleteBtn = item.querySelector('[data-action="delete"]');
        
        editBtn.addEventListener('click', () => {
            editInspiration('default', index);
        });
        
        deleteBtn.addEventListener('click', () => {
            deleteInspiration('default', index);
        });
        
        defaultInspirationsList.appendChild(item);
    });
    
    // Render custom inspirations
    userInspirationsList.innerHTML = '';
    
    // Add custom inspirations
    if (userPreferences.customInspirations && userPreferences.customInspirations.length > 0) {
        userPreferences.customInspirations.forEach((inspiration, index) => {
            const item = document.createElement('div');
            item.className = 'p-3 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 flex justify-between items-start';
            item.innerHTML = `
                <div class="flex-1 pr-4">
                    <p class="text-gray-800 dark:text-gray-200">${inspiration}</p>
                    <span class="text-xs text-gray-500 dark:text-gray-400">Custom inspiration</span>
                </div>
                <div class="flex space-x-1">
                    <button class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1" data-action="edit" data-type="custom" data-index="${index}">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                    </button>
                    <button class="text-gray-400 hover:text-red-600 dark:hover:text-red-400 p-1" data-action="delete" data-type="custom" data-index="${index}">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                        </svg>
                    </button>
                </div>
            `;
            
            // Add event listeners
            const editBtn = item.querySelector('[data-action="edit"]');
            const deleteBtn = item.querySelector('[data-action="delete"]');
            
            editBtn.addEventListener('click', () => {
                editInspiration('custom', index);
            });
            
            deleteBtn.addEventListener('click', () => {
                deleteInspiration('custom', index);
            });
            
            userInspirationsList.appendChild(item);
        });
    }
    
    // Add public entries
    const publicEntries = entries.filter(entry => entry.isPublic);
    if (publicEntries.length > 0) {
        publicEntries.forEach((entry, index) => {
            const item = document.createElement('div');
            item.className = 'p-3 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 flex justify-between items-start';
            item.innerHTML = `
                <div class="flex-1 pr-4">
                    <p class="text-gray-800 dark:text-gray-200">${entry.content}</p>
                    <span class="text-xs text-gray-500 dark:text-gray-400">Your entry from ${formatDisplayDate(new Date(entry.date))}</span>
                </div>
                <div class="flex space-x-1">
                    <button class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1" data-action="edit" data-type="entry" data-index="${index}">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                    </button>
                    <button class="text-gray-400 hover:text-red-600 dark:hover:text-red-400 p-1" data-action="makePrivate" data-type="entry" data-index="${index}">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                        </svg>
                    </button>
                </div>
            `;
            
            // Add event listeners
            const editBtn = item.querySelector('[data-action="edit"]');
            const makePrivateBtn = item.querySelector('[data-action="makePrivate"]');
            
            editBtn.addEventListener('click', () => {
                editEntry(entry.id);
            });
            
            makePrivateBtn.addEventListener('click', () => {
                makeEntryPrivate(entry.id);
            });
            
            userInspirationsList.appendChild(item);
        });
    }
    
    // Show message if no user inspirations
    if (userInspirationsList.children.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'text-center text-gray-500 dark:text-gray-400 p-4';
        emptyMessage.textContent = 'No custom inspirations or public entries yet.';
        userInspirationsList.appendChild(emptyMessage);
    }
    
    // Apply current filter
    filterInspirations();
}

function filterInspirations() {
    const filterValue = inspirationFilter.value;
    const searchValue = inspirationSearch.value.toLowerCase();
    
    // Filter default inspirations
    Array.from(defaultInspirationsList.children).forEach(item => {
        const text = item.querySelector('p').textContent.toLowerCase();
        const isVisible = 
            (filterValue === 'all' || filterValue === 'default') && 
            (searchValue === '' || text.includes(searchValue));
        
        item.style.display = isVisible ? 'flex' : 'none';
    });
    
    // Filter user inspirations
    Array.from(userInspirationsList.children).forEach(item => {
        const text = item.querySelector('p')?.textContent.toLowerCase() || '';
        const isCustom = item.querySelector('span')?.textContent.includes('Custom') || false;
        const isEntry = item.querySelector('span')?.textContent.includes('Your entry') || false;
        
        const isVisible = 
            (filterValue === 'all' || 
             (filterValue === 'public' && isEntry) || 
             (filterValue === 'custom' && isCustom)) && 
            (searchValue === '' || text.includes(searchValue));
        
        item.style.display = isVisible ? 'flex' : 'none';
    });
}

function editInspiration(type, index) {
    let text = '';
    
    if (type === 'default') {
        text = inspirations[index];
        editingInspirationId = { type, index };
    } else if (type === 'custom') {
        text = userPreferences.customInspirations[index];
        editingInspirationId = { type, index };
    }
    
    newInspirationText.value = text;
    addInspirationModal.classList.remove('hidden');
}

function deleteInspiration(type, index) {
    if (type === 'default') {
        // Create a copy of default inspirations if not already
        if (!userPreferences.defaultInspirations) {
            userPreferences.defaultInspirations = [...inspirations];
        }
        
        // Mark as deleted in user preferences
        userPreferences.defaultInspirations[index] = null;
    } else if (type === 'custom') {
        // Remove from custom inspirations
        userPreferences.customInspirations.splice(index, 1);
    }
    
    saveUserPreferences();
    renderInspirationLists();
    updateInspirationSection();
}

function editEntry(entryId) {
    const entry = entries.find(e => e.id === entryId);
    if (entry) {
        selectedDate = entry.date;
        updateTodayDate();
        entryContent.value = entry.content;
        publicEntryCheckbox.checked = entry.isPublic;
        entryContent.focus();
        
        // Close the inspiration manager
        closeInspirationManager();
    }
}

function makeEntryPrivate(entryId) {
    const entryIndex = entries.findIndex(e => e.id === entryId);
    if (entryIndex !== -1) {
        entries[entryIndex].isPublic = false;
        saveEntries();
        renderInspirationLists();
        updateInspirationSection();
    }
}

function openAddInspirationModal() {
    editingInspirationId = null;
    newInspirationText.value = '';
    addInspirationModal.classList.remove('hidden');
}

function closeAddInspirationModal() {
    addInspirationModal.classList.add('hidden');
}

function saveNewInspiration() {
    const text = newInspirationText.value.trim();
    if (!text) return;
    
    if (editingInspirationId) {
        // Update existing inspiration
        if (editingInspirationId.type === 'default') {
            // Create a copy of default inspirations if not already
            if (!userPreferences.defaultInspirations) {
                userPreferences.defaultInspirations = [...inspirations];
            }
            
            userPreferences.defaultInspirations[editingInspirationId.index] = text;
        } else if (editingInspirationId.type === 'custom') {
            userPreferences.customInspirations[editingInspirationId.index] = text;
        }
    } else {
        // Add new custom inspiration
        if (!userPreferences.customInspirations) {
            userPreferences.customInspirations = [];
        }
        
        userPreferences.customInspirations.push(text);
    }
    
    saveUserPreferences();
    closeAddInspirationModal();
    renderInspirationLists();
    updateInspirationSection();
}

function saveInspirationChanges() {
    saveUserPreferences();
    closeInspirationManager();
    updateInspirationSection();
    showToast('Inspiration changes saved successfully!');
}

// Initialize the app
document.addEventListener('DOMContentLoaded', init);
