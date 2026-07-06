import os
import sys
from datetime import date

from flask import (
    Flask, request, jsonify, session, redirect, url_for,
    send_from_directory
)
from flask_login import (
    LoginManager, login_user, logout_user, login_required, current_user
)

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from config import Config
from models import db, User, Despesa

app = Flask(
    __name__,
    static_folder=os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."),
    static_url_path=""
)
app.config.from_object(Config)

db.init_app(app)
login_manager = LoginManager(app)
login_manager.login_view = "login_page"

with app.app_context():
    import sqlalchemy
    inspector = sqlalchemy.inspect(db.engine)
    if not inspector.has_table("users"):
        db.create_all()


@login_manager.user_loader
def load_user(user_id):
    return db.session.get(User, int(user_id))


# ────────── SERVE FRONTEND ──────────

@app.route("/")
def index():
    if not current_user.is_authenticated:
        return send_from_directory(app.static_folder, "login.html")
    return send_from_directory(app.static_folder, "index.html")


@app.route("/<path:filename>")
def static_files(filename):
    return send_from_directory(app.static_folder, filename)


# ────────── HTML PAGES ──────────

@app.route("/login")
def login_page():
    if current_user.is_authenticated:
        return redirect(url_for("index"))
    return send_from_directory(app.static_folder, "login.html")


@app.route("/register")
def register_page():
    return send_from_directory(app.static_folder, "register.html")


# ────────── AUTH API ──────────

@app.route("/api/auth/register", methods=["POST"])
def api_register():
    data = request.get_json()
    nome = data.get("nome", "").strip()
    email = data.get("email", "").strip().lower()
    senha = data.get("senha", "")

    if not nome or not email or not senha:
        return jsonify({"erro": "Todos os campos são obrigatórios"}), 400

    if len(senha) < 4:
        return jsonify({"erro": "A senha deve ter no mínimo 4 caracteres"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"erro": "Este email já está cadastrado"}), 409

    user = User(nome=nome, email=email)
    user.set_senha(senha)
    db.session.add(user)
    db.session.commit()

    login_user(user)
    return jsonify({"ok": True, "nome": user.nome})


@app.route("/api/auth/login", methods=["POST"])
def api_login():
    data = request.get_json()
    email = data.get("email", "").strip().lower()
    senha = data.get("senha", "")

    user = User.query.filter_by(email=email).first()

    if not user or not user.check_senha(senha):
        return jsonify({"erro": "Email ou senha inválidos"}), 401

    login_user(user, remember=True)

    # Atualiza session com nome
    session["user_nome"] = user.nome

    return jsonify({"ok": True, "nome": user.nome})


@app.route("/api/auth/logout", methods=["GET", "POST"])
@login_required
def api_logout():
    logout_user()
    session.clear()
    return send_from_directory(app.static_folder, "login.html")


@app.route("/api/auth/me")
@login_required
def api_me():
    return jsonify({"nome": current_user.nome, "email": current_user.email})


# ────────── DESPESAS API ──────────

@app.route("/api/despesas")
@login_required
def api_listar_despesas():
    despesas = Despesa.query.filter_by(user_id=current_user.id)\
        .order_by(Despesa.data.desc()).all()
    return jsonify([
        {
            "id": d.id,
            "data": d.data.isoformat(),
            "descricao": d.descricao,
            "valor": d.valor
        }
        for d in despesas
    ])


@app.route("/api/despesas", methods=["POST"])
@login_required
def api_criar_despesa():
    data = request.get_json()
    data_str = data.get("data")
    descricao = data.get("descricao", "").strip()
    valor = data.get("valor")

    if not data_str:
        return jsonify({"erro": "Informe a data"}), 400
    if not descricao:
        return jsonify({"erro": "Informe a descrição"}), 400
    if not valor or float(valor) <= 0:
        return jsonify({"erro": "Informe um valor válido"}), 400

    despesa = Despesa(
        data=date.fromisoformat(data_str),
        descricao=descricao,
        valor=float(valor),
        user_id=current_user.id
    )
    db.session.add(despesa)
    db.session.commit()

    return jsonify({"ok": True, "id": despesa.id}), 201


@app.route("/api/despesas/<int:id>", methods=["PUT"])
@login_required
def api_atualizar_despesa(id):
    despesa = Despesa.query.filter_by(id=id, user_id=current_user.id).first()
    if not despesa:
        return jsonify({"erro": "Despesa não encontrada"}), 404

    data = request.get_json()
    if "data" in data:
        despesa.data = date.fromisoformat(data["data"])
    if "descricao" in data:
        despesa.descricao = data["descricao"].strip()
    if "valor" in data:
        despesa.valor = float(data["valor"])

    db.session.commit()
    return jsonify({"ok": True})


@app.route("/api/despesas/<int:id>", methods=["DELETE"])
@login_required
def api_excluir_despesa(id):
    despesa = Despesa.query.filter_by(id=id, user_id=current_user.id).first()
    if not despesa:
        return jsonify({"erro": "Despesa não encontrada"}), 404

    db.session.delete(despesa)
    db.session.commit()
    return jsonify({"ok": True})


@app.route("/api/despesas/total")
@login_required
def api_total_despesas():
    total = db.session.query(db.func.coalesce(
        db.func.sum(Despesa.valor), 0
    )).filter(Despesa.user_id == current_user.id).scalar()
    return jsonify({"total": float(total)})


if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
