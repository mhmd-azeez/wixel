package main

import (
	"fmt"

	"github.com/extism/go-pdk"
)

func main() {}

//export run
func run() int32 {
	pixels := pdk.Input()
	modifiedPixels := make([]byte, 0, len(pixels))

	width := getU32("width")
	height := getU32("height")

	for y := 0; y < height; y++ {
		for x := 0; x < width; x++ {
			modifiedPixels = append(modifiedPixels, pixels[getIdx(width, width-1-x, y)])
		}
	}

	output := pdk.AllocateBytes(modifiedPixels)

	pdk.OutputMemory(output)

	return 0
}

func getIdx(width, x, y int) int {
	return x + (y * width)
}

func getU32(name string) int {
	bytes := pdk.GetVar(name)
	if len(bytes) != 4 {
		panic(fmt.Sprintf("Expected a byte slice of length 4 but got %d", len(bytes)))
	}

	var array [4]byte
	for i := 0; i < 4; i++ {
		array[i] = bytes[i]
	}

	return intFromLEBytes(array)
}

func intFromLEBytes(bytes [4]byte) int {
	return int(bytes[0]) | int(bytes[1])<<8 | int(bytes[2])<<16 | int(bytes[3])<<24
}
