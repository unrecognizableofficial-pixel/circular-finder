import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const [, , outputPathArg, ...inputPathArgs] = process.argv;

if (!outputPathArg || inputPathArgs.length === 0) {
  console.error("Usage: node scripts/concat-demo-preview-wavs.mjs <output.wav> <input1.wav> <input2.wav> [...]");
  process.exit(1);
}

const outputPath = resolve(process.cwd(), outputPathArg);
const inputPaths = inputPathArgs.map((inputPath) => resolve(process.cwd(), inputPath));
const SAMPLE_RATE = 44100;
const CHANNELS = 1;
const BITS_PER_SAMPLE = 16;
const BYTES_PER_SAMPLE = BITS_PER_SAMPLE / 8;
const GAP_SECONDS = 0.018;
const FADE_SECONDS = 0.01;

function findChunk(buffer, chunkId) {
  let offset = 12;

  while (offset + 8 <= buffer.length) {
    const id = buffer.toString("ascii", offset, offset + 4);
    const size = buffer.readUInt32LE(offset + 4);

    if (id === chunkId) {
      return { offset, size };
    }

    offset += 8 + size + (size % 2);
  }

  return null;
}

function readWav(filepath) {
  const buffer = readFileSync(filepath);

  if (buffer.toString("ascii", 0, 4) !== "RIFF" || buffer.toString("ascii", 8, 12) !== "WAVE") {
    throw new Error(`Unsupported WAV container: ${filepath}`);
  }

  const fmtChunk = findChunk(buffer, "fmt ");
  const dataChunk = findChunk(buffer, "data");

  if (!fmtChunk || !dataChunk) {
    throw new Error(`Missing fmt/data chunk: ${filepath}`);
  }

  const audioFormat = buffer.readUInt16LE(fmtChunk.offset + 8);
  const channelCount = buffer.readUInt16LE(fmtChunk.offset + 10);
  const sampleRate = buffer.readUInt32LE(fmtChunk.offset + 12);
  const bitsPerSample = buffer.readUInt16LE(fmtChunk.offset + 22);

  if (audioFormat !== 1 || channelCount !== CHANNELS || sampleRate !== SAMPLE_RATE || bitsPerSample !== BITS_PER_SAMPLE) {
    throw new Error(`Unexpected WAV format in ${filepath}`);
  }

  const samples = new Int16Array(dataChunk.size / BYTES_PER_SAMPLE);
  for (let index = 0; index < samples.length; index += 1) {
    samples[index] = buffer.readInt16LE(dataChunk.offset + 8 + index * BYTES_PER_SAMPLE);
  }

  return samples;
}

function applyFade(samples) {
  const faded = new Int16Array(samples);
  const fadeFrames = Math.min(samples.length, Math.floor(SAMPLE_RATE * FADE_SECONDS));

  for (let index = 0; index < fadeFrames; index += 1) {
    const fadeIn = index / Math.max(1, fadeFrames);
    const fadeOut = (fadeFrames - index) / Math.max(1, fadeFrames);
    faded[index] = Math.round(faded[index] * fadeIn);
    const endIndex = faded.length - 1 - index;
    faded[endIndex] = Math.round(faded[endIndex] * fadeOut);
  }

  return faded;
}

function writeWaveFile(filepath, samples) {
  const dataSize = samples.length * BYTES_PER_SAMPLE;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(CHANNELS, 22);
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(SAMPLE_RATE * CHANNELS * BYTES_PER_SAMPLE, 28);
  buffer.writeUInt16LE(CHANNELS * BYTES_PER_SAMPLE, 32);
  buffer.writeUInt16LE(BITS_PER_SAMPLE, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let index = 0; index < samples.length; index += 1) {
    buffer.writeInt16LE(samples[index], 44 + index * BYTES_PER_SAMPLE);
  }

  mkdirSync(dirname(filepath), { recursive: true });
  writeFileSync(filepath, buffer);
}

const gapFrames = Math.floor(SAMPLE_RATE * GAP_SECONDS);
const gapSamples = new Int16Array(gapFrames);
const renderedSegments = inputPaths.map((filepath) => applyFade(readWav(filepath)));
const combinedLength =
  renderedSegments.reduce((total, segment) => total + segment.length, 0) + gapFrames * Math.max(0, renderedSegments.length - 1);
const combinedSamples = new Int16Array(combinedLength);

let cursor = 0;
renderedSegments.forEach((segment, index) => {
  combinedSamples.set(segment, cursor);
  cursor += segment.length;

  if (index < renderedSegments.length - 1) {
    combinedSamples.set(gapSamples, cursor);
    cursor += gapFrames;
  }
});

writeWaveFile(outputPath, combinedSamples);
console.log(`Concatenated ${renderedSegments.length} clips into ${outputPath}`);
