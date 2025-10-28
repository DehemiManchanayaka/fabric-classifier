'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Typography, Container, Paper, Button, Card, CardContent } from '@mui/material';

export default function Home() {
  const [preview, setPreview] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [currentFile, setCurrentFile] = useState<File | null>(null); // Store the file

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      setCurrentFile(file); // Store the actual file
      setShowResult(false);
    }
  }, []);

  const handleCancel = () => {
    setPreview(null);
    setShowResult(false);
    setCurrentFile(null);
  };

  const handleSubmit = async () => {
    if (!currentFile) {
      console.error('No file selected');
      return;
    }

    const formData = new FormData();
    formData.append('file', currentFile);

    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      
      if (data.error) {
        console.error('Prediction error:', data);
        alert(`Error: ${data.error}\nDetails: ${data.details || 'Unknown error'}`);
        return;
      }

      if (data.fabric) {
        setResult(data.fabric);
        setConfidence(data.confidence);
        setShowResult(true);
      } else {
        console.error('No fabric prediction returned:', data);
      }
    } catch (err) {
      console.error('Prediction fetch error:', err);
      alert('Failed to connect to prediction API');
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false,
  });

  return (
    <div className="min-h-screen bg-cover bg-center flex items-center justify-center px-4">
      <Container maxWidth="md">
        <Paper 
          elevation={5} 
          className="p-8 rounded-2xl shadow-xl bg-white bg-opacity-90"
          style={{ 
            backgroundImage: 'url("https://plus.unsplash.com/premium_photo-1674747087104-516a4d6d316c?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8ZmFicmljJTIwYmFja2dyb3VuZHxlbnwwfHwwfHx8MA%3D%3D")' 
          }}
        >
          <Typography variant="h3" className="text-center font-bold mb-4 text-gray-800">
            Fabric Type Classifier
          </Typography>
          <Typography variant="body1" className="text-center text-gray-600 mb-6">
            Upload a fabric image to classify its type using AI
          </Typography>

          <Box
            {...getRootProps()}
            className={`w-full p-10 border-4 border-dashed rounded-xl cursor-pointer text-center transition-all duration-200 ${
              isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-400 bg-gray-100'
            }`}
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <Typography variant="body1">Drop the fabric image here...</Typography>
            ) : (
              <Typography variant="body1">
                Drag and drop a fabric image here, or click to select
              </Typography>
            )}
          </Box>

          {preview && (
            <div className="mt-6 flex flex-col items-center">
              <Typography variant="subtitle1" className="mb-2 font-semibold">
                Preview:
              </Typography>
              <img
                src={preview}
                alt="Preview"
                className="max-w-lg w-full rounded-xl border mb-4"
              />

              <div className="flex gap-4">
                <Button variant="outlined" color="error" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button variant="contained" color="primary" onClick={handleSubmit}>
                  Submit
                </Button>
              </div>
            </div>
          )}

          {showResult && result && (
            <Card className="mt-8 bg-gray-50 border border-gray-200 shadow-md">
              <CardContent>
                <Typography variant="h6" className="mb-2 font-semibold text-gray-800">
                  Classification Result
                </Typography>
                <Typography variant="body1">
                  🧵 <strong>Fabric Type:</strong> {result} <br />
                  📊 <strong>Confidence:</strong> {confidence ? `${(confidence * 100).toFixed(2)}%` : 'N/A'} <br />
                  💡 <strong>Recommended Wash:</strong> Cold Wash – Gentle Cycle <br />
                  🧺 <strong>Drying Suggestion:</strong> Air Dry <br />
                </Typography>
              </CardContent>
            </Card>
          )}
        </Paper>
      </Container>
    </div>
  );
}