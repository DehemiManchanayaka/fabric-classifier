# Fabric AI Classifier - Technical Documentation

## 📋 Table of Contents
1. [Technical Feasibility](#technical-feasibility)
2. [System Architecture](#system-architecture)
3. [Installation Guide](#installation-guide)
4. [Running the Application](#running-the-application)
5. [Troubleshooting](#troubleshooting)

---

## 🎯 Technical Feasibility

### Overview
The Fabric AI Classifier is a web-based application that uses deep learning to identify fabric types from images. The system combines a Next.js frontend with a Python Flask backend for AI inference.

### Technology Stack

#### Frontend
- **Framework**: Next.js 14+ (React)
- **UI Library**: Material-UI (MUI)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + MUI Components

#### Backend
- **Framework**: Flask (Python)
- **ML Framework**: TensorFlow/Keras
- **Image Processing**: Pillow (PIL)
- **CORS**: Flask-CORS

#### AI Model
- **Type**: Convolutional Neural Network (CNN)
- **Input**: 256x256 RGB images
- **Output**: 8 fabric classes (Cotton, Denim, Linen, Polyester, Silk, Velvet, Wool, Other)
- **Model Format**: Keras .h5 file

### Feasibility Assessment

✅ **Technically Feasible**
- Proven technologies (TensorFlow, React, Flask)
- Modular architecture allows independent scaling
- Simple API contract between frontend and backend
- Standard image formats supported

✅ **Developmentally Feasible**
- Clear separation of concerns
- Well-documented frameworks
- Active community support
- Minimal external dependencies

✅ **Operationally Feasible**
- Can run on standard hardware
- No special GPU requirements for inference
- Low latency predictions (1-3 seconds)
- Easy to deploy and maintain

### System Requirements

**Development Environment:**
- Node.js 18+ (for Next.js)
- Python 3.8+ (for Flask/TensorFlow)
- 4GB RAM minimum
- 2GB free disk space

**Production Environment:**
- 2 CPU cores minimum
- 4GB RAM recommended
- Internet connection for initial package downloads

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         User Browser                         │
│                    (Next.js Frontend - Port 3000)            │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ HTTP Request (FormData)
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              Next.js API Route (/api/predict)                │
│                  (Proxy Layer)                               │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ Forward Request
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│               Flask API Server (Port 5000)                   │
│                                                               │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │ Image Upload │───▶│ Preprocessing│───▶│ TF Model     │  │
│  │   Handler    │    │  (Pillow)    │    │  Inference   │  │
│  └──────────────┘    └──────────────┘    └──────┬───────┘  │
│                                                   │          │
│                                            ┌──────▼───────┐  │
│                                            │  Post-process│  │
│                                            │  & Response  │  │
│                                            └──────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow
1. User uploads image through Next.js UI
2. Next.js API route forwards request to Flask server
3. Flask preprocesses image (resize, normalize)
4. TensorFlow model performs inference
5. Results returned to Next.js
6. UI displays prediction with confidence scores

---

## 📦 Installation Guide

### Prerequisites
- Git
- Node.js 18+ and npm
- Python 3.8+
- pip (Python package manager)

### Step 1: Clone Repository
```bash
git clone <your-repo-url>
cd fabric-classifier
```

### Step 2: Install Frontend Dependencies

**Important:** The frontend does NOT need TensorFlow packages. We removed all TFJS dependencies.

```bash
npm install
```

**Packages installed:**
- next
- react
- react-dom
- @mui/material
- @mui/icons-material
- react-dropzone
- typescript

### Step 3: Install Backend (Python) Dependencies

```bash
pip install flask flask-cors tensorflow pillow numpy
```

**Package Details:**
- `flask` - Web framework
- `flask-cors` - Enable cross-origin requests
- `tensorflow` - ML framework (this is Python TensorFlow, not TFJS)
- `pillow` - Image processing
- `numpy` - Numerical operations

**Note:** TensorFlow installation may take 5-10 minutes as it's a large package (~500MB).

### Step 4: Verify Model File

Ensure your trained model exists:
```bash
ls models/fabric.h5
```

If missing, you need to train or obtain the model file.

---

## 🚀 Running the Application

### Development Mode

You need to run **TWO** servers simultaneously:

#### Terminal 1: Start Python Flask Server
```bash
python api_server.py
```

**Expected Output:**
```
🔄 Loading model...
✅ Model loaded successfully!
   Input shape: (None, 256, 256, 3)
   Output shape: (None, 8)

============================================================
🧵 Fabric Classification API Server
============================================================

✓ Model loaded with 8 classes
✓ Server starting on http://localhost:5000

Endpoints:
  GET  /health  - Health check
  POST /predict - Predict fabric type

============================================================

 * Running on http://0.0.0.0:5000
```

#### Terminal 2: Start Next.js Frontend
```bash
npm run dev
```

**Expected Output:**
```
  ▲ Next.js 14.x.x
  - Local:        http://localhost:3000
  - Network:      http://0.0.0.0:3000

 ✓ Ready in 2.5s
```

### Accessing the Application

1. Open browser: `http://localhost:3000`
2. Upload a fabric image
3. Click "Analyze Fabric"
4. View results with confidence scores

### Testing the Backend Directly

Test Flask API health:
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{"status": "healthy", "model_loaded": true}
```

---

## 🔧 Troubleshooting

### Issue 1: TensorFlow Installation Fails

**Problem:** `pip install tensorflow` fails with errors

**Solutions:**
```bash
# Try with specific version
pip install tensorflow==2.13.0

# Or use CPU-only version (smaller, faster install)
pip install tensorflow-cpu

# For M1/M2 Macs
pip install tensorflow-macos tensorflow-metal
```

### Issue 2: "ECONNREFUSED" Error

**Problem:** Frontend can't connect to Flask server

**Solution:**
- Ensure Flask server is running on port 5000
- Check terminal for Flask startup message
- Verify no other service is using port 5000

### Issue 3: CORS Errors

**Problem:** Browser shows CORS policy errors

**Solution:**
- Ensure `flask-cors` is installed
- Check `CORS(app)` is called in `api_server.py`
- Restart Flask server

### Issue 4: Model Not Loading

**Problem:** "No such file: models/fabric.h5"

**Solution:**
```bash
# Check file exists
ls -la models/fabric.h5

# Check file permissions
chmod 644 models/fabric.h5

# Verify path in api_server.py matches your structure
```

### Issue 5: npm install Errors (TensorFlow related)

**Problem:** npm tries to install @tensorflow/tfjs-node and fails

**Solution:**
This project NO LONGER uses TensorFlow.js! If you see TFJS errors:

1. Remove old dependencies:
```bash
npm uninstall @tensorflow/tfjs-node @tensorflow/tfjs sharp
```

2. Clean install:
```bash
rm -rf node_modules package-lock.json
npm install
```

3. Check `package.json` - it should NOT contain:
   - @tensorflow/tfjs
   - @tensorflow/tfjs-node
   - sharp (unless needed for other reasons)

### Issue 6: Image Upload Fails

**Problem:** "No file provided" error

**Solution:**
- Check file size (keep under 10MB)
- Verify image format (JPG, PNG, WEBP)
- Check browser console for errors

### Issue 7: Python Version Issues

**Problem:** TensorFlow requires specific Python version

**Solution:**
```bash
# Check Python version
python --version

# TensorFlow 2.13+ requires Python 3.8-3.11
# Use pyenv or conda to manage versions

# With conda:
conda create -n fabric python=3.10
conda activate fabric
pip install flask flask-cors tensorflow pillow numpy
```

---

## 📁 Project Structure

```
fabric-classifier/
├── app/
│   ├── api/
│   │   └── predict/
│   │       └── route.ts          # Next.js API route (proxy)
│   ├── page.tsx                  # Main UI page
│   └── layout.tsx
├── models/
│   └── fabric.h5                 # Trained ML model
├── api_server.py                 # Flask backend server
├── package.json                  # Node dependencies
├── next.config.js
├── tsconfig.json
└── README.md
```

---

## 🎓 Key Architectural Decisions

### Why Separate Python Backend?

**Problem:** TensorFlow.js had compatibility issues with Keras 3.x models

**Solution:** Use native TensorFlow in Python
- ✅ Direct .h5 model loading (no conversion)
- ✅ Better performance
- ✅ Simpler maintenance
- ✅ No version conflicts

### Why Two Servers?

**Frontend (Next.js - Port 3000):**
- Handles UI rendering
- Manages user interactions
- Serves static assets

**Backend (Flask - Port 5000):**
- ML model inference
- Image preprocessing
- Heavy computation

This separation allows:
- Independent scaling
- Technology-specific optimizations
- Easier debugging
- Clear separation of concerns

---

## 🔐 Security Considerations

1. **File Upload Validation**
   - Check file type and size
   - Sanitize filenames
   - Limit upload rate

2. **API Security**
   - Add authentication for production
   - Rate limiting on Flask endpoints
   - Input validation

3. **Production Deployment**
   - Use environment variables for URLs
   - Enable HTTPS
   - Add proper error handling
   - Implement logging

---

## 📊 Performance Metrics

- **Prediction Time:** 1-3 seconds
- **Image Processing:** 200-500ms
- **Model Inference:** 500-1500ms
- **Network Overhead:** 200-500ms

**Optimization Tips:**
- Use model quantization for faster inference
- Implement caching for repeated predictions
- Use GPU for production (if available)
- Compress images before upload

---

## 📝 Environment Variables

Create `.env.local` for Next.js:
```env
PYTHON_API_URL=http://localhost:5000
```

For production:
```env
PYTHON_API_URL=https://your-flask-server.com
```

---

## 🚢 Deployment Guide

### Deploy Flask Backend
- Use Gunicorn as WSGI server
- Deploy on AWS EC2, Heroku, or Railway
- Configure CORS for production domain

### Deploy Next.js Frontend
- Vercel (recommended)
- Netlify
- AWS Amplify

**Example Production Setup:**
```bash
# Flask on Railway/Heroku
# Next.js on Vercel
# Both connected via environment variable
```

---

## 📞 Support & Maintenance

For issues or questions:
1. Check troubleshooting section
2. Review logs (Flask terminal, browser console)
3. Verify all dependencies installed
4. Ensure both servers running

---


**Last Updated:** October 2025  
**License:** MIT
