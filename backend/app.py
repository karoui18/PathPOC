from io import BytesIO
from flask import Flask, request, jsonify, send_file, abort
from flask_cors import CORS
import os
from werkzeug.utils import secure_filename
from openslide import OpenSlide
from PIL import Image
from models import Slide, db, Folder, Report
from datetime import datetime

app = Flask(__name__)
CORS(app)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///db.sqlite"
app.config["UPLOAD_FOLDER"] = "uploads"

SLIDE_DIR = 'slides'
TILE_SIZE = 256

db.init_app(app)
with app.app_context():
    db.create_all()

@app.route("/", methods=["GET"])
def index():
    return jsonify({"status": "live", "version": "0.1.0"})

@app.route("/folders", methods=["GET"])
def list_folders():
    folders = Folder.query.all()
    return jsonify([
        {
            "id": f.id,
            "name": f.name,
            "created_at": f.created_at,
            "updated_at": f.updated_at,
            "slide_count": len(f.slides)
        } for f in folders
    ])

@app.route("/folders", methods=["POST"])
def create_folder():
    data = request.json
    now = datetime.now().isoformat()
    folder = Folder(name=data["name"], created_at=now, updated_at=now)
    db.session.add(folder)
    db.session.commit()
    return jsonify({"id": folder.id})

@app.route("/folders/<int:id>", methods=["PUT"])
def update_folder(id):
    data = request.json
    folder = Folder.query.get(id)
    if folder:
        folder.name = data["name"]
        folder.updated_at = datetime.now().isoformat()
        db.session.commit()
        return jsonify({"status": "updated"})
    return jsonify({"error": "not found"}), 404

@app.route("/slides", methods=["GET"])
def get_slides():
    folder_id = request.args.get("folder_id")
    query = Slide.query
    for s in Slide.query.all():
        print(s.filename, s.folder_id)
    if folder_id:
        query = query.filter_by(folder_id=folder_id)
    slides = query.all()
    return jsonify([
        {
            "id": s.id,
            "filename": s.filename,
            "created_at": s.created_at,
            "folder_id": s.folder_id,
            "folder_name": s.folder.name if s.folder else None
        } for s in slides
    ])


@app.route('/upload', methods=['POST'])
def upload():
    file = request.files.get('file')
    folder_id = request.form.get('folder_id')

    if not file:
        return jsonify({'error': 'No file'}), 400

    filename = secure_filename(file.filename)
    save_path = os.path.join('slides', filename)
    file.save(save_path)

    slide = Slide(
        filename=filename,
        created_at=datetime.now().isoformat(),
        folder_id=int(folder_id) if folder_id else None
    )
    db.session.add(slide)
    db.session.commit()

    return jsonify({'status': 'ok', 'slide_id': slide.id})

@app.route('/info/<slide_id>')
def slide_info(slide_id):
    from openslide import OpenSlide
    import os
    path = os.path.join("slides", slide_id)
    if not os.path.exists(path):
        return {"error": "Slide not found"}, 404

    slide = OpenSlide(path)
    return {
        "width": slide.dimensions[0],
        "height": slide.dimensions[1],
        "tile_size": 256,
        "levels": slide.level_count,
        "level_dimensions": slide.level_dimensions
    }

@app.route('/tiles/<slide_id>/<int:z>/<int:x>_<int:y>.jpeg')
def serve_tile(slide_id, z, x, y):
    slide_path = os.path.join("slides", slide_id)

    if not os.path.exists(slide_path):
        return abort(404, "Slide not found")

    try:
        slide = OpenSlide(slide_path)
    except Exception as e:
        return abort(500, str(e))

    # 👇 Flip viewer zoom level to OpenSlide zoom level
    openslide_level = slide.level_count - 1 - z

    if openslide_level < 0 or openslide_level >= slide.level_count:
        return abort(404, "Invalid zoom level")

    tile_dir = os.path.join("tiles", slide_id, str(z))
    tile_path = os.path.join(tile_dir, f"{x}_{y}.jpeg")

    if os.path.exists(tile_path):
        return send_file(tile_path, mimetype="image/jpeg")

    level_dims = slide.level_dimensions[openslide_level]
    tiles_x = (level_dims[0] + TILE_SIZE - 1) // TILE_SIZE
    tiles_y = (level_dims[1] + TILE_SIZE - 1) // TILE_SIZE

    if x >= tiles_x or y >= tiles_y:
        return abort(404, "Tile out of bounds")

    downsample = slide.level_downsamples[openslide_level]
    px = int(x * TILE_SIZE * downsample)
    py = int(y * TILE_SIZE * downsample)

    tile_w = min(TILE_SIZE, level_dims[0] - x * TILE_SIZE)
    tile_h = min(TILE_SIZE, level_dims[1] - y * TILE_SIZE)

    try:
        region = slide.read_region((px, py), openslide_level, (tile_w, tile_h)).convert("RGB")
        os.makedirs(tile_dir, exist_ok=True)
        region.save(tile_path, "JPEG", quality=85, optimize=True)
        return send_file(tile_path, mimetype="image/jpeg")
    except Exception as e:
        return abort(500, f"Tile read error: {str(e)}")


@app.route("/report/<int:slide_id>", methods=["GET"])
def get_reports(slide_id):
    reports = Report.query.filter_by(slide_id=slide_id).all()
    return jsonify([
        {
            "id": r.id,
            "title": r.title,
            "content": r.content,
            "created_at": r.created_at,
            "updated_at": r.updated_at
        } for r in reports
    ])

@app.route("/report/<int:slide_id>", methods=["POST"])
def save_report(slide_id):
    data = request.json
    now = datetime.now().isoformat()

    if "id" in data:
        report = Report.query.get(data["id"])
        if not report:
            return jsonify({"error": "Not found"}), 404
        report.title = data["title"]
        report.content = data["content"]
        report.updated_at = now
    else:
        report = Report(
            slide_id=slide_id,
            title=data["title"],
            content=data["content"],
            created_at=now,
            updated_at=now
        )
        db.session.add(report)

    db.session.commit()
    return jsonify({"status": "ok", "id": report.id})

if __name__ == "__main__":
    app.run(port=8000)
