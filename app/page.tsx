'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Typography, Container, Paper, Button, Card, CardContent, LinearProgress, Chip } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalLaundryServiceIcon from '@mui/icons-material/LocalLaundryService';
import AirIcon from '@mui/icons-material/Air';

export default function Home() {
  const [preview, setPreview] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [allPredictions, setAllPredictions] = useState<any[]>([]);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      setCurrentFile(file);
      setShowResult(false);
    }
  }, []);

  const handleCancel = () => {
    setPreview(null);
    setShowResult(false);
    setCurrentFile(null);
    setAllPredictions([]);
  };

  const handleSubmit = async () => {
    if (!currentFile) {
      console.error('No file selected');
      return;
    }

    setIsLoading(true);
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
        setAllPredictions(data.allPredictions || []);
        setShowResult(true);
      } else {
        console.error('No fabric prediction returned:', data);
      }
    } catch (err) {
      console.error('Prediction fetch error:', err);
      alert('Failed to connect to prediction API');
    } finally {
      setIsLoading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false,
  });

  const getFabricColor = (fabric: string) => {
    const colors: any = {
      Cotton: '#4CAF50',
      Denim: '#2196F3',
      Linen: '#FF9800',
      Polyester: '#9C27B0',
      Silk: '#E91E63',
      Velvet: '#673AB7',
      Wool: '#FF5722',
      Other: '#607D8B'
    };
    return colors[fabric] || '#607D8B';
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      py: 4
    }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h2" sx={{ 
            color: 'white', 
            fontWeight: 700,
            mb: 1,
            textShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}>
            🧵 Fabric AI Classifier
          </Typography>
          <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)' }}>
            Advanced AI-Powered Fabric Recognition System
          </Typography>
        </Box>

        {/* Main Card */}
        <Paper 
          elevation={10} 
          sx={{ 
            borderRadius: 4,
            overflow: 'hidden',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <Box sx={{ p: 4 }}>
            {/* Upload Area */}
            {!preview ? (
              <Box
                {...getRootProps()}
                sx={{
                  border: '3px dashed',
                  borderColor: isDragActive ? 'primary.main' : 'grey.300',
                  borderRadius: 3,
                  p: 6,
                  textAlign: 'center',
                  cursor: 'pointer',
                  bgcolor: isDragActive ? 'primary.50' : 'grey.50',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: 'primary.50',
                    transform: 'scale(1.01)'
                  }
                }}
              >
                <input {...getInputProps()} />
                <CloudUploadIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                  {isDragActive ? 'Drop your image here' : 'Upload Fabric Image'}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Drag and drop or click to browse
                </Typography>
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 1 }}>
                  <Chip label="JPG" size="small" color="primary" variant="outlined" />
                  <Chip label="PNG" size="small" color="primary" variant="outlined" />
                  <Chip label="WEBP" size="small" color="primary" variant="outlined" />
                </Box>
              </Box>
            ) : (
              <Box>
                {/* Preview Section */}
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Preview:
                </Typography>
                <Box sx={{ 
                  position: 'relative',
                  borderRadius: 3,
                  overflow: 'hidden',
                  mb: 3,
                  boxShadow: 3
                }}>
                  <img
                    src={preview}
                    alt="Preview"
                    style={{ 
                      width: '100%', 
                      maxHeight: '500px',
                      objectFit: 'contain',
                      display: 'block'
                    }}
                  />
                </Box>

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                  <Button 
                    variant="outlined" 
                    color="error" 
                    onClick={handleCancel}
                    fullWidth
                    size="large"
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="contained" 
                    onClick={handleSubmit}
                    disabled={isLoading}
                    fullWidth
                    size="large"
                    sx={{ 
                      background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                      fontWeight: 600
                    }}
                  >
                    {isLoading ? 'Analyzing...' : 'Analyze Fabric'}
                  </Button>
                </Box>

                {isLoading && (
                  <Box sx={{ mb: 3 }}>
                    <LinearProgress />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                      AI is analyzing your fabric...
                    </Typography>
                  </Box>
                )}

                {/* Results */}
                {showResult && result && (
                  <Card 
                    elevation={0}
                    sx={{ 
                      bgcolor: getFabricColor(result) + '15',
                      border: '2px solid',
                      borderColor: getFabricColor(result),
                      borderRadius: 3,
                      overflow: 'hidden'
                    }}
                  >
                    <Box sx={{ 
                      bgcolor: getFabricColor(result),
                      p: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}>
                      <CheckCircleIcon sx={{ color: 'white' }} />
                      <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                        Classification Result
                      </Typography>
                    </Box>

                    <CardContent sx={{ p: 3 }}>
                      {/* Main Result */}
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          Identified Fabric Type
                        </Typography>
                        <Typography variant="h3" sx={{ 
                          fontWeight: 700, 
                          color: getFabricColor(result),
                          mb: 2
                        }}>
                          {result}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Confidence:
                          </Typography>
                          <Box sx={{ flexGrow: 1 }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={confidence ? confidence * 100 : 0}
                              sx={{ 
                                height: 10, 
                                borderRadius: 5,
                                bgcolor: 'grey.200',
                                '& .MuiLinearProgress-bar': {
                                  bgcolor: getFabricColor(result)
                                }
                              }}
                            />
                          </Box>
                          <Typography variant="h6" sx={{ fontWeight: 700, color: getFabricColor(result) }}>
                            {confidence ? `${(confidence * 100).toFixed(1)}%` : 'N/A'}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Care Instructions */}
                      <Box sx={{ 
                        display: 'grid', 
                        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                        gap: 2,
                        mb: 3
                      }}>
                        <Box sx={{ 
                          bgcolor: 'background.paper',
                          p: 2,
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: 'divider'
                        }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <LocalLaundryServiceIcon color="primary" />
                            <Typography variant="subtitle1" fontWeight={600}>
                              Washing
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            Cold Wash – Gentle Cycle
                          </Typography>
                        </Box>

                        <Box sx={{ 
                          bgcolor: 'background.paper',
                          p: 2,
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: 'divider'
                        }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <AirIcon color="primary" />
                            <Typography variant="subtitle1" fontWeight={600}>
                              Drying
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            Air Dry Recommended
                          </Typography>
                        </Box>
                      </Box>

                      {/* All Predictions */}
                      {allPredictions.length > 0 && (
                        <Box>
                          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                            All Predictions:
                          </Typography>
                          {allPredictions
                            .sort((a, b) => b.confidence - a.confidence)
                            .slice(0, 5)
                            .map((pred, idx) => (
                              <Box key={idx} sx={{ mb: 1.5 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                  <Typography variant="body2" fontWeight={500}>
                                    {pred.label}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {(pred.confidence * 100).toFixed(1)}%
                                  </Typography>
                                </Box>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={pred.confidence * 100}
                                  sx={{ 
                                    height: 6, 
                                    borderRadius: 3,
                                    bgcolor: 'grey.200'
                                  }}
                                />
                              </Box>
                            ))}
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                )}
              </Box>
            )}
          </Box>
        </Paper>

        {/* Footer */}
        <Typography 
          variant="body2" 
          sx={{ 
            textAlign: 'center', 
            mt: 3, 
            color: 'rgba(255,255,255,0.8)'
          }}
        >
          Powered by AI • Accurate Fabric Recognition
        </Typography>
      </Container>
    </Box>
  );
}