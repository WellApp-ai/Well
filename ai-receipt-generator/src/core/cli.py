import typer
import json
import yaml
import os
import base64
import webbrowser
from openai import OpenAI
from pathlib import Path
from .data_generator import generate_receipt_data
from .prompt_renderer import generate_image_prompt
from .config_loader import load_config, validate_config, resolve_api_key
from .generators.base import BaseGenerator
from .generators.openai_generator import OpenAIGenerator
from .generators.anthropic_generator import AnthropicGenerator

app = typer.Typer()

def get_generator(config: dict) -> BaseGenerator:
    provider = config.get("default_model", "openai_image")
    settings = config.get(provider, {})

    api_key = resolve_api_key(config, provider)

    if not api_key:
        raise RuntimeError("❌ No API key found. Set it in `.env` or in `config/models.yaml` under `api_key:`")

    if provider == "openai_image":
        return OpenAIGenerator(api_key=api_key, model=settings["model"])
    elif provider == "anthropic":
        return AnthropicGenerator(api_key=api_key, model=settings["model"])
    else:
        raise ValueError(f"❌ Unsupported model provider: {provider}")
    


@app.command("generate-image-prompt")
def generate_image_prompt_cli(
    input_path: Path = typer.Option(None, help="YAML or JSON file containing receipt input data"),
    style: str = typer.Option("table_noire", help="Style name from prompts/styles/"),
    output_path: str = "exports/prompt_for_chatgpt.txt",
    save_image: bool = typer.Option(True, help="Save the generated PNG image"),
    open_image: bool = typer.Option(True, help="Automatically open the generated image")
):
    # 1. Load input data
    if not input_path:
        input_path = Path("config/receipt_input.yaml")
        typer.echo(f"📄 No input file provided, using default: {input_path}")

    if not input_path.exists():
        typer.echo(f"❌ File not found: {input_path}")
        raise typer.Exit()

    try:
        if input_path.suffix in [".yaml", ".yml"]:
            overrides = yaml.safe_load(input_path.read_text(encoding="utf-8"))
        elif input_path.suffix == ".json":
            overrides = json.loads(input_path.read_text(encoding="utf-8"))
        else:
            typer.echo("❌ Input file must be .yaml or .json")
            raise typer.Exit()
    except Exception as e:
        typer.echo(f"❌ Failed to read input file: {e}")
        raise typer.Exit()

    # 2. Generate receipt data
    typer.echo("🧾 Generating receipt data...")
    data = generate_receipt_data(overrides=overrides)

    # 3. Load and apply style
    style_path = Path(f"src/core/prompts/styles/{style}.json")
    if not style_path.exists():
        typer.echo(f"❌ Style not found: {style_path}")
        raise typer.Exit()

    style_json = json.loads(style_path.read_text(encoding="utf-8"))
    prompt = generate_image_prompt(data, style_json)

    # 4. Save prompt
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    Path(output_path).write_text(prompt, encoding="utf-8")
    typer.echo(f"💾 Prompt saved to: {output_path}")

    # 5. Call OpenAI to generate image
    typer.echo("🚀 Generating image using OpenAI...")
    config = load_config()
    if not validate_config(config):
        raise typer.Exit()

    image_cfg = config.get("openai_image", {})
    api_key = image_cfg.get("api_key") or os.getenv("OPENAI_API_KEY")

    if not api_key:
        typer.echo("❌ No API key found. Set it in `.env` or in `config/models.yaml`")
        raise typer.Exit()

    client = OpenAI(api_key=api_key)

    try:
        response = client.images.generate(
            model=image_cfg["model"],
            prompt=prompt,
            n=1,
            size=image_cfg["size"],
            quality=image_cfg["quality"]
        )
    except Exception as e:
        typer.echo(f"❌ OpenAI error: {e}")
        raise typer.Exit()

    # 6. Save generated image
    if save_image:
        image_data = response.data[0].b64_json
        img_path = Path("exports/receipt_generated.png")
        img_path.write_bytes(base64.b64decode(image_data))
        typer.echo(f"🖼️  Image saved to: {img_path}")

        if open_image:
            webbrowser.open(img_path.resolve().as_uri())

if __name__ == "__main__":
    app()
