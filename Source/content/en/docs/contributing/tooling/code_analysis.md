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
- Runtime [repository](https://github.com/dolittle/Runtime) uses Codacy, see [the dashboard](https://app.codacy.com/gh/dolittle/Runtime/dashboard)
- DotNET.SDK [repository](https://github.com/dolittle/DotNET.SDK) uses Code Climate, see [the dashboard](https://codeclimate.com/github/dolittle/DotNET.SDK)

## The tools we have chosen
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

1. Sign up with Github provider
2. Authorize for the Github user and Dolittle organization(s)
    - (Optional) Invite people to Codacy
3. Give Codacy access to a repository
4. Adjust settings
    - Configure excluded/ignored paths for static analysis
6. Copy API token for sending coverage results and create corresponding secret in the repository
7. Configure the workflow to create and send coverage results to API using the correct token (example [workflow from Runtime](https://github.com/dolittle/Runtime/blob/master/.github/workflows/runtime.yml#L24))
8. After running the workflow, check your dashboard in Codacy (example dashboard from the [Runtime](https://app.codacy.com/gh/dolittle/Runtime/dashboard))
9. Repeat steps 3-8 per repo

Runtime's Codacy Dashboard:
![Codacy Dashboard](/images/contributing/codacy_dashboard.png)

#### Code Climate

1. Sign up with Github provider
2. Authorize for the Github user and Dolittle organization(s)
3. Give CodeClimate access to a repository
4. Adjust settings
    - Configure excluded/ignored paths for static analysis
5. Copy API token for sending coverage results and create corresponding secret in the repository
6. Configure the workflow to create and send coverage results to API using the correct token (example [workflow from DotNET.SDK](https://github.com/dolittle/DotNET.SDK/blob/415da5961345439bee433619b21edf8ae0f11b4e/.github/workflows/dotnet-library.yml#L35))
    - You need to setup both dotCover and a tool for converting dotCover format to Cobertura test reporting
7. After running the workflow, check your dashboard in Code Climate (example dashboard from the [.NET SDK](https://codeclimate.com/github/dolittle/DotNET.SDK))
8. Repeat steps 3-8 per repo

.NET SDK's Code Climate Dashboard:
![Code Climate Dashboard](/images/contributing/code_climate_dashboard.png)
