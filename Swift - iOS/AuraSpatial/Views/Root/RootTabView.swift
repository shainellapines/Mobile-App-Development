//
//  RootTabView.swift
//  AuraSpatial
//
//  The post-login shell: Canvas . Community . Saved Layouts (SRS Section 5).
//  Owns and injects the three screen Controllers so sibling tabs can share
//  state (e.g. Saved Layouts reading the Canvas's current nodes to overwrite).
//

import SwiftUI

struct RootTabView: View {
    @State private var canvasController = CanvasController()
    @State private var communityController = CommunityController()
    @State private var savedLayoutsController = SavedLayoutsController()

    var body: some View {
        TabView {
            CanvasView()
                .tabItem { Label("Canvas", systemImage: "waveform") }

            CommunityFeedView()
                .tabItem { Label("Community", systemImage: "person.2.fill") }

            SavedLayoutsView()
                .tabItem { Label("Saved", systemImage: "square.grid.2x2.fill") }
        }
        .environment(canvasController)
        .environment(communityController)
        .environment(savedLayoutsController)
        .task {
            await savedLayoutsController.refresh()
            await communityController.refresh()
        }
    }
}
