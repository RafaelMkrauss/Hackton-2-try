import requests
import json
import torch
import os
from PIL import Image
import argparse
import pathlib
temp = pathlib.PosixPath
pathlib.PosixPath = pathlib.WindowsPath
import matplotlib.pyplot as plt

def run_inference_on_image(model_path, image_path, local_yolov5_repo_path):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    try:
        model = torch.hub.load(local_yolov5_repo_path, "custom", path=model_path, source='local', force_reload=True)
        model.to(device)
        model.eval()
    except Exception as e:
        # print(f"Error loading model: {e}")
        return ('', -1)

    if not os.path.exists(image_path):
        # print(f"Error: Image file not found at '{image_path}'")
        return ('', -1)

    # Perform inference
    results = model(image_path)

    if results.pred[0] is not None and len(results.pred[0]) > 0:
        for *xyxy, conf, cls in results.pred[0]: # Assuming a single image in batch (results.pred[0])
            class_id = int(cls)
            confidence = float(conf)
            class_name = model.names[class_id] # Access class names from the loaded model

            # print(f"  Detected: {class_name}")
            # print(f"    Confidence: {confidence:.2f}") # Formatted to 2 decimal places
            return (class_name, confidence)
    else:
        # print("No objects detected in this image.")
        return ('', -1)
    

def main(BEST_PT_PATH, LOCAL_YOLOV5_REPO_PATH):
    parser = argparse.ArgumentParser(description="Process photo and return detection results in JSON.")
    parser.add_argument('--photo-path', type=str, help='Path to the photo file.')
    # Add other arguments if your script expects them
    args = parser.parse_args()

    photo_path = args.photo_path

    # --- Your AI/detection logic here ---
    # For demonstration, let's simulate a detection result.
    # Replace this with your actual model inference and result extraction.

    ret = run_inference_on_image(BEST_PT_PATH, photo_path, LOCAL_YOLOV5_REPO_PATH)

    class_name = ret[0]
    confidence_score = ret[1]

    # Construct the result as a Python dictionary
    result_data = {
        "className": class_name,
        "score": confidence_score
    }

    # Print the dictionary as a JSON string to stdout
    print(json.dumps(result_data))

if __name__ == "__main__":
    # 1. Path to your best.pt model weights
    BEST_PT_PATH = 'src/ia/yolov5/runs/train/yolov5s_custom2/weights/best.pt' # <--- CONFIRM THIS PATH

    # 2. Path to your local YOLOv5 repository clone
    LOCAL_YOLOV5_REPO_PATH = 'src/ia/yolov5' # <--- CONFIRM THIS PATH

    main(BEST_PT_PATH, LOCAL_YOLOV5_REPO_PATH)
    