package main

import (
	"bytes"
	"crypto/tls"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"
)

type dbItem struct {
	Id  int    `json:"id"`
	Url string `json:"url"`
}

type item struct {
	Id           int `json:"id"`
	Status       int `json:"status"`
	ResponseTime int `json:"response_time"`
}

type Config struct {
	Port int `json:"port"`
}

func getConfig() Config {
	file, _ := os.ReadFile("config.json")
	var config Config
	json.Unmarshal(file, &config)
	return config
}

var config = getConfig()
var host = fmt.Sprintf("http://localhost:%d", config.Port)

func main() {
	for {
		checkAllUrls(getData())
		time.Sleep(5 * time.Minute)
	}
}

func checkAllUrls(data []dbItem) {
	var items []item

	for _, dbItem := range data {
		conData := ping(dbItem.Url)

		newItem := item{
			Id:           dbItem.Id,
			Status:       conData[0],
			ResponseTime: conData[1],
		}

		items = append(items, newItem)
	}

	updateStatus(items)
}

func ping(url string) []int {
	client := &http.Client{
		Timeout: 10 * time.Second,
		Transport: &http.Transport{
			TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
		},
	}

	start := time.Now()

	resp, err := client.Get(url)
	if err != nil {
		return []int{0, 0}
	}
	defer resp.Body.Close()

	duration := time.Since(start)

	return []int{resp.StatusCode, int(duration.Milliseconds())}
}

func updateStatus(items []item) {
	jsonData, _ := json.Marshal(items)
	http.Post(host+"/internal/status/update",
		"application/json",
		bytes.NewBuffer(jsonData))
}

func getData() []dbItem {
	resp, err := http.Get(host + "/internal/database/data")
	if err != nil {
		fmt.Printf("Error getting database: %s\n", err)
		return nil
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	var items []dbItem
	json.Unmarshal(body, &items)
	return items
}

func truncate(s string, max int) string {
	if len(s) > max {
		return s[:max] + "..."
	}
	return s
}
