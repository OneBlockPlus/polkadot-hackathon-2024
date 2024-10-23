package cmd

import (
	"sublink/extractor"
	"sublink/processer"
	"sublink/serve"

	"github.com/spf13/cobra"
)

var rootCmd = &cobra.Command{
	Use:   "sublink-sever",
	Short: "SubLink is a developer tool for the substrate environment.",
	Long: `SubLink is a developer tool for the substrate environment. 
	It can extract the extrinsic of the target chain to form a link and display it as a corresponding page.`,
	Run: func(cmd *cobra.Command, args []string) {
	},
}

var serveCmd = &cobra.Command{
	Use:   "serve",
	Short: "Read the specification file and start the SubLink service.",
	Run: func(cmd *cobra.Command, args []string) {
		serve.RegisterRouter()
		serve.StartRouter()
	},
}

var processerCmd = &cobra.Command{
	Use:   "processer",
	Short: "Process the URL and generate page resource files according to the template.",
	Run: func(cmd *cobra.Command, args []string) {
		processer := processer.Init()
		processer.ProcesseAll()
	},
}

var extractorCmd = &cobra.Command{
	Use:   "extract",
	Short: "Extracting URLs from Metadata.",
	Run: func(cmd *cobra.Command, args []string) {
		extractor := extractor.Init()
		extractor.Extractor()
	},
}

func CmdInit() {
	rootCmd.AddCommand(extractorCmd)
	rootCmd.AddCommand(serveCmd)
	rootCmd.AddCommand(processerCmd)
}

func Execute() {
	CmdInit()
	rootCmd.Execute()
}
