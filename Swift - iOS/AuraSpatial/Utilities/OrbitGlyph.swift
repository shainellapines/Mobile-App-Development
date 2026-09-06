//
//  OrbitGlyph.swift
//  AuraSpatial
//
//  The app's recurring "orbit" brand mark — concentric rings with a bright
//  center dot and smaller satellite dots — seen on the Welcome screen and
//  as each Saved Layout's thumbnail in the prototype. One reusable view so
//  both places stay visually identical.
//

import SwiftUI

struct OrbitGlyph: View {
    var size: CGFloat = 44
    var centerColor: Color = .auraViolet
    var satelliteColors: [Color] = [.auraTeal, .auraViolet, .auraTeal]

    var body: some View {
        ZStack {
            Circle()
                .stroke(Color.white.opacity(0.12), lineWidth: 1)
                .frame(width: size * 0.85, height: size * 0.85)
            Circle()
                .stroke(Color.white.opacity(0.08), lineWidth: 1)
                .frame(width: size * 0.55, height: size * 0.55)

            ForEach(Array(satelliteColors.enumerated()), id: \.offset) { index, color in
                let angle = Angle.degrees(Double(index) / Double(satelliteColors.count) * 360 + 20)
                Circle()
                    .fill(color)
                    .frame(width: size * 0.11, height: size * 0.11)
                    .offset(x: cos(angle.radians) * size * 0.42, y: sin(angle.radians) * size * 0.42)
            }

            Circle()
                .fill(centerColor)
                .frame(width: size * 0.22, height: size * 0.22)
                .auraGlow(centerColor, radius: size * 0.25)
        }
        .frame(width: size, height: size)
    }
}

#Preview {
    OrbitGlyph(size: 90)
        .padding(40)
        .background(Color.auraBackground)
}
