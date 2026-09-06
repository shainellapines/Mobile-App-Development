//
//  WaveformGlyph.swift
//  AuraSpatial
//
//  A small bar-waveform icon, reused as: the icon inside every sound node
//  and Sound Library row, and (scaled up and animated) the background art
//  on Community Feed cards. Built as a real animatable Shape/View rather
//  than an SF Symbol so it can genuinely pulse while a sound is playing.
//
//  Advanced-technique note: the animated variant below drives its bar
//  heights with a repeating spring via `PhaseAnimator`, the same technique
//  used for the listener's ambient pulse in CanvasView.
//

import SwiftUI
import Foundation

/// A static row of bars, sized for use inside a small circular node icon.
struct WaveformGlyph: View {
    var color: Color = .white
    var barCount: Int = 5

    private let heights: [CGFloat] = [0.4, 0.9, 0.6, 1.0, 0.5]

    var body: some View {
        HStack(spacing: 2) {
            ForEach(0..<barCount, id: \.self) { index in
                Capsule()
                    .fill(color)
                    .frame(width: 2.5, height: 14 * heights[index % heights.count])
            }
        }
    }
}

/// A wide, animated waveform used as Community card background art. Bars
/// gently breathe at all times, and pulse faster/taller while `isPlaying`.
struct AnimatedWaveformBackground: View {
    var tint: Color
    var isPlaying: Bool
    var barCount: Int = 28

    private let seeds: [CGFloat] = (0..<40).map { i in
        CGFloat((i * 37) % 100) / 100
    }

    var body: some View {
        PhaseAnimator([CGFloat(0), CGFloat(1)]) { phase in
            HStack(spacing: 3) {
                ForEach(0..<barCount, id: \.self) { index in
                    let seed = seeds[index % seeds.count]
                    let base = 0.25 + seed * 0.75
                    let wobble = isPlaying ? sin((seed + phase) * .pi * 2) * 0.25 : 0
                    Capsule()
                        .fill(tint.opacity(0.35 + base * 0.5))
                        .frame(width: 3, height: max(6, (base + wobble) * 60))
                }
            }
            .frame(maxWidth: .infinity)
        } animation: { _ in
            isPlaying ? .easeInOut(duration: 0.9) : .easeInOut(duration: 3)
        }
    }
}

#Preview {
    VStack(spacing: 24) {
        WaveformGlyph(color: .auraTeal)
        AnimatedWaveformBackground(tint: .auraViolet, isPlaying: true)
            .frame(height: 60)
        AnimatedWaveformBackground(tint: .auraTeal, isPlaying: false)
            .frame(height: 60)
    }
    .padding()
    .background(Color.auraBackground)
}
