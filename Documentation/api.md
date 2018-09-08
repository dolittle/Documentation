---
title: API documentation
description: Learn about how to make sure APIs are documented
keywords: Contributing
author: einari
weight: 2
---
# API

The key words “MUST”, “MUST NOT”, “REQUIRED”, “SHALL”, “SHALL NOT”, “SHOULD”, “SHOULD NOT”,
“RECOMMENDED”, “MAY”, and “OPTIONAL” in this document are to be interpreted as described in
[RFC 2119](https://tools.ietf.org/html/rfc2119).

All public APIs **MUST** be documented regardless of what language and use-case.

## C# XML Comments

All C# files **MUST** be documented using the XML documentation as defined [here](https://msdn.microsoft.com/en-us/library/b2s063f7.aspx).
A tutorial can also be found [here](https://msdn.microsoft.com/en-us/library/aa288481(v=vs.71).aspx).

For inheritance in documentation, you can use the [`<inheritdoc/>`](https://ewsoftware.github.io/XMLCommentsGuide/html/86453FFB-B978-4A2A-9EB5-70E118CA8073.htm).

## JavaScript

All JavaScript files **MUST** be documented using JSDoc as defined [here](http://usejsdoc.org.)
