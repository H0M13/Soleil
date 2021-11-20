const assert = require("chai").assert;
const performRequest = require("../index.js").performRequest;
const sinon = require("sinon");
require("dotenv").config();

describe("performRequest", () => {
  const jobID = "1";

  context("successful calls", () => {
    const requests = [
      {
        name: "standard",
        testData: {
          id: jobID,
          data: {},
        },
      },
    ];

    requests.forEach((req) => {
      it(`${req.name}`, (done) => {

        performRequest({
          input: req.testData,
          callback: (statusCode, data) => {
            assert.equal(statusCode, 200);
            assert.equal(data.jobRunID, jobID);
            assert.isNotEmpty(data.data);
            done();
          }
        });
      });
    });
  });

  // context("error calls", () => {
  //   const requests = [
  //     { name: "empty body", testData: {} },
  //     { name: "empty data", testData: { data: {} } },
  //   ];

  //   requests.forEach((req) => {
  //     it(`${req.name}`, (done) => {
  //       performRequest({
  //         input: req.testData,
  //         callback: (statusCode, data) => {
  //           assert.equal(statusCode, 500);
  //           assert.equal(data.jobRunID, jobID);
  //           assert.equal(data.status, "errored");
  //           assert.isNotEmpty(data.error);
  //           done();
  //         },
  //       });
  //     });
  //   });
  // });
});
