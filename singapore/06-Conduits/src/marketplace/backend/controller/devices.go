package controller

import (
	"dephy-conduits/logic"
	"dephy-conduits/model"

	"github.com/gin-gonic/gin"
)

func GetMarketDevicesHandler(c *gin.Context) {
	var (
		form        model.FormGetMarketDevices
		deviceInfos []model.DeviceInfo
		err         error
	)

	if err = c.ShouldBindQuery(&form); err != nil {
		c.JSON(400, gin.H{
			"error": "Invalid query parameters",
			"data":  nil,
		})
		return
	}

	deviceInfos, err = logic.GetMarketDevices(&form)
	if err != nil {
		c.JSON(200, gin.H{
			"error": err.Error(),
			"data":  nil,
		})
	} else {
		c.JSON(200, gin.H{
			"error": nil,
			"data":  deviceInfos,
		})
	}
}

func GetListingDevicesHandler(c *gin.Context) {
	var (
		form        model.FormGetListingDevices
		deviceInfos []model.DeviceInfo
		err         error
	)

	if err = c.ShouldBindQuery(&form); err != nil {
		c.JSON(400, gin.H{
			"error": "Invalid query parameters",
			"data":  nil,
		})
		return
	}

	deviceInfos, err = logic.GetListingDevices(&form)
	if err != nil {
		c.JSON(200, gin.H{
			"error": err.Error(),
			"data":  nil,
		})
	} else {
		c.JSON(200, gin.H{
			"error": nil,
			"data":  deviceInfos,
		})
	}
}

func GetRentingDevicesHandler(c *gin.Context) {
	var (
		form        model.FormGetRentingDevices
		deviceInfos []model.DeviceInfo
		err         error
	)

	if err = c.ShouldBindQuery(&form); err != nil {
		c.JSON(400, gin.H{
			"error": "Invalid query parameters",
			"data":  nil,
		})
		return
	}

	deviceInfos, err = logic.GetRentalDevices(&form)
	if err != nil {
		c.JSON(200, gin.H{
			"error": err.Error(),
			"data":  nil,
		})
	} else {
		c.JSON(200, gin.H{
			"error": nil,
			"data":  deviceInfos,
		})
	}
}
