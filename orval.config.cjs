module.exports = {
  api: {
    input: "./swagger.json",
    output: {
      target: "./src/api/generated.ts",
      client: "react-query",
      httpClient: "axios",
      tsconfig: "./tsconfig.app.json",
      mock: false,
      override: {
        mutator: {
          path: "./src/services/api.ts",
          name: "mutationInstance",
        },
      },
    },
  },
};
