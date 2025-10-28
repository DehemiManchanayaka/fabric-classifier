"""
Convert fabric.h5 model WITHOUT using Input layer (which causes issues)
Run: python convert_fabric_model.py
"""

import tensorflowjs as tfjs
from tensorflow import keras
import tensorflow as tf
import json
import os
import shutil

def convert_model():
    print("🔄 Converting fabric.h5 model...\n")
    
    model_path = 'models/fabric.h5'
    output_path = './public/models/fabric'
    
    try:
        print(f"📂 Loading model from: {model_path}")
        
        # Load old model
        old_model = keras.models.load_model(model_path, compile=False)
        
        print("✅ Model loaded successfully!\n")
        print("📊 Original Model:")
        print(f"   Input shape: {old_model.input_shape}")
        print(f"   Output shape: {old_model.output_shape}")
        print(f"   Number of classes: {old_model.output_shape[-1]}")
        
        # Build new model WITHOUT Input layer - start directly with Conv2D
        from tensorflow.keras import layers, models
        
        IMAGE_SIZE = 256
        CHANNELS = 3
        n_classes = old_model.output_shape[-1]
        
        print(f"\n🔨 Building new model WITHOUT Input layer...")
        
        # Build model starting with Conv2D (which accepts input_shape parameter)
        new_model = models.Sequential([
            # First Conv2D layer with input_shape parameter (NO Input layer!)
            layers.Conv2D(32, kernel_size=(3,3), activation='relu', 
                         input_shape=(IMAGE_SIZE, IMAGE_SIZE, CHANNELS),
                         name='conv2d_first'),
            layers.MaxPooling2D((2, 2)),
            layers.Conv2D(64, kernel_size=(3,3), activation='relu'),
            layers.MaxPooling2D((2, 2)),
            layers.Conv2D(64, kernel_size=(3,3), activation='relu'),
            layers.MaxPooling2D((2, 2)),
            layers.Conv2D(64, (3, 3), activation='relu'),
            layers.MaxPooling2D((2, 2)),
            layers.Conv2D(64, (3, 3), activation='relu'),
            layers.MaxPooling2D((2, 2)),
            layers.Conv2D(64, (3, 3), activation='relu'),
            layers.MaxPooling2D((2, 2)),
            layers.Flatten(),
            layers.Dense(64, activation='relu'),
            layers.Dense(n_classes, activation='softmax'),
        ])
        
        # Build the model
        new_model.build(input_shape=(None, IMAGE_SIZE, IMAGE_SIZE, CHANNELS))
        
        print("✅ New model built\n")
        
        # Transfer weights (skip preprocessing layer from old model)
        print("🔄 Transferring weights...")
        
        # Old model has preprocessing layer at index 0, start from index 1
        old_weights = []
        for layer in old_model.layers[1:]:  # Skip preprocessing Sequential
            if len(layer.get_weights()) > 0:
                old_weights.extend(layer.get_weights())
        
        # Set weights to new model
        new_model.set_weights(old_weights)
        print("✅ Weights transferred!\n")
        
        print("📊 New Model:")
        print(f"   Input shape: {new_model.input_shape}")
        print(f"   Output shape: {new_model.output_shape}")
        
        print("\n🔍 Model Summary:")
        new_model.summary()
        
        # Remove old output
        if os.path.exists(output_path):
            print(f"\n🗑️  Removing old files...")
            shutil.rmtree(output_path)
        
        os.makedirs(output_path, exist_ok=True)
        
        # Convert to TensorFlow.js
        print(f"\n🔄 Converting to TensorFlow.js...")
        tfjs.converters.save_keras_model(new_model, output_path)
        
        print("\n✅ Conversion successful!\n")
        
        # Verify
        model_json_path = os.path.join(output_path, 'model.json')
        with open(model_json_path, 'r') as f:
            config = json.load(f)
        
        print("📄 Verification:")
        print(f"   ✓ model.json created")
        print(f"   ✓ Format: {config.get('format')}")
        
        # Check weight files
        weights_manifest = config.get('weightsManifest', [])
        total_size = 0
        for group in weights_manifest:
            for path_name in group.get('paths', []):
                weight_path = os.path.join(output_path, path_name)
                if os.path.exists(weight_path):
                    size_mb = os.path.getsize(weight_path) / (1024 * 1024)
                    total_size += size_mb
                    print(f"   ✓ {path_name} ({size_mb:.2f} MB)")
        
        print(f"\n   Total size: {total_size:.2f} MB")
        
        print("\n" + "="*60)
        print("✅ SUCCESS!")
        print("="*60)
        print(f"\n🎯 Your model has {n_classes} classes")
        print("   Update labels in api/predict/route.ts with your actual fabric types!")
        print("\n📋 Next steps:")
        print("   1. Restart Next.js: npm run dev")
        print("   2. Upload a fabric image to test")
        print("="*60)
        
        return True
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("="*60)
    print("Fabric Model Converter")
    print("="*60 + "\n")
    
    convert_model()