//
//  RootView.swift
//  AuraSpatial
//
//  Routes between the auth flow and the main tab shell based on the
//  simulated session (FR-1.1, FR-1.3) - the NavigationStack-gates-TabView
//  structure described in Section 5 of the SRS.
//

import SwiftUI

struct RootView: View {
    @Environment(AuthController.self) private var authController

    var body: some View {
        Group {
            if authController.isSignedIn {
                RootTabView()
                    .transition(.opacity)
            } else {
                NavigationStack {
                    WelcomeView()
                }
                .transition(.opacity)
            }
        }
        .animation(.easeInOut, value: authController.isSignedIn)
    }
}
