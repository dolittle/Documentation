---
title: Writing guide
description: A guide on how to write documentation
keywords: Contributing, guide, writing, documentation, icon, links, metadata, hugo, dot, markdown
author: einari, joel
weight: 2
---

This document is meant to be read alongside the [style guide](./style_guide) to provide concrete examples on formatting the document and syntax of different Hugo shortcodes.

# Documentation overview

All Dolittle documentation is generated using [Hugo 0.58.3](https://gohugo.io), with the [Dot](https://github.com/Gethugothemes/dot-hugo-documentation-theme.git) theme.

# Writing documentation

## Metadata

All files **MUST** have a metadata header at the top of the file following the Hugo [Front Matter](https://gohugo.io/content-management/front-matter/) format. Some of this metadata gets put into the generated HTML file.

The `keywords` and `title` properties are used for searching while the `description` shows up in the search results.

```text
---
title: About contributing to documentation
description: Learn about how to contribute to documentation
keywords: Contributing
author: dolittle
// for topmost _index.md files add the correct repository property
repository: https://github.com/dolittle/Documentation
weight: 2
---
```

The main landing pages also have an `icon` attribute in the Front-Matter. These icons are from the [Themify](https://themify.me/themify-icons) icon pack.

## Documentation filenames

All files **MUST** be lower cased, words **MUST** be separated with a dash. Example: **`csharp-coding-styles.md`**. Hugo also takes care of converting between dashes and underscores as well as lower- and uppercase.

## Links

### Within same repository

When adding links to other pages inside the same repository **DO NOT USE** the file extension `.md` - otherwise the link
will be broken. For instance, linking to the [API](./api) documentation is done by adding a markdown link
as follows:

```markdown
[API](./api)
```

Renders to:

[API](./api)


### Cross Repositories
Link pages from other repositories using Hugos [`relref/ref` functions](https://gohugo.io/content-management/shortcodes/#ref-and-relref) inside the markdown.

The root of the documentation for references is `Source/content/` folder of [Documentation](https://github.com/dolittle/Documentation) repository:

```console
Here is a [link]({{</* ref "/docs/tutorial/csharp.md" */>}}) to the Quickstart page.
```

Renders to:
```
Here is a [link]({{< ref "/docs/tutorial/csharp.md" >}}) to the Quickstart page.
```

You can also let Hugo figure out the correct path:

```markdown
Some text [with a link]({{</* ref style_guide */>}})
```

Renders to:
```
Some text [with a link]({{< ref style_guide >}})
```

Be aware that this matches the filename with or without the `.md` suffix. If there are other documents with the same name, you'll need to either rename those or include the entire path to the file.


### External resources

Linking to external resources is done in the standard Markdown way:

```markdown
[Dolittle Home](https://github.com/dolittle/home)
```

Looks like this:

[Dolittle Home](https://github.com/dolittle/home)


## Diagrams / Figures
Hugo supports [Mermaid](https://mermaidjs.github.io) shortcodes to write diagrams. Mermaid **SHOULD** be favored over using images when possible. [Examples of Mermaid](https://docdock.netlify.com/shortcodes/mermaid/)

Some diagrams/figures might not be possible to do using Mermaid, these can then be images. Beware however how you create these images and make sure they comply with the look and feel.

## Images

All images should be kept close to the markdown file using it.
To make sure the folders aren't getting cluttered and to have some structure, put images in a `images` folder.

Images should not have backgrounds that assume the background of the site, instead you **SHOULD** be using file formats with support for transparency such as [png](https://en.wikipedia.org/wiki/Portable_Network_Graphics).

```
<repository root>
└── Documentation
    └── MyArea
        └── [markdown files]
            └── images
                [image files]
```

To display images use the standard markdown format:
```
![alt-text](../images/dolittle.png)
```
Renders to:

![alt-text](../images/dolittle.png)

{{% alert color="warning" %}}
The URL to the image needs to be fully qualified, typically pointing to the GitHub URL.
This is something being worked on and registered as an issue [here](https://github.com/dolittle/Documentation/issues/13).
{{% /alert %}}

{{% alert %}}
The path is relative to the document where you declare the link from.
{{% /alert %}}


## Notices
Hugo supports different levels of alerts:

### Tip
Use **tips** for practical, non-essential information.
```
{{%/* alert */%}}
You can also create ReadModels with the CLI tool.
{{%/* /alert */%}}
```
Renders to:
{{% alert tip %}}
You can also create ReadModels with the CLI tool.
{{% /alert %}}

### Warning
Use **warnings** for mandatory information that the user needs to know to protect the user from personal and/or data injury.
```
{{%/* alert color="warning" */%}}
Do not remove `artifacts.json` if you do not know what you're doing.
{{%/* /alert */%}}
```
Renders to:
{{% alert color="warning" %}}
Do not remove `artifacts.json` if you do not know what you're doing.
{{% /alert %}}
