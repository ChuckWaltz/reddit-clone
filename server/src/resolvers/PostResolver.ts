import { Arg, Field, InputType, Mutation, Query, Resolver } from "type-graphql";
import { DeleteResult } from "typeorm";
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
  async posts(): Promise<Post[]> {
    return Post.find({
      order: {
        updatedAt: "DESC",
      },
    });
  }

  @Query(() => Post, { nullable: true })
  async post(@Arg("id") id: number): Promise<Post | undefined> {
    const res = await Post.findOne(id);
    return res;
  }

  @Mutation(() => Post)
  async createPost(@Arg("input") input: PostInput): Promise<Post> {
    const res: Post = await Post.create({
      ...input,
    }).save();
    return res;
  }

  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg("id") id: number,
    @Arg("title") title: string,
    @Arg("text") text: string
  ): Promise<Post | null> {
    let postToUpdate = await Post.findOne(id);
    if (postToUpdate) {
      postToUpdate.title = title;
      postToUpdate.text = text;
      const res: Post = await Post.save(postToUpdate);
      return res;
    } else {
      return null;
    }
  }

  @Mutation(() => Boolean)
  async deletePost(@Arg("id") id: number): Promise<boolean> {
    const res: DeleteResult = await Post.delete(id);
    console.log(res);
    return true;
  }
}
