import TensorFlowLite from 'react-native-fast-tflite';

interface DetectionResult {
  id: number;
  label: string;
  confidence: number;
  bbox: [number, number, number, number]; // [x, y, width, height]
}

class TensorFlowService {
  private model: any = null;
  private isInitialized = false;
  private labels: string[] = [];

  // COCO SSD labels
  private readonly COCO_LABELS = [
    'person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus', 'train', 'truck', 'boat',
    'traffic light', 'fire hydrant', 'stop sign', 'parking meter', 'bench', 'bird', 'cat',
    'dog', 'horse', 'sheep', 'cow', 'elephant', 'bear', 'zebra', 'giraffe', 'backpack',
    'umbrella', 'handbag', 'tie', 'suitcase', 'frisbee', 'skis', 'snowboard', 'sports ball',
    'kite', 'baseball bat', 'baseball glove', 'skateboard', 'surfboard', 'tennis racket',
    'bottle', 'wine glass', 'cup', 'fork', 'knife', 'spoon', 'bowl', 'banana', 'apple',
    'sandwich', 'orange', 'broccoli', 'carrot', 'hot dog', 'pizza', 'donut', 'cake',
    'chair', 'couch', 'potted plant', 'bed', 'dining table', 'toilet', 'tv', 'laptop',
    'mouse', 'remote', 'keyboard', 'cell phone', 'microwave', 'oven', 'toaster', 'sink',
    'refrigerator', 'book', 'clock', 'vase', 'scissors', 'teddy bear', 'hair drier', 'toothbrush'
  ];

  async initialize(): Promise<boolean> {
    try {
      if (this.isInitialized) {
        return true;
      }

      // Load the TensorFlow Lite model
      this.model = await TensorFlowLite.loadModel({
        model: 'coco_ssd_mobilenet_v1_1.0_quant.tflite',
        labels: this.COCO_LABELS,
        numThreads: 4,
      });

      this.labels = this.COCO_LABELS;
      this.isInitialized = true;
      console.log('TensorFlow Lite model loaded successfully');
      return true;
    } catch (error) {
      console.error('Error initializing TensorFlow Lite:', error);
      return false;
    }
  }

  async detectObjects(imageData: Uint8Array, width: number, height: number): Promise<DetectionResult[]> {
    try {
      if (!this.isInitialized || !this.model) {
        console.warn('TensorFlow Lite not initialized');
        return [];
      }

      // Run inference
      const results = await this.model.run({
        input: imageData,
        inputShape: [1, height, width, 3],
        outputNames: ['detection_boxes', 'detection_classes', 'detection_scores', 'num_detections'],
      });

      const detections: DetectionResult[] = [];
      const confidenceThreshold = 0.5;

      // Process detection results
      if (results && results.detection_boxes && results.detection_classes && results.detection_scores) {
        const boxes = results.detection_boxes;
        const classes = results.detection_classes;
        const scores = results.detection_scores;

        for (let i = 0; i < scores.length; i++) {
          if (scores[i] > confidenceThreshold) {
            const classId = Math.floor(classes[i]);
            const label = this.labels[classId] || 'unknown';
            
            detections.push({
              id: i,
              label,
              confidence: scores[i],
              bbox: [
                boxes[i * 4],     // ymin
                boxes[i * 4 + 1], // xmin
                boxes[i * 4 + 2], // ymax
                boxes[i * 4 + 3], // xmax
              ],
            });
          }
        }
      }

      return detections;
    } catch (error) {
      console.error('Error during object detection:', error);
      return [];
    }
  }

  // Mock detection for testing when TensorFlow is not available
  async mockDetection(): Promise<DetectionResult[]> {
    const mockObjects = [
      { label: 'person', confidence: 0.85 },
      { label: 'car', confidence: 0.72 },
      { label: 'chair', confidence: 0.68 },
    ];

    return mockObjects.map((obj, index) => ({
      id: index,
      label: obj.label,
      confidence: obj.confidence,
      bbox: [0.1 + index * 0.2, 0.1 + index * 0.2, 0.3, 0.3],
    }));
  }

  isReady(): boolean {
    return this.isInitialized;
  }

  getLabels(): string[] {
    return this.labels;
  }
}

export default new TensorFlowService(); 