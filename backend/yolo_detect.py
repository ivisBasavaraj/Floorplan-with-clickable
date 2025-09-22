import os
from typing import List, Dict, Any, Optional

# Lazy import to allow backend to start even if ultralytics isn't installed yet
_YOLO_MODEL = None
_YOLO_LOAD_ERROR: Optional[str] = None


def _load_model() -> Optional[object]:
    global _YOLO_MODEL, _YOLO_LOAD_ERROR
    if _YOLO_MODEL is not None:
        return _YOLO_MODEL
    try:
        from ultralytics import YOLO  # type: ignore
    except Exception as e:
        _YOLO_LOAD_ERROR = f"Ultralytics import failed: {e}. Please install dependencies from backend/requirements.txt."
        return None

    # Model path can be customized via env var. Default to a small model.
    model_path = os.getenv('YOLO_MODEL_PATH', 'yolov8n.pt')
    try:
        _YOLO_MODEL = YOLO(model_path)
        return _YOLO_MODEL
    except Exception as e:
        _YOLO_LOAD_ERROR = f"Failed to load YOLO model at '{model_path}': {e}"
        return None


def detect_booths(image_path: str,
                  conf: float = 0.25,
                  iou: float = 0.45,
                  booth_class_names: Optional[List[str]] = None) -> List[Dict[str, Any]]:
    """
    Run YOLOv8 detection on the image and return booth-like rectangular detections.

    Returns list of dicts with keys: id, x, y, w, h, score
    Coordinates are in pixel space of source image.

    booth_class_names: optional list of class names to include (e.g., ['booth', 'table'])
    If None, all detections are returned.
    """
    model = _load_model()
    if model is None:
        # Provide empty, but include a hint in score
        return []

    try:
        # Run inference
        results = model.predict(source=image_path, conf=conf, iou=iou, verbose=False)
        if not results:
            return []
        result = results[0]

        rects: List[Dict[str, Any]] = []
        # Iterate over boxes
        boxes = getattr(result, 'boxes', None)
        names = getattr(result, 'names', {}) or {}
        if boxes is None:
            return []

        # Convert to CPU numpy
        xywh = boxes.xywh if hasattr(boxes, 'xywh') else None
        confs = boxes.conf if hasattr(boxes, 'conf') else None
        clss = boxes.cls if hasattr(boxes, 'cls') else None

        if xywh is None or confs is None or clss is None:
            return []

        xywh = xywh.cpu().numpy()
        confs = confs.cpu().numpy()
        clss = clss.cpu().numpy().astype(int)

        next_id = 1
        for (cx, cy, w, h), score, cls_id in zip(xywh, confs, clss):
            cls_name = names.get(cls_id, str(cls_id))
            if booth_class_names:
                if cls_name not in booth_class_names:
                    continue

            # Convert xywh(center) to top-left + size
            x = max(0, int(cx - w / 2))
            y = max(0, int(cy - h / 2))
            rects.append({
                'id': int(next_id),
                'x': int(x),
                'y': int(y),
                'w': int(w),
                'h': int(h),
                'score': float(round(float(score), 4)),
                'class': cls_name
            })
            next_id += 1

        return rects
    except Exception as e:
        # On any failure, return empty list; backend handler can log details
        print(f"YOLO detection error: {e}")
        return []