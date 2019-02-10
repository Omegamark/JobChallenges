package main

import (
	"bufio"
	"bytes"
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"os/exec"
	"regexp"
	"strconv"
	"strings"
)

func main() {
	// Get number of "test" directories so all renditions are added to main manifest.
	// Rename package to package manifest.

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

			// Must admit I'm a little confused here.
			// var output, errb bytes.Buffer
			var errb bytes.Buffer

			// cmd.Stdout = &output
			cmd.Stderr = &errb // Not sure why output is being put here, in Stderr and NOT Stdout
			err = cmd.Run()
			if err != nil {
				log.Fatal(err)
			}
			// Redundant, but I do not fully understand why the Stderr is receiving the desired output.
			info := errb.String()
			bitrates = findBitRate(info, bitrates)
			i++
		}
		// Bad naming here, will fix with refactor later. Meant to provide the AVERAGE-BANDWIDTH parameter to main.m3u8 manifest
		avgBandwidth := averageBitrate(numFiles, bitrates)
		fmt.Println(avgBandwidth)
	} else {
		log.Fatalln("Not MVP this time")
	}
	fmt.Println(bitrates)
	writeManifest()
}

// func writeManifest(frameRate int, avgBandwidth int) {
func writeManifest() {
	os.Mkdir("./tmp", 0700)
	// #EXTM3U
	// #EXT-X-STREAM-INF:BANDWIDTH=600000,AVERAGE-BANDWITH=5281000,RESOLUTION=1920x1080,CODECS="H.264"
	// ./test_1080/output.m3u8
	// To start, here's how to dump a string (or just
	// bytes) into a file.
	d1 := []byte("hello\ngo\n")
	err := ioutil.WriteFile("./tmp/dat1", d1, 0644)
	if err != nil {
		panic(err)
	}
	// For more granular writes, open a file for writing.
	f, err := os.Create("./tmp/dat2")
	if err != nil {
		panic(err)
	}
	// It's idiomatic to defer a `Close` immediately
	// after opening a file.
	defer f.Close()

	// You can `Write` byte slices as you'd expect.
	d2 := []byte{115, 111, 109, 101, 10}
	n2, err := f.Write(d2)
	if err != nil {
		panic(err)
	}
	fmt.Printf("wrote %d bytes\n", n2)

	// A `WriteString` is also available.
	n3, err := f.WriteString("writes\n")
	fmt.Printf("wrote %d bytes\n", n3)

	// Issue a `Sync` to flush writes to stable storage.
	f.Sync()

	// `bufio` provides buffered writers in addition
	// to the buffered readers we saw earlier.
	w := bufio.NewWriter(f)
	n4, err := w.WriteString("buffered\n")
	fmt.Printf("wrote %d bytes\n", n4)

	// Use `Flush` to ensure all buffered operations have
	// been applied to the underlying writer.
	w.Flush()

}

func averageBitrate(numFiles int, bitrates []int) int {
	bitrateSum := 0
	for _, v := range bitrates {
		bitrateSum += v
	}
	return bitrateSum / numFiles
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
			checkFileExt, err := regexp.MatchString(ext, file.Name())
			if err != nil {
				log.Fatal(err)
			}
			if checkFileExt == true {
				i++
			}
		}
	}
	return i, nil
}
