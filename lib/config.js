const envs = {};

envs.staging = {
  httpPort: 3000,
  httpsPort: 3001,
  name: "staging",
  hashingSecret: "835#q!NFjj^cQN?r",
  maxChecks: 5,
  twilio: {
    accountSid: "",
    authToken: "",
    fromPhone: "",
  },
  templateGlobals: {
    appName: "UptimeChecker",
    companyName: "NotARealCompany, Inc.",
    yearCreated: "2021",
    baseUrl: "http://localhost:3000/",
  },
};

envs.production = {
  httpPort: 5000,
  httpsPort: 5001,
  name: "production",
  hashingSecret: "9fmb5QvAW^g_Rz<t",
  maxChecks: 5,
  twilio: {
    accountSid: "",
    authToken: "",
    fromPhone: "",
  },
  templateGlobals: {
    appName: "UptimeChecker",
    companyName: "NotARealCompany, Inc.",
    yearCreated: "2021",
    baseUrl: "http://localhost:3000/",
  },
};

const currentEnv =
  typeof process.env.NODE_ENV == "string"
    ? process.env.NODE_ENV.toLowerCase()
    : "";

const env =
  typeof envs[currentEnv] === "object" ? envs[currentEnv] : envs.staging;

module.exports = env;
