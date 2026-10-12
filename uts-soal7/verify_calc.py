import openpyxl, numpy as np, json, sys
from scipy import stats
ws=openpyxl.load_workbook(sys.argv[1]).worksheets[0]
rows=list(ws.iter_rows(values_only=True)); h=list(rows[0]); d=np.array([r[1:] for r in rows[1:]],float)
cols=h[1:]
n=d.shape[0]; tcrit=stats.t.ppf(.975,n-2); rcrit=tcrit/np.sqrt(tcrit**2+n-2)
print('n',n,'tcrit',tcrit,'rcrit',rcrit)
out={'rcrit':rcrit,'items':[],'alpha':[]}
def alpha(X):
    k=X.shape[1]; return k/(k-1)*(1-X.var(0,ddof=1).sum()/X.sum(1).var(ddof=1))
for t in ['Pre','Post']:
  for c in ['EA','ELT','TSE','TS']:
    idx=[cols.index(f'{c}_Q{i}_{t}') for i in (1,2,3)]; X=d[:,idx]; T=X.sum(1)
    for j in range(3):
      r=np.corrcoef(X[:,j],T)[0,1]; rest=T-X[:,j]; rc=np.corrcoef(X[:,j],rest)[0,1]
      p=stats.pearsonr(X[:,j],T)[1]; pc=stats.pearsonr(X[:,j],rest)[1]
      aid=alpha(np.delete(X,j,1))
      out['items'].append(dict(t=t,c=c,item=f'{c}_Q{j+1}_{t}',mean=X[:,j].mean(),sd=X[:,j].std(ddof=1),r=r,p=p,rc=rc,pc=pc,aid=aid))
    a=alpha(X); k=3
    df1=n-1; df2=(n-1)*(k-1)
    lo=1-(1-a)*stats.f.ppf(.975,df1,df2); hi=1-(1-a)*stats.f.ppf(.025,df1,df2)
    R=np.corrcoef(X.T); mr=R[np.triu_indices(3,1)].mean()
    out['alpha'].append(dict(t=t,c=c,alpha=a,lo=lo,hi=hi,meanr=mr,interr=R[np.triu_indices(3,1)].tolist(),sumvar=X.var(0,ddof=1).sum(),vart=T.var(ddof=1)))
  idx=[i for i,x in enumerate(cols) if x.endswith('_'+t)]
  print(t,'12-item alpha',alpha(d[:,idx]))
for i in out['items']: print(f"{i['item']:12s} M={i['mean']:.3f} SD={i['sd']:.3f} r={i['r']:.3f} p={i['p']:.4f} rc={i['rc']:.3f} pc={i['pc']:.4f} aid={i['aid']:.3f}")
for a in out['alpha']: print(f"{a['t']:4s} {a['c']:4s} a={a['alpha']:.3f} CI[{a['lo']:.3f},{a['hi']:.3f}] meanr={a['meanr']:.3f} r={['%.3f'%x for x in a['interr']]}")
json.dump(out,open('ref.json','w'),indent=1)
