use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize, Default)]
pub struct VerifiedSealedMeta {
    pub pflix_issuer: String,
    pub assets_id: String,
    pub owner: String,
    pub issue_time: chrono::DateTime<chrono::Utc>,
}
