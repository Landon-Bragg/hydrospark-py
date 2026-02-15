"""
OCR Service - Tesseract for meter reading
"""

import pytesseract
from PIL import Image
import re

class OCRService:
    def extract_meter_reading(self, image_path):
        """Extract numeric reading from meter photo"""
        try:
            # Open image
            image = Image.open(image_path)
            
            # Perform OCR
            text = pytesseract.image_to_string(image, config='--psm 6 digits')
            
            # Extract numbers
            numbers = re.findall(r'\d+\.?\d*', text)
            
            if not numbers:
                return None, 0.0
            
            # Get the largest number (likely the reading)
            reading = max([float(n) for n in numbers])
            
            # Confidence is based on clarity of extraction
            confidence = 75.0 if len(numbers) > 0 else 50.0
            
            return reading, confidence
            
        except Exception as e:
            print(f"OCR Error: {e}")
            return None, 0.0
    
    def preprocess_image(self, image_path):
        """Preprocess image for better OCR accuracy"""
        try:
            image = Image.open(image_path)
            
            # Convert to grayscale
            image = image.convert('L')
            
            # Enhance contrast
            from PIL import ImageEnhance
            enhancer = ImageEnhance.Contrast(image)
            image = enhancer.enhance(2.0)
            
            return image
            
        except Exception as e:
            print(f"Preprocessing Error: {e}")
            return None
