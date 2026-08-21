#!/usr/bin/env python
"""Serve ADN static site locally with sensible defaults."""

from __future__ import annotations

import argparse
import http.server
import socketserver
import webbrowser
from pathlib import Path


LARGE_IMAGE_EXTENSIONS = {".avif", ".gif", ".jpeg", ".jpg", ".png", ".svg", ".webp"}
IMAGE_CACHE_SECONDS = 60 * 60 * 24


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Serve ADN static website locally")
    parser.add_argument("--port", type=int, default=5500, help="Port to listen on (default: 5500)")
    parser.add_argument(
        "--no-browser",
        action="store_true",
        help="Do not automatically open browser tab",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    project_root = Path(__file__).resolve().parent

    class Handler(http.server.SimpleHTTPRequestHandler):
        def __init__(self, *handler_args, **handler_kwargs):
            super().__init__(*handler_args, directory=str(project_root), **handler_kwargs)

        def end_headers(self) -> None:
            request_path = self.path.split("?", 1)[0].split("#", 1)[0]
            suffix = Path(request_path).suffix.lower()

            if suffix in LARGE_IMAGE_EXTENSIONS:
                self.send_header("Cache-Control", f"public, max-age={IMAGE_CACHE_SECONDS}")
            else:
                # Always revalidate non-image assets so HTML/CSS/JS/content updates show immediately.
                self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
                self.send_header("Pragma", "no-cache")
                self.send_header("Expires", "0")

            super().end_headers()

    with socketserver.TCPServer(("127.0.0.1", args.port), Handler) as server:
        public_url = f"http://127.0.0.1:{args.port}/"

        print("ADN local server running")
        print(f"Public site: {public_url}")

        try:
            server.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")


if __name__ == "__main__":
    main()
