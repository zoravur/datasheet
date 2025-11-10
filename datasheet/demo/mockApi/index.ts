import { faker } from "@faker-js/faker";
import { Id, Datum } from "./FieldTypes";
import { Comment, makeCommentApi, makePostApi, makeUserApi } from "./resources";

export async function newApi(fakerSeed: number = 1337) {
  const api = {
    user: makeUserApi(),
    post: makePostApi(),
    comment: makeCommentApi(),
  };

  async function seedApi() {
    faker.seed(fakerSeed);

    for (let i = 0; i < 1024; ++i) {
      await api.user.create({
        username: faker.internet.username(),
        email: faker.internet.email(),
        firstName: faker.person.firstName(),
        middleInitial: faker.person.middleName()[0],
        lastName: faker.person.lastName(),
        phoneNumber: faker.phone.number(),
        gender: faker.person.gender(),
        birthDate: faker.date.birthdate().toISOString(),
      });
    }

    for (let i = 0; i < 2048; ++i) {
      await api.post.create({
        authorId: faker.number.int({ min: 0, max: 1024 }),
        body: faker.lorem.paragraph(),
        linkUrl: faker.internet.url(),
        likeCount: Math.floor(
          Math.pow(faker.number.float({ min: 0, max: 10 }), 4)
        ),
        commentCount: Math.floor(
          Math.pow(faker.number.float({ min: 0, max: 20 }), 2)
        ),
      });
    }

    const users = await api.user.read({});
    const posts = await api.post.read({});
    const comments: Comment[] = [];

    for (let i = 0; i < 4096; ++i) {
      const resourceId = faker.number.int({ min: 0, max: 2048 + i });

      let postId: Id, parentCommentId;
      if (resourceId < 2048) {
        postId = posts[i].postId;
      } else {
        parentCommentId = comments[2048 - i].commentId;
        postId = comments[2048 - i].postId;
      }

      api.comment.create({
        postId,
        authorId:
          users[faker.number.int({ min: 0, max: users.length - 1 })].userId,
        parentCommentId,
        body: faker.lorem.sentence(),
      });
    }
  }

  await seedApi();
  return api;
}
