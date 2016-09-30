# Speechmatics API for Node.js

[Speechmatics](https://speechmatics.com) provides an [API](https://speechmatics.com/api-details) for speech to text. This package implements the API making it easier to integrate into [Node.js](https://nodejs.org) projects.

## Install

```
npm install speechmatics
```

## Usage

[Read here](https://speechmatics.com/api-details) for more detailed description of the API.

### Instantiation

```js
const Speechmatics = require('speechmatics');
const sm = new Speechmatics(userId, apiKey, options);

```

`userId` and `apiKey` are required as the first two parameters for Speechmatics client instantiation. `options` are...optional. Defaults detailed below.

#### Options

- `baseUrl`: string - defaults to 'https://api.speechmatics.com'
- `apiVersion`: number - defaults to 1.0;
- `callbackUrl`: string - URL for notification callbacks
  - if this option is set, `notification` field for request will automatically be set as 'callback'
- `headers`: object - extra header fields

### Requests

For each request, `opts` are settings that will be passed along to the [`request`](https://github.com/request/request) module.

```js
/* User */
sm.getUser(opts, callback);
sm.getPayments(opts, callback);
sm.getJobs(opts, callback);
sm.createJob(opts, callback);
sm.getJob(jobId, opts, callback);
sm.getTranscript(jobId, opts, callback);
sm.getAlignment(jobId, opts, callback);

/* Status */
sm.getStatus(opts, callback);

/* Statics */
Speechmatics.parseAligment(text);
```

##### Create Job

`sm.createJob` has a built-in nicety. Setting `opts.audioFilename` or `opts.textFilename` (for alignment) will read those files from the supplied paths as a [ReadStream](https://nodejs.org/api/fs.html#fs_class_fs_readstream), which will then be passed through to the request as the correct `formData` fields.

*note: "auth_token" request parameter is automatically set based on apiKey*