//
//  CanvasView.swift
//  AuraSpatial
//
//  Screen 4 (SRS Section 5): the Spatial Canvas - the core Place -> Position
//  loop. Rebuilt to match the prototype's two-step interaction: tapping a
//  node selects it (dashed ring + a "Mix · <name>" bar appears), and
//  tapping that bar opens the Mixer sheet - rather than one tap jumping
//  straight to the Mixer. Also replaces the old toolbar "+" with the
//  prototype's floating, glowing add button.
//
//  Demonstrates PhaseAnimator, matchedGeometryEffect, drag gestures, and
//  .sensoryFeedback haptics beyond what the course materials covered
//  (SRS Section 3.6).
//

import SwiftUI

struct CanvasView: View {
    @Environment(CanvasController.self) private var canvasController
    @Namespace private var canvasNamespace
    @State private var showingSoundLibrary = false
    @State private var showingMixerForNodeID: UUID?

    var body: some View {
        NavigationStack {
            GeometryReader { proxy in
                ZStack {
                    Color.auraBackground.ignoresSafeArea()

                    OrbitRingGuides()
                        .position(x: proxy.size.width / 2, y: proxy.size.height / 2)

                    ListenerAvatarView()
                        .position(x: proxy.size.width / 2, y: proxy.size.height / 2)

                    ForEach(canvasController.nodes) { node in
                        SoundNodeView(
                            node: node,
                            isSelected: canvasController.selectedNodeID == node.id,
                            namespace: canvasNamespace
                        )
                        .position(
                            x: proxy.size.width / 2 + node.x * proxy.size.width / 2.4,
                            y: proxy.size.height / 2 + node.y * proxy.size.height / 2.4
                        )
                        .gesture(
                            DragGesture()
                                .onChanged { value in
                                    if canvasController.selectedNodeID != node.id {
                                        withAnimation(.spring(duration: 0.3)) {
                                            canvasController.selectedNodeID = node.id
                                        }
                                    }
                                    canvasController.moveNode(
                                        id: node.id,
                                        to: value.translation,
                                        canvasSize: proxy.size
                                    )
                                }
                        )
                        .onTapGesture {
                            withAnimation(.spring(duration: 0.3)) {
                                canvasController.selectedNodeID = node.id
                            }
                        }
                    }

                    VStack {
                        Spacer()
                        HStack(spacing: 12) {
                            if let selected = canvasController.node(with: canvasController.selectedNodeID) {
                                Button {
                                    showingMixerForNodeID = selected.id
                                } label: {
                                    HStack(spacing: 8) {
                                        Image(systemName: "slider.horizontal.3")
                                        Text("Mix · \(selected.displayName)")
                                            .font(.subheadline.weight(.semibold))
                                    }
                                }
                                .buttonStyle(.primaryAura)
                                .fixedSize(horizontal: true, vertical: false)
                                .transition(.move(edge: .leading).combined(with: .opacity))
                            }

                            Spacer()

                            Button {
                                showingSoundLibrary = true
                            } label: {
                                Image(systemName: "plus")
                            }
                            .buttonStyle(.floatingAura)
                            .disabled(!canvasController.canAddNode)
                            .opacity(canvasController.canAddNode ? 1 : 0.4)
                        }
                        .padding(.horizontal, 20)
                        .padding(.bottom, 20)
                    }
                    .animation(.spring(duration: 0.3), value: canvasController.selectedNodeID)
                }
            }
            .sensoryFeedback(.selection, trigger: canvasController.selectedNodeID)
            .navigationTitle("Canvas")
            .toolbarBackground(Color.auraBackground, for: .navigationBar)
            .sheet(isPresented: $showingSoundLibrary) {
                SoundLibraryView { asset in
                    canvasController.addNode(from: asset)
                }
                .presentationDetents([.medium, .large])
                .presentationDragIndicator(.visible)
            }
            .sheet(item: Binding(
                get: { canvasController.node(with: showingMixerForNodeID) },
                set: { showingMixerForNodeID = $0?.id }
            )) { node in
                MixerView(node: node)
                    .presentationDetents([.medium])
                    .presentationDragIndicator(.visible)
            }
        }
    }
}

/// Faint concentric orbit-guide rings behind the listener and nodes,
/// matching the prototype's background treatment.
private struct OrbitRingGuides: View {
    var body: some View {
        ZStack {
            ForEach([1.0, 1.4, 1.8], id: \.self) { scale in
                Circle()
                    .stroke(Color.white.opacity(0.06), lineWidth: 1)
                    .frame(width: 160 * scale, height: 160 * scale)
            }
        }
    }
}

/// The fixed listener icon at canvas center, with a slow ambient pulse built
/// with PhaseAnimator (SRS Section 3.6) rather than a manually-timed animation.
private struct ListenerAvatarView: View {
    var body: some View {
        PhaseAnimator([false, true]) { expanded in
            ZStack {
                Circle()
                    .fill(Color.auraViolet.opacity(0.25))
                    .frame(width: expanded ? 110 : 80, height: expanded ? 110 : 80)
                    .blur(radius: 8)
                Circle()
                    .fill(Color.auraViolet)
                    .frame(width: 56, height: 56)
                    .auraGlow(.auraViolet, radius: 18)
                Image(systemName: "person.fill")
                    .font(.title3)
                    .foregroundStyle(.white)
            }
        } animation: { _ in
            .easeInOut(duration: 1.8)
        }
    }
}
