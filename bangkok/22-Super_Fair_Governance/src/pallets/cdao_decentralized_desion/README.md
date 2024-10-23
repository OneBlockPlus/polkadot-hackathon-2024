License: MIT-0


# homework 3
1 Clone 代码 https://github.com/papermoonio/polkadot-sdk-course-code/advance/lesson-3
2 去掉 Pallet的dev模式，dev-mode


3 完成Pallet的开发，5个extrinsic。单元测试覆盖所有错误和事件



4 完成和Balances的交互，创建Kitty和交易Kitty都有相应的Token操作


5 完成benchmark测试，得到weights文件


6 链可以正常通过编译，启动





# test  命令
cargo test

# solochain  命令
cargo build --package solochain-template-node --release

# compile with runtime-benchmarks feature
cargo build --package solochain-template-node --release --features runtime-benchmarks