//
//  AuraLabeledField.swift
//  AuraSpatial
//
//  The custom dark, rounded field with an uppercase caption label used on
//  Log In and Sign Up in the real prototype — replacing the plain system
//  `Form` the first draft of this code used, which didn't match it at all.
//

import SwiftUI
import UIKit

struct AuraLabeledField: View {
    let label: String
    let placeholder: String
    @Binding var text: String
    var isSecure: Bool = false
    var keyboardType: UIKeyboardType = .default

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(label.uppercased())
                .font(.caption2.weight(.semibold))
                .tracking(0.8)
                .foregroundStyle(.auraTextSecondary)

            Group {
                if isSecure {
                    SecureField(placeholder, text: $text)
                } else {
                    TextField(placeholder, text: $text)
                }
            }
            .textInputAutocapitalization(.never)
            .keyboardType(keyboardType)
            .foregroundStyle(.white)
            .padding(.horizontal, 16)
            .padding(.vertical, 14)
            .background(Color.auraSurface, in: RoundedRectangle(cornerRadius: 14))
        }
    }
}
