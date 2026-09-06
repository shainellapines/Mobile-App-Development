//
//  AuthController.swift
//  AuraSpatial
//
//  The Controller for auth state (SRS Section 3.4's MVC adaptation): owns
//  the session and exposes it to every View via the environment. Uses the
//  Observation framework's @Observable (iOS 17+) rather than the older
//  ObservableObject/@Published pattern.
//

import Foundation
import Observation

@Observable
final class AuthController {
    private(set) var currentUser: UserProfile?
    var errorMessage: String?

    private let repository: AuthRepository

    var isSignedIn: Bool { currentUser != nil }

    init(repository: AuthRepository = LocalAuthStore()) {
        self.repository = repository
    }

    func restoreSession() async {
        currentUser = await repository.currentUser()
    }

    func signUp(username: String, email: String, password: String) async {
        do {
            errorMessage = nil
            currentUser = try await repository.signUp(username: username, email: email, password: password)
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func logIn(email: String, password: String) async {
        do {
            errorMessage = nil
            currentUser = try await repository.logIn(email: email, password: password)
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func logOut() async {
        await repository.logOut()
        currentUser = nil
    }
}
