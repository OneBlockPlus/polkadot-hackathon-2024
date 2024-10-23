use std::rc::Rc;

pub use framework::{
    TestAttestationMessageError, TestChallengeMessageError, TestProcessAttestationMessage,
    TestProcessChallengeMessage,
};
use sov_attester_incentives::CallMessage;
use sov_modules_api::transaction::PriorityFeeBips;
use sov_modules_api::{CryptoSpec, DaSpec, Spec};

use crate::{Message, MessageGenerator};

/// Generates messages for the attester incentives module.
pub struct AttesterIncentivesMessageGenerator<S: Spec, Da: DaSpec>(
    #[allow(clippy::type_complexity)]
    Vec<(
        <S::CryptoSpec as CryptoSpec>::PrivateKey,
        CallMessage<S, Da>,
    )>,
);

impl<S: Spec, Da: DaSpec>
    From<
        Vec<(
            <S::CryptoSpec as CryptoSpec>::PrivateKey,
            CallMessage<S, Da>,
        )>,
    > for AttesterIncentivesMessageGenerator<S, Da>
{
    fn from(
        messages: Vec<(
            <S::CryptoSpec as CryptoSpec>::PrivateKey,
            CallMessage<S, Da>,
        )>,
    ) -> Self {
        Self(messages)
    }
}

impl<S: Spec, Da: DaSpec> MessageGenerator for AttesterIncentivesMessageGenerator<S, Da> {
    type Module = sov_attester_incentives::AttesterIncentives<S, Da>;
    type Spec = S;

    fn create_messages(
        &self,
        chain_id: u64,
        max_priority_fee_bips: PriorityFeeBips,
        max_fee: u64,
        gas_usage: Option<<Self::Spec as Spec>::Gas>,
    ) -> Vec<Message<Self::Spec, Self::Module>> {
        let mut nonce = 0;

        self.0
            .iter()
            .map(|(addr, call_message)| {
                nonce += 1;

                Message::new(
                    Rc::new(addr.clone()),
                    call_message.clone(),
                    chain_id,
                    max_priority_fee_bips,
                    max_fee,
                    gas_usage.clone(),
                    nonce,
                )
            })
            .collect::<Vec<Message<Self::Spec, Self::Module>>>()
    }
}

/// All the generators used within the framework.
pub mod framework {
    use std::convert::Infallible;

    use borsh::{BorshDeserialize, BorshSerialize};
    use serde::{Deserialize, Serialize};
    use sov_attester_incentives::{AttesterIncentives, CallMessage};
    use sov_chain_state::ChainState;
    use sov_mock_da::{MockDaSpec, MockHash};
    use sov_mock_zkvm::MockZkvm;
    use sov_modules_api::optimistic::Attestation;
    use sov_modules_api::prelude::UnwrapInfallible;
    use sov_modules_api::{ApiStateAccessor, Spec, StateTransitionPublicData};
    use sov_state::jmt::RootHash;
    use sov_state::{BorshCodec, SlotValue, Storage, StorageProof, StorageRoot};

    use crate::{
        default_test_tx_details, AsUser, FromState, TestAttester, TestSpec, TransactionType,
    };

    type TestAttesterIncentives = AttesterIncentives<TestSpec, MockDaSpec>;

    /// The errors that can be raised by the [`TestProcessAttestationMessage`] message
    #[derive(
        Debug, PartialEq, Eq, Clone, Serialize, Deserialize, BorshDeserialize, BorshSerialize,
    )]
    pub enum TestAttestationMessageError {
        /// The message is invalid because the associated initial state root is invalid
        InvalidInitialStateRoot,
        /// The message is invalid because the associated post state root is invalid
        InvalidPostStateRoot,
        /// The message is invalid because the associated proof of bond is invalid
        InvalidProofOfBond,
    }

    /// The errors that can be raised by the [`TestProcessChallengeMessage`] message
    #[derive(
        Debug, PartialEq, Eq, Clone, Serialize, Deserialize, BorshDeserialize, BorshSerialize,
    )]
    pub enum TestChallengeMessageError {
        /// The message is invalid because the associated initial state root is invalid
        InvalidInitialStateRoot,
        /// The message is invalid because the associated transition is invalid (e.g the hash or the post state root are invalid)
        InvalidTransition,
        /// The message is invalid because it contains an invalid challenge proof
        InvalidChallengeProof,
    }

    /// A test call message used to simplify attestation generation
    pub struct TestProcessAttestationMessage {
        /// The slot height at which the message is generated
        slot_height: u64,
        /// The message output
        content: Result<(), TestAttestationMessageError>,
        /// The attester that is generating the attestation
        attester: TestAttester<TestSpec>,
    }

    impl FromState<TestSpec> for TestProcessAttestationMessage {
        type Output = <TestAttesterIncentives as sov_modules_api::Module>::CallMessage;

        fn from_state(self: Box<Self>, state: &mut ApiStateAccessor<TestSpec>) -> Self::Output {
            let mut attestation = self
                .attester
                .create_attestation(self.slot_height, state)
                .unwrap_infallible();

            if let Err(e) = &self.content {
                match e {
                    TestAttestationMessageError::InvalidInitialStateRoot => {
                        // Here we'll process an attestation with the wrong initial state root
                        attestation.initial_state_root =
                            StorageRoot::new(RootHash([255; 32]), RootHash([255; 32]));
                    }
                    TestAttestationMessageError::InvalidPostStateRoot => {
                        // Here we'll process an attestation with the wrong post state root
                        attestation.post_state_root =
                            StorageRoot::new(RootHash([255; 32]), RootHash([255; 32]));
                    }
                    TestAttestationMessageError::InvalidProofOfBond => {
                        // Process an invalid proof: everything is correct except the storage proof.
                        attestation.proof_of_bond.proof.value =
                            Some(SlotValue::new(&(&self.attester.bond * 5), &BorshCodec));
                    }
                };
            }

            CallMessage::ProcessAttestation(attestation)
        }
    }

    /// A test call message used to simplify challenge generation
    pub struct TestProcessChallengeMessage<Generator: TestChallengeGenerator> {
        /// The slot height at which the message is generated
        slot_height: u64,
        /// The message output
        content: Result<(), TestChallengeMessageError>,
        /// The challenger that is generating the challenge
        challenger: Generator,
    }

    impl<Generator: TestChallengeGenerator> FromState<TestSpec>
        for TestProcessChallengeMessage<Generator>
    {
        type Output = <TestAttesterIncentives as sov_modules_api::Module>::CallMessage;

        /// Create a transaction setup function which overwrites dummy [`TestProcessChallengeMessage`] with a valid challenge (ie a
        /// [`CallMessage::ProcessChallenge`]).
        /// We have to use the test frawework's setup hook to do this, since we don't know the correct state
        /// roots in advance.
        fn from_state(self: Box<Self>, state: &mut ApiStateAccessor<TestSpec>) -> Self::Output {
            let proof = {
                let mut challenge = self
                    .challenger
                    .create_challenge_data(self.slot_height, state)
                    .unwrap_infallible();
                let mut is_valid = true;

                if let Err(e) = self.content {
                    match e {
                        TestChallengeMessageError::InvalidInitialStateRoot => {
                            // Here we'll process an challenge with the wrong initial state root
                            challenge.initial_state_root =
                                StorageRoot::new(RootHash([255; 32]), RootHash([255; 32]));
                        }
                        TestChallengeMessageError::InvalidTransition => {
                            // Here we'll process an challenge with an invalid slot hash
                            challenge.slot_hash = MockHash([255; 32]);
                        }
                        TestChallengeMessageError::InvalidChallengeProof => {
                            // Process an invalid proof: everything is correct except the challenge proof.
                            is_valid = false;
                        }
                    }
                }
                MockZkvm::create_serialized_proof(is_valid, challenge)
            };

            CallMessage::ProcessChallenge(proof, self.slot_height)
        }
    }

    impl TestAttester<TestSpec> {
        /// Creates a valid attestation for the `slot_to_attest`.
        #[allow(clippy::type_complexity)]
        pub fn create_attestation(
            &self,
            slot_to_attest: u64,
            state: &mut ApiStateAccessor<TestSpec>,
        ) -> Result<
            Attestation<
                MockDaSpec,
                StorageProof<<<TestSpec as Spec>::Storage as Storage>::Proof>,
                <<TestSpec as Spec>::Storage as Storage>::Root,
            >,
            Infallible,
        > {
            let chain_state = ChainState::<TestSpec, MockDaSpec>::default();

            // Get the values for the transition being attested
            let current_transition = chain_state
                .get_historical_transitions(slot_to_attest, state)?
                .unwrap();

            let prev_root = if slot_to_attest == 1 {
                chain_state.get_genesis_hash(state)?
            } else {
                chain_state
                    .get_historical_transitions(slot_to_attest - 1, state)?
                    .map(|t| *t.post_state_root())
            }
            .unwrap();

            let mut archival_state = state.get_archival_at(slot_to_attest);

            let proof_of_bond = TestAttesterIncentives::default()
                .bonded_attesters
                .get_with_proof(&self.user_info.address(), &mut archival_state);

            Ok(Attestation {
                initial_state_root: prev_root,
                slot_hash: *current_transition.slot_hash(),
                post_state_root: *current_transition.post_state_root(),
                proof_of_bond: sov_modules_api::optimistic::ProofOfBond {
                    claimed_transition_num: slot_to_attest,
                    proof: proof_of_bond,
                },
            })
        }

        /// Generates a [`TestProcessAttestationMessage`] for the provided `attestation_slot`.
        pub fn test_process_attestation_at_slot(
            &self,
            content: Result<(), TestAttestationMessageError>,
            attestation_slot: u64,
        ) -> TransactionType<TestAttesterIncentives, TestSpec> {
            TransactionType::Configuration {
                message: Box::new(TestProcessAttestationMessage {
                    slot_height: attestation_slot,
                    content,
                    attester: self.clone(),
                }),
                key: self.user_info.private_key().clone(),
                details: default_test_tx_details(),
            }
        }

        /// Generates a [`TestProcessAttestationMessage`] at the `self.slot_to_attest`, contained inside [`TestAttester`].
        ///
        /// ## Side effects
        /// Increments the `slot_to_attest` if the the transaction is expected to succeed.
        pub fn test_process_attestation(
            &mut self,
            content: Result<(), TestAttestationMessageError>,
        ) -> TransactionType<TestAttesterIncentives, TestSpec> {
            let is_successful = content.is_ok();
            let res = self.test_process_attestation_at_slot(content, self.slot_to_attest);

            // Only increment the slot if the attestation was successful
            if is_successful {
                self.slot_to_attest += 1;
            }

            res
        }
    }

    /// A trait that can be used to generate challenge data for attestations.
    pub trait TestChallengeGenerator: 'static + AsUser<TestSpec> + Sized + Clone {
        /// Creates data for a valid challenge against the `slot_to_attest`.
        #[allow(clippy::type_complexity)]
        fn create_challenge_data(
            &self,
            slot_to_attest: u64,
            state: &mut ApiStateAccessor<TestSpec>,
        ) -> Result<
            StateTransitionPublicData<
                <TestSpec as Spec>::Address,
                MockDaSpec,
                <<TestSpec as Spec>::Storage as Storage>::Root,
            >,
            Infallible,
        > {
            let chain_state = ChainState::<TestSpec, MockDaSpec>::default();
            // Get the values for the transition being attested
            let current_transition = chain_state
                .get_historical_transitions(slot_to_attest, state)?
                .unwrap();

            let prev_root = if slot_to_attest == 1 {
                chain_state.get_genesis_hash(state)?
            } else {
                chain_state
                    .get_historical_transitions(slot_to_attest - 1, state)?
                    .map(|t| *t.post_state_root())
            }
            .unwrap();

            Ok(StateTransitionPublicData {
                initial_state_root: prev_root,
                final_state_root: *current_transition.post_state_root(),
                slot_hash: *current_transition.slot_hash(),
                validity_condition: *current_transition.validity_condition(),
                prover_address: self.as_user().address(),
            })
        }

        /// Generates a [`TestProcessChallengeMessage`] for the provided `challenge_slot`.
        fn test_process_challenge_at_slot(
            &self,
            content: Result<(), TestChallengeMessageError>,
            challenge_slot: u64,
        ) -> TransactionType<TestAttesterIncentives, TestSpec> {
            TransactionType::Configuration {
                message: Box::new(TestProcessChallengeMessage {
                    slot_height: challenge_slot,
                    content,
                    challenger: self.clone(),
                }),
                key: self.as_user().private_key.clone(),
                details: default_test_tx_details(),
            }
        }
    }
}
