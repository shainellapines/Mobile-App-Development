//
//  SavedLayoutsController.swift
//  AuraSpatial
//
//  The Controller for Saved Layouts (SRS Section 3.4): save, recall,
//  overwrite, delete (FR-4.1, FR-4.2). Every mutation goes through
//  SoundscapeRepository and then re-fetches, so what the View displays is
//  always the actually-persisted state - never local-only render state.
//

import Foundation
import Observation

@Observable
final class SavedLayoutsController {
    private(set) var savedLayouts: [Soundscape] = []
    var errorMessage: String?

    private let repository: SoundscapeRepository

    init(repository: SoundscapeRepository = LocalSoundscapeStore()) {
        self.repository = repository
    }

    func refresh() async {
        do {
            savedLayouts = try await repository.fetchAll()
                .sorted { $0.updatedAt > $1.updatedAt }
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    /// Saves the Canvas's current nodes as a new named layout.
    func saveNewLayout(name: String, nodes: [SoundNode]) async {
        let soundscape = Soundscape(name: name, nodes: nodes)
        await persist(soundscape)
    }

    /// Overwrites an existing saved layout with the Canvas's current nodes.
    func overwrite(_ soundscape: Soundscape, with nodes: [SoundNode]) async {
        var updated = soundscape
        updated.nodes = nodes
        updated.updatedAt = Date()
        await persist(updated)
    }

    /// Adds a forked community soundscape to this user's own saved layouts
    /// (FR-5.2).
    func fork(_ communitySoundscape: Soundscape) async {
        await persist(communitySoundscape.forked())
    }

    func delete(_ soundscape: Soundscape) async {
        do {
            try await repository.delete(id: soundscape.id)
            await refresh()
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    private func persist(_ soundscape: Soundscape) async {
        do {
            try await repository.save(soundscape)
            await refresh()
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}
