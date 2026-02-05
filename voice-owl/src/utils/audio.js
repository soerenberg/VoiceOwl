export const DEFAULT_MIN_PITCH = 50;
export const DEFAULT_MAX_PITCH = 500;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const getMonoData = (audioBuffer) => {
  if (audioBuffer.numberOfChannels === 1) {
    return audioBuffer.getChannelData(0);
  }
  const length = audioBuffer.length;
  const output = new Float32Array(length);
  for (let channel = 0; channel < audioBuffer.numberOfChannels; channel += 1) {
    const data = audioBuffer.getChannelData(channel);
    for (let i = 0; i < length; i += 1) {
      output[i] += data[i] / audioBuffer.numberOfChannels;
    }
  }
  return output;
};

const autoCorrelate = (buffer, sampleRate, minPitch, maxPitch) => {
  let rms = 0;
  for (let i = 0; i < buffer.length; i += 1) {
    rms += buffer[i] * buffer[i];
  }
  rms = Math.sqrt(rms / buffer.length);
  if (rms < 0.01) {
    return null;
  }

  const minOffset = Math.floor(sampleRate / maxPitch);
  const maxOffset = Math.floor(sampleRate / minPitch);
  let bestOffset = -1;
  let bestCorrelation = 0;

  for (let offset = minOffset; offset <= maxOffset; offset += 1) {
    let correlation = 0;
    for (let i = 0; i < buffer.length - offset; i += 1) {
      correlation += buffer[i] * buffer[i + offset];
    }
    correlation /= buffer.length - offset;
    if (correlation > bestCorrelation) {
      bestCorrelation = correlation;
      bestOffset = offset;
    }
  }

  if (bestOffset === -1) {
    return null;
  }

  return sampleRate / bestOffset;
};

export const analyzePitchSeries = (audioBuffer, precisionMs, minPitch = DEFAULT_MIN_PITCH, maxPitch = DEFAULT_MAX_PITCH) => {
  const channelData = getMonoData(audioBuffer);
  const { sampleRate } = audioBuffer;
  const step = Math.max(1, Math.floor((precisionMs / 1000) * sampleRate));
  const analysisSize = clamp(Math.floor(sampleRate * 0.05), 2048, 4096);
  const series = [];

  for (let index = 0; index + analysisSize < channelData.length; index += step) {
    const slice = channelData.subarray(index, index + analysisSize);
    const pitch = autoCorrelate(slice, sampleRate, minPitch, maxPitch);
    series.push({
      time: index / sampleRate,
      pitch,
    });
  }

  return series;
};

export const encodeWav = (audioBuffer) => {
  const numChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const format = 1;
  const bitDepth = 16;
  const length = audioBuffer.length * numChannels * 2 + 44;
  const buffer = new ArrayBuffer(length);
  const view = new DataView(buffer);

  const writeString = (offset, text) => {
    for (let i = 0; i < text.length; i += 1) {
      view.setUint8(offset + i, text.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + audioBuffer.length * numChannels * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * 2, true);
  view.setUint16(32, numChannels * 2, true);
  view.setUint16(34, bitDepth, true);
  writeString(36, 'data');
  view.setUint32(40, audioBuffer.length * numChannels * 2, true);

  let offset = 44;
  for (let i = 0; i < audioBuffer.length; i += 1) {
    for (let channel = 0; channel < numChannels; channel += 1) {
      const sample = audioBuffer.getChannelData(channel)[i];
      const clamped = Math.max(-1, Math.min(1, sample));
      view.setInt16(offset, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true);
      offset += 2;
    }
  }

  return new Blob([view], { type: 'audio/wav' });
};
