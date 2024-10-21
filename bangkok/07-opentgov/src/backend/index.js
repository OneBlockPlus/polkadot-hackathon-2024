const app = require('./src/app');
const config = require('./src/config');
const { runPeriodically } = require('./src/services/polkadot');

app.listen(config.PORT, () => console.log(`Server running on port ${config.PORT}`));

// Run the process every 10 minutes
setInterval(runPeriodically, 600000);

// Initial run
runPeriodically();