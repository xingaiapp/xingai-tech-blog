#!/usr/bin/env python3
"""Submit the live XingAI Tech Blog sitemap URL list through IndexNow.

Notifies Bing and other IndexNow engines. Google dropped sitemap ping in 2023;
Search Console still reads robots.txt Sitemap.

Disclaimer: informational operator script. XingAI does not accept responsibility
for crawl outcomes.
"""

from __future__ import annotations

import json
import re
import ssl
import sys
import urllib.error
import urllib.request

KEY = "81cb1605b45dafc8512a99cb09c075e30c484be8d10d24f955561226814b415b"
HOST = "blog.xingai.app"
SITEMAP = f"https://{HOST}/sitemap.xml"
KEY_LOCATION = f"https://{HOST}/{KEY}.txt"
ENDPOINTS = (
    "https://api.indexnow.org/indexnow",
    "https://www.bing.com/indexnow",
)

CTX = ssl.create_default_context()


def fetch(url: str) -> tuple[int, str]:
    req = urllib.request.Request(url, headers={"User-Agent": "XingAI-IndexNow/1.0"})
    with urllib.request.urlopen(req, context=CTX, timeout=30) as resp:
        return resp.status, resp.read().decode("utf-8", "replace")


def post_json(url: str, payload: dict) -> tuple[int, str]:
    body = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=body,
        method="POST",
        headers={
            "Content-Type": "application/json; charset=utf-8",
            "User-Agent": "XingAI-IndexNow/1.0",
        },
    )
    try:
        with urllib.request.urlopen(req, context=CTX, timeout=30) as resp:
            return resp.status, resp.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as err:
        return err.code, err.read().decode("utf-8", "replace")


def main() -> int:
    key_status, key_body = fetch(KEY_LOCATION)
    if key_status != 200 or KEY not in key_body:
        print(f"key file missing or wrong: {KEY_LOCATION} -> {key_status}", file=sys.stderr)
        return 1

    sm_status, xml = fetch(SITEMAP)
    if sm_status != 200 or "<urlset" not in xml:
        print(f"sitemap unusable: {SITEMAP} -> {sm_status}", file=sys.stderr)
        print(xml[:300], file=sys.stderr)
        return 1

    urls = re.findall(r"<loc>\s*([^<]+?)\s*</loc>", xml)
    urls = [u.strip() for u in urls if u.strip().startswith(f"https://{HOST}")]
    if SITEMAP not in urls:
        urls.insert(0, SITEMAP)
    if not urls:
        print("sitemap had no loc entries", file=sys.stderr)
        return 1

    payload = {
        "host": HOST,
        "key": KEY,
        "keyLocation": KEY_LOCATION,
        "urlList": urls,
    }
    print(f"submitting {len(urls)} urls from {SITEMAP}")

    failed = 0
    for endpoint in ENDPOINTS:
        status, body = post_json(endpoint, payload)
        ok = status in (200, 202)
        print(f"{endpoint} -> {status} {'ok' if ok else 'FAIL'}")
        if body.strip():
            print(body[:300])
        if not ok:
            failed += 1
    return 1 if failed == len(ENDPOINTS) else 0


if __name__ == "__main__":
    raise SystemExit(main())
