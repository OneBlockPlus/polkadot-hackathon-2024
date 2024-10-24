use serde::{Deserialize, Serialize};
use std::error::Error;
use tokio::net::TcpListener;
use tokio_tungstenite::tungstenite::protocol::Message;
use tokio_tungstenite::accept_async;
use tokio_tungstenite::connect_async;
use futures_util::{SinkExt, StreamExt};

#[derive(Serialize, Deserialize)]
struct ProxyMessage {
    target_ip: String,
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    // Bind to a local TCP listener
    let listener = TcpListener::bind("127.0.0.1:3000").await?;
    println!("Listening on ws://127.0.0.1:3000");

    while let Ok((stream, _)) = listener.accept().await {
        tokio::spawn(handle_connection(stream));
    }

    Ok(())
}

async fn handle_connection(stream: tokio::net::TcpStream) {
    let ws_stream = match accept_async(stream).await {
        Ok(ws_stream) => ws_stream,
        Err(e) => {
            eprintln!("Error during WebSocket handshake: {}", e);
            return;
        }
    };

    let (mut outgoing, mut incoming) = ws_stream.split();

    while let Some(message) = incoming.next().await {
        match message {
            Ok(Message::Text(text)) => {
                println!("Received message from cyborg-connect: {}", text);
                let proxy_message: ProxyMessage = match serde_json::from_str(&text) {
                    Ok(msg) => msg,
                    Err(e) => {
                        eprintln!("Failed to parse message: {}", e);
                        continue;
                    }
                };

                // Connect to the target backend WebSocket
                let target_url = format!("ws://{}:8081", proxy_message.target_ip);
                let backend_ws = match connect_async(&target_url).await {
                    Ok((backend_ws, _)) => backend_ws,
                    Err(e) => {
                        eprintln!("Failed to connect to node: {}", e);
                        continue;
                    }
                };

                let (mut backend_outgoing, mut backend_incoming) = backend_ws.split();

                // Forward data to the backend
                let re = backend_outgoing.send(Message::Text(text)).await;

                if let Ok(()) = re {
                    println!("Message sent to node");
                } else {
                    eprintln!("Failed to send message to backend");
                    continue;
                }

                // Concurrently handle both the backend and frontend streams using tokio::select!
                loop {
                    tokio::select! {
                        // Handle incoming messages from the backend
                        backend_msg = backend_incoming.next() => {
                            match backend_msg {
                                Some(Ok(Message::Text(response_text))) => {
                                    println!("Received response from node: {}", response_text);
                                    if let Err(e) = outgoing.send(Message::Text(response_text)).await {
                                        eprintln!("Error sending message to cyborg-connect: {}", e);
                                        break;
                                    }
                                }
                                Some(Err(e)) => {
                                    eprintln!("Error receiving message from node: {}", e);
                                    break;
                                }
                                None => {
                                    println!("Backend connection closed.");
                                    break;
                                }
                                _ => return
                            }
                        }

                        // Handle incoming messages from the frontend
                        frontend_msg = incoming.next() => {
                            match frontend_msg {
                                Some(Ok(Message::Text(new_text))) => {
                                    println!("Received new message from cyborg-connect: {}", new_text);
                                    // Send this new message to the backend
                                    if let Err(e) = backend_outgoing.send(Message::Text(new_text)).await {
                                        eprintln!("Error sending message to backend: {}", e);
                                        break;
                                    }
                                }
                                Some(Err(e)) => {
                                    eprintln!("Error receiving message from cyborg-connect: {}", e);
                                    break;
                                }
                                None => {
                                    println!("Frontend connection closed.");
                                    break;
                                }
                                _ => return
                            }
                        }
                    }
                }
            }
            Err(e) => {
                eprintln!("Error receiving message from cyborg-connect: {}", e);
                break;
            }
            _ => {}
        }
    }

    println!("Connection closed.");
}