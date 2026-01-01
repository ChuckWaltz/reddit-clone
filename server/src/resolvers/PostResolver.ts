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
import { getManager, getConnection } from "typeorm";
import { Post } from "../entities/Post";
import { isAuth } from "../middleware/isAuth";
import { User } from "../entities/User";

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

  // Custom field resolver to always get creator when we get a post
  // Uses dataloader package to optimize sql queries
  @FieldResolver(() => User)
  creator(@Root() post: Post, @Ctx() { userLoader }: MyContext) {
    return userLoader.load(post.creatorId);
  }

  // Custom field resolver to always get voted when we get a post
  // Uses dataloader package to optimize sql queries
  @FieldResolver(() => Int, { nullable: true })
  async voted(@Root() post: Post, @Ctx() { voteLoader, req }: MyContext) {
    if (!req.session.userId) return null;

    const vote = await voteLoader.load({
      postId: post.id,
      userId: req.session.userId,
    });

    return vote ? vote.value : null;
  }

  @Query(() => PaginatedPosts)
  async posts(
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => String, { nullable: true }) cursor: string | null
  ): Promise<PaginatedPosts> {
    limit = Math.min(50, limit); // Make sure limit doesn't exceed this cap
    const limitPlusOne = limit + 1;

    const qb = getConnection()
      .getRepository(Post)
      .createQueryBuilder("p")
      .orderBy("p.points", "DESC")
      .addOrderBy("p.createdAt", "DESC")
      .addOrderBy("p.id", "DESC")
      .take(limitPlusOne);

    if (cursor) {
      try {
        const cursorData = JSON.parse(cursor);
        if (cursorData.points !== undefined && cursorData.createdAt && cursorData.id) {
          qb.where(
            "(p.points < :points) OR (p.points = :points AND p.createdAt < :createdAt) OR (p.points = :points AND p.createdAt = :createdAt AND p.id < :id)",
            { points: cursorData.points, createdAt: new Date(cursorData.createdAt), id: cursorData.id }
          );
        }
      } catch {
        // Invalid cursor format, ignore and return from beginning
      }
    }

    const posts = await qb.getMany();

    /* const posts = await getConnection().query(
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
      ${cursor ? `where p."createdAt" < $${cursorIdx}` : ""}
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

    /* const posts = await Post.find({
      where: !cursor ? [] : [{ createdAt: LessThan(new Date(cursor)) }],
      order: { createdAt: "DESC" },
      take: limitPlusOne,
      relations: ["creator"],
    }); */

    return {
      posts: posts.slice(0, limit),
      hasMore: posts.length === limitPlusOne,
    };
  }

  @Query(() => Post, { nullable: true })
  post(@Arg("id", () => Int) id: number): Promise<Post | undefined> {
    /* return Post.findOne(id, { relations: ["creator"] }); */
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
  @UseMiddleware(isAuth)
  async updatePost(
    @Arg("id", () => Int) id: number,
    @Arg("title") title: string,
    @Arg("text") text: string,
    @Ctx() { req }: MyContext
  ): Promise<Post | null> {
    const result = await getConnection()
      .createQueryBuilder()
      .update(Post)
      .set({ title, text })
      .where('id = :id and "creatorId" = :creatorId', {
        id,
        creatorId: req.session.userId,
      })
      .returning("*")
      .execute();

    return result.raw[0];
    /* let postToUpdate = await Post.findOne(id);
    if (postToUpdate) {
      const res = await Post.update({ id }, { title, text });
      console.log(res);
      return postToUpdate;
    } else {
      return null;
    } */
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deletePost(
    @Arg("id", () => Int) id: number,
    @Ctx() { req }: MyContext
  ): Promise<boolean> {
    await Post.delete({ id, creatorId: req.session.userId });
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
