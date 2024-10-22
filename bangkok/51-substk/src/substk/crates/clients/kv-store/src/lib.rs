mod accounts;
mod errors;

pub use self::errors::{StoreError, StoreResult};
pub use accounts::{AccountId, Domain, MultiAddress};

use std::{path::Path, sync::Arc};

use codec::{Decode, Encode};
use moka::sync::Cache;
use parity_db::CompressionType;
use parking_lot::RwLock;

const DEFAULT_ACCOUNT_CACHE_SIZE: u64 = 1024;
const DEFAULT_DOMAIN_CACHE_SIZE: u64 = 1024;

const DEFAULT_KV_CACHE_SIZE: u64 = 10240;

const KEY_VERSION: &[u8] = b"version".as_slice();
const CURRENT_VERSION: u32 = 1;

#[allow(unused)]
const LOG_TARGET: &str = "kv-store";

mod col {
    /// Store metadata in the column.
    pub const META: u8 = 0;

    /// Store the kv data for account.
    ///
    /// For external usage. Must register an account first.
    pub const KV: u8 = 1;

    /// Store extra kv data for an account.
    ///
    /// Only for internal usage. No need to register an account.
    ///
    /// e.g. the permission info for an account.
    pub const EXTRA_KV: u8 = 2;
    pub const ACCOUNT_INFO: u8 = 3;

    pub const DOMAIN_INFO: u8 = 4;

    /// Total columns num.
    pub const COUNT: u8 = 5;
}

/// A multi account kv storage based on pub/pri key addresses.
#[derive(Clone)]
pub struct KVStore {
    inner: Arc<KvStoreInner>,
    kvs: Arc<RwLock<StoreForAccounts>>,
    extra_kvs: Arc<RwLock<StoreForAccounts>>,
    /// accounts in `domains` must exist in `accounts` too.
    domains: Arc<RwLock<Domains>>,
    accounts: Arc<RwLock<Accounts>>,
}

impl KVStore {
    pub fn new_shared(path: &Path) -> StoreResult<Arc<Self>> {
        let store = Arc::new(Self::new(path)?);
        Ok(store)
    }

    pub fn new(path: &Path) -> StoreResult<Self> {
        let path: std::path::PathBuf = path.into();

        let mut config = parity_db::Options::with_columns(&path, col::COUNT);
        let rote_data = &mut config.columns[col::KV as usize];
        rote_data.ref_counted = false;
        rote_data.preimage = false;
        rote_data.uniform = false;
        rote_data.compression = CompressionType::Lz4;

        let db = parity_db::Db::open_or_create(&config).map_err(|e| StoreError::Db(e.to_string()))?;
        match db
            .get(col::META, KEY_VERSION)
            .map_err(|e| StoreError::Db(e.to_string()))?
        {
            Some(version) => {
                let version = u32::from_le_bytes(
                    version
                        .try_into()
                        .map_err(|_| StoreError::Db("Error reading database version".into()))?,
                );
                if version != CURRENT_VERSION {
                    return Err(StoreError::Db(format!("Unsupported database version: {version}")));
                }
            }
            None => {
                db.commit([(
                    col::META,
                    KEY_VERSION.to_vec(),
                    Some(CURRENT_VERSION.to_le_bytes().to_vec()),
                )])
                .map_err(|e| StoreError::Db(e.to_string()))?;
            }
        }

        let store = Self {
            inner: Arc::new(KvStoreInner { db }),
            kvs: Arc::new(RwLock::new(Cache::new(DEFAULT_KV_CACHE_SIZE))),
            extra_kvs: Arc::new(RwLock::new(Cache::new(DEFAULT_KV_CACHE_SIZE))),
            domains: Arc::new(RwLock::new(Cache::new(DEFAULT_DOMAIN_CACHE_SIZE))),
            accounts: Arc::new(RwLock::new(Cache::new(DEFAULT_ACCOUNT_CACHE_SIZE))),
        };

        Ok(store)
    }

    pub fn register(&self, account: AccountId) -> StoreResult<()> {
        if self.is_registered(account.clone())? {
            return Err(StoreError::AccountRegistered(account.to_string()));
        }
        let accounts = self.accounts.write();
        // write db
        self.inner.register(&account)?;
        // cache it
        accounts.insert(account, AccountInfo::Exist);

        Ok(())
    }

    pub fn unregister(&self, account: AccountId) -> StoreResult<()> {
        if !self.is_registered(account.clone())? {
            return Err(StoreError::AccountUnregistered(account.to_string()));
        }
        let accounts = self.accounts.write();
        // write db
        self.inner.unregister(&account)?;
        // cache it
        accounts.insert(account, AccountInfo::NotExist);

        Ok(())
    }

    pub fn get_domain_info(&self, domain: Domain) -> StoreResult<DomainInfo> {
        {
            let domains = self.domains.read();
            let info = domains.get(&domain);
            if let Some(info) = info {
                return Ok(info);
            }
        }

        // load db
        let domains = self.domains.write();
        let info = self.inner.get_domain_info(&domain)?;
        domains.insert(domain, info.clone());

        Ok(info)
    }

    pub fn get_account_info(&self, account: AccountId) -> StoreResult<AccountInfo> {
        {
            let accounts = self.accounts.read();
            let info = accounts.get(&account);
            if let Some(info) = info {
                return Ok(info);
            }
        }

        // load db
        let accounts = self.accounts.write();
        let info = self.inner.get_account_info(&account)?;
        accounts.insert(account, info.clone());

        Ok(info)
    }

    pub fn is_registered(&self, account: AccountId) -> StoreResult<bool> {
        {
            let accounts = self.accounts.read();
            let info = accounts.get(&account);
            if let Some(info) = info {
                return match info {
                    AccountInfo::Exist | AccountInfo::ExistWithDomain(_) => Ok(true),
                    AccountInfo::NotExist => Ok(false),
                };
            }
        }

        // load db
        let accounts = self.accounts.write();
        let info = self.inner.get_account_info(&account)?;
        let res = Ok(info != AccountInfo::NotExist);
        accounts.insert(account, info);

        res
    }

    pub fn put(&self, account: AccountId, key: Vec<u8>, val: Option<Vec<u8>>) -> StoreResult<()> {
        if !self.is_registered(account.clone())? {
            return Err(StoreError::AccountUnregistered(account.to_string()));
        }

        self._put(account, key, val)
    }

    fn _put(&self, account: AccountId, key: Vec<u8>, val: Option<Vec<u8>>) -> StoreResult<()> {
        let store_key = StoreKey {
            account: account.clone(),
            key: key.clone(),
        };
        let kvs = self.kvs.write();
        // write db
        self.inner.put(&account, &key, val.clone())?;
        // cache it
        kvs.insert(store_key, val);

        Ok(())
    }

    pub fn get_account_by_domain(&self, domain: Domain) -> StoreResult<AccountId> {
        let info = self.get_domain_info(domain.clone())?;
        match info {
            DomainInfo::NotExist => Err(StoreError::DomainNotRegistered(domain.to_string())),
            DomainInfo::ExistWithAccount(account) => Ok(account),
        }
    }

    pub fn put_by_domain(&self, domain: Domain, key: Vec<u8>, val: Option<Vec<u8>>) -> StoreResult<()> {
        let account = self.get_account_by_domain(domain)?;
        self._put(account, key, val)
    }

    pub fn get(&self, account: AccountId, key: Vec<u8>) -> StoreResult<Option<Vec<u8>>> {
        let store_key = StoreKey {
            account: account.clone(),
            key: key.clone(),
        };

        {
            let kvs = self.kvs.read();
            let v = kvs.get(&store_key);
            if let Some(v) = v {
                return Ok(v);
            }
        };

        // load db
        let kvs = self.kvs.write();
        let val = self.inner.get(&account, &key)?;
        kvs.insert(store_key, val.clone());

        Ok(val)
    }

    pub fn get_by_domain(&self, domain: Domain, key: Vec<u8>) -> StoreResult<Option<Vec<u8>>> {
        let account = self.get_account_by_domain(domain)?;
        self.get(account, key)
    }

    pub fn exist(&self, account: AccountId, key: Vec<u8>) -> StoreResult<bool> {
        let store_key = StoreKey {
            account: account.clone(),
            key: key.clone(),
        };
        {
            let kvs = self.kvs.read();
            if kvs.contains_key(&store_key) {
                return Ok(true);
            }
        }
        // load db
        let kvs = self.kvs.write();
        let val = self.inner.get(&account, &key)?;

        let is_some = val.is_some();
        kvs.insert(store_key, val);

        Ok(is_some)
    }

    pub fn exist_by_domain(&self, domain: Domain, key: Vec<u8>) -> StoreResult<bool> {
        let account = self.get_account_by_domain(domain)?;
        self.exist(account, key)
    }

    pub fn put_extra(&self, account: AccountId, key: Vec<u8>, val: Option<Vec<u8>>) -> StoreResult<()> {
        // no need to check
        // if !self.is_registered(&account)? {
        //     return Err(StoreError::AccountUnregistered(account.to_string()));
        // }

        let store_key = StoreKey {
            account: account.clone(),
            key: key.clone(),
        };
        let kvs = self.extra_kvs.write();
        // write db
        self.inner.put_extra(&account, &key, val.clone())?;
        // cache it
        kvs.insert(store_key, val);

        Ok(())
    }

    pub fn put_typed_extra<T: Encode>(&self, account_id: AccountId, key: Vec<u8>, val: Option<T>) -> StoreResult<()> {
        self.put_extra(account_id.into(), key, val.map(|data| data.encode()))?;
        Ok(())
    }

    pub fn get_extra(&self, account: AccountId, key: Vec<u8>) -> StoreResult<Option<Vec<u8>>> {
        let store_key = StoreKey {
            account: account.clone(),
            key: key.clone(),
        };

        {
            let kvs = self.extra_kvs.read();
            let v = kvs.get(&store_key);
            if let Some(v) = v {
                return Ok(v);
            }
        };

        // load db
        let kvs = self.extra_kvs.write();
        let val = self.inner.get_extra(&account, &key)?;
        kvs.insert(store_key, val.clone());

        Ok(val)
    }

    pub fn get_typed_extra<T: Decode>(&self, account: AccountId, key: Vec<u8>) -> anyhow::Result<Option<T>> {
        let data = self.get_extra(account.into(), key)?;
        let res = data.map(|data| Decode::decode(&mut data.as_slice())).transpose()?;
        Ok(res)
    }

    pub fn exist_extra(&self, account: AccountId, key: Vec<u8>) -> StoreResult<bool> {
        let store_key = StoreKey {
            account: account.clone(),
            key: key.clone(),
        };
        {
            let kvs = self.extra_kvs.read();
            if kvs.contains_key(&store_key) {
                return Ok(true);
            }
        }
        // load db
        let kvs = self.extra_kvs.write();
        let val = self.inner.get_extra(&account, &key)?;

        let is_some = val.is_some();
        kvs.insert(store_key, val);

        Ok(is_some)
    }

    pub fn register_domain(&self, account: AccountId, domain: Domain) -> StoreResult<()> {
        if !self.is_registered(account.clone())? {
            return Err(StoreError::AccountUnregistered(account.to_string()));
        }

        if self.have_domain(account.clone())? {
            return Err(StoreError::DomainAlreadyRegistered(domain.to_string()));
        }

        if self.is_registered_domain(domain.clone())? {
            return Err(StoreError::DomainAlreadyTaken(domain.to_string()));
        }

        let accounts = self.accounts.write();
        let domains = self.domains.write();

        // write db
        self.inner.register_domain(&account, &domain)?;
        // cache it
        accounts.insert(account.clone(), AccountInfo::ExistWithDomain(domain.clone()));
        domains.insert(domain, DomainInfo::ExistWithAccount(account));

        Ok(())
    }

    pub fn unregister_domain(&self, account: AccountId) -> StoreResult<()> {
        if !self.is_registered(account.clone())? {
            return Err(StoreError::AccountUnregistered(account.to_string()));
        }

        // will not report err when account have no domain
        // hint cache
        match self.account_domain(account.clone()) {
            Ok(domain) => {
                let accounts = self.accounts.write();
                let domains = self.domains.write();

                // write db
                self.inner.unregister_domain(&account, &domain)?;
                // invalid cache
                domains.invalidate(&domain);
                accounts.invalidate(&account);
                Ok(())
            }
            Err(err) => Err(err),
        }
    }

    pub fn have_domain(&self, account: AccountId) -> StoreResult<bool> {
        {
            let accounts = self.accounts.read();
            if let Some(AccountInfo::ExistWithDomain(_)) = accounts.get(&account) {
                return Ok(true);
            }
        }

        // load db
        let accounts = self.accounts.write();
        let info = self.inner.get_account_info(&account)?;
        let res = Ok(matches!(info, AccountInfo::ExistWithDomain(_)));
        accounts.insert(account, info);
        res
    }

    pub fn account_domain(&self, account: AccountId) -> StoreResult<Domain> {
        {
            let accounts = self.accounts.read();
            if let Some(AccountInfo::ExistWithDomain(domain)) = accounts.get(&account) {
                return Ok(domain);
            }
        }

        // load db
        let accounts = self.accounts.write();
        let info = self.inner.get_account_info(&account)?;

        if let AccountInfo::ExistWithDomain(domain) = &info {
            let domain = domain.clone();
            accounts.insert(account, info);
            return Ok(domain);
        } else {
            Err(StoreError::DomainNotRegistered(account.to_string()))
        }
    }

    pub fn is_registered_domain(&self, domain: Domain) -> StoreResult<bool> {
        {
            let domains = self.domains.read();
            if let Some(DomainInfo::ExistWithAccount(_)) = domains.get(&domain) {
                return Ok(true);
            }
        }

        // load db
        let domains = self.domains.write();
        let info = self.inner.get_domain_info(&domain)?;
        let res = Ok(info != DomainInfo::NotExist);
        domains.insert(domain, info);

        res
    }
}

type StoreForAccounts = Cache<StoreKey, Option<Vec<u8>>>;
type Domains = Cache<Domain, DomainInfo>;
type Accounts = Cache<AccountId, AccountInfo>;

#[derive(Debug, Encode, Decode, PartialEq, Eq, Clone, Hash)]
pub enum DomainInfo {
    NotExist,
    ExistWithAccount(AccountId),
}

#[derive(Debug, Encode, Decode, PartialEq, Eq, Clone, Hash)]
pub enum AccountInfo {
    NotExist,
    Exist,
    ExistWithDomain(Domain),
}

struct KvStoreInner {
    db: parity_db::Db,
}

#[derive(Debug, Encode, Decode, PartialEq, Eq, Clone, Hash)]
struct StoreKey {
    account: AccountId,
    /// When key is empty, the value is domain.
    key: Vec<u8>,
}

impl KvStoreInner {
    fn register(&self, account: &AccountId) -> StoreResult<()> {
        let mut commit = Vec::new();
        let key = account.encode();

        commit.push((col::ACCOUNT_INFO, key.clone(), Some(AccountInfo::Exist.encode())));
        if let Err(e) = self.db.commit(commit) {
            return Err(StoreError::Db(format!("Register account failed: database error {}", e)));
        }

        Ok(())
    }
    fn unregister(&self, account: &AccountId) -> StoreResult<()> {
        let mut commit = Vec::new();
        commit.push((col::ACCOUNT_INFO, account.encode(), None));
        if let Err(e) = self.db.commit(commit) {
            return Err(StoreError::Db(format!(
                "Unregister account failed: database error {}",
                e
            )));
        }
        Ok(())
    }

    // fn is_registered(&self, account: &AccountId) -> StoreResult<bool> {
    //     let v = self
    //         .db
    //         .get(col::ACCOUNT_REGISTER, &account.encode())
    //         .map_err(|err| StoreError::Db(err.to_string()))?;
    //
    //     Ok(v.is_some())
    // }

    fn get_account_info(&self, account: &AccountId) -> StoreResult<AccountInfo> {
        let v = self
            .db
            .get(col::ACCOUNT_INFO, &account.encode())
            .map_err(|err| StoreError::Db(err.to_string()))?;

        let v: Option<AccountInfo> = v.map(|v| Decode::decode(&mut v.as_slice())).transpose()?;
        if let Some(v) = v {
            Ok(v)
        } else {
            Ok(AccountInfo::NotExist)
        }
    }

    fn put(&self, account: &AccountId, key: &[u8], val: Option<Vec<u8>>) -> StoreResult<()> {
        let mut commit = Vec::new();
        {
            commit.push((
                col::KV,
                StoreKey {
                    account: account.clone(),
                    key: key.to_vec(),
                }
                .encode(),
                val,
            ));

            if let Err(err) = self.db.commit(commit) {
                return Err(StoreError::Db(format!("Put failed: database error {}", err)));
            }
        }

        Ok(())
    }

    fn get(&self, account: &AccountId, key: &[u8]) -> StoreResult<Option<Vec<u8>>> {
        let v = self
            .db
            .get(
                col::KV,
                &StoreKey {
                    account: account.clone(),
                    key: key.to_vec(),
                }
                .encode(),
            )
            .map_err(|err| StoreError::Db(format!("Get failed: database error {}", err)))?;

        Ok(v)
    }

    #[allow(unused)]
    fn exist(&self, account: &AccountId, key: &[u8]) -> StoreResult<bool> {
        let v = self
            .db
            .get(
                col::KV,
                &StoreKey {
                    account: account.clone(),
                    key: key.to_vec(),
                }
                .encode(),
            )
            .map_err(|err| StoreError::Db(err.to_string()))?;

        Ok(v.is_some())
    }

    fn put_extra(&self, account: &AccountId, key: &[u8], val: Option<Vec<u8>>) -> StoreResult<()> {
        let mut commit = Vec::new();
        {
            commit.push((
                col::EXTRA_KV,
                StoreKey {
                    account: account.clone(),
                    key: key.to_vec(),
                }
                .encode(),
                val,
            ));

            if let Err(err) = self.db.commit(commit) {
                return Err(StoreError::Db(format!("Put failed: database error {}", err)));
            }
        }

        Ok(())
    }

    fn get_extra(&self, account: &AccountId, key: &[u8]) -> StoreResult<Option<Vec<u8>>> {
        let v = self
            .db
            .get(
                col::EXTRA_KV,
                &StoreKey {
                    account: account.clone(),
                    key: key.to_vec(),
                }
                .encode(),
            )
            .map_err(|err| StoreError::Db(format!("Get failed: database error {}", err)))?;

        Ok(v)
    }

    #[allow(unused)]
    fn exist_extra(&self, account: &AccountId, key: &[u8]) -> StoreResult<bool> {
        let v = self
            .db
            .get(
                col::EXTRA_KV,
                &StoreKey {
                    account: account.clone(),
                    key: key.to_vec(),
                }
                .encode(),
            )
            .map_err(|err| StoreError::Db(err.to_string()))?;

        Ok(v.is_some())
    }

    fn register_domain(&self, account: &AccountId, domain: &Domain) -> StoreResult<()> {
        let commit = vec![
            (
                col::ACCOUNT_INFO,
                account.encode(),
                Some(AccountInfo::ExistWithDomain(domain.clone()).encode()),
            ),
            (
                col::DOMAIN_INFO,
                domain.encode(),
                Some(DomainInfo::ExistWithAccount(account.clone()).encode()),
            ),
        ];
        if let Err(e) = self.db.commit(commit) {
            return Err(StoreError::Db(format!("Register domain failed: database error {e}")));
        }

        Ok(())
    }

    fn unregister_domain(&self, account: &AccountId, domain: &Domain) -> StoreResult<()> {
        let mut commit = Vec::new();
        let account = account.encode();
        commit.push((col::ACCOUNT_INFO, account.encode(), Some(AccountInfo::Exist.encode())));
        commit.push((col::DOMAIN_INFO, domain.encode(), None));
        if let Err(e) = self.db.commit(commit) {
            return Err(StoreError::Db(format!("Unregister domain failed: database error {e}")));
        }

        Ok(())
    }

    fn get_domain_info(&self, domain: &Domain) -> StoreResult<DomainInfo> {
        let v = self
            .db
            .get(col::DOMAIN_INFO, &domain.encode())
            .map_err(|err| StoreError::Db(err.to_string()))?;

        let v: Option<DomainInfo> = v.map(|v| Decode::decode(&mut v.as_slice())).transpose()?;

        if let Some(v) = v {
            Ok(v)
        } else {
            Ok(DomainInfo::NotExist)
        }
    }

    // fn is_registered_domain(&self, domain: &Domain) -> StoreResult<bool> {
    //     let v = self
    //         .db
    //         .get(col::DOMAIN_TO_ACCOUNT, &domain.encode())
    //         .map_err(|err| StoreError::Db(err.to_string()))?;
    //
    //     Ok(v.is_some())
    // }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::string::ToString;

    fn temp_db_dir() -> tempfile::TempDir {
        tempfile::Builder::new().tempdir().expect("Error creating test dir")
    }

    fn test_store(temp_dir: &tempfile::TempDir) -> KVStore {
        let mut path: std::path::PathBuf = temp_dir.path().into();
        path.push("db");
        KVStore::new(&path).unwrap()
    }

    #[test]
    fn register_accounts() {
        let _ = env_logger::try_init();
        let temp = temp_db_dir();
        let store = test_store(&temp);
        store.register([0; 32].into()).unwrap();
        let res = store.register([0; 32].into()).unwrap_err();
        let expected = StoreError::AccountRegistered(MultiAddress::Address32([0; 32]).to_string());
        assert_eq!(res, expected);

        store
            .put([0; 32].into(), "hello".into(), Some(b"world".to_vec()))
            .unwrap();
        let res = store.get([0; 32].into(), "hello".into()).unwrap();
        assert_eq!(res, Some(b"world".to_vec()));

        store.put([0; 32].into(), "hello".into(), None).unwrap();
        let res = store.get([0; 32].into(), "hello".into()).unwrap();
        assert_eq!(res, None);

        let res = store
            .put([1; 32].into(), "hello".into(), Some(b"world".to_vec()))
            .unwrap_err();
        let expected = StoreError::AccountUnregistered(MultiAddress::Address32([1; 32]).to_string());
        assert_eq!(res, expected);

        // no need to register
        store
            .put_extra([1; 32].into(), "hello".into(), Some(b"world".to_vec()))
            .unwrap();

        store
            .put([0; 32].into(), "hello".into(), Some(b"world".to_vec()))
            .unwrap();
        store.put([0; 32].into(), "hello".into(), None).unwrap();
    }

    #[test]
    fn register_domains() {
        let _ = env_logger::try_init();
        let temp = temp_db_dir();
        let store = test_store(&temp);

        let domain1 = Domain::new("hello").unwrap();
        let domain2 = Domain::new("world").unwrap();

        store.register([0; 32].into()).unwrap();
        store.register([1; 32].into()).unwrap();

        store.register_domain([0; 32].into(), domain1.clone()).unwrap();
        let res = store.register_domain([0; 32].into(), domain1.clone()).unwrap_err();
        let expected = StoreError::DomainAlreadyRegistered(domain1.to_string());
        assert_eq!(res, expected);

        store
            .put_by_domain(domain1.clone(), "key".into(), Some("val".into()))
            .unwrap();
        store
            .put_by_domain(domain1.clone(), "key".into(), Some("val".into()))
            .unwrap();

        let res = store.register_domain([1; 32].into(), domain1.clone()).unwrap_err();
        let expected = StoreError::DomainAlreadyTaken(domain1.to_string());
        assert_eq!(res, expected);

        let res = store
            .put_by_domain(domain2.clone(), "key".into(), Some("val".into()))
            .unwrap_err();
        let expected = StoreError::DomainNotRegistered(domain2.to_string());
        assert_eq!(res, expected);

        // no error
        store.unregister_domain([0; 32].into()).unwrap();
        store.unregister_domain([0; 32].into()).unwrap();
    }

    #[test]
    fn load_db_should_work() {
        let _ = env_logger::try_init();
        let temp = temp_db_dir();
        {
            let store = test_store(&temp);
            store.register([0; 32].into()).unwrap();
        }

        {
            let store = test_store(&temp);
            let res = store.register([0; 32].into()).unwrap_err();
            let expected = StoreError::AccountRegistered(MultiAddress::Address32([0; 32]).to_string());
            assert_eq!(res, expected);
        }
    }
}
