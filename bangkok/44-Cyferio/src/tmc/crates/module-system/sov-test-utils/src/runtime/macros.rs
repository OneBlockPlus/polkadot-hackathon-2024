/// Base macro used for generating runtimes.
/// Generally this should be wrapped by another macro to generate a specific concrete
/// runtime implementation, optimistic vs proving for example with a simpiler interface
/// for usage in general tests.
#[macro_export]
macro_rules! generate_runtime {
    (
        name: $id:ident,
        modules: [$($module_name:ident : $module_ty:path),* $(,)?],
        base_fee_recipient: $base_fee_recipient:ident : $base_fee_recipient_ty:path,
        minimal_genesis_config_type: $minimal_genesis_config_ty:path
    ) => {
        /// Generated test runtime implementation using the testing framework.
        #[derive(
            Default,
            Clone,
            ::sov_modules_api::Genesis,
            ::sov_modules_api::DispatchCall,
            ::sov_modules_api::Event,
            ::sov_modules_api::MessageCodec
        )]
        #[serialization(
            ::borsh::BorshDeserialize,
            ::borsh::BorshSerialize,
            ::serde::Serialize,
            ::serde::Deserialize
        )]
        pub struct __GeneratedRuntimeInternals<S: ::sov_modules_api::Spec, Da: ::sov_modules_api::DaSpec> {
            /// The sequencer registry module.
            pub sequencer_registry: $crate::runtime::SequencerRegistry<S, Da>,
            /// The bank module.
            pub bank: $crate::runtime::Bank<S>,
            /// The module that will receive the base fee.
            pub $base_fee_recipient: $base_fee_recipient_ty,
            $(
                /// An external module [`$module_ty`] of the generated runtime.
                pub $module_name: $module_ty
            ),*
        }

        /// A type alias for the generated runtime.
        pub type $id<S, Da> = $crate::runtime::wrapper::TestRuntimeWrapper<S, Da, __GeneratedRuntimeInternals<S, Da>>;


        impl<S: ::sov_modules_api::Spec, Da: ::sov_modules_api::DaSpec> $crate::runtime::traits::MinimalRuntime<S, Da> for __GeneratedRuntimeInternals<S, Da> {
            fn bank(&self) -> &$crate::runtime::Bank<S> {
                &self.bank
            }

            fn sequencer_registry(&self) -> &$crate::runtime::SequencerRegistry<S, Da> {
                &self.sequencer_registry
            }

            fn base_fee_recipient(&self) -> impl $crate::runtime::Payable<S> {
                ::sov_bank::IntoPayable::to_payable(&self.$base_fee_recipient.id)
            }
        }

        impl <S: ::sov_modules_api::Spec, Da: ::sov_modules_api::DaSpec> ::sov_modules_api::hooks::TxHooks for __GeneratedRuntimeInternals<S, Da> {
            type Spec = S;
            type TxState = ::sov_modules_api::WorkingSet<S>;

            fn pre_dispatch_tx_hook(
                &self,
                _tx: &::sov_modules_api::transaction::AuthenticatedTransactionData<S>,
                _state: &mut Self::TxState,
            ) -> ::anyhow::Result<()> {
                Ok(())
            }

            fn post_dispatch_tx_hook(
                &self,
                _tx: &::sov_modules_api::transaction::AuthenticatedTransactionData<S>,
                _ctx: &::sov_modules_api::Context<S>,
                _state: &mut Self::TxState,
            ) -> ::anyhow::Result<()> {
                Ok(())
            }
        }

        impl<S: ::sov_modules_api::Spec, Da: ::sov_modules_api::DaSpec> $crate::runtime::traits::MinimalGenesis<S> for __GeneratedRuntimeInternals<S, Da> {
            type Da = Da;
            fn sequencer_registry_config(config: &GenesisConfig<S, Da>) -> &<$crate::runtime::SequencerRegistry<S, Self::Da> as ::sov_modules_api::Genesis>::Config {
                &config.sequencer_registry
            }

            fn bank_config(config: &GenesisConfig<S, Da>) -> &<$crate::runtime::Bank<S> as ::sov_modules_api::Genesis>::Config {
                &config.bank
            }
        }

        impl<S: ::sov_modules_api::Spec, Da: ::sov_modules_api::DaSpec> GenesisConfig<S, Da> {
            #[allow(unused)]
            /// Creates a new [`GenesisConfig`] from a minimal genesis config [`::sov_modules_api::Genesis::Config`].
            pub fn from_minimal_config(minimal_config: $minimal_genesis_config_ty,
                $($module_name: <$module_ty as ::sov_modules_api::Genesis>::Config),*
            ) -> Self {
                Self {
                    sequencer_registry: minimal_config.sequencer_registry,
                    bank: minimal_config.bank,
                    $base_fee_recipient: minimal_config.$base_fee_recipient,
                    $(
                        $module_name,
                    )*
                }
            }
        }

        impl<S: ::sov_modules_api::Spec, Da: ::sov_modules_api::DaSpec> GenesisConfig<S, Da>
        where <S::InnerZkvm as ::sov_modules_api::Zkvm>::CodeCommitment: Default,
         <S::OuterZkvm as ::sov_modules_api::Zkvm>::CodeCommitment: Default,{
            #[allow(unused)]
            /// Creates a [`$crate::runtime::GenesisParams`] from a [`GenesisConfig`].
            pub fn into_genesis_params(self) -> $crate::runtime::GenesisParams<Self, $crate::runtime::BasicKernelGenesisConfig<S, Da>> {
                $crate::runtime::GenesisParams {
                    runtime: self,
                    kernel: $crate::runtime::BasicKernelGenesisConfig {
                        chain_state: $crate::runtime::ChainStateConfig {
                            current_time: Default::default(),
                            inner_code_commitment: Default::default(),
                            outer_code_commitment: Default::default(),
                            genesis_da_height: 0,
                        }
                    }
                }
            }
        }
    };
}
