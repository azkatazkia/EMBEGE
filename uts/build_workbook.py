"""Build 120510253003_NAMA_UTS.xlsx: raw downloads, transformations (with live Excel formulas for Q1-Q3), results."""
import json, pathlib, datetime
import pandas as pd
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment
from openpyxl.utils import get_column_letter

H = pathlib.Path(__file__).parent; RAW = H / "data" / "raw"; TAB = H / "tables"
R = json.load(open(H / "results.json")); OUT = H / "120510253003_NAMA_UTS.xlsx"
wb = Workbook(); bold = Font(bold=True); fill = PatternFill("solid", fgColor="DDEBF7")

def sheet(name, df=None, index=True):
    ws = wb.create_sheet(name[:31])
    if df is not None:
        d = df.reset_index() if index else df
        ws.append(list(d.columns))
        for row in d.itertuples(index=False): ws.append([None if (isinstance(v, float) and v != v) else v for v in row])
        for c in ws[1]: c.font = bold; c.fill = fill
        for i in range(1, len(d.columns) + 1): ws.column_dimensions[get_column_letter(i)].width = 22
    return ws

ws = wb.active; ws.title = "README"
rows = [["Statistical Analysis II - UTS 2026/2027 - Workbook"], ["Student ID (NPM)", "120510253003 (last digit 3 -> 4th country)"], ["Assigned country", "Viet Nam (VNM); comparators Philippines (PHL), India (IND)"],
        ["Extraction date", "2026-10-12"], [],
        ["Source", "Exact URL / API call", "Indicator code", "Unit", "Period used"],
        ["World Bank WDI (via API)", "https://api.worldbank.org/v2/country/VNM;PHL;IND/indicator/FP.CPI.TOTL.ZG?format=json&per_page=20000&date=1960:2025", "FP.CPI.TOTL.ZG", "% y/y", "1996-2025 (VNM)"],
        ["World Bank WDI", "same pattern, indicator NY.GDP.MKTP.KD.ZG", "NY.GDP.MKTP.KD.ZG", "% y/y", "2000-2024 (Q4), 1996-2025 (Q5)"],
        ["World Bank WDI", "same pattern, indicator NE.GDI.TOTL.ZS", "NE.GDI.TOTL.ZS", "% of GDP", "1996-2025"],
        ["World Bank WDI", "same pattern, indicator NE.EXP.GNFS.CD", "NE.EXP.GNFS.CD", "current US$ (shown in US$ bn)", "1986-2025"],
        ["World Bank WDI", "same pattern, indicators NE.EXP.GNFS.ZS, EG.USE.ELEC.KH.PC (context, Q8)", "NE.EXP.GNFS.ZS; EG.USE.ELEC.KH.PC", "% GDP; kWh/capita", "to 2025 / 2024"],
        ["ILOSTAT SDMX", "https://sdmx.ilo.org/rest/data/ILO,DF_UNE_TUNE_SEX_AGE_NB/VNM+PHL+IND....?format=csv&startPeriod=2015", "UNE_TUNE_NB (age 15+)", "thousand persons (UNIT_MULT=3)", "2024"],
        ["ILOSTAT SDMX", "https://sdmx.ilo.org/rest/data/ILO,DF_EMP_TEMP_SEX_ECO_NB/VNM+PHL+IND....?format=csv&startPeriod=2015", "EMP_TEMP_NB by ECO_SECTOR_*", "thousand persons", "2024"],
        [], ["Sheets: Raw_* = downloaded data as received; Q1..Q6 = transformations/tests (Q1-Q3 contain live Excel formulas); Q7 = protocol (no data collected); Results = all statistics from analysis.py."],
        ["ILO figures are weighted labour-force-survey estimates (thousands), NOT raw respondent counts - see report Q2/Q3 caveat."]]
for r in rows: ws.append(r)
ws["A1"].font = Font(bold=True, size=14); ws.column_dimensions["A"].width = 28; ws.column_dimensions["B"].width = 110
for c in ws[6]: c.font = bold

# raw WB
for code in ["FP.CPI.TOTL.ZG", "NY.GDP.MKTP.KD.ZG", "NE.GDI.TOTL.ZS", "NE.EXP.GNFS.CD", "NE.EXP.GNFS.ZS", "EG.USE.ELEC.KH.PC"]:
    j = json.load(open(RAW / f"WB_{code}.json")); d = pd.DataFrame([(x["countryiso3code"], x["date"], x["value"]) for x in j["response"][1]], columns=["iso3", "year", code])
    sheet("Raw_WB_" + code.replace(".", "_")[-18:], d.sort_values(["iso3", "year"]), index=False)
# raw ILO (rows used)
une = pd.read_csv(RAW / "DF_UNE_TUNE_SEX_AGE_NB.csv"); emp = pd.read_csv(RAW / "DF_EMP_TEMP_SEX_ECO_NB.csv")
cols = ["REF_AREA", "SEX", "AGE", "TIME_PERIOD", "OBS_VALUE", "UNIT_MULT", "SOURCE"]
sheet("Raw_ILO_Unemployed", une[(une.TIME_PERIOD == "2024") & (une.FREQ == "A") & (une.AGE == "AGE_YTHADULT_YGE15")][cols], index=False)
sheet("Raw_ILO_EmpSector", emp[(emp.TIME_PERIOD == "2024") & (emp.FREQ == "A") & (emp.SEX == "SEX_T") & emp.ECO.str.startswith("ECO_SECTOR")][["REF_AREA", "SEX", "ECO", "TIME_PERIOD", "OBS_VALUE", "UNIT_MULT", "SOURCE"]], index=False)

# Q1 with formulas
q1 = pd.read_csv(TAB / "Q1_lilliefors.csv"); ws = wb.create_sheet("Q1")
ws.append(["rank i", "ordered x (VNM CPI %)", "year", "z=(x-mean)/s", "F_theoretical", "F_emp upper i/n", "D+ = i/n - F", "D- = F-(i-1)/n"])
n = len(q1)
for k, r in enumerate(q1.itertuples(), start=2):
    ws.append([r.rank_i, r.ordered_x, r.year_of_obs, f"=(B{k}-$K$2)/$K$3", f"=NORMSDIST(D{k})", f"=A{k}/$K$4", f"=F{k}-E{k}", f"=E{k}-(A{k}-1)/$K$4"])
ws["J2"], ws["K2"] = "mean", f"=AVERAGE(B2:B{n+1})"; ws["J3"], ws["K3"] = "sd (n-1)", f"=STDEV(B2:B{n+1})"; ws["J4"], ws["K4"] = "n", f"=COUNT(B2:B{n+1})"
ws["J5"], ws["K5"] = "D = max(D+,D-)", f"=MAX(G2:H{n+1})"; ws["J6"], ws["K6"] = "Lilliefors crit 5% (n=30)", 0.161; ws["J7"], ws["K7"] = "Reject H0?", '=IF(K5>K6,"REJECT normality","do not reject")'
ws["J9"], ws["K9"] = "Python p (statsmodels, table)", R["Q1"]["p_lilliefors"]
for c in ws[1]: c.font = bold; c.fill = fill
for i in range(1, 12): ws.column_dimensions[get_column_letter(i)].width = 24

# Q2 / Q3 with formulas
def chi_sheet(name, rowlab, collab, obs, note):
    ws = wb.create_sheet(name); r, c = len(obs), len(obs[0])
    ws.append(["OBSERVED (persons = thousands x 1000)"] + collab + ["Row total"])
    for i, row in enumerate(obs): ws.append([rowlab[i]] + row + [f"=SUM(B{i+2}:{get_column_letter(c+1)}{i+2})"])
    ws.append(["Col total"] + [f"=SUM({get_column_letter(j+2)}2:{get_column_letter(j+2)}{r+1})" for j in range(c + 1)])
    ws.append([]); ws.append(["EXPECTED = row total x col total / N"] + collab)
    base = r + 4
    for i in range(r): ws.append([rowlab[i]] + [f"=$" + get_column_letter(c + 2) + f"{i+2}*{get_column_letter(j+2)}${r+2}/${get_column_letter(c+2)}${r+2}" for j in range(c)])
    ws.append([]); ws.append(["(O-E)^2/E"] + collab); b2 = base + r + 2
    for i in range(r): ws.append([rowlab[i]] + [f"=({get_column_letter(j+2)}{i+2}-{get_column_letter(j+2)}{base+1+i})^2/{get_column_letter(j+2)}{base+1+i}" for j in range(c)])
    rng_c = f"B{b2+1}:{get_column_letter(c+1)}{b2+r}"
    ws.append([]); ws.append(["Chi-square", f"=SUM({rng_c})"]); ws.append(["df", (r - 1) * (c - 1)])
    ws.append(["p-value", f"=CHIDIST(B{ws.max_row-1},B{ws.max_row})"]); ws.append(["Cramer's V", f"=SQRT(B{ws.max_row-2}/(B{r+2+0}*0+{get_column_letter(c+2)}{r+2}*{min(r,c)-1}))"])
    ws.append([]); ws.append([note])
    ws.column_dimensions["A"].width = 40
    for i in range(2, 8): ws.column_dimensions[get_column_letter(i)].width = 20
    for row in (1, base): 
        for cc in ws[row]: cc.font = bold
chi_sheet("Q2", ["Viet Nam", "Philippines"], ["Unemployed", "Employed"], R["Q2"]["observed"], "ILO weighted survey estimates, 2024, age 15+. Naive chi-square on these counts overstates significance (see report). Sensitivity with illustrative n_eff in Results sheet.")
chi_sheet("Q3", ["Viet Nam", "Philippines"], ["Agriculture", "Industry", "Services"], R["Q3"]["observed"], "Viet Nam: 3,845,332 workers 'not classified' (ECO_SECTOR_X) excluded; 2x4 robustness in Results sheet.")
# Q4-Q6 data
sheet("Q4_panel", pd.read_csv(TAB / "Q4_panel.csv")); sheet("Q5_data", pd.read_csv(TAB / "Q5_data.csv")); sheet("Q6_series", pd.read_csv(TAB / "Q6_series.csv")); sheet("Q6_holdout", pd.read_csv(TAB / "Q6_holdout.csv"))
ws = wb.create_sheet("Q7"); [ws.append([x]) for x in ["Q7: no item-level survey data collected or downloaded. See report Section 7 for six items, validity argument and analysis protocol; script q7_reliability.py computes corrected item-total r, odd-even Spearman-Brown and Cronbach's alpha once >=30 real responses (CSV) exist.", "NO simulated data are included."]]
ws.column_dimensions["A"].width = 160
# results dump
ws = wb.create_sheet("Results"); ws.append(["key", "value"])
def flat(d, p=""):
    for k, v in d.items():
        if isinstance(v, dict): flat(v, p + k + ".")
        else: ws.append([p + k, json.dumps(v) if isinstance(v, (list, dict)) else v])
flat(R); ws.column_dimensions["A"].width = 50; ws.column_dimensions["B"].width = 80
wb.save(OUT); print("saved", OUT)
