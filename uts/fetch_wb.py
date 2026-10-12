"""Download World Bank WDI series (raw JSON saved verbatim) for VNM, PHL, IND."""
import requests, json, datetime, pathlib
RAW = pathlib.Path(__file__).parent / "data" / "raw"
INDICATORS = {
    "FP.CPI.TOTL.ZG": "Inflation, consumer prices (annual %)",
    "NY.GDP.MKTP.KD.ZG": "GDP growth (annual %)",
    "NE.GDI.TOTL.ZS": "Gross capital formation (% of GDP)",
    "NE.EXP.GNFS.CD": "Exports of goods and services (current US$)",
    "NE.EXP.GNFS.ZS": "Exports of goods and services (% of GDP)",
    "EG.USE.PCAP.KG.OE": "Energy use (kg of oil equivalent per capita)",
    "EG.USE.ELEC.KH.PC": "Electric power consumption (kWh per capita)",
    "NY.GDP.PCAP.KD": "GDP per capita (constant 2015 US$)",
}
for code in INDICATORS:
    url = f"https://api.worldbank.org/v2/country/VNM;PHL;IND/indicator/{code}?format=json&per_page=20000&date=1960:2025"
    r = requests.get(url, timeout=60); r.raise_for_status()
    j = r.json()
    (RAW / f"WB_{code}.json").write_text(json.dumps({"url": url, "extracted": datetime.date.today().isoformat(), "response": j}))
    print(code, j[0].get("lastupdated"), len(j[1]))
