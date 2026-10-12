import pandas as pd, numpy as np, json, sys
from scipy import stats
import os; U=os.environ.get('DATA_DIR','./')
c=pd.read_csv(U+'Electric_Cars_Purchase_Intention-Data_in_Brief.csv',encoding='utf-8-sig',skipinitialspace=True)
items=['TB1','TB2','TB3','TB4','TB5','TB6']; odd=['TB1','TB3','TB5']; even=['TB2','TB4','TB6']
def alpha(X):
    k=X.shape[1]; return k/(k-1)*(1-X.var(ddof=1).sum()/X.sum(axis=1).var(ddof=1))
def run(df,label):
    X=df[items].astype(float); n=len(X); k=6; T=X.sum(axis=1)
    out={'label':label,'n':n}
    out['items']=[]
    for it in items:
        rest=T-X[it]; r,p=stats.pearsonr(X[it],rest); rs,ps=stats.spearmanr(X[it],rest)
        out['items'].append(dict(item=it,mean=X[it].mean(),sd=X[it].std(ddof=1),var=X[it].var(ddof=1),
            citc=r,p=p,citc_spearman=rs,alpha_if_deleted=alpha(X.drop(columns=it)),
            r_uncorrected=stats.pearsonr(X[it],T)[0]))
    a=alpha(X); df1=n-1; df2=(n-1)*(k-1)
    out['alpha']=a; out['alpha_ci']=[1-(1-a)*stats.f.ppf(.975,df1,df2),1-(1-a)*stats.f.ppf(.025,df1,df2)]
    R=X.corr(); iu=np.triu_indices(6,1); out['mean_interitem_r']=R.values[iu].mean(); out['min_r']=R.values[iu].min(); out['max_r']=R.values[iu].max()
    out['std_alpha']=k*out['mean_interitem_r']/(1+(k-1)*out['mean_interitem_r'])
    O=X[odd].sum(axis=1); E=X[even].sum(axis=1); rh,ph=stats.pearsonr(O,E)
    out.update(r_half=rh,p_half=ph,spearman_brown=2*rh/(1+rh),
               guttman=2*(1-(O.var(ddof=1)+E.var(ddof=1))/T.var(ddof=1)),
               sum_item_var=X.var(ddof=1).sum(),var_total=T.var(ddof=1),var_odd=O.var(ddof=1),var_even=E.var(ddof=1),
               total_mean=T.mean(),total_sd=T.std(ddof=1))
    out['R']=R.round(4).values.tolist()
    r_crit=stats.t.ppf(.975,n-2)/np.sqrt(stats.t.ppf(.975,n-2)**2+n-2); out['r_crit_05']=r_crit
    return out
dup=c.duplicated(keep='first')   # marks the later of the identical pair
print('dropped rows (1-based):',[i+1 for i in c.index[dup]])
res=[run(c,'Primary (n=510, as published)'),run(c[~dup],'Sensitivity (second identical row removed)')]
for o in res:
    print('\n==',o['label'],'n=',o['n'],'r_crit(.05)=%.4f'%o['r_crit_05'])
    for i in o['items']: print(f"{i['item']} M={i['mean']:.4f} SD={i['sd']:.4f} CITC={i['citc']:.4f} p={i['p']:.2e} rho={i['citc_spearman']:.4f} a_del={i['alpha_if_deleted']:.4f} r_unc={i['r_uncorrected']:.4f}")
    print('alpha=%.4f CI[%.4f, %.4f] std_alpha=%.4f mean r=%.4f (min %.4f max %.4f)'%(o['alpha'],*o['alpha_ci'],o['std_alpha'],o['mean_interitem_r'],o['min_r'],o['max_r']))
    print('r_half=%.4f p=%.2e SB=%.4f Guttman=%.4f | total M=%.3f SD=%.3f'%(o['r_half'],o['p_half'],o['spearman_brown'],o['guttman'],o['total_mean'],o['total_sd']))
print(np.array(res[0]['R']))
json.dump(res,open('tb_ref.json','w'),indent=1,default=float)
