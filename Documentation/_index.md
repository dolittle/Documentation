---
title: Writing documentation
description: Learn about how to contribute to documentation
keywords: Contributing
author: einari
weight: 5
---

The key words “MUST”, “MUST NOT”, “REQUIRED”, “SHALL”, “SHALL NOT”, “SHOULD”, “SHOULD NOT”,
“RECOMMENDED”, “MAY”, and “OPTIONAL” in this document are to be interpreted as described in
[RFC 2119](https://tools.ietf.org/html/rfc2119).

## Process

All Dolittle documentation is generated using [Hugo](https://gohugo.io).
It basically works with [GitHub flavored markdown](https://github.github.com/gfm/) and turns this into HTML pages that we then host.
The documentation sits separated into the repository it belongs to and is expected to be in a folder called `Documentation`
inside at the root of the repository. Documentation is updated whenever a [pull request](https://help.github.com/articles/about-pull-requests/)
is approved. This will then automatically trigger Hugo to build and re-render the pages.

This documentation documenting the documentation process is also adhering to this and as an example you can find it [here](https://github.com/dolittle/Documentation/tree/master/Documentation).

## Theme

The documentation is using a [fork](https://github.com/dolittle/hugo-theme-docdock) of a theme called [DocDock](http://docdock.netlify.com).
We're adhering to the guidelines and documentation of the theme in combination with [Hugos guidelines](https://gohugo.io/documentation/).
Get familiar with the structure and requirements and all the [shortcodes] supported by both [Hugo](https://gohugo.io/content-management/shortcodes/) and the theme.

## Metadata

All files **MUST** have a metadata header at the top of the file following the following format:

```text
---
title: About contributing to documentation
description: Learn about how to contribute to documentation
keywords: Contributing
---
```

Some of this metadata gets put into the generated HTML file and some of it is used for indexing and
other purposes and for future expansion.

## Documentation filenames

All files **MUST** be lower cased, words **MUST** be separated with underscore. Example: **`csharp_coding_styles.md`**.

## Links

When adding links to other pages you **MUST NOT** include the file extension `.md` - otherwise the link
will be broken. For instance, linking to the [API](./api) documentation is done by adding a markdown link
as follows:

```markdown
[API](./api)
```

Even though the file is actually called `api.md`.

### External resources

Linking to external resources, is done in the standard Markdown way:

```markdown
[Dolittle Home](https://github.com/dolittle/home)
```

### Cross Repositories

In order to cross-reference content that sits in a different repository.....

{{% notice info %}}
More details coming soon
{{% /notice %}}

## Diagrams / Figures

All diagrams and figures **SHOULD** be done using the [Mermaid](https://docdock.netlify.com/shortcodes/mermaid/) shortcode.
Mermaid has more features and is well documented [here](https://mermaidjs.github.io).

Some diagrams/figures might not be possible to do using Mermaid, these can then be images. Beware however how you create these
images and make sure they comply with the look and feel.

## Images

All images should be kept close to the markdown file using it.
To make sure the folders aren't getting cluttered and to have some structure, put images in a `images` folder.

```
<repository root>
└── Documentation
    └── MyArea
        └── [markdown files]
            └── images
                [image files]
```

{{% notice warning %}}
The URL to the image needs to be fully qualified, typically pointing to the GitHub URL.
This is something being worked on and registered as an issue [here](https://github.com/dolittle/Documentation/issues/13).

Read more [here](http://docdock.netlify.com/create-page/page-images/)
{{% /notice %}}

Images should not have backgrounds that assume the background of the site, instead you **SHOULD** be using file formats with support for
transparency such as [png](https://en.wikipedia.org/wiki/Portable_Network_Graphics).

## Writing

All documentation is written in markdown following the [GitHub flavor](https://github.github.com/gfm/).
Markdown can be written using the simplest of editors (Pico, Nano, Notepad), but there are editors out there that gives
great value and guides you through giving you feedback on errors. Editors like [Visual Studio Code](http://code.visualstudio.com/)
and [Sublime Text](http://sublimetext.com) comes highly recommended. VSCode has for instance a [markdown preview feature](https://code.visualstudio.com/Docs/languages/markdown).

{{< icon name="heart" size="large" >}}
{{% alert theme="success" %}}Happy documenting{{% /alert %}}
