//
//  LocalAuthStore.swift
//  AuraSpatial
//
//  Midterm implementation of AuthRepository: no server calls - a "session"
//  is a UserProfile mirrored to UserDefaults (FR-1.1, FR-1.3).
//

import Foundation

final class LocalAuthStore: AuthRepository {
    private let defaults: UserDefaults
    private let sessionKey = "auraspatial.session.user"

    init(defaults: UserDefaults = .standard) {
        self.defaults = defaults
    }

    func currentUser() async -> UserProfile? {
        guard let data = defaults.data(forKey: sessionKey) else { return nil }
        return try? JSONDecoder.auraSpatial.decode(UserProfile.self, from: data)
    }

    func signUp(username: String, email: String, password: String) async throws -> UserProfile {
        guard !username.isEmpty, !email.isEmpty, !password.isEmpty else {
            throw AuthError.missingFields
        }
        let profile = UserProfile(username: username, email: email)
        try persist(profile)
        return profile
    }

    func logIn(email: String, password: String) async throws -> UserProfile {
        guard !email.isEmpty, !password.isEmpty else {
            throw AuthError.missingFields
        }
        // Midterm: any non-empty credential pair succeeds - there is no
        // server to validate against yet. The final build gates this
        // through Firebase Auth instead (FR-1.2).
        let username = String(email.split(separator: "@").first ?? "listener")
        let profile = UserProfile(username: username, email: email)
        try persist(profile)
        return profile
    }

    func logOut() async {
        defaults.removeObject(forKey: sessionKey)
    }

    private func persist(_ profile: UserProfile) throws {
        let data = try JSONEncoder.auraSpatial.encode(profile)
        defaults.set(data, forKey: sessionKey)
    }
}
