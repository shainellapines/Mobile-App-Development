//
//  CommunityController.swift
//  AuraSpatial
//
//  The Controller for the Community Feed (SRS Section 3.4): browse and
//  preview-play bundled sample soundscapes (FR-5.1); Fork is delegated to
//  SavedLayoutsController from the View layer.
//

import Foundation
import Observation

@Observable
final class CommunityController {
    private(set) var feed: [Soundscape] = []
    /// The soundscape currently previewing, if any - only one plays at a time.
    var playingID: UUID?

    private let repository: CommunityRepository

    init(repository: CommunityRepository = LocalCommunityStore()) {
        self.repository = repository
    }

    func refresh() async {
        feed = (try? await repository.fetchFeed()) ?? []
    }

    func togglePlay(_ id: UUID) {
        playingID = (playingID == id) ? nil : id
    }

    func isPlaying(_ id: UUID) -> Bool {
        playingID == id
    }
}
