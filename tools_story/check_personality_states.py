#!/usr/bin/env python3
"""Check personality revision provenance and recorded art reviews, without inferring art quality.

This supplements check_dialogue_states.py. A previous alpha/size/art pass does
not count as a pass for the 2026-10-05 personality and prop support revision.
"""

import argparse
import hashlib
import json
import unicodedata
from collections import Counter, defaultdict
from difflib import SequenceMatcher
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REVISION = "companion-personality-20261005"
REVISION_DIR = Path("art_sources/companion_personality_revision_20261005")
MANIFEST = Path("art_sources/companion_dialogue_states_20261004/manifest.json")
CORE_STATES = {"neutral", "happy", "sad", "angry", "surprise"}
ACCEPTED = {"internally_accepted", "integrated", "complete"}
DESIGN_FIELDS = (
    "id", "key", "label", "body_and_emotion", "sample_line",
    "semantic_family", "prop_support", "decision", "reason",
)


def design_digest(job):
    """Stable digest of the individual plan, including its reuse decision."""
    payload = {field: job.get(field) for field in DESIGN_FIELDS}
    raw = json.dumps(payload, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(raw.encode()).hexdigest()


def text_digest(text):
    return hashlib.sha256(text.encode()).hexdigest()


def normalize(text):
    """Ignore punctuation/spacing only; don't claim synonym inference."""
    return "".join(
        char for char in unicodedata.normalize("NFKC", str(text)).casefold()
        if char.isalnum()
    )


def resolve(root, path):
    candidate = Path(str(path))
    return candidate if candidate.is_absolute() else root / candidate


def read_json(path):
    return json.loads(path.read_text())


def meaningful(value):
    if isinstance(value, str):
        return bool(value.strip()) and value.strip().casefold() not in {
            "pending", "todo", "tbd", "unknown", "待定", "待检查", "passed", "稳妥",
        }
    if isinstance(value, dict):
        return bool(value) and any(meaningful(item) for item in value.values())
    if isinstance(value, list):
        return bool(value) and any(meaningful(item) for item in value)
    return False


def support_valid(value, cid):
    if not meaningful(value):
        return False
    if cid != "liu-hanyan":
        return True
    # This validates the declared solution, not the image. Its actual grasping
    # contacts must still be recorded in prop_support_review after looking.
    declared = json.dumps(value, ensure_ascii=False).casefold()
    if isinstance(value, dict) and value.get("mode") in {
        "hand_held", "two_hand_cradle", "two_hand_held", "held_in_front",
    }:
        return meaningful(value.get("contacts") or value.get("contact_points"))
    if isinstance(value, str) and any(mode in declared for mode in [
        "hand_held", "two_hand_cradle", "two_hand_held", "held_in_front",
    ]):
        return any(term in declared for term in ["托", "抱", "握", "抓握", "contact", "support", "cradle"])
    return any(term in declared for term in ["托", "抱", "握", "抓握", "hand", "cradle"]) and not (
        any(term in declared for term in ["背负", "背上", "背贴", "back-mounted"])
        and not any(term in declared for term in ["禁止", "不再", "不得", "无背负", "不背负", "never", "no "])
    )


def verify(root, design_path, manifest_path, baseline_path):
    errors, warnings, pending, verified = [], [], [], []
    rows, groups = [], defaultdict(list)
    report = {
        "revision_id": REVISION,
        "scope": "Design diversity, actual generation provenance and explicit personality/prop reviews; visual quality is not inferred from strings or file dimensions",
        "errors": errors, "warnings": warnings, "pending": pending,
        "verified_jobs": verified, "jobs": rows,
    }

    def error(condition, message):
        if not condition:
            errors.append(message)

    def evidence_valid(evidence):
        return isinstance(evidence, list) and bool(evidence) and all(
            isinstance(path, str) and resolve(root, path).is_file() for path in evidence
        )

    atlas_path = root / "docs/design/story-atlas.json"
    atlas = read_json(atlas_path) if atlas_path.is_file() else {}
    roster = {c["id"] for c in atlas.get("characters", []) if c.get("type") == "companion"}
    expected_total = len(roster) * 6
    error(bool(roster), "Current atlas has no recruitable character roster")
    paths = {"design": design_path, "manifest": manifest_path, "baseline": baseline_path}
    missing = [name for name, path in paths.items() if not path.is_file()]
    if missing:
        pending.append({"id": "revision", "reasons": ["Missing revision input: " + ", ".join(missing)]})
        report["totals"] = {"planned": expected_total, "verified": 0, "pending": expected_total}
        return report
    design, manifest, baseline = [read_json(paths[name]) for name in ["design", "manifest", "baseline"]]
    revision_id = design.get("revision_id") or REVISION
    report["revision_id"] = revision_id
    design_characters = design.get("characters", [])
    manifest_characters = manifest.get("characters", [])
    design_ids = [c.get("character_id") for c in design_characters]
    manifest_ids = [c.get("character_id") for c in manifest_characters]
    error(len(design_ids) == len(roster) and len(set(design_ids)) == len(roster), "Design must contain every current recruitable character exactly once")
    error(set(design_ids) == roster, "Design and current atlas recruitable rosters differ")
    error(set(design_ids) == set(manifest_ids), "Design and current manifest rosters differ")
    all_design_jobs = [j for c in design_characters for j in c.get("jobs", [])]
    ids = [j.get("id") for j in all_design_jobs]
    manifest_jobs = {j["id"]: j for c in manifest_characters for j in c.get("jobs", [])}
    error(len(ids) == expected_total and len(set(ids)) == expected_total, "Design must cover six unique states per current recruitable character")
    error(set(ids) == set(manifest_jobs), "Design and current manifest state IDs differ")
    baseline_jobs = baseline.get("jobs", {})
    # The snapshot covers characters existing when this revision started.
    # Newly added recruitable characters have no previous native to retain.
    error(set(baseline_jobs) <= set(manifest_jobs), "Baseline contains state IDs absent from the current manifest")
    report["design_digests"] = {j["id"]: design_digest(j) for j in all_design_jobs if j.get("id")}

    normalized_briefs = defaultdict(list)
    retain_reasons = defaultdict(list)
    for character in design_characters:
        cid = character.get("character_id", "unknown")
        jobs = character.get("jobs", [])
        keys = [j.get("key") for j in jobs]
        error(len(jobs) == 6 and len(set(keys)) == 6 and CORE_STATES < set(keys), cid + ": expected five core states and one personal state")
        error(meaningful(character.get("personality_anchor")), cid + ": missing personality anchor")
        source = character.get("source_document")
        # Source documents may be relative to docs/design or repository root.
        error(bool(source) and (resolve(root, source).is_file() or resolve(root / "docs/design", source).is_file()), cid + ": missing character source document")
        briefs = [normalize(j.get("body_and_emotion", "")) for j in jobs]
        error(len(briefs) == 6 and all(briefs) and len(set(briefs)) == 6, cid + ": six body/emotion briefs must be distinct")

        for planned in jobs:
            aid = planned.get("id", cid + "/unknown")
            key = planned.get("key", "unknown")
            brief = planned.get("body_and_emotion", "")
            family = planned.get("semantic_family")
            decision = planned.get("decision")
            error(aid == cid + "/state-" + key, aid + ": inconsistent character/state ID")
            error(meaningful(family), aid + ": missing semantic action family")
            error(support_valid(planned.get("prop_support"), cid), aid + ": missing or invalid prop support design")
            error(decision in {"retain", "regenerate"}, aid + ": decision must be retain or regenerate")
            error(meaningful(planned.get("reason")), aid + ": missing individual decision reason")
            if decision == "retain":
                retain_reasons[normalize(planned.get("reason", ""))].append(aid)
            if isinstance(family, str) and family.strip():
                groups[key].append((aid, normalize(family)))
            normalized_briefs[normalize(brief)].append(aid)

            current = manifest_jobs.get(aid)
            if not current:
                continue
            reasons = []
            row = {"id": aid, "decision": decision, "semantic_family": family, "design_sha256": design_digest(planned)}
            revision = current.get("personality_revision", {})
            if not isinstance(revision, dict):
                revision = {}
            accepted = revision.get("result") in {"accepted", "passed"}
            row["revision_result"] = revision.get("result", "pending")
            if not revision:
                reasons.append("No individual review for this personality revision; earlier quality passes do not apply")
            if revision.get("revision_id") != revision_id:
                reasons.append("Revision ID is absent or stale")
            if revision.get("design_sha256") != row["design_sha256"]:
                reasons.append("Design digest is absent or stale")
            if revision.get("decision") != decision:
                reasons.append("Recorded revision decision does not match individual plan")
            if not accepted:
                reasons.append("Current image has not passed explicit personality review")
            if not meaningful(revision.get("reason")):
                reasons.append("Missing individual visual review reason")
            if not evidence_valid(revision.get("evidence")):
                reasons.append("Missing actual visual review evidence files")
            native = resolve(root, current.get("native_file") or "__missing_native__")
            native_sha = hashlib.sha256(native.read_bytes()).hexdigest() if native.is_file() else None
            row["current_native_sha256"] = native_sha
            old = baseline_jobs.get(aid, {})
            old_sha = old.get("native_sha256")
            if not old_sha and decision == "retain":
                error(False, aid + ": new character without a baseline image cannot retain an old native")
                reasons.append("Retain has no captured old image")
            if not native_sha:
                reasons.append("No current native image")
            if revision.get("reviewed_native_sha256") != native_sha or not native_sha:
                reasons.append("Personality review is not tied to the current native hash")
            generation = current.get("generation", {})
            if native_sha and generation.get("sha256") != native_sha:
                error(False, aid + ": current generation hash does not match image")
                reasons.append("Generation record is not tied to current native bytes")
            if current.get("status") not in ACCEPTED:
                reasons.append("Current native has not passed the existing art gates")
            if not current.get("runtime_file"):
                reasons.append("Current native has not been exported")
            elif current.get("export", {}).get("native_sha256") != native_sha:
                reasons.append("Runtime export belongs to an older native")

            actual_path = resolve(root, current.get("actual_prompt_file") or "__missing_prompt__")
            actual = actual_path.read_text() if actual_path.is_file() else None
            if actual is None:
                reasons.append("Missing actual generation prompt file")
            row["actual_prompt_file"] = current.get("actual_prompt_file")
            row["prompt_alignment"] = "not_claimed_for_retained_image" if decision == "retain" else "pending"

            if decision == "retain":
                if native_sha != old_sha:
                    reasons.append("Retain decision does not refer to the captured old image")
                # Reusing a whole image does not mean it was generated with the
                # new personality brief. Preserve its original prompt unchanged.
                if actual is not None and text_digest(actual) != old.get("actual_prompt_sha256"):
                    error(False, aid + ": retained image's original actual prompt was changed")
                    reasons.append("Retained actual call was changed after original generation")
                if revision.get("generated_for_revision"):
                    error(False, aid + ": retained image cannot claim new generation")
                    reasons.append("Retained image falsely claims new generation")
                if meaningful(revision.get("reason")):
                    retain_reasons["review:" + normalize(revision["reason"])].append(aid)
            elif decision == "regenerate":
                if native_sha == old_sha:
                    reasons.append("Planned replacement still points to pre-revision image")
                if not revision.get("generated_for_revision"):
                    reasons.append("New generation has not been recorded for this revision")
                if "reuse" in str(generation.get("source_type", "")).casefold():
                    reasons.append("Replacement generation is recorded as reuse")
                if not generation.get("tool_source") or not generation.get("actual_inputs"):
                    reasons.append("Missing actual tool output or input references")
                elif not all(resolve(root, path).is_file() for path in generation["actual_inputs"]):
                    reasons.append("Actual generation input reference is missing")
                recorded_prompt = generation.get("prompt_file")
                if not recorded_prompt or resolve(root, recorded_prompt) != actual_path:
                    reasons.append("Current generation record does not reference current actual prompt")
                if actual is not None:
                    if normalize(brief) and normalize(brief) in normalize(actual):
                        row["prompt_alignment"] = "body_brief_present_in_actual_call"
                    else:
                        alignment = revision.get("prompt_alignment", {})
                        semantic_pass = (
                            isinstance(alignment, dict)
                            and alignment.get("method") == "manual_semantic_review"
                            and alignment.get("result") == "passed"
                            and meaningful(alignment.get("reason"))
                            and alignment.get("prompt_sha256") == text_digest(actual)
                            and alignment.get("body_sha256") == text_digest(brief)
                        )
                        if semantic_pass:
                            row["prompt_alignment"] = "explicit_manual_review_of_reworded_actual_call"
                        else:
                            reasons.append("Actual call has no corresponding new body brief; rewording requires a hash-bound semantic review")

            if cid == "liu-hanyan":
                prop = revision.get("prop_support_review", {})
                if not isinstance(prop, dict) or not (
                    prop.get("result") in {"accepted", "passed"}
                    and meaningful(prop.get("reason"))
                    and prop.get("reviewed_native_sha256") == native_sha
                    and evidence_valid(prop.get("evidence"))
                ):
                    reasons.append("Pipa grasp, lower support and neck/body connection still need an image-specific prop review")
            row["pending_reasons"] = list(dict.fromkeys(reasons))
            if reasons:
                pending.append({"id": aid, "reasons": row["pending_reasons"]})
                if accepted:
                    error(False, aid + ": claims accepted personality revision with incomplete proof")
            else:
                verified.append(aid)
            rows.append(row)

    for brief, used_by in normalized_briefs.items():
        if brief and len(used_by) > 1:
            error(False, "Identical body brief across states: " + ", ".join(used_by))
    for reason, used_by in retain_reasons.items():
        if reason and len(used_by) > 1:
            error(False, "Retained images need individual reasons, not one blanket review: " + ", ".join(used_by))

    statistics = {}
    for key, items in groups.items():
        counts = Counter(family for _, family in items)
        limit = 5 if key == "neutral" else 3
        statistics[key] = {
            "states": len(items), "unique_families": len(counts),
            "largest_family": max(counts.values(), default=0),
            "maximum_same_family": limit,
            "families": [
                {"family": family, "count": count, "jobs": [aid for aid, candidate in items if candidate == family]}
                for family, count in counts.most_common()
            ],
        }
        for family, count in counts.items():
            error(count <= limit, f"{key}: {count} characters share family {family!r}; limit is {limit}")
    # Near-identical wording is a review hint. A rewrite/translation should not
    # fail merely because punctuation or a sensible small shared gesture exists.
    for key in CORE_STATES:
        same_state = [j for j in all_design_jobs if j.get("key") == key]
        for index, first in enumerate(same_state):
            for second in same_state[index + 1:]:
                similarity = SequenceMatcher(None, normalize(first.get("body_and_emotion", "")), normalize(second.get("body_and_emotion", ""))).ratio()
                if similarity >= 0.88:
                    warnings.append(f"{first['id']} / {second['id']}: body brief wording similarity {similarity:.2f}; inspect silhouettes, not names")
    report["semantic_family_statistics"] = statistics

    comparisons = manifest.get("personality_comparison_reviews", [])
    comparison_results = []
    for key in ["angry", "surprise", "sad"]:
        expected = {aid for aid, _ in groups.get(key, [])}
        candidates = [review for review in comparisons if review.get("key") == key]
        done = any(
            review.get("result") in {"accepted", "passed"}
            and review.get("revision_id") == revision_id
            and set(review.get("job_ids", [])) == expected
            and len(expected) == len(roster)
            and meaningful(review.get("reason"))
            and evidence_valid(review.get("evidence"))
            and review.get("native_sha256_by_job") == {
                row["id"]: row["current_native_sha256"] for row in rows if row["id"] in expected
            }
            for review in candidates
        )
        comparison_results.append({"key": key, "result": "recorded_review_passed" if done else "pending", "required_jobs": sorted(expected)})
        if not done:
            pending.append({"id": "cross-character/" + key, "reasons": [f"Need current-hash-bound contact review covering all {len(roster)} current recruitable characters in this emotion"]})
    report["cross_character_reviews"] = comparison_results
    report["totals"] = {
        "planned": len(all_design_jobs), "verified": len(verified),
        "pending": len(rows) - len(verified),
        "cross_character_groups_pending": sum(row["result"] == "pending" for row in comparison_results),
        "decisions": dict(Counter(j.get("decision") for j in all_design_jobs)),
    }
    return report


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--require-complete", action="store_true")
    parser.add_argument("--design", default=str(REVISION_DIR / "action-design.json"))
    parser.add_argument("--manifest", default=str(MANIFEST))
    parser.add_argument("--baseline", default=str(REVISION_DIR / "baseline-native-sha256.json"))
    parser.add_argument("--report", default=str(REVISION_DIR / "personality-contract-check.json"))
    parser.add_argument("--print-design-digests", action="store_true")
    args = parser.parse_args()
    if args.print_design_digests:
        design = read_json(resolve(ROOT, args.design))
        print(json.dumps({j["id"]: design_digest(j) for c in design["characters"] for j in c["jobs"]}, ensure_ascii=False, indent=2))
        return 0
    try:
        report = verify(ROOT, resolve(ROOT, args.design), resolve(ROOT, args.manifest), resolve(ROOT, args.baseline))
    except (OSError, ValueError, KeyError, TypeError) as exc:
        print(json.dumps({"errors": ["Cannot verify personality revision: " + str(exc)]}, ensure_ascii=False))
        return 1
    if args.require_complete and report["pending"]:
        report["errors"].append("Personality/prop revision or cross-character contact review remains pending")
    destination = resolve(ROOT, args.report)
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps({"totals": report["totals"], "errors": report["errors"], "warnings": report["warnings"], "report": str(destination)}, ensure_ascii=False))
    return int(bool(report["errors"]))


if __name__ == "__main__":
    raise SystemExit(main())
