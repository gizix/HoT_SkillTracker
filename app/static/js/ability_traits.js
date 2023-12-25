// ability_traits.js

let abilityTraitsData; // Store the ability traits JSON data

document.addEventListener('DOMContentLoaded', function () {
    fetch('/static/data/h_o_t_traits.json')
        .then(response => response.json())
        .then(jsonData => {
            abilityTraitsData = jsonData;
            populateAbilityDropdown();
        })
        .catch(error => {
            console.error('Error fetching Ability Traits data:', error);
        });
});

function populateAbilityDropdown() {
    const abilityDropdown = document.getElementById('abilityDropdown');

    // Check if the abilityDropdown element exists before populating it
    if (abilityDropdown) {
        abilityDropdown.innerHTML = '<option value="" selected>Select an Ability</option>';

        if (abilityTraitsData && abilityTraitsData.ability_traits && abilityTraitsData.ability_traits.abilities) {
            const abilities = abilityTraitsData.ability_traits.abilities;

            // Sort the abilities alphabetically by name
            abilities.sort((a, b) => a.name.localeCompare(b.name));

            abilities.forEach(ability => {
                const option = document.createElement('option');
                option.value = ability.name;
                option.textContent = ability.name;
                abilityDropdown.appendChild(option);
            });
        }
    }
}

// Add an event listener to the ability dropdown within the abilityTraitsContainer
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
            console.log('Selected Ability Data:', selectedAbilityData); // Debugging

            // Check if the ability is already in the dropdown before removing it
            const selectedOption = abilityDropdown.querySelector(`option[value="${selectedAbility}"]`);
            if (selectedOption) {
                selectedOption.remove();
            }

            // Create a new row for the ability traits
            const row = document.createElement('div');
            row.className = 'ability-traits-row';

            // Create a button to drop the ability
            const dropButton = document.createElement('button');
            dropButton.textContent = 'X';
            dropButton.className = 'drop-ability-button';
            dropButton.addEventListener('click', function () {
                // Handle dropping the ability here
                row.remove(); // Remove the row
                // Re-add the ability to the dropdown and reorder it alphabetically
                const option = document.createElement('option');
                option.value = selectedAbility;
                option.textContent = selectedAbility;
                abilityDropdown.appendChild(option);
                reorderDropdown(abilityDropdown);
            });

            // Add the drop button to the row
            row.appendChild(dropButton);

            // Create a header for the Ability name
            const abilityHeader = document.createElement('h3');
            abilityHeader.textContent = selectedAbility;

            // Create a table to display the traits
            const table = document.createElement('table');
            table.className = 'ability-traits-table';

            // Create the table headers (I, II, III, IV, ..., X)
            const headerRow = document.createElement('tr');
            for (let i = 1; i <= 10; i++) {
                const headerCell = document.createElement('th');
                headerCell.textContent = romanize(i);
                headerRow.appendChild(headerCell);
            }
            table.appendChild(headerRow);

            // Create an array to store the columns for each level
            const levelColumns = [];

            // Iterate over the levels (I, II, III, IV, ...)
            for (let i = 1; i <= 10; i++) {
                const level = romanize(i);

                // Create an array to store the buttons for this level
                const levelButtons = [];

                // Iterate over the trait names within this level
                for (const traitName in selectedAbilityData[level]) {
                    const traitDetails = selectedAbilityData[level][traitName];
                    // Create a button for the ability trait
                    const traitButton = document.createElement('button');

                    // Add the "ability-trait-button" class to the button
                    traitButton.classList.add('ability-trait-button');

                    // Add the selected/selected-twice/selected-thrice logic here
                    traitButton.addEventListener('click', function () {
                        if (traitButton.classList.contains('selected')) {
                            traitButton.classList.remove('selected');
                            traitButton.classList.add('selected-twice');
                        } else if (traitButton.classList.contains('selected-twice')) {
                            traitButton.classList.remove('selected-twice');
                            traitButton.classList.add('selected-thrice');
                        } else if (traitButton.classList.contains('selected-thrice')) {
                            traitButton.classList.remove('selected-thrice');
                        } else {
                            traitButton.classList.add('selected');
                        }
                        updateSummary();
                    });

                    const traitNameLine = document.createElement('div');
                    traitNameLine.textContent = traitName;
                    const traitPropertyLine = document.createElement('div');
                    traitPropertyLine.textContent = Object.entries(traitDetails)
                        .map(([key, value]) => `${key}: ${value}`)
                        .join('\n');
                    traitButton.appendChild(traitNameLine);
                    traitButton.appendChild(traitPropertyLine);
                    levelButtons.push(traitButton);
                }

                // Add this level's buttons to the levelColumns array
                levelColumns.push(levelButtons);
            }

            // Create table rows from the columns
            for (let i = 0; i < Math.max(...levelColumns.map(column => column.length)); i++) {
                const levelRow = document.createElement('tr');
                for (let j = 0; j < levelColumns.length; j++) {
                    const levelCell = document.createElement('td');
                    levelCell.classList.add('trait-cell');
                    if (levelColumns[j][i]) {
                        levelCell.appendChild(levelColumns[j][i]);
                    }
                    levelRow.appendChild(levelCell);
                }
                table.appendChild(levelRow);
            }

            // Add the header and table to the row
            row.appendChild(abilityHeader);
            row.appendChild(table);

            // Add the row to the abilityTraitsColumns
            abilityTraitsColumns.appendChild(row);
        } else {
            console.log('Selected Ability Data not found.'); // Debugging
        }
    } else {
        console.log('Ability Traits Data not found.'); // Debugging
    }
}

// Function to convert a number to a Roman numeral (1 to 10)
function romanize(num) {
    const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
    return romanNumerals[num - 1];
}

function reorderDropdown(dropdown) {
    // Remove all options except the default "Select an Ability"
    const options = Array.from(dropdown.options);
    options.forEach(option => {
        if (option.value !== "") {
            option.remove();
        }
    });

    // Get the remaining options and sort them alphabetically
    const remainingOptions = options.map(option => option.value);
    remainingOptions.sort((a, b) => a.localeCompare(b));

    // Re-add the remaining options to the dropdown
    remainingOptions.forEach(optionText => {
        const option = document.createElement('option');
        option.value = optionText;
        option.textContent = optionText;
        dropdown.appendChild(option);
    });
}

// Initialize the ability dropdown when the page loads
populateAbilityDropdown();
