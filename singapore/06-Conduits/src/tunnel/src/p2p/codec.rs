use std::io;

use async_trait::async_trait;
use futures::prelude::*;
use libp2p::swarm::StreamProtocol;
use prost::Message;

use crate::tunnel::proto;

/// Max request size in bytes
const REQUEST_SIZE_MAXIMUM: u64 = 1024 * 1024;
/// Max response size in bytes
const RESPONSE_SIZE_MAXIMUM: u64 = 10 * 1024 * 1024;

#[derive(Clone, Default)]
pub struct Codec;

#[async_trait]
impl libp2p::request_response::Codec for Codec {
    type Protocol = StreamProtocol;
    type Request = proto::Tunnel;
    type Response = Option<proto::Tunnel>;

    async fn read_request<T>(
        &mut self,
        _: &Self::Protocol,
        io: &mut T,
    ) -> io::Result<Self::Request>
    where
        T: AsyncRead + Unpin + Send,
    {
        let mut vec = Vec::new();

        io.take(REQUEST_SIZE_MAXIMUM).read_to_end(&mut vec).await?;

        proto::Tunnel::decode(vec.as_slice()).map_err(decode_into_io_error)
    }

    async fn read_response<T>(
        &mut self,
        _: &Self::Protocol,
        io: &mut T,
    ) -> io::Result<Self::Response>
    where
        T: AsyncRead + Unpin + Send,
    {
        let mut vec = Vec::new();

        io.take(RESPONSE_SIZE_MAXIMUM).read_to_end(&mut vec).await?;

        if vec.is_empty() {
            return Ok(None);
        }

        proto::Tunnel::decode(vec.as_slice())
            .map(Some)
            .map_err(decode_into_io_error)
    }

    async fn write_request<T>(
        &mut self,
        _: &Self::Protocol,
        io: &mut T,
        req: Self::Request,
    ) -> io::Result<()>
    where
        T: AsyncWrite + Unpin + Send,
    {
        let data = req.encode_to_vec();
        io.write_all(data.as_ref()).await?;
        Ok(())
    }

    async fn write_response<T>(
        &mut self,
        _: &Self::Protocol,
        io: &mut T,
        resp: Self::Response,
    ) -> io::Result<()>
    where
        T: AsyncWrite + Unpin + Send,
    {
        let mut data = vec![];

        if let Some(resp) = resp {
            data.extend_from_slice(resp.encode_to_vec().as_slice());
        };

        io.write_all(data.as_ref()).await?;

        Ok(())
    }
}

fn decode_into_io_error(err: prost::DecodeError) -> io::Error {
    io::Error::new(io::ErrorKind::InvalidData, err)
}

#[cfg(test)]
mod tests {
    use futures::AsyncWriteExt;
    use futures_ringbuf::Endpoint;
    use libp2p::request_response::Codec as _;
    use libp2p::swarm::StreamProtocol;

    use super::*;
    use crate::proto;

    #[tokio::test]
    async fn test_codec() {
        let expected_request = proto::Tunnel {
            tunnel_id: "1".to_string(),
            command: proto::TunnelCommand::Connect.into(),
            data: None,
        };
        let expected_response = proto::Tunnel {
            tunnel_id: "1".to_string(),
            command: proto::TunnelCommand::ConnectResp.into(),
            data: None,
        };
        let protocol = StreamProtocol::new("/test_pproxy/1");

        let (mut a, mut b) = Endpoint::pair(124, 124);
        Codec
            .write_request(&protocol, &mut a, expected_request.clone())
            .await
            .expect("Should write request");
        a.close().await.unwrap();

        let actual_request = Codec
            .read_request(&protocol, &mut b)
            .await
            .expect("Should read request");
        b.close().await.unwrap();

        assert_eq!(actual_request, expected_request);

        let (mut a, mut b) = Endpoint::pair(124, 124);
        Codec
            .write_response(&protocol, &mut a, Some(expected_response.clone()))
            .await
            .expect("Should write response");
        a.close().await.unwrap();

        let actual_response = Codec
            .read_response(&protocol, &mut b)
            .await
            .expect("Should read response");
        b.close().await.unwrap();

        assert_eq!(actual_response, Some(expected_response));
    }
}
