//
//  LogInView.swift
//  AuraSpatial
//
//  Screen 3 (SRS Section 5): returning-user entry into the simulated
//  session (FR-1.1). Rebuilt with AuraLabeledField to match the
//  prototype's dark rounded fields with uppercase captions, replacing the
//  plain system Form the first draft used.
//

import SwiftUI

struct LogInView: View {
    @Environment(AuthController.self) private var authController
    @State private var email = ""
    @State private var password = ""

    var body: some View {
        ZStack {
            Color.auraBackground.ignoresSafeArea()

            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    AuraLabeledField(label: "Email", placeholder: "you@example.com", text: $email, keyboardType: .emailAddress)
                    AuraLabeledField(label: "Password", placeholder: "Your password", text: $password, isSecure: true)

                    if let errorMessage = authController.errorMessage {
                        Text(errorMessage)
                            .foregroundStyle(.auraDanger)
                            .font(.footnote)
                    }

                    Button("Log In") {
                        Task {
                            await authController.logIn(email: email, password: password)
                        }
                    }
                    .buttonStyle(.primaryAura)
                    .padding(.top, 8)

                    HStack {
                        Spacer()
                        Text("Don't have an account? ")
                            .foregroundStyle(.auraTextSecondary)
                        + Text("Sign Up").foregroundStyle(.auraViolet).fontWeight(.semibold)
                        Spacer()
                    }
                    .font(.subheadline)
                }
                .padding(24)
                .padding(.top, 24)
            }
        }
        .navigationTitle("Log In")
        .toolbarBackground(Color.auraBackground, for: .navigationBar)
    }
}
