from fastapi import APIRouter, UploadFile, File
from fastapi.responses import JSONResponse
from pdfminer.high_level import extract_text

router = APIRouter()

@router.post("/", tags=["upload"])
async def upload_resume(file: UploadFile = File(...)):
    temp_path = f"temp_{file.filename}"

    contents = await file.read()
    with open(temp_path, "wb") as f:
        f.write(contents)

    # Extract text using pdfminer
    try:
        text = extract_text(temp_path)
    except Exception as e:
        return JSONResponse({"error": f"Failed to extract text: {e}"}, status_code=500)

    return {"resume_text": text}
