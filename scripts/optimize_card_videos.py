#!/usr/bin/env python3
"""
AI Second Brain — Otimizador e Padronizador Universal de Vídeos
Aplica com rigor os padrões técnicos de compressão e proporção do GUIA_PADRONIZACAO_CARDS_VIDEO.md:
  1. Duração máxima de 5 segundos (-t 5)
  2. Geração do vídeo do card: 400x224 (16:9, contraste=1.25, saturação=1.35, H.264 CRF 27)
  3. Geração do vídeo do modal: 800x250 (crop panorâmico central 3.2:1, H.264 CRF 26)
  4. Geração do poster frame: 400x224 capturado no frame de 2s
  5. Compressão H.264 de alta precisão (yuv420p, +faststart, -an, aceleração nativa por GPU)

Nomenclatura gerada:
  Se informar nome personalizado (ex: prompt-bootstrap):
    prompt-bootstrap-card.mp4
    prompt-bootstrap-modal.mp4
    prompt-bootstrap-poster.jpg
  Se não informar:
    <nome_original>-card.mp4
    <nome_original>-modal.mp4
    <nome_original>-poster.jpg

Local de Salvamento:
  - PADRÃO: Grava na mesma pasta onde o vídeo original está.
  - Com --landing (-l): Grava diretamente na pasta oficial da Landing Page (docs/brain-ui/landing/assets/video).
  - Com --output-dir (-o): Grava em qualquer pasta informada.

Exemplos:
  # 1. Processar com nome original (salva na mesma pasta do arquivo original):
  python scripts/optimize_card_videos.py "C:/Users/alfre/Downloads/meu_video.mp4"

  # 2. Processar indicando NOME PERSONALIZADO para os arquivos gerados:
  python scripts/optimize_card_videos.py "Video Project 9.mp4" "prompt-bootstrap"
  python scripts/optimize_card_videos.py "Video Project 9.mp4" -n "prompt-bootstrap"

  # 3. Processar indicando nome personalizado e salvando na Landing Page:
  python scripts/optimize_card_videos.py "Video Project 9.mp4" "prompt-bootstrap" --landing

  # 4. Processar TODOS os vídeos da pasta atual (salva na própria pasta):
  python scripts/optimize_card_videos.py --batch

  # 5. Processar todos os vídeos da pasta atual e salvar na Landing Page:
  python scripts/optimize_card_videos.py --batch --landing
"""

import argparse
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path

# Garante suporte a UTF-8 no terminal Windows sem erro de charmap
if sys.platform == "win32":
    import io
    if hasattr(sys.stdout, "buffer"):
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    if hasattr(sys.stderr, "buffer"):
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent
LANDING_VIDEO_DIR = PROJECT_ROOT / "docs" / "brain-ui" / "landing" / "assets" / "video"

SYSTEM_VIDEO_EXCLUSIONS = {
    "promo-16x9.mp4",
    "reels-9x16.mp4",
}


def check_ffmpeg() -> bool:
    """Valida se o FFmpeg está instalado e disponível no PATH."""
    return shutil.which("ffmpeg") is not None


def get_file_size_kb(path: Path) -> float:
    if not path.exists():
        return 0.0
    return path.stat().st_size / 1024.0


def run_cmd(cmd: list[str]) -> bool:
    """Executa comando FFmpeg silenciando ruído desnecessário."""
    try:
        subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, check=True)
        return True
    except subprocess.CalledProcessError as e:
        print(f"\n❌ Erro no comando FFmpeg: {' '.join(cmd)}")
        if e.stderr:
            last_line = e.stderr.strip().splitlines()[-1] if e.stderr.strip() else "Desconhecido"
            print(f"   Detalhe: {last_line}")
        return False


def is_candidate_raw_video(file_path: Path) -> bool:
    """Identifica vídeos brutos e ignora saídas já geradas (-card, -modal, -poster, .bak)."""
    name_lower = file_path.name.lower()
    if not name_lower.endswith((".mp4", ".mov", ".mkv", ".webm", ".avi")):
        return False
    if name_lower.endswith(("-card.mp4", "-modal.mp4", ".bak", ".tmp.mp4")):
        return False
    if name_lower in SYSTEM_VIDEO_EXCLUSIONS:
        return False
    return True


def sanitize_custom_name(name: str) -> str:
    """
    Higieniza o nome base informado pelo usuário:
      - Remove espaços e quebras de linha
      - Extrai apenas o stem caso o usuário passe extensão (ex: 'prompt-bootstrap.mp4' -> 'prompt-bootstrap')
      - Remove sufixos como -card, -modal, -poster se o usuário tiver digitado por engano
    """
    if not name:
        return ""
    cleaned = str(name).strip()
    # Se passou caminho completo ou arquivo com extensão
    cleaned = Path(cleaned).stem
    # Remove sufixos conhecidos no final do nome (-card, -modal, -poster, _card, etc)
    cleaned = re.sub(r"[-_](card|modal|poster)$", "", cleaned, flags=re.IGNORECASE)
    return cleaned.strip()


def process_single_video(source_path: Path, output_dir: Path, custom_name: str = None, duration: int = 5) -> dict:
    """
    Processa um único vídeo e gera o trio:
      - <base>-card.mp4
      - <base>-modal.mp4
      - <base>-poster.jpg
    """
    output_dir.mkdir(parents=True, exist_ok=True)
    base_name = sanitize_custom_name(custom_name) if custom_name else source_path.stem

    card_file = output_dir / f"{base_name}-card.mp4"
    modal_file = output_dir / f"{base_name}-modal.mp4"
    poster_file = output_dir / f"{base_name}-poster.jpg"

    src_size = get_file_size_kb(source_path)
    print(f"\n🎬 Processando: '{source_path.name}'")
    print(f"   Origem:    {source_path} ({src_size:.1f} KB / {src_size/1024:.2f} MB)")
    print(f"   Destino:   {output_dir}")
    print(f"   Nome Base: '{base_name}'")
    print(f"   Arquivos:  {card_file.name} | {modal_file.name} | {poster_file.name}")

    # 1. Vídeo do Card (400x224, 16:9, contraste + saturação)
    card_tmp = output_dir / f"{base_name}-card.tmp.mp4"
    cmd_card = [
        "ffmpeg", "-y",
        "-ss", "00:00:00",
        "-i", str(source_path),
        "-t", str(duration),
        "-vf", "scale=400:224,eq=contrast=1.25:brightness=0.03:saturation=1.35",
        "-an",
        "-c:v", "libx264",
        "-crf", "27",
        "-preset", "slow",
        "-pix_fmt", "yuv420p",
        "-color_range", "tv",
        "-colorspace", "bt709",
        "-color_primaries", "bt709",
        "-color_trc", "bt709",
        "-movflags", "+faststart",
        str(card_tmp),
    ]
    print(f"   [1/3] Gerando Vídeo do Card ({duration}s, 400x224)...", end="", flush=True)
    if not run_cmd(cmd_card):
        return {"success": False, "error": "Falha no card.mp4"}
    card_tmp.replace(card_file)
    print(f" Concluído! ({get_file_size_kb(card_file):.1f} KB)")

    # 2. Vídeo do Modal (800x250, crop panorâmico)
    modal_tmp = output_dir / f"{base_name}-modal.tmp.mp4"
    cmd_modal = [
        "ffmpeg", "-y",
        "-ss", "00:00:00",
        "-i", str(source_path),
        "-t", str(duration),
        "-vf", "crop=in_w:in_w*(250/800):0:(in_h-(in_w*(250/800)))/2,scale=800:250,eq=contrast=1.22:brightness=0.03:saturation=1.3",
        "-an",
        "-c:v", "libx264",
        "-crf", "26",
        "-preset", "slow",
        "-pix_fmt", "yuv420p",
        "-color_range", "tv",
        "-colorspace", "bt709",
        "-color_primaries", "bt709",
        "-color_trc", "bt709",
        "-movflags", "+faststart",
        str(modal_tmp),
    ]
    print(f"   [2/3] Gerando Vídeo do Modal ({duration}s, 800x250)...", end="", flush=True)
    if not run_cmd(cmd_modal):
        return {"success": False, "error": "Falha no modal.mp4"}
    modal_tmp.replace(modal_file)
    print(f" Concluído! ({get_file_size_kb(modal_file):.1f} KB)")

    # 3. Poster Frame (400x224 aos 2s)
    poster_tmp = output_dir / f"{base_name}-poster.tmp.jpg"
    cmd_poster = [
        "ffmpeg", "-y",
        "-i", str(card_file),
        "-ss", "00:00:02",
        "-vframes", "1",
        "-q:v", "3",
        str(poster_tmp),
    ]
    print(f"   [3/3] Gerando Poster Frame (frame @ 2s)...", end="", flush=True)
    if not run_cmd(cmd_poster):
        return {"success": False, "error": "Falha no poster.jpg"}
    poster_tmp.replace(poster_file)
    print(f" Concluído! ({get_file_size_kb(poster_file):.1f} KB)")

    total_kb = get_file_size_kb(card_file) + get_file_size_kb(modal_file) + get_file_size_kb(poster_file)
    reduction = ((src_size - total_kb) / src_size * 100.0) if src_size > 0 else 0

    print(f"   ✨ Resumo: {src_size:.1f} KB -> {total_kb:.1f} KB ({reduction:+.1f}% de redução)")
    print(f"   📁 Arquivos gerados:")
    print(f"      • {card_file.name}")
    print(f"      • {modal_file.name}")
    print(f"      • {poster_file.name}")

    return {
        "success": True,
        "base_name": base_name,
        "card_file": card_file,
        "modal_file": modal_file,
        "poster_file": poster_file,
        "card_size_kb": get_file_size_kb(card_file),
        "modal_size_kb": get_file_size_kb(modal_file),
        "poster_size_kb": get_file_size_kb(poster_file),
        "total_kb": total_kb,
        "reduction_pct": reduction,
    }


def main():
    parser = argparse.ArgumentParser(
        description="Otimizador e Padronizador Universal de Vídeos (Card, Modal e Poster)",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""Exemplos:
  # 1. Processar com o nome original (salva onde o original está):
  python scripts/optimize_card_videos.py "meu_video.mp4"

  # 2. Processar indicando o NOME PERSONALIZADO desejado (posicional ou via -n):
  python scripts/optimize_card_videos.py "Video Project 9.mp4" "prompt-bootstrap"
  python scripts/optimize_card_videos.py "Video Project 9.mp4" -n "prompt-bootstrap"

  # 3. Processar com nome personalizado e salvar direto na Landing Page:
  python scripts/optimize_card_videos.py "Video Project 9.mp4" "prompt-bootstrap" --landing

  # 4. Processar todos os vídeos da pasta em lote:
  python scripts/optimize_card_videos.py --batch
  python scripts/optimize_card_videos.py --batch --landing
""",
    )
    parser.add_argument("target", nargs="?", help="Caminho do arquivo de vídeo específico ou pasta para processar")
    parser.add_argument("custom_name", nargs="?", help="Nome personalizado para os arquivos gerados (ex: prompt-bootstrap)")
    parser.add_argument("--file", "-f", help="Caminho do arquivo de vídeo específico")
    parser.add_argument("--name", "-n", help="Nome base personalizado para os arquivos gerados (sem extensão)")
    parser.add_argument("--batch", "-b", action="store_true", help="Processar todos os vídeos brutos da pasta")
    parser.add_argument("--landing", "-l", action="store_true", help="Salvar na pasta oficial da Landing Page (docs/brain-ui/landing/assets/video)")
    parser.add_argument("--input-dir", "-i", help="Pasta de entrada personalizada para o modo lote (padrão: pasta atual do terminal)")
    parser.add_argument("--output-dir", "-o", help="Pasta de saída personalizada")
    parser.add_argument("--duration", "-d", type=int, default=5, help="Duração máxima do loop em segundos (padrão: 5)")

    args = parser.parse_args()

    if not check_ffmpeg():
        print("❌ FFmpeg não encontrado no PATH do sistema. Instale o FFmpeg para continuar.")
        sys.exit(1)

    cwd = Path.cwd()

    # Identifica se o target é um diretório
    target_is_dir = False
    if args.target and not args.file:
        t_path = Path(args.target)
        if t_path.is_dir() or (cwd / args.target).is_dir():
            target_is_dir = True

    # Resolução do nome personalizado (pode vir como segundo argumento posicional ou via --name/-n)
    if args.file and args.target and not args.name and not args.custom_name:
        raw_custom_name = args.target
    else:
        raw_custom_name = args.name or args.custom_name

    # Se foi passado --batch ou o target é uma pasta, entra no modo lote
    is_batch_mode = args.batch or target_is_dir

    if not is_batch_mode:
        # Resolução do arquivo de vídeo específico
        specific_input = args.file or args.target

        if specific_input:
            target_path = Path(specific_input)
            if not target_path.is_file():
                candidates = [
                    cwd / specific_input,
                    PROJECT_ROOT / specific_input,
                ]
                if not target_path.suffix:
                    for ext in (".mp4", ".mov", ".mkv", ".webm", ".avi"):
                        candidates.append(cwd / f"{specific_input}{ext}")
                        candidates.append(PROJECT_ROOT / f"{specific_input}{ext}")

                found = next((c for c in candidates if c.is_file()), None)
                if found:
                    target_path = found
                else:
                    print(f"❌ Arquivo não encontrado: {specific_input}")
                    sys.exit(1)

            # Destino: Se passou --landing, usa landing; se passou --output-dir, usa output-dir; senão, salva onde o original está!
            if args.landing:
                target_out_dir = LANDING_VIDEO_DIR
            elif args.output_dir:
                target_out_dir = Path(args.output_dir).resolve()
            else:
                target_out_dir = target_path.parent

            res = process_single_video(target_path, target_out_dir, custom_name=raw_custom_name, duration=args.duration)
            if res["success"]:
                print(f"\n✅ Concluído com sucesso! Arquivos gravados em: {target_out_dir}\n")
            return

    # 2. Modo Batch (Lote)
    # Entrada: Se passou --input-dir usa ele; se target era diretório usa target; senão usa a pasta atual (cwd)
    if args.input_dir:
        batch_in_dir = Path(args.input_dir).resolve()
    elif target_is_dir:
        batch_in_dir = Path(args.target).resolve() if Path(args.target).is_dir() else (cwd / args.target).resolve()
    else:
        batch_in_dir = cwd

    if not batch_in_dir.exists():
        print(f"❌ Pasta de entrada não existe: {batch_in_dir}")
        sys.exit(1)

    raw_videos = [p for p in batch_in_dir.iterdir() if p.is_file() and is_candidate_raw_video(p)]

    if not raw_videos:
        print(f"\nℹ️ Nenhum vídeo bruto pendente encontrado em: {batch_in_dir}")
        print("   Dica: Coloque seus vídeos gravados nessa pasta ou use: python optimize_card_videos.py \"video.mp4\"\n")
        return

    # Destino para batch: se --landing, usa landing; se --output-dir, usa output-dir; senão, salva na própria pasta de entrada!
    if args.landing:
        batch_out_dir = LANDING_VIDEO_DIR
    elif args.output_dir:
        batch_out_dir = Path(args.output_dir).resolve()
    else:
        batch_out_dir = batch_in_dir

    print(f"\n🔍 Modo Lote: Encontrado(s) {len(raw_videos)} vídeo(s) em '{batch_in_dir}'")
    print(f"   Destino dos arquivos gerados: '{batch_out_dir}'")
    if raw_custom_name:
        print(f"   ⚠️ Aviso: Nome personalizado '{raw_custom_name}' ignorado no modo lote para não sobrescrever os arquivos.")

    results = []
    for v in raw_videos:
        res = process_single_video(v, batch_out_dir, custom_name=None, duration=args.duration)
        if res["success"]:
            results.append(res)

    print(f"\n{'='*70}")
    print(f"🎉 Lote concluído! {len(results)}/{len(raw_videos)} vídeo(s) gerados com sucesso:")
    for r in results:
        print(f"  • {r['base_name']:<25} | Card: {r['card_size_kb']:.1f} KB | Modal: {r['modal_size_kb']:.1f} KB | Poster: {r['poster_size_kb']:.1f} KB ({r['reduction_pct']:+.1f}%)")
    print(f"{'='*70}\n")


if __name__ == "__main__":
    main()
