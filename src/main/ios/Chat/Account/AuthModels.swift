import Foundation

struct LoginBody: Encodable {
  let email: String
  let password: String
}

struct RegisterBody: Encodable {
  let email: String
  let password: String
  let username: String
  let phone: String?
}
