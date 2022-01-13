---
title: Event Horizon
description: Get started with the Event Horizon
keywords: Learning, Quickstart, setup, prerequisites, how to, guide, walkthrough, csharp, c#, dotnet, .NET, typescript, javascript
author: joel, jakob, sindre
weight: 20
aliases:
- /docs/tutorials/csharp/event-horizon
- /docs/tutorials/typescript/event-horizon
- /docs/tutorials/event-horizon
---

Welcome to the tutorial for [Event Horizon]({{< ref "docs/concepts/event_horizon">}}), where you learn how to write a [Microservice]({{< ref "docs/concepts/overview#microservice" >}}) that produces public events of dishes prepared by chefs, and another microservice consumes those events.

After this tutorial you will have:

* a running Dolittle environment with two [Runtimes]({{< ref "docs/concepts/overview" >}}) and a MongoDB,
* a [Producer]({{< ref "docs/concepts/event_horizon#producer" >}}) Microservice that commits and handles a [Public Event]({{< ref "docs/concepts/events#public-vs-private" >}}) and filters it into a [Public Stream]({{< ref "docs/concepts/streams#publicvs-private-streams" >}}) and
* a [Consumer]({{< ref "docs/concepts/event_horizon#consumer" >}}) Microservice that [Subscribes]({{< ref "docs/concepts/event_horizon#subscription" >}}) to the consumers public stream over the [Event Horizon]({{< ref "docs/concepts/event_horizon" >}}) and processes those public events

Use the tabs to switch between the [C#](https://github.com/dolittle/dotnet.sdk) and [TypeScript](https://github.com/dolittle/javaScript.SDK/) code examples. Full tutorial code available on GitHub for [C#](https://github.com/dolittle/DotNET.SDK/tree/master/Samples/Tutorials/EventHorizon) and [TypeScript](https://github.com/dolittle/JavaScript.SDK/tree/master/Samples/Tutorials/EventHorizon).

### Prerequisites
<!-- Use the % signs if you need to render the stuff inside as markdown -->
<!-- check https://kubernetes.io/docs/contribute/style/hugo-shortcodes/#tabs -->

This tutorial builds directly upon the [getting started]({{< ref "docs/tutorials/getting_started" >}}) guide and the files from the it.

{{< tabs name="setup_tab" >}}
{{% tab name="C#" %}}

Prerequisites:
* [.NET Core SDK](https://dotnet.microsoft.com/download)
* [Docker](https://www.docker.com/products/docker-desktop)
* [Docker Compose](https://docs.docker.com/compose/install/)

{{% /tab %}}

{{% tab name="TypeScript" %}}

Prerequisites:
* [Node.js >= 12](https://nodejs.org/en/download/)
* [Docker](https://www.docker.com/products/docker-desktop)
* [Docker Compose](https://docs.docker.com/compose/install/)

{{% /tab %}}
{{< /tabs >}}

### Setup
This tutorial will have a setup with two microservices; one that produces public events, and a consumer that subscribes to those public events. Let's make a folder structure that resembles that:

    └── event-horizon-tutorial/
        ├── consumer/
        ├── producer/
        └── environment/
            └── docker-compose.yml

Go into both the *consumer* and the *producer* folders and initiate the project as we've gone through in our [getting started]({{< ref "docs/tutorials/getting_started" >}}) guide. I.e copy over all the code from the getting started tutorial to the *consumer* and *producer* folders. You can choose different languages for the microservices if you want to.

We'll come back to the docker-compose [later]({{< ref "#setup-your-environment" >}}) in this tutorial.

## Producer
### Create a `Public Filter`
A [`public filter`]({{< ref "docs/concepts/event_handlers_and_filters#public-filters" >}}) filters all public events that pass the filter into a [`public stream`]({{< ref "docs/concepts/streams" >}}), which is special stream that another microservice can [subscribe]({{< ref "docs/concepts/event_horizon#subscription" >}}) to.

A public filter is defined as a method that returns a partitioned filter result, which is an object with two properties:
- a boolean that says whether the event should be included in the public stream
- a partition id which is the [partition]({{< ref "docs/concepts/streams#partitions" >}}) that the event should belong to in the public stream.

Only public events get filtered through the public filters.  

{{< tabs name="public-filter-tab" >}}
{{% tab name="C#" %}}
```csharp
// Program.cs
using System;
using System.Threading.Tasks;
using Dolittle.SDK;
using Dolittle.SDK.Tenancy;
using Dolittle.SDK.Events;
using Dolittle.SDK.Events.Filters;

namespace Kitchen
{
    class Program
    {
        public static void Main()
        {
            var client = DolittleClient
                .ForMicroservice("f39b1f61-d360-4675-b859-53c05c87c0e6")
                .WithEventTypes(eventTypes =>
                    eventTypes.Register<DishPrepared>())
                .WithEventHandlers(builder =>
                    builder.RegisterEventHandler<DishHandler>())
                .WithFilters(filtersBuilder =>
                    filtersBuilder
                        .CreatePublicFilter("2c087657-b318-40b1-ae92-a400de44e507", filterBuilder =>
                            filterBuilder.Handle((@event, eventContext) =>
                            {
                                Console.WriteLine($"Filtering event {@event} to public stream");
                                return Task.FromResult(new PartitionedFilterResult(true, PartitionId.Unspecified));
                            })))
                .Build();
            // Rest of your code here...
        }
    }
}
```
{{% /tab %}}

{{% tab name="TypeScript" %}}
```typescript
// index.ts
import { DolittleClient } from '@dolittle/sdk';
import { EventContext } from '@dolittle/sdk.events';
import { PartitionedFilterResult } from '@dolittle/sdk.events.filtering';
import { TenantId } from '@dolittle/sdk.execution';

import './DishHandler';
import { DishPrepared } from './DishPrepared';

(async () => {
    const client = await DolittleClient
        .setup(_ => _
            .withFilters(_ => _
                .createPublic('2c087657-b318-40b1-ae92-a400de44e507')
                    .handle((event: any, context: EventContext) => {
                        client.logger.info(`Filtering event ${JSON.stringify(event)} to public stream`);
                        return new PartitionedFilterResult(true, 'Dolittle Tacos');
                    })
            )
        )
        .connect();
})();
```
{{% /tab %}}
{{< /tabs >}}

Notice that the returned PartitionedFilterResult has `true` and an *unspecified* PartitionId (which is the same as an empty GUID). This means that this filter creates a public stream that includes all public events, and that they are put into the *unspecified* partition of that stream.

### Commit the public event
Now that we have a public stream we can commit public events to start filtering them. Let's commit a *DishPrepared* event as a public event from the producer microservice:

{{< tabs name="commit_public_tab" >}}
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
            // Where you build the client...

            var preparedTaco = new DishPrepared("Bean Blaster Taco", "Mr. Taco");

            client.EventStore
                .ForTenant(TenantId.Development)
                .CommitPublicEvent(preparedTaco, "bfe6f6e4-ada2-4344-8a3b-65a3e1fe16e9")
                .GetAwaiter().GetResult();

            // Blocks until the EventHandlers are finished, i.e. forever
            client.Start().Wait();
        }
    }
}
```
{{% /tab %}}

{{% tab name="TypeScript" %}}
```typescript
// index.ts
import { DolittleClient } from '@dolittle/sdk';
import { EventContext } from '@dolittle/sdk.events';
import { PartitionedFilterResult } from '@dolittle/sdk.events.filtering';
import { TenantId } from '@dolittle/sdk.execution';

import './DishHandler';
import { DishPrepared } from './DishPrepared';

(async () => {
    const client = await DolittleClient
        .setup(_ => _
            .withFilters(_ => _
                .createPublic('2c087657-b318-40b1-ae92-a400de44e507')
                    .handle((event: any, context: EventContext) => {
                        client.logger.info(`Filtering event ${JSON.stringify(event)} to public stream`);
                        return new PartitionedFilterResult(true, 'Dolittle Tacos');
                    })
            )
        )
        .connect();

    const preparedTaco = new DishPrepared('Bean Blaster Taco', 'Mr. Taco');

    await client.eventStore
        .forTenant(TenantId.development)
        .commitPublic(preparedTaco, 'Dolittle Tacos');
})();
```
{{% /tab %}}
{{< /tabs >}}

Now we have a producer microservice with a public stream of `DishPrepared` events.

## Consumer
### Subscribe to the public stream of events
Let's create another microservice that [subscribes]({{< ref "docs/concepts/event_horizon#subscription" >}}) to the producer's public stream.

{{< tabs name="event-horizon-subscription-tab" >}}
{{% tab name="C#" %}}
```csharp
// Program.cs
using System;
using Dolittle.SDK;
using Dolittle.SDK.Tenancy;
using Dolittle.SDK.Events;

namespace Kitchen
{
    class Program
    {
        public static void Main()
        {
            var client = DolittleClient.ForMicroservice("a14bb24e-51f3-4d83-9eba-44c4cffe6bb9")
                .WithRuntimeOn("localhost", 50055)
                .WithEventTypes(eventTypes =>
                    eventTypes.Register<DishPrepared>())
                .WithEventHorizons(eventHorizons =>
                    eventHorizons.ForTenant(TenantId.Development, subscriptions =>
                        subscriptions
                            .FromProducerMicroservice("f39b1f61-d360-4675-b859-53c05c87c0e6")
                            .FromProducerTenant(TenantId.Development)
                            .FromProducerStream("2c087657-b318-40b1-ae92-a400de44e507")
                            .FromProducerPartition(PartitionId.Unspecified)
                            .ToScope("808ddde4-c937-4f5c-9dc2-140580f6919e")))
                .WithEventHandlers(_ =>
                    _.CreateEventHandler("6c3d358f-3ecc-4c92-a91e-5fc34cacf27e")
                        .InScope("808ddde4-c937-4f5c-9dc2-140580f6919e")
                        .Partitioned()
                        .Handle<DishPrepared>((@event, context) => Console.WriteLine($"Handled event {@event} from public stream")))
                .Build();
            // Blocks until the EventHandlers are finished, i.e. forever
            client.Start().Wait();
        }
    }
}
```
{{% /tab %}}

{{% tab name="TypeScript" %}}
```typescript
// index.ts
import { DolittleClient } from '@dolittle/sdk';
import { TenantId } from '@dolittle/sdk.execution';

import { DishPrepared } from './DishPrepared';

(async () => {
    const client = await DolittleClient
        .setup(_ => _
            .withEventHorizons(_ => {
                _.forTenant(TenantId.development, _ => _
                    .fromProducerMicroservice('f39b1f61-d360-4675-b859-53c05c87c0e6')
                        .fromProducerTenant(TenantId.development)
                        .fromProducerStream('2c087657-b318-40b1-ae92-a400de44e507')
                        .fromProducerPartition('Dolittle Tacos')
                        .toScope('808ddde4-c937-4f5c-9dc2-140580f6919e'));
            })
            .withEventHandlers(_ => _
                .create('6c3d358f-3ecc-4c92-a91e-5fc34cacf27e')
                    .inScope('808ddde4-c937-4f5c-9dc2-140580f6919e')
                    .partitioned()
                    .handle(DishPrepared, (event, context) => {
                        client.logger.info(`Handled event ${JSON.stringify(event)} from public stream`);
                     })
            )
        )
        .connect(_ => _
            .withRuntimeOn('localhost', 50055)
        );
})();
```

{{% /tab %}}
{{< /tabs >}}

Now we have a consumer microservice that:
- Connects to another Runtime running on port `50055`
- Subscribes to the producer's public stream with the id of `2c087657-b318-40b1-ae92-a400de44e507` (same as the producer's public filter)
- Puts those events into a [Scope]({{< ref "docs/concepts/event_store#scope" >}}) with id of `808ddde4-c937-4f5c-9dc2-140580f6919e` 
- Handles them incoming events in a [scoped event handler]({{< ref "docs/concepts/event_handlers_and_filters#scope" >}}) with an id of `6c3d358f-3ecc-4c92-a91e-5fc34cacf27e`

There's a lot of stuff going on the code so let's break it down:

#### Connection to the Runtime
{{< tabs name="with-runtime-on-tab" >}}
{{% tab name="C#" %}}
```csharp
// Program.cs
.WithRuntimeOn("localhost", 50055)
// Rest of builder here...

```
{{% /tab %}}

{{% tab name="TypeScript" %}}
```typescript
.withRuntimeOn('localhost', 50055)
```
{{% /tab %}}
{{< /tabs >}}

This line configures the hostname and port of the [Runtime]({{< ref "docs/concepts/overview" >}}) for this client. By default, it connects to the Runtimes default port of `50053` on `localhost`.

Since we in this tutorial will end up with two running instances of the Runtime, they will have to run with different ports. The *producer* Runtime will be running on the default `50053` port, and the consumer Runtime will be running on port 50055.
We'll see this reflected in the `docker-compose.yml` file [later]({{< ref "#setup-your-environment" >}}) in this tutorial.

#### Event Horizon
{{< tabs name="with-event-horizons-tab" >}}
{{% tab name="C#" %}}
```csharp
// Program.cs
.WithEventHorizons(eventHorizons =>
    eventHorizons.ForTenant(TenantId.Development, subscriptions =>
        subscriptions
            .FromProducerMicroservice("f39b1f61-d360-4675-b859-53c05c87c0e6")
            .FromProducerTenant(TenantId.Development)
            .FromProducerStream("2c087657-b318-40b1-ae92-a400de44e507")
            .FromProducerPartition(PartitionId.Unspecified)
            .ToScope("808ddde4-c937-4f5c-9dc2-140580f6919e")))
// Rest of builder here...
```
{{% /tab %}}

{{% tab name="TypeScript" %}}
```typescript
.withEventHorizons(_ => {
    _.forTenant(TenantId.development, _ => _
        .fromProducerMicroservice('f39b1f61-d360-4675-b859-53c05c87c0e6')
            .fromProducerTenant(TenantId.development)
            .fromProducerStream('2c087657-b318-40b1-ae92-a400de44e507')
            .fromProducerPartition('Dolittle Tacos')
            .toScope('808ddde4-c937-4f5c-9dc2-140580f6919e'));
})
```

{{% /tab %}}
{{< /tabs >}}

Here we define an event horizon [subscription]({{< ref "docs/concepts/event_horizon#subscription" >}}). Each subscription is submitted and managed by the Runtime. A subscription defines:
- The consumers [Tenant]({{< ref "docs/concepts/tenants" >}})
- The producer microservice, [Public Stream]({{< ref "docs/concepts/streams#public-vs-private-streams" >}}) and that streams [Partition]({{< ref "docs/concepts/streams#partitions" >}}) to get the events from
- The [Scoped event-log]({{< ref "docs/concepts/event_store#scope" >}}) of the consumer to put the subscribed events to

When the consumer's Runtime receives a subscription, it will send a subscription request to the producer's Runtime. If the producer accepts that request, the producer's Runtime will start sending the public stream over to the consumer's Runtime, one event at a time.

The acceptance depends on two things:
- The consumer needs to know where to access the other microservices, ie the URL address.
- The producer needs to give formal [Consent]({{< ref "docs/concepts/event_horizon" >}}) for a tenant in another microservice to subscribe to public streams of a tenant.

We'll setup the consent [later]({{< ref "#setup-your-environment" >}}).

The consumer will receive events from the producer and put those events in a specialized [event-log]({{< ref "docs/concepts/event_store#event-log" >}}) that is identified by the [scope's]({{< ref "docs/concepts/event_store#scope">}}) id, so that events received over the event horizon don't mix with private events. We'll talk more about the scope when we talk about the [scoped event handler]({{< ref "#scoped-event-handler" >}}).


#### Scoped Event Handler
{{< tabs name="scoped-event-handler-tab" >}}
{{% tab name="C#" %}}
```csharp
// Program.cs
.WithEventHandlers(_ =>
    _.CreateEventHandler("6c3d358f-3ecc-4c92-a91e-5fc34cacf27e")
        .InScope("808ddde4-c937-4f5c-9dc2-140580f6919e")
        .Partitioned()
        .Handle<DishPrepared>((@event, context) => Console.WriteLine($"Handled event {@event} from public stream")))
// Rest of builder here...
```
{{% /tab %}}

{{% tab name="TypeScript" %}}
```typescript
.withEventHandlers(_ => _
    .create('6c3d358f-3ecc-4c92-a91e-5fc34cacf27e')
        .inScope('808ddde4-c937-4f5c-9dc2-140580f6919e')
        .partitioned()
        .handle(DishPrepared, (event, context) => {
            client.logger.info(`Handled event ${JSON.stringify(event)} from public stream`);
        })
)
```

{{% /tab %}}
{{< /tabs >}}

Here we use the opportunity to create an event handler inline by using the client's builder function. This way we don't need to create a class and register it as an event handler.

This code will create a [partitioned]({{< ref "docs/concepts/streams#partitions" >}}) event handler with id `6c3d358f-3ecc-4c92-a91e-5fc34cacf27e` (same as from [getting started]({{< ref "docs/tutorials/getting_started" >}})) in a specific [scope]({{< ref "docs/concepts/event_handlers_and_filters#scope" >}}).

Remember, that the events from an event horizon subscription get put into a [scoped event-log]({{< ref "docs/concepts/event_store#scope" >}}) that is identified by the scope id. Having the scope id defined when creating an event handler signifies that it will only handle events in that scope and no other.

## Setup your environment
Now we have the producer and consumer microservices [Heads]({{< ref "docs/concepts/overview#components" >}}) coded, we need to setup the environment for them to run in and configure their Runtimes to be connected.
This configuration is provided by Dolittle when you're running your microservices in our platform, but when running multiple services on your local machine you need to configure some of it yourself.

Let's go to the environment folder we created in the beginning of this tutorial. Here we'll need to configure:
- [`platform.json`]({{< ref "docs/reference/runtime/configuration#platformjson" >}})
- [`resources.json`]({{< ref "docs/reference/runtime/configuration#resourcesjson" >}})
- [`endpoints.json`]({{< ref "docs/reference/runtime/configuration#endpointsjson" >}})
- [`microservices.json`]({{< ref "docs/reference/runtime/configuration#microservicesjson" >}})
- [`event-horizon-consents.json`]({{< ref "docs/reference/runtime/configuration#event-horizon-consentsjson" >}}).

### Platform
[`platform.json`]({{< ref "docs/reference/runtime/configuration#platformjson" >}}) configures the environment of a microservice. We have 2 microservices so they need to be configured with different identifiers and names.


Let's create 2 files, `consumer-platform.json` and `producer-producer.json`:
```json
//consumer-platform.json
{
    "applicationName": "EventHorizon Tutorial",
    "applicationID": "5bd8762f-6c39-4ba2-a141-d041c8668894",
    "microserviceName": "Consumer",
    "microserviceID": "a14bb24e-51f3-4d83-9eba-44c4cffe6bb9",
    "customerName": "Dolittle Tacos",
    "customerID": "c2d49e3e-9bd4-4e54-9e13-3ea4e04d8230",
    "environment": "Tutorial"
}
```
```json
//producer-platform.json
{
    "applicationName": "EventHorizon Tutorial",
    "applicationID": "5bd8762f-6c39-4ba2-a141-d041c8668894",
    "microserviceName": "Producer",
    "microserviceID": "f39b1f61-d360-4675-b859-53c05c87c0e6",
    "customerName": "Dolittle Tacos",
    "customerID": "c2d49e3e-9bd4-4e54-9e13-3ea4e04d8230",
    "environment": "Tutorial"
}
```

### Resources
[`resources.json`]({{< ref "docs/reference/runtime/configuration#resourcesjson" >}}) configures where a microservices stores its [event store]({{< ref "docs/concepts/event_store" >}}). We have 2 microservices so they both need their own event store database. By default the database is called `event_store`.


Create 2 more files, `consumer-resources.json` and `producer-resources.json`:

```json
//consumer-resources.json
{
    // the tenant to define this resource for
    "445f8ea8-1a6f-40d7-b2fc-796dba92dc44": {
        "eventStore": {
            "servers": [
                // hostname of the mongodb
                "mongo"
            ],
            // the database name for the event store
            "database": "consumer_event_store"
        }
    }
}
```
```json
//producer-resources.json
{
    // the tenant to define this resource for
    "445f8ea8-1a6f-40d7-b2fc-796dba92dc44": {
        "eventStore": {
            "servers": [
                // hostname of the mongodb
                "mongo"
            ],
            // the database name for the event store
            "database": "producer_event_store"
        }
    }
}
```

{{< alert title="Development Tenant" color="info">}}
The tenant id `445f8ea8-1a6f-40d7-b2fc-796dba92dc44` is the value of `TenantId.Development`.
{{< /alert >}}

### Microservices
[`microservices.json`]({{< ref "docs/reference/runtime/configuration#microservicesjson" >}}) configures where the producer microservice is so that the consumer can connect to it and subscribe to its events.

Let's create a `consumer-microservices.json` file to define where the consumer can find the producer:
```json
// consumer-microservices.json
{
    // the producer microservices id, hostname and port
    "f39b1f61-d360-4675-b859-53c05c87c0e6": {
        "host": "producer-runtime",
        "port": 50052
    }
}
```

### Consent
[`event-horizon-consents.json`]({{< ref "docs/reference/runtime/configuration#event-horizon-consentsjson" >}}) configures the [Consents]({{< ref "docs/concepts/event_horizon#consent" >}}) that the producer gives to consumers.

Let's create `producer-event-horizon-consents.json` where we give a consumer consent to subscribe to our public stream.

```json
// producer-event-horizon-consents.json
{
    // the producer's tenant that gives the consent
    "445f8ea8-1a6f-40d7-b2fc-796dba92dc44": [
        {
            // the consumer's microservice and tenant to give consent to
            "microservice": "a14bb24e-51f3-4d83-9eba-44c4cffe6bb9",
            "tenant": "445f8ea8-1a6f-40d7-b2fc-796dba92dc44",
            // the producer's public stream and partition to give consent to subscribe to
            "stream": "2c087657-b318-40b1-ae92-a400de44e507",
            "partition": "Dolittle Tacos",
            // an identifier for this consent. This is random
            "consent": "ad57aa2b-e641-4251-b800-dd171e175d1f"
        }
    ]
}

```

### Configure `docker-compose.yml`
Now we can glue all the configuration files together in the `docker-compose.yml`. The configuration files are mounted inside `/app.dolittle/` inside the `dolittle/runtime` image.

```yml
version: '3.8'
services:
  mongo:
    image: dolittle/mongodb
    hostname: mongo
    ports:
      - 27017:27017
    logging:
      driver: none
 
  consumer-runtime:
    image: dolittle/runtime:latest
    volumes:
      - ./consumer-platform.json:/app/.dolittle/platform.json
      - ./consumer-resources.json:/app/.dolittle/resources.json
      - ./consumer-microservices.json:/app/.dolittle/microservices.json
    ports:
      - 50054:50052
      - 50055:50053

  producer-runtime:
    image: dolittle/runtime:latest
    volumes:
      - ./producer-platform.json:/app/.dolittle/platform.json
      - ./producer-resources.json:/app/.dolittle/resources.json
      - ./producer-event-horizon-consents.json:/app/.dolittle/event-horizon-consents.json
    ports:
      - 50052:50052
      - 50053:50053

```

{{< alert title="Resource file naming" color="info" >}}
The configuration files mounted inside the image need to be named as they are defined in the [configuration reference]({{< ref "docs/reference/runtime/configuration">}}). Otherwise the Runtime can't find them.
{{< /alert >}}

### Start the environment

Start the docker-compose with this command

```shell
$ docker-compose up -d
```

This will spin up a MongoDB container and two Runtimes in the background.

{{% alert title="Docker on Windows" color="warning" %}}
Docker on Windows using the WSL2 backend can use massive amounts of RAM if not limited. Configuring a limit in the `.wslconfig` file can help greatly, as mentioned in [this issue](https://github.com/microsoft/WSL/issues/4166#issuecomment-526725261). The RAM usage is also lowered if you disable the WSL2 backend in Docker for Desktop settings.
{{% /alert %}}

### Run your microservices
Run both the consumer and producer microservices in their respective folders, and see the consumer handle the events from the producer:

{{< tabs name="run_tab" >}}
{{% tab name="C#" %}}
#### Producer
```shell
$ dotnet run
Filtering event EventHorizon.Producer.DishPrepared to public streams
Mr. Taco has prepared Bean Blaster Taco. Yummm!
```

#### Consumer
```shell
$ dotnet run
Handled event EventHorizon.Consumer.DishPrepared from public stream
```

{{% /tab %}}
{{% tab name="TypeScript" %}}
#### Producer
```shell
$ npx ts-node index.ts
info: EventHandler f2d366cf-c00a-4479-acc4-851e04b6fbba registered with the Runtime, start handling requests.
info: Public Filter 2c087657-b318-40b1-ae92-a400de44e507 registered with the Runtime, start handling requests.
info: Filtering event {"Dish":"Bean Blaster Taco","Chef":"Mr. Taco"} to public stream
info: Mr. Taco has prepared Bean Blaster Taco. Yummm!
```

#### Consumer
```shell
$ npx ts-node index.ts
info: EventHandler 6c3d358f-3ecc-4c92-a91e-5fc34cacf27e registered with the Runtime, start handling requests.
info: Handled event {"Dish":"Bean Blaster Taco","Chef":"Mr. Taco"} from public stream
```
{{% /tab %}}
{{< /tabs >}}

## What's next

- Learn how to [deploy your application]({{< ref "docs/platform/deploy_an_application" >}}) into our [Platform]({{< ref "docs/platform" >}})
- Learn more about the [Event Horizon]({{< ref "docs/concepts/event_horizon" >}})
