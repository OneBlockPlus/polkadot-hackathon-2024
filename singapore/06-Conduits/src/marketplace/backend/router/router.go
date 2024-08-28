package router

import (
	"dephy-conduits/controller"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func SetupRouter(mode string) *gin.Engine {
	gin.SetMode(mode)
	r := gin.Default()

	r.Use(cors.Default())

	v1 := r.Group("/api/v1")

	v1.GET("/devices/market", controller.GetMarketDevicesHandler)
	v1.GET("/devices/listing", controller.GetListingDevicesHandler)
	v1.GET("/devices/renting", controller.GetRentingDevicesHandler)

	return r
}
