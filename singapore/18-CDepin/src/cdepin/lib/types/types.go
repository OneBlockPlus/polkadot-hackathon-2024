package types

const (
	LOG_NODE  = "node"
	LOG_TX    = "transaction"
	LOG_CACHE = "cache"
)

const (
	CACHE_NAME       = "cacher"
	RECORD_FRAGMENTS = "-fragments"
	RECORD_REQUESTS  = "-requests"
)

const (
	OPTION_QUERY    = "query"
	OPTION_DOWNLOAD = "download"
	OPTION_DAIL     = "dail"
)

const (
	STATUS_HIT     = "hit"
	STATUS_MISS    = "miss"
	STATUS_LOADING = "loading"
	STATUS_FROZEN  = "frozen"

	STATUS_ERROR = "error"
	STATUS_OK    = "ok"
)
const (
	CACHE_BUSY = "busy"
	CACHE_IDLE = "idle"
)

var (
	FragmentSize int64 = 8 * 1024 * 1024
)

type CacheInfo struct {
	LoadRatio    float64 `json:"load_ratio"` // cache load ratio,
	Status       string  `json:"status"`     // the status of the cache service now, "busy" or "idle"
	Price        string  `json:"price"`      // the price of the cache service, in fragments
	Account      []byte  `json:"account"`    // the account id of cacher
	PeerId       string  `json:"peer_id"`    // the peer id of cacher
	CreditLimit  int64   `json:"credit_limit"`
	CreditPoints int     `json:"credit_points"` // user’s credit on the cacher, one point will be deducted for downloaded a file fragment, and be added for recharge
}

type CacheRequest struct {
	Option    string `json:"option"`     // option: "query" for query cache info or "download" for download file you want or "dail" for get cache info
	WantUrl   string `json:"want_url"`   // URL that you want CDN to accelerate
	WantFile  string `json:"want_file"`  // only one file(CESS fragment) is allowed to be downloaded per request
	AccountId []byte `json:"account_id"` // the requester's account Id
	Data      []byte `json:"data"`       // order id when purchasing cache service
	Sign      []byte `json:"sign"`       // signature of transaction hash to prevent fraud
}

type Response struct {
	Status string `json:"status"`
	Data   any    `json:"data"`
}

// QueryResponse is the response of the request. When the request option is "download" and successful, the file itself is returned directly.
type CacheResponse struct {
	Status      string    `json:"status"`       // status when querying files: "miss", "hit", "frozen", status when dailling:: "ok", "error".
	CachedFiles []string  `json:"cached_files"` // when request option is "query", a cached list of related files is returned.
	Info        CacheInfo `json:"cache_info"`   // when request option is "dail", return the cache node information.
}

type SegmentRecord struct {
	Frgments int
	Requests int
}
