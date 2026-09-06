import XCTest
@testable import Chat

final class RpcStatusTests: XCTestCase {
  func testShouldDecodeRpcStatusWhenUnauthorized() throws {
    let json = Data("""
    {"code":"UNAUTHENTICATED","message":"Please sign in","details":[]}
    """.utf8)
    let status = try JSONDecoder().decode(RpcStatus.self, from: json)
    XCTAssertEqual(status.code, "UNAUTHENTICATED")
    XCTAssertEqual(status.message, "Please sign in")
  }

  func testShouldMapFeedPostIdentityWhenPostIdPresent() throws {
    let json = Data("""
    {"postId":"p1","caption":"hello","userId":"u1","username":"alice","avatar":"https://example.com/a.png"}
    """.utf8)
    let post = try JSONDecoder().decode(FeedPost.self, from: json)
    XCTAssertEqual(post.id, "p1")
    XCTAssertEqual(post.caption, "hello")
    XCTAssertEqual(post.username, "alice")
    XCTAssertEqual(post.displayName, "alice")
  }

  func testShouldPreferUsernameOverUserIdPrefixForDisplayName() {
    XCTAssertEqual(DisplayName.user("judy", userId: "eab92ad3-86ed-4393-8f94-73dd018079a7"), "judy")
    XCTAssertEqual(DisplayName.user(nil, userId: "eab92ad3-86ed-4393-8f94-73dd018079a7"), "eab92ad3")
  }

  func testShouldBuildApiV1FromBaseURL() {
    let config = AppConfig(
      apiBaseURL: URL(string: "http://localhost:9001")!,
      socketURL: URL(string: "http://localhost:9002")!
    )
    XCTAssertEqual(config.apiV1.absoluteString, "http://localhost:9001/api/v1")
  }
}
