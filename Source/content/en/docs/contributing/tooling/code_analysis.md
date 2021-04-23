---
title: Code Analysis
description: The tools we use for ensuring code quality
author: Dolittle
keywords: analysis, tooling
weight: 1
---

## Static code analysis and test coverage
At Dolittle we employ static code analysis and test coverage reports to ensure that we:

1. Maintain a **consistent style** accross our repositories. This ensures that the code is understandable and maintainable not just by the author, but all of our developers.
It also helps in the onboarding process or new developers by reducing the cognitive load of understanding our ever-growing codebase.

2. Keep up the **test coverage** for the code we write. This enables us as a company - to some extent - to measure our confidence in the code.
Having a high test coverage means developers don't need a deep understanding of what a specific piece of code should do when fixing or improving it, which enables us to scale.
[Specifications]({{< ref "../guidelines/csharp_specifications.md" >}}) is also a good way to document the intended behaviour of the code.

3. Avoid **common pitfalls** related to secure and robust code. It is easy to make mistakes while writing code, and many of theese mistakes are widely known.
The static code analysis tools checks for these common mistakes so that we can learn from the community.

The tools we have set up continuously monitor our code and reports on [pull requests]({{< ref "../guidelines/pull_requests.md" >}}) to help motivate us to produce high quality code, and reduce the manual work for reviewers. We are currently in the process of figuring out what tools work best for us (there are a lot to choose from), and we have set up the experiment on these repositories:
- Runtime [repository](https://github.com/dolittle/Runtime) uses Codacy. See [the dashboard](https://app.codacy.com/gh/dolittle/Runtime/dashboard).
- DotNET.SDK [repository](https://github.com/dolittle/DotNET.SDK) uses Codacy. See [the dashboard](https://codeclimate.com/github/dolittle/DotNET.SDK).

### The tools we have chosen
We are currently evaluating two options, [Codacy](https://www.codacy.com) and [Codeclimate](https://codeclimate.com).
Our requirements for a tool is:
1. To keep track of test coverage over time. Additional features related to code quality is considered benefitial, but not neccesary.
2. Support for C# and TypeScript.
3. Integrate with our public GitHub repositories through the existing GitHub workflows.
4. Report changes in status on pull requests.

Initially we evaluated the following possible options and how they fulfil our requirements:
- [Codacy](https://www.codacy.com) - meets all the requirements, well integrated with Github and easy to setup. Nice dashboard with drilldowns for issues and code coverage.
- [Code Climate](https://codeclimate.com) - meets all the requirements.
- [SonarCloud](https://sonarcloud.io) - meets all the requirements and is a widely adopted tool. 
- [LGTM](https://lgtm.com) - does not seem to provide test coverage reports.
- [Codecov](https://about.codecov.io) - meets all the requirements, but past experiences revealed flaky API resulting in false build failures.
- [Coveralls](https://coveralls.io) - meets all the requirements, but less features than the other options.

Based on that evaluation, we settled on Codacy, Code Climate and SonarCloud for our trial period. SonarCloud has not been setup at the time of writing.

### How to use them

Each of the repositories that have a static code analysis and test coverage tool set up has a dashboard page where you check the current (and historical) status of the code.
These can be used to get a feeling of the current quality and progression over time, as well as listing out the current issues if you're up for cleaning out some technical debt.
The repositories should have badges in the `README.md` file that links to the corresponding dashboard.

For everyday work, the tools will also checks any changes you push on pull requests. These checks make sure that you don't decrease the code quality with the proposed changes.
These checks appear at the bottom of the pull request in GitHub like this:

![Codacy Pull Request Check](/images/contributing/code_quality_pr_check.png)

You can click the _details_ link to see what issues have been introduced and how to resolve them before the pull request can be merged.

### How to set it up
#### Codacy
- Signup with a provider ()
#### Code Climate


- the goals
  - Maintain a high code quality on our repositories
    - Consistent style => Readability, Maintainability => easier to contribute and onboard new developers
    - Good test coverage (and meaningfull tests) => confidence that code does what it is supposed to do, and ability to change code in production without breaking things.
    - Avoid common pitfalls (security, robustness) => obvious. Harder to breach (security), robust, avoid crashes
  - Motivation
    - Motivate to fix errors 
    - Motivate to improve coverage
- what tools we use
  - currently testing out two
    - why we picked these
- how to use it (website, often a "project" per repo that is set up)
- how to configure it/set it up
  - Codacy
    - Create account with github provider
    - Give acces to orginisation
    - Give acces to repos
    - Add repository to GUI
      - Customize analysis?
      - Configure which files to ignore in terms of static analysis
      - Setup so that it suggests fixes and does status checks on PRs
    - Setup generation of code coverage report in workflow
      - For C# we use dotCover. It produces report in a format that Codacy understands
    - Copy Codacy API token for repo to the github repo's secrets
    - Use API token secret when sending coverage report
  - Code Climate
    - Create account with github provider
    - Give acces to orginisation
    - Give acces to repos
      - Exclude patterns for ignoring static analysis on files
      - Settings - Enable inline issue comments
    - Setup generation of code coverage report in workflow
      - For C# we use dotCover. It produces report in a format that needs to be converted to Cobertura by another tool (an extra step in the pipeline)
    - Copy Code CLimate API token for repo to the github repo's secrets
    - Use API token secret when sending coverage report
