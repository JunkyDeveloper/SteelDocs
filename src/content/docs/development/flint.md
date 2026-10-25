---
title: Test harness flint
description: How to use steel-flint
---

:::note
This page only explains how to use flint at steel!
For more information, about flint how to write tests, run the tests against vanilla please use the flint docs for that.
:::

### Setup

The test harness is already included but the tests are not, so these needs to be added and some small configs, these maybe you want later again modify, but it can stay for that on a long time.

#### Tests

There are two options, your own test folder or the tests provided by the flint team (FlintBenchmark)

so please create your own test folder somewhere or you can pull the repo from here, recommended next to the steel repository

```
git pull https://github.com/FlintTestMC/FlintBenchmark
```

Please remember the path to it, it is needed for the config of flint.

#### Configure the harness

Flint uses .env and a .toml file, the .env will overwrite the toml, but for the start the toml will be more than enough to use.

So copy and place the flint.toml in the same directory and add the only important setting: `test_path`

The `flint.toml` should be already correct configured if you cloned FlintBenchmark next to the steel repo. Otherwise I recommend to use the absolute path, the relative works, but the absolute is easier and failure prune.

### Run flint

There are four options, the first one is the flexible one but the others are only short cuts with different profiles.

flint has 2 tests which can be used:
- `test_run_flint_selected`: without any filters or selection all tests are running but with the toml filters it can be more specified
- `test_run_all_flint_benchmarks`: it runs all tests which it can find.

Also three profiles are at steel which can be used for flint:
- `flint`: this profile compiles with debug symbols, so it will allow you to debug the code with a flint tests so you can check your block/item or entity implementation
- `dev`: normal steel profile, it will run and has a quick compiling but runs slower, prefered for a small flint set
- `cicd`: it inherits release profile, so perfect for big flint set but the compile duration is really long

#### The general command

This will run the flint test in the dev profile so you can modify it
```
cargo test --package steel-flint test_run_flint_selected -- --ignored
```

#### Specific commands

all 3 have commands have the selected test included!

`cargo flint`: flint profile
`cargo flint-dev`: dev profile
`cargo flint-release`: cicd profile (which inherits release)

### Output

The output will be show you what failed and gives you link to flint viz, there you can see the tests in graphical version, to see what failed in the test.

### More information
More stuff is documented at the flint docs, which are accessable here: https://flinttestmc.github.io/FlintDocs/