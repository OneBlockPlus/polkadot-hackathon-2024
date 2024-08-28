package dao

import "dephy-conduits/model"

func CreateOrIgnoreDeviceInfo(deviceInfo *model.DeviceInfo) error {
	result := db.Where("chain_id = ? AND device = ?", deviceInfo.ChainId, deviceInfo.Device).FirstOrCreate(&deviceInfo)
	return result.Error
}

func GetDeviceInfo(chainId uint64, device string) (*model.DeviceInfo, error) {
	var deviceInfo model.DeviceInfo
	if err := db.Where("chain_id = ? AND device = ?", chainId, device).First(&deviceInfo).Error; err != nil {
		return nil, err
	}
	return &deviceInfo, nil
}

func GetAvailableMarketDevices(chainId uint64) ([]model.DeviceInfo, error) {
	var devices []model.DeviceInfo

	subQuery := db.Model(&model.RentalInfo{}).
		Select("device").
		Where("rental_status = ?", model.RSRenting).
		Where("chain_id = ?", chainId)

	err := db.Model(&model.DeviceInfo{}).
		Joins("JOIN listing_infos ON listing_infos.device = device_infos.device AND listing_infos.chain_id = device_infos.chain_id").
		Where("listing_infos.listing_status = ?", model.LSListing).
		Where("device_infos.device NOT IN (?)", subQuery).
		Where("device_infos.chain_id = ?", chainId).
		Preload("ListingInfo").
		Preload("RentalInfo").
		Find(&devices).Error

	if err != nil {
		return nil, err
	}
	return devices, nil
}

func GetOwnerListingDevices(chainId uint64, owner string) ([]model.DeviceInfo, error) {
	var devices []model.DeviceInfo

	err := db.Model(&model.DeviceInfo{}).
		Joins("JOIN listing_infos ON listing_infos.device = device_infos.device AND listing_infos.chain_id = device_infos.chain_id").
		Where("listing_infos.owner = ? AND listing_infos.relisted = ? AND listing_infos.listing_status != ?", owner, false, model.LSWithdrawnOrNotExist).
		Where("device_infos.chain_id = ?", chainId).
		Preload("ListingInfo").
		Preload("RentalInfo").
		Find(&devices).Error

	if err != nil {
		return nil, err
	}
	return devices, nil
}

func GetTenantRentalDevices(chainId uint64, tenant string) ([]model.DeviceInfo, error) {
	var devices []model.DeviceInfo

	err := db.Model(&model.DeviceInfo{}).
		Joins("JOIN rental_infos ON rental_infos.device = device_infos.device AND rental_infos.chain_id = device_infos.chain_id").
		Where("rental_infos.tenant = ?", tenant).
		Where("rental_infos.chain_id = ?", chainId).
		Preload("ListingInfo").
		Preload("RentalInfo").
		Find(&devices).Error

	if err != nil {
		return nil, err
	}
	return devices, nil
}
