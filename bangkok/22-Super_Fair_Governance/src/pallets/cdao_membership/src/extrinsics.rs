use frame_support::pallet_macros::pallet_section; 

#[pallet_section]
mod dispatches {
    #[pallet::call]
    impl<T: Config> Pallet<T> {
        /// Add a member `who` to the set.
        /// May only be called from `T::AddOrigin`.
        #[pallet::call_index(0)]
        #[pallet::weight(T::WeightInfo::add_membership())]
        pub fn add_membership(
            origin: OriginFor<T>,
            org_name: BoundedVec<u8, T::MaxNameLength>,
            member_id: T::AccountId,
            equity: u32,
        ) -> DispatchResult {
            let who = ensure_signed(origin)?; // 获取签名者 
            // 不需要检查是否是负责人，只能增加自己创建的集体组织会员 
            let key = (who.clone(), org_name.clone(), member_id.clone()); 
            ensure!(// 默认值或者空值取回来之后是0
                CDaoMemberships::<T>::get(key.clone()) == 0,
                Error::<T>::MemAlreadyExists
            );

            CDaoMemberships::<T>::insert(key.clone(), equity);

            Self::deposit_event(Event::DaoMembershipAdded(who, org_name, member_id, equity));

            Ok(())
        }

        /// 当前仅仅提供修改份额；后面提供份额转让
        #[pallet::call_index(1)]
        #[pallet::weight(T::WeightInfo::update_membership())]
        pub fn update_membership(
            origin: OriginFor<T>,
            org_name: BoundedVec<u8, T::MaxNameLength>,
            member_id: T::AccountId,
            new_equity: u32,
        ) -> DispatchResult {
            let who = ensure_signed(origin)?;

            // 不需要检查是否是负责人，仅仅更新自己的组织的成员权益份额
            <CDaoMemberships<T>>::insert((&who, &org_name, &member_id), new_equity);

            // 触发事件
            Self::deposit_event(Event::DaoMembershipUpdated(
                who, org_name, member_id, new_equity,
            )); 

            Ok(())
        }
 
        /// remove_membership`. 
        #[pallet::call_index(2)]
        #[pallet::weight(T::WeightInfo::remove_membership())]
        pub fn remove_membership(
            origin: OriginFor<T>,
            org_name: BoundedVec<u8, T::MaxNameLength>,
            member_id: T::AccountId,
        ) -> DispatchResult {
            let who = ensure_signed(origin)?;
            // 不需要检查是否是负责人或者其他逻辑
           // let key = (&who, &org_name, &member_id);
            let key = (who.clone(), org_name.clone(), member_id.clone()); 
            // 从存储中删除成员
            <CDaoMemberships<T>>::remove(key);
            // 触发事件
            Self::deposit_event(Event::DaoMembershipRemoved(who, org_name, member_id));
            Ok(())
        }  
        /// transfer_equity   
        #[pallet::call_index(3)]
        #[pallet::weight(T::WeightInfo::transfer_equity())]
        pub fn transfer_equity(
            origin: OriginFor<T>,
            org_name: BoundedVec<u8, T::MaxNameLength>,
            from_member_id: T::AccountId,
            to_member_id: T::AccountId,
            amount: u32,
        ) -> DispatchResult{
            //相同的ID则不做任何操作；返回
            if(from_member_id == to_member_id){ 
                 return Ok(());
            }
            let who = ensure_signed(origin)?;
            // 检查是否是负责人或者其他逻辑 

            //不需要检查是否是负责人， 
            let key1 = (who.clone(), org_name.clone(), from_member_id.clone());            

              // 检查源成员的权益份额是否足够
            let mut from_equity = <CDaoMemberships<T>>::get(key1.clone());
            ensure!(from_equity >= amount,  Error::<T>::InsufficientEquity);
 
            let key2 = (who.clone(), org_name.clone(), to_member_id.clone()); 
            let mut to_equity = <CDaoMemberships<T>>::get(key2.clone());
             
             // 转移份额,有可能导致溢出；此处检测一下
            to_equity = to_equity.checked_add(amount).ok_or(Error::<T>::Overflow)?; 
            from_equity  -= amount;  
           
            // 不需要检查是否是负责人，仅仅更新自己的组织的成员权益份额
           <CDaoMemberships<T>>::insert(key1, from_equity);
           <CDaoMemberships<T>>::insert(key2, to_equity);

            // 执行权益转移 

            // 触发事件
            Self::deposit_event(Event::DaoMembershipTransferEquity(who.clone(), org_name, from_member_id, to_member_id, amount));
            // 返回
            Ok(())
        }
    }
}
