---
title: Projections
description: Get started with Projections
keywords: Learning, Quickstart, setup, prerequisites, how to, guide, walkthrough, csharp, c#, dotnet, .NET, typescript, javascript
author: joel, jakob, sindre
weight: 15
---

Welcome to the tutorial for Projections in Dolittle, where you learn how to write a [Microservice]({{< ref "docs/concepts/overview#microservice" >}}) that keeps track of food prepared by the chefs.
After this tutorial you will have:

* a running Dolittle environment with a [Runtime]({{< ref "docs/concepts/overview" >}}) and a MongoDB, and
* a [Microservice]({{< ref "docs/concepts/overview#microservice" >}}) that commits [Events]({{< ref "docs/concepts/events" >}})
* 2 [Projections]({{< ref "docs/concepts/projections" >}}) that react to events and mutate the [Read Model]({{< ref "docs/concepts/projections#read-model" >}}).

Use the tabs to switch between the [C#](https://github.com/dolittle/dotnet.sdk) and [TypeScript](https://github.com/dolittle/javaScript.SDK/) code examples. Full tutorial code available on GitHub for [C#](https://github.com/dolittle/DotNET.SDK/tree/master/Samples/Tutorials/Projections) and [TypeScript](https://github.com/dolittle/JavaScript.SDK/tree/master/Samples/Tutorials/Projections).

## Setup
<!-- Use the % signs if you need to render the stuff inside as markdown -->
<!-- check https://kubernetes.io/docs/contribute/style/hugo-shortcodes/#tabs -->
This tutorial builds directly upon the [getting started]({{< ref "docs/tutorials/getting_started" >}}) guide and the files from the it.

{{< tabs name="setup_tab" >}}
{{% tab name="C#" %}}

Prerequisites:
* [.NET Core SDK](https://dotnet.microsoft.com/download)
* [Docker](https://www.docker.com/products/docker-desktop)

Before getting started, your directory should look something like this:

    └── Projections/
        ├── DishHandler.cs
        ├── DishPrepared.cs
        ├── Program.cs
        └── Projections.csproj

{{% /tab %}}

{{% tab name="TypeScript" %}}

Prerequisites:
* [Node.js >= 12](https://nodejs.org/en/download/)
* [Docker](https://www.docker.com/products/docker-desktop)

Before getting started, your directory should look something like this:

    └── projections/
        ├── .eslintrc
        ├── DishHandler.ts
        ├── DishPrepared.ts
        ├── index.ts
        ├── package.json
        └── tsconfig.json

{{% /tab %}}
{{< /tabs >}}

### Start the Dolittle environment
If you don't have a Runtime already going from a previous tutorial, start the Dolittle environment with all the necessary dependencies with the following command:

```shell
$ docker run -p 50053:50053 -p 51052:51052 -p 27017:27017 -d dolittle/runtime:latest-development
```

This will start a container with the Dolittle Development Runtime on port 50053 and 51052 and a MongoDB server on port 27017.
The Runtime handles committing the events and the event handlers while the MongoDB is used for persistence.

{{% alert title="Docker on Windows" color="warning" %}}
Docker on Windows using the WSL2 backend can use massive amounts of RAM if not limited. Configuring a limit in the `.wslconfig` file can help greatly, as mentioned in [this issue](https://github.com/microsoft/WSL/issues/4166#issuecomment-526725261). The RAM usage is also lowered if you disable the WSL2 backend in Docker for Desktop settings.
{{% /alert %}}

## Create a `DishCounter` Projection
First, we'll create a [Projection]({{< ref "docs/concepts/projections" >}}) that keeps track of the dishes and how many times the chefs have prepared them. Projections are a special type of event handler that mutate a read model based on incoming events.

{{< tabs name="dishes_counter_tab" >}}
{{% tab name="C#" %}}
```csharp
// DishCounter.cs
using Dolittle.SDK.Projections;

[Projection("98f9db66-b6ca-4e5f-9fc3-638626c9ecfa")]
public class DishCounter
{
    public string Name = "Unknown";
    public int NumberOfTimesPrepared = 0;

    [KeyFromProperty("Dish")]
    public void On(DishPrepared @event, ProjectionContext context)
    {
        Name = @event.Dish;
        NumberOfTimesPrepared ++;
    }
}

```
The `[Projection()]` attribute identifies this Projection in the Runtime, and is used to keep track of the events that it processes, and retrying the handling of an event if the handler fails (throws an exception). If the Projection is changed somehow (eg. a new `On()` method or the `EventType` changes), it will replay all of its events.

When an event is committed, the `On()` method is called for all the Projections that handle that `EventType`. The attribute `[KeyFromEventProperty()]` defines what property on the event will be used as the read model's key (or id). You can choose the `[KeyFromEventSource]`, `[KeyFromPartitionId]` or a property from the event with `[KeyFromEventProperty(@event => @event.Property)]`.

{{% /tab %}}

{{% tab name="TypeScript" %}}
```typescript
// DishCounter.ts
import { ProjectionContext, projection, on } from '@dolittle/sdk.projections';

import { DishPrepared } from './DishPrepared';

@projection('98f9db66-b6ca-4e5f-9fc3-638626c9ecfa')
export class DishCounter {
    name: string = 'Unknown';
    numberOfTimesPrepared: number = 0;

    @on(DishPrepared, _ => _.keyFromProperty('Dish'))
    on(event: DishPrepared, projectionContext: ProjectionContext) {
        this.name = event.Dish;
        this.numberOfTimesPrepared ++;
    }
}
```
The `@projection()` decorator identifies this Projection in the Runtime, and is used to keep track of the events that it processes, and retrying the handling of an event if the handler fails (throws an exception). If the Projection is changed somehow (eg. a new `@on()` decorator or the `EventType` changes), it will replay all of it's events.

When an event is committed, the method decoratored with `@on()` will be called for all the Projections that handle that `EventType`. The second parameter in the `@on` decorator is a callback function, that defines what property on the event will be used as the read model's key (or id). You can choose either `_ => _.keyFromEventSource()`, `_ => _.keyFromPartitionId()` or a property from the event with `_ => _.keyFromProperty('propertyName')`.
{{% /tab %}}
{{< /tabs >}}

## Register and get the  `DishCounter` Projection
Let's register the projection, commit new `DishPrepared` events and get the projection to see how it reacted.

{{< tabs name="client_tab" >}}
{{% tab name="C#" %}}
```csharp
// Program.cs
using System;
using System.Threading.Tasks;
using Dolittle.SDK;
using Dolittle.SDK.Tenancy;
using Microsoft.Extensions.Hosting;

var host = Host.CreateDefaultBuilder()
    .UseDolittle()
    .Build();
await host.StartAsync();

var client = await host.GetDolittleClient();
var eventStore = client.EventStore.ForTenant(TenantId.Development);
await eventStore.CommitEvent(new DishPrepared("Bean Blaster Taco", "Mr. Taco"), "Dolittle Tacos");
await eventStore.CommitEvent(new DishPrepared("Bean Blaster Taco", "Mrs. Tex Mex"), "Dolittle Tacos");
await eventStore.CommitEvent(new DishPrepared("Avocado Artillery Tortilla", "Mr. Taco"), "Dolittle Tacos");
await eventStore.CommitEvent(new DishPrepared("Chili Canon Wrap", "Mrs. Tex Mex"), "Dolittle Tacos");

await Task.Delay(TimeSpan.FromSeconds(1)).ConfigureAwait(false);

var dishes = await client.Projections
    .ForTenant(TenantId.Development)
    .GetAll<DishCounter>().ConfigureAwait(false);

foreach (var dish in dishes)
{
    Console.WriteLine($"The kitchen has prepared {dish.Name} {dish.NumberOfTimesPrepared} times");
}

await host.WaitForShutdownAsync();
```

The `GetAll<DishCounter>()` method returns all read models of that Projection as an `IEnumerable<DishCounter>`.

The string given in `FromEventSource()` is the [`EventSourceId`]({{< ref "docs/concepts/events#eventsourceid" >}}), which is used to identify where the events come from.

{{% /tab %}}

{{% tab name="TypeScript" %}}
```typescript
// index.ts
import { DolittleClient } from '@dolittle/sdk';
import { TenantId } from '@dolittle/sdk.execution';
import { setTimeout } from 'timers/promises';

import { DishCounter } from './DishCounter';
import { DishPrepared } from './DishPrepared';

(async () => {
    const client = await DolittleClient
        .setup()
        .connect();

    const eventStore = client.eventStore.forTenant(TenantId.development);

    await eventStore.commit(new DishPrepared('Bean Blaster Taco', 'Mr. Taco'), 'Dolittle Tacos');
    await eventStore.commit(new DishPrepared('Bean Blaster Taco', 'Mrs. Tex Mex'), 'Dolittle Tacos');
    await eventStore.commit(new DishPrepared('Avocado Artillery Tortilla', 'Mr. Taco'), 'Dolittle Tacos');
    await eventStore.commit(new DishPrepared('Chili Canon Wrap', 'Mrs. Tex Mex'), 'Dolittle Tacos');

    await setTimeout(1000);

    for (const { name, numberOfTimesPrepared } of await client.projections.forTenant(TenantId.development).getAll(DishCounter)) {
        client.logger.info(`The kitchen has prepared ${name} ${numberOfTimesPrepared} times`);
    }
})();
```

The `getAll(DishCounter)` method returns all read models for that Projection as an array `DishCounter[]`.

The string given in `commit(event, 'event-source-id')` is the [`EventSourceId`]({{< ref "docs/concepts/events#eventsourceid" >}}), which is used to identify where the events come from.
{{% /tab %}}
{{< /tabs >}}


{{% alert title="Docker on Windows" color="warning" %}}
Docker on Windows using the WSL2 backend can use massive amounts of RAM if not limited. Configuring a limit in the `.wslconfig` file can help greatly, as mentioned in [this issue](https://github.com/microsoft/WSL/issues/4166#issuecomment-526725261). The RAM usage is also lowered if you disable the WSL2 backend in Docker for Desktop settings.
{{% /alert %}}

## Run your microservice
Run your code, and see the different dishes:

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
      Content root path: .../Projections
info: Dolittle.SDK.Events.Processing.EventProcessors[0]
      Projection 98f9db66-b6ca-4e5f-9fc3-638626c9ecfa registered with the Runtime, start handling requests
The kitchen has prepared Bean Blaster Taco 2 times
The kitchen has prepared Avocado Artillery Tortilla 1 times
The kitchen has prepared Chili Canon Wrap 1 times
```

{{% /tab %}}
{{% tab name="TypeScript" %}}
```shell
$ npx ts-node index.ts
info: Projection 98f9db66-b6ca-4e5f-9fc3-638626c9ecfa registered with the Runtime, start handling requests.
info: The kitchen has prepared Bean Blaster Taco 2 times
info: The kitchen has prepared Avocado Artillery Tortilla 1 times
info: The kitchen has prepared Chili Canon Wrap 1 times
```
{{% /tab %}}
{{< /tabs >}}



## Add `Chef` read model

Let's add another read model to keep track of all the chefs and . This time let's only create the class for the read model:

{{< tabs name="chef_tab" >}}
{{% tab name="C#" %}}
```csharp
// Chef.cs
using System.Collections.Generic;

public class Chef
{
    public string Name = "";
    public List<string> Dishes = new();
}
```

{{% /tab %}}

{{% tab name="TypeScript" %}}
```typescript
// Chef.ts
export class Chef {
    constructor(
        public name: string = '',
        public dishes: string[] = []
    ) { }
}
```
{{% /tab %}}
{{< /tabs >}}

## Create and get the inline projection for `Chef` read model
You can also create a Projection inline in the client building steps instead of declaring a class for it.

Let's create an inline Projection for the `Chef` read model:

{{< tabs name="second_client_tab" >}}
{{% tab name="C#" %}}
```csharp
// Program.cs
using System;
using System.Threading.Tasks;
using Dolittle.SDK;
using Dolittle.SDK.Tenancy;
using Microsoft.Extensions.Hosting;

var host = Host.CreateDefaultBuilder()
    .UseDolittle(_ => _ 
        .WithProjections(_ => _
            .Create("0767bc04-bc03-40b8-a0be-5f6c6130f68b")
                .ForReadModel<Chef>()
                .On<DishPrepared>(_ => _.KeyFromProperty(_ => _.Chef), (chef, @event, projectionContext) =>
                {
                    chef.Name = @event.Chef;
                    if (!chef.Dishes.Contains(@event.Dish)) chef.Dishes.Add(@event.Dish);
                    return chef;
                })
        )
    )
    .Build();
await host.StartAsync();

var client = await host.GetDolittleClient();
var eventStore = client.EventStore.ForTenant(TenantId.Development);
await eventStore.CommitEvent(new DishPrepared("Bean Blaster Taco", "Mr. Taco"), "Dolittle Tacos");
await eventStore.CommitEvent(new DishPrepared("Bean Blaster Taco", "Mrs. Tex Mex"), "Dolittle Tacos");
await eventStore.CommitEvent(new DishPrepared("Avocado Artillery Tortilla", "Mr. Taco"), "Dolittle Tacos");
await eventStore.CommitEvent(new DishPrepared("Chili Canon Wrap", "Mrs. Tex Mex"), "Dolittle Tacos");

await Task.Delay(TimeSpan.FromSeconds(1)).ConfigureAwait(false);

var dishes = await client.Projections
    .ForTenant(TenantId.Development)
    .GetAll<DishCounter>().ConfigureAwait(false);

foreach (var dish in dishes)
{
    Console.WriteLine($"The kitchen has prepared {dish.Name} {dish.NumberOfTimesPrepared} times");
}

var chef = await client.Projections
    .ForTenant(TenantId.Development)
    .Get<Chef>("Mrs. Tex Mex").ConfigureAwait(false);
Console.WriteLine($"{chef.Name} has prepared {string.Join(", ", chef.Dishes)}");

await host.WaitForShutdownAsync();
```

The `Get<Chef>('key')` method returns a Projection instance with that particular key. The key is declared by the `KeyFromProperty(_.Chef)` callback function on the `On()` method. In this case, the key of each `Chef` projection instance is based on the chefs name.

{{% /tab %}}

{{% tab name="TypeScript" %}}
```typescript
// index.ts
(async () => {
    const client = await DolittleClient
        .setup(builder => builder
            .withProjections(_ => _
                .create('0767bc04-bc03-40b8-a0be-5f6c6130f68b')
                    .forReadModel(Chef)
                    .on(DishPrepared, _ => _.keyFromProperty('Chef'), (chef, event, projectionContext) => {
                        chef.name = event.Chef;
                        if (!chef.dishes.includes(event.Dish)) chef.dishes.push(event.Dish);
                        return chef;
                    })
            )
        )
        .connect();

    const eventStore = client.eventStore.forTenant(TenantId.development);

    await eventStore.commit(new DishPrepared('Bean Blaster Taco', 'Mr. Taco'), 'Dolittle Tacos');
    await eventStore.commit(new DishPrepared('Bean Blaster Taco', 'Mrs. Tex Mex'), 'Dolittle Tacos');
    await eventStore.commit(new DishPrepared('Avocado Artillery Tortilla', 'Mr. Taco'), 'Dolittle Tacos');
    await eventStore.commit(new DishPrepared('Chili Canon Wrap', 'Mrs. Tex Mex'), 'Dolittle Tacos');

    await setTimeout(1000);

    for (const { name, numberOfTimesPrepared } of await client.projections.forTenant(TenantId.development).getAll(DishCounter)) {
        client.logger.info(`The kitchen has prepared ${name} ${numberOfTimesPrepared} times`);
    }

    const chef = await client.projections.forTenant(TenantId.development).get(Chef, 'Mrs. Tex Mex');
    client.logger.info(`${chef.name} has prepared ${chef.dishes.join(', ')}`);
})();
```

The `get(Chef, 'key')` method returns a Projection instance with that particular key. The key is declared by the `keyFromProperty('Chef')` callback function on the `on()` method. In this case, the key of each `Chef` projection instance is based on the chefs name.
{{% /tab %}}
{{< /tabs >}}

## Run your microservice with the inline `Chef` projection

Run your code, and get a delicious serving of taco:

{{< tabs name="second_run_tab" >}}
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
      Content root path: .../Projections
info: Dolittle.SDK.Events.Processing.EventProcessors[0]
      Projection 0767bc04-bc03-40b8-a0be-5f6c6130f68b registered with the Runtime, start handling requests
info: Dolittle.SDK.Events.Processing.EventProcessors[0]
      Projection 98f9db66-b6ca-4e5f-9fc3-638626c9ecfa registered with the Runtime, start handling requests
The kitchen has prepared Bean Blaster Taco 4 times
The kitchen has prepared Avocado Artillery Tortilla 2 times
The kitchen has prepared Chili Canon Wrap 2 times
Mrs. Tex Mex has prepared Bean Blaster Taco, Chili Canon Wrap

```

{{% /tab %}}
{{% tab name="TypeScript" %}}
```shell
$ npx ts-node index.ts
info: Projection 0767bc04-bc03-40b8-a0be-5f6c6130f68b registered with the Runtime, start handling requests.
info: Projection 98f9db66-b6ca-4e5f-9fc3-638626c9ecfa registered with the Runtime, start handling requests.
info: The kitchen has prepared Bean Blaster Taco 4 times
info: The kitchen has prepared Avocado Artillery Tortilla 2 times
info: The kitchen has prepared Chili Canon Wrap 2 times
info: Mrs. Tex Mex has prepared Bean Blaster Taco,Chili Canon Wrap
```
{{% /tab %}}
{{< /tabs >}}

## What's next

- Learn how to use [Embeddings]({{< ref "embeddings" >}}) to event source changes from an external system.
- Learn how to [deploy your application]({{< ref "docs/platform/deploy_an_application" >}}) into our [Platform]({{< ref "docs/platform" >}}).
