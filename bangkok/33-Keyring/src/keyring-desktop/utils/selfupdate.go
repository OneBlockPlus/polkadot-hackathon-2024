package utils

import (
	"context"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"runtime"
	"strings"

	"github.com/fynelabs/selfupdate"
	appruntime "github.com/wailsapp/wails/v2/pkg/runtime"
)

const Version = "0.1.8"

const PackageMac = "keyring-wallet-darwin.zip"
const PackageWin = "keyring-wallet-windows.exe"
const PackageLinux = "keyring-wallet-linux"

const Suffix = "Keyring Wallet.app/Contents/MacOS/Keyring Wallet"
const GithubReleaseURL = "https://github.com/keyring-so/keyring-desktop/releases/latest/download"

func genVersionFile() string {
	url := fmt.Sprintf("%s/version", GithubReleaseURL)
	return url
}

func genFileURL() string {
	packageName := ""
	if runtime.GOOS == "darwin" {
		packageName = PackageMac
	} else if runtime.GOOS == "windows" {
		packageName = PackageWin
	} else {
		packageName = PackageLinux
	}

	url := fmt.Sprintf("%s/%s", GithubReleaseURL, packageName)
	return url
}

func DoSelfUpdate(ctx context.Context) error {
	selfupdate.LogError = log.Printf
	selfupdate.LogInfo = log.Printf
	selfupdate.LogDebug = log.Printf

	fmt.Println("start")

	downloadPath := ""
	trimContent := ""
	if runtime.GOOS == "darwin" {
		homeDir, _ := os.UserHomeDir()
		downloadPath = filepath.Join(homeDir, "Downloads", PackageMac)
		trimContent = Suffix
	}

	httpSource := selfupdate.NewFileSource(nil, genFileURL(), genVersionFile())
	version := selfupdate.Version{Number: Version}

	config := &selfupdate.Config{
		Current:      &version,
		Source:       httpSource,
		Schedule:     selfupdate.Schedule{FetchOnStart: true},
		PublicKey:    nil,
		DownloadPath: downloadPath,
		TrimContent:  trimContent,

		ProgressCallback: func(f float64, err error) {
			fmt.Println("Download", f)
			appruntime.EventsEmit(ctx, "update-progress", f)
		},
		RestartConfirmCallback: func() bool { return true },
		UpgradeConfirmCallback: func(_ string) bool { return true },
		ExitCallback:           func(_ error) { os.Exit(1) },
	}

	_, err := selfupdate.Manage(config)
	if err != nil {
		fmt.Println("Error while setting up update manager: ", err)
		return err
	}

	return nil
}

func CurrentVersion() string {
	return Version
}

func CheckForUpdate() (bool, string, error) {
	resp, err := http.Get(genVersionFile())
	if err != nil {
		return false, "", err
	}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return false, "", err
	}

	latest := strings.TrimSpace(string(body))
	shouldUpdate := latest > Version

	return shouldUpdate, latest, nil
}
