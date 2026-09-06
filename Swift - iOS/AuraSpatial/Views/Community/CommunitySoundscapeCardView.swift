//
//  CommunitySoundscapeCardView.swift
//  AuraSpatial
//
//  One Community Feed card - a reusable component (SRS Section 3.1).
//  Rebuilt to match the prototype: a full-width animated waveform behind a
//  centered play/pause button, then a footer with the title and an amber
//  node-count pill. The waveform genuinely animates while playing, rather
//  than being static artwork.
//

import SwiftUI

struct CommunitySoundscapeCardView: View {
    let soundscape: Soundscape
    let isPlaying: Bool
    let onPlayToggle: () -> Void
    let onFork: () -> Void

    /// Alternates the waveform tint per card, matching the prototype's mix
    /// of violet- and teal-tinted cards.
    private var waveformTint: Color {
        (abs(soundscape.id.hashValue) % 2 == 0) ? .auraViolet : .auraTeal
    }

    var body: some View {
        VStack(spacing: 0) {
            ZStack {
                AnimatedWaveformBackground(tint: waveformTint, isPlaying: isPlaying)
                    .padding(.horizontal, 16)

                Button(action: onPlayToggle) {
                    Image(systemName: isPlaying ? "pause.fill" : "play.fill")
                        .font(.headline)
                        .foregroundStyle(.white)
                        .frame(width: 44, height: 44)
                        .background(waveformTint.opacity(0.9), in: Circle())
                }
                .buttonStyle(.plain)
                .sensoryFeedback(.impact(weight: .light), trigger: isPlaying)
            }
            .frame(height: 80)
            .background(Color.auraSurfaceElevated)

            VStack(alignment: .leading, spacing: 10) {
                HStack(alignment: .top) {
                    VStack(alignment: .leading, spacing: 2) {
                        Text(soundscape.name)
                            .font(.headline)
                            .foregroundStyle(.white)
                        if let creator = soundscape.creatorUsername {
                            Text("@\(creator)")
                                .font(.caption)
                                .foregroundStyle(.auraTextSecondary)
                        }
                    }
                    Spacer()
                    PillBadge(text: "\(soundscape.nodes.count) nodes", color: .auraAmber)
                }

                HStack(spacing: 16) {
                    Label("\(soundscape.likeCount)", systemImage: "heart.fill")
                    Label("\(soundscape.forkCount)", systemImage: "arrow.triangle.branch")
                    Spacer()
                    Button(action: onFork) {
                        Text("Fork")
                            .font(.subheadline.weight(.semibold))
                    }
                    .buttonStyle(.plain)
                    .foregroundStyle(.auraViolet)
                }
                .font(.caption)
                .foregroundStyle(.auraTextSecondary)
            }
            .padding(16)
            .background(Color.auraSurface)
        }
        .clipShape(RoundedRectangle(cornerRadius: 18))
    }
}
