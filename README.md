**krix/resource-store** - a library which provides a high-level ORM with in-memory storage to manage collection-like data. It's an independent part of Krix ecosystem.

# Installation
```
npm install -S @krix/resource-store
```

# Introduction
## What for?
How to store users? Everybody knows `Redux` and uses it for a such issue. Redux-like libraries providers very simple interface and often developers implements "iteration", "observation" and etc logic manually. The more there are entities in your app, the more duplicated code you will do, the more complex your application will be. So... We present you a `resource-storage` library. 


## Concepts
**Resource** - an object-like entity, for example User, Project, File and etc. 

**Schema** - the object, which represent every field of entity (name, age, createdAt and etc.), computed fields (firstName + lastName = fullName, roleId = isAdmin and etc.) and relations (author->book, user->project and etc.).

**Store** - js class, which extends ResourceStore abstract class and implements: storage name, schema and helper methods (optional). 

**Store Name** - a unique name for the set of entities (resource-store), for example: "user", "project" and etc. It's used for relation logic.

## Setup
At first you need to create a store defenition. Example:

```typescript
// user.resource-store.ts
import { ResourceStore, Enums } from '@krix/resource-store';

interface User {
  id: number;
  firstName: string;
  age: number;
  isAuthor: boolean;
  createdAt: Date;
}
export class UserResourceStore extends ResourceStore<User> {
  public name = 'user';

  public schema: Interfaces.Schema<User> = {
    id: Enums.SchemaType.Number,
    firstName: Enums.SchemaType.String,
    age: Enums.SchemaType.Number,
    isAuthor: Enums.SchemaType.Boolean,
    createdAt: Enums.SchemaType.Date,
  };
}
```

Now, let's create an instance of the store and add first entities. Example:

```typescript
// example.ts
import { UserResourceStore } from './user.resource-store';

const userResourceStore = new UserResourceStore();

userResourceStore.inject({
  id: 1,
  firstName: 'Andrey',
  age: 26,
  isAuthor: true,
  createdAt: new Date('2021-05-20T22:11:26.892Z'),
});
userResourceStore.inject({
  id: 2,
  firstName: 'Artur',
  age: 24,
  isAuthor: true,
  createdAt: new Date('2021-05-22T14:47:12.762Z'),
});
```

We've stored 2 entities, now let's get one of them and remove second one.
```typescript
// example.ts
const userResourceStore = new UserResourceStore();

const userArture = userResourceStore.findOne({
  firstName: 'Artur',
});
console.log(userArture); // User with id = 2

userResourceStore.removeById(1);
console.log(userResourceStore.size); // 1

```

And that's all! We've created a resource-store for `User` entity, added 2 users, got one and removed second one.
