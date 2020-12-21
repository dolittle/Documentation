---
title: TypeScript
description: Get started with the Dolittle JavaScript SDK using TypeScript
keywords: Learning, Quickstart, setup, prerequisites, how to, guide, walkthrough, typescript, javascript
author: joel, jakob, sindre
weight: 2
---

Welcome to the Dolittle TypeScript tutorial for the [JavaScript.SDK](https://github.com/dolittle/javaScript.SDK/) where you learn how to write a microservice that keeps track of foods prepared by the chefs.

This tutorial expects you to have a basic understanding of TypeScript, npm and Docker.

After this tutorial you will have:

* a running Dolittle Runtime and MongoDB, and
* a Microservice that commits and handles events

Full tutorial code available on [GitHub](https://github.com/dolittle/JavaScript.SDK/tree/master/Samples/Kitchen).

### What you'll need
Install and configure the required prerequisites locally first:

* [Node.js >= 12](https://nodejs.org/en/download/)
* [Docker](https://www.docker.com/products/docker-desktop)

### Setup a TypeScript project
Setup a TypeScript NodeJS project using your favorite package manager. For this tutorial we use npm.

```shell
$ npm init
$ npm -D install typescript ts-node
$ npm install @dolittle/sdk
$ npx tsc --init
```

This tutorial makes use of experimental decorators. To enable it simply make sure you have `"experimentalDecorators"` set to `true` in your `tsconfig.json`.

### Create an `EventType`
First we'll create an `EventType` that represents that a dish has been prepared. Events represents changes in the system, a _"fact that has happened"_. As the event _"has happened"_, it's immutable by definition, and we should name it in the past tense accordingly.

```typescript
// DishPrepared.ts
import { eventType } from '@dolittle/sdk.events';

@eventType('1844473f-d714-4327-8b7f-5b3c2bdfc26a')
export class DishPrepared {
    constructor(readonly Dish: string, readonly Chef: string) {}
}
```

An `EventType` is a class that defines the properties of the event. The GUID given in the `@eventType()` decorator is used to identify this `EventType` in the Runtime.

### Create an event handler
Now we need something that can react to dishes that have been prepared. Let's create an `EventHandler` which prints the prepared dishes to the console.

```typescript
// DishHandler.ts
import { EventContext } from '@dolittle/sdk.events';
import { eventHandler, handles } from '@dolittle/sdk.events.handling';
import { DishPrepared } from './DishPrepared';

@eventHandler('f2d366cf-c00a-4479-acc4-851e04b6fbba')
export class DishHandler {

    @handles(DishPrepared)
    dishPrepared(event: DishPrepared, eventContext: EventContext) {
        console.log(`${event.Chef} has prepared ${event.Dish}. Yummm!`);
    }
}
```

When an event is committed, the method decorated with the `@handles(EventType)` for that specific `EventType` will be called.

The `@eventHandler()` decorator identifies this event handler in the Runtime, and is used to keep track of which event it last processed, and retrying the handling of an event if the handler fails (throws an exception).

### Connect the client and commit an event
Create a client that connects to the Runtime for a Microservice with the id `'f39b1f61-d360-4675-b859-53c05c87c0e6'`. This sample Microservice is preconfigured in the `development` Docker image.

While configuring the client we register the `EventTypes` and `EventHandlers` so that the Runtime knows about them. Then we can prepare a delicious taco and commit it to the `EventStore` for the specified tenant.

```typescript
// index.ts
import { Client } from '@dolittle/sdk';
import { TenantId } from '@dolittle/sdk.execution';
import { DishPrepared } from './DishPrepared';
import { DishHandler } from './DishHandler';

const client = Client
    .forMicroservice('f39b1f61-d360-4675-b859-53c05c87c0e6')
    .withEventTypes(eventTypes =>
        eventTypes.register(DishPrepared))
    .withEventHandlers(builder =>
        builder.register(DishHandler))
    .build();

const preparedTaco = new DishPrepared('Bean Blaster Taco', 'Mr. Taco');

client.eventStore
    .forTenant(TenantId.development)
    .commit(preparedTaco, 'bfe6f6e4-ada2-4344-8a3b-65a3e1fe16e9');
```

The GUID given in the `commit()` call is used to identify where the events come from.

### Start the Dolittle Runtime
Start the Dolittle Runtime with all the necessary dependencies with the following command:

```shell
$ docker run -p 50053:50053 -p 27017:27017 dolittle/runtime:latest-development
```

This will start a container with the Dolittle Development Runtime on port 50053 and a MongoDB server on port 27017.
The Runtime handles committing the events and the event handlers while the MongoDB is used for persistence.

### Run your microservice
Run your code with:

```shell
$ npx ts-node index.ts
Mr. Taco has prepared Bean Blaster Taco. Yummm!
```
