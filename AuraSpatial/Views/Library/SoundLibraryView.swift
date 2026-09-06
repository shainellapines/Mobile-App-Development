//
//  SoundLibraryView.swift
//  AuraSpatial
//
//  Screen 5 (SRS Section 5): the catalog nodes are added from (FR-2.3).
//

import SwiftUI

struct SoundLibraryView: View {
    @Environment(\.dismiss) private var dismiss
    let onSelect: (SoundAsset) -> Void

    var body: some View {
        NavigationStack {
            List(SoundAsset.library) { asset in
                Button {
                    onSelect(asset)
                    dismiss()
                } label: {
                    HStack(spacing: 16) {
                        Image(systemName: asset.systemImageName)
                            .font(.title3)
                            .frame(width: 32)
                            .foregroundStyle(.teal)
                        Text(asset.name)
                        Spacer()
                        Image(systemName: "plus.circle.fill")
                            .foregroundStyle(.teal)
                    }
                }
                .buttonStyle(.plain)
            }
            .navigationTitle("Sound Library")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Close") { dismiss() }
                }
            }
        }
    }
}
