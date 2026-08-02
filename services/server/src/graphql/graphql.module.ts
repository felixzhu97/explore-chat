import { Module } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { PostModule } from "@/post/presentation/post.module";
import { AuthModule } from "@/auth/presentation/auth.module";
import { FeedResolver, FeedEntryResolver } from "./feed.resolver";
import { PostLoader } from "./post.loader";

@Module({
  imports: [
    PostModule,
    AuthModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      path: "/api/v1/graphql",
      autoSchemaFile: true,
      sortSchema: true,
      context: ({ req, res }: { req: unknown; res: unknown }) => ({ req, res }),
    }),
  ],
  providers: [FeedResolver, FeedEntryResolver, PostLoader],
})
export class GraphqlModule {}
