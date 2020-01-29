const test = require('ava');
const aws = require('aws-sdk');
const { generateId } = require('../../src/generators');
const $put = require('../../src/put');

test.before(t => {
  t.context.config = {
    s3: {
      region: process.env.CS3_S3_AWS_REGION,
      accessKeyId: process.env.CS3_S3_AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.CS3_S3_AWS_SECRET_ACCESS_KEY
    },
    dynamodb: {
      region: process.env.CS3_DYNAMODB_AWS_REGION,
      accessKeyId: process.env.CS3_DYNAMODB_AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.CS3_DYNAMODB_AWS_SECRET_ACCESS_KEY,
      httpOptions: {
        timeout: 10000,
        connectTimeout: 10000
      },
      maxRetries: 0
    },
    bucket: process.env.CS3_BUCKET
  };
});

test.beforeEach(t => {
  process.env.NODE_ENV = 'production';
  t.context.s3 = new aws.S3(t.context.config.s3);
  t.context.dynamodb = new aws.DynamoDB(t.context.config.dynamodb);

  t.truthy(t.context.config.s3.region);
  t.truthy(t.context.config.s3.accessKeyId);
  t.truthy(t.context.config.s3.secretAccessKey);
  t.truthy(t.context.config.dynamodb.region);
  t.truthy(t.context.config.dynamodb.accessKeyId);
  t.truthy(t.context.config.dynamodb.secretAccessKey);
  t.truthy(t.context.config.bucket);

  // T.log(t.context.s3);
  // t.log(t.context.dynamodb);
});

test.afterEach(t => {
  t.is(process.env.NODE_ENV, 'production');
});

test('put new item', async t => {
  const key = `cs3/${await generateId(5)}/${await generateId(10)}.txt`;
  const content = await generateId(20);
  const bucket = process.env.CS3_BUCKET;
  const put = $put(t.context.s3, t.context.dynamodb);
  const result = await put(bucket, key, content);
  t.log(result);
  t.truthy(result);
  t.truthy(result.ETag);
});

test('put existing item', async t => {
  const key = 'cs3/folder/same.txt';
  const content = await generateId(20);
  const bucket = process.env.CS3_BUCKET;
  const put = $put(t.context.s3, t.context.dynamodb);
  const result = await put(bucket, key, content);
  t.log(result);
  t.truthy(result);
  t.truthy(result.ETag);
});
