#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, contracterror, symbol_short,
    Address, Bytes, Env, String,
};

#[contracttype]
pub enum DataKey {
    Batch(Bytes),
    Admin,
}

#[contracttype]
#[derive(Clone)]
pub struct BatchRecord {
    pub farm_id:  String,
    pub location: String,
    pub date:     u64,
    pub farmer:   Address,
    pub verified: bool,
    pub paid:     bool,
}

// contracterror is required for Result<T, TraceError> to work in #[contractimpl]
#[contracterror]
#[derive(Clone, PartialEq, Debug)]
pub enum TraceError {
    AlreadyRegistered = 1,
    BatchNotFound     = 2,
    AlreadyVerified   = 3,
    AlreadyPaid       = 4,
    Unauthorized      = 5,
}

#[contract]
pub struct TraceRootContract;

#[contractimpl]
impl TraceRootContract {

    // Set the admin once after deploy
    pub fn init(env: Env, admin: Address) {
        admin.require_auth();
        env.storage().persistent().set(&DataKey::Admin, &admin);
    }

    // Farmer registers a harvest batch on-chain
    // Rejects duplicate hashes — tamper detection
    pub fn register_batch(
        env:        Env,
        farmer:     Address,
        batch_hash: Bytes,
        farm_id:    String,
        location:   String,
        date:       u64,
    ) -> Result<(), TraceError> {
        farmer.require_auth();

        if env.storage().persistent().has(&DataKey::Batch(batch_hash.clone())) {
            return Err(TraceError::AlreadyRegistered);
        }

        let record = BatchRecord {
            farm_id,
            location,
            date,
            farmer: farmer.clone(),
            verified: false,
            paid: false,
        };

        env.storage()
            .persistent()
            .set(&DataKey::Batch(batch_hash.clone()), &record);

        env.events().publish(
            (symbol_short!("REGISTER"), farmer),
            batch_hash,
        );

        Ok(())
    }

    // Buyer verifies a batch — marks it verified and emits event
    pub fn verify_batch(
        env:        Env,
        buyer:      Address,
        batch_hash: Bytes,
    ) -> Result<bool, TraceError> {
        buyer.require_auth();

        let mut record: BatchRecord = env
            .storage()
            .persistent()
            .get(&DataKey::Batch(batch_hash.clone()))
            .ok_or(TraceError::BatchNotFound)?;

        if record.verified {
            return Err(TraceError::AlreadyVerified);
        }

        record.verified = true;
        env.storage()
            .persistent()
            .set(&DataKey::Batch(batch_hash.clone()), &record);

        env.events().publish(
            (symbol_short!("VERIFY"), buyer),
            batch_hash,
        );

        Ok(true)
    }

    // Buyer links payment after verification — records it on-chain
    pub fn link_payment(
        env:        Env,
        buyer:      Address,
        batch_hash: Bytes,
    ) -> Result<(), TraceError> {
        buyer.require_auth();

        let mut record: BatchRecord = env
            .storage()
            .persistent()
            .get(&DataKey::Batch(batch_hash.clone()))
            .ok_or(TraceError::BatchNotFound)?;

        if !record.verified {
            return Err(TraceError::Unauthorized);
        }

        if record.paid {
            return Err(TraceError::AlreadyPaid);
        }

        record.paid = true;
        env.storage()
            .persistent()
            .set(&DataKey::Batch(batch_hash.clone()), &record);

        env.events().publish(
            (symbol_short!("PAYMENT"), buyer),
            batch_hash,
        );

        Ok(())
    }

    // Read-only: fetch full batch record for frontend / QR page
    pub fn get_batch(
        env:        Env,
        batch_hash: Bytes,
    ) -> Result<BatchRecord, TraceError> {
        env.storage()
            .persistent()
            .get(&DataKey::Batch(batch_hash))
            .ok_or(TraceError::BatchNotFound)
    }
}

#[cfg(test)]
mod test;