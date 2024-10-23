#![cfg(test)]

use crate::{mock::*, Error, Event};
use frame_support::{assert_noop, assert_ok};
use sp_runtime::BoundedVec;

// DID Creation Tests
#[test]
fn create_did_works() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1);
        assert_ok!(TemplateModule::create_did(RuntimeOrigin::signed(1)));
        assert!(TemplateModule::did_documents(1).is_some());
        System::assert_last_event(Event::DidDocumentCreated { 
            did: 1, 
            controller: 1 
        }.into());
    });
}

#[test]
fn create_duplicate_did_fails() {
    new_test_ext().execute_with(|| {
        assert_ok!(TemplateModule::create_did(RuntimeOrigin::signed(1)));
        assert_noop!(
            TemplateModule::create_did(RuntimeOrigin::signed(1)),
            Error::<Test>::DidDocumentAlreadyExists
        );
    });
}

// Chain Linking Tests
#[test]
fn link_chain_works() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1);
        
        // Create DID first
        assert_ok!(TemplateModule::create_did(RuntimeOrigin::signed(1)));
        
        // Link Ethereum chain
        let chain_name: Vec<u8> = b"ethereum".to_vec();
        let address: Vec<u8> = b"0x1234567890123456789012345678901234567890".to_vec();
        
        assert_ok!(TemplateModule::link_chain(
            RuntimeOrigin::signed(1),
            chain_name,
            1,
            address.clone()
        ));
        
        System::assert_last_event(Event::ChainLinked {
            did: 1,
            chain_id: 1,
            address
        }.into());
    });
}

#[test]
fn link_chain_without_did_fails() {
    new_test_ext().execute_with(|| {
        let chain_name: Vec<u8> = b"ethereum".to_vec();
        let address: Vec<u8> = b"0x1234567890123456789012345678901234567890".to_vec();
        
        assert_noop!(
            TemplateModule::link_chain(
                RuntimeOrigin::signed(1),
                chain_name,
                1,
                address
            ),
            Error::<Test>::DidDocumentNotFound
        );
    });
}

#[test]
fn link_chain_exceeds_max_fails() {
    new_test_ext().execute_with(|| {
        assert_ok!(TemplateModule::create_did(RuntimeOrigin::signed(1)));
        
        // Try to link more chains than MaxLinkedChains
        for i in 1..=11 {
            let chain_name: Vec<u8> = format!("chain{}", i).into_bytes();
            let address: Vec<u8> = b"0x1234567890123456789012345678901234567890".to_vec();
            
            if i <= 10 {
                assert_ok!(TemplateModule::link_chain(
                    RuntimeOrigin::signed(1),
                    chain_name,
                    i as u32,
                    address.clone()
                ));
            } else {
                assert_noop!(
                    TemplateModule::link_chain(
                        RuntimeOrigin::signed(1),
                        chain_name,
                        i as u32,
                        address
                    ),
                    Error::<Test>::MaxLinkedChainsReached
                );
            }
        }
    });
}

// Chain Unlinking Tests
#[test]
fn unlink_chain_works() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1);
        
        // Setup: Create DID and link chain
        assert_ok!(TemplateModule::create_did(RuntimeOrigin::signed(1)));
        let chain_name: Vec<u8> = b"ethereum".to_vec();
        let address: Vec<u8> = b"0x1234567890123456789012345678901234567890".to_vec();
        assert_ok!(TemplateModule::link_chain(
            RuntimeOrigin::signed(1),
            chain_name,
            1,
            address.clone()
        ));
        
        // Test unlinking
        assert_ok!(TemplateModule::unlink_chain(
            RuntimeOrigin::signed(1),
            1,
            1
        ));
        
        System::assert_last_event(Event::ChainUnlinked {
            did: 1,
            chain_id: 1
        }.into());
    });
}

#[test]
fn unlink_nonexistent_chain_fails() {
    new_test_ext().execute_with(|| {
        assert_ok!(TemplateModule::create_did(RuntimeOrigin::signed(1)));
        
        assert_noop!(
            TemplateModule::unlink_chain(RuntimeOrigin::signed(1), 1, 999),
            Error::<Test>::ChainNotLinked
        );
    });
}

// Public Key Management Tests
#[test]
fn add_public_key_works() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1);
        assert_ok!(TemplateModule::create_did(RuntimeOrigin::signed(1)));
        
        let key_type: Vec<u8> = b"Ed25519".to_vec();
        let key: Vec<u8> = b"abcdef1234567890".to_vec();
        
        assert_ok!(TemplateModule::add_public_key(
            RuntimeOrigin::signed(1),
            1,
            key_type.clone(),
            key.clone()
        ));
        
        System::assert_last_event(Event::PublicKeyAdded {
            did: 1,
            key_type,
            key
        }.into());
    });
}

#[test]
fn remove_public_key_works() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1);
        
        // Setup: Create DID and add public key
        assert_ok!(TemplateModule::create_did(RuntimeOrigin::signed(1)));
        let key_type: Vec<u8> = b"Ed25519".to_vec();
        let key: Vec<u8> = b"abcdef1234567890".to_vec();
        assert_ok!(TemplateModule::add_public_key(
            RuntimeOrigin::signed(1),
            1,
            key_type.clone(),
            key.clone()
        ));
        
        // Test removing key
        assert_ok!(TemplateModule::remove_public_key(
            RuntimeOrigin::signed(1),
            1,
            0
        ));
        
        System::assert_last_event(Event::PublicKeyRemoved {
            did: 1,
            key_id: 0
        }.into());
    });
}

// Service Tests
#[test]
fn add_service_works() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1);
        assert_ok!(TemplateModule::create_did(RuntimeOrigin::signed(1)));
        
        let service_type: Vec<u8> = b"DIDCommMessaging".to_vec();
        let endpoint: Vec<u8> = b"https://example.com/endpoint".to_vec();
        
        assert_ok!(TemplateModule::add_service(
            RuntimeOrigin::signed(1),
            1,
            service_type.clone(),
            endpoint.clone()
        ));
        
        System::assert_last_event(Event::ServiceAdded {
            did: 1,
            service_type,
            endpoint
        }.into());
    });
}

#[test]
fn remove_service_works() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1);
        
        // Setup: Create DID and add service
        assert_ok!(TemplateModule::create_did(RuntimeOrigin::signed(1)));
        let service_type: Vec<u8> = b"DIDCommMessaging".to_vec();
        let endpoint: Vec<u8> = b"https://example.com/endpoint".to_vec();
        assert_ok!(TemplateModule::add_service(
            RuntimeOrigin::signed(1),
            1,
            service_type.clone(),
            endpoint.clone()
        ));
        
        // Test removing service
        assert_ok!(TemplateModule::remove_service(
            RuntimeOrigin::signed(1),
            1,
            0
        ));
        
        System::assert_last_event(Event::ServiceRemoved {
            did: 1,
            service_id: 0
        }.into());
    });
}