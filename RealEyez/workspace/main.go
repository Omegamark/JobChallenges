package main

import (
	"flag"
	"os"

	"github.com/google/subcommands"
)

func main() {
	subcommands.Register(subcommands.HelpCommand(), "")
	subcommands.Register(subcommands.FlagsCommand(), "")
	subcommands.Register(subcommands.CommandsCommand(), "")
	subcommands.Register(&clearCmd{}, "")
	// subcommands.Register(&versionCmd{}, "")

	flag.Parse()
	// ctx := context.Background()
	os.Exit(int(subcommands.Execute(ctx)))
}
