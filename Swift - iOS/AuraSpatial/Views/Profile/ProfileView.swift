//
//  ProfileView.swift
//  AuraSpatial
//
//  Accessible from Saved Layouts (SRS Section 5) - a minimal identity
//  surface for the midterm; the seat Firebase Auth's real user record
//  fills in the final build.
//

import SwiftUI

struct ProfileView: View {
    @Environment(AuthController.self) private var authController
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            List {
                if let user = authController.currentUser {
                    Section("Account") {
                        LabeledContent("Username", value: user.username)
                        LabeledContent("Email", value: user.email)
                        LabeledContent("Joined", value: user.joinedAt.formatted(date: .abbreviated, time: .omitted))
                    }
                }

                Section {
                    Button("Log Out", role: .destructive) {
                        Task {
                            await authController.logOut()
                            dismiss()
                        }
                    }
                }
            }
            .navigationTitle("Profile")
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Close") { dismiss() }
                }
            }
        }
    }
}
