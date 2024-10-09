package utils

import "os"

func AppConfigPath() (string, error) {
	dataPath, err := DataPath()
	if err != nil {
		return "", err
	}
	err = os.MkdirAll(dataPath, os.ModePerm)
	if err != nil {
		return "", err
	}
	return dataPath + "/config.json", nil
}

func SQLiteDatabasePath() (string, error) {
	dataPath, err := DataPath()
	if err != nil {
		return "", err
	}
	err = os.MkdirAll(dataPath, os.ModePerm)
	if err != nil {
		return "", err
	}
	return dataPath + "/keyring.sqlite3", nil
}

func LogFilePath() (string, error) {
	dataPath, err := DataPath()
	if err != nil {
		return "", err
	}
	err = os.MkdirAll(dataPath, os.ModePerm)
	if err != nil {
		return "", err
	}
	return dataPath + "/keyring.log", nil
}

func DataPath() (string, error) {
	configPath, err := os.UserConfigDir()
	if err != nil {
		return "", err
	}
	return configPath + "/Keyring", nil
}

const BlockScout = "blockscout"
const LbryChainQuery = "lbry-chainquery"
