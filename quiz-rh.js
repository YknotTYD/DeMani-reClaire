import ollama from "https://esm.sh/ollama@0.6.4/browser";

async function analyse_traits() {
  const res = await ollama.chat({
    model: "glm-4.7-flash",
    messages: [{ role: "system", content: "Each of the following are a score out of 5, be professional, analyse them, weak point, strong points, what matters, what doesn't, what points kind of synergize well, which ones do the opposite, be brief. leadership: 4, commercial: 1.5, relationnel: 5, rigueur: 3, analyse: 3.5, patrimoine: 2, international: 2.5, agri: 3, digital: 4, only talk about things that are worth talking about, don't feel forced to say something about every point, answer in plain text with no formating, 40 words maximum." }],
  });
  return res.message.content;
}

window.analyse_traits = analyse_traits;

(function () {
  /* Les traits et les métiers sont lus dans jobs.json (même dossier). Les questions restent ici. */
  var TRAITS = [];
  var JOBS = [];

  /* Deux questions par trait, la valeur du trait est la moyenne des deux (1 à 5). */
  var QUESTIONS = [
    ["leadership",    "diriger une équipe et prendre les décisions au quotidien."],
    ["commercial",    "négocier un contrat et convaincre un client de signer."],
    ["relationnel",   "passer mes journées à rencontrer et échanger avec de nouvelles personnes."],
    ["rigueur",       "vérifier que chaque dossier respecte parfaitement les règles et la réglementation."],
    ["analyse",       "étudier des chiffres, des bilans et des risques pour éclairer une décision."],
    ["patrimoine",    "conseiller des familles sur leurs placements, leur fiscalité et leur transmission."],
    ["international", "travailler avec des clients ou des collègues d'autres pays, en plusieurs langues."],
    ["agri",          "évoluer au contact des exploitations agricoles et des vignobles."],
    ["digital",       "travailler principalement à distance, avec des outils numériques."],
    ["leadership",    "former, motiver et faire grandir les membres de mon équipe."],
    ["commercial",    "atteindre des objectifs de vente ambitieux."],
    ["relationnel",   "entretenir une relation de confiance sur le long terme avec mes clients."],
    ["rigueur",       "suivre des procédures précises, sans place pour l'approximation."],
    ["analyse",       "évaluer le risque d'un projet avant de dire oui ou non."],
    ["patrimoine",    "construire une stratégie de placement sur mesure pour un client."],
    ["international", "voyager ou vivre à l'étranger pour mon travail."],
    ["agri",          "accompagner des agriculteurs ou des viticulteurs dans leurs projets."],
    ["digital",       "automatiser mes tâches et gérer mes dossiers entièrement en ligne."]
  ];
  var LEVELS = ["Pas du tout", "Un peu", "Moyennement", "Beaucoup", "Énormément"];

  var N = QUESTIONS.length;
  var answers = new Array(N).fill(null);
  var idx = 0;

  function $(id) { return document.getElementById(id); }

  function renderInput() {
    var box = $("input"); box.innerHTML = "";
    var s = document.createElement("div"); s.className = "opts"; s.setAttribute("role", "group"); s.setAttribute("aria-label", "Ça me plairait");
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
    $("tlabel").textContent = "Ça me plairait de…";
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
    if (e.key >= "1" && e.key <= "5") pick(+e.key);
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

// ollama jsoneditor

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
  }

  $("copy").addEventListener("click", function () {
    var ta = $("json"), msg = $("msg");
    function fallback() { ta.focus(); ta.select(); msg.textContent = "Sélectionné : fais Ctrl+C."; }
    try {
      navigator.clipboard.writeText(ta.value).then(function () { msg.textContent = "Copié."; }, fallback);
    } catch (e) { fallback(); }
  });
  $("again").addEventListener("click", function () {
    answers = new Array(N).fill(null); idx = 0;
    $("out").hidden = true; $("quiz").hidden = false; renderQ(); window.scrollTo(0, 0);
  });

  $("qtext").textContent = "Chargement…";
  fetch("jobs.json").then(function (r) {
    if (!r.ok) throw new Error("http " + r.status);
    return r.json();
  }).then(function (data) {
    TRAITS = Object.keys(data.traits).filter(function (k) {
      return QUESTIONS.some(function (q) { return q[0] === k; });
    }).map(function (k) {
      return { key: k, label: data.traits[k].label, min: data.traits[k].min, max: data.traits[k].max };
    });
    JOBS = data.jobs || [];
    renderQ();
  }).catch(function () {
    $("qtext").textContent = "Impossible de lire jobs.json. Vérifie qu'il est dans le même dossier que la page, et ouvre la page depuis un serveur (pas en double-clic sur le fichier).";
  });

  function showRadar(vals) {
  const canvas = document.getElementById("skillsRadar");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const keys = [
    "leadership", "commercial", "relationnel",
    "rigueur", "analyse", "patrimoine",
    "international", "agri", "digital"
  ];

  const labels = [
    "Leadership", "Commercial", "Relationnel",
    "Rigueur", "Analyse", "Patrimoine",
    "International", "Agri/Viti", "Digital"
  ];

  const values = keys.map(k => {
    const trait = TRAITS.find(t => t.key === k);
    const value = Number(vals[k] || 1);
    return trait
      ? ((value - trait.min) / (trait.max - trait.min)) * 100
      : 0;
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
plugins: {
  legend: { display: false }
},
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
