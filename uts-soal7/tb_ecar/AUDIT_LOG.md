# Soal 7 (TB scale) – final audit log, 12 Oct 2026

## Official Question 7 text
Not found. Searched: this repository (all 18 remote branches, `git grep`), files uploaded to the
session, the session working folders, the student's Google Drive (keyword and recent-file
searches) and the student's Claude artifacts. No official exam text was found, so none is
reproduced and full compliance is not claimed. The compliance matrix in the report is checked
against an unofficial paraphrase of the requirements only.

## Results re-checked (unchanged)
| Statistic | n = 510 | n = 509 |
| --- | --- | --- |
| Cronbach's alpha | 0.4325 (95% CI 0.3526–0.5055) | 0.4327 |
| Spearman–Brown (odd-even) | 0.5073 | 0.5075 |
| Items with CITC >= 0.30 | TB4 only (0.321) | TB4 only (0.320) |

No item was dropped and the DC items were not analysed after results were known.

## Checks run
- `verify_tb_calc.py` and `inspect_dataset.py` re-run from this folder (with `DATA_DIR` pointing at
  the original CSV/SAV): all reference values reproduced; CSV and SAV item values identical.
- Workbook recalculated in LibreOffice: 16,732 formulas, 0 errors; Cross_Check sheet: 60 statistics,
  largest Excel–Python difference 7.5e-15. Not yet opened in Microsoft Excel.
- `audit_report.py` compares every number in the report's Results tables with the workbook.
  It found two rounding errors in the report (TB1 CITC 0.293 → 0.292; TB1 alpha-if-deleted
  0.334 → 0.335). Both were corrected in the report; the workbook was already correct.
  After correction: 0 failures (`report_numbers_snapshot.md` holds the checked figures).

## Still unverified
Dataset licence, version, DOI and citation; meaning of codes 1–5; name of the TB construct;
link between the 510-row file and the Pailwar & Srinivasan (2022) articles (436 / 273
respondents reported in search snippets); the official Question 7 requirements.
