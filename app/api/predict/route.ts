export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import * as tf from '@tensorflow/tfjs-node';
import sharp from 'sharp';
import path from 'path';

// Model singleton
let model: tf.LayersModel | null = null;

async function loadModel() {
  if (!model) {
    console.log('🔹 Loading TFJS model...');
    const modelPath = path.join(process.cwd(), 'public', 'models', 'fabric', 'model.json');
    model = await tf.loadLayersModel('file://' + modelPath);
    console.log('✅ Model loaded');
    console.log('   Input shape:', model.inputs[0].shape);
    console.log('   Output shape:', model.outputs[0].shape);
  }
  return model;
}

async function preprocessImage(imageBuffer: Buffer) {
  // Manual preprocessing: resize to 256x256 and normalize to [0, 1]
  const resizedBuffer = await sharp(imageBuffer)
    .resize(256, 256)
    .removeAlpha() // Ensure RGB only
    .raw()
    .toBuffer({ resolveWithObject: true });
  
  const { data, info } = resizedBuffer;
  
  // Create tensor [1, 256, 256, 3] normalized to [0, 1]
  const imgTensor = tf.tensor3d(
    new Uint8Array(data),
    [info.height, info.width, info.channels]
  )
    .toFloat()
    .div(255.0)  // Normalize to [0, 1]
    .expandDims(0);  // Add batch dimension
  
  return imgTensor;
}

export async function POST(req: Request) {
  try {
    console.log('📥 Received prediction request');
    
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }
    
    console.log('📄 File:', file.name, file.type, file.size, 'bytes');
    
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    console.log('🔄 Loading model...');
    const model = await loadModel();
    
    console.log('🖼️  Preprocessing image...');
    const inputTensor = await preprocessImage(buffer);
    
    console.log('   Tensor shape:', inputTensor.shape);
    console.log('   Tensor min/max:', await inputTensor.min().data(), await inputTensor.max().data());
    
    console.log('🤖 Running prediction...');
    const prediction = model.predict(inputTensor) as tf.Tensor;
    const predictionData = await prediction.data();
    
    // Clean up
    inputTensor.dispose();
    prediction.dispose();
    
    // YOUR 8 FABRIC CLASSES - UPDATE THIS WITH YOUR ACTUAL CLASS NAMES!
    const labels = [
      'Cotton',
      'Denim', 
      'Linen',
      'Polyester',
      'Silk',
      'Velvet',
      'Wool',
      'Other'
    ];
    
    const maxIndex = Array.from(predictionData).indexOf(Math.max(...Array.from(predictionData)));
    const predictedLabel = labels[maxIndex];
    const confidence = predictionData[maxIndex];
    
    console.log('✅ Prediction:', predictedLabel);
    console.log('   Confidence:', (confidence * 100).toFixed(2) + '%');
    console.log('   All:', Array.from(predictionData).map((v, i) => 
      `${labels[i]}: ${(v * 100).toFixed(1)}%`
    ).join(', '));
    
    return NextResponse.json({ 
      fabric: predictedLabel, 
      confidence: Number(confidence.toFixed(4)),
      allPredictions: labels.map((label, i) => ({
        label,
        confidence: Number(predictionData[i].toFixed(4))
      }))
    });
    
  } catch (err) {
    console.error('❌ Error:', err);
    return NextResponse.json(
      { 
        error: 'Prediction failed', 
        details: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined
      },
      { status: 500 }
    );
  }
}