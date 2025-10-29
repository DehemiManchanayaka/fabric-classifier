"""
Flask API for Fabric Classification
Run: python api_server.py
Server will run on http://localhost:5000
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
from tensorflow import keras
import numpy as np
from PIL import Image
import io

app = Flask(__name__)
CORS(app)  # Enable CORS for Next.js to call this API

# Load model once at startup
print("🔄 Loading model...")
model = keras.models.load_model('models/fabric.h5', compile=False)
print("✅ Model loaded successfully!")
print(f"   Input shape: {model.input_shape}")
print(f"   Output shape: {model.output_shape}")

LABELS = [
    'cotton', 'denim', 'net', 'silk', 'wool'
]

def preprocess_image(image_bytes):
    """Preprocess image for model prediction"""
    # Open image
    img = Image.open(io.BytesIO(image_bytes))
    
    # Convert to RGB if needed
    if img.mode != 'RGB':
        img = img.convert('RGB')
    
    # Resize to 256x256
    img = img.resize((256, 256))
    
    # Convert to array and normalize
    img_array = np.array(img) / 255.0
    
    # Add batch dimension
    img_array = np.expand_dims(img_array, axis=0)
    
    return img_array

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'model_loaded': model is not None})

@app.route('/predict', methods=['POST'])
def predict():
    """Predict fabric type from uploaded image"""
    try:
        # Check if file is in request
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'error': 'Empty filename'}), 400
        
        print(f"📄 Received file: {file.filename}")
        
        # Read image bytes
        image_bytes = file.read()
        
        # Preprocess
        print("🖼️  Preprocessing image...")
        img_array = preprocess_image(image_bytes)
        
        # Predict
        print("🤖 Running prediction...")
        predictions = model.predict(img_array, verbose=0)
        
        # Get results
        predicted_index = np.argmax(predictions[0])
        confidence = float(predictions[0][predicted_index])
        predicted_label = LABELS[predicted_index]
        
        # All predictions
        all_predictions = [
            {
                'label': LABELS[i],
                'confidence': float(predictions[0][i])
            }
            for i in range(len(LABELS))
        ]
        
        print(f"✅ Prediction: {predicted_label} ({confidence*100:.2f}%)")
        
        return jsonify({
            'fabric': predicted_label,
            'confidence': confidence,
            'allPredictions': all_predictions
        })
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'error': 'Prediction failed',
            'details': str(e)
        }), 500

if __name__ == '__main__':
    print("\n" + "="*60)
    print("🧵 Fabric Classification API Server")
    print("="*60)
    print(f"\n✓ Model loaded with {len(LABELS)} classes")
    print(f"✓ Server starting on http://localhost:5000")
    print(f"\nEndpoints:")
    print(f"  GET  /health  - Health check")
    print(f"  POST /predict - Predict fabric type")
    print("\n" + "="*60 + "\n")
    
    app.run(host='0.0.0.0', port=5000, debug=True)