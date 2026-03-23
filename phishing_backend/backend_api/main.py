# import os
# import sys
# from typing import Optional

# from fastapi import FastAPI
# from pydantic import BaseModel
# from fastapi.middleware.cors import CORSMiddleware

# # Ensure `src` is importable
# sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# from src.predict import detect_url  # noqa: E402


# app = FastAPI(title="Phishing URL Detector API", version="1.0.0")

# # Enable CORS for local dev and common origins; adjust in production as needed
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )


# class DetectRequest(BaseModel):
#     url: str
#     # Flags are present for future control; current pipeline enriches and AI-reviews by default
#     enrich: Optional[bool] = True
#     use_ai: Optional[bool] = True


# def compute_final_verdict(res_dict: dict) -> str:
#     model_pred = (res_dict or {}).get('model_prediction') or ""
#     enrichment = (res_dict or {}).get('enrichment') or {}
#     ai_text = (res_dict or {}).get('ai_review') or ""
#     mp = str(model_pred).strip().lower()
#     ai_raw = str(ai_text).strip()
#     ai = ai_raw.lower()

#     ai_label = None
#     if ai.startswith('safe'):
#         ai_label = 'safe'
#     elif ai.startswith('likely phishing'):
#         ai_label = 'likely phishing'
#     elif ai.startswith('phishing'):
#         ai_label = 'phishing'

#     registered_on = None
#     ssl_days = None
#     if isinstance(enrichment, dict):
#         registered_on = enrichment.get('domain_registered_on')
#         ssl_days = enrichment.get('ssl_days')

#     # Check domain age and existence for classification
#     # If no domain information is available, classify as phishing
#     if not registered_on and ssl_days is None:
#         return 'Phishing'
    
#     # If domain exists but is new (less than 30 days for SSL or recently registered), classify as likely phishing
#     if ssl_days is not None and ssl_days < 30:
#         return 'Likely Phishing'
    
#     # If domain is old and established, prioritize safety
#     if registered_on or (ssl_days is not None and ssl_days >= 30):
#         if ai_label == 'safe':
#             return 'Safe'
#         # Even if AI suggests phishing, if domain is old and established, lean towards safe
#         if ai_label in ['likely phishing', 'phishing']:
#             return 'Safe'

#     if ai_label == 'safe':
#         return 'Safe'
#     if ai_label == 'likely phishing':
#         return 'Likely Phishing'
#     if ai_label == 'phishing':
#         return 'Phishing'

#     if mp == 'phishing':
#         return 'Phishing'
#     return 'Safe'


# @app.post("/api/detect")
# def detect(req: DetectRequest):
#     url = (req.url or "").strip()
#     if not url:
#         return {"error": "url required"}

#     result = detect_url(url)
#     if isinstance(result, dict):
#         final = compute_final_verdict(result)
#         return {**result, "final_verdict": final}
#     return {"raw": result}


# @app.get("/api/health")
# def health():
#     return {"status": "ok"}


# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", "8000")))








# import os
# import sys
# from typing import Optional

# from fastapi import FastAPI
# from pydantic import BaseModel
# from fastapi.middleware.cors import CORSMiddleware

# # Ensure src import works
# sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# from src.predict import detect_url  # your pipeline


# # -------------------------------
# # 🚀 FASTAPI INIT
# # -------------------------------
# app = FastAPI(title="Phishing URL Detector API", version="2.0.0")

# # CORS (allow all for now)
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )


# # -------------------------------
# # 📦 REQUEST MODEL
# # -------------------------------
# class DetectRequest(BaseModel):
#     url: str
#     enrich: Optional[bool] = True
#     use_ai: Optional[bool] = True


# # -------------------------------
# # 🧠 FINAL DECISION ENGINE
# # -------------------------------
# def compute_final_verdict(res_dict: dict) -> str:
#     model_pred = (res_dict or {}).get('model_prediction') or ""
#     enrichment = (res_dict or {}).get('enrichment') or {}
#     ai_text = (res_dict or {}).get('ai_review') or ""

#     mp = str(model_pred).strip().lower()
#     ai_raw = str(ai_text).strip().lower()

#     # Normalize AI output
#     if ai_raw.startswith('safe'):
#         ai_label = 'safe'
#     elif ai_raw.startswith('likely phishing'):
#         ai_label = 'likely_phishing'
#     elif ai_raw.startswith('phishing'):
#         ai_label = 'phishing'
#     else:
#         ai_label = None

#     # Extract enrichment features
#     domain_age = enrichment.get('domain_age_days')  # in days
#     ssl_days = enrichment.get('ssl_days')
#     has_password = enrichment.get('has_password_field', 0)
#     is_ip = enrichment.get('is_ip_domain', 0)

#     # ----------------------------
#     # 🚨 HARD RULES
#     # ----------------------------

#     # No domain info → phishing
#     if domain_age is None or domain_age == 0:
#         return "Phishing"

#     # Very new domain
#     if domain_age < 7:
#         return "Phishing"

#     # New domain
#     if domain_age < 30:
#         return "Likely Phishing"

#     # ----------------------------
#     # 🧠 SCORING SYSTEM
#     # ----------------------------
#     score = 0

#     # ML prediction
#     if mp == "phishing":
#         score += 2
#     else:
#         score -= 1

#     # AI prediction
#     if ai_label == "phishing":
#         score += 2
#     elif ai_label == "likely_phishing":
#         score += 1
#     elif ai_label == "safe":
#         score -= 2

#     # Domain age trust
#     if domain_age > 365:
#         score -= 2
#     elif domain_age > 90:
#         score -= 1

#     # SSL trust
#     if ssl_days is not None:
#         if ssl_days < 15:
#             score += 1
#         elif ssl_days > 90:
#             score -= 1

#     # Page behavior
#     if has_password:
#         score += 2

#     if is_ip:
#         score += 3

#     # ----------------------------
#     # 🎯 FINAL DECISION
#     # ----------------------------
#     if score >= 3:
#         return "Phishing"
#     elif score >= 1:
#         return "Likely Phishing"
#     else:
#         return "Safe"


# # -------------------------------
# # 🔍 MAIN API
# # -------------------------------
# @app.post("/api/detect")
# def detect(req: DetectRequest):
#     url = (req.url or "").strip()
#     if not url:
#         return {"error": "url required"}

#     result = detect_url(url)

#     if isinstance(result, dict):
#         final = compute_final_verdict(result)

#         return {
#             **result,
#             "final_verdict": final
#         }

#     return {"raw": result}


# # -------------------------------
# # ❤️ HEALTH CHECK
# # -------------------------------
# @app.get("/api/health")
# def health():
#     return {"status": "ok"}


# # -------------------------------
# # ▶️ RUN SERVER
# # -------------------------------
# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", "8000")))














import os
import sys
from typing import Optional

from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

# Allow importing src modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from src.predict import detect_url  # your pipeline


# -------------------------------
# 🚀 FASTAPI INIT
# -------------------------------
app = FastAPI(title="Phishing URL Detector API", version="4.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -------------------------------
# 📦 REQUEST MODEL
# -------------------------------
class DetectRequest(BaseModel):
    url: str
    enrich: Optional[bool] = True
    use_ai: Optional[bool] = True


# -----------------------------------------------------------------------
# 🧠 DECISION ENGINE  (higher score = more suspicious)
#
# SCORE BANDS
#   >= 7   → Phishing        (high danger)
#   >= 3   → Likely Phishing (moderate danger)
#    < 3   → Safe            (low danger)
#
# CONFIDENCE  =  clamp(50 + |score| * 8, 50, 99)
#   ·  Neutral score  →  50 % (we really don't know)
#   ·  Strong signals →  up to 99 %
# -----------------------------------------------------------------------
def compute_final_verdict(res_dict: dict) -> dict:

    res_dict   = res_dict or {}
    enrichment = res_dict.get("enrichment") or {}

    # ── raw inputs ──────────────────────────────────────────────────────
    model_pred = str(res_dict.get("model_prediction", "")).lower().strip()
    ai_raw     = str(res_dict.get("ai_review",        "")).lower().strip()

    domain_age  = enrichment.get("domain_age_days")   # int | None
    ssl_days    = enrichment.get("ssl_days")           # int | None
    ssl_valid   = bool(enrichment.get("ssl_valid",  0))
    has_pw      = bool(enrichment.get("has_password_field", 0))
    is_ip       = bool(enrichment.get("is_ip_domain",       0))
    redirects   = int(enrichment.get("redirect_count", 0))
    subdomain_n = int(enrichment.get("subdomain_count", 0))
    has_https   = bool(enrichment.get("has_https", ssl_valid))   # fallback

    score   = 0          # running risk score
    reasons = []         # human-readable evidence list

    # ═══════════════════════════════════════════════════════════════════
    # SECTION 1 – HARD BLOCKS  (instant verdict, no further analysis)
    # ═══════════════════════════════════════════════════════════════════

    # 1-A  No domain info at all
    if domain_age is None:
        return {
            "verdict":    "Phishing",
            "confidence": 97,
            "reason":     "Domain completely unresolvable – no WHOIS / DNS record found"
        }

    # 1-B  Extremely new domain  (<= 3 days)
    if domain_age <= 3:
        return {
            "verdict":    "Phishing",
            "confidence": 96,
            "reason":     f"Domain is only {domain_age} day(s) old – classic phishing pattern"
        }

    # 1-C  IP-based URL  (e.g. http://192.168.x.x/login)
    if is_ip:
        return {
            "verdict":    "Phishing",
            "confidence": 95,
            "reason":     "URL uses a raw IP address instead of a domain name"
        }

    # ═══════════════════════════════════════════════════════════════════
    # SECTION 2 – ML MODEL  (±2 each direction)
    # ═══════════════════════════════════════════════════════════════════
    if model_pred == "phishing":
        score   += 3
        reasons.append("ML model flagged as phishing")
    elif model_pred in ("likely phishing", "likely_phishing"):
        score   += 2
        reasons.append("ML model flagged as likely phishing")
    elif model_pred == "safe":
        score   -= 2
        reasons.append("ML model rated safe")
    # else: unknown → neutral

    # ═══════════════════════════════════════════════════════════════════
    # SECTION 3 – AI REVIEW  (±2 each direction)
    # ═══════════════════════════════════════════════════════════════════
    if ai_raw.startswith("phishing"):
        score   += 3
        reasons.append("AI review: phishing patterns detected")
    elif ai_raw.startswith("likely phishing"):
        score   += 2
        reasons.append("AI review: likely phishing")
    elif ai_raw.startswith("safe"):
        score   -= 2
        reasons.append("AI review: safe")

    # ═══════════════════════════════════════════════════════════════════
    # SECTION 4 – DOMAIN AGE  (key trust signal)
    # ═══════════════════════════════════════════════════════════════════
    if 4 <= domain_age <= 7:
        score   += 5
        reasons.append(f"Very new domain ({domain_age} days) – high risk")
    elif 8 <= domain_age <= 30:
        score   += 3
        reasons.append(f"New domain ({domain_age} days) – elevated risk")
    elif 31 <= domain_age <= 90:
        score   += 1
        reasons.append(f"Relatively new domain ({domain_age} days)")
    elif 91 <= domain_age <= 180:
        score   -= 1
        reasons.append(f"Moderately established domain ({domain_age} days)")
    elif 181 <= domain_age <= 365:
        score   -= 2
        reasons.append(f"Established domain ({domain_age} days)")
    elif domain_age > 365:
        score   -= 4
        reasons.append(f"Long-standing trusted domain ({domain_age} days)")

    # ═══════════════════════════════════════════════════════════════════
    # SECTION 5 – SSL  (domain + ssl together = strong trust)
    # ═══════════════════════════════════════════════════════════════════
    if not has_https and not ssl_valid:
        # No SSL whatsoever
        score   += 4
        reasons.append("No HTTPS / no SSL certificate – very high risk")

    elif ssl_valid:
        # Has a valid cert – base trust reduction
        score   -= 1
        reasons.append("Valid SSL certificate present")

        if ssl_days is not None:
            if ssl_days <= 0:
                # Cert issued today – suspicious (auto-generated for phishing)
                score   += 3
                reasons.append("SSL certificate issued today – suspicious")
            elif ssl_days <= 15:
                score   += 2
                reasons.append(f"Very new SSL certificate ({ssl_days} days) – suspicious")
            elif ssl_days <= 30:
                score   += 1
                reasons.append(f"New SSL certificate ({ssl_days} days)")
            elif ssl_days <= 90:
                score   -= 0   # neutral
                reasons.append(f"SSL certificate is {ssl_days} days old")
            elif ssl_days <= 365:
                score   -= 1
                reasons.append(f"SSL certificate has good age ({ssl_days} days)")
            else:
                score   -= 3
                reasons.append(f"Long-standing SSL certificate ({ssl_days} days) – strong trust")

            # Combined bonus: old domain + long-lived cert = very trustworthy
            if domain_age > 180 and ssl_days > 180:
                score   -= 2
                reasons.append("Domain + SSL both well-established – strong trust signal")

    elif not ssl_valid and has_https:
        # Has HTTPS in URL but cert is invalid/expired
        score   += 2
        reasons.append("HTTPS claimed but SSL certificate is invalid or expired")

    # ═══════════════════════════════════════════════════════════════════
    # SECTION 6 – BEHAVIOURAL SIGNALS
    # ═══════════════════════════════════════════════════════════════════

    # 6-A  Password / login field
    if has_pw:
        if domain_age < 90:
            score   += 4
            reasons.append("Login form on a new domain – very suspicious")
        elif domain_age < 365:
            score   += 2
            reasons.append("Login/password field detected on a young domain")
        else:
            score   += 1          # even old domains with login fields get a tiny bump
            reasons.append("Login/password field present")

    # 6-B  Excessive redirects
    if redirects >= 5:
        score   += 3
        reasons.append(f"Excessive redirects ({redirects}) – high risk")
    elif redirects >= 2:
        score   += 1
        reasons.append(f"Multiple redirects ({redirects})")

    # 6-C  Subdomain depth abuse
    if subdomain_n >= 4:
        score   += 3
        reasons.append(f"Very deep subdomain chain ({subdomain_n} levels) – suspicious")
    elif subdomain_n >= 2:
        score   += 1
        reasons.append(f"Multiple subdomain levels ({subdomain_n})")

    # ═══════════════════════════════════════════════════════════════════
    # SECTION 7 – FINAL VERDICT
    # ═══════════════════════════════════════════════════════════════════
    if score >= 8:
        verdict = "Phishing"
    elif score >= 4:
        verdict = "Likely Phishing"
    else:
        verdict = "Safe"

    # Confidence: anchored at 50 %, grows with |score|, capped at 99 %
    raw_conf   = 50 + abs(score) * 7
    confidence = min(99, max(50, raw_conf))

    # For very safe sites (score very negative) push confidence toward 99
    if score <= -5:
        confidence = min(99, 50 + abs(score) * 9)

    reason_text = "; ".join(reasons) if reasons else "No significant risk signals detected"

    return {
        "verdict":    verdict,
        "confidence": confidence,
        "reason":     reason_text
    }


# -----------------------------------------------------------------------
# 🔍 MAIN DETECT ENDPOINT
# -----------------------------------------------------------------------
@app.post("/api/detect")
def detect(req: DetectRequest):
    url = (req.url or "").strip()
    if not url:
        return {"error": "URL is required"}

    result = detect_url(url)

    if not isinstance(result, dict):
        return {"error": "Processing pipeline returned an unexpected result"}

    final = compute_final_verdict(result)

    return {
        "url":              url,
        "model_prediction": result.get("model_prediction"),
        "ai_review":        result.get("ai_review"),
        "enrichment":       result.get("enrichment"),
        "final_verdict":    final["verdict"],
        "confidence":       final["confidence"],
        "reason":           final["reason"],
        # convenience breakdown for the UI
        "risk_level": (
            "HIGH"   if final["verdict"] == "Phishing"        else
            "MEDIUM" if final["verdict"] == "Likely Phishing"  else
            "LOW"
        )
    }


# -----------------------------------------------------------------------
# ❤️  HEALTH CHECK
# -----------------------------------------------------------------------
@app.get("/api/health")
def health():
    return {"status": "ok", "version": "4.0.0"}


# -----------------------------------------------------------------------
# ▶️  RUN SERVER
# -----------------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 8000)))