//
//  SoundLibraryView.swift
//  AuraSpatial
//
//  Screen 5 (SRS Section 5): the catalog nodes are added from (FR-2.3).
//  Rebuilt with dark themed rows and the same category-color + waveform
//  glyph treatment used on the Canvas, instead of a plain system List.
//

import SwiftUI

struct SoundLibraryView: View {
    @Environment(\.dismiss) private var dismiss
    let onSelect: (SoundAsset) -> Void

    var body: some View {
        NavigationStack {
            ZStack {
                Color.auraBackground.ignoresSafeArea()

                ScrollView {
                    VStack(spacing: 12) {
                        ForEach(SoundAsset.library) { asset in
                            Button {
                                onSelect(asset)
                                dismiss()
                            } label: {
                                HStack(spacing: 14) {
                                    ZStack {
                                        Circle()
                                            .fill(asset.category.accentColor.opacity(0.18))
                                            .frame(width: 44, height: 44)
                                        WaveformGlyph(color: asset.category.accentColor)
                                    }

                                    VStack(alignment: .leading, spacing: 2) {
                                        Text(asset.name)
                                            .font(.subheadline.weight(.semibold))
                                            .foregroundStyle(.white)
                                        Text(asset.category.label)
                                            .font(.system(size: 10, weight: .bold))
                                            .tracking(0.5)
                                            .foregroundStyle(asset.category.accentColor)
                                    }

                                    Spacer()

                                    Image(systemName: "plus.circle.fill")
                                        .foregroundStyle(.auraViolet)
                                        .font(.title3)
                                }
                                .padding(14)
                                .background(Color.auraSurface, in: RoundedRectangle(cornerRadius: 16))
                            }
                            .buttonStyle(.plain)
                        }
                    }
                    .padding(20)
                }
            }
            .navigationTitle("Sound Library")
            .toolbarBackground(Color.auraBackground, for: .navigationBar)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Close") { dismiss() }
                }
            }
        }
    }
}
