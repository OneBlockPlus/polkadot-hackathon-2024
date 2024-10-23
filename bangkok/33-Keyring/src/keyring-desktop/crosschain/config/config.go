package config

import (
	"errors"
	"io/ioutil"
	"os"
	"strings"

	vault "github.com/hashicorp/vault/api"
)

func newVaultClient(cfg *vault.Config) (VaultLoader, error) {
	cli, err := vault.NewClient(cfg)
	if err != nil {
		return &DefaultVaultLoader{}, err
	}
	return &DefaultVaultLoader{Client: cli}, nil
}

var NewVaultClient = newVaultClient

type DefaultVaultLoader struct {
	*vault.Client
}

var _ VaultLoader = &DefaultVaultLoader{}

func (v *DefaultVaultLoader) LoadSecretData(vaultPath string) (*vault.Secret, error) {
	secret, err := v.Logical().Read(vaultPath)
	if err != nil || secret == nil { // yes, secret can be nil
		return &vault.Secret{}, err
	}
	return secret, nil
}

type VaultLoader interface {
	LoadSecretData(path string) (*vault.Secret, error)
}

// GetSecret returns a secret, e.g. from env variable. Extend as needed.
func GetSecret(uri string) (string, error) {
	value := uri

	splits := strings.Split(value, ":")
	if len(splits) < 2 {
		return "", errors.New("invalid secret source for: ***")
	}

	path := splits[1]
	switch key := splits[0]; key {
	case "env":
		return strings.TrimSpace(os.Getenv(path)), nil
	case "file":
		if len(path) > 1 && path[0] == '~' {
			path = strings.Replace(path, "~", os.Getenv("HOME"), 1)
		}
		file, err := os.Open(path)
		defer file.Close()
		if err != nil {
			return "", err
		}
		result, err := ioutil.ReadAll(file)
		if err != nil {
			return "", err
		}
		return strings.TrimSpace(string(result)), nil
	case "vault":
		vaultArgString := strings.Join(splits[1:], ":")
		vaultArgs := strings.Split(vaultArgString, ",")
		if len(vaultArgs) != 2 {
			return "", errors.New("vault secret has 2 comma separated arguments (url,path)")
		}
		// expect VAULT_TOKEN in env
		vaultUrl := vaultArgs[0]
		vaultFullPath := vaultArgs[1]

		cfg := &vault.Config{Address: vaultUrl}
		// just check the error
		_, err := vault.NewClient(cfg)
		if err != nil {
			return "", err
		}
		client, err := NewVaultClient(cfg)
		if err != nil {
			return "", err
		}

		idx := strings.LastIndex(vaultFullPath, "/")
		if idx == -1 || idx == len(vaultFullPath) { // idx shouldn't be the last char
			return "", errors.New("malformed vault secret in config file")
		}
		vaultKey := vaultFullPath[idx+1:]
		vaultPath := vaultFullPath[:idx]

		secret, err := client.LoadSecretData(vaultPath)
		if err != nil {
			return "", err
		}
		data, _ := secret.Data["data"].(map[string]interface{})
		result, _ := data[vaultKey].(string)
		return strings.TrimSpace(result), nil
	case "plain":
		return path, nil
	}
	return "", errors.New("invalid secret source for: ***")
}
