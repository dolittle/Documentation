---
title: Getting started
description: Get started with the Dolittle platform
keywords: Learning, Quickstart, setup, prerequisites, how to, guide, walkthrough, csharp, c#, dotnet, .NET, typescript, javascript
author: joel, jakob, sindre
weight: 1
aliases:
- /docs/tutorials/csharp/
- /docs/tutorials/typescript
---

Welcome to the tutorial to the Dolittle platform, where you learn how to write a [Microservice]({{< ref "docs/concepts/overview#microservice" >}}) that keeps track of foods prepared by the chefs.

After this tutorial you will have:

* a running Dolittle [Runtime]({{< ref "docs/concepts/overview" >}}) and MongoDB, and
* a [Microservice]({{< ref "docs/concepts/overview#microservice" >}}) that commits and handles [Events]({{< ref "docs/concepts/events" >}})

Use the tabs to switch between the [C#](https://github.com/dolittle/dotnet.sdk) and [TypeScript](https://github.com/dolittle/javaScript.SDK/) code examples. Full tutorial code available on GitHub for [C#](https://github.com/dolittle/DotNET.SDK/tree/master/Samples/Kitchen) and [TypeScript](https://github.com/dolittle/JavaScript.SDK/tree/master/Samples/Kitchen).

For a deeper dive into our Runtime, check our [overview]({{< ref "docs/concepts/overview" >}}).

### Setup
<!-- Use the % signs if you need to render the stuff inside as markdown -->
<!-- check https://kubernetes.io/docs/contribute/style/hugo-shortcodes/#tabs -->

{{< tabs name="setup_tab" >}}
{{% tab name="C#" %}}
This tutorial expects you to have a basic understanding of C#, .NET and Docker.

Prerequisites:
* [.NET Core SDK](https://dotnet.microsoft.com/download)
* [Docker](https://www.docker.com/products/docker-desktop)

Setup a .NET Core console project:
```shell
$ dotnet new console
$ dotnet add package Dolittle.SDK 
```
{{% /tab %}}

{{% tab name="TypeScript" %}}
This tutorial expects you to have a basic understanding of TypeScript, npm and Docker.

Prerequisites:
* [Node.js >= 12](https://nodejs.org/en/download/)
* [Docker](https://www.docker.com/products/docker-desktop)

Setup a TypeScript NodeJS project using your favorite package manager. For this tutorial we use npm.
```shell
$ npm init
$ npm -D install typescript ts-node
$ npm install @dolittle/sdk
$ npx tsc --init
```
This tutorial makes use of experimental decorators. To enable it simply make sure you have "experimentalDecorators" set to true in your tsconfig.json.
{{% /tab %}}
{{< /tabs >}}

### Create an `EventType`
First we'll create an [`EventType`]({{< ref "docs/concepts/events#eventtype" >}}) that represents that a dish has been prepared. Events represents changes in the system, a _"fact that has happened"_. As the event _"has happened"_, it's immutable by definition, and we should name it in the past tense accordingly.

An [`EventType`]({{< ref "docs/concepts/events#eventtype" >}}) is a class that defines the properties of the event. It acts as a wrapper for the type of the event.

{{< tabs name="eventtype_tab" >}}
{{% tab name="C#" %}}
```csharp
// DishPrepared.cs
using Dolittle.SDK.Events;

namespace Kitchen 
{
    [EventType("1844473f-d714-4327-8b7f-5b3c2bdfc26a")]
    public class DishPrepared
    {
        public DishPrepared (string dish, string chef)
        {
            Dish = dish;
            Chef = chef;
        }
        public string Dish { get; }
        public string Chef { get; }
    }
}
```
The GUID given in the `[EventType()]` attribute is the [`EventTypeId`]({{< ref "docs/concepts/events#eventtype" >}}), which is used to identify this `EventType` type in the Runtime.
{{% /tab %}}

{{% tab name="TypeScript" %}}
```typescript
// DishPrepared.ts
import { eventType } from '@dolittle/sdk.events';

@eventType('1844473f-d714-4327-8b7f-5b3c2bdfc26a')
export class DishPrepared {
    constructor(readonly Dish: string, readonly Chef: string) {}
}
```
The GUID given in the `@eventType()` decorator is the [`EventTypeId`]({{< ref "docs/concepts/events#eventtype" >}}), which is used to identify this `EventType` in the Runtime.
{{% /tab %}}
{{< /tabs >}}

### Create an `EventHandler`
Now we need something that can react to dishes that have been prepared. Let's create an [`EventHandler`]({{< ref "docs/concepts/event_handlers_and_filters#event-handlers" >}}) which prints the prepared dishes to the console.

{{< tabs name="eventhandler_tab" >}}
{{% tab name="C#" %}}
```csharp
// DishHandler.cs
using System;
using Dolittle.SDK.Events;
using Dolittle.SDK.Events.Handling;

namespace Kitchen
{
    [EventHandler("f2d366cf-c00a-4479-acc4-851e04b6fbba")]
    public class DishHandler
    {
        public void Handle(DishPrepared @event, EventContext eventContext)
        {
            Console.WriteLine($"{@event.Chef} has prepared {@event.Dish}. Yummm!");
        }
    }
}
```
When an event is committed, the `Handle()` method will be called for all the `EventHandlers` that handle that `EventType`.

The `[EventHandler()]` attribute identifies this event handler in the Runtime, and is used to keep track of which event it last processed, and retrying the handling of an event if the handler fails (throws an exception).
{{% /tab %}}

{{% tab name="TypeScript" %}}
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
{{% /tab %}}
{{< /tabs >}}

### Connect the client and commit an event
Let's build a client that connects to the Runtime for a [Microservice]({{< ref "docs/concepts/overview#microservice" >}}) with the id `"f39b1f61-d360-4675-b859-53c05c87c0e6"`. This sample Microservice is pre-configured in the `development` Docker image.

While configuring the client we register the `EventTypes` and `EventHandlers` so that the Runtime knows about them. Then we can prepare a delicious taco and commit it to the [`EventStore`]({{< ref "docs/concepts/event_store" >}}) for the specified tenant.

{{< tabs name="client_tab" >}}
{{% tab name="C#" %}}
```csharp
// Program.cs
using Dolittle.SDK;
using Dolittle.SDK.Tenancy;

namespace Kitchen
{
    class Program
    {
        public static void Main()
        {
            var client = Client
                .ForMicroservice("f39b1f61-d360-4675-b859-53c05c87c0e6")
                .WithEventTypes(eventTypes =>
                    eventTypes.Register<DishPrepared>())
                .WithEventHandlers(builder =>
                    builder.RegisterEventHandler<DishHandler>())
                .Build();

            var preparedTaco = new DishPrepared("Bean Blaster Taco", "Mr. Taco");

            client.EventStore
                .ForTenant(TenantId.Development)
                .Commit(eventsBuilder =>
                    eventsBuilder
                        .CreateEvent(preparedTaco)
                        .FromEventSource("bfe6f6e4-ada2-4344-8a3b-65a3e1fe16e9"));

            // Blocks until the EventHandlers are finished, i.e. forever
            client.Start().Wait();
        }
    }
}
```

The GUID given in `FromEventSource()` is the [`EventSourceId`]({{< ref "docs/concepts/events#eventsourceid" >}}), which is used to identify where the events come from.
{{% /tab %}}

{{% tab name="TypeScript" %}}
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

The GUID given in the `commit()` call is the [`EventSourceId`]({{< ref "docs/concepts/events#eventsourceid" >}}), which is used to identify where the events come from.
{{% /tab %}}
{{< /tabs >}}

### Start the Dolittle Runtime
Start the Dolittle Runtime with all the necessary dependencies with the following command:

```shell
$ docker run -p 50053:50053 -p 27017:27017 dolittle/runtime:latest-development
```

This will start a container with the Dolittle Development Runtime on port 50053 and a MongoDB server on port 27017.
The Runtime handles committing the events and the event handlers while the MongoDB is used for persistence.

### Run your microservice
Run your code, and get a delicious serving of taco:

{{< tabs name="run_tab" >}}
{{% tab name="C#" %}}
```shell
$ dotnet run
Mr. Taco has prepared Bean Blaster Taco. Yummm!
```

{{% /tab %}}
{{% tab name="TypeScript" %}}
```shell
$ npx ts-node index.ts
Mr. Taco has prepared Bean Blaster Taco. Yummm!
```
{{% /tab %}}
{{< /tabs >}}
