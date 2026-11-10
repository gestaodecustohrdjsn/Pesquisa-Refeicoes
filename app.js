const form = document.querySelector('form');
const button = form.querySelector('button');
const feedback = document.querySelector('.feedback');
const statusLine = document.querySelector('#status');
const endpoint = window.PESQUISA_ENDPOINT;
let saving = false;
let syncing = false;
let offlineReady = false;
let feedbackTimer;

const db = new Promise((resolve, reject) => {
  const request = indexedDB.open('hrpp-refeicoes', 1);
  request.onupgradeneeded = () => request.result.createObjectStore('fila', { keyPath: 'id' });
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error);
});

async function storage(mode, action) {
  const connection = await db;
  return new Promise((resolve, reject) => {
    const transaction = connection.transaction('fila', mode);
    const request = action(transaction.objectStore('fila'));
    transaction.oncomplete = () => resolve(request.result);
    transaction.onabort = () => reject(transaction.error);
  });
}

function ack(ids) {
  return new Promise((resolve, reject) => {
    const callback = 'ack_' + crypto.randomUUID().replaceAll('-', '');
    const url = new URL(endpoint);
    url.search = new URLSearchParams({ callback, ids: ids.join(',') });
    const script = document.createElement('script');
    function finish(result) {
      clearTimeout(timer);
      script.remove();
      delete window[callback];
      if (Array.isArray(result)) resolve(result);
      else reject(new Error('Confirmação indisponível'));
    }
    const timer = setTimeout(() => finish(), 12000);
    window[callback] = result => finish(result.ids);
    script.onerror = () => finish();
    script.src = url;
    document.head.append(script);
  });
}

async function renderStatus() {
  try {
    const count = await storage('readonly', store => store.count());
    const connection = !endpoint ? 'Planilha ainda não vinculada'
      : navigator.onLine ? (offlineReady ? 'Pronto para uso offline' : 'Conectado') : 'Sem internet';
    statusLine.textContent = count ? connection + ' · Pendentes: ' + count : connection;
  } catch {
    statusLine.textContent = 'Armazenamento indisponível neste navegador.';
  }
}

async function sync() {
  if (!endpoint || syncing || !navigator.onLine) return;
  syncing = true;
  try {
    const queue = await storage('readonly', store => store.getAll());
    for (let offset = 0; offset < queue.length; offset += 25) {
      const batch = queue.slice(offset, offset + 25);
      await fetch(endpoint, {
        method: 'POST', mode: 'no-cors', credentials: 'omit',
        body: JSON.stringify(batch), signal: AbortSignal.timeout(15000)
      });
      const confirmed = new Set(await ack(batch.map(response => response.id)));
      for (const { id } of batch) {
        if (confirmed.has(id)) await storage('readwrite', store => store.delete(id));
      }
      if (confirmed.size < batch.length) break;
    }
  } catch {
    // A próxima tentativa usa os mesmos identificadores.
  } finally {
    syncing = false;
    void renderStatus();
  }
}

form.addEventListener('change', () => {
  clearTimeout(feedbackTimer);
  feedback.textContent = '';
  button.disabled = saving;
});
form.addEventListener('submit', async event => {
  event.preventDefault();
  const rating = new FormData(form).get('nota');
  if (!rating || saving) return;
  saving = true;
  button.disabled = true;
  try {
    const response = { id: crypto.randomUUID(), timestamp: new Date().toISOString(), rating };
    await storage('readwrite', store => store.add(response));
    form.reset();
    feedback.textContent = 'Resposta registrada. Obrigado!';
    feedbackTimer = setTimeout(() => { feedback.textContent = ''; }, 2800);
    void renderStatus();
    void sync();
  } catch {
    feedback.textContent = 'Não foi possível salvar. Tente novamente.';
  } finally {
    saving = false;
    button.disabled = !form.querySelector(':checked');
  }
});

window.addEventListener('online', () => { void renderStatus(); void sync(); });
window.addEventListener('offline', renderStatus);
document.addEventListener('visibilitychange', () => { if (!document.hidden) void sync(); });
setInterval(sync, 20000);
void renderStatus();
void sync();
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').then(() => navigator.serviceWorker.ready)
    .then(() => { offlineReady = true; void renderStatus(); }).catch(() => {});
}
