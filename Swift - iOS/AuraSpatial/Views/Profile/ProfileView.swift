//
//  ProfileView.swift
//  AuraSpatial
//
//  Accessible from Saved Layouts (SRS Section 5) - a minimal identity
//  surface for the midterm; the seat Firebase Auth's real user record
//  fills in the final build. Themed to match the app's dark surface system.
//

import SwiftUI

struct ProfileView: View {
    @Environment(AuthController.self) private var authController
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            ZStack {
                Color.auraBackground.ignoresSafeArea()

                VStack(spacing: 20) {
                    OrbitGlyph(size: 96)
                        .padding(.top, 24)

                    if let user = authController.currentUser {
                        VStack(spacing: 20) {
                            infoRow(label: "Username", value: user.username)
                            infoRow(label: "Email", value: user.email)
                            infoRow(label: "Joined", value: user.joinedAt.formatted(date: .abbreviated, time: .omitted))
                        }
                        .padding(20)
                        .background(Color.auraSurface, in: RoundedRectangle(cornerRadius: 18))
                        .padding(.horizontal, 20)
                    }

                    Spacer()

                    Button("Log Out") {
                        Task {
                            await authController.logOut()
                            dismiss()
                        }
                    }
                    .buttonStyle(.secondaryAura)
                    .padding(.horizontal, 20)
                    .padding(.bottom, 24)
                }
            }
            .navigationTitle("Profile")
            .toolbarBackground(Color.auraBackground, for: .navigationBar)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Close") { dismiss() }
                }
            }
        }
    }

    private func infoRow(label: String, value: String) -> some View {
        HStack {
            Text(label)
                .foregroundStyle(.auraTextSecondary)
            Spacer()
            Text(value)
                .foregroundStyle(.white)
                .fontWeight(.medium)
        }
        .font(.subheadline)
    }
}
