package main

import (
	"bytes"
	"crypto/tls"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"sync"
	"time"
)

type DbItem struct {
	Id  int    `json:"id"`
	Url string `json:"url"`
}

type Item struct {
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
var host = fmt.Sprintf("http://127.0.0.1:%d", config.Port)

func main() {
	for {
		checkAllUrls(getData())
		time.Sleep(5 * time.Minute)
	}
}

func checkAllUrls(data []DbItem) {
	var items []Item
	var mu sync.Mutex
	var wg sync.WaitGroup

	for _, dbItem := range data {
		wg.Add(1)
		go func(d DbItem) {
			defer wg.Done()
			conData := ping(d.Url)
			mu.Lock()
			items = append(items, Item{
				Id:           d.Id,
				Status:       conData[0],
				ResponseTime: conData[1],
			})
			mu.Unlock()
		}(dbItem)
	}

	wg.Wait()
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

func updateStatus(items []Item) {
	jsonData, _ := json.Marshal(items)
	http.Post(host+"/internal/status/update",
		"application/json",
		bytes.NewBuffer(jsonData))
}

func getData() []DbItem {
	var resp *http.Response
	var err error

	for {
		resp, err = http.Get(host + "/internal/database/id_url_mapping")
		if err == nil {
			break
		}
		time.Sleep(2 * time.Second)
	}

	defer resp.Body.Close()
	body, _ := io.ReadAll(resp.Body)
	var items []DbItem
	json.Unmarshal(body, &items)
	return items
}

func truncate(s string, max int) string {
	if len(s) > max {
		return s[:max] + "..."
	}
	return s
}
