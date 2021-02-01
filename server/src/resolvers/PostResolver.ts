import { Vote } from "../entities/Vote";
import { MyContext } from "src/types";
import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from "type-graphql";
import { LessThan } from "typeorm";
import { Post } from "../entities/Post";
import { isAuth } from "../middleware/isAuth";

@InputType()
class PostInput {
  @Field()
  title: string;
  @Field()
  text: string;
}

@ObjectType()
class PaginatedPosts {
  @Field(() => [Post])
  posts: Post[];
  @Field()
  hasMore: boolean;
}

@Resolver(Post)
export class PostResolver {
  @FieldResolver(() => String)
  textSnippet(@Root() root: Post) {
    return root.text.slice(0, 50);
  }

  @Query(() => PaginatedPosts)
  async posts(
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => String, { nullable: true }) cursor: string | null
  ): Promise<PaginatedPosts> {
    limit = Math.min(50, limit); // Make sure limit doesn't exceed this cap
    const limitPlusOne = limit + 1;

    /* const replacements: any[] = [limitPlusOne];
    if (cursor) replacements.push(new Date(cursor));

    const posts = await getConnection().query(
      `
      select p.*,
      json_build_object(
        'id', u.id,
        'username', u.username,
        'email', u.email
        ) creator
      from post p
      inner join public.user u on u.id = p."creatorId"
      ${cursor ? `where p."createdAt" < $2` : ""}
      order by p."createdAt" DESC
      limit $1
      `,
      replacements
    ); */

    /* const qb = getConnection()
      .getRepository(Post)
      .createQueryBuilder("p")
      .innerJoinAndSelect("p.creator", "u", 'u.id = p."creatorId"')
      .orderBy('p."createdAt"', "DESC") // Postgres requires sending double quotes like this to preserve camel casing
      .take(limitPlusOne);

    if (cursor)
      qb.where('p."createdAt" < :cursor', { cursor: new Date(cursor) });

    const posts = await qb.getMany(); */

    const posts = await Post.find({
      where: !cursor ? [] : [{ createdAt: LessThan(new Date(cursor)) }],
      order: { createdAt: "DESC" },
      take: limitPlusOne,
      relations: ["creator"],
    });

    return {
      posts: posts.slice(0, limit),
      hasMore: posts.length === limitPlusOne,
    };
  }

  @Query(() => Post, { nullable: true })
  post(@Arg("id") id: number): Promise<Post | undefined> {
    return Post.findOne(id);
  }

  @Mutation(() => Post)
  @UseMiddleware(isAuth)
  createPost(
    @Arg("input") input: PostInput,
    @Ctx() { req }: MyContext
  ): Promise<Post> {
    return Post.create({
      ...input,
      creatorId: req.session.userId,
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

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async vote(
    @Arg("postId", () => Int) postId: number,
    @Arg("value", () => Int) value: number,
    @Ctx() { req }: MyContext
  ) {
    const userId = req.session.userId;
    if (value === 0) return false;
    value = value > 0 ? 1 : -1;
    const vote = await Vote.insert({
      userId,
      postId,
      value,
    });
    if (!vote.generatedMaps) return false;

    const post = await Post.findOne(postId);
    if (!post) return false;

    await Post.update(post.id, { points: post.points + value });
    return true;
  }
}
