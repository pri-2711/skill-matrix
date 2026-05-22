import hashlib
from flask import Blueprint, request, jsonify
from src.api.config import get_connection

auth_bp = Blueprint("auth", __name__)


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()


# ── POST /api/auth/register ─────────────────────────────────
@auth_bp.route("/api/auth/register", methods=["POST"])
def register():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body required"}), 400

    first_name = (data.get("first_name") or "").strip()
    password   = (data.get("password")   or "").strip()

    if not first_name or not password:
        return jsonify({"error": "first_name and password are required"}), 400

    if len(password) < 4:
        return jsonify({"error": "Password must be at least 4 characters"}), 400

    conn = get_connection()
    cur  = conn.cursor()
    try:
        cur.execute(
            """INSERT INTO app_user (first_name, password_hash)
               VALUES (%s, %s)
               RETURNING id, first_name, created_at""",
            (first_name, hash_password(password)),
        )
        row = cur.fetchone()
        conn.commit()
        return jsonify({
            "id":         row[0],
            "first_name": row[1],
            "created_at": row[2].isoformat() if row[2] else None,
        }), 201
    except Exception as e:
        conn.rollback()
        if "unique" in str(e).lower():
            return jsonify({"error": "Username already taken. Try a different name."}), 409
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        conn.close()


# ── POST /api/auth/login ─────────────────────────────────────
@auth_bp.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body required"}), 400

    first_name = (data.get("first_name") or "").strip()
    password   = (data.get("password")   or "").strip()

    if not first_name or not password:
        return jsonify({"error": "first_name and password are required"}), 400

    conn = get_connection()
    cur  = conn.cursor()
    cur.execute(
        """SELECT id, first_name, created_at FROM app_user
           WHERE first_name = %s AND password_hash = %s""",
        (first_name, hash_password(password)),
    )
    row = cur.fetchone()
    cur.close()
    conn.close()

    if not row:
        return jsonify({"error": "Invalid username or password"}), 401

    return jsonify({
        "id":         row[0],
        "first_name": row[1],
        "created_at": row[2].isoformat() if row[2] else None,
    }), 200
