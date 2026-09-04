# Guideline

## Introduce

ExploreChat brings social connection into everyday life. Use it so people can share Posts, browse Feed and Reels, discover others in Explore, message in Chat, and place Calls—simply and beautifully.

A social messaging product defines how people publish content, discover others, stay in conversation, and stay safe. Prefer one Nest API boundary, durable Preferred Terms, and real-time delivery that complements persisted history. This guideline describes how to design those experiences so people stay in control and integrations stay interoperable.

## Best practices

**Keep Nest as the only client-facing API.**

Web, Mobile, and Admin obtain Feed, Chat, Call, Media, and AI capabilities through Nest `/api/v1` (REST, GraphQL, Socket.IO). Never call media-gen, vision, recommendation, RAG, or Explore AI from the client. Upstream credentials stay on the server.

**Keep people in control of conversation and publishing state.**

Prefer visible actions—send, retry, hang up, leave Group, open Notification—over silent automation. When generation assists creation, let people dismiss, retry, or edit before publish or send.

**Protect private conversations by default.**

Message history, Call state, and personal Media stay inside authorized sessions. Ask only for camera, microphone, and files a feature needs.

**Persist history; treat live delivery as complementary.**

Socket.IO improves presence and latency. Nest Chat and Message storage remain the source of truth after reconnect—reconcile streamed events with durable reads so gaps do not look like silent data loss.

**Separate Call signaling from media.**

Nest handles invite, ring, accept, and hangup. WebRTC carries audio and video. Give distinct feedback when signaling succeeds but media fails.

**Offer generative features only where they provide clear value.**

When optional AI side services are unavailable, Feed, Chat, and Calls must still work.

**Use Preferred Terms consistently.**

Feed, Post, Chat, Message, Call, Notification, and related terms come from the Glossary. Avoid synonyms that split the ubiquitous language across UI and APIs.

## Auth and User

### User

**Treat User as the long-lived principal.** Display names and avatars may change. Follow, Chat membership, and Call participants hang off a stable, disableable User. Sessions expire; the account remains auditable.

### JWT

**Authenticate with short-lived JWTs on HTTPS.** Prefer Bearer tokens ([RFC 6750](https://datatracker.ietf.org/doc/html/rfc6750)). Do not put access tokens in query strings. Validate `iss`, `aud`, `exp`, and algorithms carefully ([RFC 7519](https://datatracker.ietf.org/doc/html/rfc7519), [RFC 8725](https://datatracker.ietf.org/doc/html/rfc8725)). Refresh and logout should rotate or invalidate access deliberately. For guidance, see [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html).

### Follow

**Model Follow as an explicit social edge.** Follower and following lists reconcile with Nest. They are authorization-relevant relationships, not cosmetic UI state. Graph embedding work such as [DeepWalk](https://arxiv.org/abs/1403.6652) frames how social edges support discovery beyond hand-tuned rules. Large products often serve the social graph from a dedicated store (for example Meta’s [TAO](https://www.usenix.org/conference/atc13/technical-sessions/presentation/bronson)).

## Feed and discovery

### Post

**Treat Post as the durable shareable unit.** Text, `mediaUrls`, and Cover URL belong to the Post. A Feed Entry references a Post—do not invent a parallel client-only card model.

### Feed

**Present Feed as the home timeline.** People encounter Posts through GraphQL `feed` or REST feed. Ranking and caching may change order; the timeline must remain coherent and refreshable. Classical collaborative filtering and factorization ([Item-based Collaborative Filtering](https://dl.acm.org/doi/10.1145/371920.372071), [Matrix Factorization Techniques for Recommender Systems](https://dl.acm.org/doi/10.1109/MC.2009.263)) underpin later deep models. Industrial ranking lineages include [Deep Neural Networks for YouTube Recommendations](https://research.google/pubs/pub45530/) and [Wide & Deep Learning for Recommender Systems](https://arxiv.org/abs/1606.07792). See also [GraphQL](https://graphql.org/learn/).

### Reels

**Keep Reels as continuous short video.** GraphQL `reels` optimizes vertical watch. Do not collapse Reels into Explore or Feed. Session and sequential recommenders such as [GRU4Rec](https://arxiv.org/abs/1511.06939) and [SASRec](https://arxiv.org/abs/1808.09781) inform how recent watch history drives the next candidate set.

### Explore

**Keep Explore as discovery.** The Explore grid is for browsing and finding content beyond the home Feed. Classic two-stage systems separate candidate generation from ranking ([YouTube DNN](https://research.google/pubs/pub45530/)); large-scale nearest-neighbor retrieval ([FAISS](https://arxiv.org/abs/1702.08734)) often backs the first stage. Keep Explore’s job distinct from Feed personalization.

### Status

**Treat Status as 24-hour ephemeral content.** Do not mix Status lifetime rules with durable Posts.

### Engagement

**Make Engagement explicit.** Likes, saves, Comments, and Follow reconcile with Nest. Optimistic UI is presentation, not source of truth. Engagement labels are the supervision signal behind industrial recommenders ([YouTube DNN](https://research.google/pubs/pub45530/), [Wide & Deep](https://arxiv.org/abs/1606.07792), [DLRM](https://arxiv.org/abs/1906.00091)).

### Media

**Upload Media through Nest before attach.** Create-post and Chat attachments use Nest Media. Show progress and failure for large files. Vision runs through Nest—fail closed on unsafe uploads; recommendation may degrade, safety must not. Multimodal encoders such as [CLIP](https://arxiv.org/abs/2103.00020) illustrate how vision models ground moderation and tagging pipelines.

### Search

**Search with documented scopes.** Nest Search `type` values are `posts`, `users`, and `hashtags`. UI “all” is client aggregation only—do not send it as an API type. Learned retrieval models such as [DSSM](https://www.microsoft.com/en-us/research/publication/learning-deep-structured-semantic-models-for-web-search-using-clickthrough-data/) show how queries and documents share an embedding space.

### Primary Destination

**Keep Primary Destinations obvious.** Cross-client navigation identities are `feed`, `chat`, `reels`, `explore`, `user`, and `search`; path and tab mapping may differ per client.

## Messaging

### Chat

**Treat Chat as the conversation container.** Conversation lists must survive reconnects and remain the entry point to Message history. Industry write-path patterns for huge chat stores are summarized in pieces such as [How Discord Stores Billions of Messages](https://discord.com/blog/how-discord-stores-billions-of-messages).

### Message

**Persist Messages; deliver live updates on Socket.IO.** Empty bodies do not render as bubbles. After reconnect, reconcile streamed events with Nest Message history. Transport sits on [WebSocket (RFC 6455)](https://datatracker.ietf.org/doc/html/rfc6455); ExploreChat uses [Socket.IO](https://socket.io/docs/v4/) for Message, presence, and Notification signals.

### Group

**Treat Group membership as the authorization boundary.** Only members send and receive group Messages. Removal must stop further delivery.

### Notification

**Surface actionable Notifications.** People should open the Notification drawer and know what changed—Message, Follow, Comment—without opaque badges alone. Prefer named events such as `notification:new`.

### Delivery

**Design for imperfect networks.** Avoid implying delivery that has not occurred. For industry delivery and presence models, see [XMPP Core (RFC 6120)](https://datatracker.ietf.org/doc/html/rfc6120), [XMPP IM (RFC 6121)](https://datatracker.ietf.org/doc/html/rfc6121), and [Matrix Client-Server API](https://spec.matrix.org/latest/client-server-api/). When end-to-end or group encryption is in scope, prefer reviewed designs such as [Signal Protocol](https://signal.org/docs/), the [Double Ratchet](https://signal.org/docs/specifications/doubleratchet/) formalized in [A Formal Security Analysis of the Signal Messaging Protocol](https://eprint.iacr.org/2016/1013), [Messaging Layer Security (RFC 9420)](https://datatracker.ietf.org/doc/html/rfc9420), and product whitepapers such as [WhatsApp Encryption Overview](https://www.whatsapp.com/security/WhatsApp-Security-Whitepaper.pdf).

## Calls

### Signaling

**Signal Calls on Nest.** Invite, ring, accept, reject, and hangup use Call APIs and the gateway. A Call that rings but never establishes media is different from a declined invite.

### WebRTC

**Carry Call media with WebRTC.** Audio and video use the IM/RTC client path ([WebRTC Overview RFC 8825](https://datatracker.ietf.org/doc/html/rfc8825), [JSEP RFC 8829](https://datatracker.ietf.org/doc/html/rfc8829), [SDP RFC 8866](https://datatracker.ietf.org/doc/html/rfc8866); [MDN WebRTC API](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)). Prefer specific status over a single unresolved “Connecting…”. For scale beyond 1:1, industry voice stacks often use SFU topologies (for example [How Discord Handles Two and Half Million Concurrent Voice Users](https://discord.com/blog/how-discord-handles-two-and-half-million-concurrent-voice-users-using-webrtc)).

## Generative assistance

**Keep generative features and Explore AI behind Nest.** Image, video, voice, and AI Chat may assist creation; they remain optional. Disclose assisted content, and keep Feed, Chat, and Calls usable when those services are down. Shared foundations include Transformers ([Attention Is All You Need](https://arxiv.org/abs/1706.03762)), [Retrieval-Augmented Generation](https://arxiv.org/abs/2005.11401), and [Latent Diffusion Models](https://arxiv.org/abs/2112.10752).

## Related

[Bearer Token (RFC 6750)](https://datatracker.ietf.org/doc/html/rfc6750)

[JWT (RFC 7519)](https://datatracker.ietf.org/doc/html/rfc7519)

[JWT BCP (RFC 8725)](https://datatracker.ietf.org/doc/html/rfc8725)

[WebSocket Protocol (RFC 6455)](https://datatracker.ietf.org/doc/html/rfc6455)

[Socket.IO](https://socket.io/docs/v4/)

[GraphQL](https://graphql.org/learn/)

[WebRTC Overview (RFC 8825)](https://datatracker.ietf.org/doc/html/rfc8825)

[JSEP (RFC 8829)](https://datatracker.ietf.org/doc/html/rfc8829)

[SDP (RFC 8866)](https://datatracker.ietf.org/doc/html/rfc8866)

[MDN WebRTC API](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)

[XMPP Core (RFC 6120)](https://datatracker.ietf.org/doc/html/rfc6120)

[XMPP IM (RFC 6121)](https://datatracker.ietf.org/doc/html/rfc6121)

[Matrix Client-Server API](https://spec.matrix.org/latest/client-server-api/)

[Messaging Layer Security (RFC 9420)](https://datatracker.ietf.org/doc/html/rfc9420)

[Signal Protocol](https://signal.org/docs/)

[Double Ratchet](https://signal.org/docs/specifications/doubleratchet/)

[WhatsApp Encryption Overview](https://www.whatsapp.com/security/WhatsApp-Security-Whitepaper.pdf)

[OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)

[TAO (Facebook social graph)](https://www.usenix.org/conference/atc13/technical-sessions/presentation/bronson)

[Item-based Collaborative Filtering](https://dl.acm.org/doi/10.1145/371920.372071)

[Matrix Factorization Techniques for Recommender Systems](https://dl.acm.org/doi/10.1109/MC.2009.263)

[Deep Neural Networks for YouTube Recommendations](https://research.google/pubs/pub45530/)

[Wide & Deep Learning for Recommender Systems](https://arxiv.org/abs/1606.07792)

[DLRM](https://arxiv.org/abs/1906.00091)

[GRU4Rec](https://arxiv.org/abs/1511.06939)

[SASRec](https://arxiv.org/abs/1808.09781)

[DeepWalk](https://arxiv.org/abs/1403.6652)

[FAISS](https://arxiv.org/abs/1702.08734)

[DSSM](https://www.microsoft.com/en-us/research/publication/learning-deep-structured-semantic-models-for-web-search-using-clickthrough-data/)

[CLIP](https://arxiv.org/abs/2103.00020)

[A Formal Security Analysis of the Signal Messaging Protocol](https://eprint.iacr.org/2016/1013)

[How Discord Stores Billions of Messages](https://discord.com/blog/how-discord-stores-billions-of-messages)

[How Discord Handles Concurrent Voice Users](https://discord.com/blog/how-discord-handles-two-and-half-million-concurrent-voice-users-using-webrtc)

[Attention Is All You Need](https://arxiv.org/abs/1706.03762)

[Retrieval-Augmented Generation](https://arxiv.org/abs/2005.11401)

[Latent Diffusion Models](https://arxiv.org/abs/2112.10752)

## Developer documentation

[Glossary](Glossary.md)

[NestJS](https://docs.nestjs.com/)

[Next.js](https://nextjs.org/docs)

[Expo](https://docs.expo.dev/)

[Socket.IO](https://socket.io/docs/v4/)

[WebRTC](https://webrtc.org/)
