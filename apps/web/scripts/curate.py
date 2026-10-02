# One-off curation of skeleton.mjs drafts → package data files. Kept so the review fixes are reproducible.
#   node scripts/skeleton.mjs "<consonants>" consonant > /tmp/consonants.ts
#   node scripts/skeleton.mjs "০১২৩৪৫৬৭৮৯" digit > /tmp/digits.ts
#   python3 scripts/curate.py
#   (cd ../../packages/bangla-strokes && node scripts/annotate.mjs)   # adds order/direction to the bare arrays
import re, json, os
HERE = os.path.dirname(os.path.abspath(__file__))
PKG = os.path.join(HERE, '../../../packages/bangla-strokes/src/data')
names = {
 'ক':('ক','kô'),'খ':('খ','khô'),'গ':('গ','gô'),'ঘ':('ঘ','ghô'),'ঙ':('ঙ (উঁঅ)','ṅô'),
 'চ':('চ','cô'),'ছ':('ছ','chô'),'জ':('বর্গীয় জ','jô'),'ঝ':('ঝ','jhô'),'ঞ':('ঞ (ইঁঅ)','ñô'),
 'ট':('ট','ṭô'),'ঠ':('ঠ','ṭhô'),'ড':('ড','ḍô'),'ঢ':('ঢ','ḍhô'),'ণ':('মূর্ধন্য ণ','ṇô'),
 'ত':('ত','tô'),'থ':('থ','thô'),'দ':('দ','dô'),'ধ':('ধ','dhô'),'ন':('দন্ত্য ন','nô'),
 'প':('প','pô'),'ফ':('ফ','phô'),'ব':('ব','bô'),'ভ':('ভ','bhô'),'ম':('ম','mô'),
 'য':('অন্তঃস্থ য','jô'),'র':('র','rô'),'ল':('ল','lô'),'শ':('তালব্য শ','shô'),'ষ':('মূর্ধন্য ষ','ṣô'),
 'স':('দন্ত্য স','sô'),'হ':('হ','hô'),'ড়':('ড় (ড-এ শূন্য ড়)','ṛô'),'ঢ়':('ঢ় (ঢ-এ শূন্য ঢ়)','ṛhô'),
 'য়':('য় (অন্তঃস্থ অ)','ẏô'),'ৎ':('খণ্ড ত','t'),'ং':('অনুস্বার','ṅ'),'ঃ':('বিসর্গ','ḥ'),'ঁ':('চন্দ্রবিন্দু','̃'),
 '০':('শূন্য','0'),'১':('এক','1'),'২':('দুই','2'),'৩':('তিন','3'),'৪':('চার','4'),
 '৫':('পাঁচ','5'),'৬':('ছয়','6'),'৭':('সাত','7'),'৮':('আট','8'),'৯':('নয়','9'),
}
def parse(src):
    out=[]
    for m in re.finditer(r"\{\n    char: ('(?:\\u[0-9a-f]{4}|[^'])')\, name: '[^']*', roman: '', group: '(\w+)',\n    strokes: \[\n(.*?)\n    \],\n    parts: (\[.*?\]),\n  \},", src, re.S):
        raw=m.group(1)[1:-1]
        char = chr(int(raw[2:],16)) if raw.startswith('\\u') else raw
        strokes=[json.loads(line.strip().rstrip(',')) for line in m.group(3).split('\n')]
        out.append({'char':char,'group':m.group(2),'strokes':strokes})
    return out
cons=parse(open('/tmp/consonants.ts').read()); digs=parse(open('/tmp/digits.ts').read())
assert len(cons)==39 and len(digs)==10, (len(cons),len(digs))
byc={l['char']:l for l in cons}
# drop junk connector strokes (index) found in review
for ch,idx in [('প',1),('ল',1),('ষ',0),('স',0)]:
    byc[ch]['strokes'].pop(idx)
# dots lost by thinning: add as short strokes (dot goes before the headline if any, else last)
def add_dot(ch,cx,cy):
    s=byc[ch]['strokes']; dot=[[cx-2,cy-2],[cx+2,cy+2]]
    head=[k for k,st in enumerate(s) if abs(st[0][1]-st[-1][1])<8 and abs(st[-1][0]-st[0][0])>35 and st[0][1]<40]
    s.insert(head[0] if head else len(s), dot)
add_dot('র',37,82); add_dot('ড়',55,84); add_dot('ঢ়',55,84); add_dot('য়',40,82); add_dot('ঁ',50,38)
# শ: thinning destroyed the two solid bowls; hand-authored from the outline
byc['শ']['strokes']=[
 [[15,20],[24,22],[33,28],[38,34],[30,40],[22,46],[23,54],[32,57],[38,50],[39,40]],
 [[39,40],[48,42],[57,48],[54,56],[45,56],[39,50]],
 [[38,34],[46,24],[56,20],[66,24],[72,30]],
 [[73,12],[73,88]],
 [[73,20],[85,20]],
]
def lit(ch):
    cp=ord(ch); return "'\\u%04x'"%cp if 0x9dc<=cp<=0x9df else "'%s'"%ch
def emit(letters,const,doc):
    lines=["import type { Letter } from '../types';","",doc,f"export const {const}: Letter[] = ["]
    for l in letters:
        n,r=names[l['char']]
        lines.append(f"  {{\n    char: {lit(l['char'])}, name: '{n}', roman: '{r}', group: '{l['group']}',\n    strokes: [")
        for s in l['strokes']: lines.append("      ["+", ".join(f"[{x:g}, {y:g}]" for x,y in s)+"],")
        parts=json.dumps([[i] for i in range(len(l['strokes']))]).replace(' ','')
        lines.append(f"    ],\n    parts: {parts},\n  }},")
    lines.append("];\n"); return "\n".join(lines)
doc_c="""/**
 * Stroke constants for the 39 Bengali consonants (ব্যঞ্জনবর্ণ) incl. ড় ঢ় য় ৎ ং ঃ ঁ.
 * Drafted by apps/web/scripts/skeleton.mjs (font outline → skeleton → strokes), then reviewed by eye
 * (apps/web/scripts/curate.py): junk connector strokes removed, dots re-added, শ hand-authored.
 * Same box/convention as vowels.ts. Refine in the app's /editor and paste back.
 */"""
doc_d="/** Stroke constants for the Bengali digits ০–৯. Drafted by apps/web/scripts/skeleton.mjs, reviewed by eye. */"
open(os.path.join(PKG,'consonants.ts'),'w').write(emit(cons,'CONSONANTS',doc_c))
open(os.path.join(PKG,'digits.ts'),'w').write(emit(digs,'DIGITS',doc_d))
print('written', len(cons), 'consonants,', len(digs), 'digits')
