//
//  CommunityFeedView.swift
//  AuraSpatial
//
//  Screen 8 (SRS Section 5): browse, preview-play, and fork (FR-5.1, FR-5.2).
//

import SwiftUI

struct CommunityFeedView: View {
    @Environment(CommunityController.self) private var communityController
    @Environment(SavedLayoutsController.self) private var savedLayoutsController

    var body: some View {
        NavigationStack {
            ZStack {
                Color.auraBackground.ignoresSafeArea()

                ScrollView {
                    LazyVStack(spacing: 16) {
                        ForEach(communityController.feed) { soundscape in
                            CommunitySoundscapeCardView(
                                soundscape: soundscape,
                                isPlaying: communityController.isPlaying(soundscape.id),
                                onPlayToggle: { communityController.togglePlay(soundscape.id) },
                                onFork: {
                                    Task { await savedLayoutsController.fork(soundscape) }
                                }
                            )
                        }
                    }
                    .padding(20)
                }
            }
            .navigationTitle("Community")
            .toolbarBackground(Color.auraBackground, for: .navigationBar)
            .task {
                await communityController.refresh()
            }
        }
    }
}
