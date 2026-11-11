import os
import uvicorn

if __name__ == "__main__":
    port = int(os.getenv("PORT", "8000"))
    is_prod = os.getenv("RENDER", "").lower() == "true" or os.getenv("ENV") == "production"
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=not is_prod)
