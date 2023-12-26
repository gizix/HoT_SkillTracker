import json
import re
import requests
from bs4 import BeautifulSoup

from utils.progress_bar_decorator import progress_bar_decorator
from utils import int_to_roman

"""This is a script for scraping the source wiki html and gathering the ability data."""


def fetch_html(url):
    response = requests.get(url)
    if response.status_code == 200:
        return response.text
    else:
        return None


def read_html_from_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as file:
        html_content = file.read()
    return html_content


def html_to_json(html, ability_name):
    soup = BeautifulSoup(html, 'html.parser')
    ability_header = soup.find('span', class_='mw-headline', id=ability_name.replace(" ", "_"))

    if not ability_header:
        return None

    ability_section = ability_header.find_next('table')
    rows = ability_section.find_all('tr')[1:]  # Skip header row

    # Extracting the type from the first row of the table
    type_row = ability_section.find('tr')
    type_columns = type_row.find_all('td')
    type_text = type_columns[1].find('div').find('span').get_text(strip=True)

    # Clean up the type text to remove the ability name
    cleaned_type = type_text.replace(ability_name, '').strip()

    ability_data = {
        "name": ability_name,
        "type": cleaned_type,
    }

    # Process the remaining rows for ability details
    for row in rows[1:]:
        columns = row.find_all('td')
        if len(columns) < 4:
            continue  # Skip rows with insufficient columns
        trait_name = columns[0].get_text(strip=True)
        description = columns[2].get_text(strip=True)

        # Splitting the description into individual effects
        effects = re.split(r'\)(?=\+)', description)

        for i, column in enumerate(columns[3:]):  # Skip first three columns
            level = int_to_roman(i + 1)  # Convert index to Roman numeral

            if column.get_text(strip=True) == "✓":
                if level not in ability_data:
                    ability_data[level] = {}
                if trait_name not in ability_data[level]:
                    ability_data[level][trait_name] = {}

                for eff in effects:
                    if eff:
                        # Extracting the effect value and name
                        match = re.search(r'(\+\d+%|\-\d+%) (.+)', eff)
                        if match:
                            effect_value, effect_name = match.groups()
                            effect_name = effect_name.strip()
                            if not effect_name.endswith(')'):
                                effect_name += ')'
                            ability_data[level][trait_name][effect_name] = effect_value

    return ability_data


def update_json_file(json_file, ability_data):
    with open(json_file, 'r+') as file:
        full_data = json.load(file)
        abilities = full_data["ability_traits"]["abilities"]

        # Check if the ability already exists
        for i, ability in enumerate(abilities):
            if ability["name"] == ability_data["name"]:
                abilities[i] = ability_data
                break
        else:
            abilities.append(ability_data)

        file.seek(0)  # Reset file position to the beginning
        json.dump(full_data, file, indent=4)
        file.truncate()  # Remove any remaining old data


@progress_bar_decorator
def main():
    file_path = "static/source.html"
    html = read_html_from_file(file_path)
    if html:
        ability_name = "Hailstorm"  # Hardcoded for now
        json_data = html_to_json(html, ability_name)
        if json_data:
            update_json_file("static/data/h_o_t_traits.json", json_data)
        else:
            print("Ability not found in the HTML.")
    else:
        print("Failed to fetch the webpage.")


if __name__ == "__main__":
    main()
