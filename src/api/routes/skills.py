from flask import Blueprint, request, jsonify
from src.api.config import get_connection

skills_bp = Blueprint("skills", __name__)


# ── GET /api/skills ─────────────────────────────────────────
@skills_bp.route("/api/skills", methods=["GET"])
def get_skills():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT id, skill_name, proficiency_level, created_at FROM user_skill ORDER BY id")
    rows = cur.fetchall()
    cur.close()
    conn.close()

    skills = [
        {
            "id": r[0],
            "skill_name": r[1],
            "proficiency_level": r[2],
            "created_at": r[3].isoformat() if r[3] else None,
        }
        for r in rows
    ]
    return jsonify(skills), 200


# ── POST /api/skills ────────────────────────────────────────
@skills_bp.route("/api/skills", methods=["POST"])
def add_skill():
    data = request.get_json()
    if not data or not data.get("skill_name"):
        return jsonify({"error": "skill_name is required"}), 400

    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        """INSERT INTO user_skill (skill_name, proficiency_level)
           VALUES (%s, %s) RETURNING id, skill_name, proficiency_level, created_at""",
        (data["skill_name"], data.get("proficiency_level", "Beginner")),
    )
    row = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()

    return jsonify({
        "id": row[0],
        "skill_name": row[1],
        "proficiency_level": row[2],
        "created_at": row[3].isoformat() if row[3] else None,
    }), 201


# ── PUT /api/skills/<id> ────────────────────────────────────
@skills_bp.route("/api/skills/<int:skill_id>", methods=["PUT"])
def update_skill(skill_id):
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body is required"}), 400

    fields, values = [], []
    for col in ("skill_name", "proficiency_level"):
        if col in data:
            fields.append(f"{col} = %s")
            values.append(data[col])

    if not fields:
        return jsonify({"error": "No valid fields to update"}), 400

    values.append(skill_id)
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        f"UPDATE user_skill SET {', '.join(fields)} WHERE id = %s RETURNING id, skill_name, proficiency_level, created_at",
        values,
    )
    row = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()

    if not row:
        return jsonify({"error": "Skill not found"}), 404

    return jsonify({
        "id": row[0],
        "skill_name": row[1],
        "proficiency_level": row[2],
        "created_at": row[3].isoformat() if row[3] else None,
    }), 200


# ── DELETE /api/skills/<id> ─────────────────────────────────
@skills_bp.route("/api/skills/<int:skill_id>", methods=["DELETE"])
def delete_skill(skill_id):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM user_skill WHERE id = %s RETURNING id, skill_name", (skill_id,))
    row = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()

    if not row:
        return jsonify({"error": "Skill not found"}), 404

    return jsonify({"message": f"Skill {skill_id} deleted"}), 200
