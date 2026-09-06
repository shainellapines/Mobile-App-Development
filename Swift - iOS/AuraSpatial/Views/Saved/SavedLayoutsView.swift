//
//  SavedLayoutsView.swift
//  AuraSpatial
//
//  Screen 7 (SRS Section 5): recall, overwrite, delete (FR-4.2). Rebuilt
//  with an OrbitGlyph thumbnail per row and the teal/red rounded-square
//  icon buttons the prototype uses, replacing the plain system List row.
//
//  Overwrite calls through SavedLayoutsController.overwrite(_:with:), which
//  persists via the repository and then refresh()es from it - so, unlike
//  the Figma prototype bug logged in the SRS's Appendix B, the updated
//  timestamp here is guaranteed to survive navigating away and back.
//

import SwiftUI

struct SavedLayoutsView: View {
    @Environment(SavedLayoutsController.self) private var savedLayoutsController
    @Environment(CanvasController.self) private var canvasController
    @State private var showingProfile = false

    private let relativeFormatter: RelativeDateTimeFormatter = {
        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .full
        return formatter
    }()

    var body: some View {
        NavigationStack {
            ZStack {
                Color.auraBackground.ignoresSafeArea()

                ScrollView {
                    VStack(spacing: 14) {
                        ForEach(savedLayoutsController.savedLayouts) { layout in
                            row(for: layout)
                        }
                    }
                    .padding(20)
                }
            }
            .navigationTitle("Saved Layouts")
            .toolbarBackground(Color.auraBackground, for: .navigationBar)
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Button {
                        showingProfile = true
                    } label: {
                        Image(systemName: "person.crop.circle")
                            .foregroundStyle(.white)
                    }
                }
            }
            .sheet(isPresented: $showingProfile) {
                ProfileView()
            }
            .task {
                await savedLayoutsController.refresh()
            }
        }
    }

    private func row(for layout: Soundscape) -> some View {
        Button {
            canvasController.loadLayout(layout)
        } label: {
            HStack(spacing: 14) {
                OrbitGlyph(size: 48)

                VStack(alignment: .leading, spacing: 4) {
                    Text(layout.name)
                        .font(.headline)
                        .foregroundStyle(.white)
                    Text(relativeFormatter.localizedString(for: layout.updatedAt, relativeTo: Date()))
                        .font(.caption)
                        .foregroundStyle(.auraTextSecondary)
                }

                Spacer()

                VStack(alignment: .trailing, spacing: 8) {
                    PillBadge(text: "\(layout.nodes.count) nodes", color: .auraViolet)
                    HStack(spacing: 8) {
                        IconSquareButton(systemImage: "arrow.triangle.2.circlepath", tint: .auraTeal) {
                            Task { await savedLayoutsController.overwrite(layout, with: canvasController.nodes) }
                        }
                        IconSquareButton(systemImage: "trash", tint: .auraDanger) {
                            Task { await savedLayoutsController.delete(layout) }
                        }
                    }
                }
            }
            .padding(16)
            .background(Color.auraSurface, in: RoundedRectangle(cornerRadius: 18))
        }
        .buttonStyle(.plain)
    }
}
