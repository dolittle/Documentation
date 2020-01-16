---
title: Documentation Formatting
description: Tips and tricks to how to format your documentation
keywords: Contributing, documentation, writing
author: Dolittle
weight: 5
---

This document is meant to serve as a guide for formatting the documentation you are writing. It's not an exhaustive list, but serves as a starting point for conventions and best practices to follow while writing.

Documentation is combined and generated through the static site [Hugo](https://gohugo.io). Hugo has a number of features it supports, and based on the theme being used those may or may not all be available. The theme may also have custom shortcodes that can be used to build your site and pages.

## Formatting
[Hugo](https://gohugo.io) (the static site generator creating the docuemntation site) supports [multiple formats](https://gohugo.io/content-management/formats/) for writing documentation, and our preferred format is markdown.
Markdown comes in several different variants, and the format we're aiming for is based on what Hugo's internal rendering engine supports; namely the [Blackfriday project](https://github.com/russross/blackfriday). 
For full documentation on what Hugo supports, read their documentation on [Content Management](https://gohugo.io/content-management/).

### Front Matter
[Front matter](https://gohugo.io/content-management/front-matter/) is meta information about the document that is used for indexing, categorizing, search and more. 

### URL Linking
Since documentation is spread across multiple repositories, and may get moved around it's not always easy to link to and mainatin cross site reference. It's therefore recommended to use one of Hugo's built-in [relref function](https://gohugo.io/functions/relref/).

usage example:
```markdown
Some text [with a link]({{</* relref documentation_formatting */>}})
```

Which will render to:
```
Some text [with a link]({{< relref documentation_formatting >}})
```

Something to be aware of is that this matches the filename with or without the `.md` suffix. If there are other documents with the same name in other sections of the site, then you'll need to either rename those to be more specific or include the entire path to the document.
