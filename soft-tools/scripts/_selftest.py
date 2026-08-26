"""Throwaway checks for discord_export.py — no network, no token."""
import sys
import discord_export as dx

dx.PAGE_SIZE = 3

UNIVERSE = [
    {"id": str(i),
     "timestamp": f"2025-07-{24 + (i > 4):02d}T0{i}:05:00.000000+00:00",
     "content": f"message {i}",
     "author": {"username": f"user{i % 2}", "bot": i == 3},
     "attachments": [{"filename": "plan.stl", "url": "https://cdn/x"}] if i == 2 else [],
     "embeds": []}
    for i in range(1, 8)
]


def fake_api_get(path, token, params=None):
    """Serve pages newest-first, the way Discord does."""
    desc = sorted(UNIVERSE, key=lambda m: -int(m["id"]))
    if params and "before" in params:
        desc = [m for m in desc if int(m["id"]) < int(params["before"])]
    elif params and "after" in params:
        desc = [m for m in desc if int(m["id"]) > int(params["after"])][-dx.PAGE_SIZE:]
    return desc[: params["limit"]]


dx.api_get = fake_api_get

backfill = [m["id"] for m in dx.fetch_messages("t", "c", None, None)]
assert backfill == ["1", "2", "3", "4", "5", "6", "7"], backfill
print("backfill paginates and returns oldest-first:", backfill)

forward = [m["id"] for m in dx.fetch_messages("t", "c", "4", None)]
assert forward == ["5", "6", "7"], forward
print("--after walks forward only:              ", forward)

capped = [m["id"] for m in dx.fetch_messages("t", "c", None, 2)]
assert capped == ["6", "7"], capped
print("--limit keeps the newest when backfilling:", capped)

md = dx.render_markdown(sorted(UNIVERSE, key=lambda m: int(m["id"])), {"name": "shop-talk"})
assert "# #shop-talk" in md
assert md.count("## 2025-07-24") == 1 and md.count("## 2025-07-25") == 1
assert "[plan.stl](https://cdn/x)" in md
assert "user1 [bot]" in md
print("markdown groups by day, marks bots, links attachments")

blank = [dict(m, content="") for m in UNIVERSE]
dx.warn_if_content_missing(blank)
print("\nall checks passed")
