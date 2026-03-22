## Phishing URL Detector – Full Stack & Extension

This repo now includes:

- `backend_api/` – FastAPI server wrapping your existing CLI pipeline in `src/`
- `webapp/` – React (Vite + Tailwind) cyber/web3-themed UI
- `extension/` – Chrome extension (MV3) popup that calls the API

### Prerequisites

- Python 3.12+
- Node 18+ (for webapp)

### Backend API

Local run:

```bash
pip install -r backend_api/requirements.txt
python -m backend_api.main
```

The API will run on `http://localhost:8000` with endpoints:

- `GET /api/health`
- `POST /api/detect` body: `{ "url": "https://example.com" }`

Docker build:

```bash
docker build -t phish-backend ./ -f backend_api/Dockerfile
docker run -p 8000:8000 phish-backend
```

Ensure `model/` and `src/` are present. The server imports `src.predict.detect_url` and returns a `final_verdict` consistent with the CLI output.

### Webapp (React UI)

Local dev:

```bash
cd webapp
npm install
VITE_API_BASE=http://localhost:8000 npm run dev
```

Build:

```bash
npm run build
```

Docker:

```bash
docker build -t phish-webapp ./ -f webapp/Dockerfile
docker run -p 8080:80 phish-webapp
```

Open `http://localhost:8080`. Set `VITE_API_BASE` to your backend URL.

### Chrome Extension (MV3)

1. Build/run backend so it’s reachable (e.g., `http://localhost:8000`).
2. Chrome → Manage Extensions → Enable Developer Mode
3. Load unpacked → select the `extension/` folder
4. In the extension’s Options, set your API Base (e.g., `http://localhost:8000`).

Popup lets you paste a URL or use the current tab and displays the verdict.

### Project Structure

```
backend_api/
  Dockerfile
  main.py
  requirements.txt
webapp/
  Dockerfile
  index.html
  package.json
  src/ui/App.tsx
  src/ui/index.css
  src/main.tsx
  tailwind.config.js
  vite.config.ts
extension/
  manifest.json
  options.html
  options.js
  popup.html
  popup.js
src/
  ... (existing model/features/enrichment/ai pipeline)
model/
  phishing_model.pkl (expected)
```

### Notes

- CORS is open by default in `backend_api/main.py` for local dev; restrict in production.
- `final_verdict` uses the same logic as the CLI to keep results consistent.
- The API returns the raw `model_prediction`, `enrichment`, `ai_review`, and the computed `final_verdict`.

# 🛡️ Phishing URL Detector

A machine learning project to detect phishing websites based on URL features.

## 🔧 Features
- Detects shortened URLs
- Extracts common phishing indicators
- Trains and evaluates a Random Forest classifier
- Provides a command-line interface


## 📌 Requirements
```bash
pip install pandas numpy scikit-learn tldextract joblib
```

## 🚀 Usage

### 1. Test URL in CLI
```bash
cd app
python cli.py
```

## Want to Train Model More ??
### 1. Add more data sets in phishing_data.csv File.
### 2. Can add data manually or by using xls file, and use the data-load.py file to add xls file data to csv file.
```bash
cd data
python data-load.py
```
### 3. Train the Model
```bash
cd src
python train_model.py
```
### 4. Run the Code and check Url
```bash
cd app
python cli.py
```


## 🎁Bonus Tip

### Use LFS to push larger file on github
