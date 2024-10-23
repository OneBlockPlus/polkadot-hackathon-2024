[package]
name = "pallet-orderbook"
description = "FRAME pallet for managing an orderbook with limit and market orders"
version = "0.1.0"
license = "Unlicense"
authors.workspace = true
homepage.workspace = true
repository.workspace = true
edition.workspace = true
publish = false

[package.metadata.docs.rs]
targets = ["x86_64-unknown-linux-gnu"]

[dependencies]
codec = { features = ["derive"], workspace = true }
scale-info = { features = ["derive"], workspace = true }
frame-benchmarking = { optional = true, workspace = true }
frame-support.workspace = true
frame-system.workspace = true
pallet-assets.workspace = true
sp-runtime.workspace = true
sp-std.workspace = true

# Add these dependencies for the fungibles trait and other utilities
pallet-balances.workspace = true
sp-arithmetic.workspace = true

[dev-dependencies]
sp-core = { default-features = true, workspace = true }
sp-io = { default-features = true, workspace = true }

[features]
default = ["std"]
runtime-benchmarks = [
    "frame-benchmarking/runtime-benchmarks",
    "frame-support/runtime-benchmarks",
    "frame-system/runtime-benchmarks",
    "sp-runtime/runtime-benchmarks",
    "pallet-balances/runtime-benchmarks",
]
std = [
    "codec/std",
    "scale-info/std",
    "frame-benchmarking?/std",
    "frame-support/std",
    "frame-system/std",
    "sp-runtime/std",
    "sp-std/std",
    "pallet-balances/std",
    "sp-arithmetic/std",
]
try-runtime = [
    "frame-support/try-runtime",
    "frame-system/try-runtime",
    "sp-runtime/try-runtime",
    "pallet-balances/try-runtime",
]