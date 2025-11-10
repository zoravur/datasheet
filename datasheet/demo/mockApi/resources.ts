import { Id, Datum } from "./FieldTypes";
import { AssertAssignable } from "../util";
import { PrimaryIdKey, ResourceApi, ServerManagedField } from "./derived";
import { Exact, UnionToTuple } from "type-fest";
import { DeleteStatus } from "./derived";
import { Except } from "type-fest";

export type Resource = Record<string, Datum>;

type User = {
  userId: Id;
  username: string;
  email: string;
  firstName: string;
  middleInitial: string;
  lastName: string;
  phoneNumber: string;
  gender: string;
  birthDate: string;
};

type _UserIsAResource = AssertAssignable<Resource, User>;

export const makeUserApi = (): ResourceApi<"user", User> => {
  let idCounter = 0;
  let map: Map<User[PrimaryIdKey<"user", User>], User> = new Map<
    User[PrimaryIdKey<"user", User>],
    User
  >();

  return {
    create(body) {
      const user = { ...body, userId: idCounter };

      map.set(user.userId, user);
      idCounter += 1;
      return Promise.resolve({ user });
    },
    read(query) {
      const { sort } = query;

      return Promise.resolve(Array.from(map.values()));
    },
    update(id, body) {
      let user = map.get(id);
      if (user === undefined) throw new Error("Missing key: " + String(id));
      user = Object.assign(user, body);
      map.set(id, user);
      return Promise.resolve({ user });
    },
    delete(id) {
      const existed = map.delete(id);
      return Promise.resolve(
        existed ? DeleteStatus.SUCCESS : DeleteStatus.NO_SUCH_RESOURCE
      );
    },
  };
};

type Post = {
  postId: Id;
  authorId: Id;
  body: string;
  linkUrl: string;
  createdAt: string; // ISO-8601 timestamp
  editedAt: string; // ISO-8601 timestamp
  likeCount: number;
  commentCount: number;
};

export const makePostApi = (): ResourceApi<"post", Post> => {
  let idCounter = 0;
  let map = new Map<Post[PrimaryIdKey<"post", Post>], Post>();

  return {
    create(body) {
      const iso = new Date().toISOString();

      const post = {
        ...body,
        postId: idCounter,
        createdAt: iso,
        editedAt: iso,
      };

      map.set(post.postId, post);
      idCounter += 1;
      return Promise.resolve({ post });
    },
    read(query) {
      const { sort } = query;

      return Promise.resolve(Array.from(map.values()));
    },
    update(id, body) {
      let post = map.get(id);
      if (post === undefined) throw new Error("Missing key: " + String(id));
      post = Object.assign(post, body);
      map.set(id, post);
      return Promise.resolve({ post });
    },
    delete(id) {
      const existed = map.delete(id);
      return Promise.resolve(
        existed ? DeleteStatus.SUCCESS : DeleteStatus.NO_SUCH_RESOURCE
      );
    },
  };
};

type _PostIsAResource = AssertAssignable<Resource, Post>;

export type Comment = {
  commentId: Id;
  postId: Id;
  authorId: Id;
  parentCommentId?: Id;
  body: string;
  createdAt: string;
  editedAt: string;
};

export const makeCommentApi = (): ResourceApi<"comment", Comment> => {
  let idCounter = 0;
  let map = new Map<Comment[PrimaryIdKey<"comment", Comment>], Comment>();

  return {
    create(body) {
      const iso = new Date().toISOString();

      const comment = {
        ...body,
        commentId: idCounter,
        createdAt: iso,
        editedAt: iso,
      };

      map.set(comment.commentId, comment);
      idCounter += 1;
      return Promise.resolve({ comment });
    },
    read(query) {
      const { sort } = query;

      return Promise.resolve(Array.from(map.values()));
    },
    update(id, body) {
      let comment = map.get(id);
      if (comment === undefined) throw new Error("Missing key: " + String(id));
      comment = Object.assign(comment, body);
      map.set(id, comment);
      return Promise.resolve({ comment });
    },
    delete(id) {
      const existed = map.delete(id);
      return Promise.resolve(
        existed ? DeleteStatus.SUCCESS : DeleteStatus.NO_SUCH_RESOURCE
      );
    },
  };
};

type _CommentIsAResource = AssertAssignable<Resource, Comment>;

export type ResourceMap = {
  user: User;
  post: Post;
  comment: Comment;
};
