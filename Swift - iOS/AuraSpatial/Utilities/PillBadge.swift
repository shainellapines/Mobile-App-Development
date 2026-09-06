//
//  PillBadge.swift
//  AuraSpatial
//
//  A small colored capsule label — "4 nodes", a category name, etc. Used
//  across Canvas, Saved Layouts, and Community so every numeric/category
//  badge in the app looks identical.
//

import SwiftUI

struct PillBadge: View {
    let text: String
    var color: Color = .auraViolet
    var filled: Bool = true

    var body: some View {
        Text(text)
            .font(.caption.weight(.semibold))
            .foregroundStyle(filled ? .black.opacity(0.75) : color)
            .padding(.horizontal, 10)
            .padding(.vertical, 5)
            .background(
                Capsule().fill(filled ? color.opacity(0.85) : color.opacity(0.15))
            )
    }
}

/// A small rounded-square icon button — the teal "overwrite" and red
/// "delete" controls on Saved Layouts.
struct IconSquareButton: View {
    let systemImage: String
    var tint: Color
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Image(systemName: systemImage)
                .font(.subheadline.weight(.semibold))
                .foregroundStyle(tint)
                .frame(width: 34, height: 34)
                .background(tint.opacity(0.16), in: RoundedRectangle(cornerRadius: 10))
        }
        .buttonStyle(.plain)
    }
}
