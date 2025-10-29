export const runtime = 'nodejs';

import { NextResponse } from 'next/server';

const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:5000';

export async function POST(req: Request) {
  try {
    console.log('📥 Received prediction request');
    
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }
    
    console.log('📄 File:', file.name, file.type, file.size, 'bytes');
    
    // Forward to Python API
    console.log('🔄 Forwarding to Python API...');
    
    const pythonFormData = new FormData();
    pythonFormData.append('file', file);
    
    const response = await fetch(`${PYTHON_API_URL}/predict`, {
      method: 'POST',
      body: pythonFormData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Python API error:', errorData);
      return NextResponse.json(
        { 
          error: 'Prediction failed', 
          details: errorData.details || errorData.error 
        },
        { status: response.status }
      );
    }
    
    const result = await response.json();
    
    console.log('✅ Prediction:', result.fabric);
    console.log('   Confidence:', (result.confidence * 100).toFixed(2) + '%');
    
    return NextResponse.json(result);
    
  } catch (err) {
    console.error('❌ Error:', err);
    
    // Check if Python server is running
    if (err instanceof Error && err.message.includes('ECONNREFUSED')) {
      return NextResponse.json(
        { 
          error: 'Python API server is not running', 
          details: 'Please start the Python server with: python api_server.py'
        },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Prediction failed', 
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}