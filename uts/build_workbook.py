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

ws = wb.active; ws.title = "Sumber"
rows = [["Statistical Analysis II - UTS 2026/2027 - Workbook"], ["Student ID (NPM)", "120510253003 (last digit 3 -> 4th country)"], ["Assigned country", "Viet Nam (VNM); comparators Philippines (PHL), India (IND)"],
        ["Extraction date", "2026-10-12"], [],
        ["Source", "Exact URL / API call", "Indicator code", "Unit", "Period used"],
        ["World Bank WDI (via API)", "https://api.worldbank.org/v2/country/VNM;PHL;IND/indicator/FP.CPI.TOTL.ZG?format=json&per_page=20000&date=1960:2025", "FP.CPI.TOTL.ZG", "% y/y", "1996-2025 (VNM)"],
        ["World Bank WDI", "same pattern, indicator NY.GDP.MKTP.KD.ZG", "NY.GDP.MKTP.KD.ZG", "% y/y", "2000-2024 (Q4), 1996-2025 (Q5)"],
        ["World Bank WDI", "same pattern, indicator NE.GDI.TOTL.ZS", "NE.GDI.TOTL.ZS", "% of GDP", "1996-2025"],
        ["World Bank WDI", "same pattern, indicator NE.EXP.GNFS.CD", "NE.EXP.GNFS.CD", "current US$ (shown in US$ bn)", "1986-2025"],
        ["World Bank WDI", "same pattern, indicators NE.EXP.GNFS.ZS, EG.USE.ELEC.KH.PC (context, Q8)", "NE.EXP.GNFS.ZS; EG.USE.ELEC.KH.PC", "% GDP; kWh/capita", "to 2025 / 2024"],
        ["ILOSTAT SDMX", "https://sdmx.ilo.org/rest/data/ILO,DF_UNE_TUNE_SEX_AGE_NB/VNM+PHL+IND....?format=csv&startPeriod=2015", "UNE_TUNE_NB (age 15+)", "thousand persons (UNIT_MULT=3)", "2024"],
        ["Zenodo (Q7)", "https://zenodo.org/records/22057938 (CC-BY 4.0, file DATAUPDATE.csv) and https://zenodo.org/records/20439760", "SCR1-SCR6; OR1-OR5", "Likert", "2025-26"],
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
q1 = pd.read_csv(TAB / "Q1_lilliefors.csv"); ws = wb.create_sheet("Q1_calc")
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
chi_sheet("Q2_calc", ["Viet Nam", "Philippines"], ["Unemployed", "Employed"], R["Q2"]["observed"], "ILO weighted survey estimates, 2024, age 15+. Naive chi-square on these counts overstates significance (see report). Sensitivity with illustrative n_eff in Results sheet.")
chi_sheet("Q3_calc", ["Viet Nam", "Philippines"], ["Agriculture", "Industry", "Services"], R["Q3"]["observed"], "Viet Nam: 3,845,332 workers 'not classified' (ECO_SECTOR_X) excluded; 2x4 robustness in Results sheet.")
# Q4-Q6 data
sheet("Q4_panel", pd.read_csv(TAB / "Q4_panel.csv")); sheet("Q5_data", pd.read_csv(TAB / "Q5_data.csv")); sheet("Q6_series", pd.read_csv(TAB / "Q6_series.csv")); sheet("Q6_holdout", pd.read_csv(TAB / "Q6_holdout.csv"))
xB = pd.read_csv(TAB / "Q7_SCR_items.csv", index_col=0); n7 = len(xB)
ws = wb.create_sheet("Q7_SCR_alpha")
ws.append(["resp"] + list(xB.columns) + ["Total", "odd (1,3,5)", "even (2,4,6)"] + [f"Total-{c}" for c in xB.columns])
for i, (idx, r) in enumerate(xB.iterrows(), start=2):
    ws.append([int(idx) + 1] + [int(v) for v in r] + [f"=SUM(B{i}:G{i})", f"=B{i}+D{i}+F{i}", f"=C{i}+E{i}+G{i}"] + [f"=H{i}-{get_column_letter(2+j)}{i}" for j in range(6)])
L = n7 + 1; r0 = L + 2
ws.cell(r0, 1, "Variance (n-1)")
for j in range(6): ws.cell(r0, 2 + j, f"=VAR({get_column_letter(2+j)}2:{get_column_letter(2+j)}{L})")
ws.cell(r0, 8, f"=VAR(H2:H{L})")
ws.cell(r0 + 1, 1, "Corrected item-total r")
for j in range(6): ws.cell(r0 + 1, 2 + j, f"=CORREL({get_column_letter(2+j)}2:{get_column_letter(2+j)}{L},{get_column_letter(11+j)}2:{get_column_letter(11+j)}{L})")
ws.cell(r0 + 2, 1, "Cronbach alpha"); ws.cell(r0 + 2, 2, f"=6/5*(1-SUM(B{r0}:G{r0})/H{r0})")
ws.cell(r0 + 3, 1, "Odd-even r"); ws.cell(r0 + 3, 2, f"=CORREL(I2:I{L},J2:J{L})")
ws.cell(r0 + 4, 1, "Spearman-Brown"); ws.cell(r0 + 4, 2, f"=2*B{r0+3}/(1+B{r0+3})")
ws.cell(r0 + 6, 1, "Source: Zenodo 10.5281/zenodo.22057938, DATAUPDATE.csv, columns SCR1-SCR6 (real respondent data, n=248). No simulated data.")
for c in ws[1]: c.font = bold; c.fill = fill
sheet("Raw_Zenodo_B_all18", pd.read_csv(RAW / "zenodo_22057938_DATAUPDATE.csv", sep=";"), index=False)
sheet("Q7_OR_items_dsA", pd.read_csv(TAB / "Q7_OR_items.csv"), index=False)
ws = wb.create_sheet("Q7_protocol"); [ws.append([x]) for x in ["Six designed items and protocol: see report Section 7. Reliability computed on public Zenodo data (dataset B primary, dataset A comparison). q7_reliability.py reproduces the statistics from any CSV with columns item1..item6."]]
ws.column_dimensions["A"].width = 160
# results dump
ws = wb.create_sheet("Results"); ws.append(["key", "value"])
def flat(d, p=""):
    for k, v in d.items():
        if isinstance(v, dict): flat(v, p + k + ".")
        else: ws.append([p + k, json.dumps(v) if isinstance(v, (list, dict)) else v])
flat(R); ws.column_dimensions["A"].width = 50; ws.column_dimensions["B"].width = 80

# ===================== front sheets (layout of the original draft workbook, content = this analysis) =====================
import re
memo_txt = (H / "memo.txt").read_text()
q1, q2, q3, q4, q5, q6, q7 = (R[k] for k in ("Q1", "Q2", "Q3", "Q4", "Q5", "Q6", "Q7"))
def put(ws, rows, widths=None, wrap=True):
    for r in rows: ws.append(r)
    for row in ws.iter_rows():
        for c in row: c.alignment = Alignment(wrap_text=wrap, vertical="top")
    for i, w_ in enumerate(widths or [], start=1): ws.column_dimensions[get_column_letter(i)].width = w_
def head(ws, row=1):
    for c in ws[row]: c.font = bold; c.fill = fill
    ws["A1"].font = Font(bold=True, size=13)

ws = wb.create_sheet("Petunjuk")
put(ws, [["UTS Statistical Analysis II - Basis analisis & catatan data (NPM 120510253003)"], [],
 ["Bagian", "Keterangan"],
 ["Bahasa", "Label sheet memakai bahasa Indonesia; isi analisis dan laporan PDF dalam bahasa Inggris sesuai instruksi soal."],
 ["Negara", "NPM berakhiran 3 -> Viet Nam (negara ke-4). Pembanding: Philippines, India."],
 ["Indikator", "Q1: CPI inflation (FP.CPI.TOTL.ZG) 1996-2025; Q2-Q3: ILOSTAT 2024 (pengangguran dan pekerja per sektor); Q4: GDP growth (NY.GDP.MKTP.KD.ZG) 2000-2024; Q5: GDP growth ~ investasi (NE.GDI.TOTL.ZS) + inflasi; Q6: ekspor barang & jasa (NE.EXP.GNFS.CD); Q7: data survei publik Zenodo."],
 ["Tanggal ekstraksi", "12 Oktober 2026 (World Bank WDI, update database 2026-10-08)."],
 ["Presisi data", "Seluruh data diunduh lewat API resmi dengan presisi penuh dan disimpan apa adanya di sheet Raw_*. Tidak ada angka yang diketik manual / dibulatkan 1 desimal."],
 ["Q2/Q3", "Memakai hitungan ILOSTAT (status kerja dan sektor), bukan komposisi penduduk dari WDI. Angka ILO adalah estimasi survei berbobot (ribuan orang), sehingga p-value chi-square tidak dapat dibaca sebagai bukti inferensial biasa (lihat catatan di tiap sheet)."],
 ["Q7", "Memakai dataset survei publik asli (Zenodo 10.5281/zenodo.22057938, n=248) - bukan protokol saja; tidak ada data simulasi."],
 ["Rumus hidup", "Sheet Q1_calc, Q2_calc, Q3_calc, Q4 ANOVA dan Q7_SCR_alpha berisi rumus Excel yang dapat dicek ulang."],
 ["AI disclosure", "AI digunakan untuk menulis skrip, menjalankan analisis, dan menyusun draft. Verifikasi akhir (unduh ulang data, cek sampel nilai, baca sumber berita primer) tetap harus dilakukan mahasiswa; lihat lampiran laporan PDF."]], [24, 120]); head(ws, 3); ws["A1"].font = Font(bold=True, size=13)

ws = wb.create_sheet("GDP Growth")
gd = pd.read_csv(TAB / "Q4_panel.csv")
put(ws, [["GDP growth (annual %) - World Bank WDI API, presisi penuh (diunduh 2026-10-12)"], ["Year", "Viet Nam (VNM)", "Philippines (PHL)", "India (IND)", "Indicator", "Source API call"]], [10, 18, 18, 14, 22, 100], wrap=False)
for r in gd.itertuples(index=False): ws.append([int(r[0]), r[1], r[2], r[3], "NY.GDP.MKTP.KD.ZG", "https://api.worldbank.org/v2/country/VNM;PHL;IND/indicator/NY.GDP.MKTP.KD.ZG?format=json&per_page=20000&date=1960:2025"])
for c in ws[2]: c.font = bold; c.fill = fill
ws["A1"].font = Font(bold=True, size=13)

ws = wb.create_sheet("Q1 Normalitas")
put(ws, [["Q1 - Lilliefors normality test: Viet Nam CPI inflation 1996-2025 (n = 30)"], ["Ringkasan", "Hasil"],
 ["N observasi", "=Q1_calc!K4"], ["Rata-rata (%)", "=Q1_calc!K2"], ["Simpangan baku sampel", "=Q1_calc!K3"], ["Statistik D Lilliefors", "=Q1_calc!K5"],
 ["Nilai kritis 5% (n=30)", "=Q1_calc!K6"], ["p-value (statsmodels, tabel Lilliefors)", q1["p_lilliefors"]], ["Keputusan", "=Q1_calc!K7"], [],
 ["Cek tambahan", f"Shapiro-Wilk W = {q1['shapiro_W']:.3f}, p = {q1['shapiro_p']:.5f}; Jarque-Bera p < 0.001; Lilliefors pada log(1+inflasi): D = {q1['log_D']:.3f}, p = {q1['log_p']:.4f}; autokorelasi lag-1 = {q1['lag1_autocorr']:.2f}."],
 ["Interpretasi", "H0 normalitas ditolak. Penyebab: ekor kanan berat (lonjakan 2008 = 23.1%, 2011 = 18.7%). Karena inflasi berautokorelasi positif, observasi tidak independen sehingga p-value hanya indikatif. Implikasi: gunakan kuantil/bootstrap, bukan mean +/- 1.96 s; waspadai risiko ekor inflasi. Data terurut, F empiris dan F teoretis lengkap ada di sheet Q1_calc."]], [38, 110]); head(ws, 2); ws["A1"].font = Font(bold=True, size=13)

ws = wb.create_sheet("Q2 Proporsi")
o = q2["observed"]
put(ws, [["Q2 - Chi-square 2x2: pengangguran vs bekerja, Viet Nam vs Philippines, 2024 (ILOSTAT, usia 15+)"], ["Negara", "Menganggur (orang)", "Bekerja (orang)", "Total", "Tingkat pengangguran"],
 ["Viet Nam", o[0][0], o[0][1], "=B3+C3", "=B3/D3"], ["Philippines", o[1][0], o[1][1], "=B4+C4", "=B4/D4"], [],
 ["Chi-square Pearson", q2["chi2"]], ["df", 1], ["p-value", f"< 0.001 (underflow ke 0)"], ["Cramer's V", q2["cramers_v"]], ["Chi-square Yates", q2["chi2_yates"]], [],
 ["Sensitivitas (n efektif ASUMSI, bukan data)", "n efektif per negara", "chi-square", "p-value"]] + [["", s_["n_eff_per_country"], s_["chi2"], s_["p"]] for s_ in q2["sensitivity"]] + [[],
 ["Catatan", "Hitungan ILO adalah estimasi survei berbobot (ribuan orang x 1000), bukan jumlah responden; N = 105 juta membuat p-value selalu ~0. Arah selisih (VN lebih rendah ~0.83 poin persen) stabil, tetapi signifikansi bergantung pada n efektif yang tidak diketahui; uji yang tepat adalah Rao-Scott pada data mikro. Perhitungan dengan rumus hidup: sheet Q2_calc."]], [38, 24, 18, 14, 22]); head(ws, 2); ws["A1"].font = Font(bold=True, size=13)

ws = wb.create_sheet("Q3 Struktur Sektor")
o3 = q3["observed"]
put(ws, [["Q3 - Chi-square independensi 2x3: negara x sektor pekerjaan, 2024 (ILOSTAT)"], ["Negara", "Pertanian", "Industri", "Jasa", "Total"],
 ["Viet Nam", *o3[0], "=SUM(B3:D3)"], ["Philippines", *o3[1], "=SUM(B4:D4)"], [],
 ["Chi-square Pearson", q3["chi2"]], ["df", 2], ["p-value", "< 0.001"], ["Cramer's V", q3["cramers_v"]], ["Min. expected count", q3["min_expected"]],
 ["Robustness 2x4 (+ tidak terklasifikasi VN = 3,845,332)", f"chi-square = {q3['robust_2x4']['chi2']:.0f}, df = 3, V = {q3['robust_2x4']['cramers_v']:.3f}"], [],
 ["Catatan", "Pekerja VN 'tidak terklasifikasi' (6.96%) dikeluarkan dari uji utama. Tidak ada sel kecil (E min > 11 juta). p-value ~0 karena data berbobot nasional; ukuran efek V = 0.22 yang informatif. Keputusan: sourcing manufaktur di Viet Nam (industri 33.3% vs 18.2%), staffing layanan/BPO di Philippines (jasa 61.1%). Rumus hidup: sheet Q3_calc."]], [44, 22, 20, 20, 18]); head(ws, 2); ws["A1"].font = Font(bold=True, size=13)

ws = wb.create_sheet("Q4 ANOVA")
put(ws, [["Q4 - One-way ANOVA GDP growth 2000-2024 (rumus hidup dari sheet GDP Growth)"], ["Negara", "N", "Rata-rata (%)", "SD sampel", "SS dalam kelompok"],
 ["Viet Nam", "=COUNT('GDP Growth'!B3:B27)", "=AVERAGE('GDP Growth'!B3:B27)", "=STDEV('GDP Growth'!B3:B27)", "=DEVSQ('GDP Growth'!B3:B27)"],
 ["Philippines", "=COUNT('GDP Growth'!C3:C27)", "=AVERAGE('GDP Growth'!C3:C27)", "=STDEV('GDP Growth'!C3:C27)", "=DEVSQ('GDP Growth'!C3:C27)"],
 ["India", "=COUNT('GDP Growth'!D3:D27)", "=AVERAGE('GDP Growth'!D3:D27)", "=STDEV('GDP Growth'!D3:D27)", "=DEVSQ('GDP Growth'!D3:D27)"], [],
 ["Rata-rata keseluruhan", "=AVERAGE('GDP Growth'!B3:D27)"], ["SS antar kelompok", "=B3*(C3-B7)^2+B4*(C4-B7)^2+B5*(C5-B7)^2"], ["SS dalam kelompok", "=SUM(E3:E5)"],
 ["F ANOVA", "=(B8/2)/(B9/72)"], ["p-value ANOVA", "=FDIST(B10,2,72)"], ["eta kuadrat", "=B8/(B8+B9)"], [],
 ["Uji lain (dari skrip Python, hasil sama dalam laporan)", "Statistik", "p-value"],
 ["Welch ANOVA", q4["welch"]["F"], q4["welch"]["p"]], ["Kruskal-Wallis (UTAMA: normalitas ditolak)", q4["kruskal"]["H"], q4["kruskal"]["p"]], ["Friedman (tahun sebagai blok)", q4["friedman"]["chi2"], q4["friedman"]["p"]],
 ["Levene (median)", q4["levene"][0], q4["levene"][1]], ["Bartlett", q4["bartlett"][0], q4["bartlett"][1]],
 ["Post-hoc Dunn-Holm: PHL-IND", q4["dunn"][2]["z"], q4["dunn"][2]["p_holm"]], ["Post-hoc Dunn-Holm: VNM-PHL", q4["dunn"][0]["z"], q4["dunn"][0]["p_holm"]], ["Post-hoc Dunn-Holm: VNM-IND", q4["dunn"][1]["z"], q4["dunn"][1]["p_holm"]], [],
 ["Kesimpulan", "Normalitas ditolak di ketiga kelompok; ANOVA/Welch tidak signifikan (p = 0.162/0.194), tetapi Kruskal-Wallis signifikan (p = 0.017) dan Friedman p = 0.006: distribusi pertumbuhan berbeda, terutama Philippines vs India. Tanpa 2020-2021, ANOVA signifikan (p = 0.020): hasil sensitif terhadap COVID. Antar-tahun dan antar-negara tidak independen (guncangan global sama)."]], [48, 22, 16, 14, 22]); head(ws, 2); ws["A1"].font = Font(bold=True, size=13)

ws = wb.create_sheet("Q5 Regresi")
m1, m2, m3 = q5["m1"], q5["m2"], q5["m3"]; cf = m1["coefs"]
put(ws, [["Q5 - Regresi GDP growth Viet Nam ~ investasi + inflasi (1996-2025, n = 30); data: sheet Q5_data"], ["Istilah", "Koefisien", "Std. error", "t", "p-value"],
 ["Intersep", cf["const"]["b"], cf["const"]["se"], cf["const"]["t"], cf["const"]["p"]], ["Investasi (% PDB) X1", cf["Investment_pctGDP"]["b"], cf["Investment_pctGDP"]["se"], cf["Investment_pctGDP"]["t"], cf["Investment_pctGDP"]["p"]], ["Inflasi (%) X2", cf["Inflation"]["b"], cf["Inflation"]["se"], cf["Inflation"]["t"], cf["Inflation"]["p"]], [],
 ["R2", m1["r2"]], ["Adjusted R2", m1["adj_r2"]], ["F model (df 2, 27)", m1["F"]], ["p F model", m1["F_p"]], ["VIF X1 / X2", f"{q5['vif']['Investment_pctGDP']:.2f} / {q5['vif']['Inflation']:.2f}"],
 ["Breusch-Pagan p", q5["bp"][1]], ["Durbin-Watson", q5["dw"]], ["Breusch-Godfrey(1) p", q5["bg"][1]], ["Shapiro-Wilk residual p", q5["shapiro_resid"][1]], [],
 ["Model kuadratik", "R2", "Adj. R2", "AIC", "p suku kuadrat (F nested)"], ["Linear", m1["r2"], m1["adj_r2"], m1["aic"], "-"], ["+ Inflasi^2", m2["r2"], m2["adj_r2"], m2["aic"], m2["nested_p"]], ["+ Investasi^2", m3["r2"], m3["adj_r2"], m3["aic"], m3["nested_p"]], [],
 ["Interpretasi", "Tidak ada prediktor signifikan, F-test tidak menolak H0, R2 ~ 0.003; asumsi terpenuhi sehingga masalahnya adalah ketiadaan sinyal, bukan pelanggaran asumsi. Suku kuadrat tidak signifikan. Asosiasi bukan kausalitas. Rekomendasi: jangan menentukan waktu investasi/harga dari prediktor makro ini; investasi bertahap + klausul indeksasi harga."]], [34, 18, 16, 14, 24]); head(ws, 2); ws["A1"].font = Font(bold=True, size=13)

ws = wb.create_sheet("Q6 Forecast")
hd = pd.read_csv(TAB / "Q6_holdout.csv"); ser = pd.read_csv(TAB / "Q6_series.csv")
put(ws, [["Q6 - Ekspor barang & jasa Viet Nam (US$ miliar, NE.EXP.GNFS.CD), 1986-2025; holdout 2021-2025"], ["Tahun", "Ekspor (US$ bn)", "t", "MA(3) rata-rata 3 tahun sebelumnya"]], [34, 18, 12, 30], wrap=False)
for i, r in enumerate(ser.itertuples(index=False), start=3):
    ws.append([int(r[0]), r[1], i - 2, f"=AVERAGE(B{i-3}:B{i-1})" if i >= 6 else None])
base = ws.max_row + 2
ws.cell(base, 1, "Evaluasi holdout 2021-2025 (latih 1986-2020)").font = bold
for j, h in enumerate(["Model", "MAE (US$ bn)", "MAPE (%)", "RMSE"]): ws.cell(base + 1, 1 + j, h).font = bold
for k_, v_ in q6["eval"].items(): ws.append([k_, v_["MAE"], v_["MAPE"], v_["RMSE"]])
ws.append([]); ws.append(["Forecast (US$ bn)", q6["fc_years"][0], q6["fc_years"][1], "Interval 95%"])
ws.append(["Tren linear seluruh data (TIDAK VALID: di bawah aktual 2025)", q6["fc_linear"][0], q6["fc_linear"][1], f"{q6['fc_linear_pi'][0][0]:.0f}-{q6['fc_linear_pi'][0][1]:.0f}"])
ws.append(["MA(3)", q6["fc_ma3"], q6["fc_ma3"], "-"]); ws.append(["Tren linear 10 tahun terakhir (basis rekomendasi)", q6["fc_recent10"][0], q6["fc_recent10"][1], f"{q6['fc_recent10_pi'][0][0]:.0f}-{q6['fc_recent10_pi'][0][1]:.0f}; {q6['fc_recent10_pi'][1][0]:.0f}-{q6['fc_recent10_pi'][1][1]:.0f}"])
ws.append(["Damped Holt", q6["fc_holt"][0], q6["fc_holt"][1], "-"]); ws.append([])
ws.append(["Catatan", "Data tahunan tidak dapat mengidentifikasi musiman dalam tahun. MA(3) mengungguli tren linear pada holdout (MAPE 30.3% vs 44.1%), namun keduanya bias ke bawah; tren 10 tahun terakhir terbaik (MAPE 10.9%) tetapi dipilih dari 5 titik holdout. Respons: rencanakan ekspor ~US$ 500-560 bn 2026-27, kapasitas bertahap, pemicu tinjau ulang di bawah ~US$ 447 bn."])
for c in ws[2]: c.font = bold; c.fill = fill
ws["A1"].font = Font(bold=True, size=13)

ws = wb.create_sheet("Q7 Survei")
B7 = q7["B"]
put(ws, [["Q7 - Validitas & reliabilitas: enam item rancangan + analisis pada data publik asli"], ["Item", "Pernyataan (Likert 1-5)"],
 ["SR1", "My firm could keep production running if energy prices stayed sharply higher for the next six months."], ["SR2", "We have qualified alternative suppliers for our most critical inputs."], ["SR3", "We could pass at least part of higher energy or transport costs to customers without losing major accounts."],
 ["SR4", "Our logistics network can be rerouted quickly if a key supplier or shipping route is disrupted."], ["SR5", "Our inventory buffers of critical inputs would cover at least one month of supply disruption."], ["SR6", "Management regularly monitors energy-price and supplier-risk indicators and acts on them."], [],
 ["Data", "Zenodo 10.5281/zenodo.22057938 (CC-BY 4.0), file DATAUPDATE.csv, SCR1-SCR6, n = 248, Likert 1-5. Teks item asli tidak tersedia di deposit; Dataset A (Zenodo 20439760, OR1-OR5) sebagai pembanding - alpha negatif, tidak dipakai."],
 ["Cronbach alpha", "=Q7_SCR_alpha!B" + str(r0 + 2)], ["Odd-even r (Pearson)", "=Q7_SCR_alpha!B" + str(r0 + 3)], ["Spearman-Brown", "=Q7_SCR_alpha!B" + str(r0 + 4)],
 ["Corrected item-total r (SCR1..SCR6)", ", ".join(f"{v:.3f}" for v in B7["cit"].values())], ["CI 95% alpha (bootstrap)", f"{B7['alpha_ci'][0]:.3f} - {B7['alpha_ci'][1]:.3f}"],
 ["Interpretasi", "Konsistensi internal sangat tinggi (alpha 0.94; semua item-total r >= 0.79). Mean inter-item r = 0.72 mengindikasikan redundansi. Reliabilitas bukan validitas; responden Indonesia, bukan Viet Nam; item tidak identik dengan rancangan."]], [38, 130]); head(ws, 2); ws["A1"].font = Font(bold=True, size=13)

ws = wb.create_sheet("Q8 Memo"); ws.append(["Q8 - Executive decision memo (365 kata)"]); ws.append([memo_txt]); ws.column_dimensions["A"].width = 150
ws["A2"].alignment = Alignment(wrap_text=True, vertical="top"); ws["A1"].font = Font(bold=True, size=13)

order = ["Petunjuk", "GDP Growth", "Q1 Normalitas", "Q2 Proporsi", "Q3 Struktur Sektor", "Q4 ANOVA", "Q5 Regresi", "Q6 Forecast", "Q7 Survei", "Q8 Memo", "Sumber"]
rest = [s_ for s_ in wb.sheetnames if s_ not in order]
wb._sheets = [wb[n_] for n_ in order + rest]

wb.save(OUT); print("saved", OUT)
