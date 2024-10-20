// This file is part of Cybros.

// Copyright (C) Jun Jiang.
// SPDX-License-Identifier: AGPL-3.0-only

// Cybros is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// Cybros is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.

// You should have received a copy of the GNU Affero General Public License
// along with Cybros.  If not, see <http://www.gnu.org/licenses/>.

use crate::*;
use frame_support::pallet_prelude::*;

impl<T: Config> Pallet<T> {
	pub(crate) fn do_authorize_worker(
		pool_info: PoolInfo<T::PoolId, T::AccountId, BalanceOf<T>, T::ImplId>,
		worker: T::AccountId,
	) -> DispatchResult {
		ensure!(
			!PoolAuthorizedWorkers::<T>::contains_key(&worker, &pool_info.id),
			Error::<T>::WorkerAlreadyAuthorized
		);

		let worker_info =
			PalletInfra::<T>::worker_info(&worker).ok_or(Error::<T>::WorkerNotFound)?;
		ensure!(worker_info.impl_id == pool_info.impl_id.clone(), Error::<T>::ImplMismatched);

		PoolAuthorizedWorkers::<T>::insert(&worker, &pool_info.id, ());

		let mut new_pool_info = pool_info.clone();
		new_pool_info.workers_count += 1;
		Pools::<T>::insert(&pool_info.id, new_pool_info);

		Self::deposit_event(Event::WorkerAuthorized {
			pool_id: pool_info.id,
			worker: worker.clone(),
		});
		Ok(())
	}

	pub(crate) fn do_revoke_worker(
		pool_info: PoolInfo<T::PoolId, T::AccountId, BalanceOf<T>, T::ImplId>,
		worker: T::AccountId,
	) -> DispatchResult {
		ensure!(
			PoolAuthorizedWorkers::<T>::contains_key(&worker, &pool_info.id),
			Error::<T>::WorkerNotFound
		);

		if WorkerSubscribedPools::<T>::contains_key(&worker, &pool_info.id) {
			WorkerSubscribedPools::<T>::remove(&worker, &pool_info.id);

			Self::deposit_event(Event::WorkerUnsubscribed {
				worker: worker.clone(),
				pool_id: pool_info.id.clone(),
			});
		}

		PoolAuthorizedWorkers::<T>::remove(&worker, &pool_info.id);

		let mut new_pool_info = pool_info.clone();
		new_pool_info.workers_count -= 1;
		Pools::<T>::insert(&pool_info.id, new_pool_info);

		Self::deposit_event(Event::WorkerRevoked { pool_id: pool_info.id, worker });
		Ok(())
	}

	pub(crate) fn do_subscribe_pool(worker: T::AccountId, pool_id: T::PoolId) -> DispatchResult {
		ensure!(
			PoolAuthorizedWorkers::<T>::contains_key(&worker, &pool_id),
			Error::<T>::WorkerNotInThePool
		);
		ensure!(
			!WorkerSubscribedPools::<T>::contains_key(&worker, &pool_id),
			Error::<T>::WorkerAlreadySubscribed
		);

		let subscribed_pools_count = CounterForWorkerSubscribedPools::<T>::get(&worker);
		ensure!(
			subscribed_pools_count < T::MaxSubscribedPoolsPerWorker::get(),
			Error::<T>::WorkerSubscribedPoolsLimitExceeded
		);

		CounterForWorkerSubscribedPools::<T>::insert(&worker, subscribed_pools_count + 1);
		WorkerSubscribedPools::<T>::insert(&worker, &pool_id, ());

		Self::deposit_event(Event::WorkerSubscribed { worker, pool_id });
		Ok(())
	}

	pub(crate) fn do_unsubscribe_pool(worker: T::AccountId, pool_id: T::PoolId) -> DispatchResult {
		ensure!(
			WorkerSubscribedPools::<T>::contains_key(&worker, &pool_id),
			Error::<T>::WorkerNotSubscribeThePool
		);

		WorkerSubscribedPools::<T>::remove(&worker, &pool_id);

		Self::deposit_event(Event::WorkerUnsubscribed { worker, pool_id });
		Ok(())
	}
}
