import ollama from "https://esm.sh/ollama@0.6.4/browser";

let analysisRun = 0;

/* Valeurs par défaut. Tout est remplacé par la section "meta" de jobs.json quand elle existe. */
const CONFIG = {
  model: "glm-4.7-flash",
  agentName: "Ton conseiller",
  questionLead: "Ça me plairait de…",
  levels: ["Pas du tout", "Un peu", "Moyennement", "Beaucoup", "Énormément"]
};

function buildSystemPrompt(min, max) {
  return [
    "Tu es un conseiller en orientation professionnelle. Tu t'adresses à la personne avec « tu ».",
    "Tu reçois ses envies professionnelles, notées de " + min + " (ça ne me plaît pas du tout) à " + max + " (ça me plaît énormément), et les métiers que le quiz lui a proposés.",
    "Ces notes mesurent ce qu'elle aime faire, jamais ce qu'elle sait faire : ne parle jamais de compétences ni de niveau.",
    "Écris 3 courts paragraphes, 150 à 200 mots au total, séparés par une ligne vide :",
    "1. Ce qui ressort de ses envies : les notes les plus hautes et les plus basses, avec les chiffres, et ce que ça dit de la façon dont elle veut travailler au quotidien.",
    "2. Les synergies et les tensions entre deux ou trois envies (par exemple beaucoup de leadership avec peu de relationnel), et ce que ça implique concrètement dans un poste.",
    "3. Pour les deux premiers métiers proposés : pourquoi ils collent à ses envies, et ce qui pourrait coincer pour elle dans chacun. N'invente aucun autre métier.",
    "Règles :",
    "- La note du milieu est neutre : n'en parle pas.",
    "- Chaque phrase doit dire quelque chose de précis sur cette personne, appuyé sur ses chiffres ou sur un métier de la liste.",
    "- Interdit : compliments, encouragements, formules générales (« il est important de », « tu as un profil »), introduction, conclusion, récitation des notes une par une.",
    "- Texte brut en français, sans liste, sans titre, sans gras."
  ].join("\n");
}

/* Envoie les scores à Ollama et appelle onToken(texte complet) à chaque morceau reçu. */
async function analyse_traits(vals, traits, jobs, onToken) {
  const min = Math.min(...traits.map(t => t.min));
  const max = Math.max(...traits.map(t => t.max));
  const lines = traits.map(t => "- " + t.key + " (" + (t.description || t.label) + ") : " + vals[t.key] + "/" + t.max).join("\n");
  const top = (jobs || []).map((j, i) => (i + 1) + ". " + j.title + " (" + j.score + " %)").join("\n");
  const user = "Envies de la personne :\n" + lines + "\n\nMétiers proposés par le quiz, du plus au moins adapté :\n" + (top || "aucun");

  const request = {
    model: CONFIG.model,
    stream: true,
    options: { temperature: 0.4 },
    messages: [{ role: "system", content: buildSystemPrompt(min, max) }, { role: "user", content: user }]
  };
  let stream;
  try {
    stream = await ollama.chat({ ...request, think: false }); // pas de phase de réflexion = réponse plus rapide
  } catch (e) {
    if (!/think/i.test(String(e && e.message))) throw e;
    stream = await ollama.chat(request); // ce modèle n'accepte pas "think"
  }

  let out = "";
  for await (const part of stream) {
    const piece = part.message && part.message.content;
    if (piece) { out += piece; onToken(out); }
  }
  return out;
}

window.analyse_traits = analyse_traits;

(function () {
  /* Tout vient de jobs.json : traits (label, description, bornes, questions), métiers et réglages "meta". */
  var TRAITS = [];
  var JOBS = [];
  var QUESTIONS = [];   /* [clé du trait, texte de la question], questions des traits en alternance */
  var LEVELS = CONFIG.levels;
  var N = 0;
  var answers = [];
  var idx = 0;

  function $(id) { return document.getElementById(id); }

  function renderInput() {
    var box = $("input"); box.innerHTML = "";
    var s = document.createElement("div"); s.className = "opts"; s.setAttribute("role", "group"); s.setAttribute("aria-label", CONFIG.questionLead);
    LEVELS.forEach(function (text, i) {
      var b = document.createElement("button");
      b.type = "button"; b.dataset.v = i + 1; b.setAttribute("aria-pressed", String(answers[idx] === i + 1));
      var n = document.createElement("span"); n.className = "n"; n.textContent = i + 1;
      var l = document.createElement("span"); l.textContent = text;
      b.appendChild(n); b.appendChild(l); s.appendChild(b);
    });
    s.addEventListener("click", function (e) { var b = e.target.closest("button"); if (b) pick(+b.dataset.v); });
    box.appendChild(s);
  }

  function renderQ() {
    var q = QUESTIONS[idx];
    $("count").textContent = (idx + 1) + " / " + N;
    $("fill").style.width = ((idx + 1) / N * 100) + "%";
    $("tlabel").textContent = CONFIG.questionLead;
    $("qtext").textContent = q[1].charAt(0).toUpperCase() + q[1].slice(1);
    renderInput();
    $("back").disabled = idx === 0;
    $("next").disabled = answers[idx] === null;
    $("next").textContent = idx === N - 1 ? "Voir mes métiers" : "Suivant";
  }

  function pick(v) {
    answers[idx] = v;
    Array.prototype.forEach.call(document.querySelectorAll(".opts button"), function (b) {
      b.setAttribute("aria-pressed", String(+b.dataset.v === v));
    });
    $("next").disabled = false;
  }
  function next() {
    if (answers[idx] === null) return;
    if (idx < N - 1) { idx++; renderQ(); } else { showResults(); }
  }

  $("next").addEventListener("click", next);
  $("back").addEventListener("click", function () { if (idx > 0) { idx--; renderQ(); } });
  document.addEventListener("keydown", function (e) {
    if ($("quiz").hidden || !TRAITS.length) return;
    if (e.key >= "1" && e.key <= String(LEVELS.length)) pick(+e.key);
    else if (e.key === "Enter" && answers[idx] !== null) next();
  });

  function traitValues() {
    var out = {};
    TRAITS.forEach(function (t) {
      var sum = 0, n = 0;
      QUESTIONS.forEach(function (q, i) { if (q[0] === t.key) { sum += answers[i]; n++; } });
      out[t.key] = Math.round(sum / n * 10) / 10;
    });
    return out;
  }

  function linkLabel(u, i, n) {
    var host = u, last = "";
    try {
      var p = new URL(u);
      host = p.hostname.replace(/^www\./, "");
      last = decodeURIComponent(p.pathname.split("/").filter(Boolean).pop() || "");
    } catch (e) {}
    last = last.replace(/[-_]+/g, " ").slice(0, 40);
    return (n > 1 ? "Offre " + (i + 1) : "Offre") + " · " + host + (last ? " · " + last : "");
  }

  function linkList(r) {
    if (!r.links.length) return null;
    var ul = document.createElement("ul"); ul.className = "links";
    r.links.forEach(function (u, i) {
      var li = document.createElement("li");
      var a = document.createElement("a"); a.href = u; a.target = "_blank"; a.rel = "noopener";
      a.textContent = linkLabel(u, i, r.links.length);
      li.appendChild(a); ul.appendChild(li);
    });
    return ul;
  }

  function showJobs(vals) {

    showRadar(vals);
  
    var ranked = JOBS.map(function (j) {

      var total = 0;
      var wsum = 0;
      var gaps = [];
      var excluded = false;

      TRAITS.forEach(function (t) {

        var p = j.criteria && j.criteria[t.key];

        if (!p) return;

        var value = vals[t.key];
        var weight = p.weight || 1;

        if (p.strict === true) {
          if (p.min != null && value < p.min) {
            excluded = true;
            return;
          }

          if (p.max != null && value > p.max) {
            excluded = true;
            return;
          }
        }

        var score = 0;

        if (p.target === "inf") {
          var floor = p.min != null ? p.min : t.min;
          var ceiling = t.max;

          score = ceiling <= floor
            ? (value >= floor ? 1 : 0)
            : (value - floor) / (ceiling - floor);
        }

        else if (p.target === "-inf") {
          var ceiling = p.max != null ? p.max : t.max;
          var floor = t.min;

          score = ceiling <= floor
            ? (value <= ceiling ? 1 : 0)
            : (ceiling - value) / (ceiling - floor);
        }

        else if (typeof p.target === "number") {
          score = 1 - Math.abs(value - p.target) / (t.max - t.min);
        }

        score = Math.max(0, Math.min(1, score));

        total += score * weight;
        wsum += weight;

        if (score < 0.6) {
          gaps.push({
            label: t.label,
            score: score
          });
        }

      });

      gaps.sort(function (a, b) {
        return a.score - b.score;
      });

      return {
        id: j.id,
        title: j.title,
        links: j.links || [],
        excluded: excluded,
        score: excluded || !wsum
          ? 0
          : Math.round(total / wsum * 100),
        gaps: gaps.slice(0, 2).map(function (g) {
          return g.label;
        })
      };

    })
    .filter(function (j) {
      return !j.excluded && j.score > 0;
    })
    .sort(function (a, b) {
      return b.score - a.score;
    })
    .slice(0, 5);

    var box = $("jobs");
    box.innerHTML = "";

    ranked.forEach(function (r, i) {

      var el = document.createElement("div");
      el.className = "res";

      var name = document.createElement("div");
      name.className = "name";
      name.textContent = (i + 1) + ". " + r.title;

      var num = document.createElement("div");
      num.className = "num";
      num.textContent = r.score + " %";

      var bar = document.createElement("div");
      bar.className = "bar";

      var f = document.createElement("i");
      f.style.width = r.score + "%";
      bar.appendChild(f);

      var why = document.createElement("div");
      why.className = "why";

      why.textContent = r.gaps.length
        ? "Points à développer : " + r.gaps.join(", ")
        : "Bonne correspondance avec tes préférences.";

      el.appendChild(name);
      el.appendChild(num);
      el.appendChild(bar);
      el.appendChild(why);

      var ul = linkList(r);
      if (ul) el.appendChild(ul);

      box.appendChild(el);

    });

    return ranked.map(function (r) {
      return {
        id: r.id,
        title: r.title,
        score: r.score,
        links: r.links
      };
    });
  }

  /* Carte "conseiller" : style injecté une seule fois, texte écrit en direct par le modèle. */
  function ensureAnalysisStyle() {
    if (document.getElementById("analysis-style")) return;
    var st = document.createElement("style"); st.id = "analysis-style";
    st.textContent = [
      "#analysis { margin-top: 24px; padding: 0; overflow: hidden; border-color: var(--accent, #0b6e8a); }",
      "#analysis .ai-head { display: flex; align-items: center; gap: 12px; padding: 16px 20px; background: var(--accent-soft, #dcedf3); border-bottom: 1px solid var(--line, #d5dee4); }",
      "#analysis .ai-avatar { flex: none; width: 40px; height: 40px; border-radius: 50%; display: grid; place-items: center; background: var(--accent, #0b6e8a); color: var(--accent-fg, #fff); font-family: var(--font-display, inherit); font-weight: 700; letter-spacing: .02em; }",
      "#analysis .ai-id { min-width: 0; flex: 1; }",
      "#analysis .ai-name { font-family: var(--font-display, inherit); font-weight: 700; font-size: 1.05rem; line-height: 1.2; }",
      "#analysis .ai-sub { font-size: .8125rem; color: var(--muted, #5b6b75); overflow-wrap: anywhere; }",
      "#analysis .ai-status { display: inline-flex; align-items: center; gap: 6px; font-size: .8125rem; font-weight: 600; color: var(--accent, #0b6e8a); white-space: nowrap; }",
      "#analysis .ai-status::before { content: ''; width: 8px; height: 8px; border-radius: 50%; background: currentColor; animation: ai-pulse 1.2s ease-in-out infinite; }",
      "#analysis[data-state='done'] .ai-status { color: var(--muted, #5b6b75); }",
      "#analysis[data-state='done'] .ai-status::before { animation: none; }",
      "#analysis[data-state='error'] .ai-status { color: #b3261e; }",
      "#analysis[data-state='error'] .ai-status::before { animation: none; }",
      "#analysis .ai-body { padding: 20px; }",
      "#analysis .ai-bubble { margin: 0; font-size: 1.05rem; line-height: 1.6; white-space: pre-wrap; max-width: 65ch; }",
      "#analysis[data-state='thinking'] .ai-bubble { color: var(--muted, #5b6b75); }",
      "#analysis[data-state='streaming'] .ai-bubble::after { content: ''; display: inline-block; width: 2px; height: 1.1em; margin-left: 2px; vertical-align: text-bottom; background: var(--accent, #0b6e8a); animation: ai-blink 1s steps(1) infinite; }",
      "#analysis .ai-note { margin: 12px 0 0; font-size: .8125rem; color: var(--muted, #5b6b75); }",
      "@keyframes ai-pulse { 50% { opacity: .25; } }",
      "@keyframes ai-blink { 50% { opacity: 0; } }",
      "@media (prefers-reduced-motion: reduce) { #analysis .ai-status::before, #analysis .ai-bubble::after { animation: none !important; } }"
    ].join("\n");
    document.head.appendChild(st);
  }

  var STATUS = { thinking: "Réfléchit…", streaming: "Écrit en direct", done: "Terminé", error: "Erreur" };

  function startAnalysis(vals, jobs) {
    const run = ++analysisRun;
    ollama.abort(); // coupe une analyse précédente encore en cours
    ensureAnalysisStyle();

    let box = $("analysis");
    if (!box) {
      box = document.createElement("div");
      box.id = "analysis";
      box.className = "card";
      $("jobs").insertAdjacentElement("afterend", box);
    }
    box.innerHTML = "";

    const head = document.createElement("div"); head.className = "ai-head";
    const av = document.createElement("div"); av.className = "ai-avatar"; av.textContent = "IA"; av.setAttribute("aria-hidden", "true");
    const id = document.createElement("div"); id.className = "ai-id";
    const nm = document.createElement("div"); nm.className = "ai-name"; nm.textContent = CONFIG.agentName;
    const sub = document.createElement("div"); sub.className = "ai-sub"; sub.textContent = CONFIG.model;
    id.appendChild(nm); id.appendChild(sub);
    const status = document.createElement("div"); status.className = "ai-status"; status.setAttribute("role", "status");
    head.appendChild(av); head.appendChild(id); head.appendChild(status);

    const body = document.createElement("div"); body.className = "ai-body";
    const bubble = document.createElement("p"); bubble.className = "ai-bubble"; bubble.setAttribute("aria-live", "polite");
    body.appendChild(bubble);
    box.appendChild(head); box.appendChild(body);

    function setState(state, text) {
      box.dataset.state = state;
      status.textContent = STATUS[state];
      if (text !== undefined) bubble.textContent = text;
    }
    setState("thinking", "Il lit tes résultats…");

    analyse_traits(vals, TRAITS, jobs, function (text) {
      if (run !== analysisRun) return;
      setState("streaming", text);
    }).then(function () {
      if (run !== analysisRun) return;
      box.dataset.state = "done"; status.textContent = STATUS.done;
    }).catch(function (e) {
      if (run !== analysisRun || (e && e.name === "AbortError")) return;
      setState("error", "Analyse impossible : " + (e && e.message ? e.message : e));
      const note = document.createElement("p"); note.className = "ai-note";
      note.textContent = "Vérifie qu'Ollama tourne, que le modèle " + CONFIG.model + " est installé (ollama list), et lance-le avec OLLAMA_ORIGINS=\"*\" ollama serve.";
      body.appendChild(note);
    });
  }

  function showResults() {
    var vals = traitValues();
    var list = $("list"); list.innerHTML = "";
    TRAITS.forEach(function (t) {
      var v = vals[t.key];
      var el = document.createElement("div"); el.className = "res";
      var name = document.createElement("div"); name.className = "name";
      var lab = document.createElement("div"); lab.textContent = t.label;
      var key = document.createElement("div"); key.className = "key";
      var code = document.createElement("code"); code.textContent = t.key; key.appendChild(code);
      name.appendChild(lab); name.appendChild(key);
      var num = document.createElement("div"); num.className = "num"; num.textContent = v;
      var sm = document.createElement("small"); sm.textContent = "/ " + t.max; num.appendChild(sm);
      var bar = document.createElement("div"); bar.className = "bar";
      var f = document.createElement("i"); f.style.width = Math.round((v - t.min) / (t.max - t.min) * 100) + "%"; bar.appendChild(f);
      el.appendChild(name); el.appendChild(num); el.appendChild(bar);
      list.appendChild(el);
    });
    var obj = { traits: vals };
    obj.jobs = showJobs(vals);
    $("json").value = JSON.stringify(obj, null, 2);
    $("quiz").hidden = true; $("out").hidden = false; $("msg").textContent = "";
    window.scrollTo(0, 0);
    startAnalysis(vals, obj.jobs);
  }

  $("copy").addEventListener("click", function () {
    var ta = $("json"), msg = $("msg");
    function fallback() { ta.focus(); ta.select(); msg.textContent = "Sélectionné : fais Ctrl+C."; }
    try {
      navigator.clipboard.writeText(ta.value).then(function () { msg.textContent = "Copié."; }, fallback);
    } catch (e) { fallback(); }
  });
  $("again").addEventListener("click", function () {
    analysisRun++; ollama.abort();
    answers = new Array(N).fill(null); idx = 0;
    $("out").hidden = true; $("quiz").hidden = false; renderQ(); window.scrollTo(0, 0);
  });

  /* Lit et vérifie jobs.json, puis remplit TRAITS, QUESTIONS, LEVELS, JOBS et CONFIG. */
  function applyData(data) {
    function bad(msg) { var e = new Error("jobs.json invalide : " + msg); e.invalid = true; return e; }
    if (!data || typeof data.traits !== "object" || !data.traits) throw bad("la section \"traits\" est absente.");

    var meta = data.meta || {};
    ["model", "agentName", "questionLead"].forEach(function (k) { if (typeof meta[k] === "string" && meta[k]) CONFIG[k] = meta[k]; });
    if (Array.isArray(meta.levels) && meta.levels.length >= 2) CONFIG.levels = meta.levels;
    LEVELS = CONFIG.levels;

    TRAITS = Object.keys(data.traits).map(function (k) {
      var t = data.traits[k] || {};
      var qs = Array.isArray(t.questions) ? t.questions.filter(function (q) { return typeof q === "string" && q; }) : [];
      return {
        key: k,
        label: t.label || k,
        short: t.short || t.label || k,
        description: t.description,
        min: typeof t.min === "number" ? t.min : 1,
        max: typeof t.max === "number" ? t.max : LEVELS.length,
        questions: qs
      };
    }).filter(function (t) { return t.questions.length; });
    if (!TRAITS.length) throw bad("aucun trait n'a de liste \"questions\".");

    QUESTIONS = [];
    if (meta.questionOrder === "alternate") {
      /* 1re question de chaque trait, puis 2e de chaque trait, etc. */
      var rounds = Math.max.apply(null, TRAITS.map(function (t) { return t.questions.length; }));
      for (var r = 0; r < rounds; r++) {
        TRAITS.forEach(function (t) { if (t.questions[r]) QUESTIONS.push([t.key, t.questions[r]]); });
      }
    } else {
      /* Par défaut : toutes les questions d'un trait d'affilée, dans l'ordre du JSON. */
      TRAITS.forEach(function (t) { t.questions.forEach(function (q) { QUESTIONS.push([t.key, q]); }); });
    }
    N = QUESTIONS.length;
    answers = new Array(N).fill(null);
    idx = 0;
    JOBS = Array.isArray(data.jobs) ? data.jobs : [];
  }

  $("qtext").textContent = "Chargement…";
  fetch("jobs.json").then(function (r) {
    if (!r.ok) throw new Error("http " + r.status);
    return r.json();
  }).then(function (data) {
    applyData(data);
    renderQ();
  }).catch(function (e) {
    $("qtext").textContent = e && e.invalid
      ? e.message
      : "Impossible de lire jobs.json. Vérifie qu'il est dans le même dossier que la page, et ouvre la page depuis un serveur (pas en double-clic sur le fichier).";
  });

  function showRadar(vals) {
    const canvas = document.getElementById("skillsRadar");
    if (!canvas || typeof Chart === "undefined") return;

    const ctx = canvas.getContext("2d");
    const labels = TRAITS.map(t => t.short);
    const values = TRAITS.map(t => {
      const value = Number(vals[t.key]);
      return ((value - t.min) / (t.max - t.min)) * 100;
    });

    if (window.skillsChart) window.skillsChart.destroy();

    window.skillsChart = new Chart(ctx, {
      type: "radar",
      data: {
        labels,
        datasets: [{
          label: "Mon profil",
          data: values,
          backgroundColor: "rgba(0, 112, 96, 0.16)",
          borderColor: "#007060",
          pointBackgroundColor: "#007060",
          pointBorderColor: "#fff",
          pointRadius: 4,
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: { legend: { display: false } },
        scales: {
          r: {
            min: 0,
            max: 100,
            ticks: { display: false },
            grid: { color: "rgba(149, 172, 205, 0.79)" },
            angleLines: { color: "rgba(240, 243, 248, 0.7)" },
            pointLabels: {
              color: "#ffffff",
              font: {
                family: getComputedStyle(document.body).fontFamily,
                size: 11,
                weight: "500"
              }
            }
          }
        }
      }
    });
  }

})();
