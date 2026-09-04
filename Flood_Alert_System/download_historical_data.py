import requests
import pandas as pd
from datetime import datetime

districts = {
    "Coimbatore": (11.0168, 76.9558),
    "Chennai": (13.0827, 80.2707),
    "Madurai": (9.9252, 78.1198),
    "Salem": (11.6643, 78.1460),
    "Erode": (11.3410, 77.7172)
}

START_DATE = "2020-01-01"
END_DATE = datetime.today().strftime("%Y-%m-%d")

all_data = []

for district, (lat, lon) in districts.items():

    print("Downloading", district)

    url = (
        f"https://archive-api.open-meteo.com/v1/archive?"
        f"latitude={lat}"
        f"&longitude={lon}"
        f"&start_date={START_DATE}"
        f"&end_date={END_DATE}"
        f"&daily=precipitation_sum"
        f"&timezone=Asia%2FKolkata"
    )

    r = requests.get(url)

    if r.status_code == 200:

        data = r.json()

        dates = data["daily"]["time"]
        rainfall = data["daily"]["precipitation_sum"]

        for d, rain in zip(dates, rainfall):

            all_data.append({
                "District": district,
                "Date": d,
                "Rainfall": rain
            })

df = pd.DataFrame(all_data)

df.to_csv("data/historical_data.csv", index=False)

print("Historical data saved successfully.")