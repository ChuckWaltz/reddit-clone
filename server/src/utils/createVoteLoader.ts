import DataLoader from "dataloader";
import { Vote } from "../entities/Vote";

// Input -> [1, 5, 77, 22, etc...]
// Output -> [{id: 1, username: 'tim'}, {}, {}, {}, etc...]
export const createVoteLoader = () =>
  new DataLoader<{ userId: number; postId: number }, Vote | null>(
    async (keys) => {
      const votes = await Vote.findByIds(keys as any);
      const voteIdsToVote: Record<string, Vote> = {};
      votes.forEach((vote) => {
        voteIdsToVote[`${vote.userId}|${vote.postId}`] = vote;
      });
      return keys.map((key) => voteIdsToVote[`${key.userId}|${key.postId}`]);
    }
  );
