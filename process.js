'use strict';

const AWS = require("aws-sdk");
const dynamodb = new AWS.DynamoDB.DocumentClient();
const historyTable = process.env.HISTORY_TABLE;
const associationTable = process.env.ASSOCIATION_TABLE;

const VALID = 1;
const NOT_VALID = 0;

const MIN_SERIAL_STRING_LENGTH = 10;
const MAX_SERIAL_STRING_LENGTH = 17;
const TIMESTAMP_STRING_LENGTH = 13


const validateData = data => {
  let validation = [];
  let messages = [];
  // serial
  if (data.hasOwnProperty('se') && data.se.length >= MIN_SERIAL_STRING_LENGTH && data.se.length <= MAX_SERIAL_STRING_LENGTH) {
    validation.push(true);
  } else {
    validation.push(false);
    messages.push('invalid serial');
  }
  // timestamp
  if (data.hasOwnProperty('d5') && data.d5.length === TIMESTAMP_STRING_LENGTH) {
    validation.push(true);
  } else {
    validation.push(false);
    messages.push('invalid timestamp');
  }

  if (validation.includes(false)) {
    return { status: NOT_VALID, messages: messages };
  } else {
    return { status: VALID, data: data };
  }
};

const associateSerial = async (serial) => {
  let app;
  const results = await dynamodb.query({
    TableName: associationTable,
    ExpressionAttributeValues: { ":serial": serial },
    KeyConditionExpression: "serial = :serial"
  }).promise();
  console.log(`results: ${JSON.stringify(results)}`)
  if (results.Count > 0) app = results.Items[0].app;
  return app
};

module.exports.main = async event => {
  try {
    const dataloggerData = event.queryStringParameters;
    const validation = validateData(dataloggerData);
    console.log(`validation: ${JSON.stringify(validation)}`);
    if (!validation.status) {
      return { statusCode: 400, body: JSON.stringify({ message: validation.messages.join(',') }) };
    } else {
      const app = await associateSerial(validation.data.se);
      console.log(`app: ${app}`);
      const params = {
        Item: {
          serial: validation.data.se,
          date: new Date(Number(validation.data.d5)).toISOString(),
          value: validation.data.d2,
          app: app
        },
        TableName: historyTable
      };
      await dynamodb.put(params).promise();
      return { statusCode: 200 };
    }
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ message: err.message }) };
  }
};
