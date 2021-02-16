---
title: Aggregates
description: Get started with Aggregates
keywords: Learning, Quickstart, setup, prerequisites, how to, guide, walkthrough, csharp, c#, dotnet, .NET, typescript, javascript
author: joel, jakob, sindre
weight: 1
aliases:
- /docs/tutorials/csharp/aggregates
- /docs/tutorials/typescript/aggregates
- /docs/tutorials/aggregates
---

Welcome to the tutorial for Dolittle, where you learn how to write a [Microservice]({{< ref "docs/concepts/overview#microservice" >}}) that keeps track of foods prepared by the chefs.

After this tutorial you will have:

* a running Dolittle environment with a [Runtime]({{< ref "docs/concepts/overview" >}}) and a MongoDB,
* a [Microservice]({{< ref "docs/concepts/overview#microservice" >}}) that commits and handles [Events]({{< ref "docs/concepts/events" >}}) and
* a stateful aggregate root that applies events and is controlled by an invariant

Use the tabs to switch between the [C#](https://github.com/dolittle/dotnet.sdk) and [TypeScript](https://github.com/dolittle/javaScript.SDK/) code examples. Full tutorial code available on GitHub for [C#](https://github.com/dolittle/DotNET.SDK/tree/master/Samples/Aggregates) and [TypeScript](https://github.com/dolittle/JavaScript.SDK/tree/master/Samples/Aggregates).

### Pre requisites
<!-- Use the % signs if you need to render the stuff inside as markdown -->
<!-- check https://kubernetes.io/docs/contribute/style/hugo-shortcodes/#tabs -->

This tutorial builds directly upon and that you have gone through our [getting started]({{< ref "docs/tutorials/getting_started" >}}) guide; done the setup, created the EventType, EventHandler and connected the client

### Create an `AggregateRoot`
An [`aggregate root`]({{< ref "docs/concepts/aggregates" >}}) is a class that upholds the rules (invariants) for the aggregates of that aggregate root. It encapsulates the domain objects, enforces business rules, and ensures that the aggregate can't be put into an invalid state. The aggregate root usually exposes methods that creates and applies an event.

There are essentially two types of aggregate roots, stateless and stateful. The aggregate root in this example is stateful because it tracks a value called _counter that is used to control the invariant that no more than two dishes can be prepared. Stateful aggregate roots have On() methods that takes in a single parameter, an event type. Each time an event of that type is applied to this aggregate root the On method will be called. It is important that the On methods only updates the internal state of the aggregate root!

{{< tabs name="aggregate_root_tab" >}}
{{% tab name="C#" %}}
```csharp
// Kitchen.cs

using System;
using Dolittle.SDK.Aggregates;
using Dolittle.SDK.Events;

namespace Kitchen
{
    [AggregateRoot("01ad9a9f-711f-47a8-8549-43320f782a1e")]
    public class Kitchen : AggregateRoot
    {
        int _counter;

        public Kitchen(EventSourceId eventSource)
            : base(eventSource)
        {
        }

        public void PrepareDish(string dish, string chef)
        {
            if (_counter >= 2) throw new Exception("Cannot prepare more than 2 dishes");
            Apply(new DishPrepared(dish, chef));
            Console.WriteLine($"Kitchen Aggregate {EventSourceId} has applied {_counter} {typeof(DishPrepared)} events");
        }

        void On(DishPrepared @event)
            => _counter++;
    }
}
```
The GUID given in the `[AggregateRoot()]` attribute is the [`AggregateRootId`]({{< ref "docs/concepts/aggregates/#aggregaterootid" >}}), which is used to identify this `AggregateRoot` in the Runtime.
{{% /tab %}}

{{% tab name="TypeScript" %}}
```typescript
// Kitchen.ts
import { aggregateRoot, AggregateRoot, on } from '@dolittle/sdk.aggregates';
import { EventSourceId } from '@dolittle/sdk.events';
import { DishPrepared } from './DishPrepared';

@aggregateRoot('01ad9a9f-711f-47a8-8549-43320f782a1e')
export class Kitchen extends AggregateRoot {
    private _counter: number = 0;

    constructor(eventSourceId: EventSourceId) {
        super(eventSourceId);
    }

    prepareDish(dish: string, chef: string) {
        if (this._counter >= 2) throw new Error("Cannot prepare more than 2 dishes");
        this.apply(new DishPrepared(dish, chef));
        console.log(`Kitchen Aggregate ${this.eventSourceId} has applied ${this._counter} ${DishPrepared.name} events`);
    }


    @on(DishPrepared)
    onDishPrepared(event: DishPrepared) {
        this._counter++;
    }
}
```
The GUID given in the `@aggregateRoot()` decorator is the [`AggregateRootId`]({{< ref "docs/concepts/aggregates/#aggregaterootid" >}}), which is used to identify this `AggregateRoot` in the Runtime.
{{% /tab %}}
{{< /tabs >}}

### Apply the event through an aggregate of the Kitchen aggregate root
Let's expand upon the client built in the getting started guide. But instead of committing the event to the event store directly we perform an action on the aggregate that eventually applies and commits the event.

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

            client
                .AggregateOf<Kitchen>("bfe6f6e4-ada2-4344-8a3b-65a3e1fe16e9", _ => _.ForTenant(TenantId.Development))
                .Perform(kitchen => kitchen.PrepareDish("Bean Blaster Taco", "Mr. Taco"));

            // Blocks until the EventHandlers are finished, i.e. forever
            client.Start().Wait();
        }
    }
}
```

The GUID given in `AggregateOf<Kitchen>()` is the [`EventSourceId`]({{< ref "docs/concepts/events#eventsourceid" >}}), which is used to identify the aggregate of the aggregate root to perform the action on.
{{% /tab %}}

{{% tab name="TypeScript" %}}
```typescript
// index.ts
import { Client } from '@dolittle/sdk';
import { TenantId } from '@dolittle/sdk.execution';
import { DishPrepared } from './DishPrepared';
import { DishHandler } from './DishHandler';
import { Kitchen } from './Kitchen';

(async () => {
    const client = Client
        .forMicroservice('f39b1f61-d360-4675-b859-53c05c87c0e6')
        .withEventTypes(eventTypes =>
            eventTypes.register(DishPrepared))
        .withEventHandlers(builder =>
            builder.register(DishHandler))
        .build();

    await client
        .aggregateOf(Kitchen, 'bfe6f6e4-ada2-4344-8a3b-65a3e1fe16e9', _ => _.forTenant(TenantId.development))
        .perform(kitchen => kitchen.prepareDish('Bean Blaster Taco', 'Mr. Taco'));

    console.log('Done');
})();
```

The GUID given in the `aggregateOf()` call is the [`EventSourceId`]({{< ref "docs/concepts/events#eventsourceid" >}}), which is used to identify the aggregate of the aggregate root to perform the action on.
{{% /tab %}}
{{< /tabs >}}

### Start the Dolittle environment
Start the Dolittle environment with all the necessary dependencies with the following command:

```shell
$ docker run -p 50053:50053 -p 27017:27017 dolittle/runtime:latest-development
```

This will start a container with the Dolittle Development Runtime on port 50053 and a MongoDB server on port 27017.
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

## What's next

- Learn how to [deploy your application]({{< ref "docs/platform/deploy_an_application" >}}) into our [Platform]({{< ref "docs/platform" >}}).
