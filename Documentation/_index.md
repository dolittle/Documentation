---
title: Writing documentation
description: Learn about how to contribute to documentation
keywords: Contributing
author: einari
---

The key words “MUST”, “MUST NOT”, “REQUIRED”, “SHALL”, “SHALL NOT”, “SHOULD”, “SHOULD NOT”,
“RECOMMENDED”, “MAY”, and “OPTIONAL” in this document are to be interpreted as described in
[RFC 2119](https://tools.ietf.org/html/rfc2119).

## Process

Our documentation is generated using something called [Hugo](https://gohugo.io).
It basically works with Markdown and turns this into HTML pages that we then host. The documentation
sits separated in the repository it belongs and is expected to be in a folder called `Documentation`
inside at the root of the repository. Documentation is updated whenever a [pull request](https://help.github.com/articles/about-pull-requests/)
goes through, it will automatically trigger Hugo to re-render the pages.

### Theme

The Hugo theme we've chosen to base everything from is called [DocDock](http://docdock.netlify.com).
We're adhering to the guidelines and documentation of the theme in combination with Hugos guidelines.

## Links

When adding links to other pages you **MUST NOT** include the file extension `.md` - otherwise the link
will be broken. For instance, linking to the [API](./api) documentation is done by adding a markdown link
as follows:

```markdown
[API](./api)
```

Even though the file is actually called `api.md`.

### Cross Repositories

## Working locally


