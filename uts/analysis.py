"""
Statistical Analysis II - UTS 2026/2027 - reproducible analysis.
Assigned country: Viet Nam (NPM ...3003 -> d=3 -> 4th country). Comparators: Philippines, India.
Inputs : data/raw/*.json (World Bank WDI API), data/raw/DF_*.csv (ILOSTAT SDMX API), as downloaded.
Outputs: results.json, figures/*.png, tables/*.csv  (consumed by build_workbook.py / build_report.py)
Run    : python3 fetch_wb.py && python3 analysis.py
"""
import json, pathlib, warnings
import numpy as np, pandas as pd
from scipy import stats
import statsmodels.api as sm
from statsmodels.stats.diagnostic import lilliefors, het_breuschpagan, acorr_breusch_godfrey
from statsmodels.stats.outliers_influence import variance_inflation_factor
from statsmodels.stats.stattools import durbin_watson
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

warnings.filterwarnings("ignore")
HERE = pathlib.Path(__file__).parent
RAW, FIG, TAB = HERE / "data" / "raw", HERE / "figures", HERE / "tables"
FIG.mkdir(exist_ok=True); TAB.mkdir(exist_ok=True)
A = 0.05
R = {}  # results


def wb(code):
    j = json.load(open(RAW / f"WB_{code}.json"))["response"][1]
    d = pd.DataFrame([(x["countryiso3code"], int(x["date"]), x["value"]) for x in j],
                     columns=["iso3", "year", code])
    return d.pivot(index="year", columns="iso3", values=code).sort_index()


def save(df, name):
    df.to_csv(TAB / f"{name}.csv")


# ------------------------------------------------------------------ Q1
cpi = wb("FP.CPI.TOTL.ZG")["VNM"].dropna()
x = cpi.values; n = len(x)
xs = np.sort(x); mu, sd = x.mean(), x.std(ddof=1)
z = (xs - mu) / sd
Fz = stats.norm.cdf(z)
i = np.arange(1, n + 1)
d_plus, d_minus = i / n - Fz, Fz - (i - 1) / n
D = max(d_plus.max(), d_minus.max())
# Lilliefors (1967) 5% critical value; n=30 -> 0.161 (table); asymptotic 0.886/sqrt(n)
crit_tab = {25: 0.173, 30: 0.161}
crit = crit_tab.get(n, 0.886 / np.sqrt(n))
sm_D, sm_p = lilliefors(x, dist="norm", pvalmethod="table")
sw = stats.shapiro(x); jb = stats.jarque_bera(x)
lag1 = pd.Series(x).autocorr(1)
q1_tab = pd.DataFrame({"rank_i": i, "ordered_x": xs, "z": z, "F_theoretical": Fz,
                       "F_empirical_i/n": i / n, "D+": d_plus, "D-": d_minus,
                       "year_of_obs": [cpi.index[cpi.values == v][0] for v in xs]})
save(q1_tab, "Q1_lilliefors"); save(cpi.to_frame("CPI_inflation_pct"), "Q1_series")
# log(1+x) robustness (inflation is right-skewed and bounded below)
lx = np.log1p(x / 100); lD, lp = lilliefors(lx, dist="norm", pvalmethod="table")
R["Q1"] = dict(n=n, years=[int(cpi.index.min()), int(cpi.index.max())], mean=mu, sd=sd,
               skew=float(stats.skew(x, bias=False)), kurt_excess=float(stats.kurtosis(x, bias=False)),
               D=float(D), D_statsmodels=float(sm_D), p_lilliefors=float(sm_p), crit05=float(crit),
               reject=bool(D > crit), shapiro_W=float(sw[0]), shapiro_p=float(sw[1]),
               jb=float(jb[0]), jb_p=float(jb[1]), lag1_autocorr=float(lag1),
               log_D=float(lD), log_p=float(lp), min=float(x.min()), max=float(x.max()),
               argmax_year=int(cpi.idxmax()), median=float(np.median(x)))
fig, ax = plt.subplots(1, 3, figsize=(13, 3.8))
ax[0].step(xs, i / n, where="post", label="Empirical CDF"); g = np.linspace(xs.min() - 2, xs.max() + 2, 300)
ax[0].plot(g, stats.norm.cdf(g, mu, sd), "r--", label="Normal CDF (x̄, s)"); ax[0].legend(); ax[0].set_title(f"ECDF vs normal (D={D:.3f})")
sm.qqplot(x, line="s", ax=ax[1]); ax[1].set_title("Normal Q-Q")
ax[2].plot(cpi.index, x, marker="o"); ax[2].set_title("Viet Nam CPI inflation (% y/y)")
plt.tight_layout(); plt.savefig(FIG / "Q1.png", dpi=150); plt.close()

# ------------------------------------------------------------------ ILO helpers
une = pd.read_csv(RAW / "DF_UNE_TUNE_SEX_AGE_NB.csv"); emp = pd.read_csv(RAW / "DF_EMP_TEMP_SEX_ECO_NB.csv")
YEAR = "2024"
def ilo_val(df, area, extra):
    q = df[(df.REF_AREA == area) & (df.FREQ == "A") & (df.TIME_PERIOD == YEAR)]
    for k, v in extra.items(): q = q[q[k] == v]
    assert len(q) == 1, (area, extra, len(q))
    return float(q.OBS_VALUE.iloc[0]) * 1000  # UNIT_MULT=3 -> persons

# ------------------------------------------------------------------ Q2
def chi2_report(obs, rows, cols):
    obs = np.asarray(obs, float)
    chi, p, dof, exp = stats.chi2_contingency(obs, correction=False)
    chi_y, p_y, _, _ = stats.chi2_contingency(obs, correction=True) if obs.shape == (2, 2) else (np.nan, np.nan, 0, 0)
    n_ = obs.sum(); V = np.sqrt(chi / (n_ * (min(obs.shape) - 1)))
    resid = (obs - exp) / np.sqrt(exp)
    return dict(chi2=float(chi), p=float(p), dof=int(dof), expected=exp.tolist(), observed=obs.tolist(),
                cramers_v=float(V), min_expected=float(exp.min()), std_resid=resid.tolist(),
                chi2_yates=float(chi_y), p_yates=float(p_y), rows=rows, cols=cols, N=float(n_))

emp_t = {a: ilo_val(emp, a, dict(SEX="SEX_T", ECO="ECO_SECTOR_TOTAL")) for a in ("VNM", "PHL", "IND")}
une_t = {a: ilo_val(une, a, dict(SEX="SEX_T", AGE="AGE_YTHADULT_YGE15")) for a in ("VNM", "PHL", "IND")}
obs2 = [[une_t["VNM"], emp_t["VNM"]], [une_t["PHL"], emp_t["PHL"]]]
q2 = chi2_report(obs2, ["Viet Nam", "Philippines"], ["Unemployed", "Employed"])
rate = {a: une_t[a] / (une_t[a] + emp_t[a]) for a in une_t}
# two-proportion z / 95% CI of difference, and sensitivity to effective sample size (survey weighting)
p1, p2 = rate["VNM"], rate["PHL"]; n1 = une_t["VNM"] + emp_t["VNM"]; n2 = une_t["PHL"] + emp_t["PHL"]
se = np.sqrt(p1 * (1 - p1) / n1 + p2 * (1 - p2) / n2)
sens = []
for neff in (2_000, 10_000, 50_000, 200_000):  # ILLUSTRATIVE effective sample sizes per country, NOT data
    o = np.array([[p1 * neff, (1 - p1) * neff], [p2 * neff, (1 - p2) * neff]])
    c, p, *_ = stats.chi2_contingency(o, correction=False); sens.append(dict(n_eff_per_country=neff, chi2=float(c), p=float(p)))
q2.update(rates=rate, diff=float(p1 - p2), ci_naive=[float(p1 - p2 - 1.96 * se), float(p1 - p2 + 1.96 * se)],
          sensitivity=sens, year=YEAR, employed=emp_t, unemployed=une_t)
R["Q2"] = q2

# ------------------------------------------------------------------ Q3
secs = {"Agriculture": "ECO_SECTOR_AGR", "Industry": "ECO_SECTOR_IND", "Services": "ECO_SECTOR_SER"}
obs3 = [[ilo_val(emp, a, dict(SEX="SEX_T", ECO=c)) for c in secs.values()] for a in ("VNM", "PHL")]
q3 = chi2_report(obs3, ["Viet Nam", "Philippines"], list(secs))
q3["shares"] = (np.array(obs3) / np.array(obs3).sum(1, keepdims=True)).tolist(); q3["year"] = YEAR
tot = {a: ilo_val(emp, a, dict(SEX="SEX_T", ECO="ECO_SECTOR_TOTAL")) for a in ("VNM", "PHL")}
q3["sector_sum_check"] = {a: float(sum(ilo_val(emp, a, dict(SEX="SEX_T", ECO=c)) for c in secs.values()) / tot[a]) for a in tot}
# GOF alternative: Viet Nam vs Philippines shares as the benchmark (used in report as a supplement)
bench = np.array(obs3[1]) / np.sum(obs3[1]); g = stats.chisquare(obs3[0], bench * np.sum(obs3[0]))
q3["gof_vs_philippines_shares"] = dict(chi2=float(g[0]), p=float(g[1]))
unc = {"VNM": ilo_val(emp, "VNM", dict(SEX="SEX_T", ECO="ECO_SECTOR_X")), "PHL": 0.0}  # PHL: no ECO_SECTOR_X row; sectors sum to total (check above)
obs3b = [obs3[0] + [unc["VNM"]], obs3[1] + [unc["PHL"]]]
q3["unclassified"] = unc
q3["robust_2x4"] = {k: v for k, v in chi2_report(obs3b, ["Viet Nam", "Philippines"], list(secs) + ["Not classified"]).items() if k in ("chi2", "p", "dof", "cramers_v", "min_expected")}
R["Q3"] = q3
save(pd.DataFrame(obs3, index=["Viet Nam", "Philippines"], columns=list(secs)), "Q3_observed")
save(pd.DataFrame(obs2, index=["Viet Nam", "Philippines"], columns=["Unemployed", "Employed"]), "Q2_observed")

# ------------------------------------------------------------------ Q4
gdp = wb("NY.GDP.MKTP.KD.ZG")[["VNM", "PHL", "IND"]].loc[2000:2024].dropna()
assert len(gdp) == 25
save(gdp, "Q4_panel")
grp = {c: gdp[c].values for c in gdp}
shap = {c: [float(v) for v in stats.shapiro(grp[c])] for c in grp}
lev = stats.levene(*grp.values(), center="median"); bart = stats.bartlett(*grp.values())
f1 = stats.f_oneway(*grp.values())
k = 3; N = 75
gm = gdp.values.mean(); ssb = sum(len(v) * (v.mean() - gm) ** 2 for v in grp.values())
ssw = sum(((v - v.mean()) ** 2).sum() for v in grp.values())
eta2 = ssb / (ssb + ssw)
# Welch ANOVA
w = np.array([len(v) / v.var(ddof=1) for v in grp.values()]); m_ = np.array([v.mean() for v in grp.values()])
mw = (w * m_).sum() / w.sum(); A_ = (w * (m_ - mw) ** 2).sum() / (k - 1)
tmp = (((1 - w / w.sum()) ** 2) / (np.array([len(v) for v in grp.values()]) - 1)).sum()
Fw = A_ / (1 + 2 * (k - 2) / (k ** 2 - 1) * tmp); dfw = (k ** 2 - 1) / (3 * tmp); pw = 1 - stats.f.cdf(Fw, k - 1, dfw)
kw = stats.kruskal(*grp.values())
from statsmodels.stats.multicomp import pairwise_tukeyhsd
tk = pairwise_tukeyhsd(gdp.melt()["value"], gdp.melt()["iso3"] if "iso3" in gdp.melt() else gdp.melt()["variable"], alpha=A)
pairs = []
names = list(grp)
from itertools import combinations
raw_p = []
for a, b in combinations(names, 2):
    t = stats.ttest_ind(grp[a], grp[b], equal_var=False); raw_p.append(t.pvalue)
    pairs.append(dict(pair=f"{a}-{b}", mean_diff=float(grp[a].mean() - grp[b].mean()), welch_t=float(t.statistic), p_raw=float(t.pvalue),
                      mw_p=float(stats.mannwhitneyu(grp[a], grp[b]).pvalue)))
order = np.argsort(raw_p); m = len(raw_p); holm = [None] * m; prev = 0
for r_, idx in enumerate(order):
    prev = max(prev, min(1, (m - r_) * raw_p[idx])); holm[idx] = prev
for pdict, h in zip(pairs, holm): pdict["p_holm"] = float(h)
tuk = [dict(pair=f"{r[0]}-{r[1]}", diff=float(r[2]), p_adj=float(r[3]), lo=float(r[4]), hi=float(r[5]), reject=bool(r[6])) for r in tk._results_table.data[1:]]
# Dunn (1964) post-hoc after Kruskal-Wallis, tie-corrected, Holm-adjusted
allv = gdp.melt(var_name="c", value_name="v"); allv["r"] = stats.rankdata(allv["v"])
_, cnt = np.unique(allv["v"], return_counts=True); tcorr = 1 - (cnt ** 3 - cnt).sum() / (N ** 3 - N)
mr = allv.groupby("c")["r"].mean(); dunn = []; dp = []
for a, b in combinations(names, 2):
    zv = (mr[a] - mr[b]) / np.sqrt(N * (N + 1) / 12 * tcorr * (1 / 25 + 1 / 25)); pv = 2 * (1 - stats.norm.cdf(abs(zv))); dp.append(pv)
    dunn.append(dict(pair=f"{a}-{b}", mean_rank_diff=float(mr[a] - mr[b]), z=float(zv), p_raw=float(pv)))
o_ = np.argsort(dp); prev = 0; hl = [None] * 3
for r_, idx in enumerate(o_): prev = max(prev, min(1, (3 - r_) * dp[idx])); hl[idx] = prev
for d_, h in zip(dunn, hl): d_["p_holm"] = float(h)
# residual autocorrelation within countries
ac = {c: float(pd.Series(grp[c]).autocorr(1)) for c in grp}
# robustness excluding 2020-2021 (COVID)
g2 = gdp.drop([2020, 2021]); f_ex = stats.f_oneway(*[g2[c].values for c in g2]); kw_ex = stats.kruskal(*[g2[c].values for c in g2])
R["Q4"] = dict(indicator="NY.GDP.MKTP.KD.ZG", years=[2000, 2024], n_per_group=25,
               means={c: float(grp[c].mean()) for c in grp}, sds={c: float(grp[c].std(ddof=1)) for c in grp},
               medians={c: float(np.median(grp[c])) for c in grp}, shapiro=shap,
               levene=[float(lev.statistic), float(lev.pvalue)], bartlett=[float(bart.statistic), float(bart.pvalue)],
               anova=dict(F=float(f1.statistic), p=float(f1.pvalue), ssb=float(ssb), ssw=float(ssw), df=[k - 1, N - k],
                          msb=float(ssb / (k - 1)), msw=float(ssw / (N - k)), eta2=float(eta2)),
               welch=dict(F=float(Fw), df1=k - 1, df2=float(dfw), p=float(pw)), kruskal=dict(H=float(kw.statistic), p=float(kw.pvalue)),
               tukey=tuk, pairs=pairs, dunn=dunn, mean_ranks={c: float(v) for c, v in mr.items()}, lag1_autocorr=ac,
               ex_covid=dict(F=float(f_ex.statistic), p=float(f_ex.pvalue), H=float(kw_ex.statistic), p_kw=float(kw_ex.pvalue),
                             means={c: float(g2[c].mean()) for c in g2}))
fig, ax = plt.subplots(1, 2, figsize=(11, 3.8))
ax[0].boxplot([grp[c] for c in names], tick_labels=names); ax[0].set_title("GDP growth 2000-2024 by country (%)")
for c in names: ax[1].plot(gdp.index, gdp[c], label=c, marker=".")
ax[1].legend(); ax[1].set_title("Annual GDP growth (%)"); plt.tight_layout(); plt.savefig(FIG / "Q4.png", dpi=150); plt.close()

# ------------------------------------------------------------------ Q5
gcf = wb("NE.GDI.TOTL.ZS")["VNM"]; infl = wb("FP.CPI.TOTL.ZG")["VNM"]; g = wb("NY.GDP.MKTP.KD.ZG")["VNM"]
df5 = pd.concat([g.rename("GDP_growth"), gcf.rename("Investment_pctGDP"), infl.rename("Inflation")], axis=1).dropna()
df5 = df5.loc[1996:2025]
save(df5, "Q5_data")
Y = df5["GDP_growth"]; X = sm.add_constant(df5[["Investment_pctGDP", "Inflation"]])
m1 = sm.OLS(Y, X).fit()
m1h = m1.get_robustcov_results(cov_type="HAC", maxlags=2)
vif = {c: float(variance_inflation_factor(X.values, j)) for j, c in enumerate(X.columns) if c != "const"}
bp = het_breuschpagan(m1.resid, X); bg = acorr_breusch_godfrey(m1, nlags=1)
sw5 = stats.shapiro(m1.resid); jb5 = stats.jarque_bera(m1.resid)
corr = df5.corr().round(3).to_dict()
cd = m1.get_influence().cooks_distance[0]
def coefs(m, robust=None):
    return {k: dict(b=float(m.params[k]), se=float(m.bse[k]), t=float(m.tvalues[k]), p=float(m.pvalues[k])) for k in m.params.index}
# quadratic term (inflation centred to limit collinearity)
df5["Inflation_c"] = df5["Inflation"] - df5["Inflation"].mean()
df5["Inflation_c_sq"] = df5["Inflation_c"] ** 2
X2 = sm.add_constant(df5[["Investment_pctGDP", "Inflation_c", "Inflation_c_sq"]]); m2 = sm.OLS(Y, X2).fit()
Fnest = m2.compare_f_test(m1)
# alt quadratic in investment
df5["Inv_c"] = df5["Investment_pctGDP"] - df5["Investment_pctGDP"].mean(); df5["Inv_c_sq"] = df5["Inv_c"] ** 2
X3 = sm.add_constant(df5[["Inv_c", "Inv_c_sq", "Inflation"]]); m3 = sm.OLS(Y, X3).fit(); F3 = m3.compare_f_test(m1)
# without 2020-2021
d_ex = df5.drop([2020, 2021]); m1x = sm.OLS(d_ex["GDP_growth"], sm.add_constant(d_ex[["Investment_pctGDP", "Inflation"]])).fit()
R["Q5"] = dict(n=int(len(df5)), years=[int(df5.index.min()), int(df5.index.max())],
               m1=dict(coefs=coefs(m1), hac_p={k: float(p) for k, p in zip(X.columns, m1h.pvalues)}, F=float(m1.fvalue), F_p=float(m1.f_pvalue), r2=float(m1.rsquared),
                       adj_r2=float(m1.rsquared_adj), aic=float(m1.aic), bic=float(m1.bic), rmse=float(np.sqrt(m1.mse_resid)), dfres=int(m1.df_resid)),
               vif=vif, bp=[float(bp[0]), float(bp[1])], bg=[float(bg[0]), float(bg[1])], dw=float(durbin_watson(m1.resid)),
               shapiro_resid=[float(sw5[0]), float(sw5[1])], jb_resid=[float(jb5[0]), float(jb5[1])], corr=corr, max_cooks=float(cd.max()),
               max_cooks_year=int(df5.index[cd.argmax()]),
               m2=dict(coefs=coefs(m2), r2=float(m2.rsquared), adj_r2=float(m2.rsquared_adj), aic=float(m2.aic), bic=float(m2.bic), F=float(m2.fvalue), F_p=float(m2.f_pvalue),
                       nested_F=float(Fnest[0]), nested_p=float(Fnest[1])),
               m3=dict(coefs=coefs(m3), r2=float(m3.rsquared), adj_r2=float(m3.rsquared_adj), aic=float(m3.aic), nested_F=float(F3[0]), nested_p=float(F3[1])),
               ex_covid=dict(coefs=coefs(m1x), r2=float(m1x.rsquared), n=int(m1x.nobs)),
               infl_mean=float(df5["Inflation"].mean()))
fig, ax = plt.subplots(1, 3, figsize=(13, 3.6))
ax[0].scatter(m1.fittedvalues, m1.resid); ax[0].axhline(0, c="k", lw=.7); ax[0].set_title("Residuals vs fitted")
sm.qqplot(m1.resid, line="s", ax=ax[1]); ax[1].set_title("Residual Q-Q")
ax[2].scatter(df5["Inflation"], Y); xx = np.linspace(df5["Inflation"].min(), df5["Inflation"].max(), 100)
ax[2].plot(xx, m2.params["const"] + m2.params["Investment_pctGDP"] * df5["Investment_pctGDP"].mean() + m2.params["Inflation_c"] * (xx - df5["Inflation"].mean()) + m2.params["Inflation_c_sq"] * (xx - df5["Inflation"].mean()) ** 2, "r")
ax[2].set_title("GDP growth vs inflation (quadratic fit @ mean investment)"); plt.tight_layout(); plt.savefig(FIG / "Q5.png", dpi=150); plt.close()

# ------------------------------------------------------------------ Q6
ex = wb("NE.EXP.GNFS.CD")["VNM"].dropna() / 1e9  # US$ billion
ex = ex.loc[1986:2025]; save(ex.to_frame("Exports_USD_bn"), "Q6_series")
H = 5; tr, te = ex.iloc[:-H], ex.iloc[-H:]
def lin_fit(y, t0):
    t = np.arange(len(y)); b1, b0 = np.polyfit(t, y.values, 1); return b0, b1
def err(a, f): e = a.values - f; return dict(MAE=float(np.abs(e).mean()), MAPE=float((np.abs(e) / a.values).mean() * 100), RMSE=float(np.sqrt((e ** 2).mean())))
b0, b1 = lin_fit(tr, 0); f_lin = b0 + b1 * (len(tr) + np.arange(H))
ma_k = 3; f_ma = np.repeat(tr.iloc[-ma_k:].mean(), H)
# log-linear trend as an extension (exports grew exponentially)
c1, c0 = np.polyfit(np.arange(len(tr)), np.log(tr.values), 1); f_log = np.exp(c0 + c1 * (len(tr) + np.arange(H)))
# naive random-walk-with-drift reference
f_naive = np.repeat(tr.iloc[-1], H)
# one-step-ahead (rolling-origin) MA(3) as fairer MA evaluation
roll = np.array([ex.iloc[j - ma_k:j].mean() for j in range(len(tr), len(ex))])
from statsmodels.tsa.holtwinters import Holt
rw = 10; tw = np.arange(rw); c1w, c0w = np.polyfit(tw, tr.iloc[-rw:].values, 1); f_rec = c0w + c1w * (rw + np.arange(H))
f_holt = Holt(tr.values, damped_trend=True, initialization_method="estimated").fit().forecast(H)
hold = pd.DataFrame({"actual": te.values, "linear_trend": f_lin, "MA3_flat": f_ma, "MA3_rolling_1step": roll, "loglinear_trend": f_log, "naive_last": f_naive, "linear_trend_last10y": f_rec, "damped_Holt": f_holt}, index=te.index)
save(hold, "Q6_holdout")
ev = {k: err(te, hold[k].values) for k in hold.columns if k != "actual"}
# final refit on full series, forecast 2026-2027 (series ends 2025 -> check)
last = int(ex.index.max()); b0f, b1f = lin_fit(ex, 0); nfull = len(ex)
fc_lin = [b0f + b1f * (nfull + h) for h in range(2)]
resid_full = ex.values - (b0f + b1f * np.arange(nfull)); s_full = float(np.sqrt((resid_full ** 2).sum() / (nfull - 2)))
tt = np.arange(nfull); se_pred = [s_full * np.sqrt(1 + 1 / nfull + (nfull + h - tt.mean()) ** 2 / ((tt - tt.mean()) ** 2).sum()) for h in range(2)]
tcrit = stats.t.ppf(0.975, nfull - 2)
fc_ma = float(ex.iloc[-ma_k:].mean())
c1r, c0r = np.polyfit(np.arange(rw), ex.iloc[-rw:].values, 1); fc_rec = [float(c0r + c1r * (rw + h)) for h in range(2)]
res_r = ex.iloc[-rw:].values - (c0r + c1r * np.arange(rw)); s_r = float(np.sqrt((res_r ** 2).sum() / (rw - 2))); t_r = stats.t.ppf(0.975, rw - 2)
se_r = [s_r * np.sqrt(1 + 1 / rw + (rw + h - (rw - 1) / 2) ** 2 / ((np.arange(rw) - (rw - 1) / 2) ** 2).sum()) for h in range(2)]
fc_holt = [float(v) for v in Holt(ex.values, damped_trend=True, initialization_method="estimated").fit().forecast(2)]
rm = ex.rolling(ma_k).mean()
cf, cf0 = np.polyfit(np.arange(nfull), np.log(ex.values), 1)[::-1][0], None
lc1, lc0 = np.polyfit(np.arange(nfull), np.log(ex.values), 1)
fc_log = [float(np.exp(lc0 + lc1 * (nfull + h))) for h in range(2)]
ds = ex.pct_change().dropna() * 100
R["Q6"] = dict(n=int(nfull), years=[int(ex.index.min()), last], holdout_years=[int(te.index.min()), int(te.index.max())], eval=ev,
               trend_full=dict(b0=float(b0f), b1=float(b1f), s=s_full, r2=float(1 - (resid_full ** 2).sum() / ((ex.values - ex.mean()) ** 2).sum())),
               train_trend=dict(b0=float(b0), b1=float(b1)), fc_years=[last + 1, last + 2],
               fc_linear=[float(v) for v in fc_lin], fc_linear_pi=[[float(f - tcrit * s_), float(f + tcrit * s_)] for f, s_ in zip(fc_lin, se_pred)],
               fc_ma3=fc_ma, fc_recent10=fc_rec, fc_recent10_pi=[[float(f - t_r * s_), float(f + t_r * s_)] for f, s_ in zip(fc_rec, se_r)], fc_holt=fc_holt, slope_recent10=float(c1r), fc_loglin=fc_log, loglin_growth_pct=float((np.exp(lc1) - 1) * 100), mean_growth_pct=float(ds.mean()), sd_growth_pct=float(ds.std()),
               dw_trend=float(durbin_watson(resid_full)), last_value=float(ex.iloc[-1]), last3=[float(v) for v in ex.iloc[-3:]])
fig, ax = plt.subplots(1, 2, figsize=(12, 3.8))
ax[0].plot(ex.index, ex.values, "k.-", label="Actual"); ax[0].plot(rm.index, rm.values, label="MA(3)")
ax[0].plot(ex.index, b0f + b1f * np.arange(nfull), "r--", label="Linear trend (full)"); ax[0].set_title("Viet Nam exports of goods & services (US$ bn, current)"); ax[0].legend()
for k_ in ("linear_trend", "MA3_flat", "loglinear_trend"): ax[1].plot(hold.index, hold[k_], marker="o", label=k_)
ax[1].plot(hold.index, hold.actual, "k-s", label="actual"); ax[1].legend(); ax[1].set_title("Holdout 2021-2025: forecasts vs actual"); plt.tight_layout(); plt.savefig(FIG / "Q6.png", dpi=150); plt.close()

# ------------------------------------------------------------------ Q8 support indicators
g_vn = wb("NY.GDP.MKTP.KD.ZG")["VNM"].dropna(); i_vn = wb("FP.CPI.TOTL.ZG")["VNM"].dropna()
el = wb("EG.USE.ELEC.KH.PC")["VNM"].dropna()
R["Q8"] = dict(infl_sd_1996_2025=float(i_vn.loc[1996:2025].std()), infl_sd_2015_2025=float(i_vn.loc[2015:2025].std()), infl_last=float(i_vn.iloc[-1]), infl_last_year=int(i_vn.index[-1]),
               infl_2022=float(i_vn.loc[2022]), infl_2023=float(i_vn.loc[2023]), infl_2024=float(i_vn.loc[2024]), g_last=float(g_vn.iloc[-1]), g_last_year=int(g_vn.index[-1]),
               g_sd_2000_2024=float(g_vn.loc[2000:2024].std()), g_min_2000_2024=float(g_vn.loc[2000:2024].min()), g_min_year=int(g_vn.loc[2000:2024].idxmin()),
               g_mean_2015_2025=float(g_vn.loc[2015:2025].mean()), g_2020=float(g_vn.loc[2020]), g_2021=float(g_vn.loc[2021]),
               elec_last=float(el.iloc[-1]), elec_last_year=int(el.index[-1]), elec_cagr_2014_2024=float(((el.loc[2024] / el.loc[2014]) ** (1 / 10) - 1) * 100),
               elec_growth_2024=float((el.loc[2024] / el.loc[2023] - 1) * 100),
               years_infl_gt4=int((i_vn.loc[1996:2025] > 4).sum()), years_gt=int(len(i_vn.loc[1996:2025])),
               exports_pct_gdp_last=float(wb("NE.EXP.GNFS.ZS")["VNM"].dropna().iloc[-1]), exports_pct_gdp_last_year=int(wb("NE.EXP.GNFS.ZS")["VNM"].dropna().index[-1]))
json.dump(R, open(HERE / "results.json", "w"), indent=1, default=float)
print(json.dumps(R, indent=1, default=float)[:200000])
