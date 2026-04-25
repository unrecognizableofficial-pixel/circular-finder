import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const OUTPUT_DIR = resolve(process.cwd(), "frontend/public/audio/demo-preview");
const SAMPLE_RATE = 44100;

function clamp(sample) {
  return Math.max(-1, Math.min(1, sample));
}

function writeWaveFile(filepath, samples) {
  const frameCount = samples.length;
  const dataSize = frameCount * 2;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(SAMPLE_RATE * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let index = 0; index < frameCount; index += 1) {
    const value = Math.round(clamp(samples[index]) * 32767);
    buffer.writeInt16LE(value, 44 + index * 2);
  }

  mkdirSync(dirname(filepath), { recursive: true });
  writeFileSync(filepath, buffer);
}

function createSamples(durationSeconds, sampleFn) {
  const frameCount = Math.floor(durationSeconds * SAMPLE_RATE);
  return Array.from({ length: frameCount }, (_, index) => sampleFn(index / SAMPLE_RATE, index, frameCount));
}

function applyFade(sample, time, duration, fadeIn = 0.006, fadeOut = 0.05) {
  const attack = Math.min(1, time / fadeIn);
  const release = Math.min(1, (duration - time) / fadeOut);
  return sample * attack * Math.max(0, release);
}

function createClick() {
  const duration = 0.1;
  return createSamples(duration, (time, index) => {
    const decay = Math.exp(-time * 34);
    const tone = Math.sin(2 * Math.PI * (1450 - time * 420) * time) * 0.85;
    const overtone = Math.sin(2 * Math.PI * (2480 - time * 840) * time) * 0.25;
    const noise = (Math.sin(index * 12.9898) * 43758.5453 % 1) * 2 - 1;
    return applyFade((tone + overtone + noise * 0.13) * decay * 0.7, time, duration);
  });
}

function createHover() {
  const duration = 0.18;
  return createSamples(duration, (time) => {
    const progress = time / duration;
    const frequency = 760 + progress * 420;
    const glide = Math.sin(2 * Math.PI * frequency * time);
    const shimmer = Math.sin(2 * Math.PI * (frequency * 1.5) * time) * 0.18;
    return applyFade((glide * 0.28 + shimmer) * (1 - progress * 0.2), time, duration, 0.01, 0.08);
  });
}

function createConfirm() {
  const duration = 0.26;
  return createSamples(duration, (time) => {
    const toneA = Math.sin(2 * Math.PI * 740 * time) * Math.exp(-time * 7);
    const toneB = time > 0.09 ? Math.sin(2 * Math.PI * 980 * (time - 0.09)) * Math.exp(-(time - 0.09) * 8) : 0;
    const low = Math.sin(2 * Math.PI * 220 * time) * 0.12 * Math.exp(-time * 6);
    return applyFade((toneA * 0.32 + toneB * 0.26 + low) * 0.95, time, duration, 0.006, 0.1);
  });
}

function createScan() {
  const duration = 0.16;
  return createSamples(duration, (time) => {
    const progress = time / duration;
    const frequency = 520 + progress * 760;
    const chirp = Math.sin(2 * Math.PI * frequency * time) * Math.exp(-time * 10);
    const tick = Math.sin(2 * Math.PI * 1180 * time) * Math.exp(-time * 18) * 0.22;
    return applyFade((chirp * 0.34 + tick) * 0.9, time, duration, 0.004, 0.06);
  });
}

writeWaveFile(resolve(OUTPUT_DIR, "ui-click.wav"), createClick());
writeWaveFile(resolve(OUTPUT_DIR, "ui-hover.wav"), createHover());
writeWaveFile(resolve(OUTPUT_DIR, "ui-confirm.wav"), createConfirm());
writeWaveFile(resolve(OUTPUT_DIR, "ui-scan.wav"), createScan());

console.log(`Generated demo preview UI sound effects in ${OUTPUT_DIR}`);
