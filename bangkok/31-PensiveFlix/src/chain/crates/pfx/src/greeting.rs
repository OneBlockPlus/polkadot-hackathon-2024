use crate::expert::PflixExpertStub;
use pfx_api::greeting::{
    greeting_server::{Greeting, GreetingServer as GreetingServerPb},
    HelloRequest, HelloResponse,
};
use std::result::Result as StdResult;
use tonic::{Request, Response, Status};

pub type Result<T> = StdResult<Response<T>, Status>;
pub type GreetingServer = GreetingServerPb<GreetingServerImpl>;

pub struct GreetingServerImpl {}

pub fn new_greeting_server(_pflix_expert: PflixExpertStub) -> GreetingServer {
    GreetingServerPb::new(GreetingServerImpl {})
}

#[tonic::async_trait]
impl Greeting for GreetingServerImpl {
    async fn say_hello(&self, request: Request<HelloRequest>) -> Result<HelloResponse> {
        let request = request.into_inner();
        Ok(Response::new(HelloResponse { words: format!("Hello, {}", request.name) }))
    }
}
