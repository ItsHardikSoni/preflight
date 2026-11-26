
<div align="center">

# ✈️ Preflight

**क्या आपका vibe-coded ऐप लॉन्च के लिए तैयार है? सिर्फ़ एक कमांड में जानें।**

Preflight आपके प्रोजेक्ट को स्कैन करता है और लीक हुई API keys, खुले डेटाबेस, बिना सत्यापन वाले पेमेंट और लॉन्च से जुड़ी ज़रूरी कमियों की जाँच करता है। इसके बाद यह हर समस्या के समाधान के साथ एक रिपोर्ट कार्ड देता है।

[![License: MIT](https://img.shields.io/badge/license-MIT-34d399.svg)](../LICENSE)
[![Node](https://img.shields.io/badge/node-%E2%89%A520-38bdf8.svg)](../package.json)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-fbbf24.svg)](../CONTRIBUTING.md)

![Preflight report card](assets/report-card.png)

</div>

```bash
npx vibe-preflight
```

इसे इंस्टॉल करने, अकाउंट बनाने या नेटवर्क कनेक्शन की ज़रूरत नहीं है। आपका कोड कभी भी आपके कंप्यूटर से बाहर नहीं जाता।

## यह क्यों ज़रूरी है?

AI टूल्स की मदद से अब एक वीकेंड में ऐप बनाना आसान हो गया है। लेकिन उतनी ही आसानी से Stripe की secret key ब्राउज़र कोड में या Supabase की ऐसी टेबल में जा सकती है जिसे कोई भी पढ़ सकता है।

Preflight ऐसी गलतियों की जाँच करता है जो ऐप लॉन्च होने के बाद बड़ी समस्याएँ पैदा कर सकती हैं, ताकि आप लॉन्च से पहले उन्हें ठीक कर सकें।

## पहले किसी खराब ऐप पर इसे आज़माएँ

```bash
npx vibe-preflight --demo
```

यह जानबूझकर खराब बनाए गए एक डेमो ऐप को स्कैन करता है। इसमें सभी secrets नकली हैं। इससे आप देख सकते हैं कि समस्याओं वाली रिपोर्ट कैसी दिखाई देती है।

## यह किन चीज़ों की जाँच करता है?

अभी इसमें Security, Reliability और Launch से जुड़ी कुल 10 जाँच शामिल हैं। [सभी जाँच यहाँ देखें](rules.md)।

| | |
|---|---|
| 🔑 Client-side कोड में मौजूद Live Secrets | 🗄️ Row-Level Security के बिना Supabase Tables |
| 📄 ऐसी `.env` फाइलें जिन्हें Git में Commit किया जा सकता है | 💳 Signature Verification के बिना Stripe Webhooks |
| 🌍 सभी वेबसाइटों के लिए खुला CORS | 🚨 Error Monitoring का न होना |
| 🔒 Privacy Policy का न होना | 🔗 Title, Description या Share Image का न होना |

## विकल्प

```bash
npx vibe-preflight [path]          # scan a folder (default: current folder)
npx vibe-preflight --html          # also write a shareable preflight-report.html
npx vibe-preflight --json          # machine-readable output
npx vibe-preflight --ignore a,b    # skip checks by id
npx vibe-preflight --fail-on warning   # exit code policy: critical (default) | warning | never
```

अगर किसी Finding में किसी खास लाइन का उल्लेख है, तो उस लाइन पर या उससे ठीक ऊपर `// preflight-ignore <check-id>` लिखकर उसे अनदेखा किया जा सकता है।

पूरी फाइल या प्रोजेक्ट से जुड़ी समस्याओं के लिए (उदाहरण के लिए Privacy Page का न होना), `--ignore <check-id>` का उपयोग करके उस जाँच को छोड़ सकते हैं।

## CI में इसका उपयोग करें

```yaml
- run: npx vibe-preflight --fail-on critical
```

जब कोई Finding निर्धारित `--fail-on` स्तर तक पहुँचती है, तो कमांड Exit Code 1 देता है। इसका मतलब है कि अगर कोई Secret Leak होता है, तो Merge रुक सकता है।

## Claude Code के अंदर इसका उपयोग करें

Preflight एक Claude Code Plugin के रूप में भी उपलब्ध है। इसमें `/preflight` कमांड शामिल है, जो स्कैन चलाता है, रिपोर्ट समझाता है और एक-एक करके गंभीर समस्याओं को ठीक करने का सुझाव देता है। हर बदलाव से पहले आपकी अनुमति ली जाती है।

Claude Code में ये कमांड चलाएँ:

```text
/plugin marketplace add erdellll/preflight
/plugin install preflight@preflight
```

इसके बाद किसी भी प्रोजेक्ट में `/preflight` टाइप करें।

## 10 मिनट में एक नई जाँच जोड़ें

हर नई जाँच के लिए केवल एक छोटी फाइल और दो उदाहरण फोल्डर बनाने होते हैं। एक उदाहरण में जाँच को समस्या पकड़नी चाहिए और दूसरे में उसे समस्या नहीं बतानी चाहिए।

इसके लिए किसी Build Step या नई Dependency की ज़रूरत नहीं है।

[CONTRIBUTING.md](../CONTRIBUTING.md) पढ़ें या [`good first issue`](https://github.com/erdellll/preflight/issues?q=is%3Aopen+label%3A%22good+first+issue%22) लेबल वाले Issues में से कोई एक चुनें।

## यह Security Audit नहीं है

Preflight तेज़ Pattern Checks की मदद से सामान्य और अधिक प्रभाव डालने वाली गलतियों को पकड़ता है।

अगर रिपोर्ट में कोई समस्या नहीं दिखाई देती, तो इसका मतलब केवल इतना है कि इसकी किसी जाँच में समस्या नहीं मिली। इसका यह मतलब नहीं है कि आपका ऐप पूरी तरह सुरक्षित है।

इसे एक Seatbelt की तरह इस्तेमाल करें, न कि Security Review के विकल्प के रूप में।

## लाइसेंस

[MIT](../LICENSE)। किसी भी उपयोग के लिए निःशुल्क।
