/* Browser-only offline PonaMoji rule engine, adapted from v1.3. */
(function(global) {
'use strict';
const DATA = global.PonaMojiData;
if (!DATA) throw new Error('Load data.js before engine.js');
const ZH_DATA = DATA.zhLexicon;
const {phrase: CN_PHRASE, modifier: CN_MODIFIER, verb: CN_VERB, adjective: CN_ADJ, time: CN_TIME, number: CN_NUM} = DATA.cn;
const byWord = new Map(DATA.entries.map(e => [e.word, e.emoji]));
const byEmoji = new Map(DATA.entries.map(e => [emojiKey(e.emoji), e.word]));
const ZH_NOUN_KEYS = Object.keys(ZH_DATA.nouns).sort((a,b)=>b.length-a.length);
const ZH_VERBS = [...ZH_DATA.verbs].sort((a,b)=>b[0].length-a[0].length);
const ZH_TIME_KEYS = Object.keys(ZH_DATA.times).sort((a,b)=>b.length-a.length);
const ZH_MOD_KEYS = Object.keys(ZH_DATA.nounModifiers).sort((a,b)=>b.length-a.length);
const ZH_QUANTITY = /^([一两二三四五])(?:个|只|本|杯|份|条|颗|辆|张|款|片)?/u;

function zhNote(issues, s){ if(s && !issues.includes(s)) issues.push(s); }
function unknownText(s){ return `⟦${s}⟧`; }
function subjPredicate(subject,predicate){
  return subject + (subject==='mi'||subject==='sina'?' ':' li ') + predicate;
}
function getZhNoun(s, issues){
  s=s.trim().replace(/\s+/gu,'');
  const original=s;
  if(!s)return {tp:'',valid:false};
  let quantity='',demonstrative='',ownership='',adjectives=[];
  // Consume independently ordered qualifiers: 我的两个红苹果 / 这两本书.
  for(let round=0;round<8 && !ZH_DATA.nouns[s];round++){
    let m=s.match(/^(我们的|你们的|他们的|她们的|我的|你的|他的|她的|它的)/u);
    if(m && !ownership){ownership=ZH_DATA.nouns[m[0].slice(0,-1)]||'ona';s=s.slice(m[0].length);continue;}
    m=s.match(/^(这个|那个|这|那)(?=.{1,})/u);
    if(m && !demonstrative){demonstrative='ni';s=s.slice(m[0].length);continue;}
    m=s.match(/^([一两二三四五1-5])(?:个|只|本|杯|份|条|颗|辆|张|款|片)?/u);
    if(m && !quantity){quantity=ZH_DATA.numbers[m[1]]||['','wan','tu','tu wan','tu tu','luka'][Number(m[1])];s=s.slice(m[0].length);zhNote(issues,'量词单位已简化，数量使用基础数词组合表达');continue;}
    if(s.startsWith('些')&&demonstrative&&!quantity){quantity='mute';s=s.slice(1);continue;}
    if(s.startsWith('一些')&&!quantity){quantity='mute';s=s.slice(2);continue;}
    const modifier=ZH_MOD_KEYS.find(k=>s.startsWith(k)&&s.length>k.length);
    if(modifier){adjectives.push(ZH_DATA.nounModifiers[modifier]);s=s.slice(modifier.length).replace(/^的/u,'');continue;}
    break;
  }
  if(!ZH_DATA.nouns[s])return {tp:unknownText(original),valid:false,unknown:original};
  if(ZH_DATA.broad[s])zhNote(issues,ZH_DATA.broad[s]);
  let base=ZH_DATA.nouns[s];
  const modifiers=[...adjectives.filter(a=>!a.includes(' ')),quantity,demonstrative,ownership].filter(Boolean);
  const groups=adjectives.filter(a=>a.includes(' ')).map(a=>'pi '+a);
  // Added qualifiers describe the head, never accidentally the tail of a pi group.
  const idx=base.indexOf(' pi ');
  if(idx>=0)base=[base.slice(0,idx),...modifiers,...groups,base.slice(idx+1)].filter(Boolean).join(' ');
  else base=[base,...modifiers,...groups].filter(Boolean).join(' ');
  return {tp:base,valid:true};
}
function couldStartPredicate(s){
  s=s.replace(/^就/u,'');
  return /^(不|没|没有|很|非常|特别|太|正在|已经|在|是|想|要|会|能|可以|喜欢|热|冷|好|坏|大|小|快乐|开心|难过|高兴|漂亮|有趣|好玩)/u.test(s)
    || ZH_VERBS.some(([k])=>s.startsWith(k))
    || Object.keys(ZH_DATA.adjectivals).some(k=>s.startsWith(k));
}
function getZhSubject(s,issues){
  for(let n=Math.min(s.length,40);n>=1;n--){
    const prefix=s.slice(0,n);const suffix=s.slice(n);
    if(!suffix||!couldStartPredicate(suffix))continue;
    const localIssues=[];const noun=getZhNoun(prefix,localIssues);
    if(noun.valid){for(const note of localIssues)zhNote(issues,note);return {subject:noun.tp,rest:suffix};}
  }
  return null;
}
function negatePredicate(predicate){
  if(!predicate || predicate.startsWith('⟦'))return predicate;
  // Attach ala exactly where the Chinese negative was encountered.
  return predicate.replace(/^(\S+)(?=\s|$)/u,'$1 ala');
}
function phrasePredicate(input, issues, depth=0){
  let s=input;
  if(depth>12)return {predicate:unknownText(input),valid:false,unknown:input};
  if(s.endsWith('了')){s=s.slice(0,-1);zhNote(issues,'「了」的变化／完成含义未明确表达');}
  if(s.startsWith('正在')||s.startsWith('已经')){
    const aspect=s.slice(0,2);
    zhNote(issues,aspect==='正在'?'正在进行的动作已简化，Toki Pona 不强制标记进行时':'「已经」表示的体貌未专门编码');
    return phrasePredicate(s.slice(2),issues,depth+1);
  }
  if(s.startsWith('没有')||s.startsWith('没')||s.startsWith('不')){
    const length=s.startsWith('没有')?2:1;
    let tail=s.slice(length);
    // 没有钱 means jo ala e mani; 没有喝水 means moku ala e telo.
    if(length===2 && !couldStartPredicate(tail))tail='有'+tail;
    if(tail.startsWith('是'))zhNote(issues,'名词谓语的否定使用词根组合近似表达，不能保留所有细微作用域');
    const parsed=phrasePredicate(tail,issues,depth+1);
    if(!parsed.valid && parsed.predicate.startsWith('⟦'))return {predicate:unknownText(input),valid:false,unknown:input};
    return {...parsed,predicate:negatePredicate(parsed.predicate)};
  }
  const modal=ZH_VERBS.find(([k,_,kind])=>kind==='modal'&&s.startsWith(k));
  if(modal){
    const tail=s.slice(modal[0].length);
    if(!tail)return {predicate:modal[1],valid:true};
    if(modal[1]==='wile'){
      const obj=getZhNoun(tail,issues);
      if(obj.valid)return {predicate:modal[1]+' e '+obj.tp,valid:true};
    }
    const parsed=phrasePredicate(tail,issues,depth+1);
    return {...parsed,predicate:modal[1]+' '+parsed.predicate};
  }
  let intensity='';
  for(const [k,v] of Object.entries(ZH_DATA.modifiers)){
    if(s.startsWith(k)){intensity=v;s=s.slice(k.length);break;}
  }
  if(s.startsWith('在')){
    const tail=s.slice(1);
    // The longest supported noun phrase is the location. A remaining action
    // must be translated completely; an unsupported tail remains visible.
    for(let n=Math.min(tail.length,40);n>=1;n--){
      const localNotes=[];
      const location=getZhNoun(tail.slice(0,n),localNotes);
      if(!location.valid)continue;
      localNotes.forEach(note=>zhNote(issues,note));
      const rest=tail.slice(n);
      if(!rest)return {predicate:'lon '+location.tp,valid:true};
      const following=phrasePredicate(rest,issues,depth+1);
      return {...following,predicate:following.predicate+' lon '+location.tp};
    }
    if(couldStartPredicate(tail)){
      zhNote(issues,'动作前的「在」表示进行时，未专门编码');
      return phrasePredicate(tail,issues,depth+1);
    }
    return {predicate:unknownText(input),valid:false,unknown:input};
  }
  if(s.startsWith('是')){
    const noun=getZhNoun(s.slice(1),issues);
    if(!noun.valid)return {predicate:unknownText(input),valid:false,unknown:input};
    return {predicate:noun.tp,valid:true};
  }
  for(const [k,tp] of Object.entries(ZH_DATA.adjectivals).sort((a,b)=>b[0].length-a[0].length)){
    if(s===k)return {predicate:tp+(intensity?' '+intensity:''),valid:true};
  }
  const verb=ZH_VERBS.find(([k,_,kind])=>!['modal','progress','like','weather'].includes(kind)&&s.startsWith(k));
  if(!verb)return {predicate:unknownText(input||'（空）'),valid:false,unknown:input||'（空）'};
  const [zh,tp,kind]=verb;
  let remainder=s.slice(zh.length);
  if(remainder.startsWith('了')){remainder=remainder.slice(1);zhNote(issues,'动作后的「了」未专门编码');}
  const vp=tp+(intensity?' '+intensity:'');
  if(ZH_DATA.broad[zh])zhNote(issues,ZH_DATA.broad[zh]);
  if(!remainder)return {predicate:vp,valid:true};
  if(kind==='play' && (remainder==='游戏'||remainder==='玩具')){
    zhNote(issues,'使用 musi 概括娱乐活动');
    return {predicate:vp,valid:true};
  }
  if(kind==='motion'){
    const destination=getZhNoun(remainder.replace(/^到/u,''),issues);
    return {predicate:vp+' '+destination.tp,valid:destination.valid,unknown:destination.unknown};
  }
  if(kind==='stay'){
    const place=getZhNoun(remainder.replace(/^(在|到)/u,''),issues);
    return {predicate:vp+' lon '+place.tp,valid:place.valid,unknown:place.unknown};
  }
  if(kind==='trans'||kind==='with'){
    const obj=getZhNoun(remainder,issues);
    return {predicate:[vp,kind==='trans'?'e':'',obj.tp].filter(Boolean).join(' '),valid:obj.valid,unknown:obj.unknown};
  }
  const loc=remainder.match(/^在(.+)$/u);
  if(loc){
    const place=getZhNoun(loc[1],issues);
    return {predicate:vp+' lon '+place.tp,valid:place.valid,unknown:place.unknown};
  }
  return {predicate:vp+' '+unknownText(remainder),valid:false,unknown:remainder};
}

function parseZhClause(input, depth=0){
  const issues=[];
  let s=input.trim().replace(/\s+/gu,'').replace(/^，|，$/gu,'');
  if(!s)return {tp:'',unknown:[],issues};
  const idiom=ZH_DATA.greetings[s];
  if(idiom)return {tp:idiom,unknown:[],issues};
  if(depth>4)return {tp:unknownText(s),unknown:[s],issues:['从句嵌套过深']};
  if(s.startsWith('如果')||s.startsWith('假如')){
    const match=s.match(/^(?:如果|假如)(.+?)[，,](?:那么|就)?(.+)$/u);
    if(!match)return {tp:unknownText(s),unknown:[s],issues:['条件句需要逗号分隔条件与结果']};
    const a=parseZhClause(match[1],depth+1),b=parseZhClause(match[2],depth+1);
    return {tp:`${a.tp} la ${b.tp}`.trim(),unknown:[...a.unknown,...b.unknown],issues:[...new Set([...a.issues,...b.issues])]};
  }
  if(s==='下雨'||s==='下雨了')return {tp:'telo li kama tan sewi',unknown:[],issues};
  if(s==='下雪'||s==='下雪了')return {tp:'telo lete li kama tan sewi',unknown:[],issues};
  // 位置疑问句；这里的 "哪里" 是方位语，而不是进行时。
  const where=s.match(/^(我|你|他|她|我们|你们|他们|她们)(?:在)?(哪里|哪儿|什么地方)$/u);
  if(where)return {tp:subjPredicate(ZH_DATA.nouns[where[1]],'lon ma seme'),unknown:[],issues};
  const who=s.match(/^(我|你|他|她|我们|你们|他们|她们)是谁$/u);
  if(who)return {tp:subjPredicate(ZH_DATA.nouns[who[1]],'jan seme'),unknown:[],issues};
  let background='';
  for(const k of ZH_TIME_KEYS){
    if(s.startsWith(k)){
      background=ZH_DATA.times[k];s=s.slice(k.length).replace(/^，/u,'');break;
    }
  }
  if(!s)return {tp:background,unknown:[],issues};
  const hasQuestion=s.endsWith('吗');
  if(hasQuestion)s=s.slice(0,-1);
  let subj=getZhSubject(s,issues);
  if(!subj){
    const idx=s.indexOf('和');
    if(idx>0){
      const localNotes=[];
      const first=getZhNoun(s.slice(0,idx),localNotes),second=getZhSubject(s.slice(idx+1),localNotes);
      if(first.valid&&second){
        localNotes.forEach(note=>zhNote(issues,note));
        subj={subject:first.tp+' en '+second.subject,rest:second.rest};
      }
    }
  }
  if(!subj){
    // 无显式主语的祈使：走 / 吃饭等。
    const directive=/^(请|不要|别)/u.test(s);
    if(directive){
      s=s.replace(/^请/u,'');
      let neg=/^(不要|别)/u.test(s);s=s.replace(/^(不要|别)/u,'');
      const parsed=phrasePredicate(s,issues);
      let pred=parsed.predicate;
      if(neg)pred=negatePredicate(pred);
      return {tp:(background?background+' la ':'')+'o '+pred,unknown:parsed.unknown?[parsed.unknown]:[],issues};
    }
    const noun=getZhNoun(s,issues);
    if(noun.valid)return {tp:(background?background+' la ':'')+noun.tp,unknown:[],issues};
    const fail=unknownText(s);
    return {tp:(background?background+' la ':'')+fail,unknown:[s],issues};
  }
  let rest=subj.rest.replace(/^就/u,'');
  const like=rest.match(/^(很|非常|特别|太)?(不喜欢|喜欢)(.+)$/u);
  let subject,predicate,unknown=[];
  if(like){
    const obj=getZhNoun(like[3],issues);
    subject=obj.tp;
    const quality=like[2]==='不喜欢'?'pona ala':'pona';
    predicate=quality+(like[1]?' mute':'')+' tawa '+subj.subject;
    if(obj.unknown)unknown.push(obj.unknown);
  } else {
    const parsed=phrasePredicate(rest,issues);
    subject=subj.subject;
    predicate=parsed.predicate;
    if(parsed.unknown)unknown.push(parsed.unknown);
  }
  if(hasQuestion && !unknown.length && !predicate.includes('seme')){
    const tokens=predicate.split(' ');
    const head=tokens[0];
    if(head && head!=='ala' && tokens[1]!=='ala')tokens.splice(1,0,'ala',head);
    else if(tokens[1]==='ala')tokens.push('anu','seme');
    predicate=tokens.join(' ');
  }
  const sentence=subjPredicate(subject,predicate);
  return {tp:(background?background+' la ':'')+sentence,unknown,issues};
}
function splitZhSentences(s){
  const matched=s.match(/[^。！？!?；;\n]+[。！？!?；;]?|\n/gu);
  return matched||[];
}
function chineseToToki(s){
  let output='', unknown=[],notes=[];
  for(const part of splitZhSentences(s)){
    if(part==='\n'){output+='\n';continue;}
    let raw=part.trim();if(!raw)continue;
    const last=raw.slice(-1), ends=/[。！？!?；;]/u.test(last);
    if(ends)raw=raw.slice(0,-1);
    let parsed;
    if(!/^(如果|假如)/u.test(raw) && /[，,]/u.test(raw)){
      const pieces=raw.split(/[，,]/u).filter(Boolean).map(t=>parseZhClause(t));
      parsed={tp:pieces.map(p=>p.tp).join(', '),unknown:pieces.flatMap(p=>p.unknown),issues:pieces.flatMap(p=>p.issues)};
    } else parsed=parseZhClause(raw);
    let punctuation=ends?({'。':'.','！':'!','？':'?','；':';'}[last]||last):'';
    if(raw.endsWith('吗')&&punctuation!== '?' )punctuation='?';
    if(!punctuation && /[?!]$/u.test(parsed.tp))punctuation=parsed.tp.slice(-1);
    const tp=parsed.tp.replace(/[.!?]+$/u,'').trim();
    output+=(output && !output.endsWith('\n')?' ':'')+tp+punctuation;
    unknown.push(...parsed.unknown);notes.push(...parsed.issues);
  }
  return {tp:output.trim(),unknown:[...new Set(unknown)],notes:[...new Set(notes)]};
}



function emojiKey(s){return String(s).replace(/[\uFE0E\uFE0F\u{1F3FB}-\u{1F3FF}]/gu,'');}
function splitText(s){return s.split(/(⟦[^⟧]*⟧|\s+|[.,!?;:，。！？；：()（）\[\]{}“”"'「」《》]+)/u);}
function isOnlySeparator(s){return !s||/^(\s+|[.,!?;:，。！？；：()（）\[\]{}“”"'「」《》]+)$/u.test(s);}
// 已有的 Toki Pona ↔ Emoji 是严格词根转写，不做中文推断。
function convert(s,dir){let unknown=[];const result=splitText(s).map(piece=>{
  if(isOnlySeparator(piece))return piece;
  let translated;
  if(dir==='forward')translated=byWord.get(DATA.aliases[piece.toLowerCase()]||piece.toLowerCase());
  else translated=byEmoji.get(emojiKey(piece));
  if(translated)return translated;
  const raw=piece.replace(/^⟦|⟧$/gu,'');
  unknown.push(raw);
  return unknownText(raw);
 }).join('');return {result,unknown};}

const emojiSegmenter=typeof Intl!=='undefined'&&typeof Intl.Segmenter==='function'
  ? new Intl.Segmenter(undefined,{granularity:'grapheme'}):null;

// Emoji-focused grapheme fallback: keep ZWJ, modifiers, keycaps, tag flags,
// regional-indicator pairs and combining marks attached to their base.
// It is intentionally conservative: an unknown complex symbol stays unknown.
function emojiGraphemes(input){
  if(emojiSegmenter)return Array.from(emojiSegmenter.segment(input),x=>x.segment);
  const points=Array.from(input),out=[];
  const code=p=>p.codePointAt(0);
  const regional=p=>code(p)>=0x1F1E6&&code(p)<=0x1F1FF;
  const extension=p=>/[\p{Mark}\uFE0E\uFE0F]/u.test(p)
    ||(code(p)>=0x1F3FB&&code(p)<=0x1F3FF)
    ||(code(p)>=0xE0020&&code(p)<=0xE007F);
  for(let i=0;i<points.length;i++){
    let cluster=points[i];
    if(cluster==='\r'&&points[i+1]==='\n'){out.push('\n');i++;continue;}
    if(regional(cluster)&&points[i+1]&&regional(points[i+1]))cluster+=points[++i];
    while(i+1<points.length){
      if(extension(points[i+1])){cluster+=points[++i];continue;}
      if(points[i+1]==='\u200D'){
        cluster+=points[++i];
        if(i+1<points.length)cluster+=points[++i];
        continue;
      }
      break;
    }
    out.push(cluster);
  }
  return out;
}

/** Decode connected emoji lexemes; unknown sequences and plain text stay visible. */
function decodeEmojiStrict(input){
  const segments=emojiGraphemes(input);
  let out='',word='',unknown=[];
  function add(token){out+=(out&&!/\s$/u.test(out)?' ':'')+token;}
  function push(){
    if(!word)return;
    const raw=word.replace(/^⟦|⟧$/gu,'');
    unknown.push(raw);add(unknownText(raw));word='';
  }
  for(const ch of segments){
    const tok=byEmoji.get(emojiKey(ch));
    if(tok){push();add(tok);continue;}
    if(ch==='\n'||ch==='\r\n'){push();out=out.replace(/[ \t]+$/u,'')+'\n';continue;}
    if(/^\s+$/u.test(ch)){push();if(out&&!/\s$/u.test(out))out+=' ';continue;}
    if(/^[.,!?;:，。！？；：()（）\[\]{}“”"'「」《》]$/u.test(ch)){
      push();out=out.replace(/[ \t]+$/u,'')+ch;continue;
    }
    if(/[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}\u20E3\u200D\u{1F3FB}-\u{1F3FF}]/u.test(ch)){
      push();unknown.push(ch);add(unknownText(ch));continue;
    }
    word+=ch;
  }
  push();
  return {tp:out.trim(),unknown:[...new Set(unknown)]};
}

function rootGloss(word){
  if(/^⟦[^⟧]*⟧$/u.test(word))return word;
  if(CN_PHRASE[word])return CN_PHRASE[word];
  if(CN_MODIFIER[word])return CN_MODIFIER[word];
  const entry=DATA.entries.find(e=>e.word===word);
  return entry?entry.meaning.split(/[、，]/u)[0]:unknownText(word);
}
function numberToChinese(words){
  const n=words.reduce((sum,w)=>sum+({wan:1,tu:2,luka:5})[w],0);
  return ['零','一','二','三','四','五','六','七','八','九','十'][n]||String(n);
}
/** Head-first noun phrases, grouped modifiers and ordered qualifiers. */
function nounToChinese(raw,notes=[]){
  let s=raw.trim();
  if(!s)return '（某物）';
  if(s.startsWith('⟦')&&s.endsWith('⟧'))return s;
  if(s.includes(' en '))return s.split(' en ').map(p=>nounToChinese(p,notes)).join('和');
  if(CN_PHRASE[s])return CN_PHRASE[s];
  const groups=s.split(' pi '),tokens=groups.shift().split(/\s+/u);
  let determiner='',possess='',numbers=[];
  while(tokens.length>1){
    const last=tokens[tokens.length-1];
    if(last==='ni'&&!determiner){tokens.pop();determiner='这个';continue;}
    if(['mi','sina','ona'].includes(last)&&!possess){tokens.pop();possess=({mi:'我的',sina:'你的',ona:'他/她的'})[last];continue;}
    if(['wan','tu','luka'].includes(last)){numbers.unshift(tokens.pop());continue;}
    break;
  }
  const reduced=[tokens.join(' '),...groups].join(' pi ');
  let base=CN_PHRASE[reduced];
  if(!base){
    let headLength=1;
    for(let n=tokens.length;n>=1;n--){
      const candidate=tokens.slice(0,n).join(' ');
      if(CN_PHRASE[candidate]){base=CN_PHRASE[candidate];headLength=n;break;}
    }
    if(!base)base=rootGloss(tokens[0]);
    for(const modifier of tokens.slice(headLength)){
      if(CN_MODIFIER[modifier])base=CN_MODIFIER[modifier]+base;
      else if(modifier==='ala')base='没有'+base;
      else {base+='（'+rootGloss(modifier)+'）';zhNote(notes,'部分修饰组合按宽泛词义解释');}
    }
    for(const group of groups){
      const words=group.split(/\s+/u);
      if(words.length<2){zhNote(notes,'pi 后需要至少两个词；该组合仅按字面释义');base+='（'+nounToChinese(group,notes)+'）';continue;}
      const known={'pona mute':'非常好','ike mute':'非常糟糕','sin ala':'不新的','kama sona':'学习','pana sona':'传授知识'};
      const description=known[group]||CN_TIME[group]||CN_PHRASE[group];
      if(description)base=description.replace(/的$/u,'')+'的'+base;
      else {base+='（相关：'+nounToChinese(group,notes)+'）';zhNote(notes,'部分 pi 组合仅能解释其相关概念');}
    }
  }
  const unit=({soweli:'只',waso:'只',kala:'只',akesi:'只',pipi:'只',telo:'份',moku:'份',lipu:'本',jan:'位',tomo:'座'})[tokens[0]]||'个';
  const number=numbers.length?numberToChinese(numbers):'';
  return possess+(determiner?(number?'这':'这个'):'')+(number?(number==='二'?'两':number)+unit:'')+base;
}

function negateChinese(content){
  if(content.startsWith('有'))return '没'+content;
  if(content.startsWith('很好'))return '不太好'+content.slice(2);
  if(content.startsWith('很'))return '不'+content.slice(1);
  if(content.startsWith('是'))return '不'+content;
  return '不'+content;
}

/** A limited compositional sentence renderer; uncertainties remain visible. */
function predicateToChinese(predicate,notes=[]){
  let s=predicate.trim(),isYesNo=false;
  const q=s.match(/^([a-z]+) ala \1(?:\s+|$)(.*)$/u);
  if(q){s=[q[1],q[2]].filter(Boolean).join(' ');isYesNo=true;}
  if(s.endsWith(' anu seme')){s=s.slice(0,-9);isYesNo=true;}
  const parts=s.split(/\s+e\s+/u),coreAndPreps=parts.shift().trim();
  let core=coreAndPreps,objects=parts,prepositions=[];
  // Only the final direct object can be followed by sentence-level prepositions.
  // For a predicate with no e, lon/kepeken/tawa may themselves be the predicate.
  const splitPreps=chunk=>{
    const chunks=chunk.split(/\s+(lon|tawa|tan|kepeken|sama)\s+/u);
    const head=chunks.shift();
    for(let i=0;i<chunks.length;i+=2)prepositions.push([chunks[i],chunks[i+1]||'']);
    return head;
  };
  if(objects.length)objects[objects.length-1]=splitPreps(objects[objects.length-1]);
  else if(!/^(lon|tawa|kepeken|sama|tan)(?:\s|$)/u.test(core))core=splitPreps(core);
  const objectZH=objects.map(p=>nounToChinese(p,notes)).join('和');
  let modal='',negative=false;
  for(let round=0;round<4;round++){
    const match=core.match(/^(wile|ken|open)( ala)?\s+(.+)$/u);
    if(!match)break;
    modal+=({wile:match[2]?'不想':'想',ken:match[2]?'不能':'可以',open:match[2]?'不开始':'开始'})[match[1]];
    core=match[3];
  }
  // wile e ... is a direct want, rather than an inferred extra action.
  if(/^wile(?: ala)?$/u.test(core)){modal+=core.endsWith('ala')?'不想要':'想要';core='';}
  const no=core.match(/^([a-z]+) ala(?=\s|$)/u);
  if(no){negative=true;core=core.replace(/^([a-z]+) ala(?=\s|$)/u,'$1');}
  let content='';
  if(!core)content=objectZH;
  else if(core==='lon'||core.startsWith('lon '))content='在'+nounToChinese(core.slice(3),notes);
  else if(core==='kepeken'||core.startsWith('kepeken '))content='使用'+(core.length>7?nounToChinese(core.slice(8),notes):objectZH);
  else if(core==='tawa wawa')content='跑步';
  else if(core==='tawa')content='移动';
  else if(core.startsWith('tawa '))content='去'+nounToChinese(core.slice(5),notes);
  else if(core==='pilin pona'||core==='pilin pona mute')content=core.endsWith('mute')?'很开心':'开心';
  else if(core==='pilin ike')content='难过';
  else if(core==='kama sona')content='学习'+objectZH;
  else if(core==='alasa sona')content='研究'+objectZH;
  else if(core==='pana pona')content='帮助'+objectZH;
  else if(core==='pona'||core==='pona mute')content=core==='pona'?'很好':'非常好';
  else if(core==='ike'||core==='ike mute')content=core==='ike'?'不好':'非常糟糕';
  else if(core==='musi'||core==='musi mute')content=objectZH?'玩'+objectZH:(core==='musi'?'有趣':'很有趣');
  else if(/^(suli|lili|lete|seli|sin|wawa|suwi|jaki|nasa|pimeja|walo) mute$/u.test(core))content='非常'+CN_ADJ[core.split(' ')[0]].replace(/^很/u,'');
  else if(core==='moku')content=(objects[0]?.startsWith('telo')?'喝':'吃')+objectZH;
  else if(core==='awen'&&objectZH)content='保护'+objectZH;
  else if(core==='esun'){content='交易'+objectZH;zhNote(notes,'esun 不能单独区分买与卖');}
  else if(CN_VERB[core])content=CN_VERB[core]+objectZH;
  else if(CN_ADJ[core])content=CN_ADJ[core];
  else if(!objectZH&&byWord.has(core.split(' ')[0]))content='是'+nounToChinese(core,notes);
  else {
    content=core.split(' ').map(rootGloss).join('·')+(objectZH?'（对象：'+objectZH+'）':'');
    zhNote(notes,'此谓语超出已覆盖句型，仅提供词义近似解释');
  }
  if(negative)content=negateChinese(content);
  content=modal+content;
  for(const [prep,phrase] of prepositions){
    const value=nounToChinese(phrase,notes);
    if(prep==='lon')content=content==='待着'?'待在'+value:'在'+value+content;
    else if(prep==='tan')content+='，来自／因为'+value;
    else if(prep==='kepeken')content+='，使用'+value;
    else if(prep==='sama')content+='，像'+value;
    else if(prep==='tawa')content+='，给／朝向'+value;
  }
  return {content,isYesNo};
}

function clauseToChinese(input,notes=[]){
  let s=input.trim().replace(/\s+/gu,' ');
  if(!s)return '';
  const fixed={'toki':'你好','sina pona':'你很好','sina pona mute':'你非常好','mi sona ala':'我不知道','mi olin e sina':'我爱你','o tawa':'走吧','o lape pona':'好好睡觉','ni li seme':'这是什么','telo li kama tan sewi':'下雨','telo lete li kama tan sewi':'下雪'};
  if(fixed[s])return fixed[s];
  if(s.startsWith('o '))return '请'+predicateToChinese(s.slice(2),notes).content.replace(/^不(?!要)/u,'不要');
  const imperative=s.indexOf(' o');
  if(imperative>0)return nounToChinese(s.slice(0,imperative),notes)+'，请'+predicateToChinese(s.slice(imperative+2).trim(),notes).content.replace(/^不(?!要)/u,'不要');
  let subject='',pred='';
  if(s.includes(' li ')){const idx=s.indexOf(' li ');subject=s.slice(0,idx);pred=s.slice(idx+4);}
  else if(/^(mi|sina)\s/u.test(s)){const m=s.match(/^(mi|sina)\b/u);subject=m[0];pred=s.slice(m[0].length).trim();}
  else {zhNote(notes,'未识别完整主谓结构，按名词短语或词义近似解释');return nounToChinese(s,notes);}
  const subjectZH=nounToChinese(subject,notes);
  const like=pred.match(/^(pona|ike)( ala)?(?: mute)? tawa (mi|sina|ona)$/u);
  if(like)return ({mi:'我',sina:'你',ona:'他/她'})[like[3]]+(like[1]==='ike'||like[2]?'不喜欢':'喜欢')+subjectZH;
  const predicates=pred.split(' li ').map(p=>predicateToChinese(p,notes));
  return subjectZH+predicates.map(p=>p.content).join('，并且')+(predicates.some(p=>p.isYesNo)?'吗':'');
}

function contextualClauseToChinese(body,notes){
  const index=body.indexOf(' la ');
  if(index<0){
    return body.split(/[,，]/u).map(p=>clauseToChinese(p,notes)).join('，');
  }
  const context=body.slice(0,index),main=body.slice(index+4);
  if(CN_TIME[context])return CN_TIME[context]+'，'+contextualClauseToChinese(main,notes);
  zhNote(notes,'la 的背景关系可能是条件或语境，这里使用近似表达');
  const rendered=clauseToChinese(context,notes);
  return (/ li |^(?:mi|sina) /u.test(context)?'如果'+rendered:'在'+rendered+'的情况下')+'，'+contextualClauseToChinese(main,notes);
}

function tokiToChinese(text){
  const notes=[],unknown=[];
  // Protect unknown placeholders so punctuation inside them is not parsed.
  const parts=text.match(/(?:⟦[^⟧]*⟧|[^.!?;\n。！？；])+[.!?;。！？；]?|\n/gu)||[];
  let result='';
  for(const part of parts){
    if(part==='\n'){result=result.replace(/[ \t]+$/u,'')+'\n';continue;}
    let body=part.trim();if(!body)continue;
    const punct=body.match(/[.!?;。！？；]$/u)?.[0]||'';
    if(punct)body=body.slice(0,-1).trim();
    const converted=contextualClauseToChinese(body,notes);
    for(const match of converted.matchAll(/⟦([^⟧]*)⟧/gu))unknown.push(match[1]);
    const isQuestion=/[?？]/u.test(punct)||converted.endsWith('吗');
    result+=converted+(isQuestion?'？':/[!！]/u.test(punct)?'！':'。');
  }
  return {result:result.trim(),unknown:[...new Set(unknown)],notes:[...new Set(notes)]};
}

function encode(source) { const r = convert(String(source), 'forward'); return { ...r, tp: String(source), notes: [] }; }
function decode(source) { const r = decodeEmojiStrict(String(source)); return { ...r, result: r.tp, notes: [] }; }
function translate(source, mode) {
 source = String(source || '');
 if(mode === 'zh') { const s = chineseToToki(source); const r = encode(s.tp); return {result:r.result,tp:s.tp,unknown:[...new Set([...s.unknown,...r.unknown])],notes:s.notes}; }
 if(mode === 'forward') return encode(source);
 if(mode === 'reverse') return decode(source);
 if(mode === 'emoji_zh') { const decoded=decode(source); const cn=tokiToChinese(decoded.tp); return {result:cn.result,tp:decoded.tp,unknown:[...new Set([...decoded.unknown,...cn.unknown])],notes:['中文是根据词根与句型生成的近似释义，不能还原原文。',...cn.notes]}; }
 throw new Error('Unknown translation mode: '+mode);
}
global.PonaMojiEngine = { translate, encode, decode, chineseToToki, tokiToChinese, emojiKey };
})(typeof window !== 'undefined' ? window : globalThis);
