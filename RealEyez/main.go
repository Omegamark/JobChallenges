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
	command := "ffmpeg -y -i tos-teaser.mp4 -codec copy -bsf h264_mp4toannexb -map 0 -f segment -segment_time 10 -segment_format mpegts -segment_list ./test/prog_index.m3u8 -segment_list_type m3u8 ./test/fileSequence%d.ts"

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
