const BLOCKED_TLDS = ['.ru', '.su', '.by', '.рф'];
const BLOCKED_HOSTS = [
  'vk.com', 'ok.ru', 'mail.ru', 'yandex.ru', 'ya.ru', 'ria.ru', 'sputniknews.com',
  'habr.com', 'habr.ru', 'tproger.ru'
];

function extractDestinationUrl(href) {
  try {
    // Google redirect: /url?q=DEST...
    if (href.startsWith('/url?') || href.includes('://www.google.') && href.includes('/url?')) {
      const u = href.startsWith('http') ? new URL(href) : new URL(href, 'https://www.google.com');
      return u.searchParams.get('q') || u.searchParams.get('url') || href;
    }
    return href.startsWith('http') ? href : new URL(href, location.origin).toString();
  } catch {
    return href;
  }
}

function isBlockedDomain(urlString) {
  try {
    const host = new URL(urlString).hostname.toLowerCase();
    if (BLOCKED_HOSTS.some(h => host === h || host.endsWith('.' + h))) return true;
    if (BLOCKED_TLDS.some(tld => host.endsWith(tld))) return true;
    return false;
  } catch {
    return false;
  }
}

function looksRussian(text) {
  if (!text) return false;
  if (!/[А-Яа-яЁёЇїІіЄєҐґ]/.test(text)) return false;
  if (/[ыЫэЭёЁъЪ]/.test(text)) return true;
  return false;
}

function findMainResultLink(block) {
  const links = Array.from(block.querySelectorAll('a[href]'));
  return links.find(a => a.querySelector('h3')) || null;
}

function getResultCards() {
  // Важливо: беремо лише "одна картка = один результат"
  const cards = Array.from(document.querySelectorAll('#search .MjjYud, #search .g'));
  return cards.filter(c => c.querySelector('h3'));
}

function hide(block) {
  if (block.dataset.noRuHidden === '1') return;
  block.style.display = 'none';
  block.dataset.noRuHidden = '1';
}

function processResults() {
  for (const card of getResultCards()) {
    if (card.dataset.noRuHidden === '1') continue;

    const text = card.innerText || card.textContent || '';
    const mainLink = findMainResultLink(card);

    const dest = mainLink ? extractDestinationUrl(mainLink.getAttribute('href') || '') : '';
    const sig = `${dest}::${text.slice(0, 200)}`;
    if (card.dataset.noRuSig === sig) continue;
    card.dataset.noRuSig = sig;

    if (looksRussian(text)) {
      hide(card);
      continue;
    }
    if (dest && isBlockedDomain(dest)) {
      hide(card);
      continue;
    }
  }

  // related searches chips (/search?q=...) теж можна підчистити точково
  const chips = document.querySelectorAll('#search a[href^="/search?q="]');
  chips.forEach(a => {
    const t = a.innerText || '';
    if (looksRussian(t)) a.style.display = 'none';
  });
}

function init() {
  processResults();
  const target = document.querySelector('#search') || document.body;
  const obs = new MutationObserver(() => {
    try { processResults(); } catch {}
  });
  obs.observe(target, { childList: true, subtree: true });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
