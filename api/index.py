import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from app import app


class VercelMiddleware:
    def __init__(self, wsgi_app):
        self.wsgi_app = wsgi_app

    def __call__(self, environ, start_response):
        forwarded_uri = environ.get("HTTP_X_FORWARDED_URI")
        if forwarded_uri:
            environ["PATH_INFO"] = forwarded_uri.split("?")[0]
        elif environ.get("PATH_INFO", "").startswith("/api/index"):
            sub_path = environ["PATH_INFO"][len("/api/index"):]
            environ["PATH_INFO"] = sub_path if sub_path else "/"
        return self.wsgi_app(environ, start_response)


app.wsgi_app = VercelMiddleware(app.wsgi_app)
