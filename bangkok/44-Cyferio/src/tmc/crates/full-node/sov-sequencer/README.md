# Sov-Sequencer

Simple implementation of based sequencer generic over batch builder and DA service. See `openapi-v3.yaml` to see the documentation for its API.

### Submit transactions

Please see [`demo-rollup` README](../../examples/demo-rollup/README.md#how-to-submit-transactions).

### Publish blob

To submit transactions to DA layer, sequencer needs to publish them. This can be done by triggering `publishBatch` endpoint:

```bash
./target/debug/sov-cli publish-batch ...
```

or using plain curl:

```bash
curl -sS -X POST -H "Content-Type: application/json" --data '{"transactions": []}' http://localhost:12346/sequencer/batches
```

After some time, processed transaction should appear in logs of running rollup
