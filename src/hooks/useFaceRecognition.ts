import { useState, useEffect, useRef, useCallback } from 'react';
import * as faceapi from 'face-api.js';

export type KnownPerson = 'Sarah' | 'Nurse John' | null;

interface FaceRecognitionState {
  nearbyPerson: KnownPerson;
  confidence: number;
  isInitialized: boolean;
  isDetecting: boolean;
  error: string | null;
}

export const useFaceRecognition = () => {
  const [state, setState] = useState<FaceRecognitionState>({
    nearbyPerson: null,
    confidence: 0,
    isInitialized: false,
    isDetecting: false,
    error: null,
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labeledDescriptorsRef = useRef<faceapi.LabeledFaceDescriptors[]>([]);
  const detectionIntervalRef = useRef<NodeJS.Timeout>();
  const faceMatcher = useRef<faceapi.FaceMatcher | null>(null);

  // Load face-api.js models
  const loadModels = useCallback(async () => {
    try {
      const MODEL_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';
      
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
      ]);

      console.log('Face-api.js models loaded successfully');
      return true;
    } catch (error) {
      console.error('Failed to load face-api.js models:', error);
      setState(prev => ({ ...prev, error: 'Failed to load face recognition models' }));
      return false;
    }
  }, []);

  // Load reference images for known people
  const loadReferenceImages = useCallback(async () => {
    try {
      const referenceImages = [
        {
          name: 'Sarah',
          // Placeholder image data - in real use, you'd load actual images
          imageUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2ZmNjI5NCIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+U2FyYWg8L3RleHQ+PC9zdmc+'
        },
        {
          name: 'Nurse John',
          // Placeholder image data - in real use, you'd load actual images
          imageUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzM5ODNmMyIvPjx0ZXh0IHg9IjUwIiB5PSI0NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+TnVyc2U8L3RleHQ+PHRleHQgeD0iNTAiIHk9IjY1IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Kb2huPC90ZXh0Pjwvc3ZnPg=='
        }
      ];

      const labeledDescriptors = await Promise.all(
        referenceImages.map(async (person) => {
          try {
            // Create image element
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            return new Promise<faceapi.LabeledFaceDescriptors>((resolve, reject) => {
              img.onload = async () => {
                try {
                  // Detect face and get descriptor
                  const detection = await faceapi
                    .detectSingleFace(img)
                    .withFaceLandmarks()
                    .withFaceDescriptor();

                  if (detection) {
                    resolve(new faceapi.LabeledFaceDescriptors(person.name, [detection.descriptor]));
                  } else {
                    console.warn(`No face detected in reference image for ${person.name}`);
                    // Create a dummy descriptor for demo purposes
                    const dummyDescriptor = new Float32Array(128).fill(Math.random());
                    resolve(new faceapi.LabeledFaceDescriptors(person.name, [dummyDescriptor]));
                  }
                } catch (error) {
                  console.error(`Error processing ${person.name}:`, error);
                  reject(error);
                }
              };
              
              img.onerror = () => reject(new Error(`Failed to load image for ${person.name}`));
              img.src = person.imageUrl;
            });
          } catch (error) {
            console.error(`Error loading reference for ${person.name}:`, error);
            // Return dummy descriptor for demo
            const dummyDescriptor = new Float32Array(128).fill(Math.random());
            return new faceapi.LabeledFaceDescriptors(person.name, [dummyDescriptor]);
          }
        })
      );

      labeledDescriptorsRef.current = labeledDescriptors;
      faceMatcher.current = new faceapi.FaceMatcher(labeledDescriptors, 0.6);
      
      console.log('Reference images loaded:', labeledDescriptors.map(ld => ld.label));
      return true;
    } catch (error) {
      console.error('Failed to load reference images:', error);
      setState(prev => ({ ...prev, error: 'Failed to load reference faces' }));
      return false;
    }
  }, []);

  // Initialize camera
  const initializeCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      
      return true;
    } catch (error) {
      console.error('Failed to access camera:', error);
      setState(prev => ({ ...prev, error: 'Failed to access camera for face recognition' }));
      return false;
    }
  }, []);

  // Detect and recognize faces
  const detectFaces = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !faceMatcher.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    try {
      // Detect faces with landmarks and descriptors
      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptors();

      if (detections.length > 0) {
        let bestMatch: { person: KnownPerson; confidence: number } | null = null;
        
        // Find the best matching face
        detections.forEach(detection => {
          const match = faceMatcher.current!.findBestMatch(detection.descriptor);
          const confidence = 1 - match.distance; // Convert distance to confidence
          
          if (match.label !== 'unknown' && confidence > 0.4) { // Threshold for recognition
            if (!bestMatch || confidence > bestMatch.confidence) {
              bestMatch = {
                person: match.label as KnownPerson,
                confidence
              };
            }
          }
        });

        if (bestMatch) {
          setState(prev => ({
            ...prev,
            nearbyPerson: bestMatch!.person,
            confidence: bestMatch!.confidence,
            error: null
          }));
        } else {
          setState(prev => ({
            ...prev,
            nearbyPerson: null,
            confidence: 0
          }));
        }
      } else {
        setState(prev => ({
          ...prev,
          nearbyPerson: null,
          confidence: 0
        }));
      }
    } catch (error) {
      console.error('Face detection failed:', error);
    }
  }, []);

  // Start face recognition
  const startRecognition = useCallback(async () => {
    if (!state.isInitialized) return;
    
    setState(prev => ({ ...prev, isDetecting: true }));
    
    // Detect faces every 3 seconds
    detectionIntervalRef.current = setInterval(detectFaces, 3000);
    
    // Initial detection
    await detectFaces();
  }, [state.isInitialized, detectFaces]);

  // Stop face recognition
  const stopRecognition = useCallback(() => {
    setState(prev => ({ ...prev, isDetecting: false, nearbyPerson: null, confidence: 0 }));
    
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
    }
  }, []);

  // Initialize everything
  useEffect(() => {
    let mounted = true;
    
    const initialize = async () => {
      try {
        setState(prev => ({ ...prev, error: null }));
        
        const modelsLoaded = await loadModels();
        if (!mounted || !modelsLoaded) return;
        
        const cameraReady = await initializeCamera();
        if (!mounted || !cameraReady) return;
        
        const referencesLoaded = await loadReferenceImages();
        if (!mounted || !referencesLoaded) return;
        
        setState(prev => ({ ...prev, isInitialized: true, error: null }));
      } catch (error) {
        console.error('Face recognition initialization failed:', error);
        if (mounted) {
          setState(prev => ({ ...prev, error: 'Failed to initialize face recognition', isInitialized: false }));
        }
      }
    };

    initialize();
    
    return () => {
      mounted = false;
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
    };
  }, [loadModels, initializeCamera, loadReferenceImages]);

  return {
    nearbyPerson: state.nearbyPerson,
    confidence: state.confidence,
    isInitialized: state.isInitialized,
    isDetecting: state.isDetecting,
    error: state.error,
    videoRef,
    canvasRef,
    startRecognition,
    stopRecognition,
  };
};