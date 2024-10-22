use std::marker::PhantomData;
use axum::{extract::{State, FromRequestParts}, http::{request::Parts, StatusCode, header::AUTHORIZATION}};
use jsonwebtoken::{decode, DecodingKey, encode, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use std::time::{SystemTime, UNIX_EPOCH};
use anyhow::bail;
use axum::extract::{FromRef};
use chrono::{DateTime, };

use crate::HttpRoute;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Claims {
    sub: String,
    exp: u64,
}

/// The app state.
pub struct AppState<R: HttpRoute> {
    pub router: R,
    pub encoding: EncodingKey,
    pub decoding: DecodingKey,
}

impl<R: HttpRoute> AppState<R> {
    pub fn new_shared(
        router: R,
        private_key: &str,
    ) -> anyhow::Result<Arc<Self>> {
        let encoding = EncodingKey::from_base64_secret(private_key)?;
        let decoding = DecodingKey::from_base64_secret(private_key)?;

        Ok(
            Arc::new(Self {
                router,
                encoding,
                decoding,
            })
        )
    }
}


#[derive(Deserialize, Clone)]
pub struct JwtRequest {
    pub expire_at: String,
}

#[derive(Serialize, Clone)]
pub struct JwtResponse {
    pub token: String,
}

pub struct AuthenticatedUser<R> {
    #[allow(unused)]
    pub claims: Claims,
    pub _marker: PhantomData<R>,
}

#[async_trait::async_trait]
impl<R: HttpRoute, S> FromRequestParts<S> for AuthenticatedUser<R>
where
    Arc<AppState<R>>: FromRef<S>,
    S: Send + Sync,
{
    type Rejection = (StatusCode, &'static str);

    async fn from_request_parts(parts: &mut Parts, state: &S) -> Result<Self, Self::Rejection> {
        let app_state = Arc::from_ref(state);
        let claims = verify_jwt(State(app_state), parts.clone()).await?;
        Ok(AuthenticatedUser {
            claims,
            _marker: PhantomData,
        })
    }
}

/// Extract JWT from Authorization
async fn verify_jwt<R: HttpRoute>(
    State(state): State<Arc<AppState<R>>>,
    req: Parts,
) -> Result<Claims, (StatusCode, &'static str)> {
    let headers = req.headers;
    if let Some(auth_header) = headers.get(AUTHORIZATION) {
        let auth_str = auth_header.to_str().unwrap_or("");
        if let Some(token) = auth_str.strip_prefix("Bearer ") {
            return decode::<Claims>(
                token,
                &state.decoding,
                &Validation::default(),
            )
                .map(|data| data.claims)
                .map_err(|_err| (StatusCode::UNAUTHORIZED, "Invalid token"))
                .and_then(|claims| {
                    if claims.exp < timestamp_now() {
                        return Err((StatusCode::UNAUTHORIZED, "Expired token"))
                    } else {
                        Ok(claims)
                    }
                });
        }
    }
    Err((StatusCode::UNAUTHORIZED, "Missing or invalid authorization header"))
}


pub fn generate_jwt(key: &EncodingKey, user_id: &str, expire_at: &str) -> anyhow::Result<String> {
    let time = DateTime::parse_from_rfc2822(expire_at)?;

    let now = timestamp_now();
    let exp = time.to_utc().timestamp() as u64;
    // too old
    if now >= exp {
        bail!("The expire_at time is expired already");
    }

    let claims = Claims {
        sub: user_id.to_string(),
        exp,
    };

    let token  = encode(
        &Header::default(),
        &claims,
        key,
    )?;

    Ok(token)
}

fn timestamp_now() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .expect("Time went backwards").as_secs()
}
