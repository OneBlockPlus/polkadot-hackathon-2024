/// Define all events used in the pallet.
use frame_support::pallet_macros::pallet_section;
 
#[pallet_section]
mod events {
    #[pallet::event]
    #[pallet::generate_deposit(pub(super) fn deposit_event)]
    pub enum Event<T: Config> {  
        DaoMembershipAdded(T::AccountId, BoundedVec<u8, T::MaxNameLength>, T::AccountId, u32),
        DaoMembershipUpdated(T::AccountId, BoundedVec<u8, T::MaxNameLength>, T::AccountId, u32),
        DaoMembershipRemoved(T::AccountId, BoundedVec<u8, T::MaxNameLength>, T::AccountId),
        DaoMembershipTransferEquity(T::AccountId, BoundedVec<u8, T::MaxNameLength>, T::AccountId,T::AccountId, u32), 
    }
}

/****************
 **** 在Substrate框架中，`pallet` 是构建运行时的基础模块；
 ****  `event` 是发生重要动作时生成并存储的数据结构，它们可以被区块链外部系统监听和响应
 ****  创建和使用`event`的基本步骤：

 **** ## 1. 定义event：
 ****  在pallet的`src/lib.rs`文件中定义事件。事件通常是枚举类型，每个变体代表一种可能的事件。

 **** // 引入必要的宏和类型
 **** use frame_support::{decl_event, decl_module, dispatch::DispatchResult};
 **** use frame_system::ensure_signed;

 **** ## 2.  触发event

 **** 在pallet的模块实现中，使用`frame_system::Module::<T>::deposit_event`方法来触发事件。

 **** ## 3. 在runtime中声明事件
  **** runtime的`src/lib.rs`文件中声明这些事件。

 **** ## 4. 订阅event

 **** 在区块链客户端，你可以通过监听节点的事件流来订阅事件。这通常是通过WebSocket API完成的。

 javascript
// 使用JavaScript和Polkadot API订阅事件
const api = await ApiPromise.create({ provider: wsProvider });
 */
