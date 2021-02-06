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
import {
  createQueryBuilder,
  getManager,
  getRepository,
  LessThan,
  Equal,
  getConnection,
} from "typeorm";
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
    @Arg("cursor", () => String, { nullable: true }) cursor: string | null,
    @Ctx() { req }: MyContext
  ): Promise<PaginatedPosts> {
    limit = Math.min(50, limit); // Make sure limit doesn't exceed this cap
    const limitPlusOne = limit + 1;

    const replacements: any[] = [limitPlusOne, req.session.userId];
    if (cursor) replacements.push(new Date(cursor));

    const posts = await getConnection().query(
      `
      select p.*,
      json_build_object(
        'id', u.id,
        'username', u.username,
        'email', u.email,
        'createdAt', u."createdAt",
        'updatedAt', u."updatedAt"
        ) creator,
      ${
        req.session.userId
          ? '(select value from vote where "userId" = $2 and "postId" = p.id) voted'
          : 'null as "voted"'
      }
      from post p
      inner join public.user u on u.id = p."creatorId"
      ${cursor ? `where p."createdAt" < $3` : ""}
      order by p."createdAt" DESC
      limit $1
      `,
      replacements
    );

    /* const qb = getConnection()
      .getRepository(Post)
      .createQueryBuilder("p")
      .innerJoinAndSelect("p.creator", "u", 'u.id = p."creatorId"')
      .orderBy('p."createdAt"', "DESC") // Postgres requires sending double quotes like this to preserve camel casing
      .take(limitPlusOne);

    if (cursor)
      qb.where('p."createdAt" < :cursor', { cursor: new Date(cursor) });

    const posts = await qb.getMany(); */

    /* const posts = await Post.find({
      where: !cursor ? [] : [{ createdAt: LessThan(new Date(cursor)) }],
      order: { createdAt: "DESC" },
      take: limitPlusOne,
      relations: ["creator"],
    }); */

    console.log(posts);

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

  @Mutation(() => Post, { nullable: true })
  @UseMiddleware(isAuth)
  async vote(
    @Arg("postId", () => Int) postId: number,
    @Arg("value", () => Int) value: number,
    @Ctx() { req }: MyContext
  ): Promise<Post | null> {
    const userId = req.session.userId;

    if (value === 0) return null;
    value = value > 0 ? 1 : -1;

    const post = await Post.findOne(postId);
    if (!post) return null;

    let vote = await Vote.findOne({
      where: { postId: postId, userId: userId },
    });

    let updatedPost = null;

    if (vote) {
      if (value == vote.value) return null;

      vote.value = value;

      post.points += vote.value * 2;

      await getManager().transaction(async (transactionalEntityManager) => {
        await transactionalEntityManager.save(vote);
        updatedPost = await transactionalEntityManager.save(post);
      });
    } else {
      vote = Vote.create({ userId, postId, value });

      post.points += vote.value;

      await getManager().transaction(async (transactionalEntityManager) => {
        await transactionalEntityManager.save(vote);
        updatedPost = await transactionalEntityManager.save(post);
      });
    }

    return updatedPost;
  }
}
