---
title: EngSpace AI Service
emoji: 🤖
colorFrom: blue
colorTo: green
sdk: docker
pinned: false
---

# EngSpace AI Tutor Service

AI-powered English learning service for EngSpace platform using fine-tuned Qwen model with LoRA adapters.

## Features

- **Text Chat:** Interactive Q&A with AI tutor
- **Voice Chat:** Speech-to-text and text-to-speech capabilities
- **Video Chat:** YouTube transcript analysis and Q&A

## Model Details

- **Base Model:** unsloth/qwen2.5-7b-instruct-unsloth-bnb-4bit
- **Fine-tuning:** LoRA adaptation for English tutoring
- **Quantization:** 4-bit using bitsandbytes

## API Endpoints

- `POST /chat` - Text-based chat
- `POST /video-chat` - YouTube video analysis
- `GET /docs` - FastAPI Swagger documentation

## Environment Variables

- `LORA_DIR` - Path to LoRA weights (default: `../engspace-qwen-lora`)
- `HF_TOKEN` - (Optional) Hugging Face token for faster downloads

## Deployment

### Local Development

```bash
pip install -r requirements.txt
python app.py
```

### Hugging Face Spaces

Deploy via Docker. Service runs on port 7860.

## Requirements

- Python 3.11+
- 4GB+ RAM (for model loading)
- GPU recommended (CUDA 12.1+)

## License

MIT
