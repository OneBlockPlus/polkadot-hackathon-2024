package model

type FormGetMarketDevices struct {
	ChainId uint64 `form:"chain_id"`
}

type FormGetListingDevices struct {
	ChainId uint64 `form:"chain_id"`
	Wallet  string `form:"wallet"`
}

type FormGetRentingDevices struct {
	ChainId uint64 `form:"chain_id"`
	Wallet  string `form:"wallet"`
}
