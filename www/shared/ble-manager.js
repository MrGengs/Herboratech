/**
 * BLEManager — Web Bluetooth ke Herboratech (ESP32-C6)
 *
 * Kontrak GATT di bawah ini BUKAN pilihan bebas: ia disalin dari firmware
 * jam, berkas `herboratech_ble.h`. Kalau salah satu sisi berubah, sisi yang
 * lain ikut berubah — tidak ada lapisan penerjemah di antaranya.
 *
 *   Layanan utama  6f1a0000-b5a3-4f21-9c7d-1e2a4b6c8d90
 *     6f1a0001…    ringkasan vital   READ + NOTIFY   (20 byte, ver = 1)
 *     6f1a0002…    sesi/permintaan   READ + NOTIFY   (20 byte, ver = 2 / 3)
 *     6f1a0003…    perintah masuk    WRITE
 *   Current Time Service 0x1805 (baku Bluetooth SIG)
 *     0x2A2B       waktu             READ + WRITE + NOTIFY  (10 byte)
 *
 * Nama iklan: "Herboratech" — huruf "t" KECIL. Lihat catatan pada
 * SCAN_FILTERS di bawah; ejaan inilah yang dulu membuat kotak pilih
 * perangkat di Chrome selalu kosong. Namanya pernah "Herboratech Band",
 * jadi penyaring berbasis awalan tetap cocok untuk keduanya.
 *
 * Dua hal yang membedakannya dari klien BLE biasa:
 *
 *  1. Muatannya BINER, bukan teks. Struct 20 byte little-endian yang dikirim
 *     apa adanya dari memori ESP32 (lihat `struct BleVitals`). Mengurainya
 *     sebagai string hanya menghasilkan sampah, karena byte-nya memang bukan
 *     UTF-8.
 *
 *  2. Jam TIDAK punya sumber waktu sendiri. PCF85063 di papan menjaga waktu
 *     tetap BERJALAN saat daya mati, tapi tidak pernah tahu jam berapa
 *     sekarang sampai ada yang memberitahunya. Perangkat inilah yang
 *     memberitahunya. Kalau halaman ini tidak pernah mengirim waktu, jam
 *     menunjukkan 08:42 sejak dinyalakan dan seluruh cap waktu di riwayat
 *     kesehatan ikut salah.
 */

const BLEManager = (() => {
  /* ── kontrak GATT — samakan dengan herboratech_ble.h ────────────────── */
  const SVC_MAIN    = '6f1a0000-b5a3-4f21-9c7d-1e2a4b6c8d90';
  const CH_VITALS   = '6f1a0001-b5a3-4f21-9c7d-1e2a4b6c8d90';
  const CH_SESSION  = '6f1a0002-b5a3-4f21-9c7d-1e2a4b6c8d90';
  const CH_COMMAND  = '6f1a0003-b5a3-4f21-9c7d-1e2a4b6c8d90';
  const SVC_CTS     = 0x1805;          // Current Time Service
  const CH_CTS_TIME = 0x2a2b;          // Current Time
  const NAME_PREFIX = 'Herboratech';

  /**
   * Penyaring kotak pilih perangkat. Beberapa entri = ATAU.
   *
   * Yang PERTAMA yang menentukan, dan sengaja bukan nama: firmware
   * menyiarkan UUID layanan utamanya di paket iklan, dan UUID tidak punya
   * ejaan. Menyaring dengan itu kebal terhadap tiga hal yang masing-masing
   * pernah membuat perangkat tidak muncul sama sekali:
   *
   *   · Beda huruf besar-kecil. `namePrefix` dicocokkan PERSIS. Versi
   *     sebelumnya menyaring "HerboraTech" (T besar) sedangkan papan
   *     menyiarkan "Herboratech" (t kecil), jadi kotaknya selalu kosong
   *     padahal jamnya menyala dan terlihat oleh pemindai lain.
   *   · Nama terpotong. Nama ada di scan response, bukan paket iklan
   *     utama; kalau host tidak melakukan active scan, namanya tidak
   *     pernah sampai dan penyaring berbasis nama gagal.
   *   · Nama diganti di firmware tanpa halaman ini ikut diubah.
   *
   * Entri nama tetap disimpan sebagai jaring pengaman, termasuk ejaan lama
   * dan nama merek sebelumnya, supaya papan yang belum di-flash ulang tetap
   * bisa disambungkan.
   */
  const SCAN_FILTERS = [
    { services: [SVC_MAIN] },
    { namePrefix: 'Herboratech' },
    { namePrefix: 'HerboraTech' },      // ejaan lama di halaman web
    { namePrefix: 'Vitalora' },         // nama merek sebelumnya
    { namePrefix: 'VItaLora' }
  ];

  /* bendera keabsahan pada byte ke-1 paket vital */
  const F_BPM = 0x01, F_HRV = 0x02, F_TEMP = 0x04, F_SPO2 = 0x08,
        F_INDEX = 0x10, F_BATT = 0x20, F_SLEEP = 0x40;

  /* ver pada byte ke-0 — satu tata letak, tiga arti */
  const VER_VITALS = 1;   // ringkasan berkala (tiap 10 detik)
  const VER_SESSION = 2;  // hasil satu Pemeriksaan Terpandu
  const VER_ASKTIME = 3;  // "tolong beri saya waktu"

  /* perintah keluar (characteristic 6f1a0003) */
  const CMD_SET_TIME = 0x01, CMD_HERB = 0x02,
        CMD_START_EXAM = 0x03, CMD_CLEAR_HERB = 0x04;

  const PACKET_LEN = 20;
  const HERB_MAX   = 180;   // pendHerbBuf[200] di firmware, sisakan ruang

  /* ── keadaan ───────────────────────────────────────────────────────── */
  let _device = null, _server = null;
  let _chVitals = null, _chSession = null, _chCommand = null, _chTime = null;
  let _connected = false;
  let _callbacks = [], _sessionCbs = [], _statusCbs = [];
  let _lastData = null, _lastSession = null;
  let _connectionStartTime = null;
  let _lastTimeSyncAt = null;
  let _timeSyncCount = 0;
  let _lastError = null;

  function _log(...a) { console.log('[BLE]', ...a); }
  function _toast(msg, type) {
    if (typeof showToast === 'function') showToast(msg, type);
  }

  /* ── pengurai paket 20 byte ────────────────────────────────────────── */
  /**
   * Little-endian, sesuai `struct __attribute__((packed)) BleVitals`.
   * Bendera dihormati: nilai yang TIDAK sah dikembalikan sebagai null,
   * bukan sebagai 0. Nol adalah angka; "belum terukur" bukan — dan SPEC
   * 11.1 mewajibkan keduanya dibedakan, persis seperti layar jam yang
   * menampilkan "-".
   */
  function _decode(view) {
    if (!view || view.byteLength < PACKET_LEN) return null;
    const f = view.getUint8(1);
    return {
      ver:          view.getUint8(0),
      flags:        f,
      hr:           (f & F_BPM)   ? view.getUint8(2)            : null,
      spo2:         (f & F_SPO2)  ? view.getUint8(3)            : null,
      temp:         (f & F_TEMP)  ? view.getInt16(4, true) / 10 : null,
      hrv:          (f & F_HRV)   ? view.getUint16(6, true)     : null,
      steps:        view.getUint32(8, true),
      index:        (f & F_INDEX) ? view.getUint8(12)           : null,
      indexDelta:   (f & F_INDEX) ? view.getInt8(13)            : null,
      baselineDays: view.getUint8(14),
      battery:      (f & F_BATT)  ? view.getUint8(15)           : null,
      sleepMin:     (f & F_SLEEP) ? view.getUint16(16, true)    : null,
      uptimeMin:    view.getUint16(18, true)
    };
  }

  /* ── paket waktu ───────────────────────────────────────────────────── */
  /**
   * Current Time baku, 10 byte. Byte ke-8 adalah PECAHAN detik dalam satuan
   * 1/256 — firmware memakainya untuk membulatkan ke detik terdekat, jadi
   * mengisinya nol berarti jam rata-rata meleset setengah detik ke arah
   * yang sama setiap kali disinkronkan. Murah untuk diisi benar.
   *
   * Hari dalam pekan: baku memakai 1=Senin..7=Minggu, JavaScript memakai
   * 0=Minggu. Konversinya hanya di sini.
   */
  function _ctsPacket(d) {
    const b = new ArrayBuffer(10), v = new DataView(b);
    v.setUint16(0, d.getFullYear(), true);
    v.setUint8(2, d.getMonth() + 1);
    v.setUint8(3, d.getDate());
    v.setUint8(4, d.getHours());
    v.setUint8(5, d.getMinutes());
    v.setUint8(6, d.getSeconds());
    const dow = d.getDay();
    v.setUint8(7, dow === 0 ? 7 : dow);
    v.setUint8(8, Math.min(255, Math.floor(d.getMilliseconds() * 256 / 1000)));
    v.setUint8(9, 0);                                   // alasan penyesuaian
    return b;
  }

  /* Jalur cadangan kalau 0x1805 tidak ada: [01] hh mm ss day mon yy wday */
  function _cmdTimePacket(d) {
    return new Uint8Array([CMD_SET_TIME, d.getHours(), d.getMinutes(),
                           d.getSeconds(), d.getDate(), d.getMonth() + 1,
                           d.getFullYear() % 100, 0]);
  }

  async function _write(ch, payload) {
    if (!ch) throw new Error('characteristic belum siap');
    if (ch.writeValueWithResponse) return ch.writeValueWithResponse(payload);
    return ch.writeValue(payload);                      // Chrome lama
  }

  /**
   * Kirim waktu perangkat ini ke jam. Dipanggil saat tersambung DAN setiap
   * kali jam memintanya (paket ver 3) — firmware meminta ulang tiap kali
   * tersambung dan tiap 10 menit selama sambungan hidup, supaya hanyutan
   * osilatornya ikut terkoreksi.
   */
  async function syncTime() {
    const now = new Date();
    try {
      if (_chTime) {
        await _write(_chTime, _ctsPacket(now));
      } else if (_chCommand) {
        await _write(_chCommand, _cmdTimePacket(now));
      } else {
        return false;
      }
      _lastTimeSyncAt = now.toISOString();
      _timeSyncCount++;
      _log('waktu dikirim ke jam:', now.toLocaleString('id-ID'));
      return true;
    } catch (e) {
      console.warn('[BLE] gagal mengirim waktu:', e);
      return false;
    }
  }

  /** Baca jam yang sedang ditunjukkan band (untuk memverifikasi sinkron). */
  async function readDeviceTime() {
    if (!_chTime) return null;
    try {
      const v = await _chTime.readValue();
      if (v.byteLength < 7) return null;
      return new Date(v.getUint16(0, true), v.getUint8(2) - 1, v.getUint8(3),
                      v.getUint8(4), v.getUint8(5), v.getUint8(6));
    } catch (e) {
      console.warn('[BLE] gagal membaca waktu band:', e);
      return null;
    }
  }

  /* ── penanganan notifikasi ─────────────────────────────────────────── */
  function _emitStatus() {
    const s = getStatus();
    _statusCbs.forEach(cb => { try { cb(s); } catch (e) { console.warn(e); } });
  }

  function _onVitals(event) {
    const d = _decode(event.target.value);
    if (!d) { console.warn('[BLE] paket vital terlalu pendek'); return; }

    /* Nama ganda dipertahankan: halaman lama membaca `temp`, VitalsManager
       memetakan `temperature`. Keduanya menunjuk angka yang sama. */
    d.temperature = d.temp;
    d.source = 'ble';
    d.timestamp = new Date().toISOString();
    d.connectionDuration = _connectionStartTime
      ? (Date.now() - _connectionStartTime) / 1000 : 0;

    _lastData = d;
    _log('vital:', `HR=${d.hr ?? '-'} SpO2=${d.spo2 ?? '-'} ` +
                   `suhu=${d.temp ?? '-'} langkah=${d.steps}`);

    if (window.VitalsManager && typeof VitalsManager.injectBLE === 'function') {
      VitalsManager.injectBLE(d);
    }
    _callbacks.forEach(cb => { try { cb(d); } catch (e) { console.warn(e); } });
  }

  /**
   * Characteristic 6f1a0002 memakai tata letak yang sama dengan vital;
   * yang membedakan hanya `ver`. ver 3 adalah permintaan waktu — dijawab
   * di sini, karena jam tidak bisa mendapatkannya dari tempat lain.
   */
  function _onSession(event) {
    const d = _decode(event.target.value);
    if (!d) return;

    if (d.ver === VER_ASKTIME) {
      _log('jam meminta waktu');
      syncTime();
      return;
    }

    if (d.ver === VER_SESSION) {
      d.temperature = d.temp;
      d.source = 'ble-session';
      d.timestamp = new Date().toISOString();
      _lastSession = d;
      _log('hasil pemeriksaan diterima:', d);
      _sessionCbs.forEach(cb => { try { cb(d); } catch (e) { console.warn(e); } });
    }
  }

  function _onDisconnected() {
    _log('sambungan terputus');
    _connected = false;
    _server = _chVitals = _chSession = _chCommand = _chTime = null;
    _connectionStartTime = null;
    _emitStatus();
    _toast('Herboratech Band terputus', 'warning');
  }

  /* ── penyiapan sesudah GATT tersambung ─────────────────────────────── */
  async function _setup(device) {
    _device = device;
    device.removeEventListener('gattserverdisconnected', _onDisconnected);
    device.addEventListener('gattserverdisconnected', _onDisconnected);

    _server = await device.gatt.connect();
    _log('GATT tersambung');

    const svc = await _server.getPrimaryService(SVC_MAIN);
    _chVitals  = await svc.getCharacteristic(CH_VITALS);
    _chSession = await svc.getCharacteristic(CH_SESSION);
    _chCommand = await svc.getCharacteristic(CH_COMMAND);

    await _chVitals.startNotifications();
    _chVitals.removeEventListener('characteristicvaluechanged', _onVitals);
    _chVitals.addEventListener('characteristicvaluechanged', _onVitals);

    await _chSession.startNotifications();
    _chSession.removeEventListener('characteristicvaluechanged', _onSession);
    _chSession.addEventListener('characteristicvaluechanged', _onSession);
    _log('notifikasi aktif');

    /*  CTS opsional: kalau firmware dibangun tanpa layanan itu, perintah
     *  kustom masih bisa menyetel waktu. Kegagalan di sini tidak boleh
     *  menjatuhkan seluruh sambungan. */
    try {
      const cts = await _server.getPrimaryService(SVC_CTS);
      _chTime = await cts.getCharacteristic(CH_CTS_TIME);
    } catch (e) {
      _chTime = null;
      console.warn('[BLE] Current Time Service tidak ada, pakai CMD_SET_TIME');
    }

    _connected = true;
    _lastError = null;
    _connectionStartTime = Date.now();

    /*  Segera, tanpa menunggu jam bertanya: bacaan pertama yang tersimpan
     *  ke Firestore harus sudah bercap waktu benar. */
    await syncTime();

    /*  Satu bacaan awal supaya kartu tidak kosong selama 10 detik pertama
     *  — notifikasi vital berikutnya baru datang di kelipatan 10 detik. */
    try {
      const v = await _chVitals.readValue();
      _onVitals({ target: { value: v } });
    } catch (e) { /* tidak fatal */ }

    _emitStatus();
    return true;
  }

  /* ── prasyarat lingkungan ──────────────────────────────────────────── */
  /**
   * Web Bluetooth punya tiga prasyarat yang gagalnya terlihat sama persis
   * dari sisi pengguna — "tidak ada perangkat" — padahal penyebabnya beda
   * dan penanganannya beda. Dipisahkan di sini supaya pesannya menunjuk
   * hal yang benar, bukan menyuruh mendekatkan jam padahal browsernya
   * memang tidak punya Bluetooth sama sekali.
   */
  function checkSupport() {
    if (!navigator.bluetooth) {
      return { ok: false, reason: 'unsupported',
               message: 'Browser ini tidak punya Web Bluetooth. Pakai Chrome, Edge, ' +
                        'atau Opera — Firefox dan Safari tidak mendukungnya sama sekali.' };
    }
    if (!window.isSecureContext) {
      return { ok: false, reason: 'insecure',
               message: 'Web Bluetooth hanya jalan lewat HTTPS atau localhost. ' +
                        `Halaman ini dibuka lewat ${location.protocol}//${location.host}.` };
    }
    return { ok: true, reason: null, message: null };
  }

  /** Apakah adapter Bluetooth perangkat ini menyala? (Chrome ≥ 78) */
  async function isAdapterAvailable() {
    try {
      if (navigator.bluetooth && navigator.bluetooth.getAvailability) {
        return await navigator.bluetooth.getAvailability();
      }
    } catch (e) { /* diamkan */ }
    return true;                       // tidak bisa dipastikan, jangan menghalangi
  }

  /* ── API publik ────────────────────────────────────────────────────── */
  /**
   * @param {object}  [opts]
   * @param {boolean} [opts.anyDevice]  tampilkan SEMUA perangkat BLE di
   *        sekitar, bukan hanya yang lolos penyaring. Untuk mendiagnosis
   *        "tidak muncul": kalau di mode ini pun jam tidak terlihat,
   *        masalahnya ada di papan atau adapter, bukan di penyaring.
   */
  async function connect(opts = {}) {
    if (_connected) { _log('sudah tersambung'); return true; }

    const sup = checkSupport();
    if (!sup.ok) { _lastError = sup.reason; _toast(sup.message, 'error'); return false; }

    if (!(await isAdapterAvailable())) {
      _lastError = 'adapter-off';
      _toast('Bluetooth perangkat ini mati. Nyalakan dulu, lalu scan lagi.', 'error');
      return false;
    }

    try {
      const options = opts.anyDevice
        ? { acceptAllDevices: true, optionalServices: [SVC_MAIN, SVC_CTS] }
        : { filters: SCAN_FILTERS,  optionalServices: [SVC_MAIN, SVC_CTS] };

      _log(opts.anyDevice ? 'memindai SEMUA perangkat BLE...'
                          : 'mencari Herboratech Band...');
      const device = await navigator.bluetooth.requestDevice(options);
      _log('perangkat dipilih:', device.name || '(tanpa nama)');
      await _setup(device);
      _toast('Herboratech Band terhubung', 'success');
      return true;
    } catch (error) {
      _connected = false;
      _lastError = error.name;
      console.error('[BLE] gagal menyambung:', error);

      if (error.name === 'NotFoundError') {
        /*  Chrome memakai galat yang SAMA untuk "kotak ditutup pengguna"
         *  dan "tidak ada yang cocok", jadi pesannya tidak boleh menuduh
         *  salah satu. Yang bisa dilakukan: sebutkan penyebab yang benar-
         *  benar sering, dan tawarkan mode tampilkan-semua. */
        _toast('Jam tidak terpilih. Pastikan jam menyala, tidak sedang tersambung ' +
               'ke ponsel lain, dan berada dalam jangkauan.', 'warning');
      } else if (error.name === 'SecurityError') {
        _toast('Izin Bluetooth ditolak browser', 'error');
      } else if (error.name === 'NotSupportedError') {
        _toast('Web Bluetooth tidak didukung perangkat ini', 'error');
      } else if (error.name === 'NetworkError') {
        _toast('Gagal menyambung ke jam. Jauhkan sebentar lalu coba lagi.', 'error');
      } else {
        _toast('Gagal menyambung: ' + error.message, 'error');
      }
      _emitStatus();
      return false;
    }
  }

  /** Mode diagnosis: kotak pilih menampilkan semua perangkat BLE sekitar. */
  function connectAnyDevice() { return connect({ anyDevice: true }); }

  async function disconnect() {
    try {
      if (_device) _device.removeEventListener('gattserverdisconnected', _onDisconnected);
      if (_chVitals)  { try { await _chVitals.stopNotifications(); } catch (e) {} }
      if (_chSession) { try { await _chSession.stopNotifications(); } catch (e) {} }
      if (_device && _device.gatt && _device.gatt.connected) _device.gatt.disconnect();

      _connected = false;
      _server = _chVitals = _chSession = _chCommand = _chTime = null;
      _connectionStartTime = null;
      _lastData = null;

      _log('terputus atas permintaan');
      _toast('Smartwatch diputus', 'success');
      _emitStatus();
      return true;
    } catch (error) {
      console.error('[BLE] gagal memutus:', error);
      return false;
    }
  }

  /**
   * Sambung ulang tanpa dialog pemilihan, memakai izin yang sudah pernah
   * diberikan. `getDevices()` butuh flag
   * #enable-web-bluetooth-new-permissions-backend di sebagian versi Chrome,
   * jadi kegagalannya normal dan tidak diributkan.
   */
  async function autoConnect() {
    try {
      if (!navigator.bluetooth || !navigator.bluetooth.getDevices) return false;
      const devices = await navigator.bluetooth.getDevices();
      const band = devices.find(d => d.name &&
        /^(herboratech|vitalora)/i.test(d.name));
      if (!band) return false;
      _log('menyambung ulang ke', band.name);
      await _setup(band);
      return true;
    } catch (error) {
      console.warn('[BLE] sambung ulang otomatis gagal:', error);
      return false;
    }
  }

  /* ── perintah ke jam ───────────────────────────────────────────────── */
  /** Suruh jam memulai Pemeriksaan Terpandu 30 detik (SPEC 6.3). */
  async function startExam() {
    if (!_connected) { _toast('Sambungkan smartwatch dulu', 'warning'); return false; }
    try {
      await _write(_chCommand, new Uint8Array([CMD_START_EXAM]));
      _log('perintah mulai pemeriksaan dikirim');
      return true;
    } catch (e) { console.error('[BLE] startExam gagal:', e); return false; }
  }

  /**
   * Kirim resep herbal untuk ditampilkan di layar jam.
   * Format muatan firmware: "nama\ndosis\nalasan".
   */
  async function sendHerb(nama, dosis, alasan) {
    if (!_connected) { _toast('Sambungkan smartwatch dulu', 'warning'); return false; }
    const body = `${nama || ''}\n${dosis || ''}\n${alasan || ''}`;
    let bytes = new TextEncoder().encode(body);
    if (bytes.length > HERB_MAX) {
      console.warn(`[BLE] resep dipotong ${bytes.length} -> ${HERB_MAX} byte`);
      bytes = bytes.slice(0, HERB_MAX);
    }
    const payload = new Uint8Array(bytes.length + 1);
    payload[0] = CMD_HERB;
    payload.set(bytes, 1);
    try {
      await _write(_chCommand, payload);
      _log('resep herbal dikirim ke jam');
      return true;
    } catch (e) { console.error('[BLE] sendHerb gagal:', e); return false; }
  }

  /** Hapus resep yang sedang tampil di jam. */
  async function clearHerb() {
    if (!_connected) return false;
    try {
      await _write(_chCommand, new Uint8Array([CMD_CLEAR_HERB]));
      return true;
    } catch (e) { console.error('[BLE] clearHerb gagal:', e); return false; }
  }

  /* ── langganan ─────────────────────────────────────────────────────── */
  function onData(callback) {
    if (typeof callback !== 'function') return () => {};
    _callbacks.push(callback);
    if (_connected && _lastData) setTimeout(() => callback(_lastData), 0);
    return () => { _callbacks = _callbacks.filter(cb => cb !== callback); };
  }

  /** Hasil satu Pemeriksaan Terpandu yang baru selesai di jam. */
  function onSession(callback) {
    if (typeof callback !== 'function') return () => {};
    _sessionCbs.push(callback);
    return () => { _sessionCbs = _sessionCbs.filter(cb => cb !== callback); };
  }

  /** Perubahan status sambungan (tersambung / terputus). */
  function onStatus(callback) {
    if (typeof callback !== 'function') return () => {};
    _statusCbs.push(callback);
    setTimeout(() => callback(getStatus()), 0);
    return () => { _statusCbs = _statusCbs.filter(cb => cb !== callback); };
  }

  function getStatus() {
    return {
      connected: _connected,
      deviceName: _device?.name || null,
      deviceId: _device?.id || null,
      timestamp: new Date().toISOString(),
      lastData: _lastData,
      lastSession: _lastSession,
      lastTimeSyncAt: _lastTimeSyncAt,
      timeSyncCount: _timeSyncCount,
      lastError: _lastError,
      connectionDuration: _connectionStartTime
        ? (Date.now() - _connectionStartTime) / 1000 : 0
    };
  }

  /**
   * Nilai saat belum ada sambungan. Sengaja "--", bukan angka contoh:
   * angka contoh di kartu vital tidak bisa dibedakan dari hasil pengukuran.
   */
  function getDefaultData() {
    return {
      hr: null, spo2: null, temp: null, temperature: null,
      hrv: null, steps: 0, battery: null, index: null,
      source: 'none', timestamp: new Date().toISOString()
    };
  }

  return {
    connect, connectAnyDevice, disconnect, autoConnect,
    onData, onSession, onStatus,
    getStatus, getDefaultData,
    checkSupport, isAdapterAvailable,
    syncTime, readDeviceTime,
    startExam, sendHerb, clearHerb,
    get connected() { return _connected; },
    get device() { return _device; },
    UUID: { SVC_MAIN, CH_VITALS, CH_SESSION, CH_COMMAND, SVC_CTS, CH_CTS_TIME },
    SCAN_FILTERS, NAME_PREFIX
  };
})();

window.BLEManager = BLEManager;
