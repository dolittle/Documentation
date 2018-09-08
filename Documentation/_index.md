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

The documentation is using a [fork](https://github.com/dolittle/hugo-theme-docdock) of a theme called [DocDock](http://docdock.netlify.com).
We're adhering to the guidelines and documentation of the theme in combination with [Hugos guidelines](https://gohugo.io/documentation/).
Get familiar with the structure and requirements and all the [shortcodes] supported by both [Hugo](https://gohugo.io/content-management/shortcodes/) and the theme.

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

## Getting Started

Writing documentation can be done by just working on each repository individually or you can work with the documentation
engine and see the end result while working. This is a good idea to get a feeling for how it will look like and verify
that links, images and diagrams are correct.

You'll have to start by cloning the Documentation repository, which has sub modules:

```shell
$ git clone --recursive https://github.com/dolittle/documentation
```

If you've already cloned it, you can get the submodules by doing the following:

```shell
$ git submodule update --init --recursive
```

The system is relying on all content sitting in the `content` folder:

```
<repository root>
└── Source
    └── Hugo
        └── content
```

Its expecting a folder for each top-level repository and the content of the `Documentation` folder directly in this.
This is best achieved by creating a symbolic link to the repositories `Documentation` folder.
Open a shell and navigate to the `content` folder.

Unix:
```shell
$ ln -s <repository-folder>/Documentation <folder-name>
```

Windows:
```shell
c:> mklink /d <repository-folder>\Documentation <folder-name>
```

Example:

Unix:
```shell
$ ln -s /Projects/Dolittle/Runtime/Documentation Overview
```

Windows:
```shell
c:> mklink /d c:\Projects\Dolittle\Runtime\Documentation Overview
```

Chances are you are contributing to the code of the repository and you can therefor leave it in place and maintain
code and documentation side-by-side.

### Building and running

You will need to [install Hugo](https://gohugo.io/getting-started/installing).
Once you have Hugo installed, you open a shell and navigate to the `Source/Hugo` folder.
From this you simply do:

Unix:
```shell
$ hugo server
```

Windows:
```shell
c:> hugo server
```
This should then yield something like the following:

```shell
                   | EN
+------------------+-----+
  Pages            | 191
  Paginator pages  |   0
  Non-page files   |  32
  Static files     | 209
  Processed images |   0
  Aliases          |   2
  Sitemaps         |   1
  Cleaned          |   0

Total in 149 ms
Watching for changes in /Users/einari/Projects/Dolittle/Documentation/Source/Hugo/{content,repositories,themes,..}
Watching for config changes in /Users/einari/Projects/Dolittle/Documentation/Source/Hugo/config.toml
Serving pages from memory
Running in Fast Render Mode. For full rebuilds on change: hugo server --disableFastRender
Web Server is available at //localhost:1313/ (bind address 127.0.0.1)
Press Ctrl+C to stop
```

It is now a matter of opening up a browser to the URL `http://localhost:1313` and start writing documentation.

{{< icon name="heart" size="large" >}}
{{% alert theme="success" %}}Happy documenting{{% /alert %}}
