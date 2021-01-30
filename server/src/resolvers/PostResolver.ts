import { Arg, Field, InputType, Mutation, Query, Resolver } from "type-graphql";
import { Post } from "../entities/Post";

@InputType()
class PostInput {
  @Field()
  title: string;
  @Field()
  text: string;
}

@Resolver(Post)
export class PostResolver {
  @Query(() => [Post])
  posts(): Promise<Post[]> {
    return Post.find({
      order: {
        updatedAt: "DESC",
      },
    });
  }

  @Query(() => Post, { nullable: true })
  post(@Arg("id") id: number): Promise<Post | undefined> {
    return Post.findOne(id);
  }

  @Mutation(() => Post)
  createPost(@Arg("input") input: PostInput): Promise<Post> {
    return Post.create({
      ...input,
    }).save();
  }

  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg("id") id: number,
    @Arg("title") title: string,
    @Arg("text") text: string
  ): Promise<Post | null> {
    let postToUpdate = await Post.findOne(id);
    if (postToUpdate) {
      const res = await Post.update({ id }, { title, text });
      console.log(res);
      return postToUpdate;
    } else {
      return null;
    }
  }

  @Mutation(() => Boolean)
  async deletePost(@Arg("id") id: number): Promise<boolean> {
    await Post.delete(id);
    return true;
  }
}
