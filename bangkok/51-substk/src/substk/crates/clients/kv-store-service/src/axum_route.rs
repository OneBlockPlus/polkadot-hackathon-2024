use std::sync::Arc;
use anyhow::anyhow;
use axum::{body::{Body, Bytes}, extract::{Path, State}, Json};

use crate::HttpRoute;
use axum::{
    response::IntoResponse,
    routing::{get, post},
    Router,
};
use http::{StatusCode, Uri};
use http_body_util::BodyExt;
use substk_client_kv_store::AccountId;
use tokio::{io, net::ToSocketAddrs};
use crate::jwt::{AuthenticatedUser, generate_jwt, JwtRequest, JwtResponse};
pub use crate::jwt::AppState;

/// Bind the axum router.
pub async fn axum_serve<A: ToSocketAddrs>(route: Router, addr: A) -> io::Result<()> {
    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, route).await
}

/// Export the kv service to axum route.
pub fn axum_router<R: HttpRoute + 'static>(
    state: Arc<AppState<R>>,
) -> Router {
    // let shared_state = Arc::new(AppState { public_key });
    Router::new()
        .route("/api/kv_info", get(kv_info::<R>))
        .route("/api/gas_info/:id", get(gas_info::<R>))
        .route("/api/jwt/:id", post(do_generate_jwt::<R>))
        .route("/api/kv/:id/:path", post(kv_set::<R>).get(kv_get::<R>))
        .fallback(fallback)
        .with_state(state)
}

async fn fallback(uri: Uri) -> (StatusCode, String) {
    (StatusCode::NOT_FOUND, format!("No route for {uri}"))
}

async fn kv_info<R: HttpRoute>(State(state): State<Arc<AppState<R>>>) -> impl IntoResponse {
    let body = state.router.service_info().await;

    let body = match body {
        Ok(body) => serde_json::to_string(&body),
        Err(err) => return (StatusCode::BAD_REQUEST, format!("{err}")).into_response(),
    };

    match body {
        Ok(s) => s.into_response(),
        Err(err) => (StatusCode::BAD_REQUEST, format!("{err}")).into_response(),
    }
}

async fn gas_info<R: HttpRoute>(Path(account_id): Path<String>, State(state): State<Arc<AppState<R>>>) -> impl IntoResponse {
    let account = AccountId::try_from(account_id.as_str()).map_err(|_| anyhow!("Invalid address format"));
    let account = match account {
        Ok(a) => a,
        Err(err) => return (StatusCode::BAD_REQUEST, format!("{err}")).into_response(),
    };

    let body = state.router.gas_info(account).await;

    let body = match body {
        Ok(body) => serde_json::to_string(&body),
        Err(err) => return (StatusCode::BAD_REQUEST, format!("{err}")).into_response(),
    };

    match body {
        Ok(s) => s.into_response(),
        Err(err) => (StatusCode::BAD_REQUEST, format!("{err}")).into_response(),
    }
}

async fn kv_get<R: HttpRoute>(Path((id, path)): Path<(String, String)>, State(state): State<Arc<AppState<R>>>) -> impl IntoResponse {
    let body = state.router.get(id, path).await;

    let body = match body {
        Ok(body) => body,
        Err(err) => return (StatusCode::BAD_REQUEST, format!("{err}")).into_response(),
    };

    let bytes = match body.collect().await {
        Ok(bytes) => bytes.to_bytes(),
        Err(err) => return (StatusCode::BAD_REQUEST, format!("{err}")).into_response(),
    };

    (StatusCode::OK, bytes).into_response()
}

async fn kv_set<R: HttpRoute>(
    _: AuthenticatedUser<R>,
    Path((id, path)): Path<(String, String)>,
    State(state): State<Arc<AppState<R>>>,
    bytes: Bytes,
) -> impl IntoResponse {
    let res = state.router.set(id, path, bytes).await;

    if let Err(err) = res {
        return (StatusCode::BAD_REQUEST, format!("Unhandled internal error: {err}")).into_response();
    }

    (StatusCode::OK, Body::empty()).into_response()
}

pub async fn do_generate_jwt<R: HttpRoute>(
    Path(id): Path<String>,
    State(state): State<Arc<AppState<R>>>,
    // must be the last
    Json(payload): Json<JwtRequest>,
) -> impl IntoResponse {
    let token = match generate_jwt(
        &state.encoding,
        &id,
        &payload.expire_at

    ) {
        Ok(t) => t,
        Err(err) =>  {
            return (StatusCode::BAD_REQUEST, format!("The request json invalid: {}", err)).into_response()
        }
    };

    Json(JwtResponse { token }).into_response()
}