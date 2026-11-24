import json

INF = float("inf")


def clamp(v):
    return max(0.0, min(1.0, v))

def score_criterion(c, trait, x):
    """Retourne un score dans [0, 1], ou None si x viole une borne."""
    t = float(c["target"])
    mn, mx = c.get("min"), c.get("max")
    tmin, tmax = trait["min"], trait["max"]

    if t == INF:
        if mn is not None and x < mn:
            return None
        top = mx if mx is not None else tmax
        return clamp((x - tmin) / (top - tmin))

    if t == -INF:
        if mx is not None and x > mx:
            return None
        bot = mn if mn is not None else tmin
        return clamp((tmax - x) / (tmax - bot))

    lo = mn if mn is not None else tmin   # cible finie : min et max sont des limites
    hi = mx if mx is not None else tmax
    if x < lo or x > hi:
        return None
    span = max(t - lo, hi - t)
    return 1.0 if span == 0 else clamp(1 - abs(x - t) / span)


def score_job(job, traits, profile):
    """Retourne (score /100, détail par critère) ou None si éliminé."""
    num = den = 0.0
    detail = {}
    for name, c in job["criteria"].items():
        s = score_criterion(c, traits[name], profile[name])
        if s is None:
            if c.get("strict"):
                return None
            s = 0.0
        w = c["weight"]
        num += w * s
        den += w
        detail[name] = round(100 * w * s / sum(k["weight"] for k in job["criteria"].values()), 1)
    return 100 * num / den, detail


def rank(profile, path="jobs.json", top = 3):
    data = json.load(open(path, encoding="utf-8"))
    results = []
    for job in data["jobs"]:
        r = score_job(job, data["traits"], profile)
        if r:
            results.append((round(r[0], 1), job["title"], r[1]))
    return sorted(results, reverse = True)[:top]


if __name__ == "__main__":
    profile = {
        "bac":           3, "experience": 1,    "leadership": 1.75, "commercial": 4.5, "relationnel": 3,
        "rigueur":       5, "analyse":    2.75, "autonomie":  5,    "patrimoine": 3,
        "international": 4, "agri":       0,    "digital":    5,
    }
    for score, title, detail in rank(profile, path = "test.json"):
        print(f"{score:5.1f}  {title}")
        print(f"{detail}\n")
