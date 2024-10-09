# Keyring Desktop

Secure, handy and cost-effective hardware wallet for crypto holders.

## Installation

Install Wails and its dependencies: https://wails.io/docs/gettingstarted/installation

## Live Development

To run in live development mode, run `wails dev` in the project directory. This will run a Vite development
server that will provide very fast hot reload of your frontend changes. If you want to develop in a browser
and have access to your Go methods, there is also a dev server that runs on http://localhost:34115. Connect
to this in your browser, and you can call your Go code from devtools.

## Run Tests

```shell
go test ./...
```

## Building

To build a redistributable, production mode package, use `wails build`.

## Database Migrations

Create a new migration file in `db/migrations`

```
dbmate new create_accounts_table
```
