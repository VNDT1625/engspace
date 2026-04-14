import torch
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig, pipeline, AutoConfig
from peft import PeftModel
from youtube_transcript_api import YouTubeTranscriptApi
from urllib.parse import urlparse, parse_qs
import uvicorn
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

base_model_name = "unsloth/qwen2.5-7b-instruct-unsloth-bnb-4bit"
# Ensure correct path to lora weights relative to ai-service
lora_dir = os.environ.get("LORA_DIR", "YOUR_USERNAME/engspace-qwen-lora")
tokenizer = None
pipe = None
model_error = None


def init_model():
    global tokenizer, pipe, model_error

    try:
        # Load Tokenizer
        print("Loading tokenizer...")
        tokenizer = AutoTokenizer.from_pretrained(base_model_name)

        # Load Base model in 4-bit using bitsandbytes
        print("Loading base model...")
        bnb_config = BitsAndBytesConfig(
            load_in_4bit=True,
            bnb_4bit_compute_dtype=torch.float16,
            llm_int8_enable_fp32_cpu_offload=True,
        )
        base_model = AutoModelForCausalLM.from_pretrained(
            base_model_name,
            quantization_config=bnb_config,
            device_map="auto",
        )

        # Load LoRA adapter
        print("Loading LoRA weights...")
        model = PeftModel.from_pretrained(base_model, lora_dir)
        pipe = pipeline("text-generation", model=model, tokenizer=tokenizer)
        model_error = None
        print("AI model loaded successfully.")
    except Exception as e:
        model_error = str(e)
        print(f"AI model init failed, fallback mode enabled: {model_error}")


init_model()

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    
class VideoChatRequest(BaseModel):
    youtube_url: str
    question: str

def parse_generated_text(generated: str) -> str:
    # Qwen format uses <|im_start|>assistant\n ... <|im_end|>
    if "<|im_start|>assistant\n" in generated:
        response = generated.split("<|im_start|>assistant\n")[-1]
    elif "<|im_start|> assistant\n" in generated:
        response = generated.split("<|im_start|> assistant\n")[-1]
    else:
        response = generated
    return response.replace("<|im_end|>", "").strip()


def fallback_chat_reply(messages: List[Dict[str, str]]) -> str:
    last_user_msg = ""
    for m in reversed(messages):
        if m.get("role") == "user":
            last_user_msg = m.get("content", "").strip()
            break

    if last_user_msg:
        return (
            "AI model is temporarily unavailable. "
            f"I received your message: \"{last_user_msg}\". "
            "Please try again after restarting ai-service."
        )

    return "AI model is temporarily unavailable. Please try again after restarting ai-service."

@app.post("/chat")
def chat(request: ChatRequest):
    msgs = [{"role": m.role, "content": m.content} for m in request.messages]

    if pipe is None or tokenizer is None:
        return {"reply": fallback_chat_reply(msgs), "degraded": True, "error": model_error}
    
    # We ensure system prompt exists, otherwise Qwen handles its own
    has_system = any(m["role"] == "system" for m in msgs)
    if not has_system:
        msgs.insert(0, {"role": "system", "content": "You are a helpful and friendly English AI Tutor for the EngSpace platform. Keep your answers clear, educational, and engaging."})

    try:
        prompt = tokenizer.apply_chat_template(msgs, tokenize=False, add_generation_prompt=True)
        outputs = pipe(prompt, max_new_tokens=512, do_sample=True, temperature=0.7, top_p=0.9)
        
        generated = outputs[0]["generated_text"]
        reply = parse_generated_text(generated)
        
        return {"reply": reply}
    except Exception as e:
        print(f"Error generating chat: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Extract video ID from youtube URL
def extract_video_id(url):
    query = urlparse(url)
    if query.hostname == 'youtu.be':
        return query.path[1:]
    if query.hostname in ('www.youtube.com', 'youtube.com'):
        if query.path == '/watch':
            p = parse_qs(query.query)
            return p.get('v', [None])[0]
        if query.path[:7] == '/embed/':
            return query.path.split('/')[2]
        if query.path[:3] == '/v/':
            return query.path.split('/')[2]
    return None

@app.post("/video-chat")
def video_chat(request: VideoChatRequest):
    if pipe is None or tokenizer is None:
        return {
            "reply": "AI video mode is temporarily unavailable because the model failed to initialize. Please restart ai-service.",
            "degraded": True,
            "error": model_error,
        }

    video_id = extract_video_id(request.youtube_url)
    if not video_id:
        raise HTTPException(status_code=400, detail="Invalid YouTube URL")
    
    try:
        transcript = YouTubeTranscriptApi.get_transcript(video_id, languages=['en', 'vi', 'en-GB', 'en-US'])
        # Join the text
        full_text = " ".join([t['text'] for t in transcript])
        
        # Limit token count to prevent OOM
        max_chars = 8000 
        if len(full_text) > max_chars:
            full_text = full_text[:max_chars] + "... [TRUNCATED]"
            
        system_msg = f"You are an AI Tutor. Use the following video transcript to answer the user's question accurately.\n\n[Transcript Start]\n{full_text}\n[Transcript End]"
        
        msgs = [
            {"role": "system", "content": system_msg},
            {"role": "user", "content": request.question}
        ]
        
        prompt = tokenizer.apply_chat_template(msgs, tokenize=False, add_generation_prompt=True)
        outputs = pipe(prompt, max_new_tokens=512, do_sample=True, temperature=0.7, top_p=0.9)
        
        generated = outputs[0]["generated_text"]
        reply = parse_generated_text(generated)
        
        return {"reply": reply}
        
    except Exception as e:
        print(f"Error fetching transcript or generating reply: {str(e)}")
        raise HTTPException(status_code=500, detail="Mô hình không thể tải được phụ đề của video hoặc lỗi: " + str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
