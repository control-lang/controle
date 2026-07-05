import os
import re

BASE_DIR = os.path.dirname(os.path.abspath(__file__))


def fix_database_url(url):
    """SQLAlchemy exige 'postgresql://', não 'postgres://'."""
    if url and url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)
    return url


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "chave-super-segura-mude-em-producao")

    _raw_db = os.environ.get("DATABASE_URL", "")
    if _raw_db:
        SQLALCHEMY_DATABASE_URI = fix_database_url(_raw_db)
    else:
        SQLALCHEMY_DATABASE_URI = f"sqlite:///{os.path.join(BASE_DIR, 'database.db')}"

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Sessão segura para produção (HTTPS)
    SESSION_COOKIE_SECURE = os.environ.get("RENDER") == "true"
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = "Lax"
