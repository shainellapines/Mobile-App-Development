//
//  CanvasView.swift
//  AuraSpatial
//
//  Screen 4 (SRS Section 5): the Spatial Canvas - the core Place -> Position
//  loop. Demonstrates PhaseAnimator, drag gestures, and .sensoryFeedback
//  haptics beyond what the course materials covered (SRS Section 3.6).
//

import SwiftUI

struct CanvasView: View {
    @Environment(CanvasController.self) private var canvasController
    @State private var showingSoundLibrary = false
    @State private var showingMixerForNodeID: UUID?

    var body: some View {
        NavigationStack {
            GeometryReader { proxy in
                ZStack {
                    Color.black.ignoresSafeArea()

                    ListenerAvatarView()
                        .position(x: proxy.size.width / 2, y: proxy.size.height / 2)

                    ForEach(canvasController.nodes) { node in
                        SoundNodeView(node: node, isSelected: canvasController.selectedNodeID == node.id)
                            .position(
                                x: proxy.size.width / 2 + node.x * proxy.size.width / 2.4,
                                y: proxy.size.height / 2 + node.y * proxy.size.height / 2.4
                            )
                            .gesture(
                                DragGesture()
                                    .onChanged { value in
                                        canvasController.selectedNodeID = node.id
                                        canvasController.moveNode(
                                            id: node.id,
                                            to: value.translation,
                                            canvasSize: proxy.size
                                        )
                                    }
                            )
                            .onTapGesture {
                                canvasController.selectedNodeID = node.id
                                showingMixerForNodeID = node.id
                            }
                    }
                }
            }
            .sensoryFeedback(.selection, trigger: canvasController.selectedNodeID)
            .navigationTitle("Canvas")
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Button {
                        showingSoundLibrary = true
                    } label: {
                        Image(systemName: "plus.circle.fill")
                            .font(.title2)
                    }
                    .disabled(!canvasController.canAddNode)
                }
            }
            .sheet(isPresented: $showingSoundLibrary) {
                SoundLibraryView { asset in
                    canvasController.addNode(from: asset)
                }
                .presentationDetents([.medium, .large])
            }
            .sheet(item: Binding(
                get: { canvasController.node(with: showingMixerForNodeID) },
                set: { showingMixerForNodeID = $0?.id }
            )) { node in
                MixerView(node: node)
                    .presentationDetents([.medium])
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
                    .stroke(.teal.opacity(0.4), lineWidth: 2)
                    .frame(width: expanded ? 90 : 60, height: expanded ? 90 : 60)
                Circle()
                    .fill(.teal)
                    .frame(width: 24, height: 24)
                Image(systemName: "person.fill")
                    .font(.caption)
                    .foregroundStyle(.black)
            }
        } animation: { _ in
            .easeInOut(duration: 1.8)
        }
    }
}
