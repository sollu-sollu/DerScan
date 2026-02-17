"""
DerScan AI Backend - MedGemma 4B (GGUF) Skin Analysis Server
=============================================================
FastAPI server that uses a quantized MedGemma model to analyze
skin condition images and return structured diagnosis data.

Requirements:
  - CUDA 13.0 compatible GPU with 8GB+ VRAM
  - Python 3.10+
  - Run setup_backend.bat first to install dependencies
"""

import os
import io
import json
import base64
import logging
import re
from pathlib import Path
from datetime import datetime

# Add current directory and bin directory to DLL search path for CUDA libs
try:
    os.add_dll_directory(os.getcwd())
    bin_path = os.path.join(os.getcwd(), "bin")
    if os.path.exists(bin_path):
        os.add_dll_directory(bin_path)
except AttributeError:
    pass # Python < 3.8 or not Windows

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional
from PIL import Image

# ─── Logging ───────────────────────────────────────────────
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("derscan")

# ─── App ───────────────────────────────────────────────────
app = FastAPI(
    title="DerScan AI Backend",
    description="Skin condition analysis powered by MedGemma 4B",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Response Models ───────────────────────────────────────
class RoutineItem(BaseModel):
    title: str
    subtitle: str
    time: str
    icon: str

class LifestyleItem(BaseModel):
    title: str
    subtitle: str
    icon: str

class AnalysisResponse(BaseModel):
    scan_id: str
    timestamp: str
    condition_name: str
    condition_type: str
    severity: float
    severity_label: str
    description: str
    warning: str
    daily_routine: list[RoutineItem]
    lifestyle_adjustments: list[LifestyleItem]
    precautions: list[str]
    when_to_see_doctor: str
    clinical_features: list[str]
    differential_diagnosis: list[str]

class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    gpu_available: bool
    model_name: str

# ─── Model Configuration ──────────────────────────────────
MODEL_DIR = Path(__file__).parent / "models"
MODEL_DIR.mkdir(exist_ok=True)

# MedGemma 4B GGUF (Q4_K_M quantized)
MODEL_REPO = os.getenv("HF_REPO_ID", "SandLogicTechnologies/MedGemma-4B-IT-GGUF")
# ─── Model Configuration (now pointing to llama-server) ───
SERVER_URL = "http://localhost:8080/v1/chat/completions" # Standard OpenAI-compatible endpoint
HEADERS = {"Content-Type": "application/json"}

# --- No in-process model loading needed! ---
# --- No in-process model loading needed! ---
# llama-server is managed externally via start_medgemma.bat


def build_analysis_prompt(image_b64: str) -> str:
    """Build the prompt for a more careful and professional clinical analysis."""
    return """You are an expert Dermatologist AI. Your task is to perform a detailed clinical analysis of the provided skin image.
    
Analyze the image based on traditional dermatological markers:
1. Morphology: Primary and secondary lesions (macules, papules, plaques, etc.)
2. Color & Border: Homogeneity, pigment distribution, and border regularity.
3. Distribution: If visible, note the spatial context.
4. Scale/Texture: Note any scaling, crusting, or lichenification.

IMPORTANT: You MUST respond ONLY with valid JSON.
Respond with this exact structure for clinical use:
{
    "condition_name": "Most likely clinical diagnosis",
    "condition_type": "Medical Category",
    "severity": 5.0,
    "severity_label": "MILD/MODERATE/SEVERE",
    "description": "A precise clinical summary (3-4 sentences) describing the visible morphology and features.",
    "clinical_features": [
        "Feature 1 (e.g., Asymmetric borders)",
        "Feature 2 (e.g., Silvery scaling)",
        "Feature 3 (e.g., Central clearing)"
    ],
    "differential_diagnosis": [
        "Possibility 1",
        "Possibility 2"
    ],
    "warning": "Key clinical flag or acute concern",
    "daily_routine": [
        {"title": "Action", "subtitle": "Details", "time": "8:00 AM", "icon": "icon-name"}
    ],
    "lifestyle_adjustments": [
        {"title": "Note", "subtitle": "Detail", "icon": "icon-name"}
    ],
    "precautions": ["Strict warnings for the patient"],
    "when_to_see_doctor": "Specific clinical triggers for urgent consultation"
}

Maintain a professional, objective medical tone. Focus on visual facts in the image. 
Provide 4-6 routine steps. Use MaterialCommunityIcons names.
Respond only with the JSON object."""


def parse_ai_response(raw_text: str) -> dict:
    """Parse the AI model's response text into structured JSON."""
    # Try to extract JSON from the response
    try:
        # First, try direct JSON parse
        return json.loads(raw_text)
    except json.JSONDecodeError:
        pass

    # Try to find JSON block in the response
    json_match = re.search(r'\{[\s\S]*\}', raw_text)
    if json_match:
        try:
            return json.loads(json_match.group())
        except json.JSONDecodeError:
            pass

    # If parsing fails, return a structured fallback
    logger.warning("Could not parse AI response as JSON, using fallback")
    return {
        "condition_name": "Analysis Inconclusive",
        "condition_type": "Unknown",
        "severity": 3.0,
        "severity_label": "MILD",
        "description": f"The AI model provided the following assessment: {raw_text[:200]}",
        "warning": "Unable to parse structured response. Please consult a dermatologist.",
        "daily_routine": [
            {
                "title": "Gentle Cleanser",
                "subtitle": "Wash the affected area with a mild, fragrance-free cleanser",
                "time": "8:00 AM",
                "icon": "water",
            },
            {
                "title": "Moisturize",
                "subtitle": "Apply a hypoallergenic moisturizer",
                "time": "8:15 AM",
                "icon": "bottle-tonic",
            },
            {
                "title": "Sun Protection",
                "subtitle": "Apply SPF 50+ sunscreen before going outdoors",
                "time": "9:00 AM",
                "icon": "white-balance-sunny",
            },
            {
                "title": "Evening Care",
                "subtitle": "Cleanse and moisturize before bed",
                "time": "9:00 PM",
                "icon": "medical-bag",
            },
        ],
        "lifestyle_adjustments": [
            {"title": "Avoid Irritants", "subtitle": "No harsh soaps", "icon": "alert"},
            {"title": "Stay Hydrated", "subtitle": "Drink 8+ glasses", "icon": "cup-water"},
        ],
        "precautions": [
            "Avoid scratching the affected area",
            "Use fragrance-free products",
            "Monitor for changes in size or color",
        ],
        "when_to_see_doctor": "If symptoms worsen, spread, or do not improve within 2 weeks, consult a dermatologist immediately.",
    }


# ─── API Endpoints ─────────────────────────────────────────

@app.on_event("startup")
async def startup_event():
    """Check connection to llama-server on startup."""
    logger.info("Starting DerScan Backend...")
    try:
        import requests
        resp = requests.get("http://localhost:8080/health", timeout=2)
        if resp.status_code == 200:
            logger.info("✅ Connected to MedGemma Server (llama-server)!")
        else:
            logger.warning("⚠️ MedGemma Server replied but status != 200.")
    except Exception:
        logger.warning("⚠️ Could not connect to MedGemma Server at startup. Is start_medgemma.bat running?")


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Check server and model status."""
    model_loaded = False
    gpu_available = False
    try:
        import requests
        resp = requests.get("http://localhost:8080/health", timeout=1)
        if resp.status_code == 200:
            model_loaded = True
            data = resp.json()
            # llama-server health doesn't always show GPU explicitly in simple JSON, 
            # but if it's running with -ngl 99, it's using GPU.
            gpu_available = True 
    except:
        pass
    
    return HealthResponse(
        status="ok" if model_loaded else "model_not_loaded",
        model_loaded=model_loaded,
        gpu_available=gpu_available,
        model_name="medgemma-server",
    )


@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_skin(image: UploadFile = File(...)):
    """
    Analyze a skin condition image using the local MedGemma server.
    """
    # Validate file type
    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="Invalid file type. Please upload an image (JPEG, PNG).",
        )

    try:
        # Read and process the image
        image_bytes = await image.read()
        
        # Convert to base64
        base64_image = base64.b64encode(image_bytes).decode('utf-8')
        image_data_url = f"data:image/jpeg;base64,{base64_image}"

        logger.info(f"Sending image to MedGemma Server ({len(base64_image)} bytes)...")

        # Construct OpenAI-compatible payload for llama-server
        payload = {
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": build_analysis_prompt("")}, # prompt string only
                        {"type": "image_url", "image_url": {"url": image_data_url}}
                    ]
                }
            ],
            "model": "medgemma", 
            "max_tokens": 1024,
            "temperature": 0.2
        }

        import requests
        SERVER_URL = "http://localhost:8080/v1/chat/completions"
        
        try:
            response = requests.post(SERVER_URL, json=payload, timeout=120)
            response.raise_for_status()
            result = response.json()
            
            # Extract content
            raw_text = result['choices'][0]['message']['content']
            logger.info("✅ Analysis received from server!")

        except requests.exceptions.ConnectionError:
            raise HTTPException(status_code=503, detail="MedGemma Server is not running. Please run start_medgemma.bat")
        except Exception as e:
            logger.error(f"Server Error: {e}")
            raise HTTPException(status_code=500, detail=f"Model analysis failed: {str(e)}")
        
        # Parse the JSON response from the model
        parsed = parse_ai_response(raw_text)
        
        # Generate scan ID
        scan_id = f"SCAN_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        return AnalysisResponse(
            scan_id=scan_id,
            timestamp=datetime.now().isoformat(),
            condition_name=parsed.get("condition_name", "Unknown"),
            condition_type=parsed.get("condition_type", "Unknown"),
            severity=float(parsed.get("severity", 5.0)),
            severity_label=parsed.get("severity_label", "MODERATE"),
            description=parsed.get("description", "Analysis completed."),
            warning=parsed.get("warning", "Please consult a dermatologist for confirmation."),
            daily_routine=[
                RoutineItem(**item) for item in parsed.get("daily_routine", [])
            ],
            lifestyle_adjustments=[
                LifestyleItem(**item) for item in parsed.get("lifestyle_adjustments", [])
            ],
            precautions=parsed.get("precautions", []),
            when_to_see_doctor=parsed.get("when_to_see_doctor", "Consult a doctor if symptoms persist."),
            clinical_features=parsed.get("clinical_features", []),
            differential_diagnosis=parsed.get("differential_diagnosis", []),
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Analysis failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed: {str(e)}",
        )


@app.post("/analyze/mock")
async def analyze_mock():
    """
    Mock endpoint for testing frontend without a GPU.
    Returns realistic sample data matching the app's UI requirements.
    """
    return AnalysisResponse(
        scan_id=f"SCAN_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
        timestamp=datetime.now().isoformat(),
        condition_name="Eczema (Atopic Dermatitis)",
        condition_type="Inflammatory",
        severity=6.5,
        severity_label="MODERATE",
        description="The skin shows signs of atopic dermatitis with erythematous patches and mild lichenification. The affected area exhibits dry, scaly texture with evidence of recent inflammation.",
        warning="High redness detected. Inflammation markers are elevated compared to baseline. Monitor for secondary infection.",
        daily_routine=[
            RoutineItem(
                title="Gentle Cleanser",
                subtitle="Use lukewarm water. Pat dry, do not rub.",
                time="8:00 AM",
                icon="water",
            ),
            RoutineItem(
                title="Apply Steroid Cream",
                subtitle="Topical Corticosteroid to affected areas only.",
                time="8:15 AM",
                icon="medical-bag",
            ),
            RoutineItem(
                title="Sunscreen Application",
                subtitle="SPF 50+ on exposed areas. Reapply every 2 hours.",
                time="9:00 AM",
                icon="white-balance-sunny",
            ),
            RoutineItem(
                title="Hydration Check",
                subtitle="Drink at least 8 glasses of water throughout the day.",
                time="12:00 PM",
                icon="cup-water",
            ),
            RoutineItem(
                title="Apply Moisturizer",
                subtitle="Apply generously over whole body to lock in moisture.",
                time="8:00 PM",
                icon="bottle-tonic",
            ),
            RoutineItem(
                title="Evening Treatment",
                subtitle="Apply prescribed cream before bed. Use cotton gloves if needed.",
                time="9:00 PM",
                icon="medical-bag",
            ),
        ],
        lifestyle_adjustments=[
            LifestyleItem(title="Short Showers", subtitle="Max 10 mins, lukewarm", icon="shower"),
            LifestyleItem(title="Cotton Clothes", subtitle="Loose fitting only", icon="tshirt-crew"),
            LifestyleItem(title="Humidifier", subtitle="Keep air moist at home", icon="air-humidifier"),
            LifestyleItem(title="Diet", subtitle="Avoid spicy & processed food", icon="food-apple"),
        ],
        precautions=[
            "Avoid scratching — use cold compress for itch relief",
            "Do not use fragranced products (soap, lotion, detergent)",
            "Avoid hot water — use lukewarm only",
            "Keep nails short to prevent skin damage from scratching",
            "Wear gloves when using cleaning products",
        ],
        when_to_see_doctor="Seek immediate medical attention if you notice signs of infection (pus, increased redness spreading beyond the affected area, fever), or if symptoms significantly worsen despite following the treatment plan for 2 weeks.",
        clinical_features=[
            "Erythematous patches with ill-defined borders",
            "Visible lichenification from chronic scratching",
            "Xerosis (generalized skin dryness) in surrounding area"
        ],
        differential_diagnosis=[
            "Contact Dermatitis",
            "Seborrheic Dermatitis",
            "Psoriasis"
        ]
    )


# ─── Entry Point ───────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    
    print("=" * 50)
    print("  DerScan AI Backend")
    print("  MedGemma 4B (Q4_K_M) — CUDA 13.0")
    print("=" * 50)
    print()
    print("Starting server on http://0.0.0.0:8000")
    print("API docs: http://localhost:8000/docs")
    print()
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=False,
        log_level="info",
    )
