//
//  SignUpView.swift
//  AuraSpatial
//
//  Screen 2 (SRS Section 5): account creation, gated by the simulated
//  local session (FR-1.1).
//

import SwiftUI

struct SignUpView: View {
    @Environment(AuthController.self) private var authController
    @State private var username = ""
    @State private var email = ""
    @State private var password = ""

    var body: some View {
        Form {
            Section("Create your account") {
                TextField("Username", text: $username)
                    .textInputAutocapitalization(.never)
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

            Button("Sign Up") {
                Task {
                    await authController.signUp(username: username, email: email, password: password)
                }
            }
            .buttonStyle(.primaryAura)
            .listRowInsets(EdgeInsets())
            .padding()
        }
        .navigationTitle("Sign Up")
    }
}
