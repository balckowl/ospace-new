import * as v from "valibot";

export const NotFoundSchema = v.object({
  status: v.literal("404"),
  message: v.string(),
});

export const ForbiddenSchema = v.object({
  status: v.literal("403"),
  message: v.string(),
});
