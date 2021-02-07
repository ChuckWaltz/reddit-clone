import DataLoader from "dataloader";
import { User } from "../entities/User";

// Input -> [1, 5, 77, 22, etc...]
// Output -> [{id: 1, username: 'tim'}, {}, {}, {}, etc...]
export const createUserLoader = () =>
  new DataLoader<number, User>(async (userIds) => {
    const users = await User.findByIds(userIds as number[]);
    const userIdToUser: Record<number, User> = {};
    users.forEach((u) => {
      userIdToUser[u.id] = u;
    });
    return userIds.map((userId) => userIdToUser[userId]);
  });
