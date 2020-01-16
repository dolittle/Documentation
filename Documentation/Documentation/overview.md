---
title: Overview
description: Overview on documentation building glocks
keywords: Contributing
author: einari, joel
weight: 1
repository: https://github.com/dolittle/Documentation
---

## Technology

All Dolittle documentation is generated using [Hugo 0.58.3](https://gohugo.io), a static site generator.  
All syntax is Markdown processed by [Blackfriday](https://github.com/russross/blackfriday) engine inside Hugo.

Documentation is updated whenever a [pull request](https://help.github.com/articles/about-pull-requests/) is approved. This will then automatically trigger the Azure Pipeline to build and re-render the pages.


## Theme

The documentation uses the [Dot](https://github.com/Gethugothemes/dot-hugo-documentation-theme.git) theme.
We're adhering to the guidelines and documentation of the theme in combination with [Hugos guidelines](https://gohugo.io/documentation/).
Get familiar with the structure and requirements and all the [shortcodes] supported by both [Hugo](https://gohugo.io/content-management/shortcodes/) and the theme.

## Metadata

All files **MUST** have a metadata header at the top of the file following the Hugo [Front Matter](https://gohugo.io/content-management/front-matter/) format. Some of this metadata gets put into the generated HTML file and some of it is used for indexing, categorizing, search and more:

```text
---
title: About contributing to documentation
description: Learn about how to contribute to documentation
keywords: Contributing
---
```

## Documentation filenames

All files **MUST** be lower cased, words **MUST** be separated with underscore. Example: **`csharp_coding_styles.md`**.

## Structure
JOEL TODO!!!!

The documentation sits separated into the repository it belongs to and is expected to be in a folder called `Documentation` inside the root of the repository. 

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

Link to other pages using Hugos [`relref/ref` functions](https://gohugo.io/content-management/shortcodes/#ref-and-relref) inside the markdown.

The root of the documentation for references is `Source/content/` folder of [Documentation](https://github.com/dolittle/Documentation) repository:

```console
Here is a [link]({{</* ref "/getting-started/quickstart.md" */>}}) to the Quickstart page.
```

Renders to:
```
Here is a [link]({{< ref "/getting-started/quickstart.md" >}}) to the Quickstart page.
```

You can also let Hugo figure out the correct path:

```markdown
Some text [with a link]({{</* relref style_guide */>}})
```

Renders to:
```
Some text [with a link]({{< relref style_guide >}})
```

Be aware that this matches the filename with or without the `.md` suffix. If there are other documents with the same name, you'll need to either rename those or include the entire path to the file.


### External resources

Linking to external resources, is done in the standard Markdown way:

```markdown
[Dolittle Home](https://github.com/dolittle/home)
```

Looks like this:

[Dolittle Home](https://github.com/dolittle/home)


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
{{% /notice %}}

Images should not have backgrounds that assume the background of the site, instead you **SHOULD** be using file formats with support for
transparency such as [png](https://en.wikipedia.org/wiki/Portable_Network_Graphics).

## Writing

All documentation is written in markdown following the [GitHub flavor](https://github.github.com/gfm/).
Markdown can be written using the simplest of editors (Pico, Nano, Notepad), but there are editors out there that gives
great value and guides you through giving you feedback on errors. Editors like [Visual Studio Code](http://code.visualstudio.com/)
and [Sublime Text](http://sublimetext.com) comes highly recommended. VSCode has for instance a [markdown preview feature](https://code.visualstudio.com/Docs/languages/markdown).

{{% alert theme="success" %}}Happy documenting{{% /alert %}}
