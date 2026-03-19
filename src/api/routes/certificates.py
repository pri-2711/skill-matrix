import os
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
from src.api.config import get_connection

certificates_bp = Blueprint("certificates", __name__)

def parse_cert_request():
    data = {}
    if request.is_json:
        data = request.get_json()
    else:
        data = dict(request.form)
        file = request.files.get("file")
        if file and file.filename:
            filename = secure_filename(file.filename)
            upload_folder = getattr(current_app, "upload_folder", "static/uploads")
            os.makedirs(upload_folder, exist_ok=True)
            file_path = os.path.join(upload_folder, filename)
            file.save(file_path)
            data["credential_url"] = f"/uploads/{filename}"
    return data


# ── GET /api/certificates ───────────────────────────────────
@certificates_bp.route("/api/certificates", methods=["GET"])
def get_certificates():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        "SELECT id, title, issuer, issue_date, expiry_date, credential_url, created_at "
        "FROM certificate ORDER BY id"
    )
    rows = cur.fetchall()
    cur.close()
    conn.close()

    certs = [
        {
            "id": r[0],
            "title": r[1],
            "issuer": r[2],
            "issue_date": r[3].isoformat() if r[3] else None,
            "expiry_date": r[4].isoformat() if r[4] else None,
            "credential_url": r[5],
            "created_at": r[6].isoformat() if r[6] else None,
        }
        for r in rows
    ]
    return jsonify(certs), 200


# ── POST /api/certificates ──────────────────────────────────
@certificates_bp.route("/api/certificates", methods=["POST"])
def add_certificate():
    data = parse_cert_request()
    if not data or not data.get("title"):
        return jsonify({"error": "title is required"}), 400

    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        """INSERT INTO certificate (title, issuer, issue_date, expiry_date, credential_url)
           VALUES (%s, %s, %s, %s, %s)
           RETURNING id, title, issuer, issue_date, expiry_date, credential_url, created_at""",
        (
            data["title"],
            data.get("issuer"),
            data.get("issue_date"),
            data.get("expiry_date"),
            data.get("credential_url"),
        ),
    )
    row = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()

    return jsonify({
        "id": row[0],
        "title": row[1],
        "issuer": row[2],
        "issue_date": row[3].isoformat() if row[3] else None,
        "expiry_date": row[4].isoformat() if row[4] else None,
        "credential_url": row[5],
        "created_at": row[6].isoformat() if row[6] else None,
    }), 201


# ── PUT /api/certificates/<id> ──────────────────────────────
@certificates_bp.route("/api/certificates/<int:cert_id>", methods=["PUT"])
def update_certificate(cert_id):
    data = parse_cert_request()
    if not data:
        return jsonify({"error": "Request body is required"}), 400

    fields, values = [], []
    for col in ("title", "issuer", "issue_date", "expiry_date", "credential_url"):
        if col in data:
            fields.append(f"{col} = %s")
            values.append(data[col])

    if not fields:
        return jsonify({"error": "No valid fields to update"}), 400

    values.append(cert_id)
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        f"UPDATE certificate SET {', '.join(fields)} WHERE id = %s "
        "RETURNING id, title, issuer, issue_date, expiry_date, credential_url, created_at",
        values,
    )
    row = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()

    if not row:
        return jsonify({"error": "Certificate not found"}), 404

    return jsonify({
        "id": row[0],
        "title": row[1],
        "issuer": row[2],
        "issue_date": row[3].isoformat() if row[3] else None,
        "expiry_date": row[4].isoformat() if row[4] else None,
        "credential_url": row[5],
        "created_at": row[6].isoformat() if row[6] else None,
    }), 200


# ── DELETE /api/certificates/<id> ───────────────────────────
@certificates_bp.route("/api/certificates/<int:cert_id>", methods=["DELETE"])
def delete_certificate(cert_id):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM certificate WHERE id = %s RETURNING id", (cert_id,))
    row = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()

    if not row:
        return jsonify({"error": "Certificate not found"}), 404

    return jsonify({"message": f"Certificate {cert_id} deleted"}), 200
