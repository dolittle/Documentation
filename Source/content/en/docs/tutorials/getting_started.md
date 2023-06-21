---
title: Getting started
description: Get started with the Dolittle platform
keywords: Learning, Quickstart, setup, prerequisites, how to, guide, walkthrough, csharp, c#, dotnet, .NET, typescript, javascript
author: joel, jakob, sindre
weight: 1
aliases:
- /docs/tutorials/csharp
- /docs/tutorials/typescript
- /docs/tutorials/getting-started
---

Welcome to the tutorial for Dolittle, where you learn how to write a [Microservice]({{< ref "docs/concepts/overview#microservice" >}}) that keeps track of foods prepared by the chefs.

After this tutorial you will have:

* a running Dolittle environment with a [Runtime]({{< ref "docs/concepts/overview" >}}) and a MongoDB, and
* a [Microservice]({{< ref "docs/concepts/overview#microservice" >}}) that commits and handles [Events]({{< ref "docs/concepts/events" >}})

Use the tabs to switch between the [C#](https://github.com/dolittle/dotnet.sdk) and [TypeScript](https://github.com/dolittle/javaScript.SDK/) code examples. Full tutorial code available on GitHub for [C#](https://github.com/dolittle/DotNET.SDK/tree/master/Samples/Tutorials/GettingStarted) and [TypeScript](https://github.com/dolittle/JavaScript.SDK/tree/master/Samples/Tutorials/GettingStarted).

For a deeper dive into our Runtime, check our [overview]({{< ref "docs/concepts/overview" >}}).

### Setup
<!-- Use the % signs if you need to render the stuff inside as markdown -->
<!-- check https://kubernetes.io/docs/contribute/style/hugo-shortcodes/#tabs -->

{{< tabs name="setup_tab" >}}
{{% tab name="C#" %}}
This tutorial expects you to have a basic understanding of C#, .NET and Docker.

Prerequisites:
* [.NET SDK](https://dotnet.microsoft.com/download)
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
$ npx tsc --init --experimentalDecorators --target es6
```
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
using Dolittle.SDK.Events;
using Dolittle.SDK.Events.Handling;
using Microsoft.Extensions.Logging;

[EventHandler("f2d366cf-c00a-4479-acc4-851e04b6fbba")]
public class DishHandler
{
    readonly ILogger _logger;

    public DishHandler(ILogger<DishHandler> logger)
    {
        _logger = logger;
    }

    public void Handle(DishPrepared @event, EventContext eventContext)
    {
        _logger.LogInformation("{Chef} has prepared {Dish}. Yummm!", @event.Chef, @event.Dish);
    }
}
```
When an event is committed, the `Handle()` method will be called for all the `EventHandlers` that handle that `EventType`.

The `[EventHandler()]` attribute identifies this event handler in the Runtime, and is used to keep track of which event it last processed, and retrying the handling of an event if the handler fails (throws an exception).
{{% /tab %}}

{{% tab name="TypeScript" %}}
```typescript
// DishHandler.ts
import { inject } from '@dolittle/sdk.dependencyinversion';
import { EventContext } from '@dolittle/sdk.events';
import { eventHandler, handles } from '@dolittle/sdk.events.handling';
import { Logger } from 'winston';

import { DishPrepared } from './DishPrepared';

@eventHandler('f2d366cf-c00a-4479-acc4-851e04b6fbba')
export class DishHandler {
    constructor(
        @inject('Logger') private readonly _logger: Logger
    ) {}

    @handles(DishPrepared)
    dishPrepared(event: DishPrepared, eventContext: EventContext) {
        this._logger.info(`${event.Chef} has prepared ${event.Dish}. Yummm!`);
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
using Microsoft.Extensions.Hosting;

var host = Host.CreateDefaultBuilder()
    .UseDolittle()
    .Build();

await host.StartAsync();

var client = await host.GetDolittleClient();
await client.EventStore
    .ForTenant(TenantId.Development)
    .CommitEvent(
        content: new DishPrepared("Bean Blaster Taco", "Mr. Taco"),
        eventSourceId: "Dolittle Tacos");

await host.WaitForShutdownAsync();

```

The string given as `eventSourceId` is the [`EventSourceId`]({{< ref "docs/concepts/events#eventsourceid" >}}), which is used to identify where the events come from.
{{% /tab %}}

{{% tab name="TypeScript" %}}
```typescript
// index.ts
import { DolittleClient } from '@dolittle/sdk';
import { TenantId } from '@dolittle/sdk.execution';

import './DishHandler';
import { DishPrepared } from './DishPrepared';

(async () => {
    const client = await DolittleClient
        .setup()
        .connect();

    const preparedTaco = new DishPrepared('Bean Blaster Taco', 'Mr. Taco');

    await client.eventStore
        .forTenant(TenantId.development)
        .commit(preparedTaco, 'Dolittle Tacos');
})();
```

The string given in the `commit()` call is the [`EventSourceId`]({{< ref "docs/concepts/events#eventsourceid" >}}), which is used to identify where the events come from.
{{% /tab %}}
{{< /tabs >}}

### Start the Dolittle environment
Start the Dolittle environment with all the necessary dependencies with the following command:

```shell
$ docker run -p 50053:50053 -p 51052:51052 -p 27017:27017 -d dolittle/runtime:latest-development
```

This will start a container with the Dolittle Development Runtime on port 50053 and 51052 and a MongoDB server on port 27017.
The Runtime handles committing the events and the event handlers while the MongoDB is used for persistence.

{{% alert title="Docker on Windows" color="warning" %}}
Docker on Windows using the WSL2 backend can use massive amounts of RAM if not limited. Configuring a limit in the `.wslconfig` file can help greatly, as mentioned in [this issue](https://github.com/microsoft/WSL/issues/4166#issuecomment-526725261). The RAM usage is also lowered if you disable the WSL2 backend in Docker for Desktop settings.
{{% /alert %}}

### Run your microservice
Run your code, and get a delicious serving of taco:

{{< tabs name="run_tab" >}}
{{% tab name="C#" %}}
```shell
$ dotnet run
info: Dolittle.SDK.DolittleClientService[0]
      Connecting Dolittle Client
info: Microsoft.Hosting.Lifetime[0]
      Application started. Press Ctrl+C to shut down.
info: Microsoft.Hosting.Lifetime[0]
      Hosting environment: Production
info: Microsoft.Hosting.Lifetime[0]
      Content root path: .../GettingStarted
info: Dolittle.SDK.Events.Processing.EventProcessors[0]
      EventHandler f2d366cf-c00a-4479-acc4-851e04b6fbba registered with the Runtime, start handling requests
info: DishHandler[0]
      Mr. Taco has prepared Bean Blaster Taco. Yummm!

```

{{% /tab %}}
{{% tab name="TypeScript" %}}
```shell
$ npx ts-node index.ts
info: EventHandler f2d366cf-c00a-4479-acc4-851e04b6fbba registered with the Runtime, start handling requests.
info: Mr. Taco has prepared Bean Blaster Taco. Yummm!
```
{{% /tab %}}
{{< /tabs >}}

### Check the status of your microservice
With everything is up and running you can use the [Dolittle CLI]({{< ref "docs/reference/cli" >}}) to check what's going on.

Open a new terminal.

Now you can list the registered event types with the following command:
```shell
$ dolittle runtime eventtypes list
EventType
------------
DishPrepared
```

And check the status of the event handler with the following commands:
```shell
$ dolittle runtime eventhandlers list
EventHandler  Scope    Partitioned  Status
------------------------------------------
DishHandler   Default  ✅            ✅

$ dolittle runtime eventhandlers get DishHandler
Tenant                                Position  Status
------------------------------------------------------
445f8ea8-1a6f-40d7-b2fc-796dba92dc44  1         ✅
```

## What's next

- Learn how to use [Aggregates]({{< ref "aggregates" >}}) implement rules.
- Learn how to use [Projections]({{< ref "projections" >}}) to create read models.
- Learn how to [deploy your application]({{< ref "docs/platform/deploy_an_application" >}}) into our [Platform]({{< ref "docs/platform" >}}).
