/* UI only. Dictionary and translation rules live in data.js / engine.js. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const data = globalThis.PonaMojiData;
  const engine = globalThis.PonaMojiEngine;
  if (!data || !engine) {
    $('feedback').hidden = false;
    $('feedback').classList.add('warning');
    $('status').textContent = '翻译词典未能加载，请刷新页面。';
    return;
  }
  const labels = {zh:'中文', tp:'Toki Pona', emoji:'PonaMoji · Emoji'};
  const drafts = {zh:'', tp:'', emoji:''};
  let sourceLanguage = 'zh', targetLanguage = 'emoji', latest = null;
  let expanded = false, composing = false, updateTimer, toastTimer;
  let zhMode = 'model', modelReady = false, modelBusy = false;
  let requestVersion = 0, modelController = null, statusLoading = false, statusTimer;
  let modelStatusMessage = '正在连接本地模型服务…';
  const wordMap = new Map(data.entries.map(entry => [entry.word, entry]));
  const systemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
  let savedTheme = null;
  try {savedTheme = localStorage.getItem('ponamoji-theme');} catch (_) { /* Storage can be disabled. */ }
  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    $('theme').setAttribute('aria-label',theme === 'dark' ? '切换浅色模式' : '切换深色模式');
    $('theme').title = $('theme').getAttribute('aria-label');
    $('theme').setAttribute('aria-pressed', String(theme === 'dark'));
    document.querySelector('meta[name="theme-color"]').content = theme === 'dark' ? '#161d18' : '#f6f7f2';
  }
  applyTheme(savedTheme === 'dark' || savedTheme === 'light' ? savedTheme : (systemDark && systemDark.matches ? 'dark' : 'light'));
  $('theme').addEventListener('click', () => {
    savedTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(savedTheme);
    try {localStorage.setItem('ponamoji-theme',savedTheme);} catch (_) {}
  });
  const systemChanged = event => {if (!savedTheme) applyTheme(event.matches ? 'dark' : 'light');};
  if (systemDark) {
    if (systemDark.addEventListener) systemDark.addEventListener('change',systemChanged);
    else if (systemDark.addListener) systemDark.addListener(systemChanged);
  }
  function toast(message) {
    clearTimeout(toastTimer);
    $('toast').textContent = message;
    $('toast').hidden = false;
    toastTimer = setTimeout(() => {$('toast').hidden = true;}, 2600);
  }
  function mode() {return sourceLanguage === 'zh' ? 'zh' : sourceLanguage === 'tp' ? 'forward' : targetLanguage === 'zh' ? 'emoji_zh' : 'reverse';}
  function usesModel() {return sourceLanguage === 'zh' && zhMode === 'model';}
  function syncModelControls() {
    const active = usesModel();
    $('localControls').hidden = sourceLanguage !== 'zh';
    $('modelService').hidden = !active;
    $('translate').hidden = !active;
    $('translate').disabled = !modelReady || modelBusy || !$('source').value.trim() || composing;
    $('translate').textContent = modelBusy ? '正在翻译…' : '翻译';
    $('liveLabel').textContent = active ? '点击翻译 · Ctrl / ⌘ + Enter' : '输入即翻译 ↗';
    $('modelStatus').textContent = modelStatusMessage;
    $('serviceDot').classList.toggle('ready', modelReady);
    $('refreshStatus').disabled = statusLoading;
  }
  async function refreshModelStatus() {
    if (statusLoading) return;
    clearTimeout(statusTimer);
    statusLoading = true;
    syncModelControls();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch('/api/status', {signal:controller.signal, cache:'no-store'});
      if (!response.ok) throw new Error('无法读取状态');
      const service = await response.json();
      if (service.application !== 'PonaMoji-local') throw new Error('服务身份不匹配');
      modelReady = service.ready === true;
      const device = service.device === 'cuda' ? 'GPU' : 'CPU';
      modelStatusMessage = modelReady ? '本地双模型已就绪 · '+device+' · 无远程翻译 API'
        : service.error ? '模型服务未就绪：'+service.error
        : '本地模型正在准备'+(service.phase ? ' · '+service.phase : '')+'，请稍候。';
    } catch (_) {
      modelReady = false;
      modelStatusMessage = '本地服务未连接。请运行启动脚本，并通过它给出的本地网址打开页面。';
    } finally {
      clearTimeout(timeout);
      statusLoading = false;
      syncModelControls();
      statusTimer = setTimeout(refreshModelStatus, modelReady ? 15000 : 5000);
    }
  }
  function invalidateModelRequest() {
    ++requestVersion;
    if (modelController) modelController.abort();
    modelController = null;
    modelBusy = false;
    clearTimeout(updateTimer);
  }
  function setTargets(preferred) {
    const available = sourceLanguage === 'emoji' ? ['zh','tp'] : ['emoji'];
    targetLanguage = available.includes(preferred) ? preferred : available[0];
    $('to').replaceChildren();
    for (const value of available) {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = labels[value];
      $('to').appendChild(option);
    }
    $('to').value = targetLanguage;
    $('outputBadge').textContent = targetLanguage === 'emoji' ? 'EMOJI' : targetLanguage === 'zh' ? '近似释义' : 'TOKI PONA';
    $('source').placeholder = sourceLanguage === 'zh' ? '输入你想说的话…' : sourceLanguage === 'tp' ? 'mi olin e sina.' : '🙋 ❤️ 🎯 🫵.';
    $('source').setAttribute('aria-label','输入 · '+labels[sourceLanguage]);
    $('inputHint').textContent = sourceLanguage === 'zh' ? '试试「我想喝水。」' : sourceLanguage === 'tp' ? '词根之间请用空格分隔' : '支持空格分词，也支持 Emoji 连写';
    $('result').className = targetLanguage === 'emoji' ? 'emoji-output' : targetLanguage === 'tp' ? 'tp-output' : 'text-output';
    syncModelControls();
  }
  function renderBridge(tp) {
    $('bridge').hidden = !tp || sourceLanguage === 'tp' || targetLanguage === 'tp';
    $('intermediate').textContent = tp || '';
    $('tokens').replaceChildren();
    const roots = (tp || '').match(/[a-z]+/g) || [];
    for (const root of roots.slice(0,60)) {
      const entry = wordMap.get(root);
      if (!entry) continue;
      const token = document.createElement('span');
      token.className = 'token';
      token.title = entry.meaning;
      const glyph = document.createElement('span');
      glyph.textContent = entry.emoji;
      token.append(glyph,document.createTextNode(root));
      $('tokens').appendChild(token);
    }
  }
  function clearResult(message) {
    latest = null;
    $('result').textContent = '';
    $('result').hidden = true;
    $('resultPlaceholder').hidden = false;
    $('resultPlaceholder').querySelector('p').textContent = message || '你的想法，可以很简单。';
    $('feedback').hidden = true;
    $('bridge').hidden = true;
    $('englishBridge').hidden = true;
    $('englishIntermediate').textContent = '';
    $('copy').disabled = true;
    $('resultMeta').textContent = message || '等你输入第一句话';
  }
  function showFeedback(message, warning) {
    $('feedback').hidden = false;
    $('feedback').classList.toggle('warning', Boolean(warning));
    $('feedbackIcon').textContent = warning ? '!' : '…';
    $('status').textContent = message;
    $('notes').replaceChildren();
    $('notes').hidden = true;
  }
  function renderTranslation(translation, fromModel) {
    latest = translation;
    const unknown = [...new Set(latest.unknown || [])];
    const notes = [...new Set(latest.notes || [])];
    $('result').textContent = latest.result;
    $('result').hidden = !latest.result;
    $('resultPlaceholder').hidden = Boolean(latest.result);
    $('copy').disabled = !latest.result;
    $('feedback').hidden = false;
    $('feedback').classList.toggle('warning',unknown.length > 0);
    $('feedbackIcon').textContent = unknown.length ? '!' : '✓';
    $('status').textContent = unknown.length
      ? '未能完整翻译：' + unknown.slice(0,5).map(word => '⟦' + word + '⟧').join('、') + (unknown.length > 5 ? '等' : '') + '。请改用更简单的表达；括号内容尚未翻译。'
      : mode() === 'emoji_zh' ? '已生成中文近似释义。词根含义宽泛，无法还原原句全部细节。'
      : fromModel ? '已通过本地中→英、英→Toki Pona 模型转换，再按固定词典生成 Emoji。模型结果可能有误，请查看中间表达。'
      : mode() === 'zh' ? '已按浏览器词典与句型规则转换。复杂概念可能经过简化。'
      : '固定词根转写完成 · 保留原有 120 词根映射。';
    $('notes').replaceChildren();
    for (const note of notes) {const item = document.createElement('li');item.textContent = note;$('notes').appendChild(item);}
    $('notes').hidden = notes.length === 0;
    $('resultMeta').textContent = unknown.length ? '包含未翻译内容' : fromModel ? '本地双模型 · '+(Number.isFinite(latest.elapsed_ms) ? (latest.elapsed_ms / 1000).toFixed(1)+' 秒' : '已完成') : targetLanguage === 'zh' ? '中文 · 规则近似释义' : targetLanguage === 'tp' ? 'Toki Pona · 固定转写' : 'PonaMoji · 规则转换';
    renderBridge(latest.tp);
    $('englishBridge').hidden = !fromModel || !latest.english;
    $('englishIntermediate').textContent = fromModel ? latest.english || '' : '';
  }
  function update() {
    invalidateModelRequest();
    const source = $('source').value;
    drafts[sourceLanguage] = source;
    $('charCount').textContent = Array.from(source).length + ' / 3000';
    syncModelControls();
    if (!source.trim()) {clearResult();return;}
    if (usesModel()) {
      clearResult(modelReady ? '点击“翻译”，生成本地模型结果。' : '等待本地模型服务就绪。');
      return;
    }
    let translation;
    try {translation = engine.translate(source,mode());}
    catch (_) {translation = {result:'',tp:'',unknown:[source],notes:['当前内容无法处理，请缩短句子或更换表达。']};}
    renderTranslation(translation, false);
  }
  async function translateModel() {
    if (!usesModel() || modelBusy || composing || !$('source').value.trim()) return;
    if (!modelReady) {showFeedback('本地模型尚未就绪，请查看服务状态。也可手动选择规则模式。', true);return;}
    invalidateModelRequest();
    const source = $('source').value;
    const version = requestVersion;
    const controller = new AbortController();
    modelController = controller;
    modelBusy = true;
    clearResult('电脑正在翻译，请稍候…');
    showFeedback('本地模型正在处理。首次推理或较长文本可能需要较久；修改输入会停止等待旧结果。', false);
    syncModelControls();
    try {
      const response = await fetch('/api/translate', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({text:source}), signal:controller.signal});
      let translation;
      try {translation = await response.json();} catch (_) {throw new Error('本地服务返回了无法读取的响应。');}
      if (!response.ok) throw new Error(typeof translation.detail === 'string' ? translation.detail : '本地翻译失败，请查看服务窗口。');
      if (typeof translation.result !== 'string' || typeof translation.tp !== 'string' || typeof translation.english !== 'string' || !Array.isArray(translation.unknown) || !Array.isArray(translation.notes)) throw new Error('本地服务的响应格式不完整。');
      if (version !== requestVersion || source !== $('source').value || !usesModel()) return;
      renderTranslation(translation, true);
    } catch (error) {
      if (version !== requestVersion || error.name === 'AbortError') return;
      clearResult('未能完成本地模型翻译。');
      showFeedback(error.message || '无法连接本地服务，请确认启动脚本仍在运行。', true);
      refreshModelStatus();
    } finally {
      if (version === requestVersion) {
        modelBusy = false;
        modelController = null;
        syncModelControls();
      }
    }
  }
  $('source').addEventListener('compositionstart',() => {composing = true;invalidateModelRequest();clearResult('正在输入…');syncModelControls();});
  $('source').addEventListener('compositionend',() => {composing = false;update();});
  $('source').addEventListener('input',() => {
    invalidateModelRequest();
    clearResult(usesModel() ? '输入已变化，点击“翻译”生成新结果。' : '正在转换…');
    $('charCount').textContent = Array.from($('source').value).length + ' / 3000';
    syncModelControls();
    if (!composing) {
      if (usesModel()) update();
      else updateTimer = setTimeout(update, 100);
    }
  });
  $('source').addEventListener('keydown',event => {if ((event.ctrlKey || event.metaKey) && event.key === 'Enter' && usesModel()) {event.preventDefault();translateModel();}});
  $('zhMode').addEventListener('change',() => {zhMode = $('zhMode').value;update();});
  $('translate').addEventListener('click',translateModel);
  $('refreshStatus').addEventListener('click',refreshModelStatus);
  $('from').addEventListener('change',() => {
    drafts[sourceLanguage] = $('source').value;
    sourceLanguage = $('from').value;
    $('source').value = drafts[sourceLanguage];
    setTargets(targetLanguage);renderExamples();update();
  });
  $('to').addEventListener('change',() => {targetLanguage = $('to').value;setTargets(targetLanguage);renderExamples();update();});
  $('swap').addEventListener('click',() => {
    const oldSource = sourceLanguage, oldTarget = targetLanguage;
    const result = latest ? latest.result : drafts[oldTarget];
    sourceLanguage = oldTarget;
    $('from').value = sourceLanguage;
    setTargets(oldSource);
    $('source').value = result || '';
    renderExamples();update();
    if (result && result.includes('⟦')) toast('结果含未翻译内容，反向转换仍会提示。');
  });
  $('clear').addEventListener('click',() => {$('source').value = '';update();$('source').focus();});
  $('copy').addEventListener('click',async () => {
    if (!latest || !latest.result) return;
    let copied = false;
    try {await navigator.clipboard.writeText(latest.result);copied = true;}
    catch (_) {
      const area = document.createElement('textarea');
      area.value = latest.result;area.readOnly = true;
      area.style.cssText = 'position:fixed;left:-9999px;top:0;';
      document.body.appendChild(area);area.select();area.setSelectionRange(0,area.value.length);
      try {copied = document.execCommand('copy');} catch (_) {}
      area.remove();
    }
    toast(copied ? '已复制翻译结果' : '浏览器未允许复制，请选择结果后手动复制。');
    if (copied) {$('copyLabel').textContent = '已复制';setTimeout(() => {$('copyLabel').textContent = '复制结果';},1800);}
  });
  const examples = [
    {zh:'我爱你。',tp:'mi olin e sina.',icon:'❤️',hint:'表达心意'},
    {zh:'我想喝水。',tp:'mi wile moku e telo.',icon:'💧',hint:'说说你的需要'},
    {zh:'今天我回家。',tp:'tenpo suno ni la mi tawa tomo.',icon:'🏠',hint:'加上一点时间'},
    {zh:'你想吃面包吗？',tp:'sina wile ala wile moku e pan?',icon:'🍞',hint:'问一个简单问题'},
    {zh:'猫在家里睡觉。',tp:'soweli li lape lon tomo.',icon:'🐾',hint:'概念也可以简化'},
    {zh:'如果下雨，我就待在家里。',tp:'telo li kama tan sewi la mi awen lon tomo.',icon:'☀️',hint:'试试简单条件句'}
  ];
  function renderExamples() {
    $('examples').replaceChildren();
    for (const example of examples) {
      const text = sourceLanguage === 'zh' ? example.zh : sourceLanguage === 'tp' ? example.tp : engine.translate(example.tp,'forward').result;
      const button = document.createElement('button');button.type = 'button';button.className = 'example';
      const glyph = document.createElement('span');glyph.className = 'example-glyph';glyph.textContent = example.icon;
      const copy = document.createElement('span');copy.className = 'example-copy';
      const title = document.createElement('span');title.className = 'example-text';title.textContent = sourceLanguage === 'zh' ? example.zh : text;
      const hint = document.createElement('span');hint.className = 'example-hint';hint.textContent = sourceLanguage === 'zh' ? example.hint : example.zh;
      copy.append(title,hint);button.append(glyph,copy);button.title = text;
      button.addEventListener('click',() => {$('source').value = text;update();$('source').focus();});
      $('examples').appendChild(button);
    }
  }
  for (const category of [...new Set(data.entries.map(entry => entry.category))]) {
    const option = document.createElement('option');option.value = category;option.textContent = category;$('category').appendChild(option);
  }
  function renderWords() {
    const query = engine.emojiKey($('search').value.trim().toLowerCase());
    const category = $('category').value;
    const entries = data.entries.filter(entry => (category === '全部' || entry.category === category) && (!query || [entry.word,entry.emoji,entry.meaning,entry.category].some(value => engine.emojiKey(value.toLowerCase()).includes(query))));
    const filtered = Boolean(query || category !== '全部');
    const shown = expanded || filtered ? entries : entries.slice(0,24);
    $('dictCount').textContent = filtered ? entries.length + ' / 120 个词根' : '120 个词根';
    $('words').replaceChildren();
    for (const entry of shown) {
      const card = document.createElement('button');card.type = 'button';card.className = 'word-card';card.title = '插入 '+entry.word+' · '+entry.meaning;
      for (const [className,value] of [['word-glyph',entry.emoji],['word-name',entry.word],['word-meaning',entry.meaning],['word-category',entry.category]]) {
        const span = document.createElement('span');span.className = className;span.textContent = value;card.appendChild(span);
      }
      card.addEventListener('click',() => {
        if (sourceLanguage === 'zh') {
          drafts.zh = $('source').value;sourceLanguage = 'tp';$('from').value = 'tp';setTargets('emoji');$('source').value = drafts.tp;renderExamples();
          toast('已切换到 Toki Pona，插入词根 '+entry.word);
        }
        const token = sourceLanguage === 'tp' ? entry.word : entry.emoji;
        const text = $('source').value.trimEnd();
        if (text.length + token.length + 1 > 3000) {toast('输入已达到长度上限，请先缩短内容。');return;}
        $('source').value = text + (text ? ' ' : '') + token;
        update();$('source').focus();$('translator').scrollIntoView({behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
      });
      $('words').appendChild(card);
    }
    $('noWords').hidden = entries.length !== 0;
    $('expandWords').hidden = filtered;
    $('expandWords').textContent = expanded ? '收起词典 ↑' : '展开全部 120 个词根 ↓';
  }
  $('expandWords').addEventListener('click',() => {expanded = !expanded;renderWords();});
  $('search').addEventListener('input',renderWords);
  $('category').addEventListener('change',renderWords);
  setTargets('emoji');renderExamples();renderWords();update();refreshModelStatus();
})();
