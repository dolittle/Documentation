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
Start the Dolittle environment with all the necessary dependencies (if you didn't have it running already) with the following command:

```shell
$ docker run -p 50053:50053 -p 27017:27017 dolittle/runtime:latest-development
```

This will start a container with the Dolittle Development Runtime on port 50053 and a MongoDB server on port 27017.
The Runtime handles committing the events and the projections, while the MongoDB is used for persistence.


## Create a `DishCounter` Projection
First, we'll create a [Projection]({{< ref "docs/concepts/projections" >}}) that keeps track of the dishes and how many times the chefs have prepared them. Projections are a special type of event handler that mutate a read model based on incoming events.

{{< tabs name="dishes_counter_tab" >}}
{{% tab name="C#" %}}
```csharp
// DishCounter.cs
using Dolittle.SDK.Projections;

namespace Kitchen
{
    [Projection("98f9db66-b6ca-4e5f-9fc3-638626c9ecfa")]
    public class DishCounter
    {
        public int NumberOfTimesPrepared = 0;

        [KeyFromProperty("Dish")]
        public void On(DishPrepared @event, ProjectionContext context)
        {
            NumberOfTimesPrepared ++;
        }
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
    numberOfTimesPrepared: number = 0;

    @on(DishPrepared, _ => _.keyFromProperty('Dish'))
    dishPrepared(event: DishPrepared, projectionContext: ProjectionContext) {
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

namespace Kitchen
{
    class Program
    {
        public async static Task Main()
        {
            var client = Client
                .ForMicroservice("f39b1f61-d360-4675-b859-53c05c87c0e6")
                .WithEventTypes(eventTypes =>
                    eventTypes.Register<DishPrepared>())
                .WithEventHandlers(builder =>
                    builder.RegisterEventHandler<DishHandler>())
                .WithProjections(builder => 
                    builder.RegisterProjection<DishCounter>())
                .Build();

            var started = client.Start();

            var eventStore = client.EventStore.ForTenant(TenantId.Development);

            await eventStore.Commit(_ =>
                _.CreateEvent(new DishPrepared("Bean Blaster Taco", "Mr. Taco"))
                .FromEventSource("bfe6f6e4-ada2-4344-8a3b-65a3e1fe16e9"))
                .ConfigureAwait(false);
            await eventStore.Commit(_ =>
                _.CreateEvent(new DishPrepared("Bean Blaster Taco", "Mrs. Tex Mex"))
                .FromEventSource("bfe6f6e4-ada2-4344-8a3b-65a3e1fe16e9"))
                .ConfigureAwait(false);
            await eventStore.Commit(_ =>
                _.CreateEvent(new DishPrepared("Avocado Artillery Tortilla", "Mr. Taco"))
                .FromEventSource("bfe6f6e4-ada2-4344-8a3b-65a3e1fe16e9"))
                .ConfigureAwait(false);
            await eventStore.Commit(_ =>
                _.CreateEvent(new DishPrepared("Chili Canon Wrap", "Mrs. Tex Mex"))
                .FromEventSource("bfe6f6e4-ada2-4344-8a3b-65a3e1fe16e9"))
                .ConfigureAwait(false);

            await Task.Delay(TimeSpan.FromSeconds(1)).ConfigureAwait(false);

            var dishes = await client.Projections
                .ForTenant(TenantId.Development)
                .GetAll<DishCounter>().ConfigureAwait(false);

            foreach (var (dish, state) in dishes) {
                 Console.WriteLine($"The kitchen has prepared {dish} {state.State.NumberOfTimesPrepared} times");
            }

            // Blocks until the EventHandlers are finished, i.e. forever
            await started.ConfigureAwait(false);
        }
    }
}
```

The `GetAll<DishCounter>()` method returns all Projections for that particular type. The returned object is a dictionary of each projections' key and that projections' current state.

The GUID given in `FromEventSource()` is the [`EventSourceId`]({{< ref "docs/concepts/events#eventsourceid" >}}), which is used to identify where the events come from.

{{% /tab %}}

{{% tab name="TypeScript" %}}
```typescript
// index.ts
import { Client } from '@dolittle/sdk';
import { TenantId } from '@dolittle/sdk.execution';
import { DishPrepared } from './DishPrepared';
import { DishHandler } from './DishHandler';
import { DishCounter } from './DishCounter';

const client = Client
    .forMicroservice('f39b1f61-d360-4675-b859-53c05c87c0e6')
    .withEventTypes(eventTypes =>
        eventTypes.register(DishPrepared))
    .withEventHandlers(builder =>
        builder.register(DishHandler))
    .withProjections(builder =>
        builder.register(DishCounter))
    .build();

(async () => {
    const eventStore = client.eventStore.forTenant(TenantId.development);

    await eventStore.commit(new DishPrepared('Bean Blaster Taco', 'Mr. Taco'), 'bfe6f6e4-ada2-4344-8a3b-65a3e1fe16e9');
    await eventStore.commit(new DishPrepared('Bean Blaster Taco', 'Mrs. Tex Mex'), 'bfe6f6e4-ada2-4344-8a3b-65a3e1fe16e9');
    await eventStore.commit(new DishPrepared('Avocado Artillery Tortilla', 'Mr. Taco'), 'bfe6f6e4-ada2-4344-8a3b-65a3e1fe16e9');
    await eventStore.commit(new DishPrepared('Chili Canon Wrap', 'Mrs. Tex Mex'), 'bfe6f6e4-ada2-4344-8a3b-65a3e1fe16e9');

    setTimeout(async () => {
        for (const [dish, { state: counter }] of await client.projections.forTenant(TenantId.development).getAll(DishCounter)) {
            console.log(`The kitchen has prepared ${dish} ${counter.numberOfTimesPrepared} times`);
        }
    }, 1000);
})();
```

The `getAll(DishCounter)` method returns all Projections for that particular type. The returned object is a map of each projections' key and that projections' current state.

The GUID given in `commit(event, 'event-source-id')` is the [`EventSourceId`]({{< ref "docs/concepts/events#eventsourceid" >}}), which is used to identify where the events come from.
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
Mr. Taco has prepared Bean Blaster Taco. Yummm!
Mrs. Tex Mex has prepared Bean Blaster Taco. Yummm!
Mr. Taco has prepared Avocado Artillery Tortilla. Yummm!
Mrs. Tex Mex has prepared Chili Canon Wrap. Yummm!
The kitchen has prepared Bean Blaster Taco 6 times
The kitchen has prepared Avocado Artillery Tortilla 2 times
The kitchen has prepared Chili Canon Wrap 2 times
```

{{% /tab %}}
{{% tab name="TypeScript" %}}
```shell
$ npx ts-node index.ts
Mr. Taco has prepared Bean Blaster Taco. Yummm!
Mrs. Tex Mex has prepared Bean Blaster Taco. Yummm!
Mr. Taco has prepared Avocado Artillery Tortilla. Yummm!
Mrs. Tex Mex has prepared Chili Canon Wrap. Yummm!
The kitchen has prepared Bean Blaster Taco 6 times
The kitchen has prepared Avocado Artillery Tortilla 2 times
The kitchen has prepared Chili Canon Wrap 2 times
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

namespace Kitchen
{
    public class Chef
    {
        public string Name = "";
        public List<string> Dishes = new List<string>();
    }
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

namespace Kitchen
{
    class Program
    {
        public async static Task Main()
        {
            var client = Client
                .ForMicroservice("f39b1f61-d360-4675-b859-53c05c87c0e6")
                .WithEventTypes(eventTypes =>
                    eventTypes.Register<DishPrepared>())
                .WithEventHandlers(builder =>
                    builder.RegisterEventHandler<DishHandler>())
                .WithProjections(builder => {
                    builder.RegisterProjection<DishCounter>();

                    builder.CreateProjection("0767bc04-bc03-40b8-a0be-5f6c6130f68b")
                        .ForReadModel<Chef>()
                        .On<DishPrepared>(_ => _.KeyFromProperty(_ => _.Chef), (chef, @event, projectionContext) => {
                            chef.Name = @event.Chef;
                            if (!chef.Dishes.Contains(@event.Dish)) chef.Dishes.Add(@event.Dish);
                            return chef;
                        });
                })
                .Build();

            var started = client.Start();

            var eventStore = client.EventStore.ForTenant(TenantId.Development);

            await eventStore.Commit(_ =>
                _.CreateEvent(new DishPrepared("Bean Blaster Taco", "Mr. Taco"))
                .FromEventSource("bfe6f6e4-ada2-4344-8a3b-65a3e1fe16e9"))
                .ConfigureAwait(false);
            await eventStore.Commit(_ =>
                _.CreateEvent(new DishPrepared("Bean Blaster Taco", "Mrs. Tex Mex"))
                .FromEventSource("bfe6f6e4-ada2-4344-8a3b-65a3e1fe16e9"))
                .ConfigureAwait(false);
            await eventStore.Commit(_ =>
                _.CreateEvent(new DishPrepared("Avocado Artillery Tortilla", "Mr. Taco"))
                .FromEventSource("bfe6f6e4-ada2-4344-8a3b-65a3e1fe16e9"))
                .ConfigureAwait(false);
            await eventStore.Commit(_ =>
                _.CreateEvent(new DishPrepared("Chili Canon Wrap", "Mrs. Tex Mex"))
                .FromEventSource("bfe6f6e4-ada2-4344-8a3b-65a3e1fe16e9"))
                .ConfigureAwait(false);

            await Task.Delay(TimeSpan.FromSeconds(1)).ConfigureAwait(false);

            var dishes = await client.Projections
                .ForTenant(TenantId.Development)
                .GetAll<DishCounter>().ConfigureAwait(false);

            foreach (var (dish, state) in dishes) {
                 Console.WriteLine($"The kitchen has prepared {dish} {state.State.NumberOfTimesPrepared} times");
            }

            var chef = await client.Projections
                .ForTenant(TenantId.Development)
                .Get<Chef>("Mrs. Tex Mex").ConfigureAwait(false);
            Console.WriteLine($"{chef.Key} has prepared {string.Join(", ", chef.State.Dishes)}");

            // Blocks until the EventHandlers are finished, i.e. forever
            await started.ConfigureAwait(false);
        }
    }
}
```

The `Get<Chef>('key')` method returns a Projection instance with that particular key. The key is declared by the `KeyFromProperty(_.Chef)` callback function on the `On()` method. In this case, the id of each `Chef` projection instance is based on the chefs name.

{{% /tab %}}

{{% tab name="TypeScript" %}}
```typescript
// index.ts
import { Client } from '@dolittle/sdk';
import { TenantId } from '@dolittle/sdk.execution';
import { DishPrepared } from './DishPrepared';
import { DishHandler } from './DishHandler';
import { DishCounter } from './DishCounter';
import { Chef } from './Chef';

const client = Client
    .forMicroservice('f39b1f61-d360-4675-b859-53c05c87c0e6')
    .withEventTypes(eventTypes =>
        eventTypes.register(DishPrepared))
    .withEventHandlers(builder =>
        builder.register(DishHandler))
    .withProjections(builder => {
        builder.register(DishCounter);

        builder.createProjection('0767bc04-bc03-40b8-a0be-5f6c6130f68b')
            .forReadModel(Chef)
            .on(DishPrepared, _ => _.keyFromProperty('Chef'), (chef, event, projectionContext) => {
                chef.name = event.Chef;
                if (!chef.dishes.includes(event.Dish)) chef.dishes.push(event.Dish);
                return chef;
            });
    })
    .build();

(async () => {
    const eventStore = client.eventStore.forTenant(TenantId.development);

    await eventStore.commit(new DishPrepared('Bean Blaster Taco', 'Mr. Taco'), 'bfe6f6e4-ada2-4344-8a3b-65a3e1fe16e9');
    await eventStore.commit(new DishPrepared('Bean Blaster Taco', 'Mrs. Tex Mex'),'bfe6f6e4-ada2-4344-8a3b-65a3e1fe16e9');
    await eventStore.commit(new DishPrepared('Avocado Artillery Tortilla', 'Mr. Taco'), 'bfe6f6e4-ada2-4344-8a3b-65a3e1fe16e9');
    await eventStore.commit(new DishPrepared('Chili Canon Wrap', 'Mrs. Tex Mex'), 'bfe6f6e4-ada2-4344-8a3b-65a3e1fe16e9');

    setTimeout(async () => {
        for (const [dish, { state: counter }] of await client.projections.forTenant(TenantId.development).getAll(DishCounter)) {
            console.log(`The kitchen has prepared ${dish} ${counter.numberOfTimesPrepared} times`);
        }

        const chef = await client.projections.forTenant(TenantId.development).get<Chef>(Chef, 'Mrs. Tex Mex');
        console.log(`${chef.key} has prepared ${chef.state.dishes}`);
    }, 1000);
})();
```

The `get<Chef>(Chef, 'key')` method returns a Projection instance with that particular key. The key is declared by the `keyFromProperty('Chef')` callback function on the `on()` method. In this case, the id of each `Chef` projection instance is based on the chefs name.
{{% /tab %}}
{{< /tabs >}}

## Run your microservice with the inline `Chef` projection

Run your code, and get a delicious serving of taco:

{{< tabs name="second_run_tab" >}}
{{% tab name="C#" %}}
```shell
$ dotnet run
Mr. Taco has prepared Bean Blaster Taco. Yummm!
Mrs. Tex Mex has prepared Bean Blaster Taco. Yummm!
Mr. Taco has prepared Avocado Artillery Tortilla. Yummm!
Mrs. Tex Mex has prepared Chili Canon Wrap. Yummm!
The kitchen has prepared Bean Blaster Taco 6 times
The kitchen has prepared Avocado Artillery Tortilla 2 times
The kitchen has prepared Chili Canon Wrap 2 times
Mrs. Tex Mex has prepared Bean Blaster Taco,Chili Canon Wrap
```

{{% /tab %}}
{{% tab name="TypeScript" %}}
```shell
$ npx ts-node index.ts
Mr. Taco has prepared Bean Blaster Taco. Yummm!
Mrs. Tex Mex has prepared Bean Blaster Taco. Yummm!
Mr. Taco has prepared Avocado Artillery Tortilla. Yummm!
Mrs. Tex Mex has prepared Chili Canon Wrap. Yummm!
The kitchen has prepared Bean Blaster Taco 6 times
The kitchen has prepared Avocado Artillery Tortilla 2 times
The kitchen has prepared Chili Canon Wrap 2 times
Mrs. Tex Mex has prepared Bean Blaster Taco,Chili Canon Wrap
```
{{% /tab %}}
{{< /tabs >}}

## What's next

- Learn how to use [Embeddings]({{< ref "embeddings" >}}) to event source changes from an external system.
- Learn how to [deploy your application]({{< ref "docs/platform/deploy_an_application" >}}) into our [Platform]({{< ref "docs/platform" >}}).
