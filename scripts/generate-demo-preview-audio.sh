#!/bin/zsh

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
OUTPUT_DIR="$ROOT_DIR/frontend/public/audio/demo-preview"
TEMP_DIR="$(mktemp -d)"
SWIFT_MODULE_CACHE="$TEMP_DIR/swift-module-cache"
CLANG_MODULE_CACHE="$TEMP_DIR/clang-module-cache"
PROVIDER="${DEMO_PREVIEW_AUDIO_PROVIDER:-auto}"
VOICE_NAME="${1:-realistic-human-narrator}"
VOICE_RATE="${DEMO_PREVIEW_AUDIO_RATE:-150}"
VOICE_LANGUAGE="${DEMO_PREVIEW_AUDIO_LANGUAGE:-en-GB}"
SWIFT_VOICE_RATE="${DEMO_PREVIEW_AUDIO_SWIFT_RATE:-0.41}"
OPENAI_TTS_MODEL="${OPENAI_TTS_MODEL:-gpt-4o-mini-tts}"
OPENAI_TTS_VOICE="${OPENAI_TTS_VOICE:-marin}"
OPENAI_TTS_INSTRUCTIONS="${OPENAI_TTS_INSTRUCTIONS:-Use a realistic human narrator voice with warm, natural, believable delivery, smooth professional narration tone, clear articulation, subtle breathing, conversational pacing, rich vocal texture, authentic human inflection, clean studio microphone sound, polished but lifelike sound, and cinematic presence.}"

if [[ "$PROVIDER" == "auto" ]]; then
  if [[ -n "${OPENAI_API_KEY:-}" ]]; then
    PROVIDER="openai"
  else
    PROVIDER="system"
  fi
fi

case "${VOICE_NAME:l}" in
  realistic-human-narrator|realistic_human_narrator|reference-uk-female|reference_uk_female|google-uk-female|google_uk_female|uk-female|uk_female|premium-uk-female|premium_uk_female)
    VOICE_NAME="Flo (English (UK))"
    ;;
esac

cleanup() {
  rm -rf "$TEMP_DIR"
}

trap cleanup EXIT

mkdir -p "$OUTPUT_DIR"
mkdir -p "$SWIFT_MODULE_CACHE" "$CLANG_MODULE_CACHE"

json_escape() {
  printf '%s' "$1" | perl -0pe 's/\\/\\\\/g; s/"/\\"/g; s/\n/\\n/g'
}

generate_clip_openai() {
  local clip_name="$1"
  local clip_text="$2"
  local output_wav="$OUTPUT_DIR/$clip_name.wav"
  local escaped_text
  local escaped_instructions

  if [[ -z "${OPENAI_API_KEY:-}" ]]; then
    echo "OPENAI_API_KEY is required when DEMO_PREVIEW_AUDIO_PROVIDER=openai" >&2
    exit 1
  fi

  escaped_text="$(json_escape "$clip_text")"
  escaped_instructions="$(json_escape "$OPENAI_TTS_INSTRUCTIONS")"

  curl -sS https://api.openai.com/v1/audio/speech \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"model\":\"$OPENAI_TTS_MODEL\",\"voice\":\"$OPENAI_TTS_VOICE\",\"response_format\":\"wav\",\"instructions\":\"$escaped_instructions\",\"input\":\"$escaped_text\"}" \
    --output "$output_wav"
}

generate_clip() {
  local clip_name="$1"
  local output_wav="$OUTPUT_DIR/$clip_name.wav"
  shift
  local segments=("$@")
  local segment_wavs=()

  for ((index = 1; index <= ${#segments[@]}; index += 1)); do
    local segment_text="${segments[$index]}"
    local segment_base="$TEMP_DIR/${clip_name}-${index}"
    local segment_caf="${segment_base}.caf"
    local segment_wav="${segment_base}.wav"

    if [[ "$PROVIDER" == "openai" ]]; then
      generate_clip_openai "${clip_name}-${index}" "$segment_text"
      mv "$OUTPUT_DIR/${clip_name}-${index}.wav" "$segment_wav"
    else
      env SWIFT_MODULECACHE_PATH="$SWIFT_MODULE_CACHE" CLANG_MODULE_CACHE_PATH="$CLANG_MODULE_CACHE" \
        swift "$ROOT_DIR/scripts/render-demo-preview-audio.swift" \
        --voice-name "$VOICE_NAME" \
        --voice-language "$VOICE_LANGUAGE" \
        --rate "$SWIFT_VOICE_RATE" \
        --output "$segment_caf" \
        --text "$segment_text"

      afconvert "$segment_caf" -o "$segment_wav" -f WAVE -d LEI16@44100 >/dev/null
    fi

    segment_wavs+=("$segment_wav")
  done

  node "$ROOT_DIR/scripts/concat-demo-preview-wavs.mjs" "$output_wav" "${segment_wavs[@]}" >/dev/null
}

generate_clip "dashboard" \
  "Everything in one place." \
  "Circular Finder opens with one premium command center where dashboard cards, trust health, notifications, and product detail assemble into view." \
  "Track performance instantly." \
  "Analytics, search, supplier signals, and enterprise readiness come into focus together." \
  "Stay connected anywhere." \
  "Messages, workflow automations, settings, and the mobile preview stay in sync across the same system." \
  "Then pull back and see the full product experience in one polished platform view."

generate_clip "scan" \
  "Scan any clothing item." \
  "A shopper can open the same product layer by QR code, NFC tap, barcode, or search." \
  "Find the exact product in one motion." \
  "The scanner locks onto the garment quickly and confirms the match with confidence." \
  "Open the digital passport instantly." \
  "The result hands off straight into a verified Digital Product Passport." \
  "Then pull back and see every entry path, match signal, and passport handoff in one clean flow."

generate_clip "passport" \
  "See the verified product story first." \
  "The passport opens with brand, origin, authenticity, and item identity in one premium view." \
  "Make circular care easy to understand." \
  "Materials, certifications, care guidance, and repair instructions stay clear on the same screen." \
  "Keep value attached after purchase." \
  "Resale value, recycling, and take-back options stay connected to the item." \
  "Then pull back and see identity, care, trust, and recovery together."

generate_clip "wardrobe" \
  "Turn the scan into a living record." \
  "After the passport is saved, the item becomes a live wardrobe entry instead of a one-time result." \
  "Track the life of the item over time." \
  "Wear count, last worn, repair history, and care reminders stay attached to the same product record." \
  "Guide the next circular decision." \
  "The app can point to repair, resale, reuse, or take-back as the next move." \
  "Then pull back and see ownership, value, and recovery in one view."

generate_clip "marketplace" \
  "Bring proof into every resale listing." \
  "Each marketplace offer inherits the passport so trust starts before the first click." \
  "Make resale feel premium and informed." \
  "Condition, pricing signals, provenance, and repairability stay visible while buyers shop." \
  "Keep circular commerce trustworthy at scale." \
  "The same verified data protects brand claims and improves buyer confidence." \
  "Then pull back and see listings, pricing, trust, and provenance in one polished marketplace."

generate_clip "rewards" \
  "Reward the good move instantly." \
  "Impact Points make circular actions feel visible the moment they happen." \
  "Build a circular habit people return to." \
  "Streaks and challenges turn scanning, repair, reuse, and resale into repeat behavior." \
  "Turn sustainability into momentum." \
  "Badges and milestones make progress social, shareable, and motivating." \
  "Then pull back and see points, streaks, badges, and challenges working together as one retention loop."

generate_clip "roles" \
  "One passport system supports every role." \
  "Consumers scan items, open trusted passports, save pieces, and earn rewards in one clean flow." \
  "Brands manage product stories, claims, performance, and trusted resale from the same source of truth." \
  "Suppliers attach origin, material proof, and compliance detail upstream without breaking the product experience." \
  "Admins govern trust rules, settings, and recovery workflows across the same circular platform." \
  "Then pull back and see consumer, brand, supplier, and admin working together in one connected system."

if [[ "$PROVIDER" == "openai" ]]; then
  printf 'Generated demo preview audio in %s using OpenAI %s voice %s\n' "$OUTPUT_DIR" "$OPENAI_TTS_MODEL" "$OPENAI_TTS_VOICE"
else
  printf 'Generated demo preview audio in %s using system voice %s (fallback when no AI narrator key is available)\n' "$OUTPUT_DIR" "$VOICE_NAME"
fi
