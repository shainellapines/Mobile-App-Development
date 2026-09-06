//
//  ButtonStyles.swift
//  AuraSpatial
//
//  Custom ButtonStyles (SRS Section 3.6) used across the auth flow -
//  demonstrates the ButtonStyle protocol rather than relying only on the
//  system's built-in styles.
//

import SwiftUI

struct PrimaryAuraButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.headline)
            .frame(maxWidth: .infinity)
            .padding()
            .background(.teal)
            .foregroundStyle(.black)
            .clipShape(RoundedRectangle(cornerRadius: 14))
            .scaleEffect(configuration.isPressed ? 0.97 : 1)
            .animation(.spring(duration: 0.2), value: configuration.isPressed)
    }
}

struct SecondaryAuraButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.headline)
            .frame(maxWidth: .infinity)
            .padding()
            .background(.white.opacity(0.08))
            .foregroundStyle(.white)
            .clipShape(RoundedRectangle(cornerRadius: 14))
            .overlay(
                RoundedRectangle(cornerRadius: 14).stroke(.white.opacity(0.3), lineWidth: 1)
            )
            .scaleEffect(configuration.isPressed ? 0.97 : 1)
            .animation(.spring(duration: 0.2), value: configuration.isPressed)
    }
}

extension ButtonStyle where Self == PrimaryAuraButtonStyle {
    static var primaryAura: PrimaryAuraButtonStyle { PrimaryAuraButtonStyle() }
}

extension ButtonStyle where Self == SecondaryAuraButtonStyle {
    static var secondaryAura: SecondaryAuraButtonStyle { SecondaryAuraButtonStyle() }
}
