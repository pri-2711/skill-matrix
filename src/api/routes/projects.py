from flask import Blueprint, request, jsonify
from src.api.config import get_connection

projects_bp = Blueprint("projects", __name__)


# ── GET /api/projects ───────────────────────────────────────
@projects_bp.route("/api/projects", methods=["GET"])
def get_projects():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        "SELECT id, title, description, tech_stack, role, start_date, end_date, url, created_at "
        "FROM project ORDER BY id"
    )
    rows = cur.fetchall()
    cur.close()
    conn.close()

    projects = [
        {
            "id": r[0],
            "title": r[1],
            "description": r[2],
            "tech_stack": r[3],
            "role": r[4],
            "start_date": r[5].isoformat() if r[5] else None,
            "end_date": r[6].isoformat() if r[6] else None,
            "url": r[7],
            "created_at": r[8].isoformat() if r[8] else None,
        }
        for r in rows
    ]
    return jsonify(projects), 200


# ── POST /api/projects ──────────────────────────────────────
@projects_bp.route("/api/projects", methods=["POST"])
def add_project():
    data = request.get_json()
    if not data or not data.get("title"):
        return jsonify({"error": "title is required"}), 400

    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        """INSERT INTO project (title, description, tech_stack, role, start_date, end_date, url)
           VALUES (%s, %s, %s, %s, %s, %s, %s)
           RETURNING id, title, description, tech_stack, role, start_date, end_date, url, created_at""",
        (
            data["title"],
            data.get("description"),
            data.get("tech_stack"),
            data.get("role"),
            data.get("start_date"),
            data.get("end_date"),
            data.get("url"),
        ),
    )
    row = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()

    return jsonify({
        "id": row[0],
        "title": row[1],
        "description": row[2],
        "tech_stack": row[3],
        "role": row[4],
        "start_date": row[5].isoformat() if row[5] else None,
        "end_date": row[6].isoformat() if row[6] else None,
        "url": row[7],
        "created_at": row[8].isoformat() if row[8] else None,
    }), 201


# ── PUT /api/projects/<id> ──────────────────────────────────
@projects_bp.route("/api/projects/<int:project_id>", methods=["PUT"])
def update_project(project_id):
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body is required"}), 400

    fields, values = [], []
    for col in ("title", "description", "tech_stack", "role", "start_date", "end_date", "url"):
        if col in data:
            fields.append(f"{col} = %s")
            values.append(data[col])

    if not fields:
        return jsonify({"error": "No valid fields to update"}), 400

    values.append(project_id)
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        f"UPDATE project SET {', '.join(fields)} WHERE id = %s "
        "RETURNING id, title, description, tech_stack, role, start_date, end_date, url, created_at",
        values,
    )
    row = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()

    if not row:
        return jsonify({"error": "Project not found"}), 404

    return jsonify({
        "id": row[0],
        "title": row[1],
        "description": row[2],
        "tech_stack": row[3],
        "role": row[4],
        "start_date": row[5].isoformat() if row[5] else None,
        "end_date": row[6].isoformat() if row[6] else None,
        "url": row[7],
        "created_at": row[8].isoformat() if row[8] else None,
    }), 200


# ── DELETE /api/projects/<id> ───────────────────────────────
@projects_bp.route("/api/projects/<int:project_id>", methods=["DELETE"])
def delete_project(project_id):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM project WHERE id = %s RETURNING id", (project_id,))
    row = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()

    if not row:
        return jsonify({"error": "Project not found"}), 404

    return jsonify({"message": f"Project {project_id} deleted"}), 200
