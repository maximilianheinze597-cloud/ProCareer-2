import os
r=os.path.dirname(os.path.abspath(__file__))
t=open(r+'/template.html').read()
js=''.join(open(r+'/js/'+f).read()+'\n' for f in['data.js','career.js','audio.js','match.js','app.js'])
assert '</script>' not in js
t=t.replace('/*CSS*/',open(r+'/style.css').read()).replace('/*JS*/',js)
open(os.path.dirname(r)+'/index.html','w').write(t);print('built',len(t))
