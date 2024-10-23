# Automation

This directory contains ansible playbooks to automate setting up the `sov-rollup-starter` binary on a remote Amazon Web Services(AWS) machine. 

The ansible playbooks can potentially work on any machine with two disks, 
but have been tested using the AWS machine mentioned below.

Basic knowledge of AWS and [Ansible](https://docs.ansible.com/ansible/latest/index.html) is required.

## About

This setup describes 2 possible deployment scenarios:

1. For a simpler setup which connects to a mock DA.
2. For more realistic setup use Celestia Testnet.

## Machine Recommendations

* AWS [`c5ad.4xlarge`](https://aws.amazon.com/ec2/instance-types/c5/). Please make sure region you're using has this instance available. us-west-2 (Oregon) can be a good candidate.
  * 16 CPU cores
  * 2 x NVME SSD
  * 32 GB RAM
* Ubuntu 22.04 LTS.
* Root volume >=100GB gp3, to accommodate a build process of the rollup.
* If a new AWS SSH keypair has been created:
  * Move `.pem` file to the `~/.ssh`: `mv ~/Downloads/YourAWSKey.pem ~/.ssh/`.
  * Check its permissions: `chmod og-r ~/.ssh/YourAWSKey.pem`
* Tip: if it is not the first time, please re-use some of the existing security groups.
* Please wait till the instance is fully initialized.


Before proceeding, it might be good to check that you can ssh into the instance:

```bash
ssh -i ~/.ssh/YourAWSKey.pem ubuntu@<EC2_INSTANCE_IP>
```

## Required Software Installation (macOS)
* Homebrew - https://brew.sh/
* [Ansible](https://docs.ansible.com/ansible/latest/getting_started/introduction.html?extIdCarryOver=true&sc_cid=701f2000001OH6uAAG)
```
$ brew install ansible go
$ ansible --version
ansible [core 2.16.5]
$ go version
go version go1.22.5 darwin/arm64
```

## Key generation (Celestia Only)

This step can be skipped for Mock Da.

This is a one-time step to generate the Celestia keypair that will be used to post blobs. Follow the guide here [KEYGEN](./KEYGEN.md)

## Ansible variables to edit
* [common](roles/common/defaults/main.yaml)
  * (Optional) Primary variables to edit for Prometheus
    * `aws_prometheus_remote_write_url`
    * `aws_prometheus_monitoring_label`
    * `aws_region`
* [data-availability](roles/data-availability/celestia/defaults/main.yaml)
  * Modify `cluster` to `testnet` or `mainnet` depending on the variables you want to pick
  * [testnet](roles/data-availability/celestia/defaults/testnet/variables.yaml)
  * [mainnet](roles/data-availability/celestia/defaults/mainnet/variables.yaml)
  * Primary variables to edit (described in [KEYGEN](./KEYGEN.md))
    * `key_name`
    * `key_address_filename`
    * `da_start_from`: This variable can to be edited for faster sync. Fetch the latest height from any celestia RPC (eg: https://mocha.celenium.io/)
    * `da_rollup_start_from`: This should be couple blocks behind `da_start_from`
* [rollup](roles/rollup/defaults/main.yaml)
  *  Modify `cluster` to `testnet` or `mainnet` depending on the variables you want to pick
  * [testnet](roles/rollup/defaults/testnet/variables.yaml) or [mainnet](roles/rollup/defaults/mainnet/variables.yaml):
    * ⚠️`rollup_commit_hash`: Commit hash of rollup starter repo. **Without updating new changes won't be available on remote instance.**
    * `rollup_namespace_prefix` and `rollup_proof_namespace_prefix` : This way name spaces can be isolated from other deployments.
    * `sequencer_genesis_rollup_address` should match Celestia address, so the node will accept transactions sent by sequencer. 
    * All other the variables will likely need to be edited (variables are described in comments)
      * `rollup_da_start_height` can be set a few slots higher than `da_start_from`

## Steps to launch the rollup

At this point AWS machine is up and running, IP address is known, as well as SSH `.pem` key.

* Ensure that AWS key that has been used for creating Amazon EC2 instance is part of the ssh agent: `ssh-add ~/.ssh/YourAWSKey.pem`. This key is needed to ansible provision machine 
* Ensure that your GitHub SSH keys is a part of the ssh agent, so it can fetch code from private WIP repos. This key is needed to get access to GitHub repo. If repo is publicly accessible it is not needed

```bash
ssh-add -l
2048 SHA256:udAui6vtUjoAtuza7l+x5tZsoq+cAzvD5TNjh6SuhyA ~/.ssh/YourAWSKey.pem (RSA)
2048 SHA256:Bxv9vtL64zz2QuhEysRiF2s5WPLVp99YpgdNfqJe5u4 ~/.ssh/github_id_rsa (RSA)
```

* Run the ansible command to set up the machine from the automation folder

```bash
cd automation
```

⚠️ Comma after IP address is important.

**For Mock DA**:

```bash
ansible-playbook setup.yaml -i '<ip_address>,' -u ubuntu --private-key ~/.ssh/<aws_ssh_key>.pem -e 'ansible_ssh_common_args="-o ForwardAgent=yes" -e 'switches=cdr' -e data_availability_role=mock'
```

**For Celestia**:

```bash
$ ansible-playbook setup.yaml -i '<ip_address>,' -u ubuntu --private-key ~/.ssh/YourAWSKey.pem -e 'ansible_ssh_common_args="-o ForwardAgent=yes" -e 'switches=cdr' -e data_availability_role=celestia'
```


And the output should be something like this:


```
PLAY [Playbook Runner] ********************************************************************************************************************************************************************
...

PLAY RECAP ********************************************************************************************************************************************************************************
<ip_address>             : ok=93   changed=30   unreachable=0    failed=0    skipped=36   rescued=0    ignored=1
```

This is the expected output. Please note that `failed` should be `0`.

## Notes

* `da_start_from` and `rollup_da_start_height` make this significantly faster by starting from a trusted hash. check: [da_rpc_queries.py](scripts/python/da_rpc_queries.py)
* The next points are only relevant if not using `da_start_from` 
* The DA layer catch up takes some time to catch up if syncing from genesis, so if the above command gets stuck during the task named `Loop until height is greater than to_height`, it can be ctrl+c'd and re-run.
* Progress can also be monitored by ssh-ing to the machine and running the following command after switching to the `sovereign` user
```
$ sudo su - sovereign
$ celestia header sync-state --node.store /mnt/da
{
  "result": {
    "id": 2,
    "height": 1430909,
    "from_height": 1387516,
    "to_height": 1387831,
    "from_hash": "EC63CCC2D4F6E36FB42B4C1BF302D21A428CB45617B4CD4FF0AE82A4BE85B6F1",
    "to_hash": "C6048F0C08D4FAE92CAAF9569BF483594127C2D3D79F49FE45EA3005C7FAC5AF",
    "start": "2024-03-15T12:38:54.119717467Z",
    "end": "2024-03-15T12:38:54.11985308Z"
  }
```
* Once the DA light client catches up `height` will be greater than `to_height`

## Structure

The automation folder consists of 3 ansible roles which are executed on a remote machine
* `common`
  * Installs base Ubuntu dependencies
  * Rust, Golang, compiler tools
  * Disk setup and mounting
  * User creation (sovereign user)
  * Kernel and OS tuning
  * Prometheus installation
  * [Chrony](https://chrony-project.org/) for time sync
* `data-availability`
  * For Celestia
    * Download and install Celestia
    * Upload user generated keys from local to the remote machine
    * Start the Data Availability service
    * Wait for the Data Availability service to be caught up
  * For Mock DA only genesis variables are configured
* `rollup`
  * Download the `sov-rollup-starter` repository
  * ⚠️Check out the specific commit mentioned in the variables
  * Edit configuration files based on variables
  * Start the rollup binary as a `systemd` service

## Usage
The ansible playbook behavior can be changed by modifying the `switches` variable
* switches
  * `c`: common
  * `d`: data availability
  * `r`: rollup
* `data_availability_role` controls if `mock` or `celestia` DA is used
  * `-e 'data_availability_role=celestia'` For celestia
  * `-e 'data_availability_role=mock'`
* Setting up the machine from scratch: `-e 'switches=cdr'`
  * All the above installations are completed
  * rollup service is started
* Updating the rollup binary: `-e 'switches=r'`
  * rollup service is stopped
  * git is updated
  * rollup binary is rebuilt
  * rollup service is started
* Updating the rollup binary and wiping the rollup's data storage directory `-e 'switches=r' -e wipe=true`

## Running harness

(!) Currently it is not possible, due to hardcoded STF, but steps are following is the following:

1. Login into AWS instance and checkout Sovereign SDK repo in home folder
2. cd `sovereign-sdk-wip`
3. Run this command:
  ```
  cargo run --bin test-harness -- \
      --private-keys-dir ../sov-rollup-starter-wip/test-data/keys \
      --genesis-dir ../sov-rollup-starter-wip/automation/roles/rollup/files/genesis \
      --rollup-config-path /home/sovereign/rollup_config.toml \
      --celestia-batch-namespace sov-p-ng01 \
      --max-batch-size-tx=5 \
      --max-batch-size-bytes=10000 \
      --new-users-count=10 \
      --max-num-txs=50 \
      --interval=2000
  ```

## Troubleshooting

Status of the service:
```bash
sudo systemctl status rollup
```

Service logs:
```bash
journalctl -u rollup
```

Non-panic log messages are also available in the file:
```bash
tail -f /mnt/logs/rollup.log.<DATE>
```