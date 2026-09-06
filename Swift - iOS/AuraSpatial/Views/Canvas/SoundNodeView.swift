//
//  SoundNodeView.swift
//  AuraSpatial
//
//  One orbiting sound node on the Canvas - a reusable component (SRS
//  Section 3.1). Rebuilt to match the prototype: a ring colored by the
//  sound's category, a waveform glyph icon, and an uppercase category
//  label under the name.
//
//  Advanced-technique note: when selected, the dashed "marching ants" ring
//  is tagged with `.matchedGeometryEffect` so it visually glides from one
//  node to another as selection changes, instead of just cross-fading -
//  a genuine same-hierarchy use of the technique (a `.sheet` presentation
//  is a separate hierarchy and can't use matchedGeometryEffect across that
//  boundary, so this is where it actually applies).
//

import SwiftUI

struct SoundNodeView: View {
    let node: SoundNode
    let isSelected: Bool
    var namespace: Namespace.ID

    @State private var dashRotation: Double = 0

    private var asset: SoundAsset? {
        SoundAsset.library.first { $0.id == node.soundAssetID }
    }

    private var accentColor: Color {
        asset?.category.accentColor ?? .auraViolet
    }

    var body: some View {
        VStack(spacing: 6) {
            ZStack {
                if isSelected {
                    Circle()
                        .strokeBorder(style: StrokeStyle(lineWidth: 2, dash: [6, 5]))
                        .foregroundStyle(accentColor)
                        .frame(width: 68, height: 68)
                        .rotationEffect(.degrees(dashRotation))
                        .matchedGeometryEffect(id: "selectionRing", in: namespace)
                        .onAppear {
                            withAnimation(.linear(duration: 6).repeatForever(autoreverses: false)) {
                                dashRotation = 360
                            }
                        }
                }

                Circle()
                    .stroke(accentColor, lineWidth: 2)
                    .background(Circle().fill(Color.auraSurface))
                    .frame(width: 58, height: 58)
                    .auraGlow(accentColor, radius: isSelected ? 10 : 5)

                WaveformGlyph(color: accentColor)
            }

            VStack(spacing: 1) {
                Text(node.displayName)
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(.white)
                if let category = asset?.category {
                    Text(category.label)
                        .font(.system(size: 9, weight: .bold))
                        .tracking(0.6)
                        .foregroundStyle(accentColor)
                }
            }
        }
        .animation(.spring(duration: 0.3), value: isSelected)
    }
}
