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
	// *** This is the command given by RealEyes
	command := "ffmpeg -i tos-teaser.mp4 -c:a aac -strict -2 -b:a 128k -c:v libx264 -g 72 -keyint_min 72 -b:v 3000k -hls_time 5 -hls_segment_filename ./test/output_%03d.ts ./test/output.m3u8"

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
