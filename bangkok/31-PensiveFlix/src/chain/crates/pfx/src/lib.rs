#![warn(unused_imports)]
#![warn(unused_extern_crates)]

#[macro_use]
extern crate log;
extern crate pfx_pal as pal;
extern crate runtime as chain;

use anyhow::{anyhow, Result};
use glob::PatternError;
use light_validation::LightValidation;
use parity_scale_codec::{Decode, Encode};
use parking_lot::{RwLock, RwLockReadGuard};
use pfx_api::{
    crpc::{GetEndpointResponse, InitRuntimeResponse},
    ecall_args::InitArgs,
    storage_sync::Synchronizer,
};
use pfx_crypto::{
    aead,
    ecdh::EcdhKey,
    sr25519::{Persistence as Persist, Sr25519SecretKey, KDF, SEED_BYTES},
};
use pfx_mq::{MessageDispatcher, MessageSendQueue};
use pfx_serde_more as more;
use pfx_types::{AttestationProvider, HandoverChallenge};
use rand::*;
use ring::rand::SecureRandom;
use scale_info::TypeInfo;
use serde::{
    de::{self, DeserializeOwned, SeqAccess, Visitor},
    ser::SerializeSeq,
    Deserialize, Deserializer, Serialize, Serializer,
};
use sp_core::{crypto::Pair, sr25519, H256};
use std::{
    fs::File,
    io::{ErrorKind, Write},
    marker::PhantomData,
    path::{Path, PathBuf},
    str,
    sync::{Arc, Mutex, MutexGuard},
    time::Instant,
};
use system::PflixMasterKey;
use thiserror::Error;
use tokio::sync::oneshot;
use types::{Error, ExpertCmdSender};

pub use chain::BlockNumber;
pub use pflix_service::RpcService;
pub use storage::ChainStorage;
pub use types::{BlockDispatchContext, PflixProperties};
pub type PflixLightValidation = LightValidation<chain::Runtime>;

mod bootstrap;
mod cryptography;
pub mod expert;
mod light_validation;
mod pflix_service;
mod secret_channel;
mod storage;
mod system;
pub mod types;
pub use bootstrap::run_pflix_server;

mod arc_rwlock_serde {
    use parking_lot::RwLock;
    use serde::{de::Deserializer, ser::Serializer, Deserialize, Serialize};
    use std::sync::Arc;

    pub fn serialize<S, T>(val: &Arc<RwLock<T>>, s: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
        T: Serialize,
    {
        T::serialize(&*val.read(), s)
    }

    pub fn deserialize<'de, D, T>(d: D) -> Result<Arc<RwLock<T>>, D::Error>
    where
        D: Deserializer<'de>,
        T: Deserialize<'de>,
    {
        Ok(Arc::new(RwLock::new(T::deserialize(d)?)))
    }
}

// TODO: Completely remove the reference to pfx-node-runtime. Instead we can create a minimal
// runtime definition locally.
type RuntimeHasher = <chain::Runtime as frame_system::Config>::Hashing;

#[derive(Serialize, Deserialize, Clone, ::scale_info::TypeInfo)]
struct RuntimeState {
    #[codec(skip)]
    send_mq: MessageSendQueue,

    #[serde(skip)]
    #[codec(skip)]
    recv_mq: MessageDispatcher,

    // chain storage synchonizing
    #[cfg_attr(not(test), codec(skip))]
    storage_synchronizer: Synchronizer<LightValidation<chain::Runtime>>,

    // TODO: use a better serialization approach
    #[codec(skip)]
    #[serde(with = "arc_rwlock_serde")]
    chain_storage: Arc<RwLock<ChainStorage>>,

    #[serde(with = "more::scale_bytes")]
    genesis_block_hash: H256,
}

impl RuntimeState {
    fn purge_mq(&mut self) {
        self.send_mq.purge(|sender| self.chain_storage.read().mq_sequence(sender))
    }

    fn chain_storage(&self) -> ChainStorageReadBox {
        ChainStorageReadBox { inner: self.chain_storage.clone() }
    }
}

pub struct ChainStorageReadBox {
    inner: Arc<RwLock<ChainStorage>>,
}

impl ChainStorageReadBox {
    pub fn read(&self) -> RwLockReadGuard<ChainStorage> {
        self.inner.read()
    }
}

const RUNTIME_SEALED_DATA_FILE: &str = "runtime-data.seal";
const CHECKPOINT_FILE: &str = "checkpoint.seal";
const CHECKPOINT_VERSION: u32 = 2;

fn checkpoint_filename_for(block_number: chain::BlockNumber, basedir: &str) -> String {
    format!("{basedir}/{CHECKPOINT_FILE}-{block_number:0>9}")
}

fn checkpoint_info_filename_for(filename: &str) -> String {
    format!("{filename}.info.json")
}

fn checkpoint_filename_pattern(basedir: &str) -> String {
    format!("{basedir}/{CHECKPOINT_FILE}-*")
}

fn glob_checkpoint_files(basedir: &str) -> Result<impl Iterator<Item = PathBuf>, PatternError> {
    let pattern = checkpoint_filename_pattern(basedir);
    Ok(glob::glob(&pattern)?.filter_map(|path| path.ok()))
}

fn glob_checkpoint_files_sorted(basedir: &str) -> Result<Vec<(chain::BlockNumber, PathBuf)>, PatternError> {
    fn parse_block(filename: &Path) -> Option<chain::BlockNumber> {
        let filename = filename.to_str()?;
        let block_number = filename.rsplit('-').next()?.parse().ok()?;
        Some(block_number)
    }
    let mut files = Vec::new();

    for filename in glob_checkpoint_files(basedir)? {
        if let Some(block_number) = parse_block(&filename) {
            files.push((block_number, filename));
        }
    }
    files.sort_by_key(|(block_number, _)| std::cmp::Reverse(*block_number));
    Ok(files)
}

fn maybe_remove_checkpoints(basedir: &str) {
    match glob_checkpoint_files(basedir) {
        Err(err) => error!("Error globbing checkpoints: {:?}", err),
        Ok(iter) => {
            for filename in iter {
                info!("Removing {}", filename.display());
                if let Err(e) = std::fs::remove_file(&filename) {
                    error!("Failed to remove {}: {}", filename.display(), e);
                }
            }
        },
    }
}

fn remove_outdated_checkpoints(basedir: &str, max_kept: u32, current_block: chain::BlockNumber) -> Result<()> {
    let mut kept = 0_u32;
    let checkpoints =
        glob_checkpoint_files_sorted(basedir).map_err(|e| anyhow!("error in glob_checkpoint_files_sorted(): {e}"))?;
    for (block, filename) in checkpoints {
        if block > current_block {
            continue;
        }
        kept += 1;
        if kept > max_kept {
            match remove_checkpoint(&filename) {
                Err(e) => error!("Failed to remove checkpoint {}: {e}", filename.display()),
                Ok(_) => {
                    info!("Removed {}", filename.display());
                },
            }
        }
    }
    Ok(())
}

fn remove_checkpoint(filename: &Path) -> Result<()> {
    std::fs::remove_file(filename).map_err(|e| anyhow!("Failed to remove checkpoint file: {e}"))?;
    let info_filename = checkpoint_info_filename_for(&filename.display().to_string());
    std::fs::remove_file(info_filename).map_err(|e| anyhow!("Failed to remove checkpoint info file: {e}"))?;
    Ok(())
}

#[derive(Encode, Decode, Clone, Debug)]
struct PersistentRuntimeData {
    genesis_block_hash: H256,
    sk: Sr25519SecretKey,
    trusted_sk: bool,
    dev_mode: bool,
}

impl PersistentRuntimeData {
    pub fn decode_keys(&self) -> (sr25519::Pair, EcdhKey) {
        // load identity
        let identity_sk = sr25519::Pair::restore_from_secret_key(&self.sk);
        info!("Identity pubkey: {:?}", hex::encode(identity_sk.public()));

        // derive ecdh key
        let ecdh_key = identity_sk.derive_ecdh_key().expect("Unable to derive ecdh key");
        info!("ECDH pubkey: {:?}", hex::encode(ecdh_key.public()));
        (identity_sk, ecdh_key)
    }
}

#[derive(Encode, Decode, Clone, Debug)]
enum RuntimeDataSeal {
    V1(PersistentRuntimeData),
}
struct AssertServerStub {
    shutdown_tx: oneshot::Sender<()>,
    stopped_rx: oneshot::Receiver<()>,
}

#[derive(Serialize, Deserialize, TypeInfo)]
#[serde(bound(deserialize = "Platform: Deserialize<'de>"))]
pub struct Pflix<Platform> {
    platform: Platform,
    #[serde(skip)]
    #[codec(skip)]
    pub args: Arc<InitArgs>,
    dev_mode: bool,
    attestation_provider: Option<AttestationProvider>,
    machine_id: Vec<u8>,
    runtime_info: Option<InitRuntimeResponse>,
    runtime_state: Option<RuntimeState>,
    endpoint: Option<String>,
    #[serde(skip)]
    #[codec(skip)]
    signed_endpoint: Option<GetEndpointResponse>,
    // The deserialzation of system requires the mq, which inside the runtime_state, to be ready.
    #[serde(skip)]
    system: Option<system::System<Platform>>,

    #[codec(skip)]
    #[serde(skip)]
    expert_cmd_sender: Option<ExpertCmdSender>,

    // tmp key for WorkerKey handover encryption
    #[codec(skip)]
    #[serde(skip)]
    pub(crate) handover_ecdh_key: Option<EcdhKey>,

    #[codec(skip)]
    #[serde(skip)]
    handover_last_challenge: Option<HandoverChallenge<chain::BlockNumber>>,

    #[codec(skip)]
    #[serde(skip)]
    #[serde(default = "Instant::now")]
    last_checkpoint: Instant,

    #[codec(skip)]
    #[serde(skip)]
    trusted_sk: bool,

    #[codec(skip)]
    #[serde(skip)]
    pub(crate) rcu_dispatching: bool,

    #[codec(skip)]
    #[serde(skip)]
    #[serde(default = "Instant::now")]
    started_at: Instant,
}

#[test]
fn show_type_changes_that_affect_the_checkpoint() {
    fn travel_types<T: TypeInfo>() -> String {
        use scale_info::{IntoPortable, PortableRegistry};
        let mut registry = Default::default();
        let _ = T::type_info().into_portable(&mut registry);
        serde_json::to_string_pretty(&PortableRegistry::from(registry).types).unwrap()
    }
    insta::assert_snapshot!(travel_types::<Pflix<()>>());
}

impl<Platform: pal::Platform> Pflix<Platform> {
    pub fn new(platform: Platform) -> Self {
        let machine_id = platform.machine_id();
        Pflix {
            platform,
            args: Default::default(),
            dev_mode: false,
            attestation_provider: None,
            machine_id,
            runtime_info: None,
            runtime_state: None,
            system: None,
            expert_cmd_sender: None,
            endpoint: None,
            signed_endpoint: None,
            handover_ecdh_key: None,
            handover_last_challenge: None,
            last_checkpoint: Instant::now(),
            trusted_sk: false,
            rcu_dispatching: false,
            started_at: Instant::now(),
        }
    }

    pub fn with_expert_cmd_sender(&mut self, expert_cmd_sender: Option<ExpertCmdSender>) {
        self.expert_cmd_sender = expert_cmd_sender
    }

    pub fn init(&mut self, args: InitArgs) {
        self.args = Arc::new(args);
    }

    pub fn set_args(&mut self, args: InitArgs) {
        self.args = Arc::new(args);
        if let Some(system) = &mut self.system {
            system.sealing_path = self.args.sealing_path.clone();
            system.storage_path = self.args.storage_path.clone();
            system.args = self.args.clone();
        }
    }

    pub fn start_at(&self) -> &Instant {
        &self.started_at
    }

    pub fn get_master_key(&self) -> Result<PflixMasterKey, types::Error> {
        if let Some(ref system) = self.system {
            if let Some(ref keyfariy) = system.keyfairy {
                Ok(keyfariy.master_key().clone())
            } else {
                return Err(types::Error::KeyfairyNotReady);
            }
        } else {
            return Err(types::Error::SystemNotReady);
        }
    }

    fn is_keyfairy_ready(&self) -> bool {
        if let Some(ref system) = self.system {
            system.keyfairy.is_some()
        } else {
            false
        }
    }

    fn can_load_chain_state(&self) -> bool {
        !self.is_keyfairy_ready()
    }

    fn init_runtime_data(
        &self,
        genesis_block_hash: H256,
        predefined_identity_key: Option<sr25519::Pair>,
    ) -> Result<PersistentRuntimeData> {
        let data = if let Some(identity_sk) = predefined_identity_key {
            self.save_runtime_data(genesis_block_hash, identity_sk, false, true)?
        } else {
            match Self::load_runtime_data(&self.platform, &self.args.sealing_path) {
                Ok(data) => data,
                Err(Error::PersistentRuntimeNotFound) => {
                    warn!("Persistent data not found.");
                    let identity_sk = new_sr25519_key();
                    self.save_runtime_data(genesis_block_hash, identity_sk, true, false)?
                },
                Err(err) => return Err(anyhow!("Failed to load persistent data: {}", err)),
            }
        };

        // check genesis block hash
        if genesis_block_hash != data.genesis_block_hash {
            anyhow::bail!("Genesis block hash mismatches with saved keys, expected {}", data.genesis_block_hash);
        }
        info!("Init done.");
        Ok(data)
    }

    fn save_runtime_data(
        &self,
        genesis_block_hash: H256,
        sr25519_sk: sr25519::Pair,
        trusted_sk: bool,
        dev_mode: bool,
    ) -> Result<PersistentRuntimeData> {
        // Put in PresistentRuntimeData
        let sk = sr25519_sk.dump_secret_key();

        let data = PersistentRuntimeData { genesis_block_hash, sk, trusted_sk, dev_mode };
        {
            let data = RuntimeDataSeal::V1(data.clone());
            let encoded_vec = data.encode();
            info!("Length of encoded slice: {}", encoded_vec.len());
            let filepath = PathBuf::from(&self.args.sealing_path).join(RUNTIME_SEALED_DATA_FILE);
            self.platform
                .seal_data(filepath, &encoded_vec)
                .map_err(|_| anyhow!("Failed to seal runtime data"))?;
            info!("Persistent Runtime Data V2 saved");
        }
        Ok(data)
    }

    /// Loads the persistent runtime data from the sealing path
    fn persistent_runtime_data(&self) -> Result<PersistentRuntimeData, Error> {
        Self::load_runtime_data(&self.platform, &self.args.sealing_path)
    }

    fn load_runtime_data(platform: &Platform, sealing_path: &str) -> Result<PersistentRuntimeData, Error> {
        let filepath = PathBuf::from(sealing_path).join(RUNTIME_SEALED_DATA_FILE);
        let data = platform
            .unseal_data(filepath)
            .map_err(|_| Error::UnsealOnLoad)?
            .ok_or(Error::PersistentRuntimeNotFound)?;
        let data: RuntimeDataSeal = Decode::decode(&mut &data[..]).map_err(Error::DecodeError)?;
        match data {
            RuntimeDataSeal::V1(data) => Ok(data),
        }
    }
}

impl<P: pal::Platform> Pflix<P> {
    // Restored from checkpoint
    pub fn on_restored(&mut self) -> Result<()> {
        self.check_requirements();
        self.update_runtime_info(|_| {});
        self.trusted_sk = Self::load_runtime_data(&self.platform, &self.args.sealing_path)
            .map_err(|e| anyhow!("load runtime data error: {e}"))?
            .trusted_sk;
        if let Some(system) = &mut self.system {
            system.on_restored(self.args.safe_mode_level)?;
        }
        if self.args.safe_mode_level >= 2 {
            if let Some(state) = &mut self.runtime_state {
                info!("Clearing the storage data to save memory");
                let mut chain_storage = state.chain_storage.write();
                chain_storage.inner_mut().load_proof(vec![])
            }
        }
        Ok(())
    }

    fn check_requirements(&self) {
        let ver = P::app_version();
        let chain_storage = &self.runtime_state.as_ref().expect("BUG: no runtime state").chain_storage.read();
        let min_version = chain_storage.minimum_pflix_version();

        let in_whitelist: bool;
        if cfg!(feature = "verify-pflixbin") {
            in_whitelist = match self.platform.extend_measurement() {
                Ok(em) => chain_storage.is_pflix_bin_in_whitelist(&em.measurement_hash()),
                Err(_) => {
                    warn!("The verify-pflixbin feature enabled, but not in SGX enviroment, ignore whitelist check");
                    true
                },
            };
        } else {
            in_whitelist = true;
        }

        if (ver.major, ver.minor, ver.patch) < min_version && !in_whitelist {
            error!("This pflix is outdated. Please update to the latest version.");
            std::process::abort();
        }
    }

    fn update_runtime_info(&mut self, f: impl FnOnce(&mut pfx_types::WorkerRegistrationInfo<chain::AccountId>)) {
        let Some(cached_resp) = self.runtime_info.as_mut() else { return };
        let mut runtime_info = cached_resp.decode_runtime_info().expect("BUG: Decode runtime_info failed");
        runtime_info.version = Self::compat_app_version();
        f(&mut runtime_info);
        cached_resp.encoded_runtime_info = runtime_info.encode();
        cached_resp.attestation = None;
    }

    fn compat_app_version() -> u32 {
        let version = P::app_version();
        (version.major << 16) + (version.minor << 8) + version.patch
    }
}

impl<Platform: pal::Platform + Serialize + DeserializeOwned> Pflix<Platform> {
    pub fn take_checkpoint(&mut self) -> anyhow::Result<chain::BlockNumber> {
        if self.args.safe_mode_level > 0 {
            anyhow::bail!("Checkpoint is disabled in safe mode");
        }
        let (current_block, _) = self.current_block().map_err(|e| anyhow!("get current block error: {e}"))?;
        let key = self
            .system
            .as_ref()
            .ok_or(anyhow!("Take checkpoint failed, runtime is not ready"))?
            .identity_key
            .dump_secret_key();
        let checkpoint_file = checkpoint_filename_for(current_block, &self.args.storage_path);
        info!("Taking checkpoint to {checkpoint_file}...");
        self.save_checkpoint_info(&checkpoint_file)?;
        let file = File::create(&checkpoint_file).map_err(|e| anyhow!("Failed to create checkpoint file: {e}"))?;
        self.take_checkpoint_to_writer(&key, file)
            .map_err(|e| anyhow!("Take checkpoint to writer failed: {e}"))?;
        info!("Checkpoint saved to {checkpoint_file}");
        self.last_checkpoint = Instant::now();
        remove_outdated_checkpoints(&self.args.storage_path, self.args.max_checkpoint_files, current_block)?;
        Ok(current_block)
    }

    pub fn save_checkpoint_info(&self, filename: &str) -> anyhow::Result<()> {
        let info = self.get_info();
        let content =
            serde_json::to_string_pretty(&info).map_err(|e| anyhow!("Failed to serialize checkpoint info: {e}"))?;
        let info_filename = checkpoint_info_filename_for(filename);
        let mut file =
            File::create(info_filename).map_err(|e| anyhow!("Failed to create checkpoint info file: {e}"))?;
        file.write_all(content.as_bytes())
            .map_err(|e| anyhow!("Failed to write checkpoint info file: {e}"))?;
        Ok(())
    }

    pub fn take_checkpoint_to_writer<W: std::io::Write>(&mut self, key: &[u8], writer: W) -> anyhow::Result<()> {
        let key128 = derive_key_for_checkpoint(key);
        let nonce = rand::thread_rng().gen();
        let mut enc_writer = aead::stream::new_aes128gcm_writer(key128, nonce, writer);
        serialize_pflix_to_writer(self, &mut enc_writer).map_err(|e| anyhow!("Failed to write checkpoint: {e}"))?;
        enc_writer
            .flush()
            .map_err(|e| anyhow!("Failed to flush encrypted writer: {e}"))?;
        Ok(())
    }

    pub fn restore_from_checkpoint(platform: &Platform, args: &InitArgs) -> anyhow::Result<Option<Self>> {
        let runtime_data = match Self::load_runtime_data(platform, &args.sealing_path) {
            Err(Error::PersistentRuntimeNotFound) => return Ok(None),
            other => other.map_err(|e| anyhow!("Failed to load persistent data: {e}"))?,
        };
        let files = glob_checkpoint_files_sorted(&args.storage_path)
            .map_err(|e| anyhow!("Glob checkpoint files failed: {e}"))?;
        if files.is_empty() {
            return Ok(None);
        }
        let (_block, ckpt_filename) = &files[0];

        let file = match File::open(ckpt_filename) {
            Ok(file) => file,
            Err(err) if matches!(err.kind(), ErrorKind::NotFound) => {
                // This should never happen unless it was removed just after the glob.
                anyhow::bail!("Checkpoint file {ckpt_filename:?} is not found");
            },
            Err(err) => {
                error!("Failed to open checkpoint file {ckpt_filename:?}: {err:?}",);
                if args.remove_corrupted_checkpoint {
                    error!("Removing {ckpt_filename:?}");
                    std::fs::remove_file(ckpt_filename)
                        .map_err(|e| anyhow!("Failed to remove corrupted checkpoint file: {e}"))?;
                }
                anyhow::bail!("Failed to open checkpoint file {ckpt_filename:?}: {err:?}");
            },
        };

        info!("Loading checkpoint from file {ckpt_filename:?}");
        match Self::restore_from_checkpoint_reader(&runtime_data.sk, file, args) {
            Ok(state) => {
                info!("Succeeded to load checkpoint file {ckpt_filename:?}");
                Ok(Some(state))
            },
            Err(_err /* Don't leak it into the log */) => {
                error!("Failed to load checkpoint file {ckpt_filename:?}");
                if args.remove_corrupted_checkpoint {
                    error!("Removing {:?}", ckpt_filename);
                    std::fs::remove_file(ckpt_filename)
                        .map_err(|e| anyhow!("Failed to remove corrupted checkpoint file: {e}"))?;
                }
                anyhow::bail!("Failed to load checkpoint file {ckpt_filename:?}");
            },
        }
    }

    pub fn restore_from_checkpoint_reader<R: std::io::Read>(
        key: &[u8],
        reader: R,
        args: &InitArgs,
    ) -> anyhow::Result<Self> {
        let key128 = derive_key_for_checkpoint(key);
        let dec_reader = aead::stream::new_aes128gcm_reader(key128, reader);

        let mut factory = deserialize_pflix_from_reader(dec_reader, args.safe_mode_level)
            .map_err(|e| anyhow!("Failed to deserialize Pflix: {e}"))?;
        factory.set_args(args.clone());
        factory.on_restored().map_err(|e| anyhow!("Failed to restore Pflix: {e}"))?;
        Ok(factory)
    }
}

impl<Platform: Serialize + DeserializeOwned> Pflix<Platform> {
    fn dump_state<S: Serializer>(&self, serializer: S) -> Result<S::Ok, S::Error> {
        let mut state = serializer.serialize_seq(None)?;
        state.serialize_element(&CHECKPOINT_VERSION)?;
        state.serialize_element(&self)?;
        state.serialize_element(&self.system)?;
        state.end()
    }

    fn load_state<'de, D: Deserializer<'de>>(deserializer: D, safe_mode_level: u8) -> Result<Self, D::Error> {
        struct PflixVisitor<Platform> {
            safe_mode_level: u8,
            _marker: PhantomData<Platform>,
        }

        impl<'de, Platform: Serialize + DeserializeOwned> Visitor<'de> for PflixVisitor<Platform> {
            type Value = Pflix<Platform>;

            fn expecting(&self, formatter: &mut core::fmt::Formatter) -> core::fmt::Result {
                formatter.write_str("Pflix")
            }

            fn visit_seq<A: SeqAccess<'de>>(self, mut seq: A) -> Result<Self::Value, A::Error> {
                let version: u32 = seq
                    .next_element()?
                    .ok_or_else(|| de::Error::custom("Checkpoint version missing"))?;
                if version > CHECKPOINT_VERSION {
                    return Err(de::Error::custom(format!("Checkpoint version {version} is not supported")));
                }

                let mut factory: Self::Value = seq.next_element()?.ok_or_else(|| de::Error::custom("Missing Pflix"))?;

                if self.safe_mode_level < 2 {
                    factory.system = {
                        let runtime_state = factory
                            .runtime_state
                            .as_mut()
                            .ok_or_else(|| de::Error::custom("Missing runtime_state"))?;

                        let recv_mq = &mut runtime_state.recv_mq;
                        let send_mq = &mut runtime_state.send_mq;
                        let seq = &mut seq;
                        pfx_mq::checkpoint_helper::using_dispatcher(recv_mq, move || {
                            pfx_mq::checkpoint_helper::using_send_mq(send_mq, || {
                                seq.next_element()?.ok_or_else(|| de::Error::custom("Missing System"))
                            })
                        })?
                    };
                } else {
                    let _: Option<serde::de::IgnoredAny> = seq.next_element()?;
                }
                Ok(factory)
            }
        }

        deserializer.deserialize_seq(PflixVisitor { safe_mode_level, _marker: PhantomData })
    }
}

fn deserialize_pflix_from_reader<Platform, R>(reader: R, safe_mode_level: u8) -> Result<Pflix<Platform>>
where
    Platform: Serialize + DeserializeOwned,
    R: std::io::Read,
{
    let mut deserializer = serde_cbor::Deserializer::from_reader(reader);
    Pflix::load_state(&mut deserializer, safe_mode_level).map_err(|e| anyhow!("Failed to load factory: {e}"))
}

fn serialize_pflix_to_writer<Platform, R>(phatory: &Pflix<Platform>, writer: R) -> Result<()>
where
    Platform: Serialize + DeserializeOwned,
    R: std::io::Write,
{
    let mut writer = serde_cbor::ser::IoWrite::new(writer);
    let mut serializer = serde_cbor::Serializer::new(&mut writer);
    phatory
        .dump_state(&mut serializer)
        .map_err(|e| anyhow!("dump state error: {e}"))?;
    Ok(())
}

pub(crate) fn new_sr25519_key() -> sr25519::Pair {
    let mut rng = rand::thread_rng();
    let mut seed = [0_u8; SEED_BYTES];
    rng.fill_bytes(&mut seed);
    sr25519::Pair::from_seed(&seed)
}

// TODO: Move to pfx-api when the std ready.
fn generate_random_iv() -> aead::IV {
    let mut nonce_vec = [0u8; aead::IV_BYTES];
    let rand = ring::rand::SystemRandom::new();
    rand.fill(&mut nonce_vec).unwrap();
    nonce_vec
}

fn generate_random_info() -> [u8; 32] {
    let mut nonce_vec = [0u8; 32];
    let rand = ring::rand::SystemRandom::new();
    rand.fill(&mut nonce_vec).unwrap();
    nonce_vec
}

fn derive_key_for_checkpoint(identity_key: &[u8]) -> [u8; 16] {
    sp_core::blake2_128(&(identity_key, b"/checkpoint").encode())
}

pub fn public_data_dir(storage_path: impl AsRef<Path>) -> PathBuf {
    storage_path.as_ref().to_path_buf().join("public")
}

#[derive(Clone)]
pub struct PflixSafeBox<Platform>(Arc<Mutex<Pflix<Platform>>>);

#[derive(Error, Debug)]
#[error("{:?}", self)]
pub enum PflixLockError {
    Poison(String),
    #[error("RCU in progress, please try the request again later")]
    Rcu,
    #[error("This RPC is disabled in safe mode")]
    SafeMode,
}

impl<Platform: pal::Platform> PflixSafeBox<Platform> {
    pub fn new(platform: Platform, expert_cmd_sender: Option<ExpertCmdSender>) -> Self {
        let mut pflix = Pflix::new(platform);
        pflix.with_expert_cmd_sender(expert_cmd_sender);
        PflixSafeBox(Arc::new(Mutex::new(pflix)))
    }

    pub fn new_with(mut pflix: Pflix<Platform>, expert_cmd_sender: Option<ExpertCmdSender>) -> Self {
        pflix.with_expert_cmd_sender(expert_cmd_sender);
        PflixSafeBox(Arc::new(Mutex::new(pflix)))
    }

    pub fn lock(
        &self,
        allow_rcu: bool,
        allow_safemode: bool,
    ) -> Result<LogOnDrop<MutexGuard<'_, Pflix<Platform>>>, PflixLockError> {
        trace!(target: "pfx::lock", "Locking pfx...");
        let guard = self.0.lock().map_err(|e| PflixLockError::Poison(e.to_string()))?;
        trace!(target: "pfx::lock", "Locked pfx");
        if !allow_rcu && guard.rcu_dispatching {
            return Err(PflixLockError::Rcu);
        }
        if !allow_safemode && guard.args.safe_mode_level > 0 {
            return Err(PflixLockError::SafeMode);
        }
        Ok(LogOnDrop { inner: guard, msg: "Unlocked pfx" })
    }
}

pub struct LogOnDrop<T> {
    inner: T,
    msg: &'static str,
}

impl<T> core::ops::Deref for LogOnDrop<T> {
    type Target = T;
    fn deref(&self) -> &T {
        &self.inner
    }
}

impl<T> core::ops::DerefMut for LogOnDrop<T> {
    fn deref_mut(&mut self) -> &mut T {
        &mut self.inner
    }
}

impl<T> Drop for LogOnDrop<T> {
    fn drop(&mut self) {
        trace!(target: "pfx::lock", "{}", self.msg);
    }
}
