package main

import (
	"bytes"
	"fmt"
	"io/ioutil"
	"log"
	"os/exec"
	"regexp"
	"strconv"
	"strings"
)

func main() {
	// Get a count of ts files in directory
	numFiles, err := fileCount("./test_360")
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println(numFiles)
	var bitrates []int
	// Check that numFiles is less than 10, otherwise, NOT MVP
	if numFiles < 10 {
		fmt.Println("sanity check 1")
		// Make a while loop using numFiles to aggregate all of the bitrates
		i := 0
		for i < numFiles {
			// fmt.Println(i)
			// fmt.Println("sanity check 2")
			cmd := exec.Command("ffprobe", "./test_360/output_00"+strconv.Itoa(i)+".ts")

			var output, errb bytes.Buffer

			cmd.Stdout = &output
			cmd.Stderr = &errb // Not sure why output is being put here...
			err = cmd.Run()
			if err != nil {
				log.Fatal(err)
			}
			// Redundant, but I do not fully understand why the Stderr is receiving the desired output.
			info := errb.String()
			bitrates = findBitRate(info, bitrates)
			i++
		}
	}
	fmt.Println(bitrates)
}

func findBitRate(info string, bitrates []int) []int {
	fields := strings.Fields(info)
	for i, v := range fields {
		if v == "bitrate:" {
			fmt.Println(fields[i+1])
			bitrateSafeString := strings.Trim(fields[i+1], "")
			bitrate, err := strconv.Atoi(bitrateSafeString)
			if err != nil {
				log.Fatalln(err)
			}
			fmt.Println("I'M A FUCKING BITRATE:", bitrate)
			bitrates = append(bitrates, bitrate)
			fmt.Println("I'M A FUCKING SLICE OF BITRATE", bitrates)

		}
	}
	return bitrates
}

func fileCount(path string) (int, error) {
	i := 0
	ext := ".ts"
	files, err := ioutil.ReadDir(path)
	if err != nil {
		return 0, err
	}
	for _, file := range files {
		if !file.IsDir() {
			// Check that it is a .ts file
			checkFileExt, err := regexp.MatchString(ext, file.Name())
			if err != nil {
				log.Fatal(err)
			}
			if checkFileExt == true {
				// fmt.Println(regexp.MatchString(ext, file.Name()))
				i++
			}
		}
	}
	return i, nil
}
