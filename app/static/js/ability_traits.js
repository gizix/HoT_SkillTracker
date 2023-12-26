
let abilityTraitsData; // Store the ability traits JSON data
let availableAbilities = []; // Store available abilities for the dropdown

document.addEventListener('DOMContentLoaded', function () {
    fetch('/static/data/h_o_t_traits.json')
        .then(response => response.json())
        .then(jsonData => {
            abilityTraitsData = jsonData;
            availableAbilities = abilityTraitsData.ability_traits.abilities.map(ability => ability.name);
            updateAbilityDropdown();
        })
        .catch(error => {
            console.error('Error fetching Ability Traits data:', error);
        });
});

function updateAbilityDropdown() {
    const abilityDropdown = document.getElementById('abilityDropdown');
    const abilityTraitsColumns = document.querySelector('.ability-traits-columns');
    if (!abilityDropdown) return;

    abilityDropdown.innerHTML = '<option value="" selected>Select an Ability</option>';
    availableAbilities.forEach(abilityName => {
        // Check if the ability is already added to the tables
        if (!isAbilityAdded(abilityTraitsColumns, abilityName)) {
            const option = document.createElement('option');
            option.value = abilityName;
            option.textContent = abilityName;
            abilityDropdown.appendChild(option);
        }
    });
}

function isAbilityAdded(abilityTraitsColumns, abilityName) {
    if (!abilityTraitsColumns) {
        return false;
    }

    // Check all h3 elements for the ability name
    const existingAbilities = abilityTraitsColumns.querySelectorAll('h3');
    for (let i = 0; i < existingAbilities.length; i++) {
        if (existingAbilities[i].textContent === abilityName) {
            return true;
        }
    }
    return false;
}

document.addEventListener('change', function (event) {
    const abilityDropdown = document.getElementById('abilityDropdown');
    if (event.target === abilityDropdown) {
        loadColumns();
    }
});

function loadColumns() {
    const abilityDropdown = document.getElementById('abilityDropdown');
    const selectedAbility = abilityDropdown.value;
    const abilityTraitsColumns = document.querySelector('.ability-traits-columns');

    if (!selectedAbility) {
        return;
    }

    if (abilityTraitsData && abilityTraitsData.ability_traits && abilityTraitsData.ability_traits.abilities) {
        const abilities = abilityTraitsData.ability_traits.abilities;
        const selectedAbilityData = abilities.find(ability => ability.name === selectedAbility);

        if (selectedAbilityData) {
            console.log('Selected Ability Data:', selectedAbilityData);

            const selectedOption = abilityDropdown.querySelector(`option[value="${selectedAbility}"]`);
            if (selectedOption) {
                selectedOption.remove();
            }

            const row = document.createElement('div');
            row.className = 'ability-traits-row';
            const dropButton = document.createElement('button');
            dropButton.textContent = 'X';
            dropButton.className = 'drop-ability-button';
            dropButton.addEventListener('click', function () {
                row.remove();
                availableAbilities.push(selectedAbility);
                updateAbilityDropdown();
            });
            row.appendChild(dropButton);

            const abilityHeader = document.createElement('h3');
            abilityHeader.textContent = selectedAbility;
            row.appendChild(abilityHeader);

            const table = createAbilityTraitsTable(selectedAbilityData);
            row.appendChild(table);
            abilityTraitsColumns.appendChild(row);

            const abilityIndex = availableAbilities.indexOf(selectedAbility);
            if (abilityIndex > -1) {
                availableAbilities.splice(abilityIndex, 1);
                updateAbilityDropdown();
            }
        } else {
            console.log('Selected Ability Data not found.');
        }
    } else {
        console.log('Ability Traits Data not found.');
    }
}

function createAbilityTraitsTable(selectedAbilityData) {
    const table = document.createElement('table');
    table.className = 'ability-traits-table';

    const headerRow = document.createElement('tr');
    for (let i = 1; i <= 10; i++) {
        const headerCell = document.createElement('th');
        headerCell.textContent = romanize(i);
        headerRow.appendChild(headerCell);
    }
    table.appendChild(headerRow);

    const levelColumns = createLevelColumns(selectedAbilityData);
    for (let i = 0; i < Math.max(...levelColumns.map(column => column.length)); i++) {
        const levelRow = document.createElement('tr');
        levelColumns.forEach(column => {
            const levelCell = document.createElement('td');
            levelCell.classList.add('trait-cell');
            if (column[i]) {
                levelCell.appendChild(column[i]);
            }
            levelRow.appendChild(levelCell);
        });
        table.appendChild(levelRow);
    }

    return table;
}

function createLevelColumns(selectedAbilityData) {
    const levelColumns = [];
    for (let i = 1; i <= 10; i++) {
        const level = romanize(i);
        const levelButtons = [];

        for (const traitName in selectedAbilityData[level]) {
            const traitDetails = selectedAbilityData[level][traitName];
            const traitButton = document.createElement('button');
            traitButton.className = 'button ability-trait-button';
            traitButton.style.position = 'relative';
            traitButton.innerHTML = `<strong>${traitName}</strong><br>` +
                Object.entries(traitDetails)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join('<br>');
            setupTraitButtonListeners(traitButton, level);
            levelButtons.push(traitButton);
        }
        levelColumns.push(levelButtons);
    }
    return levelColumns;
}

function setupTraitButtonListeners(traitButton, level) {
    traitButton.addEventListener('click', function () {
        toggleTraitButtonState(traitButton);
        updateSummary();
    });

    traitButton.oncontextmenu = function(event) {
        event.preventDefault();
        toggleTraitButtonCheck(traitButton);
    };

    traitButton.setAttribute('data-level', level);
}

function toggleTraitButtonState(button) {
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
}

function toggleTraitButtonCheck(button) {
    if (button.classList.contains('checked')) {
        button.classList.remove('checked');
    } else {
        button.classList.add('checked');
    }
}

function romanize(num) {
    const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
    return romanNumerals[num - 1];
}
