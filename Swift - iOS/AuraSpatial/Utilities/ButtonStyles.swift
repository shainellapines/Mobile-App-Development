//
//  ButtonStyles.swift
//  AuraSpatial
//
//  Custom ButtonStyles (SRS Section 3.6) matching the prototype's solid
//  violet pill buttons, plus a floating action button style for the
//  Canvas "+" control (the prototype uses a floating circular button,
//  not a toolbar item).
//

import SwiftUI

struct PrimaryAuraButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.system(.headline, design: .rounded).weight(.semibold))
            .frame(maxWidth: .infinity)
            .padding(.vertical, 16)
            .background(Color.auraViolet, in: Capsule())
            .foregroundStyle(.white)
            .scaleEffect(configuration.isPressed ? 0.97 : 1)
            .animation(.spring(duration: 0.2), value: configuration.isPressed)
    }
}

struct SecondaryAuraButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.system(.headline, design: .rounded).weight(.semibold))
            .frame(maxWidth: .infinity)
            .padding(.vertical, 16)
            .background(Color.white.opacity(0.06), in: Capsule())
            .foregroundStyle(.white)
            .overlay(Capsule().stroke(Color.white.opacity(0.18), lineWidth: 1))
            .scaleEffect(configuration.isPressed ? 0.97 : 1)
            .animation(.spring(duration: 0.2), value: configuration.isPressed)
    }
}

/// The circular, glowing "+" control the prototype floats over the Canvas -
/// replacing the plain toolbar button the first draft used.
struct FloatingActionButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.title2.weight(.semibold))
            .foregroundStyle(.white)
            .frame(width: 56, height: 56)
            .background(Color.auraViolet, in: Circle())
            .auraGlow(.auraViolet, radius: 14)
            .scaleEffect(configuration.isPressed ? 0.9 : 1)
            .animation(.spring(response: 0.3, dampingFraction: 0.6), value: configuration.isPressed)
    }
}

extension ButtonStyle where Self == PrimaryAuraButtonStyle {
    static var primaryAura: PrimaryAuraButtonStyle { PrimaryAuraButtonStyle() }
}

extension ButtonStyle where Self == SecondaryAuraButtonStyle {
    static var secondaryAura: SecondaryAuraButtonStyle { SecondaryAuraButtonStyle() }
}

extension ButtonStyle where Self == FloatingActionButtonStyle {
    static var floatingAura: FloatingActionButtonStyle { FloatingActionButtonStyle() }
}
