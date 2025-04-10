// DOM Elements
const themeToggle = document.getElementById('themeToggle');
const darkIcon = document.getElementById('darkIcon');
const lightIcon = document.getElementById('lightIcon');
const adminInspirationFilter = document.getElementById('adminInspirationFilter');
const adminInspirationSearch = document.getElementById('adminInspirationSearch');
const adminInspirationsList = document.getElementById('adminInspirationsList');
const addAdminInspirationBtn = document.getElementById('addAdminInspirationBtn');
const adminInspirationModal = document.getElementById('adminInspirationModal');
const closeAdminInspirationModalBtn = document.getElementById('closeAdminInspirationModalBtn');
const adminModalTitle = document.getElementById('adminModalTitle');
const adminInspirationText = document.getElementById('adminInspirationText');
const adminInspirationType = document.getElementById('adminInspirationType');
const saveAdminInspirationBtn = document.getElementById('saveAdminInspirationBtn');
const totalInspirations = document.getElementById('totalInspirations');
const customInspirations = document.getElementById('customInspirations');
const publicEntries = document.getElementById('publicEntries');
const resetDefaultInspirationsBtn = document.getElementById('resetDefaultInspirationsBtn');
const clearAllCustomInspirationsBtn = document.getElementById('clearAllCustomInspirationsBtn');
const exportInspirationsBtn = document.getElementById('exportInspirationsBtn');
const importInspirationsBtn = document.getElementById('importInspirationsBtn');
const importModal = document.getElementById('importModal');
const closeImportModalBtn = document.getElementById('closeImportModalBtn');
const importData = document.getElementById('importData');
const confirmImportBtn = document.getElementById('confirmImportBtn');
const confirmationModal = document.getElementById('confirmationModal');
const confirmationMessage = document.getElementById('confirmationMessage');
const cancelConfirmationBtn = document.getElementById('cancelConfirmationBtn');
const confirmActionBtn = document.getElementById('confirmActionBtn');

// State
let entries = [];
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
let pendingAction = null;

// Default inspirations from the main app
const defaultInspirations = [
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
    renderInspirationsList();
    updateStats();
    
    // Event listeners
    themeToggle.addEventListener('click', toggleTheme);
    adminInspirationFilter.addEventListener('change', filterInspirations);
    adminInspirationSearch.addEventListener('input', filterInspirations);
    addAdminInspirationBtn.addEventListener('click', openAddInspirationModal);
    closeAdminInspirationModalBtn.addEventListener('click', closeInspirationModal);
    saveAdminInspirationBtn.addEventListener('click', saveInspiration);
    resetDefaultInspirationsBtn.addEventListener('click', () => showConfirmation('Reset all default inspirations to their original state?', resetDefaultInspirations));
    clearAllCustomInspirationsBtn.addEventListener('click', () => showConfirmation('Clear all custom inspirations? This action cannot be undone.', clearAllCustomInspirations));
    exportInspirationsBtn.addEventListener('click', exportInspirations);
    importInspirationsBtn.addEventListener('click', openImportModal);
    closeImportModalBtn.addEventListener('click', closeImportModal);
    confirmImportBtn.addEventListener('click', importInspirations);
    cancelConfirmationBtn.addEventListener('click', closeConfirmationModal);
    confirmActionBtn.addEventListener('click', executeConfirmedAction);
}

// Load user preferences
function loadUserPreferences() {
    const savedPreferences = localStorage.getItem('tilPreferences');
    if (savedPreferences) {
        userPreferences = JSON.parse(savedPreferences);
        
        // Initialize customInspirations if it doesn't exist
        if (!userPreferences.customInspirations) {
            userPreferences.customInspirations = [];
        }
        
        // Initialize defaultInspirations if it doesn't exist
        if (!userPreferences.defaultInspirations) {
            userPreferences.defaultInspirations = [...defaultInspirations];
        }
    } else {
        // Check system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            userPreferences.theme = 'dark';
        }
        userPreferences.defaultInspirations = [...defaultInspirations];
        saveUserPreferences();
    }
}

// Save user preferences
function saveUserPreferences() {
    localStorage.setItem('tilPreferences', JSON.stringify(userPreferences));
}

// Load entries
function loadEntries() {
    const savedEntries = localStorage.getItem('tilEntries');
    if (savedEntries) {
        entries = JSON.parse(savedEntries);
    }
}

// Save entries
function saveEntries() {
    localStorage.setItem('tilEntries', JSON.stringify(entries));
}

// Theme functions
function setTheme() {
    if (userPreferences.theme === 'dark') {
        document.documentElement.classList.remove('light');
        document.documentElement.classList.add('dark');
        darkIcon.classList.add('hidden');
        lightIcon.classList.remove('hidden');
    } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
        darkIcon.classList.remove('hidden');
        lightIcon.classList.add('hidden');
    }
}

function toggleTheme() {
    userPreferences.theme = userPreferences.theme === 'dark' ? 'light' : 'dark';
    saveUserPreferences();
    setTheme();
}

// Format date for display
function formatDisplayDate(date) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
}

// Render inspirations list
function renderInspirationsList() {
    adminInspirationsList.innerHTML = '';
    
    // Get all inspirations
    const allInspirations = [];
    
    // Add default inspirations
    defaultInspirations.forEach((inspiration, index) => {
        // Check if this default inspiration has been customized
        let content = inspiration;
        let isDeleted = false;
        
        if (userPreferences.defaultInspirations && userPreferences.defaultInspirations[index] !== undefined) {
            if (userPreferences.defaultInspirations[index] === null) {
                isDeleted = true;
            } else {
                content = userPreferences.defaultInspirations[index];
            }
        }
        
        if (!isDeleted) {
            allInspirations.push({
                content,
                type: 'default',
                index,
                date: 'Original'
            });
        }
    });
    
    // Add custom inspirations
    if (userPreferences.customInspirations) {
        userPreferences.customInspirations.forEach((inspiration, index) => {
            allInspirations.push({
                content: inspiration,
                type: 'custom',
                index,
                date: 'Custom'
            });
        });
    }
    
    // Add public entries
    const publicEntries = entries.filter(entry => entry.isPublic);
    publicEntries.forEach((entry, index) => {
        allInspirations.push({
            content: entry.content,
            type: 'entry',
            id: entry.id,
            date: formatDisplayDate(new Date(entry.date))
        });
    });
    
    // Render all inspirations
    allInspirations.forEach(inspiration => {
        const row = document.createElement('tr');
        
        // Determine type label and class
        let typeLabel, typeClass;
        switch (inspiration.type) {
            case 'default':
                typeLabel = 'Default';
                typeClass = 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
                break;
            case 'custom':
                typeLabel = 'Custom';
                typeClass = 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
                break;
            case 'entry':
                typeLabel = 'Entry';
                typeClass = 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
                break;
        }
        
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-normal">
                <div class="text-sm text-gray-900 dark:text-gray-100">${inspiration.content}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${typeClass}">
                    ${typeLabel}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                ${inspiration.date}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-3 edit-btn" data-type="${inspiration.type}" data-index="${inspiration.index || ''}" data-id="${inspiration.id || ''}">
                    Edit
                </button>
                <button class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 delete-btn" data-type="${inspiration.type}" data-index="${inspiration.index || ''}" data-id="${inspiration.id || ''}">
                    ${inspiration.type === 'entry' ? 'Make Private' : 'Delete'}
                </button>
            </td>
        `;
        
        // Add event listeners
        const editBtn = row.querySelector('.edit-btn');
        const deleteBtn = row.querySelector('.delete-btn');
        
        editBtn.addEventListener('click', () => {
            if (inspiration.type === 'default') {
                editInspiration('default', inspiration.index);
            } else if (inspiration.type === 'custom') {
                editInspiration('custom', inspiration.index);
            } else if (inspiration.type === 'entry') {
                editEntry(inspiration.id);
            }
        });
        
        deleteBtn.addEventListener('click', () => {
            if (inspiration.type === 'default') {
                showConfirmation('Delete this default inspiration?', () => deleteInspiration('default', inspiration.index));
            } else if (inspiration.type === 'custom') {
                showConfirmation('Delete this custom inspiration?', () => deleteInspiration('custom', inspiration.index));
            } else if (inspiration.type === 'entry') {
                showConfirmation('Make this entry private?', () => makeEntryPrivate(inspiration.id));
            }
        });
        
        adminInspirationsList.appendChild(row);
    });
    
    // Apply current filter
    filterInspirations();
}

// Filter inspirations
function filterInspirations() {
    const filterValue = adminInspirationFilter.value;
    const searchValue = adminInspirationSearch.value.toLowerCase();
    
    Array.from(adminInspirationsList.querySelectorAll('tr')).forEach(row => {
        const text = row.querySelector('td:first-child').textContent.toLowerCase();
        const type = row.querySelector('.edit-btn').dataset.type;
        
        const isVisible = 
            (filterValue === 'all' || 
             (filterValue === 'default' && type === 'default') || 
             (filterValue === 'custom' && type === 'custom') ||
             (filterValue === 'entries' && type === 'entry')) && 
            (searchValue === '' || text.includes(searchValue));
        
        row.style.display = isVisible ? '' : 'none';
    });
}

// Update statistics
function updateStats() {
    // Count default inspirations that aren't deleted
    let defaultCount = 0;
    if (userPreferences.defaultInspirations) {
        defaultCount = userPreferences.defaultInspirations.filter(i => i !== null).length;
    } else {
        defaultCount = defaultInspirations.length;
    }
    
    // Count custom inspirations
    const customCount = userPreferences.customInspirations ? userPreferences.customInspirations.length : 0;
    
    // Count public entries
    const publicEntriesCount = entries.filter(entry => entry.isPublic).length;
    
    // Update UI
    totalInspirations.textContent = defaultCount + customCount + publicEntriesCount;
    customInspirations.textContent = customCount;
    publicEntries.textContent = publicEntriesCount;
}

// Inspiration modal functions
function openAddInspirationModal() {
    editingInspirationId = null;
    adminModalTitle.textContent = 'Add New Inspiration';
    adminInspirationText.value = '';
    adminInspirationType.value = 'custom';
    adminInspirationModal.classList.remove('hidden');
}

function closeInspirationModal() {
    adminInspirationModal.classList.add('hidden');
}

function editInspiration(type, index) {
    let text = '';
    
    if (type === 'default') {
        // Get the current value (which might be customized)
        if (userPreferences.defaultInspirations && userPreferences.defaultInspirations[index] !== null) {
            text = userPreferences.defaultInspirations[index] || defaultInspirations[index];
        } else {
            text = defaultInspirations[index];
        }
        
        editingInspirationId = { type, index };
        adminInspirationType.value = 'default';
    } else if (type === 'custom') {
        text = userPreferences.customInspirations[index];
        editingInspirationId = { type, index };
        adminInspirationType.value = 'custom';
    }
    
    adminModalTitle.textContent = 'Edit Inspiration';
    adminInspirationText.value = text;
    adminInspirationModal.classList.remove('hidden');
}

function saveInspiration() {
    const text = adminInspirationText.value.trim();
    const type = adminInspirationType.value;
    
    if (!text) return;
    
    if (editingInspirationId) {
        // Update existing inspiration
        if (editingInspirationId.type === 'default') {
            // Create a copy of default inspirations if not already
            if (!userPreferences.defaultInspirations) {
                userPreferences.defaultInspirations = [...defaultInspirations];
            }
            
            userPreferences.defaultInspirations[editingInspirationId.index] = text;
        } else if (editingInspirationId.type === 'custom') {
            userPreferences.customInspirations[editingInspirationId.index] = text;
        }
    } else {
        // Add new inspiration
        if (type === 'default') {
            // Create a copy of default inspirations if not already
            if (!userPreferences.defaultInspirations) {
                userPreferences.defaultInspirations = [...defaultInspirations];
            }
            
            userPreferences.defaultInspirations.push(text);
        } else {
            // Add to custom inspirations
            if (!userPreferences.customInspirations) {
                userPreferences.customInspirations = [];
            }
            
            userPreferences.customInspirations.push(text);
        }
    }
    
    saveUserPreferences();
    closeInspirationModal();
    renderInspirationsList();
    updateStats();
    showToast('Inspiration saved successfully!');
}

function deleteInspiration(type, index) {
    if (type === 'default') {
        // Create a copy of default inspirations if not already
        if (!userPreferences.defaultInspirations) {
            userPreferences.defaultInspirations = [...defaultInspirations];
        }
        
        // Mark as deleted in user preferences
        userPreferences.defaultInspirations[index] = null;
    } else if (type === 'custom') {
        // Remove from custom inspirations
        userPreferences.customInspirations.splice(index, 1);
    }
    
    saveUserPreferences();
    renderInspirationsList();
    updateStats();
    showToast('Inspiration deleted successfully!');
}

function editEntry(entryId) {
    // Redirect to main page with entry ID in URL
    window.location.href = `index.html?edit=${entryId}`;
}

function makeEntryPrivate(entryId) {
    const entryIndex = entries.findIndex(e => e.id === entryId);
    if (entryIndex !== -1) {
        entries[entryIndex].isPublic = false;
        saveEntries();
        renderInspirationsList();
        updateStats();
        showToast('Entry made private successfully!');
    }
}

// Advanced options functions
function resetDefaultInspirations() {
    userPreferences.defaultInspirations = [...defaultInspirations];
    saveUserPreferences();
    renderInspirationsList();
    updateStats();
    showToast('Default inspirations reset successfully!');
}

function clearAllCustomInspirations() {
    userPreferences.customInspirations = [];
    saveUserPreferences();
    renderInspirationsList();
    updateStats();
    showToast('All custom inspirations cleared successfully!');
}

// Export/Import functions
function exportInspirations() {
    // Prepare export data
    const exportData = {
        defaultInspirations: userPreferences.defaultInspirations || [...defaultInspirations],
        customInspirations: userPreferences.customInspirations || []
    };
    
    // Create download link
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "til_inspirations_" + new Date().toISOString().split('T')[0] + ".json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    
    showToast('Inspirations exported successfully!');
}

function openImportModal() {
    importData.value = '';
    importModal.classList.remove('hidden');
}

function closeImportModal() {
    importModal.classList.add('hidden');
}

function importInspirations() {
    try {
        const data = JSON.parse(importData.value);
        
        if (data.defaultInspirations) {
            userPreferences.defaultInspirations = data.defaultInspirations;
        }
        
        if (data.customInspirations) {
            // Merge with existing custom inspirations
            if (!userPreferences.customInspirations) {
                userPreferences.customInspirations = [];
            }
            
            userPreferences.customInspirations = [
                ...userPreferences.customInspirations,
                ...data.customInspirations
            ];
        }
        
        saveUserPreferences();
        closeImportModal();
        renderInspirationsList();
        updateStats();
        showToast('Inspirations imported successfully!');
    } catch (error) {
        showToast('Error importing data. Please check the format.', 'error');
    }
}

// Confirmation modal functions
function showConfirmation(message, action) {
    confirmationMessage.textContent = message;
    pendingAction = action;
    confirmationModal.classList.remove('hidden');
}

function closeConfirmationModal() {
    confirmationModal.classList.add('hidden');
    pendingAction = null;
}

function executeConfirmedAction() {
    if (pendingAction) {
        pendingAction();
        closeConfirmationModal();
    }
}

// Toast notification
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-4 right-4 px-4 py-2 rounded-md shadow-md ${
        type === 'success' 
            ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' 
            : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.add('opacity-0');
        toast.style.transition = 'opacity 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// Initialize the app
document.addEventListener('DOMContentLoaded', init);
