//
//  CommunitySoundscapeCardView.swift
//  AuraSpatial
//
//  One Community Feed card - a reusable component (SRS Section 3.1) showing
//  creator attribution, a Play/Pause toggle, and Fork.
//

import SwiftUI

struct CommunitySoundscapeCardView: View {
    let soundscape: Soundscape
    let isPlaying: Bool
    let onPlayToggle: () -> Void
    let onFork: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            VStack(alignment: .leading, spacing: 2) {
                Text(soundscape.name)
                    .font(.headline)
                if let creator = soundscape.creatorUsername {
                    Text("@\(creator)")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }

            Text("\(soundscape.nodes.count) nodes")
                .font(.caption)
                .foregroundStyle(.secondary)

            HStack(spacing: 12) {
                Button(action: onPlayToggle) {
                    Label(isPlaying ? "Pause" : "Play", systemImage: isPlaying ? "pause.fill" : "play.fill")
                }
                .buttonStyle(.borderedProminent)
                .tint(.teal)
                .sensoryFeedback(.impact(weight: .light), trigger: isPlaying)

                Button(action: onFork) {
                    Label("Fork", systemImage: "arrow.triangle.branch")
                }
                .buttonStyle(.bordered)
            }

            HStack {
                Text("\(soundscape.likeCount) likes")
                Text("\(soundscape.forkCount) forks")
            }
            .font(.caption)
            .foregroundStyle(.secondary)
        }
        .padding()
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 16))
    }
}
