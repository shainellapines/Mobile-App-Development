//
//  UserProfile.swift
//  AuraSpatial
//
//  The signed-in (simulated, for the midterm) user (FR-1.1). Mirrors the
//  shape the final build's Firebase Auth / Firestore user record will take
//  (see the SRS, Section 4.2).
//

import Foundation

struct UserProfile: Identifiable, Codable, Hashable {
    let id: UUID
    var username: String
    var email: String
    var joinedAt: Date

    init(id: UUID = UUID(), username: String, email: String, joinedAt: Date = Date()) {
        self.id = id
        self.username = username
        self.email = email
        self.joinedAt = joinedAt
    }
}
