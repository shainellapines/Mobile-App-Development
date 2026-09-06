//
//  AuthRepository.swift
//  AuraSpatial
//
//  Abstracts sign-up / log-in. LocalAuthStore simulates a session for the
//  midterm (FR-1.1); a Firebase-Auth-backed implementation is planned for
//  the final build (FR-1.2) behind this same protocol.
//

import Foundation

protocol AuthRepository {
    func currentUser() async -> UserProfile?
    func signUp(username: String, email: String, password: String) async throws -> UserProfile
    func logIn(email: String, password: String) async throws -> UserProfile
    func logOut() async
}

enum AuthError: LocalizedError {
    case invalidCredentials
    case missingFields

    var errorDescription: String? {
        switch self {
        case .invalidCredentials: "Incorrect email or password."
        case .missingFields: "Please fill in all fields."
        }
    }
}
