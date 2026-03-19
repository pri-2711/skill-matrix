import sys
import os

# ── Ensure project root is on sys.path so all modules resolve ──
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from flask import Flask, send_from_directory
from flask_cors import CORS

from src.api.routes.skills import skills_bp
from src.api.routes.progress import progress_bp
from src.api.routes.certificates import certificates_bp
from src.api.routes.projects import projects_bp
from src.api.routes.recommendations import recommendations_bp
from src.api.routes.resume import resume_bp
from database.schema_manager import ensure_schema


def create_app():
    app = Flask(__name__)
    CORS(app)
    
    app.upload_folder = os.path.join(PROJECT_ROOT, "static", "uploads")
    os.makedirs(app.upload_folder, exist_ok=True)

    # Serve uploaded files
    @app.route("/uploads/<path:filename>")
    def uploaded_file(filename):
        return send_from_directory(app.upload_folder, filename)

    # Ensure database schema exists
    try:
        ensure_schema()
        print("Database schema verified.")
    except Exception as e:
        print(f"Warning: Could not verify database schema: {e}")

    # Register blueprints
    app.register_blueprint(skills_bp)
    app.register_blueprint(progress_bp)
    app.register_blueprint(certificates_bp)
    app.register_blueprint(projects_bp)
    app.register_blueprint(recommendations_bp)
    app.register_blueprint(resume_bp)

    # Root index — shows all available endpoints
    @app.route("/", methods=["GET"])
    def index():
        return """
        <!DOCTYPE html>
        <html>
        <head>
            <title>Skill Matrix API</title>
            <style>
                body { font-family: 'Segoe UI', sans-serif; max-width: 720px; margin: 60px auto; background: #0f172a; color: #e2e8f0; padding: 0 20px; }
                h1 { color: #38bdf8; }
                h2 { color: #94a3b8; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; margin-top: 32px; }
                table { width: 100%; border-collapse: collapse; margin-top: 8px; }
                td { padding: 8px 12px; border-bottom: 1px solid #1e293b; }
                td:first-child { color: #22d3ee; font-weight: 600; width: 80px; }
                td:nth-child(2) { color: #f8fafc; font-family: monospace; }
                a { color: #38bdf8; text-decoration: none; }
                .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; }
                .get { background: #064e3b; color: #6ee7b7; }
                .post { background: #172554; color: #93c5fd; }
                .put { background: #422006; color: #fdba74; }
                .delete { background: #450a0a; color: #fca5a5; }
            </style>
        </head>
        <body>
            <h1>&#128640; Skill Matrix API</h1>
            <p>Welcome! The API is running. Available endpoints:</p>

            <h2>Skills</h2>
            <table>
                <tr><td><span class="badge get">GET</span></td><td>/api/skills</td></tr>
                <tr><td><span class="badge post">POST</span></td><td>/api/skills</td></tr>
                <tr><td><span class="badge put">PUT</span></td><td>/api/skills/&lt;id&gt;</td></tr>
                <tr><td><span class="badge delete">DELETE</span></td><td>/api/skills/&lt;id&gt;</td></tr>
            </table>

            <h2>Progress</h2>
            <table>
                <tr><td><span class="badge get">GET</span></td><td>/api/progress</td></tr>
                <tr><td><span class="badge get">GET</span></td><td>/api/progress/&lt;id&gt;</td></tr>
                <tr><td><span class="badge put">PUT</span></td><td>/api/progress/&lt;id&gt;</td></tr>
            </table>

            <h2>Certificates</h2>
            <table>
                <tr><td><span class="badge get">GET</span></td><td>/api/certificates</td></tr>
                <tr><td><span class="badge post">POST</span></td><td>/api/certificates</td></tr>
                <tr><td><span class="badge put">PUT</span></td><td>/api/certificates/&lt;id&gt;</td></tr>
                <tr><td><span class="badge delete">DELETE</span></td><td>/api/certificates/&lt;id&gt;</td></tr>
            </table>

            <h2>Projects</h2>
            <table>
                <tr><td><span class="badge get">GET</span></td><td>/api/projects</td></tr>
                <tr><td><span class="badge post">POST</span></td><td>/api/projects</td></tr>
                <tr><td><span class="badge put">PUT</span></td><td>/api/projects/&lt;id&gt;</td></tr>
                <tr><td><span class="badge delete">DELETE</span></td><td>/api/projects/&lt;id&gt;</td></tr>
            </table>

            <h2>Recommendations</h2>
            <table>
                <tr><td><span class="badge post">POST</span></td><td>/api/recommendations</td></tr>
            </table>

            <h2>Resume</h2>
            <table>
                <tr><td><span class="badge post">POST</span></td><td>/api/resume</td></tr>
                <tr><td><span class="badge get">GET</span></td><td>/api/resume</td></tr>
            </table>

            <h2>Health</h2>
            <table>
                <tr><td><span class="badge get">GET</span></td><td><a href="/api/health">/api/health</a></td></tr>
            </table>
        </body>
        </html>
        """, 200

    # Health-check endpoint
    @app.route("/api/health", methods=["GET"])
    def health():
        return {"status": "ok"}, 200

    return app


if __name__ == "__main__":
    app = create_app()
    print("\n  Registered routes:")
    for rule in app.url_map.iter_rules():
        methods = ",".join(sorted(rule.methods - {"HEAD", "OPTIONS"}))
        if methods:
            print(f"    {methods:10s}  {rule.rule}")
    print()
    app.run(debug=True, port=5000)
