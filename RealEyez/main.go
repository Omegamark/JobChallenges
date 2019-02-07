package main

import (
	"fmt"
	"log"
	"os"
	"os/exec"
	"strings"
)

func main() {
	fmt.Println("sanity check")
	// cmd := exec.Command("ffmpeg", "-y", "-i tos-teaser.mp4", "-codec copy", "-bsf h264_mp4toannexb", "-map 0", "-f segment", "-segment_time 10",
	// "-segment_format mpegts", `-segment_list "./test/prog_index.m3u8"`, "-segment_list_type m3u8", `"./test/fileSequence%d.ts"`)
	// command := "ffmpeg -y -i tos-teaser.mp4 -codec copy -bsf h264_mp4toannexb -map 0 -f segment -segment_time 5 -segment_format mpegts -segment_list ./test/prog_index.m3u8 -segment_list_type m3u8 ./test/fileSequence%d.ts"
	// Use this as an argument to the program.
	fileName := "tos-teaser.mp4"
	// *** This is the command given by RealEyes
	// command := "ffmpeg -i " + fileName + " -c:a aac -strict -2 -b:a 128k -c:v libx264 -g 72 -keyint_min 72 -b:v 3000k -hls_time 6 -hls_segment_filename ./test/output_%03d.ts ./test/output.m3u8"
	// *** Make the directories.
	os.Mkdir("test_1080", 0700)
	os.Mkdir("test_720", 0700)
	os.Mkdir("test_480", 0700)
	os.Mkdir("test_360", 0700)
	os.Mkdir("test_240", 0700)

	command := "ffmpeg -i " + fileName + ` -s 1920x1080 -c:a aac -strict -2 -b:a 128k -c:v libx264 -g 72 -keyint_min 72 -b:v 6000k -hls_time 6 -hls_segment_filename ./test_1080/output_%03d.ts ./test_1080/output.m3u8
	 -s 1280x720 -c:a aac -strict -2 -b:a 128k -c:v libx264 -g 72 -keyint_min 72 -b:v 4000k -hls_time 6 -hls_segment_filename ./test_720/output_%03d.ts ./test_720/output.m3u8
	 -s 854x480 -c:a aac -strict -2 -b:a 128k -c:v libx264 -g 72 -keyint_min 72 -b:v 2000k -hls_time 6 -hls_segment_filename ./test_480/output_%03d.ts ./test_480/output.m3u8
	 -s 640x360 -c:a aac -strict -2 -b:a 128k -c:v libx264 -g 72 -keyint_min 72 -b:v 1500k -hls_time 6 -hls_segment_filename ./test_360/output_%03d.ts ./test_360/output.m3u8
	 -s 426x240 -c:a aac -strict -2 -b:a 128k -c:v libx264 -g 72 -keyint_min 72 -b:v 1100k -hls_time 6 -hls_segment_filename ./test_240/output_%03d.ts ./test_240/output.m3u8
	 `

	parts := strings.Fields(command)
	cmd := exec.Command(parts[0], parts[1:]...)
	cmd.Stderr = os.Stderr
	cmd.Stdout = os.Stdout
	err := cmd.Run()
	if err != nil {
		log.Fatal(err)
	}
	// fmt.Printf("%s\n", stdoutStderr)
}

// ffmpeg -y \
//  -i tos-teaser.mp4 \
//  -codec copy \
//  -bsf h264_mp4toannexb \
//  -map 0 \
//  -f segment \
//  -segment_time 10 \
//  -segment_format mpegts \
//  -segment_list "./test/prog_index.m3u8" \
//  -segment_list_type m3u8 \
//  "./test/fileSequence%d.ts"

// ffmpeg -y -i tos-teaser.mp4 -codec copy -bsf h264_mp4toannexb -map 0 -f segment -segment_time 10 -segment_format mpegts -segment_list "./test/prog_index.m3u8" -segment_list_type m3u8 "./test/fileSequence%d.ts"
