let data = {};

document.addEventListener('DOMContentLoaded', function() {
    let loadCloseButton = document.querySelector('#loadModalCloseBtn');
    let saveCloseButton = document.querySelector('#saveModalCloseBtn');

    if (loadCloseButton) {
        loadCloseButton.addEventListener('click', function() {
            document.getElementById('loadStateModal').style.display = 'none';
        });
    }

    if (saveCloseButton) {
        saveCloseButton.addEventListener('click', function() {
            document.getElementById('saveStateModal').style.display = 'none';
        });
    }

    const switchButton = document.getElementById('switchToAbilityTraits');

    // Function to toggle between views
    function toggleView() {
        const abilityTraitsContainer = document.getElementById('abilityTraitsContainer');
        const panelsContainer = document.getElementById('panelsContainer');
        const selectionContainer = document.getElementById('selectionContainer')
        const abilitySelectionContainer = document.getElementById('abilitySelectionContainer')


        if (abilityTraitsContainer.style.display === 'none') {
            // Switch to Ability Traits view
            abilityTraitsContainer.style.display = 'block';
            panelsContainer.style.display = 'none';
            selectionContainer.style.display = 'none';
            switchButton.textContent = 'Switch to Class Traits';
            abilitySelectionContainer.style.display = 'flex';
        } else {
            // Switch to Class Traits view
            abilityTraitsContainer.style.display = 'none';
            panelsContainer.style.display = 'flex';
            selectionContainer.style.display = 'flex'
            switchButton.textContent = 'Switch to Ability Traits';
            abilitySelectionContainer.style.display = 'none'
        }
    }

    switchButton.addEventListener('click', function() {
        loadAbilityTraits();
        toggleView();
        if (switchButton.textContent === 'Switch to Ability Traits') {
            loadColumns();
        }
    });
});

function formatTraitDetails(details) {
    return Object.entries(details)
        .map(([key, value]) => `${key}: ${value}`)
        .join('<br>'); // Each ability on its own line
}

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
            //console.log(`Traits of type ${type} and level ${level}:`, traitsOfLevelAndType.length);
            if (traitsOfLevelAndType.length >= 2) {
                totalPotions += traitsOfLevelAndType.length - 1;
            }
        });
    });

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
        //console.log("Working in section:", traitTypeDiv.className); // Debugging for traitTypeDiv class

        Object.entries(trait).forEach(([level, details]) => {
            if (level !== 'type') {
                const levelDiv = document.createElement('div');
                levelDiv.className = 'level';
                traitTypeDiv.appendChild(levelDiv);
                //console.log("Working in subsection:", levelDiv.className); // Debugging for levelDiv class

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
                        console.log("Button right-clicked")
                        event.preventDefault(); // Prevent the default context menu from showing up
                        if (btn.classList.contains('checked')) {
                            btn.classList.remove('checked');
                            console.log("check removed")
                        } else {
                            btn.classList.add('checked');
                            console.log("check added")
                        }
                    };

                    levelDiv.appendChild(btn);
                });

                const currentButtons = Object.keys(details).length;
                //console.log("Max buttons for", trait.type, "level", level, ":", maxButtonsPerLevel[level]);
                //console.log("Current buttons for level", level, ":", currentButtons);
                const spacersNeeded = maxButtonsPerLevel[level] - currentButtons;

                for (let i = 0; i < spacersNeeded; i++) {
                    //console.log("Adding spacer for level", level);
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
    // Set dropdown values
    document.getElementById('classDropdown1').value = state.dropdown1;
    document.getElementById('classDropdown2').value = state.dropdown2;

    // Trigger compareTraits function
    compareTraits();

    // Wait for a longer duration to ensure traits are displayed
    await new Promise(resolve => setTimeout(resolve, 100));

    // Reset all buttons
    document.querySelectorAll('button.selected, button.selected-twice, button.selected-thrice').forEach(btn => {
        btn.classList.remove('selected', 'selected-twice', 'selected-thrice');
    });

    // Set button states
    state.buttons.forEach(item => {
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

    updateSummary();
}

function showSaveMenu() {
    const savedStates = JSON.parse(localStorage.getItem('savedStates') || '{}');
    const stateNames = Object.keys(savedStates);
    const saveStateList = document.getElementById('saveStateList');
    saveStateList.innerHTML = ''; // Clear previous list

    stateNames.forEach(name => {
        const li = document.createElement('li');
        li.textContent = name;
        li.onclick = function() {
            const confirmation = confirm("Are you sure you want to overwrite this state?");
            if (confirmation) {
                saveState(name); // Overwrite the existing state
            }
        };
        saveStateList.appendChild(li);
    });

    document.getElementById('saveStateModal').style.display = 'block'; // Show the modal
}

function saveState(stateName = null) {
    if (!stateName) {
        stateName = prompt("Enter a name for this state:");
        if (!stateName) return;
    }

    const state = {
        dropdown1: document.getElementById('classDropdown1').value,
        dropdown2: document.getElementById('classDropdown2').value,
        buttons: []
    };

    const selectedButtons = document.querySelectorAll('button.selected, button.selected-twice, button.selected-thrice');
    selectedButtons.forEach(btn => {
        const traitName = btn.innerText.split('\n')[0];
        const traitType = btn.getAttribute('data-type'); // Get the trait type (e.g., "Weapon Proficiency")
        const traitClass = btn.closest('.trait-type').parentNode.id; // Get the parent container's ID to determine the class (e.g., "traitsPanel1" or "traitsPanel2")
        const level = btn.getAttribute('data-level');
        let status = 'selected';
        if (btn.classList.contains('selected-twice')) {
            status = 'selected-twice';
        } else if (btn.classList.contains('selected-thrice')) {
            status = 'selected-thrice';
        }
        state.buttons.push({ traitName, traitType, traitClass, level, status });
    });

    // Save to local storage
    const savedStates = JSON.parse(localStorage.getItem('savedStates') || '{}');
    savedStates[stateName] = state;
    localStorage.setItem('savedStates', JSON.stringify(savedStates));

    // Close the save modal
    document.getElementById('saveStateModal').style.display = 'none';
}

async function loadState() {
    const savedStates = JSON.parse(localStorage.getItem('savedStates') || '{}');
    const stateNames = Object.keys(savedStates);
    const stateList = document.getElementById('stateList');
    stateList.innerHTML = ''; // Clear previous list

    if (stateNames.length === 0) {
        alert("No saved states found!");
        return;
    }

    stateNames.forEach(name => {
        const li = document.createElement('li');
        li.textContent = name;
        li.onclick = function() {
            applyState(savedStates[name]);
            document.getElementById('loadStateModal').style.display = 'none'; // Close the modal
        };
        stateList.appendChild(li);
    });

    document.getElementById('loadStateModal').style.display = 'block'; // Show the modal
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
