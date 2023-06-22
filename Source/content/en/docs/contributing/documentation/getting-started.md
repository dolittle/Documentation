---
title: Get started
description: Get started writing documentation locally
keywords: Contributing
author: einari, joel
weight: 1
alias: getting_started
---

All of Dolittles documentation is open-source and hosted on GitHub.

## Add a new repository to the main Documentation repository

This guide teaches you how to add a new repository to the Dolittle documentation [structure]({{< ref "structure" >}}).

Start by cloning the [Documentation repository](https://github.com/dolittle/Documentation):

```shell
$ git clone https://github.com/dolittle/documentation
```

Put your documentation in markdown files under the `Source/content` folder. You can also add images and other assets in the same folder. Please consult the [writing guide]({{<ref writing_guide>}}) for more information on how to write documentation.

{{% alert %}}
All folder names given in this process will act as URL segments, take care not to change these after they have been deployed.
{{% /alert %}}

## Writing

All documentation is written in markdown following the [GitHub flavor](https://github.github.com/gfm/).

Markdown can be written using simple text editors (Pico, Nano, Notepad), but more thorough editors like [Visual Studio Code](http://code.visualstudio.com/) or [Sublime Text](http://sublimetext.com) are highly recommended. VSCode also has a [markdown preview feature](https://code.visualstudio.com/Docs/languages/markdown).

Read the [writing guiden](./writing_guide) and [style guide](./style_guide) for more information.

{{% alert "success" %}}Happy documenting{{% /alert %}}
