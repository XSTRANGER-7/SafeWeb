# import sys
# import os
# sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# from src.predict import detect_url

# if __name__ == "__main__":
#     while True:
#         url = input("Enter a URL to check (or 'exit'): ")
#         if url.lower() == 'exit':
#             break
#         result = detect_url(url)
#         print("Result:", result)












# # app/cli.py
# import sys
# import os
# sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# from src.predict import detect_url

# if __name__ == "__main__":
#     print("🔹 Phishing URL Detector CLI 🔹")
#     while True:
#         url = input("\nEnter a URL to check (or type 'exit'): ").strip()
#         if url.lower() == 'exit':
#             break
#         if not url:
#             print("❌ Please enter a valid URL.")
#             continue
#         result = detect_url(url)
#         print(f"✅ Result: {result}")


















# import sys
# import os

# # Add parent directory to path
# sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# from src.predict import detect_url

# if __name__ == "__main__":
#     def sanitize(val):
#         if isinstance(val, str):
#             try:
#                 return val.encode('cp1252', 'ignore').decode('cp1252')
#             except Exception:
#                 try:
#                     return val.encode('ascii', 'ignore').decode('ascii')
#                 except Exception:
#                     return val
#         return val
#     # Argument mode (non-interactive): python app\cli.py "https://example.com"
#     if len(sys.argv) > 1:
#         url = " ".join(sys.argv[1:]).strip()
#         res = detect_url(url)
#         def compute_final_verdict(res_dict):
#             model_pred = (res_dict or {}).get('model_prediction') or ""
#             enrichment = (res_dict or {}).get('enrichment') or {}
#             ai_text = (res_dict or {}).get('ai_review') or ""
#             mp = str(model_pred).strip().lower()
#             ai_raw = str(ai_text).strip()
#             ai = ai_raw.lower()
#             # Determine AI label from the beginning of the response to avoid false matches like "no signs of phishing"
#             ai_label = None
#             if ai.startswith('safe'):
#                 ai_label = 'safe'
#             elif ai.startswith('likely phishing'):
#                 ai_label = 'likely phishing'
#             elif ai.startswith('phishing'):
#                 ai_label = 'phishing'

#             registered_on = None
#             ssl_days = None
#             if isinstance(enrichment, dict):
#                 registered_on = enrichment.get('domain_registered_on')
#                 ssl_days = enrichment.get('ssl_days')

#             if ai_label == 'safe':
#                 return 'Safe'
#             if ai_label == 'likely phishing':
#                 if registered_on or (ssl_days is not None):
#                     return 'Safe'
#                 return 'Likely Phishing'
#             if ai_label == 'phishing':
#                 return 'Phishing'

#             if mp == 'phishing':
#                 return 'Phishing'
#             return 'Safe'
#         if isinstance(res, dict):
#             print("Detection Result:")
#             print(f"Model Prediction : {sanitize(res.get('model_prediction'))}")
#             print(f"Domain/SSL/Page  : {sanitize(str(res.get('enrichment')))}")
#             try:
#                 enr = res.get('enrichment') or {}
#                 age = None
#                 reg = None
#                 if isinstance(enr, dict):
#                     age = enr.get('domain_age_days')
#                     reg = enr.get('domain_registered_on')
#                 # If the enrichment dict did not include it due to old cache, show None
#                 print(f"Domain Age Days  : {sanitize(str(age))}")
#                 print(f"Registered On    : {sanitize(str(reg))}")
#             except Exception:
#                 pass
#             print(f"AI Review        : {sanitize(res.get('ai_review'))}")
#             print(f"Final Verdict    : {compute_final_verdict(res)}")
#         else:
#             print(res)
#         sys.exit(0)

#     # Interactive mode
#     print("Phishing URL Detector CLI")
#     while True:
#         url = input("\nEnter URL to check (or 'exit'): ").strip()
#         if url.lower() == 'exit':
#             break
#         if not url:
#             print("Please enter a valid URL")
#             continue

#         res = detect_url(url)
#         def compute_final_verdict(res_dict):
#             model_pred = (res_dict or {}).get('model_prediction') or ""
#             enrichment = (res_dict or {}).get('enrichment') or {}
#             ai_text = (res_dict or {}).get('ai_review') or ""
#             mp = str(model_pred).strip().lower()
#             ai_raw = str(ai_text).strip()
#             ai = ai_raw.lower()
#             ai_label = None
#             if ai.startswith('safe'):
#                 ai_label = 'safe'
#             elif ai.startswith('likely phishing'):
#                 ai_label = 'likely phishing'
#             elif ai.startswith('phishing'):
#                 ai_label = 'phishing'

#             registered_on = None
#             ssl_days = None
#             if isinstance(enrichment, dict):
#                 registered_on = enrichment.get('domain_registered_on')
#                 ssl_days = enrichment.get('ssl_days')

#             if ai_label == 'safe':
#                 return 'Safe'
#             if ai_label == 'likely phishing':
#                 if registered_on or (ssl_days is not None):
#                     return 'Safe'
#                 return 'Likely Phishing'
#             if ai_label == 'phishing':
#                 return 'Phishing'

#             if mp == 'phishing':
#                 return 'Phishing'
#             return 'Safe'
#         if isinstance(res, dict):
#             print("\nDetection Result:")
#             print(f"Model Prediction : {sanitize(res.get('model_prediction'))}")
#             print(f"Domain/SSL/Page  : {sanitize(str(res.get('enrichment')))}")
#             try:
#                 enr = res.get('enrichment') or {}
#                 age = None
#                 reg = None
#                 if isinstance(enr, dict):
#                     age = enr.get('domain_age_days')
#                     reg = enr.get('domain_registered_on')
#                 print(f"Domain Age Days  : {sanitize(str(age))}")
#                 print(f"Registered On    : {sanitize(str(reg))}")
#             except Exception:
#                 pass
#             print(f"AI Review        : {sanitize(res.get('ai_review'))}")
#             print(f"Final Verdict    : {compute_final_verdict(res)}")
#         else:
#             print(res)





















import sys
import os

# Add parent directory to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from src.predict import detect_url

if __name__ == "__main__":
    def sanitize(val):
        if isinstance(val, str):
            try:
                return val.encode('cp1252', 'ignore').decode('cp1252')
            except Exception:
                try:
                    return val.encode('ascii', 'ignore').decode('ascii')
                except Exception:
                    return val
        return val
    # Argument mode (non-interactive): python app\cli.py "https://example.com"
    if len(sys.argv) > 1:
        url = " ".join(sys.argv[1:]).strip()
        res = detect_url(url)
        def compute_final_verdict(res_dict):
            model_pred = (res_dict or {}).get('model_prediction') or ""
            enrichment = (res_dict or {}).get('enrichment') or {}
            ai_text = (res_dict or {}).get('ai_review') or ""
            mp = str(model_pred).strip().lower()
            ai_raw = str(ai_text).strip()
            ai = ai_raw.lower()
            # Determine AI label from the beginning of the response to avoid false matches like "no signs of phishing"
            ai_label = None
            if ai.startswith('safe'):
                ai_label = 'safe'
            elif ai.startswith('likely phishing'):
                ai_label = 'likely phishing'
            elif ai.startswith('phishing'):
                ai_label = 'phishing'

            registered_on = None
            ssl_days = None
            if isinstance(enrichment, dict):
                registered_on = enrichment.get('domain_registered_on')
                ssl_days = enrichment.get('ssl_days')

            if ai_label == 'safe':
                return 'Safe'
            if ai_label == 'likely phishing':
                if registered_on or (ssl_days is not None):
                    return 'Safe'
                return 'Likely Phishing'
            if ai_label == 'phishing':
                return 'Phishing'

            if mp == 'phishing':
                return 'Phishing'
            return 'Safe'
        if isinstance(res, dict):
            print("Detection Result:")
            print(f"Model Prediction : {sanitize(res.get('model_prediction'))}")
            print(f"Domain/SSL/Page  : {sanitize(str(res.get('enrichment')))}")
            try:
                enr = res.get('enrichment') or {}
                age = None
                reg = None
                if isinstance(enr, dict):
                    age = enr.get('domain_age_days')
                    reg = enr.get('domain_registered_on')
                # If the enrichment dict did not include it due to old cache, show None
                print(f"Domain Age Days  : {sanitize(str(age))}")
                print(f"Registered On    : {sanitize(str(reg))}")
            except Exception:
                pass
            print(f"AI Review        : {sanitize(res.get('ai_review'))}")
            print(f"Final Verdict    : {compute_final_verdict(res)}")
        else:
            print(res)
        sys.exit(0)

    # Interactive mode
    print("Phishing URL Detector CLI")
    while True:
        url = input("\nEnter URL to check (or 'exit'): ").strip()
        if url.lower() == 'exit':
            break
        if not url:
            print("Please enter a valid URL")
            continue

        res = detect_url(url)
        def compute_final_verdict(res_dict):
            model_pred = (res_dict or {}).get('model_prediction') or ""
            enrichment = (res_dict or {}).get('enrichment') or {}
            ai_text = (res_dict or {}).get('ai_review') or ""
            mp = str(model_pred).strip().lower()
            ai_raw = str(ai_text).strip()
            ai = ai_raw.lower()
            ai_label = None
            if ai.startswith('safe'):
                ai_label = 'safe'
            elif ai.startswith('likely phishing'):
                ai_label = 'likely phishing'
            elif ai.startswith('phishing'):
                ai_label = 'phishing'

            registered_on = None
            ssl_days = None
            if isinstance(enrichment, dict):
                registered_on = enrichment.get('domain_registered_on')
                ssl_days = enrichment.get('ssl_days')

            if ai_label == 'safe':
                return 'Safe'
            if ai_label == 'likely phishing':
                if registered_on or (ssl_days is not None):
                    return 'Safe'
                return 'Likely Phishing'
            if ai_label == 'phishing':
                return 'Phishing'

            if mp == 'phishing':
                return 'Phishing'
            return 'Safe'
        if isinstance(res, dict):
            print("\nDetection Result:")
            print(f"Model Prediction : {sanitize(res.get('model_prediction'))}")
            print(f"Domain/SSL/Page  : {sanitize(str(res.get('enrichment')))}")
            try:
                enr = res.get('enrichment') or {}
                age = None
                reg = None
                if isinstance(enr, dict):
                    age = enr.get('domain_age_days')
                    reg = enr.get('domain_registered_on')
                print(f"Domain Age Days  : {sanitize(str(age))}")
                print(f"Registered On    : {sanitize(str(reg))}")
            except Exception:
                pass
            print(f"AI Review        : {sanitize(res.get('ai_review'))}")
            print(f"Final Verdict    : {compute_final_verdict(res)}")
        else:
            print(res)
