# UTS Statistical Analysis II - Viet Nam (NPM 120510253003)
Reproduce: `pip install scipy statsmodels pandas openpyxl matplotlib reportlab requests` then
`python3 fetch_wb.py && python3 analysis.py && python3 build_workbook.py && python3 build_report.py`.
ILOSTAT raw files in `data/raw/` come from the SDMX calls listed in `data/raw/ILO_SOURCES.txt`.
Outputs: `120510253003_NAMA_UTS.pdf`, `120510253003_NAMA_UTS.xlsx` (rename NAMA to your name). Q7 uses public Zenodo survey data (see report); `q7_reliability.py` reproduces the statistics for any item CSV.
