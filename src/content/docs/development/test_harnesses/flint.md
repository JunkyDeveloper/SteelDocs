---
title: Test Harness Flint
description: How to use steel-flint
---

:::note
This page only explains how to use Flint in Steel.
For more information about Flint, how to write tests, and how to run them against vanilla Minecraft, please see the Flint docs.
:::

Flint is a test framework for Minecraft behavior. A test describes a situation (for example, placing blocks) and the result you expect. Steel's test harness, `steel-flint`, runs these tests against the Steel server, so you can check that your block, item, or entity implementation behaves like vanilla.

### Setup

The test harness is already included in the Steel repository, but the tests are not. You need to add them and make a small configuration change. You will rarely need to change this configuration again, so it can stay as it is for a long time.

#### Tests

You have two options:

- Your own test folder.
- The tests provided by the Flint team ([FlintBenchmark](https://github.com/FlintTestMC/FlintBenchmark)).

If you use your own tests, create the folder anywhere you like. If you use FlintBenchmark, clone the repository. We recommend cloning it next to the Steel repository:

```
git clone https://github.com/FlintTestMC/FlintBenchmark
```

Remember the path to the test folder, because the Flint config needs it.

#### Configure the harness

Flint reads its settings from a `.env` file and a `.toml` file. Values in the `.env` file override the ones in the `.toml` file. To get started, the `.toml` file is enough.

Copy `flint.toml` and place it in the same directory, then set the only important setting: `test_path`. It points to your test folder.

If you cloned FlintBenchmark next to the Steel repository, `flint.toml` should already be correct. Otherwise, we recommend an absolute path. A relative path works too, but an absolute path is easier to get right and less error-prone.

### Run flint

There are two ways to select tests, and three profiles to build with. The general command is the most flexible. The other commands are shortcuts that use a specific profile.

Flint has two tests you can run:

- `test_run_flint_selected`: runs the tests you select. Without any filters or selection, all tests run. With the filters in the `.toml` file, you can narrow the selection.
- `test_run_all_flint_benchmarks`: runs every test it can find.

Steel also has three profiles you can use for Flint:

- `flint`: compiles with debug symbols, so you can debug the code while a Flint test runs. Use this to check your block, item, or entity implementation.
- `dev`: the normal Steel profile. It compiles quickly but runs slower, so it is best for a small set of tests.
- `cicd`: inherits the `release` profile. It is the best choice for a big set of tests, but compiling takes a long time.

#### The general command

This runs the selected Flint tests in the `dev` profile, so you can modify the code and run again quickly:

```
cargo test --package steel-flint test_run_flint_selected -- --ignored
```

#### Specific commands

Each of these three commands runs the selected tests (`test_run_flint_selected`) with its own profile:

| Command | Profile |
| --- | --- |
| `cargo flint` | `flint` |
| `cargo flint-dev` | `dev` |
| `cargo flint-release` | `cicd` (inherits `release`) |

### Output

The output shows you which tests failed and gives you a link to Flint Viz. There you can see the tests in a graphical view, which helps you find out what went wrong in a failed test.

### More information

More information is available in the [Flint docs](https://flinttestmc.github.io/FlintDocs/).
