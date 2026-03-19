import json
from flask import Blueprint, request, jsonify
from src.api.config import get_connection

resume_bp = Blueprint("resume", __name__)


# ── POST /api/resume ────────────────────────────────────────
@resume_bp.route("/api/resume", methods=["POST"])
def generate_resume():
    """
    Generate a resume from current skills, certificates, and projects,
    then store it in the DB.
    Optional body: { "title": "My Resume", "summary": "Senior dev ..." }
    """
    data = request.get_json() or {}
    conn = get_connection()
    cur = conn.cursor()

    # Gather skills
    cur.execute("SELECT id, skill_name, proficiency_level FROM user_skill ORDER BY id")
    skills = [
        {"id": r[0], "skill_name": r[1], "proficiency_level": r[2]}
        for r in cur.fetchall()
    ]

    # Gather certificates
    cur.execute("SELECT id, title, issuer, issue_date, expiry_date, credential_url FROM certificate ORDER BY id")
    certs = [
        {
            "id": r[0], "title": r[1], "issuer": r[2],
            "issue_date": r[3].isoformat() if r[3] else None,
            "expiry_date": r[4].isoformat() if r[4] else None,
            "credential_url": r[5],
        }
        for r in cur.fetchall()
    ]

    # Gather projects
    cur.execute("SELECT id, title, description, tech_stack, role, start_date, end_date, url FROM project ORDER BY id")
    projects = [
        {
            "id": r[0], "title": r[1], "description": r[2],
            "tech_stack": r[3], "role": r[4],
            "start_date": r[5].isoformat() if r[5] else None,
            "end_date": r[6].isoformat() if r[6] else None,
            "url": r[7],
        }
        for r in cur.fetchall()
    ]

    # Store in DB
    cur.execute(
        """INSERT INTO resume (title, summary, skills_json, certificates_json, projects_json)
           VALUES (%s, %s, %s, %s, %s)
           RETURNING id, title, summary, skills_json, certificates_json, projects_json, generated_at""",
        (
            data.get("title", "My Resume"),
            data.get("summary", ""),
            json.dumps(skills),
            json.dumps(certs),
            json.dumps(projects),
        ),
    )
    row = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()

    return jsonify({
        "id": row[0],
        "title": row[1],
        "summary": row[2],
        "skills": json.loads(row[3]),
        "certificates": json.loads(row[4]),
        "projects": json.loads(row[5]),
        "generated_at": row[6].isoformat() if row[6] else None,
    }), 201


# ── GET /api/resume ─────────────────────────────────────────
@resume_bp.route("/api/resume", methods=["GET"])
def get_resumes():
    """Return all stored resumes (most recent first)."""
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        "SELECT id, title, summary, skills_json, certificates_json, projects_json, generated_at "
        "FROM resume ORDER BY generated_at DESC"
    )
    rows = cur.fetchall()
    cur.close()
    conn.close()

    resumes = [
        {
            "id": r[0],
            "title": r[1],
            "summary": r[2],
            "skills": json.loads(r[3]) if r[3] else [],
            "certificates": json.loads(r[4]) if r[4] else [],
            "projects": json.loads(r[5]) if r[5] else [],
            "generated_at": r[6].isoformat() if r[6] else None,
        }
        for r in rows
    ]
    return jsonify(resumes), 200
