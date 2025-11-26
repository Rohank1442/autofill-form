from fastapi import APIRouter, UploadFile, File
from fastapi.responses import JSONResponse
import textract

router = APIRouter()

@router.post("/", tags=["upload"])
async def upload_resume(file: UploadFile = File(...)):
    temp_path = f"temp_{file.filename}"
    contents = await file.read()
    with open(temp_path, "wb") as f:
        f.write(contents)

    text = textract.process(temp_path).decode("utf-8")
    return JSONResponse({"resume_text": text})
