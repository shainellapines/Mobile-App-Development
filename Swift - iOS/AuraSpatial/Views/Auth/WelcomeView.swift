//
//  WelcomeView.swift
//  AuraSpatial
//
//  Screen 1 (SRS Section 5): entry point, routes to Sign Up or Log In.
//

import SwiftUI

struct WelcomeView: View {
    var body: some View {
        VStack(spacing: 32) {
            Spacer()

            VStack(spacing: 8) {
                Image(systemName: "waveform.circle.fill")
                    .font(.system(size: 72))
                    .foregroundStyle(.teal)
                Text("AuraSpatial")
                    .font(.system(.largeTitle, design: .rounded))
                    .fontWeight(.bold)
                Text("Architect your own spatial soundscape")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }

            Spacer()

            VStack(spacing: 12) {
                NavigationLink("Log In") {
                    LogInView()
                }
                .buttonStyle(.primaryAura)

                NavigationLink("Sign Up") {
                    SignUpView()
                }
                .buttonStyle(.secondaryAura)
            }
            .padding(.horizontal, 32)
            .padding(.bottom, 48)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(.black.gradient)
    }
}

#Preview {
    NavigationStack {
        WelcomeView()
    }
    .environment(AuthController())
}
