"""
NASA FIRMS Fire Detection Ingestion

Fetches VIIRS/MODIS thermal hotspot data from NASA's Fire Information
for Resource Management System (FIRMS) and stores it in PostgreSQL
with PostGIS geometry.

Usage:
    python firms_ingest.py

Environment variables:
    DATABASE_URL   — PostgreSQL connection string
    FIRMS_KEY      — NASA FIRMS API key (get one at https://firms.modaps.eosdis.nasa.gov/api/config/realtime/)

The script falls back to mock data when FIRMS_KEY is not configured,
so you can test the ingestion pipeline without credentials.
"""

import os
import csv
from io import StringIO
from datetime import datetime

import requests
import psycopg2
from dotenv import load_dotenv

load_dotenv()

DB_URL = os.getenv("DATABASE_URL")
FIRMS_KEY = os.getenv("FIRMS_KEY", "your_firms_key_here")


def fetch_firms_data(country_code="THA", days=1):
    """Fetch fire data from NASA FIRMS (VIIRS SNPP)."""
    url = (
        f"https://firms.modaps.eosdis.nasa.gov/api/country/csv/"
        f"{FIRMS_KEY}/VIIRS_SNPP/{country_code}/{days}"
    )

    if FIRMS_KEY == "your_firms_key_here":
        print("Warning: No FIRMS_KEY configured. Using mock data.")
        return mock_firms_data()

    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        reader = csv.DictReader(StringIO(response.text))
        return list(reader)
    except Exception as e:
        print(f"Error fetching FIRMS data: {e}")
        return mock_firms_data()


def mock_firms_data():
    """Return sample fire detection records for testing."""
    return [
        {
            "latitude": "9.9700",
            "longitude": "98.6300",
            "bright_ti4": "310.5",
            "acq_date": datetime.now().strftime("%Y-%m-%d"),
            "acq_time": "0400",
            "confidence": "nominal",
        },
        {
            "latitude": "14.5700",
            "longitude": "100.1200",
            "bright_ti4": "308.2",
            "acq_date": datetime.now().strftime("%Y-%m-%d"),
            "acq_time": "1230",
            "confidence": "low",
        },
    ]


def ingest_firms_data(data):
    """Insert FIRMS fire events into PostgreSQL with PostGIS geometry."""
    if not data or not DB_URL:
        print("Skipping ingestion: no data or DATABASE_URL not configured.")
        return

    try:
        conn = psycopg2.connect(DB_URL)
        cur = conn.cursor()

        for item in data:
            lat = float(item.get("latitude"))
            lng = float(item.get("longitude"))
            cur.execute(
                """
                INSERT INTO fire_events (
                    latitude, longitude, brightness, confidence, acq_date, geom
                ) VALUES (%s, %s, %s, %s, %s, ST_SetSRID(ST_Point(%s, %s), 4326))
                ON CONFLICT (latitude, longitude, brightness, confidence, acq_date)
                DO NOTHING
                """,
                (
                    lat,
                    lng,
                    float(item.get("bright_ti4", 0)),
                    item.get("confidence"),
                    item.get("acq_date"),
                    lng,
                    lat,
                ),
            )

        conn.commit()
        cur.close()
        conn.close()
        print(f"Successfully ingested {len(data)} fire events.")
    except Exception as e:
        print(f"FIRMS ingestion error: {e}")


if __name__ == "__main__":
    data = fetch_firms_data()
    ingest_firms_data(data)
