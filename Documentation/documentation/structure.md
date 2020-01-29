---
title: Structure overview
description: Understand the structure of dolittle documentation
keywords: Contributing, documenation, structure
author: joel
weight: 4
---

## Structure internally
All documentation is inside Dolittles [Documentation](https://github.com/dolittle/Documentation) repositorys `Source` folder. The 2 main pieces of this folder are `content` and `repositories`:

* `Source/repositories` contain submodules to Dolittle repositories.

* `Source/content` is the folder that Hugo uses to render dolittle.io, making it the root of the pages. It contains symlinks to each `Source/repositories` submodules Documentation folder where the real content is.

Example of how [dolittle-fundamentals](https://github.com/dolittle-fundamentals) is structured within the Documentation repository:

![example of the internal structure](../images/structure.jpg)

### Defining folder hierarchy on dolittle.io

To add structure (sub-folders) to the content folder and make these visible, Hugo expects an `_index.md` inside the subfolders. The `_index.md` files acts as a landing page for the subfolder and should contain a [Front Matter](https://gohugo.io/content-management/front-matter/) section. This defines the title, description, keywords & relative weighting in its parent tree.

```yaml
---
title: Page Title
description: A short description of the pages contents
keywords: comma, separated, keywords, to, help, searching
author: authorname
weight: 2
---
```

{{% notice note %}}
\_index.md files within subfolders should only contain the Front Matter and nothing else. This makes the subfolder links on the sidebar work as only dropdowns without linking to the content of the \_index.md. We prefer this as it makes for a more smooth experience on the site.
{{% /notice %}}

{{% notice note %}}
You should only have an \_index.md file for the uppermost landing page of dolittle.io like [Getting started]({{< ref "/getting-started" >}}), [Contributing]({{< ref "/contributing" >}}) etc.
{{% /notice %}}

{{% notice note %}}
Only create subfolders if you have more than 1 file to be put inside. Aim for a flat structure.
{{% /notice %}}

