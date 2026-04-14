from transformers import AutoConfig, AutoModelForCausalLM

base_model_name = "unsloth/qwen2.5-7b-instruct-unsloth-bnb-4bit"

try:
    print("Loading config...")
    config = AutoConfig.from_pretrained(base_model_name)
    if hasattr(config, "quantization_config"):
        config.quantization_config["llm_int8_enable_fp32_cpu_offload"] = True

    print("Loading model...")
    base_model = AutoModelForCausalLM.from_pretrained(
        base_model_name,
        config=config,
        device_map="auto"
    )
    print("Loaded OK")
except Exception as e:
    print("Error:", e)
