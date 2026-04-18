#[cfg(test)]
mod tests {
    use crate::{TraceRootContract, TraceRootContractClient, TraceError};
    use soroban_sdk::{
        testutils::Address as _,
        Address, Bytes, Env, String,
    };

    // ---------------------------------------------------
    // TEST 1 — Happy Path
    // Batch registers successfully, no errors returned
    // ---------------------------------------------------
    #[test]
    fn test_register_batch_success() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register(TraceRootContract, ());
        let client = TraceRootContractClient::new(&env, &contract_id);

        let farmer = Address::generate(&env);
        let admin  = Address::generate(&env);

        client.init(&admin);

        let hash = Bytes::from_array(&env, &[1u8; 32]);

        // Should succeed without panic
        client.register_batch(
            &farmer,
            &hash,
            &String::from_str(&env, "FARM-DAV-0042"),
            &String::from_str(&env, "7.0731,125.6128"),
            &1_700_000_000u64,
        );
    }

    // ---------------------------------------------------
    // TEST 2 — Edge Case
    // Duplicate hash registration must panic (contract error)
    // ---------------------------------------------------
    #[test]
    #[should_panic]
    fn test_duplicate_batch_rejected() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register(TraceRootContract, ());
        let client = TraceRootContractClient::new(&env, &contract_id);

        let farmer = Address::generate(&env);
        let admin  = Address::generate(&env);

        client.init(&admin);

        let hash = Bytes::from_array(&env, &[2u8; 32]);

        // First call — succeeds
        client.register_batch(
            &farmer,
            &hash,
            &String::from_str(&env, "FARM-DAV-0099"),
            &String::from_str(&env, "7.1000,125.6000"),
            &1_700_000_001u64,
        );

        // Second call with same hash — must panic with AlreadyRegistered
        client.register_batch(
            &farmer,
            &hash,
            &String::from_str(&env, "FARM-DAV-0099"),
            &String::from_str(&env, "7.1000,125.6000"),
            &1_700_000_001u64,
        );
    }

    // ---------------------------------------------------
    // TEST 3 — State Verification
    // Storage reflects correct farmer, farm_id, and flags
    // ---------------------------------------------------
    #[test]
    fn test_storage_reflects_correct_state() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register(TraceRootContract, ());
        let client = TraceRootContractClient::new(&env, &contract_id);

        let farmer = Address::generate(&env);
        let admin  = Address::generate(&env);

        client.init(&admin);

        let hash = Bytes::from_array(&env, &[3u8; 32]);

        client.register_batch(
            &farmer,
            &hash,
            &String::from_str(&env, "FARM-DAV-0007"),
            &String::from_str(&env, "6.9000,125.5000"),
            &1_700_000_002u64,
        );

        let record = client.get_batch(&hash);

        assert_eq!(record.farmer,   farmer);
        assert_eq!(record.farm_id,  String::from_str(&env, "FARM-DAV-0007"));
        assert_eq!(record.verified, false);
        assert_eq!(record.paid,     false);
    }
}