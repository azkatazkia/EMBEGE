# Soal 7 – requirements to verify against the official text

Status (12 Oct 2026): official Question 7 text and general UTS instructions NOT found.
Searched again: all repository branches, session uploads, session working folders,
Google Drive (keywords: "Statistical Analysis II", "UTS", "Ujian Tengah Semester",
"Question 7", lecturer and university names), and the student's Claude artifacts.
Nothing below is taken from another student's report; each line is an open question
to be answered from the official text only.

Legend: [ ] not yet verified · [x] verified against official text · n/a = not required

## A. General UTS instructions
- [ ] Assigned country / case context and how it is assigned (e.g. by student ID)
- [ ] Required case theme(s) and whether recent news must be used (which sources, date window)
- [ ] Report language, length limits, required section structure
- [ ] Significance level to use
- [ ] Data citation rules (URL, indicator code, unit, period, download date)
- [ ] Whether original data and calculations must be attached, and in what form
- [ ] Reference style
- [ ] File format and naming rule
- [ ] AI-use disclosure rules (prompts? verification steps? format?)
- [ ] Deadline and submission channel

## B. Question 7 specifics
- [ ] Must the six Likert items be designed by the student, or may items from a public dataset be used?
- [ ] Construct: freely chosen or tied to the case? Any required definition?
- [ ] Number of items (exactly six?) and scale points (5-point? 7-point?)
- [ ] Content validity: what is required (conceptual argument, expert review, CVI, pilot)?
- [ ] Target respondents: must they be specified/justified? Any population constraint?
- [ ] Data source rules: public item-level dataset allowed? minimum n (30?)? own data allowed? consent requirements?
- [ ] Required statistics: corrected item-total correlation; odd-even split-half with Spearman-Brown; Cronbach's alpha; any others?
- [ ] Decision thresholds stated by the lecturer (CITC, alpha)
- [ ] Interpretation / recommendation requirements (management recommendation?)
- [ ] Fallback option if no dataset (protocol only; maximum mark) and when it applies
- [ ] Marks allocated to each part

## C. Existing work to map once the text is available (do not modify)
| Component | Location | Status |
| --- | --- | --- |
| Reliability analysis TB1-TB6 (n = 510; n = 509 sensitivity) | Soal7_TB_Reliability.xlsx; report "Soal 7 – Reliability of the E-car Product Attribute (TB) Scale" | Verified (AUDIT_LOG.md) |
| Conceptual item review of TB1-TB6 | Report, "Construct and Item Selection" | Analyst's review only; no expert panel |
| Respondent description | Report, "Data Source and Provenance" | Inferred from SPSS labels only |
| Case-context link (energy / EV, assigned country, news) | — | Not written |
| Self-designed six items | — | Not written (pending B1) |

## D. Files the student needs to supply
1. Official exam PDF or text: Question 7 and the general instructions (sections A and B).
2. Proof of the assigned country / case context (if it is in the exam PDF, item 1 suffices).
3. Mendeley Data page for tz7krp8rvz version 2 (screenshot or PDF): title, authors, version, date, DOI, licence, suggested citation.
4. If available: Pailwar & Srinivasan (2022) article(s) or the original questionnaire (construct name for TB, meaning of codes 1-5, sampling frame).
5. Evidence of any real content-validity review (who reviewed, what was rated) — only if it actually took place.
6. Any rubric or lecturer clarification (e.g. forum post, email) about Question 7.

## E. Process once the official text arrives
1. Store the official text unchanged in a new file; record source and date.
2. Fill sections A–B with exact quotes and page numbers.
3. Map every instruction to existing work (section C); mark Met / Partly met / Missing.
4. Propose the minimal revision for each gap; implement only in new files; keep existing files and AUDIT_LOG.md intact; re-run audit_report.py if any number is quoted.
