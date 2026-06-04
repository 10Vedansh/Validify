import type { Context } from "hono";
import { userService } from "@/services/user.service";
import type { UpdateUserInput } from "@/schemas/user.schema";

export const userController = {
  async update(c: Context) {
    const userId = c.get("userId");
    const body = c.req.valid("json" as never) as UpdateUserInput;
    const user = await userService.update(userId, body);
    return c.json(user);
  },
};
