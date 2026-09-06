//
//  SoundscapeRepository.swift
//  AuraSpatial
//
//  Abstracts where saved layouts live. LocalSoundscapeStore backs the
//  midterm; a FirebaseSoundscapeStore conforming to the same protocol is
//  the only change the final build needs (SRS Section 2.6, 4.2) - Views and
//  Controllers never talk to storage directly.
//

import Foundation

protocol SoundscapeRepository {
    func fetchAll() async throws -> [Soundscape]
    func save(_ soundscape: Soundscape) async throws
    func delete(id: UUID) async throws
}
