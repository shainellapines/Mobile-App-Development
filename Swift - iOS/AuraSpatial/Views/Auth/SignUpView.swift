//
//  SignUpView.swift
//  AuraSpatial
//
//  Screen 2 (SRS Section 5): account creation, gated by the simulated
//  local session (FR-1.1). Rebuilt with AuraLabeledField to match the
//  prototype's dark field styling.
//

import SwiftUI

struct SignUpView: View {
    @Environment(AuthController.self) private var authController
    @State private var username = ""
    @State private var email = ""
    @State private var password = ""

    var body: some View {
        ZStack {
            Color.auraBackground.ignoresSafeArea()

            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    AuraLabeledField(label: "Username", placeholder: "Your name", text: $username)
                    AuraLabeledField(label: "Email", placeholder: "you@example.com", text: $email, keyboardType: .emailAddress)
                    AuraLabeledField(label: "Password", placeholder: "Choose a password", text: $password, isSecure: true)

                    if let errorMessage = authController.errorMessage {
                        Text(errorMessage)
                            .foregroundStyle(.auraDanger)
                            .font(.footnote)
                    }

                    Button("Sign Up") {
                        Task {
                            await authController.signUp(username: username, email: email, password: password)
                        }
                    }
                    .buttonStyle(.primaryAura)
                    .padding(.top, 8)
                }
                .padding(24)
                .padding(.top, 24)
            }
        }
        .navigationTitle("Sign Up")
        .toolbarBackground(Color.auraBackground, for: .navigationBar)
    }
}
