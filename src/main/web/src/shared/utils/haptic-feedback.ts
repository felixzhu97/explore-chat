export class HapticFeedback {
  static vibrate(pattern: number | number[] = 50) {
    if ("vibrate" in navigator) {
      navigator.vibrate(pattern)
    }
  }

  static light() {
    this.vibrate(50)
  }

  static medium() {
    this.vibrate(100)
  }

  static heavy() {
    this.vibrate([100, 50, 100])
  }

  static success() {
    this.vibrate([50, 50, 50])
  }

  static error() {
    this.vibrate([100, 100, 100, 100, 100])
  }

  static selection() {
    this.vibrate(25)
  }
}
