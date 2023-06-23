---
title: Resource System
description: How to get access to storage
weight: 90
---

When using the [Dolittle SDK](https://github.com/dolittle/dotnet.sdk) you get access to the Resource System which is a way to get access to storage. The Resources you get will be separated by [Tenants]({{<ref tenants>}}) and unique in your current context. This means that you can depend on the stored data not leaking between tenants.

## Read Cache

The Read Cache is available from the Resource System as an `IMongoDatabase` that you can reference in your code. The database will be connected, and you can use normal MongoDB queries to get access to the data you store there.