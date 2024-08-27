use std::collections::HashMap;
use std::time::Duration;
use std::time::Instant;

use libp2p::PeerId;
use serde::Deserialize;

const ACCESS_TTL: Duration = Duration::from_secs(10 * 60);

pub struct AccessClient {
    endpoint: reqwest::Url,
    client: reqwest::Client,
    cache: HashMap<PeerId, (bool, Instant)>,
}

#[derive(Deserialize)]
struct AccessClientResponse {
    data: bool,
}

impl AccessClient {
    pub fn new(endpoint: reqwest::Url) -> AccessClient {
        AccessClient {
            endpoint,
            client: reqwest::Client::new(),
            cache: HashMap::default(),
        }
    }

    async fn request_endpoint(&mut self, peer: &PeerId) -> Result<bool, reqwest::Error> {
        let url = self.endpoint.join("access").unwrap();
        let params = [("peer_id", peer.to_string())];

        let response = self
            .client
            .get(url)
            .query(&params)
            .send()
            .await?
            .error_for_status()?
            .json::<AccessClientResponse>()
            .await?;

        Ok(response.data)
    }

    pub async fn is_valid(&mut self, peer: &PeerId) -> bool {
        self.cache
            .retain(|_, (_, created)| created.elapsed() < ACCESS_TTL);

        if let Some((valid, _)) = self.cache.get(peer) {
            return *valid;
        }

        match self.request_endpoint(peer).await {
            Err(e) => {
                tracing::error!(
                    "error while requesting access endpoint (will return false) for {}: {}",
                    peer,
                    e
                );
                false
            }

            Ok(valid) => {
                self.cache.insert(*peer, (valid, Instant::now()));
                valid
            }
        }
    }

    pub fn expire(&mut self, token: &PeerId) {
        tracing::debug!("expire token: {} from cache", token);
        self.cache.remove(token);
    }
}
