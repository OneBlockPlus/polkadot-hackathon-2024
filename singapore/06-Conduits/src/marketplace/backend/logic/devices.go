package logic

import (
	"dephy-conduits/dao"
	"dephy-conduits/model"
	"dephy-conduits/utils"
)

func GetMarketDevices(form *model.FormGetMarketDevices) ([]model.DeviceInfo, error) {
	return dao.GetAvailableMarketDevices(form.ChainId)
}

func GetListingDevices(form *model.FormGetListingDevices) ([]model.DeviceInfo, error) {
	return dao.GetOwnerListingDevices(form.ChainId, utils.ToChecksumAddress(form.Wallet))
}

func GetRentalDevices(form *model.FormGetRentingDevices) ([]model.DeviceInfo, error) {
	return dao.GetTenantRentalDevices(form.ChainId, utils.ToChecksumAddress(form.Wallet))
}