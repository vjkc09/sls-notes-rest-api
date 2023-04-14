"use strict"
const DynamoDB = require("@aws-sdk/client-dynamodb")
const {
  DynamoDBDocumentClient,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
  ScanCommand,
} = require("@aws-sdk/lib-dynamodb")

const client = new DynamoDB({ region: process.env.AWS_REGION })
const ddbDocClient = DynamoDBDocumentClient.from(client)
const NOTES_TABLE_NAME = process.env.NOTES_TABLE_NAME

const send = (statusCode, data) => {
  return {
    statusCode,
    body: JSON.stringify(data),
  }
}
module.exports.createNote = async (event, context, cb) => {
  let data = JSON.parse(event.body)
  try {
    const params = {
      TableName: NOTES_TABLE_NAME,
      Item: {
        notesId: data.id,
        title: data.title,
        body: data.body,
      },
      ConditionExpression: "attribute_not_exists(notesId)",
    }
    await ddbDocClient.send(new PutCommand(params))
    return send(201, data)
  } catch (err) {
    return send(500, data)
  }
}

module.exports.updateNote = async (event, context, cb) => {
  let notesId = event.pathParameters.id
  let data = JSON.parse(event.body)
  try {
    const params = {
      TableName: NOTES_TABLE_NAME,
      Key: { notesId },
      UpdateExpression: "set #title = :title, #body = :body",
      ExpressionAttributeNames: {
        "#title": "title",
        "#body": "body",
      },
      ExpressionAttributeValues: {
        ":title": data.title,
        ":body": data.body,
      },
      ConditionExpression: "attribute_exists(notesId)",
    }
    await ddbDocClient.send(new UpdateCommand(params))
    return send(200, data)
  } catch (err) {
    return send(500, err.message)
  }
}

module.exports.deleteNote = async (event, context, cb) => {
  let notesId = event.pathParameters.id
  try {
    const params = {
      TableName: NOTES_TABLE_NAME,
      Key: { notesId },
      ConditionExpression: "attribute_exists(notesId)",
    }
    await ddbDocClient.send(new DeleteCommand(params))
    return send(200, notesId)
  } catch (err) {
    return send(500, err.message)
  }
}

module.exports.getAllNotes = async (event, context, cb) => {
  console.log(JSON.stringify(event))
  try {
    const params = {
      TableName: NOTES_TABLE_NAME,
    }
    await ddbDocClient.send(new ScanCommand(params))
    return send(200, notes)
  } catch (err) {
    return send(500, err.message)
  }
}
