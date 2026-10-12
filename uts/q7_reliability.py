"""Q7: reliability of a 6-item Likert scale. Usage: python3 q7_reliability.py responses.csv
CSV: one row per respondent, columns item1..item6 (integers 1-5). NEVER pass simulated data as real."""
import sys, numpy as np, pandas as pd
from scipy import stats
d = pd.read_csv(sys.argv[1])[[f"item{i}" for i in range(1, 7)]].dropna()
n, k = d.shape; assert n >= 30, "need >= 30 real respondents"
tot = d.sum(1)
cit = {c: stats.pearsonr(d[c], tot - d[c])[0] for c in d}            # corrected item-total correlation
odd, even = d[["item1", "item3", "item5"]].sum(1), d[["item2", "item4", "item6"]].sum(1)
r = stats.pearsonr(odd, even)[0]; sb = 2 * r / (1 + r)                 # Spearman-Brown
sp_rho = stats.spearmanr(odd, even)[0]
alpha = k / (k - 1) * (1 - d.var(ddof=1).sum() / tot.var(ddof=1))
a_del = {c: (k - 1) / (k - 2) * (1 - d.drop(columns=c).var(ddof=1).sum() / d.drop(columns=c).sum(1).var(ddof=1)) for c in d}
print(f"n={n}\ncorrected item-total r:", {c: round(v, 3) for c, v in cit.items()}, f"\nodd-even r={r:.3f} (Spearman rho={sp_rho:.3f}) -> Spearman-Brown={sb:.3f}\nCronbach alpha={alpha:.3f}\nalpha if item deleted:", {c: round(v, 3) for c, v in a_del.items()})
