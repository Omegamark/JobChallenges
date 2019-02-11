package main

import (
	"bufio"
	"bytes"
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
)

func main() {
	fmt.Println("sanity check")

	// Use this as a CLI argument to the program.
	// fileName := "tos-teaser.mp4"
	// // Make the directories.
	// os.Mkdir("test_1080", 0700)
	// os.Mkdir("test_720", 0700)
	// os.Mkdir("test_540", 0700)
	// os.Mkdir("test_432", 0700)
	// os.Mkdir("test_360", 0700)

	// command := "ffmpeg -i " + fileName + ` -s 1920x1080 -c:a aac -strict -2 -b:a 128k -c:v libx264 -g 72 -keyint_min 72 -b:v 6000k -hls_time 6 -hls_segment_filename ./test_1080/output_%03d.ts ./test_1080/output.m3u8
	//  -s 1280x720 -c:a aac -strict -2 -b:a 128k -c:v libx264 -g 72 -keyint_min 72 -b:v 4000k -hls_time 6 -hls_segment_filename ./test_720/output_%03d.ts ./test_720/output.m3u8
	//  -s 960x540 -c:a aac -strict -2 -b:a 128k -c:v libx264 -g 72 -keyint_min 72 -b:v 2000k -hls_time 6 -hls_segment_filename ./test_540/output_%03d.ts ./test_540/output.m3u8
	//  -s 768x432 -c:a aac -strict -2 -b:a 128k -c:v libx264 -g 72 -keyint_min 72 -b:v 1500k -hls_time 6 -hls_segment_filename ./test_432/output_%03d.ts ./test_432/output.m3u8
	//  -s 640x360 -c:a aac -strict -2 -b:a 128k -c:v libx264 -g 72 -keyint_min 72 -b:v 1100k -hls_time 6 -hls_segment_filename ./test_360/output_%03d.ts ./test_360/output.m3u8
	//  `

	// parts := strings.Fields(command)
	// cmd := exec.Command(parts[0], parts[1:]...)
	// cmd.Stderr = os.Stderr
	// cmd.Stdout = os.Stdout
	// err := cmd.Run()
	// if err != nil {
	// 	log.Fatal(err)
	// }

	// Pass dirName to this shit
	CreateManifest()
}

// CreateManifest generates the master manifest
func CreateManifest() {
	// Get number of "test" directories so all renditions are added to main manifest.
	// Rename package to package manifest.

	// Get a count of ts files in directory
	numFiles, err := fileCount("./test_360")
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println(numFiles)
	var bitrates []int
	var frameRate int
	var avgBandwidth int
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
			fileMeta := errb.String()
			bitrates = findBitRate(fileMeta, bitrates)
			// Checks every time, change so it only does a single check.
			frameRate = findFrameRate(fileMeta)
			i++
		}
		// Bad naming here, will fix with refactor later. Meant to provide the AVERAGE-BANDWIDTH parameter to main.m3u8 manifest
		avgBandwidth = averageBitrate(numFiles, bitrates)
		fmt.Println(avgBandwidth)
		fmt.Println(bitrates)
		writeManifest(frameRate, avgBandwidth)
	} else {
		log.Fatalln("Not MVP at this time")
	}
}

func getDirectories() {
	err := filepath.Walk("./", func(path string, info os.FileInfo, err error) error {
		if err != nil {
			fmt.Printf("prevent panic by handling failure accessing a path %q: %v\n", path, err)
			return err
		}

		if info.IsDir() == true {
			movieDir, err := regexp.MatchString("test*", path)
			if err != nil {
				log.Fatal(err)
			}
			if movieDir == true {
				fmt.Printf("visited file or dir: %q\n", path)

			}
		}
		return nil
	})
	if err != nil {
		log.Fatal(err)
	}

}

func writeManifest(frameRate int, avgBandwidth int) {
	fmt.Println("jdskl;fjas;", frameRate, avgBandwidth)
	// For more granular writes, open a file for writing.
	f, err := os.Create("./main.m3u8")
	if err != nil {
		panic(err)
	}
	// It's idiomatic to defer a `Close` immediately
	// after opening a file.
	defer f.Close()
	// To start, here's how to dump a string (or just
	// bytes) into a file.
	manifest := []byte(
		`#EXTM3U
#EXT-X-STREAM-INF:BANDWIDTH=600000,AVERAGE-BANDWITH=` + strconv.Itoa(avgBandwidth) + `,FRAME-RATE=` + strconv.Itoa(frameRate) + `,RESOLUTION=1920x1080,CODECS="H.264"
./test_1080/output.m3u8
`)
	err = ioutil.WriteFile("./main.m3u8", manifest, 0644)
	if err != nil {
		panic(err)
	}

	// `bufio` provides buffered writers in addition
	// to the buffered readers we saw earlier.
	w := bufio.NewWriter(f)

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

func findBitRate(fileMeta string, bitrates []int) []int {
	fields := strings.Fields(fileMeta)
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
	fmt.Println()
	return bitrates
}

func findFrameRate(fileMeta string) int {
	fields := strings.Fields(fileMeta)
	// fmt.Println(fields)
	for i, v := range fields {
		// I don't like this check either, but will fix when refactor.
		if v == "fps," {
			fmt.Println(fields[i-1])
			frameRateSafeString := strings.Trim(fields[i+1], "")
			frameRate, err := strconv.Atoi(frameRateSafeString)
			if err != nil {
				log.Fatalln(err)
			}
			// fmt.Println("I'M A FUCKING frameRate:", frameRate)
			return frameRate
		}
	}
	fmt.Println("We didn't find fps")
	return 0
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
