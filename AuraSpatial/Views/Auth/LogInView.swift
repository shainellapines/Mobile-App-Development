//
//  LogInView.swift
//  AuraSpatial
//
//  Screen 3 (SRS Section 5): returning-user entry into the simulated
//  session (FR-1.1).
//

import SwiftUI

struct LogInView: View {
    @Environment(AuthController.self) private var authController
    @State private var email = ""
    @State private var password = ""

    var body: some View {
        Form {
            Section("Welcome back") {
                TextField("Email", text: $email)
                    .textInputAutocapitalization(.never)
                    .keyboardType(.emailAddress)
                SecureField("Password", text: $password)
            }

            if let errorMessage = authController.errorMessage {
                Text(errorMessage)
                    .foregroundStyle(.red)
                    .font(.footnote)
            }

            Button("Log In") {
                Task {
                    await authController.logIn(email: email, password: password)
                }
            }
            .buttonStyle(.primaryAura)
            .listRowInsets(EdgeInsets())
            .padding()
        }
        .navigationTitle("Log In")
    }
}
