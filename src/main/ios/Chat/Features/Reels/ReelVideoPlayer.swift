import AVFoundation
import SwiftUI

/// Full-bleed looping video surface (no system transport controls).
struct ReelVideoPlayer: UIViewRepresentable {
  let url: URL
  let isActive: Bool
  let isMuted: Bool

  func makeUIView(context: Context) -> PlayerContainerView {
    let view = PlayerContainerView()
    view.backgroundColor = .black
    view.configure(url: url)
    return view
  }

  func updateUIView(_ uiView: PlayerContainerView, context: Context) {
    uiView.configure(url: url)
    uiView.setMuted(isMuted)
    if isActive {
      uiView.play()
    } else {
      uiView.pauseAndReset()
    }
  }

  static func dismantleUIView(_ uiView: PlayerContainerView, coordinator: ()) {
    uiView.tearDown()
  }
}

final class PlayerContainerView: UIView {
  private let playerLayer = AVPlayerLayer()
  private var player: AVPlayer?
  private var endObserver: NSObjectProtocol?
  private var currentURL: URL?

  override init(frame: CGRect) {
    super.init(frame: frame)
    backgroundColor = .black
    playerLayer.videoGravity = .resizeAspectFill
    layer.addSublayer(playerLayer)
  }

  @available(*, unavailable)
  required init?(coder: NSCoder) { fatalError() }

  override func layoutSubviews() {
    super.layoutSubviews()
    playerLayer.frame = bounds
  }

  func configure(url: URL) {
    guard currentURL != url else { return }
    tearDown()
    currentURL = url
    let item = AVPlayerItem(url: url)
    let player = AVPlayer(playerItem: item)
    player.isMuted = true
    player.actionAtItemEnd = .none
    self.player = player
    playerLayer.player = player
    endObserver = NotificationCenter.default.addObserver(
      forName: .AVPlayerItemDidPlayToEndTime,
      object: item,
      queue: .main
    ) { [weak player] _ in
      player?.seek(to: .zero)
      player?.play()
    }
  }

  func setMuted(_ muted: Bool) {
    player?.isMuted = muted
  }

  func play() {
    player?.play()
  }

  func pauseAndReset() {
    player?.pause()
    player?.seek(to: .zero)
  }

  func tearDown() {
    if let endObserver {
      NotificationCenter.default.removeObserver(endObserver)
      self.endObserver = nil
    }
    player?.pause()
    playerLayer.player = nil
    player = nil
    currentURL = nil
  }

  deinit { tearDown() }
}
