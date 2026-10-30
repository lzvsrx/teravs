import source from './locales/source.json';
import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import ar from './locales/ar.json';
import zh from './locales/zh.json';
import './language.css';

const included: Record<string, string[]> = { 'pt-BR': source, en, es, fr, ar, 'zh-Hans': zh };
export const includedLanguages = [
  ['pt-BR', 'Português (Brasil)'], ['en', 'English'], ['es', 'Español'],
  ['fr', 'Français'], ['ar', 'العربية'], ['zh-Hans', '简体中文']
];
const automaticLanguages = ['bg','bn','cs','da','de','el','fi','he','hi','hr','hu','id','it','ja','kn','ko','lt','mr','nl','no','pl','ro','ru','sk','sl','sv','sw','ta','te','th','tr','uk','vi','zh-Hant'];
const index = new Map(source.map((key, i) => [key, i]));
const skip = 'script,style,[translate="no"],#profile-email,#messages article p,#messages .source-link,#memory-list article p';
const attributes = ['placeholder', 'aria-label', 'data-prompt', 'title'];
let dictionary = source;
let locale = 'pt-BR';
let selected = 'auto';
let generation = 0;
let mounted = false;
const records = new WeakMap<Node, Map<string, { source: string; output: string }>>();
const sourceVersion = JSON.stringify(source);
function cached(code: string): string[] | undefined {
  try {
    const data = JSON.parse(localStorage.getItem('teravs.translation.' + code) || 'null');
    if (data?.source === sourceVersion && Array.isArray(data.strings) && data.strings.length === source.length && data.strings.every((s: unknown) => typeof s === 'string' && s.trim())) return data.strings;
  } catch { /* Ignore invalid or unavailable caches. */ }
}

function normalize(code: string): string {
  if (code.toLowerCase().startsWith('pt')) return 'pt-BR';
  if (/^zh-(tw|hk|mo|hant)/i.test(code)) return 'zh-Hant';
  if (/^zh/i.test(code)) return 'zh-Hans';
  return code.split('-')[0].toLowerCase();
}
function deviceLocale() {
  for (const code of navigator.languages || [navigator.language]) {
    const normalized = normalize(code);
    if (included[normalized]) return normalized;
  }
  return 'pt-BR';
}
try { selected = localStorage.getItem('teravs.language') || 'auto'; } catch { /* Storage is optional. */ }
if (selected !== 'auto' && !included[selected] && !automaticLanguages.includes(selected)) selected = 'auto';
locale = selected === 'auto' ? deviceLocale() : selected;
dictionary = included[locale] || cached(locale) || source;

export function currentLanguage() { return locale; }
export function t(key: string, values: Record<string, string | number> = {}) {
  const position = index.get(key);
  const text = position === undefined ? key : dictionary[position] || key;
  return text.replace(/\{(\w+)\}/g, (match, name) => Object.hasOwn(values, name) ? String(values[name]) : match);
}
function translated(value: string) {
  const trimmed = value.trim();
  let text = t(trimmed);
  const count = /^(\d+) memória\(s\) salvas\.$/.exec(trimmed);
  const http = /^O serviço retornou HTTP (\d+)$/.exec(trimmed);
  if (count) text = t('{count} memória(s) salvas.', { count: new Intl.NumberFormat(locale).format(Number(count[1])) });
  if (http) text = t('O serviço retornou HTTP {code}', { code: http[1] });
  return value.slice(0, value.indexOf(trimmed)) + text + value.slice(value.indexOf(trimmed) + trimmed.length);
}
function valueFor(node: Node, slot: string, current: string) {
  let slots = records.get(node);
  if (!slots) { slots = new Map(); records.set(node, slots); }
  const old = slots.get(slot);
  const original = old && old.output === current ? old.source : current;
  const output = translated(original);
  slots.set(slot, { source: original, output });
  return output;
}
function refresh() {
  document.documentElement.lang = locale;
  document.documentElement.dir = /^(ar|he|fa|ur)(-|$)/.test(locale) ? 'rtl' : 'ltr';
  document.title = t('Teravs — inteligência que inclui');
  document.querySelector('meta[name="description"]')?.setAttribute('content', t('Teravs: um assistente inclusivo para criar, aprender e trabalhar, com o companheiro Elo.'));
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node: Node | null;
  while ((node = walker.nextNode())) {
    if (!node.parentElement || node.parentElement.closest(skip) || !node.textContent?.trim()) continue;
    const value = valueFor(node, 'text', node.textContent);
    if (node.textContent !== value) node.textContent = value;
  }
  document.body.querySelectorAll<HTMLElement>('[placeholder],[aria-label],[data-prompt],[title]').forEach(element => {
    if (element.closest(skip)) return;
    for (const name of attributes) {
      const current = element.getAttribute(name);
      if (!current) continue;
      const value = valueFor(element, name, current);
      if (value !== current) element.setAttribute(name, value);
    }
  });
}
function remember(code: string) { selected = code; try { localStorage.setItem('teravs.language', code); } catch { /* Storage is optional. */ } }
type TranslatorInstance = { translate(text: string): Promise<string>; destroy(): void };
type TranslatorFactory = {
  availability(options: { sourceLanguage: string; targetLanguage: string }): Promise<string>;
  create(options: { sourceLanguage: string; targetLanguage: string }): Promise<TranslatorInstance>;
};
async function apply(code: string) {
  const request = ++generation;
  const target = code === 'auto' ? deviceLocale() : code;
  const status = document.querySelector<HTMLElement>('#language-status')!;
  const controls = document.querySelectorAll<HTMLInputElement | HTMLButtonElement>('#language-panel select,#language-panel button');
  controls.forEach(e => e.disabled = true);
  try {
    let next = included[target] || cached(target);
    if (!next) {
      const factory = (globalThis as typeof globalThis & { Translator?: TranslatorFactory }).Translator;
      if (!factory || await factory.availability({ sourceLanguage: 'pt', targetLanguage: target }) === 'unavailable') {
        status.textContent = 'Este idioma não está disponível neste aparelho. Escolha uma tradução incluída.';
        return;
      }
      status.textContent = 'O download de tradução pode demorar. Aguarde.';
      const translator = await factory.create({ sourceLanguage: 'pt', targetLanguage: target });
      next = [];
      try {
        for (const key of source) {
          const result = await translator.translate(key);
          if (!result.trim() || /\{\w+\}/g.test(key) && (key.match(/\{\w+\}/g) || []).some(token => !result.includes(token))) throw Error('Invalid translation');
          next.push(result);
        }
      } finally { translator.destroy(); }
      if (request !== generation) return;
      try { localStorage.setItem('teravs.translation.' + target, JSON.stringify({ source: sourceVersion, strings: next })); } catch { /* Translation still works if storage is full or disabled. */ }
    }
    dictionary = next; locale = target; remember(code); refresh();
    // The cache contains only translations of the fixed public interface catalog.
    status.textContent = included[target] ? 'Selecione seu idioma.' : 'Tradução automática. Revise informações importantes.';
    document.dispatchEvent(new Event('teravs-language-change'));
  } catch {
    status.textContent = 'Não foi possível traduzir. A interface anterior foi mantida.';
  } finally { controls.forEach(e => e.disabled = false); }
}

export function mountLanguage() {
  if (mounted) return; mounted = true;
  // Keep submitted field values stable when option labels are translated.
  document.querySelectorAll<HTMLOptionElement>('#profession option').forEach(option => option.value = option.textContent || '');
  const panel = document.createElement('details'); panel.id = 'language-panel';
  panel.innerHTML = '<summary>🌐 <span>Idioma</span></summary><div class="language-content"><label for="language-select">Idioma do aplicativo</label><select id="language-select"></select><button id="language-apply" type="button" class="primary">Aplicar idioma</button><p id="language-status" role="status">Selecione seu idioma.</p></div>';
  const select = panel.querySelector<HTMLSelectElement>('select')!;
  const auto = new Option('Seguir o idioma do aparelho', 'auto'); select.append(auto);
  const bundled = document.createElement('optgroup'); bundled.label = 'Traduções incluídas'; bundled.dataset.group = 'included'; select.append(bundled);
  for (const [code, name] of includedLanguages) { const option = new Option(name, code); option.lang = code; option.translate = false; bundled.append(option); }
  const automatic = document.createElement('optgroup'); automatic.dataset.group = 'automatic'; automatic.label = 'Tradução automática no aparelho';
  for (const code of automaticLanguages) {
    const label = new Intl.DisplayNames([code], { type: 'language' }).of(code) || code;
    const option = new Option(label, code); option.lang = code; option.translate = false; automatic.append(option);
  }
  select.append(automatic); select.value = selected;
  panel.querySelector<HTMLButtonElement>('button')!.onclick = () => void apply(select.value);
  document.body.append(panel);
  const groupLabels = () => { bundled.label = t('Traduções incluídas'); automatic.label = t('Tradução automática no aparelho'); };
  document.addEventListener('teravs-language-change', groupLabels);
  let scheduled = false;
  const observer = new MutationObserver(() => {
    if (scheduled) return; scheduled = true;
    queueMicrotask(() => { scheduled = false; refresh(); });
  });
  refresh(); groupLabels();
  observer.observe(document.body, { childList: true, characterData: true, subtree: true, attributes: true, attributeFilter: attributes });
  if (!included[locale] && !cached(locale)) {
    // Downloads require a user gesture; do not silently select an untranslated language.
    locale = deviceLocale(); dictionary = included[locale]; refresh();
    panel.querySelector('#language-status')!.textContent = 'Este idioma não está disponível neste aparelho. Escolha uma tradução incluída.';
  }
}
