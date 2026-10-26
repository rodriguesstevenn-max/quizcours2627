/* Quiz Live : briques communes à l'écran du prof (prof.html) et à la page étudiant (index.html).
   Rien à modifier ici : la configuration se fait dans config.js, les questions dans questions.js. */
(function () {
  "use strict";

  const SDK = "https://www.gstatic.com/firebasejs/10.12.2/";
  const TS = { ".sv": "timestamp" }; // « heure du serveur », remplacée au moment de l'écriture

  // Accepte FIREBASE_CONFIG (config.js) ou firebaseConfig (copié tel quel depuis la console Firebase)
  const valid = c => !!c && !!c.apiKey && !/REMPLIR/i.test(c.apiKey) && !!c.databaseURL;
  const candidates = [
    typeof FIREBASE_CONFIG !== "undefined" ? FIREBASE_CONFIG : null,
    typeof firebaseConfig !== "undefined" ? firebaseConfig : null
  ];
  const cfg = candidates.find(valid) || null;

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src;
      s.onload = resolve;
      s.onerror = () => reject(new Error("Impossible de charger " + src + " (pas de connexion internet ?)"));
      document.head.appendChild(s);
    });
  }

  // Base en ligne : Firebase Realtime Database (offre gratuite)
  function firebaseDB() {
    let db = null, offset = 0;
    return {
      mode: "firebase",
      async ready() {
        await loadScript(SDK + "firebase-app-compat.js");
        await loadScript(SDK + "firebase-database-compat.js");
        firebase.initializeApp(cfg);
        db = firebase.database();
        db.ref(".info/serverTimeOffset").on("value", s => { offset = s.val() || 0; });
      },
      get: path => db.ref(path).get().then(s => s.val()),
      set: (path, val) => db.ref(path).set(val),
      update: (path, obj) => db.ref(path).update(obj),
      on(path, cb) {
        const r = db.ref(path), h = s => cb(s.val());
        r.on("value", h);
        return () => r.off("value", h);
      },
      now: () => Date.now() + offset,
      TS
    };
  }

  // Base de démonstration : tout reste dans ce navigateur (onglets prof et étudiants sur le même ordinateur)
  function demoDB() {
    const KEY = "quizlive-demo-db";
    const listeners = [];
    const split = p => p.split("/").filter(Boolean);

    function load() {
      try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; }
    }
    function getAt(tree, path) {
      let n = tree;
      for (const k of split(path)) {
        if (n === null || typeof n !== "object") return null;
        n = n[k];
      }
      return n === undefined ? null : n;
    }
    function stamp(v) {
      if (Array.isArray(v)) return v.map(stamp);
      if (v && typeof v === "object") {
        if (v[".sv"] === "timestamp") return Date.now();
        const o = {};
        for (const k in v) {
          const r = stamp(v[k]);
          if (r !== null && r !== undefined) o[k] = r;
        }
        return Object.keys(o).length ? o : null;
      }
      return v;
    }
    function setAt(tree, path, v) {
      const ks = split(path);
      let n = tree;
      for (const k of ks.slice(0, -1)) {
        if (n[k] === null || typeof n[k] !== "object") n[k] = {};
        n = n[k];
      }
      const last = ks[ks.length - 1];
      if (v === null || v === undefined) delete n[last];
      else n[last] = v;
    }
    function notify() {
      const t = load();
      for (const l of listeners.slice()) {
        const v = getAt(t, l.path), s = JSON.stringify(v);
        if (s !== l.last) { l.last = s; l.cb(v); }
      }
    }
    function write(fn) {
      const t = load();
      fn(t);
      try { localStorage.setItem(KEY, JSON.stringify(t)); } catch (e) {}
      notify();
      return Promise.resolve();
    }
    window.addEventListener("storage", e => { if (e.key === KEY) notify(); });

    return {
      mode: "demo",
      ready: () => Promise.resolve(),
      get: path => Promise.resolve(getAt(load(), path)),
      set: (path, val) => write(t => setAt(t, path, stamp(val))),
      update: (path, obj) => write(t => { for (const k in obj) setAt(t, path + "/" + k, stamp(obj[k])); }),
      on(path, cb) {
        const l = { path, cb, last: undefined };
        listeners.push(l);
        setTimeout(() => {
          if (!listeners.includes(l)) return;
          const v = getAt(load(), path);
          l.last = JSON.stringify(v);
          cb(v);
        }, 0);
        return () => { const i = listeners.indexOf(l); if (i >= 0) listeners.splice(i, 1); };
      },
      now: () => Date.now(),
      TS
    };
  }

  // Triangle, losange, rond, carré : une forme par couleur de réponse
  const SHAPES = [
    '<path d="M16 3 30 28H2z"/>',
    '<path d="M16 2 30 16 16 30 2 16z"/>',
    '<circle cx="16" cy="16" r="13"/>',
    '<rect x="4" y="4" width="24" height="24" rx="2"/>'
  ];
  const shape = k => `<svg class="shape" viewBox="0 0 32 32" fill="#fff" aria-hidden="true">${SHAPES[k]}</svg>`;

  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g,
    c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const sleep = ms => new Promise(r => setTimeout(r, ms));

  const ordinal = n => n === 1 ? "1<sup>er</sup>" : n + "<sup>e</sup>";

  function studentUrl() {
    const u = typeof STUDENT_URL !== "undefined" ? String(STUDENT_URL || "").trim() : "";
    if (u) return u;
    return location.href.split(/[?#]/)[0].replace(/[^/]*$/, "index.html");
  }

  // Petit stockage navigateur, sans jamais planter (navigation privée, etc.)
  const store = {
    get(k, kind) { try { return JSON.parse(window[kind + "Storage"].getItem(k)); } catch (e) { return null; } },
    set(k, v, kind) { try { window[kind + "Storage"].setItem(k, JSON.stringify(v)); } catch (e) {} },
    del(k, kind) { try { window[kind + "Storage"].removeItem(k); } catch (e) {} }
  };

  window.QL = { DB: cfg ? firebaseDB() : demoDB(), shape, esc, sleep, ordinal, studentUrl, store };
})();
