
#[cfg(feature = "mocktest")]
pub mod mock_on {
    use std::ops::AddAssign;

    use plonky2::{field::{goldilocks_field::GoldilocksField, secp256k1_scalar::Secp256K1Scalar, types::Field}, hash::keccak::KeccakHash};
    // use plonky2_ecdsa::curve::ecdsa::ECDSASecretKey;
    use itertools::Itertools;
    use num::{bigint::RandBigInt, BigUint, FromPrimitive, Zero};
    use plonky2_ecdsa::curve::{ecdsa::ECDSASecretKey, secp256k1::Secp256K1};
    use rand::{rngs::OsRng, Rng};
    use zk_6358::utils6358::{
        deploy_tx::{BaseAsset, DeployTransaction}, mint_tx::MintTransaction, transaction::{
            generate_rand_input, generate_rand_output, GasFeeTransaction, SpendTransaction,
            TransactionInput, TransactionOutput,
        }, tx_eip_712::EIP712DataHashing, type_utils::ZK6358DataHashing, utxo::{AMOUNT_LEN, TOKEN_ADDRESS_LEN, USER_ADDRESS_LEN}
    };
    use zk_6358_prover::types::{signed_tx_types::SignedOmniverseTx, test_utils::{biguint_to_fixed_bytes_le, do_sign_msg_hash}};

    type EC = Secp256K1;

    pub fn p_test_generate_rand_balanced_inputs_outputs(
        x_le_bytes: [u8; USER_ADDRESS_LEN],
    ) -> (Vec<TransactionInput>, Vec<TransactionOutput>) {
        let i_num = 4usize;
        let inputs = (0..i_num)
            .map(|_| {
                let mut input = generate_rand_input();
                input.address = x_le_bytes.clone();
                input
            })
            .collect_vec();

        let mut output_total = BigUint::zero();
        let outputs = (0..i_num * 2)
            .map(|i: usize| {
                let mut ouput = generate_rand_output();
                if i < i_num {
                    let amount = BigUint::from_usize(i).unwrap();
                    let mut amount_le = amount.to_bytes_le();
                    amount_le.resize(AMOUNT_LEN, 0);
                    ouput.amount_le = amount_le.try_into().unwrap();
                } else {
                    ouput.amount_le = inputs[i - i_num].amount_le;
                }

                output_total.add_assign(BigUint::from_bytes_le(&ouput.amount_le));

                ouput
            })
            .collect_vec();

        let mut input_total = BigUint::zero();
        let inputs = inputs
            .iter()
            .enumerate()
            .map(|(i, input_0)| {
                let mut input = input_0.clone();
                let mut amount = BigUint::from_bytes_le(&input.amount_le);
                amount.add_assign(i);
                let mut amount_le = amount.to_bytes_le();
                amount_le.resize(AMOUNT_LEN, 0);
                input.amount_le = amount_le.try_into().unwrap();

                input_total.add_assign(BigUint::from_bytes_le(&input.amount_le));

                input
            })
            .collect_vec();

        assert_eq!(input_total, output_total);

        (inputs, outputs)
    }

    pub fn p_test_generate_rand_spend_tx(x_le_bytes: [u8; USER_ADDRESS_LEN]) -> SpendTransaction {
        let (inputs, outputs) = p_test_generate_rand_balanced_inputs_outputs(x_le_bytes);

        SpendTransaction {
            asset_id: OsRng.gen(),
            inputs: inputs.clone(),
            outputs: outputs.clone(),
            gas_fee_tx: GasFeeTransaction {
                fee_inputs: inputs,
                fee_outputs: outputs,
            },
        }
    }

    pub fn p_test_generate_rand_deploy_tx(x_le_bytes: [u8; USER_ADDRESS_LEN]) -> DeployTransaction {
        let (inputs, outputs) = p_test_generate_rand_balanced_inputs_outputs(x_le_bytes);

        DeployTransaction {
            salt: OsRng.gen(),
            // name_str_len: 24,
            name: OsRng.gen(),
            base_asset_data: BaseAsset {
                deployer: OsRng.gen(),
                total_supply_le: OsRng.gen(),
                per_mint_le: OsRng.gen(),
                per_mint_price_le: OsRng.gen(),
            },
            gas_fee_tx: GasFeeTransaction {
                fee_inputs: inputs,
                fee_outputs: outputs,
            },
        }
    }

    pub fn p_test_generate_rand_mint_tx(
        x_le_bytes: [u8; USER_ADDRESS_LEN],
        asset_id: [u8; TOKEN_ADDRESS_LEN],
        per_mint: u64,
        per_mint_price: u64,
    ) -> MintTransaction {
        let num_mint = 3usize;

        let outputs = (0..num_mint)
            .map(|_| {
                let mut output = generate_rand_output();
                output.amount_le = [0u8; AMOUNT_LEN];
                output.amount_le[..8].copy_from_slice(&per_mint.to_le_bytes());
                output.address = x_le_bytes;

                let mut fee_output = output.clone();
                fee_output.amount_le[..8].copy_from_slice(&per_mint_price.to_le_bytes());

                (output, fee_output)
            })
            .collect_vec();

        let (normal_outputs, gas_outputs) = outputs.iter().cloned().unzip();

        let gas_inputs = (0..num_mint)
            .map(|_| {
                let mut input = generate_rand_input();
                input.amount_le = [0u8; AMOUNT_LEN];
                input.amount_le[..8].copy_from_slice(&per_mint_price.to_le_bytes());
                input.address = x_le_bytes;

                input
            })
            .collect_vec();

        MintTransaction {
            asset_id,
            outputs: normal_outputs,
            gas_fee_tx: GasFeeTransaction {
                fee_inputs: gas_inputs,
                fee_outputs: gas_outputs,
            },
        }
    }

    // 0: deploy; 1: mint; 2: spend
    pub fn p_test_generate_rand_omniverse_tx(
        tx_type: u8,
        sk: ECDSASecretKey<EC>,
        x_le_bytes: [u8; USER_ADDRESS_LEN],
        y_le_bytes: [u8; USER_ADDRESS_LEN],
    ) -> SignedOmniverseTx {
        match tx_type {
            0 => {
                let deploy_tx = p_test_generate_rand_deploy_tx(x_le_bytes);
                let eip_hash_value = deploy_tx.eip_712_signature_hash();
                let msg_hash = Secp256K1Scalar::from_noncanonical_biguint(BigUint::from_bytes_le(
                    &eip_hash_value,
                ));
                let sig_bytes = do_sign_msg_hash(sk, msg_hash);

                SignedOmniverseTx::OmniDeployTx(deploy_tx.sign(&y_le_bytes, &sig_bytes))
            }
            1 => {
                let mint_tx = p_test_generate_rand_mint_tx(x_le_bytes, OsRng.gen(), 10000, 1);
                let eip_hash_value = mint_tx.eip_712_signature_hash();
                let msg_hash = Secp256K1Scalar::from_noncanonical_biguint(BigUint::from_bytes_le(
                    &eip_hash_value,
                ));
                let sig_bytes = do_sign_msg_hash(sk, msg_hash);

                SignedOmniverseTx::OmniMintTx(mint_tx.sign(&y_le_bytes, &sig_bytes))
            }
            2 => {
                let spend_tx = p_test_generate_rand_spend_tx(x_le_bytes);
                let eip_hash_value = spend_tx.eip_712_signature_hash();
                let msg_hash = Secp256K1Scalar::from_noncanonical_biguint(BigUint::from_bytes_le(
                    &eip_hash_value,
                ));
                let sig_bytes = do_sign_msg_hash(sk, msg_hash);

                SignedOmniverseTx::OmniSpendTx(spend_tx.sign(&y_le_bytes, &sig_bytes))
            }
            _ => SignedOmniverseTx::InvalidTx,
        }
    }

    pub fn p_test_generate_out_from_in(inputs: &Vec<TransactionInput>) -> Vec<TransactionOutput> {
        let o_num = inputs.len() * 2;

        let i_sum: BigUint = inputs.iter().fold(BigUint::zero(), |acc, i| {
            let amount = BigUint::from_bytes_le(&i.amount_le);
            // let mut rng = rand::thread_rng();
            // rng.gen_biguint_range(&BigUint::zero(), &amount)
            acc + amount
        });

        let average = i_sum.clone() / o_num;

        let mut remaining = i_sum.clone();

        let mut output_total = BigUint::zero();
        let outputs = (0..o_num)
            .map(|idx| {
                let amount = if idx != (o_num - 1) {
                    let mut rng = rand::thread_rng();
                    let value = rng.gen_biguint_range(&BigUint::zero(), &average);
                    remaining -= value.clone();

                    value
                } else {
                    remaining.clone()
                };

                let mut amount_le = amount.to_bytes_le();
                amount_le.resize(AMOUNT_LEN, 0);

                output_total += BigUint::from_bytes_le(&amount_le);

                TransactionOutput {
                    address: OsRng.gen(),
                    amount_le: amount_le.try_into().unwrap(),
                }
            })
            .collect_vec();

        assert_eq!(i_sum, output_total, "Invalid outputs amount");

        outputs
    }

    pub fn p_test_generate_a_batch(
        sk: ECDSASecretKey<EC>,
        x_le_bytes: [u8; USER_ADDRESS_LEN],
        y_le_bytes: [u8; USER_ADDRESS_LEN],
    ) -> Vec<SignedOmniverseTx> {
        type F = GoldilocksField;
        let total_supply: u64 = 21000000;
        let per_mint: u64 = 100;
        let per_mint_price: u64 = 1;

        let mut signed_omni_tx_vec = Vec::new();

        // generate a deploy tx
        let mut deploy_tx = p_test_generate_rand_deploy_tx(x_le_bytes);
        deploy_tx.base_asset_data.total_supply_le =
            biguint_to_fixed_bytes_le::<AMOUNT_LEN>(&BigUint::from_u64(total_supply).unwrap());
        deploy_tx.base_asset_data.per_mint_le =
            biguint_to_fixed_bytes_le::<AMOUNT_LEN>(&BigUint::from_u64(per_mint).unwrap());
        deploy_tx.base_asset_data.per_mint_price_le =
            biguint_to_fixed_bytes_le::<AMOUNT_LEN>(&BigUint::from_u64(per_mint_price).unwrap());

        let es_deploy_hash_value = deploy_tx.eip_712_signature_hash();
        let msg_hash = Secp256K1Scalar::from_noncanonical_biguint(BigUint::from_bytes_le(
            &es_deploy_hash_value,
        ));
        let sig_bytes = do_sign_msg_hash(sk, msg_hash);

        signed_omni_tx_vec.push(SignedOmniverseTx::OmniDeployTx(
            deploy_tx.sign(&y_le_bytes, &sig_bytes),
        ));

        let deployed_asset = deploy_tx.generate_deployed_asset::<F, KeccakHash<32>>();
        // generate two mint txes
        let mut minted_tx_vec = Vec::new();
        (0..1).for_each(|_| {
            let mint_tx = p_test_generate_rand_mint_tx(
                x_le_bytes,
                deployed_asset.asset_id,
                per_mint,
                per_mint_price,
            );
            let es_mint_hash_value = mint_tx.eip_712_signature_hash();
            let msg_hash = Secp256K1Scalar::from_noncanonical_biguint(BigUint::from_bytes_le(
                &es_mint_hash_value,
            ));
            let sig_bytes = do_sign_msg_hash(sk, msg_hash);

            signed_omni_tx_vec.push(SignedOmniverseTx::OmniMintTx(
                mint_tx.sign(&y_le_bytes, &sig_bytes),
            ));
            minted_tx_vec.push(mint_tx);
        });

        let mut spend_inputs = Vec::new();
        minted_tx_vec.iter().for_each(|mint_tx| {
            let utxo_to_be_spent = mint_tx.generate_outputs_utxo::<F>(&<MintTransaction as ZK6358DataHashing<F>>::hash_keccak256(&mint_tx));

            let mut inputs = utxo_to_be_spent
                .iter()
                .map(|utxo_tbs| TransactionInput {
                    pre_txid: utxo_tbs.pre_txid,
                    pre_index_le: utxo_tbs.pre_index_le,
                    address: utxo_tbs.address,
                    amount_le: utxo_tbs.amount_le,
                })
                .collect_vec();

            spend_inputs.append(&mut inputs);
        });

        // generate a spend tx
        let mut rng = rand::thread_rng();
        let cut_idx: usize = rng.gen_range(1..spend_inputs.len() - 1);
        (0..2).for_each(|i| {
            let spends_this_time =
                spend_inputs[i * cut_idx..spend_inputs.len() * i + (1 - i) * cut_idx].to_vec();
            let (sp_gas_inputs, sp_gas_outputs) =
                p_test_generate_rand_balanced_inputs_outputs(x_le_bytes);
            let sp_outputs = p_test_generate_out_from_in(&spends_this_time);
            let spend_tx = SpendTransaction {
                asset_id: deployed_asset.asset_id,
                inputs: spends_this_time,
                outputs: sp_outputs,
                gas_fee_tx: GasFeeTransaction {
                    fee_inputs: sp_gas_inputs,
                    fee_outputs: sp_gas_outputs,
                },
            };

            let es_spend_hash_value = spend_tx.eip_712_signature_hash();
            let msg_hash = Secp256K1Scalar::from_noncanonical_biguint(BigUint::from_bytes_le(
                &es_spend_hash_value,
            ));
            let sig_bytes = do_sign_msg_hash(sk, msg_hash);

            signed_omni_tx_vec.push(SignedOmniverseTx::OmniSpendTx(
                spend_tx.sign(&y_le_bytes, &sig_bytes),
            ));
        });

        signed_omni_tx_vec
    }
}