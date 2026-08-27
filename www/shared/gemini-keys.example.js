/**
 * gemini-keys.example.js — TEMPLATE
 *
 * File asli (gemini-keys.js) berisi API key dan sengaja masuk .gitignore
 * baris 82, jadi TIDAK ikut ter-commit. Setiap clone baru harus membuatnya
 * sendiri, kalau tidak akan muncul 404 di console dan fitur AI mati diam-diam
 * (ai-consultation.html dan ai-chat.html fallback ke array kosong).
 *
 * Cara pakai:
 *   1. Salin file ini menjadi  www/shared/gemini-keys.js
 *   2. Isi API key dari https://aistudio.google.com/app/apikey
 *   3. JANGAN commit gemini-keys.js
 *
 * Boleh diisi lebih dari satu key — GeminiKeyManager (shared/gemini-key-manager.js)
 * akan merotasinya saat satu key kena rate limit.
 */

window.GEMINI_API_KEYS = [
  // 'AIzaSy...........................',
  // 'AIzaSy...........................',
];
