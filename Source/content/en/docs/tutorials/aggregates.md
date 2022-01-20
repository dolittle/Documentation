---
title: Aggregates
description: Get started with Aggregates
keywords: Learning, Quickstart, setup, prerequisites, how to, guide, walkthrough, csharp, c#, dotnet, .NET, typescript, javascript
author: joel, jakob, sindre
weight: 10
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

Use the tabs to switch between the [C#](https://github.com/dolittle/dotnet.sdk) and [TypeScript](https://github.com/dolittle/javaScript.SDK/) code examples. Full tutorial code available on GitHub for [C#](https://github.com/dolittle/DotNET.SDK/tree/master/Samples/Tutorials/Aggregates) and [TypeScript](https://github.com/dolittle/JavaScript.SDK/tree/master/Samples/Tutorials/Aggregates).

### Pre requisites
<!-- Use the % signs if you need to render the stuff inside as markdown -->
<!-- check https://kubernetes.io/docs/contribute/style/hugo-shortcodes/#tabs -->

This tutorial builds directly upon and that you have gone through our [getting started]({{< ref "docs/tutorials/getting_started" >}}) guide; done the setup, created the EventType, EventHandler and connected the client

### Create an `AggregateRoot`
An [`aggregate root`]({{< ref "docs/concepts/aggregates" >}}) is a class that upholds the rules (invariants) in your domain.
An aggregate root is responsible for deciding which events should be committed.
It exposes public methods that represents actions to be performed, and holds internal state to decide if the action is allowed.

Before one of the public methods is called, the internal state is _rehydrated_ by calling the On-methods for all the events the aggregate root has already applied.
These On-methods updates the internal state of the aggregate root, and __must not__ have any other side-effects.
When a public action method is executed, it can use this internal state decide either to apply events to be committed, or throw an error if the action is not allowed.


The following code implements an aggregate root for a Kitchen that only has enough ingredients to prepare two dishes:

{{< tabs name="aggregate_root_tab" >}}
{{% tab name="C#" %}}
```csharp
// Kitchen.cs
using System;
using Dolittle.SDK.Aggregates;
using Dolittle.SDK.Events;

[AggregateRoot("01ad9a9f-711f-47a8-8549-43320f782a1e")]
public class Kitchen : AggregateRoot
{
    int _ingredients = 2;

    public Kitchen(EventSourceId eventSource)
        : base(eventSource)
    {
    }

    public void PrepareDish(string dish, string chef)
    {
        if (_ingredients <= 0) throw new Exception("We have run out of ingredients, sorry!");
        Apply(new DishPrepared(dish, chef));
        Console.WriteLine($"Kitchen {EventSourceId} prepared a {dish}, there are {_ingredients} ingredients left.");
    }

    void On(DishPrepared @event)
        => _ingredients--;
}
```
The GUID given in the `[AggregateRoot()]` attribute is the [`AggregateRootId`]({{< ref "docs/concepts/aggregates#structure-of-an-aggregateroot" >}}), which is used to identify this `AggregateRoot` in the Runtime.
{{% /tab %}}

{{% tab name="TypeScript" %}}
```typescript
// Kitchen.ts
import { aggregateRoot, AggregateRoot, on } from '@dolittle/sdk.aggregates';
import { EventSourceId } from '@dolittle/sdk.events';

import { DishPrepared } from './DishPrepared';

@aggregateRoot('01ad9a9f-711f-47a8-8549-43320f782a1e')
export class Kitchen extends AggregateRoot {
    private _ingredients: number = 2;

    constructor(eventSourceId: EventSourceId) {
        super(eventSourceId);
    }

    prepareDish(dish: string, chef: string) {
        if (this._ingredients <= 0) throw new Error('We have run out of ingredients, sorry!');
        this.apply(new DishPrepared(dish, chef));
        console.log(`Kitchen ${this.eventSourceId} prepared a ${dish}, there are ${this._ingredients} ingredients left.`);
    }

    @on(DishPrepared)
    onDishPrepared(event: DishPrepared) {
        this._ingredients--;
    }
}
```
The GUID given in the `@aggregateRoot()` decorator is the [`AggregateRootId`]({{< ref "docs/concepts/aggregates#structure-of-an-aggregateroot" >}}), which is used to identify this `AggregateRoot` in the Runtime.
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
using Microsoft.Extensions.Hosting;

var host = Host.CreateDefaultBuilder()
    .UseDolittle()
    .Build();

await host.StartAsync();

var client = await host.GetDolittleClient();

await client.Aggregates
    .ForTenant(TenantId.Development)
    .Get<Kitchen>("Dolittle Tacos")
    .Perform(kitchen => kitchen.PrepareDish("Bean Blaster Taco", "Mr. Taco"));

await host.WaitForShutdownAsync();
```

The string given in `AggregateOf<Kitchen>()` is the [`EventSourceId`]({{< ref "docs/concepts/events#eventsourceid" >}}), which is used to identify the aggregate of the aggregate root to perform the action on.

Note that we also register the aggregate root class on the client builder using `.WithAggregateRoots(...)`.
{{% /tab %}}

{{% tab name="TypeScript" %}}
```typescript
// index.ts
import { DolittleClient } from '@dolittle/sdk';
import { TenantId } from '@dolittle/sdk.execution';

import  './DishHandler';
import { Kitchen } from './Kitchen';

(async () => {
    const client = await DolittleClient
        .setup()
        .connect();

    await client.aggregates
        .forTenant(TenantId.development)
        .get(Kitchen, 'Dolittle Tacos')
        .perform(kitchen => kitchen.prepareDish('Bean Blaster Taco', 'Mr. Taco'));
})();
```

The string given in the `aggregateOf()` call is the [`EventSourceId`]({{< ref "docs/concepts/events#eventsourceid" >}}), which is used to identify the aggregate of the aggregate root to perform the action on.

Note that we also register the aggregate root class on the client builder using `.withAggregateRoots(...)`.
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

### Run your microservice
Run your code twice, and get a two delicious servings of taco:

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
      Content root path: .../Aggregates
info: Dolittle.SDK.Events.Processing.EventProcessors[0]
      EventHandler f2d366cf-c00a-4479-acc4-851e04b6fbba registered with the Runtime, start handling requests
Kitchen Dolittle Tacos prepared a Bean Blaster Taco, there are 1 ingredients left.
info: DishHandler[0]
      Mr. Taco has prepared Bean Blaster Taco. Yummm!


$ dotnet run
info: Dolittle.SDK.DolittleClientService[0]
      Connecting Dolittle Client
info: Microsoft.Hosting.Lifetime[0]
      Application started. Press Ctrl+C to shut down.
info: Microsoft.Hosting.Lifetime[0]
      Hosting environment: Production
info: Microsoft.Hosting.Lifetime[0]
      Content root path: .../Aggregates
info: Dolittle.SDK.Events.Processing.EventProcessors[0]
      EventHandler f2d366cf-c00a-4479-acc4-851e04b6fbba registered with the Runtime, start handling requests
Kitchen Dolittle Tacos prepared a Bean Blaster Taco, there are 0 ingredients left.
info: DishHandler[0]
      Mr. Taco has prepared Bean Blaster Taco. Yummm!

```

{{% /tab %}}
{{% tab name="TypeScript" %}}
```shell
$ npx ts-node index.ts
info: EventHandler f2d366cf-c00a-4479-acc4-851e04b6fbba registered with the Runtime, start handling requests.
Kitchen Dolittle Tacos prepared a Bean Blaster Taco, there are 1 ingredients left.
info: Mr. Taco has prepared Bean Blaster Taco. Yummm!

$ npx ts-node index.ts
info: EventHandler f2d366cf-c00a-4479-acc4-851e04b6fbba registered with the Runtime, start handling requests.
Kitchen Dolittle Tacos prepared a Bean Blaster Taco, there are 0 ingredients left.
info: Mr. Taco has prepared Bean Blaster Taco. Yummm!
```
{{% /tab %}}
{{< /tabs >}}


### Check the status of your Kitchen aggregate root
Open a new terminal for the [Dolittle CLI]({{< ref "docs/reference/cli" >}}) and run the following commands:

```shell
$ dolittle runtime aggregates list
AggregateRoot  Instances
------------------------
Kitchen        1

$ dolittle runtime aggregates get Kitchen --wide
Tenant                                EventSource     AggregateRootVersion
--------------------------------------------------------------------------
445f8ea8-1a6f-40d7-b2fc-796dba92dc44  Dolittle Tacos  2

$ dolittle runtime aggregates events Kitchen "Dolittle Tacos" --wide
AggregateRootVersion  EventLogSequenceNumber  EventType     Public  Occurred                  
----------------------------------------------------------------------------------------------
0                     0                       DishPrepared  False   11/04/2021 14:04:19 +00:00
1                     1                       DishPrepared  False   11/04/2021 14:04:37 +00:00
```

### Try to prepare a dish without any ingredients
Since we have already used up all the available ingredients, the Kitchen aggregate root should not allow us to prepare any more dishes.
Run your code a third time, and you will see that the exception gets thrown from the aggregate root.

{{< tabs name="run_fail_tab" >}}
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
      Content root path: .../Aggregates
info: Dolittle.SDK.Events.Processing.EventProcessors[0]
      EventHandler f2d366cf-c00a-4479-acc4-851e04b6fbba registered with the Runtime, start handling requests
Unhandled exception. System.Exception: We have run out of ingredients, sorry!
... stack trace ...
```
{{% /tab %}}
{{% tab name="TypeScript" %}}
```shell
$ npx ts-node index.ts
info: EventHandler f2d366cf-c00a-4479-acc4-851e04b6fbba registered with the Runtime, start handling requests.

.../Kitchen.ts:20
        if (this._ingredients <= 0) throw new Error('We have run out of ingredients, sorry!');
                                          ^
Error: We have run out of ingredients, sorry!
... stack trace ...
```
{{% /tab %}}
{{< /tabs >}}

You can verify that the Kitchen did not allow a third dish to be prepared, by checking the committed events:
```shell
$ dolittle runtime aggregates events Kitchen "Dolittle Tacos" --wide
AggregateRootVersion  EventLogSequenceNumber  EventType     Public  Occurred                  
----------------------------------------------------------------------------------------------
0                     0                       DishPrepared  False   11/04/2021 14:04:19 +00:00
1                     1                       DishPrepared  False   11/04/2021 14:04:37 +00:00
```

### Events from aggregate roots are just normal events
The events applied (committed) from aggregate roots are handled the same way as events committed directly to the event store.
You can verify this by checking the status of the DishHandler:

```shell
$ dolittle runtime eventhandlers get DishHandler
Tenant                                Position  Status
------------------------------------------------------
445f8ea8-1a6f-40d7-b2fc-796dba92dc44  2         ✅  
```

{{< alert title="Committing events outside of an aggregate root" color="warning" >}}
If you went through the getting started tutorial and this tutorial without stopping the Dolittle environment in between, the last command will show that the DishHandler has handled 3 events - even though the Kitchen can only prepare two dishes.
This is fine, and expected behavior.
Events committed outside of the Kitchen aggregate root (even if they are the same type), does not update the internal state.
{{< /alert >}}

## What's next

- Learn how to use [Projections]({{< ref "projections" >}}) to create read models.
- Learn how to [deploy your application]({{< ref "docs/platform/deploy_an_application" >}}) into our [Platform]({{< ref "docs/platform" >}}).
