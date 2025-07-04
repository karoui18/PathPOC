
# 🧠 WSI Dashboard App

A cross-platform desktop app for visualizing and managing whole-slide images (WSI) using:

- 🖥️ **Tauri v2** (for Windows/Linux/macOS)
- ⚛️ **Next.js (App Router)** with HeroUI (Tailwind-based UI)
- 🧪 **Flask** + SQLAlchemy backend with SQLite
- 🖼️ **OpenSeadragon** + OpenSlide (Python) for WSI viewing

---

## ✨ Features

- 📤 Upload `.svs` or `.ndpi` slides
- 🗂 Organize slides into folders
- 📊 Dashboard to browse and sort slides
- 🔍 View WSI using OpenSeadragon
- 📝 Add multiple reports per slide (with titles)
- 💾 Save & update reports to database
- 🖨 Print report as PDF
- 🎛 Live tile caching & zoom-level rendering
- 🧩 Sidebar for folder navigation, adding/editing folders, and uploading WSI

---

## 📁 Project Structure

```
root/
├── backend/                  # Flask + OpenSlide backend
│   ├── app.py                # Flask app
│   ├── models.py             # SQLAlchemy models
│   ├── slides/               # Uploaded WSI files
│   └── tiles/                # Cached tile images
│
├── frontend/                 # Next.js App Router
│   ├── app/                  # Pages: dashboard, viewer
│   ├── components/           # Sidebar, report modals, etc.
│   ├── context/              # FolderContext (React state)
│   ├── public/               # OpenSeadragon icons
│   └── tailwind.config.js
│
├── tauri.conf.json           # Tauri desktop config
└── README.md
```

---

## ✅ Requirements

### 🧰 System Dependencies

- **Node.js** ≥ 18
- **Python** ≥ 3.9
- **Rust** (`cargo`, for Tauri)  
- **OpenSlide**:
  - macOS: `brew install openslide`
  - Linux: `sudo apt install openslide-tools libopenslide0`
  - Windows: Download and place DLLs from [OpenSlide.org](https://openslide.org/download/)

---

### 📦 Backend Requirements (`backend/requirements.txt`)

```
flask
flask_sqlalchemy
flask_cors
openslide-python
```

To install:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

---

## 🚀 Getting Started

### 1. Run the Flask Backend

```bash
cd backend
source .venv/bin/activate
python app.py
```

- Runs at `http://localhost:8000`
- Uploaded files go to `backend/slides/`
- Tiles saved in `backend/tiles/`

---

### 2. Run the Next.js Frontend

```bash
cd frontend
npm install
npm run dev
```

- Runs at `http://localhost:3000`
- Dashboard page: `/dashboard`
- Viewer page: `/viewer?slide=<filename>`

---

### 3. Run the Tauri Desktop App

```bash
cd frontend
npm run tauri dev
```

- Requires Rust and Tauri CLI installed:
  ```bash
  cargo install create-tauri-app
  ```

---

## 🧪 Testing the App

- Upload WSI files via the sidebar modal
- Assign to folders using the dropdown
- Filter slides by folder using sidebar
- Click "View" to open a slide viewer
- Add/edit multiple reports (each with a title)
- Save reports to DB and print them

---

## ⚙️ API Overview (Flask)

| Endpoint                     | Method | Description                         |
|------------------------------|--------|-------------------------------------|
| `/upload-wsi`               | POST   | Uploads WSI and saves to folder     |
| `/slides`                   | GET    | List all slides (optional folder)   |
| `/folders`                  | GET    | List all folders                    |
| `/folders`                  | POST   | Create folder                       |
| `/folders/<id>`             | PUT    | Edit folder                         |
| `/report/<slide_id>`        | GET    | List reports for slide              |
| `/report/<slide_id>`        | POST   | Add/update report for slide         |
| `/tiles/<slide>/<z>/<x>_<y>.jpeg` | GET | Serve tile (caches if needed)      |
| `/info/<slide>`             | GET    | Slide dimensions + zoom levels      |

---

## 💡 Roadmap / Ideas

- 🔐 Add login system
- 📁 Drag & drop WSI upload
- 🧾 Export report as styled PDF
- 📈 Add dashboard analytics
- 🌍 Serve as remote web app

---

## 🧑‍💻 Developer Notes

### FolderContext

- Sidebar + dashboard share `FolderContext` via React context API.
- When you click a folder in the sidebar, `selectedFolderId` updates globally and dashboard fetches new data.

---

## 🖨 Printing Reports

In the viewer, when you open the "Report Modal":

- Rich text editor: [Tiptap](https://tiptap.dev/)
- You can save and update multiple reports
- "Print" opens a new window with the report content and triggers `window.print()`

---

## 📃 License

MIT — use, modify, and build your own digital pathology viewer 🧠

---

## 👨‍🔬 Credits

Created using:

- [Tauri](https://tauri.app/)
- [Next.js](https://nextjs.org/)
- [HeroUI](https://tailwindui.com/)
- [OpenSeadragon](https://openseadragon.github.io/)
- [OpenSlide](https://openslide.org/)
