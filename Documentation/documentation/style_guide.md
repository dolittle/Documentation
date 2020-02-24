---
title: Style guide
description: A set of standards for the documentation
keywords: style, documentation, writing
author: joel
weight: 3
---

This document is meant to serve as a guide for writing documentation. It's not an exhaustive list, but serves as a starting point for conventions and best practices to follow while writing.

## Comprehensive
**Cover concepts in-full, or not at all.** Describe all of the functionality of a product. Do not omit functionality that you regard as irrelevant for the user. Do not write about what is not there yet. Stay in the current.

## Conformant
**Describe what you see.** Use explicit examples to demonstrate how a feature works. Provide instructions rather than descriptions. Present your information in the order that users experience the subject matter.

**Avoid future tense** (or using the term "will") whenever possible. For example, future tense ("The screen will display...") does not read as well as the present tense ("The screen displays..."). Remember, the users you are writing for most often refer to the documentation while they are using the system, not after or in advance of using the system.  
Use simple present tense as much as possible. It avoids problems with consequences and time related communications, and is the easiest tense for translation.

**Include (some) examples and tutorials in content.** Many readers look first towards examples for quick answers, so including them will help save these people time. Try to write examples for the most common use cases, but not for everything.


## Tone
**Write in a neutral tone**. Avoid humor, personal opinions, colloquial language and talking down to your reader. Stay factual, stay technical.

**Example**:
    _The applet is a handy little screen grabber._  
**Rewrite**:
    _You use the applet to take screenshots._

**Use active voice (subject-verb-object sequence)** as it makes for more lively, interesting reading. It is more compelling than passive voice and helps to reduce word count. [Examples.](https://examples.yourdictionary.com/examples-of-active-and-passive-voice.html)

**Example**:
    _The CLI tool creates the boilerplate._  
**Rewrite**:
    _The boilerplate is created by the CLI tool._

**Use second person ("you") when speaking to or about the reader**. Authors can refer to themselves in the first person ("I" in single-author articles or "we" in multiple-author articles) but should keep the focus on the reader.

**Avoid sexist language**. There is no need to identify gender in your instructions.

## Formatting
Use **bold** to emphasize text that is particularly important, bearing in mind that overusing bold reduces its impact and readability.

Use `inline code` for anything that the reader must type or enter. For methods, classes, variables, code elements, files and folders.

Use _italic_ when introducing a word that you will also define or are using in a special way. (Use rarely, and do not use for slang.)

[Hyperlinks](https://en.wikipedia.org/wiki/Hyperlink) should surround the words which describe the link itself. Never use links like "click here" or "this page".


Use tips for **practical**, non-essential information.
{{% notice tip %}}
You can also create ReadModels with the CLI tool.
{{% /notice %}}

Use notes for **important** information.
{{% notice note %}}
You can only run one `dolittle-documentation-server` command at a time.
{{% /notice %}}

Use warnings for **mandatory** information that the user needs to know to protect the user from personal and/or data injury.
{{% notice warning %}}
Do not remove `artifacts.json` if you do not know what you're doing.
{{% /notice %}}


## Concise
Review your work frequently as you write your document. Ask yourself which words you can take out.

1. **Limit each sentence to less than 25 words**.  
    **Example**:  
    _Under normal operating conditions, the kernel does not always immediately write file data to the disks, storing it in a memory buffer and then periodically writing to the disks to speed up operations._

    **Rewrite**:  
    _Normally, the kernel stores the data in memory prior to periodically writing the data to the disk._

2. **Limit each paragraph to one topic**, each sentence to **one idea**, each procedure step to **one action**.  
    **Example**:  
    _The Workspace Switcher applet helps you navigate all of the virtual desktops available on your system. The X Window system, working in hand with a piece of software called a window manager, allows you to create more than one virtual desktop, known as workspaces, to organize your work, with different applications running in each workspace. The Workspace Switcher applet is a navigational tool to get around the various workspaces, providing a miniature road map in the GNOME panel showing all your workspaces and allowing you to switch easily between them._

    **Rewrite**:  
    _You can use the Workspace Switcher to add new workspaces to the GNOME Desktop. You can run different applications in each workspace. The Workspace Switcher applet provides a miniature map that shows all of your workspaces. You can use the Workspace Switcher applet to switch between workspaces._

3. **Aim for economical expression.**  
    Omit weak modifiers such as "quite," "very," and "extremely." Avoid weak verbs such as "is," "are," "has," "have," "do," "does," "provide," and "support." (Weak modifiers have a diluting effect, and weak verbs require more wordy constructions.) A particularly weak verb construction to avoid is starting a sentence with "There is ..." or "There are...")

4. **Prefer shorter words over longer alternatives.**  
    **Example**: "helps" rather than "facilitates" and "uses" rather than "utilizes."

5. **Use abbreviations as needed.**  
    Spell out acronyms on first use. Avoid creating new abbreviation as they can confuse rathen than clarify concepts. Do not explain familiar abbreviations.  
    **Example**:  
    _Dolittle uses Event Driven Architecture (EDA) and Command Query Responsibility Segregation (CQRS) patterns._  
    _HTML and CSS are not programming languages._

## Structure

**Move from the known to the unknown,** the old to the new, or the familiar to the unexpected. Structure content to help readers identify and skip over concepts which they already understand or see are not relevant to their immediate questions.

**Avoid unnecessary subfolders**. Don't create subfolders that only contain a single page. Make the user have access to the pages with as few clicks as possible.

### Headings and lists
**Headings should be descriptive and concise.** Use a level-one heading to start a broad subject area. Level-one headings are typically generic titles, such as Basic Skills, Getting Started, and so on.  Use level-two, level-three, and level-four headings to chunk information into easy-to-identify sections. Do not use more than four heading levels.

Use specific titles that summarize the information in the associated sections. Avoid empty headings devoid of technical content such as "Going further," "Next steps," "Considerations," and so on.

Use numbered lists when the entries in the list must follow a sequence. Use unnumbered lists where the entries are of the same importance and do not follow a sequence. Always introduce a list with a sentence or two.

## External resources

This document is based on style guides from [GNOME](https://developer.gnome.org/gdp-style-guide/2.32/gdp-style-guide.html), [IBM](https://www.ibm.com/developerworks/library/styleguidelines/), [Red Hat](https://stylepedia.net/style/) and [Write The Docs](https://www.writethedocs.org/guide/writing/docs-principles/).
