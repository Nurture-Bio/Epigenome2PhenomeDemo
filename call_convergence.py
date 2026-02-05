"""
Run this from a directory that has a .env file with
ANTHROPIC_API_KEY=sk-ant***
"""

import json
import os
import requests
from dotenv import load_dotenv

load_dotenv()

layer_data = {
    "ATAC-seq": {
        "metric": "Accessibility", "value": 6, "unit": "% open chromatin",
        "comparison": [
            {"gene": "BAT2", "pct": 93, "role": "Upstream"},
            {"gene": "ARO10", "pct": 78, "role": "Upstream"},
            {"gene": "ADH6", "pct": 69, "role": "Upstream"},
            {"gene": "ATF1", "pct": 6, "role": "Bottleneck"}
        ]
    },
    "ChIP-seq": {
        "marks": [
            {"name": "Nucleosome density", "value": 3.2, "baseline": 1.0, "type": "repressive"},
            {"name": "H3K4me3", "value": 0.6, "baseline": 1.0, "type": "active"},
            {"name": "H3K9ac", "value": 0.5, "baseline": 1.0, "type": "active"},
            {"name": "H4K16ac", "value": 0.4, "baseline": 1.0, "type": "active"}
        ]
    },
    "Hi-C": {
        "metrics": [
            {"name": "Compartment", "value": "B", "detail": "Inactive"},
            {"name": "PC1 Score", "value": "-0.42"},
            {"name": "Enhancer Loops", "value": "0", "detail": "None detected"}
        ]
    },
    "RNA-seq": {
        "condition": "Glucose-limited anaerobic (mid-brew)",
        "genes": [
            {"gene": "BAT2", "tpm": 842},
            {"gene": "ARO10", "tpm": 624},
            {"gene": "ADH6", "tpm": 389},
            {"gene": "ATF1", "tpm": 23}
        ]
    }
}

response = requests.post(
    "https://api.anthropic.com/v1/messages",
    headers={
        "Content-Type": "application/json",
        "x-api-key": os.environ["ANTHROPIC_API_KEY"],
        "anthropic-version": "2023-06-01"
    },
    json={
        "model": "claude-sonnet-4-20250514",
        "max_tokens": 1000,
        "system": (
            "You are a metabolic engineer using epigenomic data to diagnose flux "
            "bottlenecks in yeast biosynthetic pathways.\n\n"
            "Context: The user is engineering S. cerevisiae to produce isoamyl acetate "
            "(banana flavor) via the Ehrlich pathway. Under anaerobic brewing conditions, "
            "the thermodynamics favor production — Gibbs free energy is negative through "
            "the entire pathway. Upstream enzymes (BAT2, ARO10, ADH6) are well-expressed "
            "and have open chromatin. Yet isoamyl acetate yield is low. The suspected "
            "bottleneck is ATF1 (alcohol acetyltransferase), the final esterification step.\n\n"
            "You will receive structured data from 4 epigenomic assays at the ATF1 locus. "
            "Your job is to answer: Is the bottleneck epigenetic? Is it reversible? "
            "What should the engineer do?\n\n"
            "IMPORTANT — this is S. cerevisiae. Use yeast-appropriate terminology only. "
            "CRISPRa in yeast uses dCas9-VP64 or dCas9-VPR, NOT mammalian effectors "
            "like p300 or p65. H3K4me3 is a methylation mark, not an acetylation mark — "
            "do not group it with acetylation marks. Yeast histone acetyltransferases "
            "include Gcn5, Esa1, and Sas2.\n\n"
            "CRITICAL: All recommended interventions must be EPIGENETIC ONLY and "
            "LOCUS-TARGETED. No gene editing, no knockouts, no overexpression constructs, "
            "no coding sequence changes, and NO global small molecule treatments (no TSA, "
            "no nicotinamide, no HDAC inhibitors — these are untargeted and incompatible "
            "with food production). Valid interventions: CRISPRa (dCas9-VP64/VPR) to "
            "recruit transcriptional activators to the specific promoter, or dCas9 fused "
            "to chromatin remodeling domains targeted to the locus. The platform's value "
            "is precision — one locus, one intervention.\n\n"
            "Respond ONLY with JSON, no preamble, no backticks. Schema:\n"
            "{\n"
            '  "bullets": [{"text": "string", "isBullet": bool}],\n'
            '  "insights": [{"icon": "emoji", "label": "short label", "value": "short finding"}],\n'
            '  "actions": [{"action": "what to do", "because": "why, citing data"}]\n'
            "}\n\n"
            "Rules:\n"
            "- First bullet: your diagnosis in one sentence (isBullet: false)\n"
            "- Middle bullets: cross-modal evidence — inferences that require 2+ layers\n"
            "- Do NOT include engineering actions in bullets — those go in actions\n"
            "- Each bullet under 20 words\n"
            "- Exactly 3 insights with emoji\n"
            "- Exactly 1 action: the single best targeted epigenetic intervention, with because clause\n"
            "- Do NOT just restate each assay's numbers. Synthesize."
        ),
        "messages": [
            {"role": "user", "content": (
                "ATF1 is the suspected bottleneck in the Ehrlich pathway. "
                "Here is the epigenomic evidence:\n"
                f"{json.dumps(layer_data)}\n\n"
                "Is this epigenetic silencing, and can CRISPRa at the promoter reverse it?"
            )}
        ]
    }
)

data = response.json()
text = data["content"][0]["text"]

# Strip markdown backticks if Claude ignored the "no backticks" instruction
text = text.strip()
if text.startswith("```"):
    text = text.split("\n", 1)[1]  # remove first line
if text.endswith("```"):
    text = text.rsplit("```", 1)[0]
text = text.strip()

# If still not valid JSON, try to find it
if not text.startswith("{"):
    start = text.find("{")
    if start != -1:
        text = text[start:]

try:
    parsed = json.loads(text)
except json.JSONDecodeError:
    print("=== RAW RESPONSE (failed to parse) ===")
    print(text)
    print("\nClaude didn't return valid JSON. Run it again.")
    exit(1)

print("=== Paste this into GeneTopologyPage.jsx ===\n")
print("const aiTextChunks = [")
for b in parsed["bullets"]:
    bull = str(b["isBullet"]).lower()
    print(f"  {{ text: '{b['text']}', isBullet: {bull} }},")
print("];\n")
print("const aiInsights = [")
for i in parsed["insights"]:
    print(f"  {{ icon: '{i['icon']}', label: '{i['label']}', value: '{i['value']}' }},")
print("];\n")
print("const aiActions = [")
for a in parsed.get("actions", []):
    print(f"  {{ action: '{a['action']}', because: '{a['because']}' }},")
print("];")
