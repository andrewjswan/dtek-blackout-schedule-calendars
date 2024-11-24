import sys
import requests
import json

from datetime import datetime


def extract_today(json_data, target_tag):
    if isinstance(json_data, dict):
        for key, value in json_data.items():
            if key == target_tag:
                return value
            result = extract_today(value, target_tag)
            if result is not None:
                return result
    elif isinstance(json_data, list):
        for item in json_data:
            result = extract_today(item, target_tag)
            if result is not None:
                return result
    return None


def load_data(yasno_url):
    response = requests.get(yasno_url)
    if response.status_code == 200:
        data = response.json()
        data = extract_today(data, "dailySchedule")
        return data
    else:
        return None


if __name__ == "__main__":
    yasno_url = "https://api.yasno.com.ua/api/v1/pages/home/schedule-turn-off-electricity"
    data = load_data(yasno_url)
    if data:
        for city in data:
            if "today" in data[city] and "title" in data[city]["today"]:
                day, time = data[city]["today"]["title"].split(" на ", 1)
                if day:
                    name, date = day.split(" ", 1)
                    if date and datetime.strptime(date, "%d.%m.%Y").date() == datetime.today().date():
                        with open(city + ".json", "w") as file:
                            file.write(json.dumps(data[city]))
