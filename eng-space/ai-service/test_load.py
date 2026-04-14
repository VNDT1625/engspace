import traceback

try:
    import torch
    from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig

    base_model_name = "unsloth/qwen2.5-7b-instruct-unsloth-bnb-4bit"
    
    print("Loading tokenizer...")
    tokenizer = AutoTokenizer.from_pretrained(base_model_name)
    print("Tokenizer loaded OK!")
    
    print("Loading base model...")
    bnb_config = BitsAndBytesConfig(
        load_in_4bit=True,
        bnb_4bit_compute_dtype=torch.float16,
    )
    base_model = AutoModelForCausalLM.from_pretrained(
        base_model_name,
        quantization_config=bnb_config,
        device_map="auto"
    )
    print("Model loaded OK!")
except Exception as e:
    print("=" * 60)
    print("FULL ERROR:")
    print("=" * 60)
    traceback.print_exc()
    print("=" * 60)
