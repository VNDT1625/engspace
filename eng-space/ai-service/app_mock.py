from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import uvicorn

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    
class VideoChatRequest(BaseModel):
    youtube_url: str
    question: str

@app.post("/chat")
def chat(request: ChatRequest):
    last_msg = request.messages[-1].content
    return {"reply": f"[MOCK AI REPLY] Bạn vừa nói: '{last_msg}'. AI Tutor đã nghe rõ và phản hồi!"}

@app.post("/video-chat")
def video_chat(request: VideoChatRequest):
    return {"reply": f"[MOCK AI REPLY] Đã đọc xong giả lập video {request.youtube_url}. Trả lời cho câu hỏi '{request.question}': Đây là một video rất hữu ích cho việc học tiếng Anh."}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
