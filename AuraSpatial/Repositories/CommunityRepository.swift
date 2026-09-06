//
//  CommunityRepository.swift
//  AuraSpatial
//
//  Abstracts the Community Feed's data source. LocalCommunityStore returns
//  bundled sample soundscapes for the midterm (FR-5.1); the final build
//  reads a live, shared Firestore collection instead (FR-5.3).
//

import Foundation

protocol CommunityRepository {
    func fetchFeed() async throws -> [Soundscape]
}
