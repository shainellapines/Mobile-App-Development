//
//  AuraSpatialApp.swift
//  AuraSpatial
//
//  App entry point. Injects the AuthController (the session Controller) into
//  the environment and attempts to restore a previously simulated session
//  (FR-1.1, FR-1.3).
//

import SwiftUI

@main
struct AuraSpatialApp: App {
    @State private var authController = AuthController()

    var body: some Scene {
        WindowGroup {
            RootView()
                .environment(authController)
                .preferredColorScheme(.dark)
                .task {
                    await authController.restoreSession()
                }
        }
    }
}
