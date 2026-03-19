from flask import Blueprint, request, jsonify
from src.api.config import get_connection

progress_bp = Blueprint("progress", __name__)


# ── GET /api/progress ───────────────────────────────────────
@progress_bp.route("/api/progress", methods=["GET"])
def get_all_progress():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        "SELECT id, skill_name, current_level, target_level, progress_percent, updated_at "
        "FROM user_progress ORDER BY id"
    )
    rows = cur.fetchall()
    cur.close()
    conn.close()

    progress = [
        {
            "id": r[0],
            "skill_name": r[1],
            "current_level": r[2],
            "target_level": r[3],
            "progress_percent": r[4],
            "updated_at": r[5].isoformat() if r[5] else None,
        }
        for r in rows
    ]
    return jsonify(progress), 200


# ── GET /api/progress/<id> ──────────────────────────────────
@progress_bp.route("/api/progress/<int:progress_id>", methods=["GET"])
def get_progress(progress_id):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        "SELECT id, skill_name, current_level, target_level, progress_percent, updated_at "
        "FROM user_progress WHERE id = %s",
        (progress_id,),
    )
    row = cur.fetchone()
    cur.close()
    conn.close()

    if not row:
        return jsonify({"error": "Progress record not found"}), 404

    return jsonify({
        "id": row[0],
        "skill_name": row[1],
        "current_level": row[2],
        "target_level": row[3],
        "progress_percent": row[4],
        "updated_at": row[5].isoformat() if row[5] else None,
    }), 200


# ── PUT /api/progress/<id> ──────────────────────────────────
@progress_bp.route("/api/progress/<int:progress_id>", methods=["PUT"])
def update_progress(progress_id):
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body is required"}), 400

    fields, values = [], []
    for col in ("skill_name", "current_level", "target_level", "progress_percent"):
        if col in data:
            fields.append(f"{col} = %s")
            values.append(data[col])

    if not fields:
        return jsonify({"error": "No valid fields to update"}), 400

    fields.append("updated_at = NOW()")
    values.append(progress_id)

    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        f"UPDATE user_progress SET {', '.join(fields)} WHERE id = %s "
        "RETURNING id, skill_name, current_level, target_level, progress_percent, updated_at",
        values,
    )
    row = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()

    if not row:
        return jsonify({"error": "Progress record not found"}), 404

    return jsonify({
        "id": row[0],
        "skill_name": row[1],
        "current_level": row[2],
        "target_level": row[3],
        "progress_percent": row[4],
        "updated_at": row[5].isoformat() if row[5] else None,
    }), 200
