import pyreadstat, pandas as pd, numpy as np, sys
import os; U=os.environ.get('DATA_DIR','./')
sav,meta=pyreadstat.read_sav(U+'Electric_Cars_Purchase_Intention-Maheswaran_and_Veena.sav',apply_value_formats=False,encoding='LATIN1')
csv=pd.read_csv(U+'Electric_Cars_Purchase_Intention-Data_in_Brief.csv',encoding='utf-8-sig',skipinitialspace=True)
print('SAV shape',sav.shape,'CSV shape',csv.shape)
print('file label:',meta.file_label,'| notes:',meta.notes,'| encoding',meta.file_encoding,'| created',meta.creation_time)
print('cols equal:',list(sav.columns)==list(csv.columns))
print('missing ranges',meta.missing_ranges, 'user missing', getattr(meta,'missing_user_values',None))
for c in sav.columns:
    print(f"{c:12s} {meta.column_names_to_labels.get(c)!s:95.95s} measure={meta.variable_measure.get(c)} fmt={meta.original_variable_types.get(c)} vlabels={meta.variable_value_labels.get(c)}")
items=[c for c in sav.columns if c[:2] in ('CC','DC','EB','EC','GP','PI','SB','TB')]
print('\nItem summary SAV: n_nonmissing, min, max, values')
for c in items:
    s=sav[c]; print(c, s.notna().sum(), s.min(), s.max(), dict(s.value_counts().sort_index()))
print('\nDemographics SAV value counts')
for c in sav.columns[:10]:
    print(c, dict(sav[c].value_counts(dropna=False).sort_index()))
print('\nDemographics CSV value counts')
for c in csv.columns[:10]:
    print(c, dict(csv[c].value_counts(dropna=False).sort_index()))
# compare item matrices
a=sav[items].to_numpy(); b=csv[items].to_numpy(dtype=float)
print('\nitem cells equal (row order as-is):', np.array_equal(a,b,equal_nan=True), 'n diff', int((~np.isclose(a,b,equal_nan=True)).sum()))
print('duplicated full rows SAV', int(sav.duplicated().sum()), 'dup item rows', int(sav[items].duplicated().sum()))
print('rows with any item missing', int(sav[items].isna().any(axis=1).sum()))
