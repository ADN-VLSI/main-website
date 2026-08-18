#!/usr/bin/env python3
"""Serve ADN static site locally with sensible defaults."""

from __future__ import annotations

import argparse
import http.server
import socketserver
import webbrowser
from pathlib import Path


LARGE_IMAGE_EXTENSIONS = {".avif", ".gif", ".jpeg", ".jpg", ".png", ".svg", ".webp"}
LARGE_IMAGE_THRESHOLD_BYTES = 200 * 1024
LARGE_IMAGE_CACHE_SECONDS = 60 * 60 * 24 * 30


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Serve ADN static website locally")
    parser.add_argument("--port", type=int, default=5500, help="Port to listen on (default: 5500)")
    parser.add_argument(
        "--no-browser",
        action="store_true",
        help="Do not automatically open browser tabs",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    project_root = Path(__file__).resolve().parent.parent

    class Handler(http.server.SimpleHTTPRequestHandler):
        def __init__(self, *handler_args, **handler_kwargs):
            super().__init__(*handler_args, directory=str(project_root), **handler_kwargs)

        def end_headers(self) -> None:
            request_path = self.path.split("?", 1)[0].split("#", 1)[0]
            suffix = Path(request_path).suffix.lower()

            if suffix in LARGE_IMAGE_EXTENSIONS:
                try:
                    target = Path(self.translate_path(request_path))
                    if target.is_file() and target.stat().st_size >= LARGE_IMAGE_THRESHOLD_BYTES:
                        self.send_header(
                            "Cache-Control",
                            f"public, max-age={LARGE_IMAGE_CACHE_SECONDS}, immutable",
                        )
                except OSError:
                    pass

            super().end_headers()

    with socketserver.TCPServer(("127.0.0.1", args.port), Handler) as server:
        base_url = f"http://127.0.0.1:{args.port}"
        public_url = f"{base_url}/"
        admin_url = f"{base_url}/admin/"

        print("ADN local server running")
        print(f"Public site: {public_url}")
        print(f"Admin panel: {admin_url}")

        if not args.no_browser:
            webbrowser.open(public_url)
            webbrowser.open(admin_url)

        try:
            server.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")


if __name__ == "__main__":
    main()
