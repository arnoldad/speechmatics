'use strict';

const request = require('request');
const fs = require('fs');


function SpeechmaticsError(obj) {
  Error.captureStackTrace(this, this.constructor);
  Object.assign(this, obj);
  this.name = this.constructor.name;
  this.statusCode = obj.code;
  this.message = obj.error;
}
require('util').inherits(SpeechmaticsError, Error);


class Client {
  constructor(userId, apiToken, opts) {
    if (!userId) throw new Error('API User ID required');
    if (!apiToken) throw new Error('API Auth Token required');
    if (!(this instanceof Client)) {
      return new Client(userId, apiToken, opts);
    }

    this.userId = userId;
    this.apiToken = apiToken;

    opts = opts || {};
    this.baseUrl = opts.baseUrl || 'https://api.speechmatics.com';
    this.apiVersion = opts.apiVersion || '1.0';
    this.callbackUrl = opts.callbackUrl;
    this.headers = opts.headers || {};

    return this;
  }

  makeRequest(method, path, opts, done) {
    if (typeof opts === 'function') {
      done = done || opts;
      opts = {};
    }

    path = path.replace(':userId', this.userId);
    const options = Object.assign(opts, {
      method,
      json: true,
      headers: this.headers,
      baseUrl: this.baseUrl,
      url: `/v${this.apiVersion}/${path}`,
    });
    options.qs = options.qs || {};
    options.qs.auth_token = this.apiToken;

    request(options, (err, resp, body) => {
      if (!err && resp.statusCode >= 400) {
        err = new SpeechmaticsError(body);
      }
      done(err, body);
    });
  }

  get(path, opts, done) {
    this.makeRequest('GET', path, opts, done);
  }

  post(path, opts, done) {
    const fd = Object.assign({
      model: 'en-US',
      diarisation: 'false',
      notification: this.callbackUrl ? 'callback' : null,
      callback: this.callbackUrl,
    }, opts.formData);

    if (opts.audioFilename) {
      fd.data_file = fs.createReadStream(opts.audioFilename);
      delete opts.audioFilename;
    }
    if (opts.textFilename) {
      fd.text_file = fs.createReadStream(opts.textFilename);
      delete opts.textFilename;
    }
    opts.formData = fd;

    this.makeRequest('POST', path, opts, done);
  }


    /* User */
  getUser(opts, done) {
    done = done || opts;
    this.get('user/:userId/', opts, (err, body) => done(err, body.user));
  }

  getPayments(opts, done) {
    done = done || opts;
    this.get('user/:userId/payments/', opts, (err, body) => done(err, body.payments));
  }

  getJobs(opts, done) {
    done = done || opts;
    this.get('user/:userId/jobs/', opts, (err, body) => done(err, body.jobs));
  }

  createJob(opts, done) {
    this.post('user/:userId/jobs/', opts, done);
  }

  getJob(jobId, opts, done) {
    done = done || opts;
    this.get(`user/:userId/jobs/${jobId}/`, opts, (err, body) => done(err, body.job));
  }

  getTranscript(jobId, opts, done) {
    this.get(`user/:userId/jobs/${jobId}/transcript`, opts, done);
  }

  getAlignment(jobId, opts, done) {
    this.get(`user/:userId/jobs/${jobId}/alignment`, opts, done);
  }


    /* Status */
  getStatus(opts, done) {
    this.get('status', opts, done);
  }


    /* Statics */
  static parseAligment(text) {
    return text.toString().split('\n').reduce((arr, line) => {
      const re = /<time=(\d+\.\d+)>(\S*)<time=(\d+\.\d+)>/g;
      const words = [];

      function recurse(str) {
        const match = re.exec(str);
        if (match) {
          words.push({
            term: match[2],
            start: parseFloat(match[1], 10),
            end: parseFloat(match[3], 10),
          });
          recurse(str);
        }
      }
      recurse(line);

      if (words.length) {
        arr.push({
          start: words[0].start,
          end: words[words.length - 1].end,
          words,
        });
      }
      return arr;
    }, []);
  }
}

module.exports = Client;
