//
//  SavedLayoutsView.swift
//  AuraSpatial
//
//  Screen 7 (SRS Section 5): recall, overwrite, delete (FR-4.2). Overwrite
//  calls through SavedLayoutsController.overwrite(_:with:), which persists
//  via the repository and then refresh()es from it - so, unlike the Figma
//  prototype bug logged in the SRS's Appendix B, the updated timestamp here
//  is guaranteed to survive navigating away and back.
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
            List {
                ForEach(savedLayoutsController.savedLayouts) { layout in
                    Button {
                        canvasController.loadLayout(layout)
                    } label: {
                        row(for: layout)
                    }
                    .buttonStyle(.plain)
                }
            }
            .navigationTitle("Saved Layouts")
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Button {
                        showingProfile = true
                    } label: {
                        Image(systemName: "person.crop.circle")
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

    @ViewBuilder
    private func row(for layout: Soundscape) -> some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text(layout.name)
                    .font(.headline)
                Text(relativeFormatter.localizedString(for: layout.updatedAt, relativeTo: Date()))
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            Spacer()

            Text("\(layout.nodes.count) nodes")
                .font(.caption)
                .padding(.horizontal, 8)
                .padding(.vertical, 4)
                .background(.purple.opacity(0.2), in: Capsule())

            Button {
                Task {
                    await savedLayoutsController.overwrite(layout, with: canvasController.nodes)
                }
            } label: {
                Image(systemName: "arrow.triangle.2.circlepath")
            }
            .buttonStyle(.borderless)
            .tint(.teal)

            Button(role: .destructive) {
                Task {
                    await savedLayoutsController.delete(layout)
                }
            } label: {
                Image(systemName: "trash")
            }
            .buttonStyle(.borderless)
        }
    }
}
