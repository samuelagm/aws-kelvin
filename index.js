const { AwsResources } = require("./lib/aws");

const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const { buildSchema } = require("graphql");

// Construct a schema, using GraphQL schema language
var schema = buildSchema(`
    type Resource{
        partition: String!
        service: String!
        region: String!
        accountId: String
        resourceType:String
        resourceId: String!
    }
    type Result{
        items: [Resource]!
        count: Int!
    }
    type Query {
        list(accessKeyId: String!, secretAccessKey: String!, region: String!): Result!
    }
`);

const ar = new AwsResources();

// The root provides a resolver function for each API endpoint
var root = {
  list: async ({ accessKeyId, secretAccessKey, region }) => {
    let l = await ar.listAll(accessKeyId, secretAccessKey, region);
    return {
      items: l,
      count: l.length,
    };
  },
};

var app = express();
app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
  })
);
app.listen(4000);
console.log("Running a GraphQL API server at http://localhost:4000/graphql");
