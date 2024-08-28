package serve

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"text/template"

	"github.com/joho/godotenv"
)

func RegisterRouter() {
	err := godotenv.Load("./.env")
	if err != nil {
		panic("Error loading .env file")
	}

	bodyFile := os.Getenv("BODY_FILE")

	file, err := os.Open(bodyFile)
	if err != nil {
		panic("Error open file")
	}

	data, err := ioutil.ReadAll(file)
	if err != nil {
		panic("Error read file")
	}

	var urlStatic map[string]string
	err = json.Unmarshal(data, &urlStatic)
	if err != nil {
		panic("Error json Unmarshal failed")
	}

	for path, body := range urlStatic {
		fmt.Println("path: ", path)
		fmt.Println("body: ", body)

		data := map[string]interface{}{
			"Body": body,
		}

		http.HandleFunc(path, func(w http.ResponseWriter, r *http.Request) {
			t, _ := template.ParseFiles("../sublink/build/index.html")

			t.Execute(w, data)
		})
	}
}

func StartRouter() {
	http.Handle("/", http.StripPrefix("/", http.FileServer(http.Dir("../sublink/build"))))
	log.Fatal(http.ListenAndServe(":9946", nil))
}
