# Marketplace Backend

This project is a Gin-based web server providing APIs to manage device listings and rentals on a blockchain. The server interacts with a database to store and retrieve device information, listing details, and rental status.

## Configure settings

Create a configuration file (e.g., `config.yaml`) with the necessary settings for your environment.

## API Endpoints

| Method | Endpoint                  | Description                                                       |
| ------ | ------------------------- | ----------------------------------------------------------------- |
| GET    | `/api/v1/devices/market`  | Retrieves a list of devices that are available on the market      |
| GET    | `/api/v1/devices/listing` | Retrieves a list of devices listed by a specific owner            |
| GET    | `/api/v1/devices/renting` | Retrieves a list of devices currently rented by a specific tenant |

## Run

```bash
go run main.go ./config.yaml
```
