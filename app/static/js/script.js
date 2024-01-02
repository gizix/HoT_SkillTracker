let data = {};
let savedAbilityTraitsHTML = null;  // Variable to store the HTML content of ability traits
let isAbilityTraitsLoaded = false;  // Flag to check if the ability traits have been loaded

document.addEventListener('DOMContentLoaded', function() {
    // Event listeners for modal close buttons
    const loadCloseButton = document.querySelector('#loadModalCloseBtn');
    const saveCloseButton = document.querySelector('#saveModalCloseBtn');

    loadCloseButton?.addEventListener('click', () => document.getElementById('loadStateModal').style.display = 'none');
    saveCloseButton?.addEventListener('click', () => document.getElementById('saveStateModal').style.display = 'none');

    // Toggle view for ability and class traits
    const switchButton = document.getElementById('switchToAbilityTraits');

    function toggleView() {
        const abilityTraitsContainer = document.getElementById('abilityTraitsContainer');
        const panelsContainer = document.getElementById('panelsContainer');
        const selectionContainer = document.getElementById('selectionContainer');
        const abilitySelectionContainer = document.getElementById('abilitySelectionContainer');

        if (abilityTraitsContainer.style.display === 'flex') {
            savedAbilityTraitsHTML = abilityTraitsContainer.innerHTML;
            abilityTraitsContainer.style.display = 'none';
            panelsContainer.style.display = 'flex';
            selectionContainer.style.display = 'flex';
            switchButton.textContent = 'Switch to Ability Traits';
            abilitySelectionContainer.style.display = 'none';
        } else if (switchButton.textContent === 'Switch to Ability Traits') {
            // Check if ability traits have been loaded before restoring
            if (!isAbilityTraitsLoaded) {
                loadAbilityTraits();
                isAbilityTraitsLoaded = true;
            } else if (savedAbilityTraitsHTML) {
                abilityTraitsContainer.innerHTML = savedAbilityTraitsHTML;
            }
            abilityTraitsContainer.style.display = 'flex';
            abilitySelectionContainer.style.display = 'flex';
            panelsContainer.style.display = 'none';
            selectionContainer.style.display = 'none';
            switchButton.textContent = 'Switch to Class Traits';
            updateAbilityDropdown();
            reapplyEventListeners();
        }
    }

    switchButton.addEventListener('click', function() {
        toggleView(); // Only toggle view, don't load every time
        if (switchButton.textContent === 'Switch to Ability Traits') {
            loadColumns();
        }
    });
});

function populateDropdowns() {
    const dropdown1 = document.getElementById('classDropdown1');
    const dropdown2 = document.getElementById('classDropdown2');

    data.class_traits.classes.forEach(cls => {
        const option1 = document.createElement('option');
        option1.value = cls.class;
        option1.textContent = cls.class;
        dropdown1.appendChild(option1);

        const option2 = document.createElement('option');
        option2.value = cls.class;
        option2.textContent = cls.class;
        dropdown2.appendChild(option2);
    });
}

function compareTraits() {
    const dropdown1 = document.getElementById('classDropdown1');
    const dropdown2 = document.getElementById('classDropdown2');
    const class1 = dropdown1.value;
    const class2 = dropdown2.value;
    const class1Container = document.getElementById('traitsPanel1');
    const class2Container = document.getElementById('traitsPanel2');

    const class1Traits = data.class_traits.classes.find(c => c.class === class1).traits;
    const class2Traits = data.class_traits.classes.find(c => c.class === class2).traits;

    displayTraits(class1Container, class1Traits);
    displayTraits(class2Container, class2Traits);
}

function updateSummary() {
    const summary = {};
    const selectedButtons = document.querySelectorAll('button.selected, button.selected-twice');
    selectedButtons.forEach(btn => {
        const traitDetails = JSON.parse(btn.getAttribute('data-trait-details'));

        if (traitDetails && typeof traitDetails === 'object') {
            const multiplier = btn.classList.contains('selected-twice') ? 2 : 1;
            Object.entries(traitDetails).forEach(([key, value]) => {
                const numericValue = parseFloat(value);
                if (summary[key]) {
                    // Add the values and round to two decimal places
                    summary[key] = parseFloat(parseFloat(summary[key]) + (numericValue * multiplier)).toFixed(2);
                } else {
                    summary[key] = (numericValue * multiplier).toFixed(2);
                }
                // Append '%' only if the original value had it
                if (value.includes('%')) {
                    summary[key] += '%';
                }
            });
        }
    });

    const summaryDiv = document.getElementById('summaryText');
    summaryDiv.innerHTML = '';
    Object.entries(summary).forEach(([key, value]) => {
        summaryDiv.innerHTML += `${key}: ${value}<br>`;
    });

    // Calculate Tincture
    const selectedTwiceButtons = Array.from(document.querySelectorAll('button.selected-twice'));
    const tinctureCount = selectedTwiceButtons.length;

    let tinctureColor = 'grey';
    if (tinctureCount === 3) {
        tinctureColor = 'green';
    } else if (tinctureCount > 3) {
        tinctureColor = 'red';
    }

    // Calculate potions of memory
    const levels = ['I', 'II', 'III', 'IV'];
    const traitTypes = ['Weapon Proficiency', 'Proficient Stance', 'Dedication'];
    let totalPotions = 0;
    traitTypes.forEach(type => {
        levels.forEach(level => {
            const traitsOfLevelAndType = document.querySelectorAll(`button[data-level="${level}"][data-type="${type}"].selected, button[data-level="${level}"][data-type="${type}"].selected-twice`);
            if (traitsOfLevelAndType.length >= 2) {
                totalPotions += traitsOfLevelAndType.length - 1;
            }
        });
    });

    // Calculate potions of memory for ability traits
    const abilityMemoryPotions = calculateMemoryPotionsForAbilityTraits();
    totalPotions += abilityMemoryPotions;

    // Update the color based on the number of potions
    let color = 'gray';
    if (totalPotions === 8) {
        color = 'green';
    } else if (totalPotions > 8) {
        color = 'red';
    }

    summaryDiv.innerHTML += `<span style="color:${color};">Memory: ${totalPotions}/8</span>`;
    summaryDiv.innerHTML += `<br><span style="color:${tinctureColor}">Tincture: ${tinctureCount}/3</span>`;

    // Calculate Potion of Oblivion
    const selectedThriceButtons = Array.from(document.querySelectorAll('button.selected-thrice'));
    const oblivionCount = selectedThriceButtons.length;
    let oblivionColor = 'gray';
    if (oblivionCount === 8) {
        oblivionColor = 'green';
    } else if (oblivionCount > 8) {
        oblivionColor = 'red';
    }

    summaryDiv.innerHTML += `<br><span style="color:${oblivionColor};">Potion of Oblivion: ${oblivionCount}/8</span>`;

    showSummaryModal();
}

function displayTraits(container, traitsList) {
    container.innerHTML = ''; // Clear previous traits

    // Determine the maximum number of buttons for each level across all trait types
    const maxButtonsPerLevel = {};
    traitsList.forEach(trait => {
        Object.entries(trait).forEach(([level, details]) => {
            if (level !== 'type') {
                const buttonCount = Object.keys(details).length;
                maxButtonsPerLevel[level] = maxButtonsPerLevel[level] ? Math.max(maxButtonsPerLevel[level], buttonCount) : buttonCount;
            }
        });
    });

    traitsList.forEach(trait => {
        const traitTypeDiv = document.createElement('div');
        traitTypeDiv.className = 'trait-type';
        traitTypeDiv.innerHTML = `<h3>${trait.type}</h3>`;
        container.appendChild(traitTypeDiv);

        Object.entries(trait).forEach(([level, details]) => {
            if (level !== 'type') {
                const levelDiv = document.createElement('div');
                levelDiv.className = 'level';
                traitTypeDiv.appendChild(levelDiv);

                Object.entries(details).forEach(([traitName, traitDetails]) => {
                    const btn = document.createElement('button');
                    const traitDetailsFormatted = Object.entries(traitDetails)
                        .map(([key, value]) => `${key}: ${value}`)
                        .join('<br>');
                    btn.innerHTML = `<strong>${traitName}</strong><br>${traitDetailsFormatted}`;
                    btn.setAttribute('data-trait-details', JSON.stringify(traitDetails));
                    btn.setAttribute('data-level', level);
                    btn.setAttribute('data-type', trait.type);
                    btn.onclick = function() {
                        if (btn.classList.contains('selected')) {
                            btn.classList.remove('selected');
                            btn.classList.add('selected-twice');
                        } else if (btn.classList.contains('selected-twice')) {
                            btn.classList.remove('selected-twice');
                            btn.classList.add('selected-thrice')
                        } else if (btn.classList.contains('selected-thrice')) {
                            btn.classList.remove('selected-thrice');
                        } else {
                            btn.classList.add('selected');
                        }
                        updateSummary();
                    };
                    btn.style.position = 'relative'; // This ensures the ::after pseudo-element is positioned relative to the button
                    btn.oncontextmenu = function(event) {
                        event.preventDefault(); // Prevent the default context menu from showing up
                        if (btn.classList.contains('checked')) {
                            btn.classList.remove('checked');
                        } else {
                            btn.classList.add('checked');
                        }
                    };

                    levelDiv.appendChild(btn);
                });

                const currentButtons = Object.keys(details).length;
                const spacersNeeded = maxButtonsPerLevel[level] - currentButtons;

                for (let i = 0; i < spacersNeeded; i++) {
                    const spacerDiv = document.createElement('div');
                    spacerDiv.className = 'button spacer';
                    levelDiv.appendChild(spacerDiv);
                }
            }
        });
    });
}

// Load JSON data on page load
window.onload = function() {
    fetch('/static/data/h_o_t_traits.json')
        .then(response => response.json())
        .then(jsonData => {
            data = jsonData;
            populateDropdowns();
        })
        .catch(error => {
            console.error('Error fetching JSON data:', error);
        });
};

async function applyState(state) {
     console.log('Applying State:', state);

    // Apply class traits state
    if (state.classTraits) {
        console.log('Applying class traits state...')
        await applyClassTraitsState(state.classTraits);
    }

    // Restore ability traits HTML
    if (state.abilityTraitsHTML) {
        savedAbilityTraitsHTML = state.abilityTraitsHTML;
        const abilityTraitsContainer = document.getElementById('abilityTraitsContainer');
        if (abilityTraitsContainer.style.display === 'flex') {
            abilityTraitsContainer.innerHTML = savedAbilityTraitsHTML;
            reapplyEventListeners();
        }
        isAbilityTraitsLoaded = true;
    }

    updateSummary();
}

// Helper function to apply the state of class traits
async function applyClassTraitsState(classTraitsState) {
    document.getElementById('classDropdown1').value = classTraitsState.dropdown1;
    document.getElementById('classDropdown2').value = classTraitsState.dropdown2;

    compareTraits();  // Assuming this function sets up the class traits based on dropdown values

    await new Promise(resolve => setTimeout(resolve, 100));

    // Reset and set button states
    document.querySelectorAll('button.selected, button.selected-twice, button.selected-thrice').forEach(btn => {
        btn.classList.remove('selected', 'selected-twice', 'selected-thrice');
    });

    classTraitsState.buttons.forEach(item => {
        const traitTypeDivs = document.querySelectorAll(`#${item.traitClass} .trait-type`);
        let matchingDiv;
        traitTypeDivs.forEach(div => {
            if (div.querySelector('h3').innerText === item.traitType) {
                matchingDiv = div;
            }
        });

        if (matchingDiv) {
            const btn = Array.from(matchingDiv.querySelectorAll(`button[data-level="${item.level}"]`)).find(button => button.innerText.split('\n')[0] === item.traitName);
            if (btn) {
                btn.classList.add(item.status);
            }
        }
    });
}

function showSaveMenu() {
    fetch('/load_states')
    .then(response => response.json())
    .then(data => {
        populateSaveStateList(data);
    })
    .catch(error => {
        console.error('Error loading states:', error);
    });
}

function populateSaveStateList(states) {
    const saveStateList = document.getElementById('saveStateList');
    saveStateList.innerHTML = ''; // Clear previous list

    Object.keys(states).forEach(stateName => {
        const li = document.createElement('li');
        li.textContent = stateName;
        li.onclick = function() {
            const confirmation = confirm("Are you sure you want to overwrite this state?");
            if (confirmation) {
                saveState(stateName); // Overwrite the existing state
                closeModal('saveStateModal'); // Close the modal after saving
            }
        };
        saveStateList.appendChild(li);
    });

    document.getElementById('saveStateModal').style.display = 'block'; // Show the modal
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function saveState(stateName = null) {
    if (!stateName) {
        stateName = prompt("Enter a name for this state:");
        if (!stateName) return;
    }

    const selectedButtons = document.querySelectorAll('button.selected, button.selected-twice, button.selected-thrice');
    const buttons = Array.from(selectedButtons).map(btn => {
        const traitName = btn.innerText.split('\n')[0];
        const traitType = btn.getAttribute('data-type');
        const traitClass = btn.closest('.trait-type')?.parentNode?.id || 'unknown';
        const level = btn.getAttribute('data-level');
        const status = btn.classList.contains('selected-twice') ? 'selected-twice' : btn.classList.contains('selected-thrice') ? 'selected-thrice' : 'selected';
        return { traitName, traitType, traitClass, level, status };
    });

    // Capture both class traits and ability traits
    const state = {
        classTraits: {
            dropdown1: document.getElementById('classDropdown1').value,
            dropdown2: document.getElementById('classDropdown2').value,
            buttons: captureClassTraitsButtonsState()
        },
        abilityTraitsHTML: savedAbilityTraitsHTML
    };

    console.log('Attempting to save state:', stateName, state);  // Log the state being saved

    // Save all states to server
    fetch('/save_states', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ [stateName]: state })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log('State saved successfully');
        } else {
            console.error('Failed to save state:', data.error);
        }
    })
    .catch(error => {
        console.error('Error saving state:', error);
    });
}

// Helper function to capture the state of class traits buttons
function captureClassTraitsButtonsState() {
    const selectedButtons = document.querySelectorAll('button.selected, button.selected-twice, button.selected-thrice');
    return Array.from(selectedButtons).map(btn => {
        return {
            traitName: btn.innerText.split('\n')[0],
            traitType: btn.getAttribute('data-type'),
            traitClass: btn.closest('.trait-type')?.parentNode?.id || 'unknown',
            level: btn.getAttribute('data-level'),
            status: btn.classList.contains('selected-twice') ? 'selected-twice' : btn.classList.contains('selected-thrice') ? 'selected-thrice' : 'selected'
        };
    });
}

function loadState() {
    console.log('Attempting to load states');

    fetch('/load_states')
    .then(response => response.json())
    .then(data => {
        if (!data || Object.keys(data).length === 0) {
            console.log('No states found, loading empty state list');
            populateStateList({});
        } else {
            console.log('States loaded successfully:', data);
            populateStateList(data);
        }
    })
    .catch(error => {
        console.error('Error loading states:', error);
    });
}

function populateStateList(states) {
    const loadStateList = document.getElementById('stateList');
    const saveStateList = document.getElementById('saveStateList');
    loadStateList.innerHTML = '';
    saveStateList.innerHTML = '';

    Object.keys(states).forEach(stateName => {
        const loadLi = document.createElement('li');
        loadLi.textContent = stateName;
        loadLi.onclick = function() {
            applyState(states[stateName]);
            document.getElementById('loadStateModal').style.display = 'none';
        };
        loadStateList.appendChild(loadLi);

        const saveLi = document.createElement('li');
        saveLi.textContent = stateName;
        saveLi.onclick = function() {
            const confirmation = confirm("Are you sure you want to overwrite this state?");
            if (confirmation) {
                saveState(stateName);
            }
        };
        saveStateList.appendChild(saveLi);
    });

    document.getElementById('loadStateModal').style.display = 'block';
}

function showSummaryModal() {
    document.getElementById('summaryModal').style.display = 'block';
}

function hideSummaryModal() {
    document.getElementById('summaryModal').style.display = 'none';
}

function loadAbilityTraits() {
    fetch('/ability_traits') // Use the Flask route to serve the ability_traits.html template
        .then(response => response.text())
        .then(html => {
            const abilityTraitsContainer = document.getElementById('abilityTraitsContainer');
            abilityTraitsContainer.innerHTML = html;
        })
        .catch(error => {
            console.error('Error loading ability_traits.html:', error);
        });
}

function reapplyEventListeners() {
    const abilityTraitsContainer = document.getElementById('abilityTraitsContainer');
    const buttons = abilityTraitsContainer.querySelectorAll('button');
    const abilityDropdown = document.getElementById('abilityDropdown');

    buttons.forEach(button => {
        if (button.classList.contains('drop-ability-button')) {
            // Event listener for drop-ability-button
            button.addEventListener('click', function() {
                const row = button.closest('.ability-traits-row');
                const abilityName = row.querySelector('h3').textContent;

                row.remove(); // Remove the row

                // Re-add the ability to the dropdown and reorder it alphabetically
                const option = document.createElement('option');
                option.value = abilityName;
                option.textContent = abilityName;
                abilityDropdown.appendChild(option);
                reorderDropdown(abilityDropdown);
            });
        } else {
            // Assuming the click event logic is similar to this
            button.addEventListener('click', function() {
                if (button.classList.contains('selected')) {
                    button.classList.remove('selected');
                    button.classList.add('selected-twice');
                } else if (button.classList.contains('selected-twice')) {
                    button.classList.remove('selected-twice');
                    button.classList.add('selected-thrice');
                } else if (button.classList.contains('selected-thrice')) {
                    button.classList.remove('selected-thrice');
                } else {
                    button.classList.add('selected');
                }
                updateSummary();
            });

            // Add any other event listeners required for these buttons
            button.oncontextmenu = function(event) {
                event.preventDefault();
                if (button.classList.contains('checked')) {
                    button.classList.remove('checked');
                } else {
                    button.classList.add('checked');
                }
            };

            updateSummary(); // Update summary if required
        }
    });
}

// Function to reorder the dropdown alphabetically
function reorderDropdown(dropdown) {
    const options = Array.from(dropdown.querySelectorAll('option:not([value=""])'));
    options.sort((a, b) => a.textContent.localeCompare(b.textContent));

    options.forEach(option => dropdown.appendChild(option));
}

function clearClassTraits() {
    // Logic to clear class traits
    const classTraitButtons = document.querySelectorAll('#traitsPanel1 button, #traitsPanel2 button');
    classTraitButtons.forEach(button => {
        button.classList.remove('selected', 'selected-twice', 'selected-thrice', 'checked');
    });
}

function clearAbilityTraits() {
    // Logic to clear ability traits
    const abilityTraitButtons = document.querySelectorAll('#abilityTraitsContainer button');
    abilityTraitButtons.forEach(button => {
        button.classList.remove('selected', 'selected-twice', 'selected-thrice', 'checked');
    });
}

function clearAllTraits() {
    clearClassTraits();
    clearAbilityTraits();
    updateSummary();
    // Additional logic if needed for clearing the current build
}
