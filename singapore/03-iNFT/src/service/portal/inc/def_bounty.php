<?php
define('BOUNTY_PAGE_COUNT',	10);
define('BOUNTY_PAGE_STEP',	12);

//User status
define('BOUNTY_STATUS_DEL',	            0);
define('BOUNTY_STATUS_OK', 	            1);
define('BOUNTY_STATUS_ON_CHAIN', 	    2);
define('BOUNTY_STATUS_LOCAL_SAVED',     3);     //ignore on portal
define('BOUNTY_STATUS_REPORTED',        4);     //ignore on portal
define('BOUNTY_STATUS_PAY_SUBMITTED',   5);
define('BOUNTY_STATUS_PAYED',           6);     //can be show on market
define('BOUNTY_STATUS_ON_PROGRESS',     7);
define('BOUNTY_STATUS_DONE',            8);
define('BOUNTY_STATUS_ALL_APPROVED',    9);

define('BOUNTY_APPLY_APPROVED',     1);
define('BOUNTY_APPLY_SUBMITTED',    2);
define('BOUNTY_APPLY_FAILED',       4);
define('BOUNTY_APPLY_DIVERTTED',     5);
define('BOUNTY_APPLY_PAYED',        6);

define('BOUNTY_TARGET',array(
    "anchor"    =>  "5DcpcBu1J4qpQRkeFy6Qcn9FxUm6knhvufnYpX62oHH1zWCx",
    "tanssi"    =>  "5ECZb1Jmm8ACGXdXtBx9AbqspK2ECQ1QNnXqH9FiGLEEjJjV",
    "polkadot"  =>  "",
    "solana"    =>  "",
));

define('BOUNTY_APPROVER',"5D5K7bHqrjqEMd9sgNeb28w9TsR8hFTTHYs6KTGSAZBhcePg");

//Polkadot frontend parameters

define('ANCHOR_NETWORK_NODE',     "ws://localhost:9944");