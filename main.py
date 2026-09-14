from models.spam_detector import detect_spam
from models.scam_detector import detect_scam


# ==========================================
# Header
# ==========================================

print("\n" + "=" * 55)
print("                 🛡️  MAILGUARD")
print("           Email Security Analyzer")
print("=" * 55)


# ==========================================
# Get Email
# ==========================================

email = input("\n📧 Enter email:\n> ")


# ==========================================
# Run Detection
# ==========================================

spam_result = detect_spam(email)

scam_result = detect_scam(email)


# ==========================================
# Results
# ==========================================

print("\n" + "-" * 55)
print("                    RESULTS")
print("-" * 55)


# ------------------------------------------
# Spam
# ------------------------------------------

print("\n📩 SPAM DETECTION")


if spam_result["result"] == "Spam":

    print("   Status     : 🚨 SPAM")

else:

    print("   Status     : ✅ NORMAL")


print(
    f"   Confidence : "
    f"{spam_result['confidence']:.2f}%"
)


# ------------------------------------------
# Scam
# ------------------------------------------

print("\n🔐 SCAM / PHISHING DETECTION")


if scam_result["result"] == "Scam / Phishing":

    print(
        "   Status     : 🚨 SCAM / PHISHING"
    )

elif scam_result["result"] == "Suspicious":

    print(
        "   Status     : ⚠️  SUSPICIOUS"
    )

else:

    print(
        "   Status     : ✅ SAFE"
    )


print(
    f"   Confidence : "
    f"{scam_result['confidence']:.2f}%"
)


# ------------------------------------------
# Text Analysis
# ------------------------------------------

print("\n🔎 TEXT ANALYSIS")

print(
    f"   Text Score : "
    f"{scam_result['text_score']}%"
)


if scam_result["matched_keywords"]:

    print(
        "   Indicators : "
        + ", ".join(
            scam_result["matched_keywords"]
        )
    )

else:

    print(
        "   Indicators : None"
    )


# ------------------------------------------
# URL Analysis
# ------------------------------------------

print("\n🌐 URL ANALYSIS")


if scam_result["urls"]:

    for url_data in scam_result["urls"]:

        print(
            f"   URL        : "
            f"{url_data['url']}"
        )

        print(
            f"   Risk Score : "
            f"{url_data['score']:.2f}%"
        )

else:

    print("   No URLs detected.")


# ==========================================
# Final Verdict
# ==========================================

print("\n" + "-" * 55)
print("                  FINAL VERDICT")
print("-" * 55)


if (
    spam_result["result"] == "Spam"
    and
    scam_result["result"] == "Scam / Phishing"
):

    print(
        "🚨  DANGER: SPAM + SCAM / PHISHING EMAIL"
    )

elif scam_result["result"] == "Scam / Phishing":

    print(
        "🚨  DANGER: SCAM / PHISHING EMAIL"
    )

elif spam_result["result"] == "Spam":

    print(
        "⚠️   WARNING: SPAM EMAIL"
    )

elif scam_result["result"] == "Suspicious":

    print(
        "⚠️   WARNING: SUSPICIOUS EMAIL"
    )

else:

    print(
        "✅  This email appears to be safe."
    )


print("\n" + "=" * 55)