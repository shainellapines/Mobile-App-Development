//
//  ToneGenerator.swift
//  AuraSpatial
//
//  Synthesizes short, seamlessly-loopable audio buffers on-device so the
//  midterm build needs no bundled or downloaded sound files (FR-3.3).
//

import AVFAudio

enum ToneGenerator {
    static func buffer(for asset: SoundAsset, format: AVAudioFormat, duration: Double = 2.0) -> AVAudioPCMBuffer {
        let frameCount = AVAudioFrameCount(format.sampleRate * duration)
        guard let buffer = AVAudioPCMBuffer(pcmFormat: format, frameCapacity: frameCount) else {
            fatalError("Failed to allocate audio buffer for \(asset.name)")
        }
        buffer.frameLength = frameCount
        let sampleRate = Float(format.sampleRate)

        for channel in 0..<Int(format.channelCount) {
            guard let data = buffer.floatChannelData?[channel] else { continue }
            for frame in 0..<Int(frameCount) {
                let time = Float(frame) / sampleRate
                data[frame] = sample(for: asset.waveform, frequency: Float(asset.baseFrequency), time: time)
            }
        }
        return buffer
    }

    private static func sample(for waveform: WaveformType, frequency: Float, time: Float) -> Float {
        switch waveform {
        case .sine:
            return sinf(2 * .pi * frequency * time) * 0.2
        case .triangle:
            let phase = (frequency * time).truncatingRemainder(dividingBy: 1)
            return (abs(phase - 0.5) * 4 - 1) * 0.2
        case .whiteNoise:
            return Float.random(in: -0.15...0.15)
        }
    }
}
