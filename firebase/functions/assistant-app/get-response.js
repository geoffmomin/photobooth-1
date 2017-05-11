// Copyright 2017, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
'use strict';

const responses = require('./responses.json');

const SSML_PREFIX = '<speak>';
const SSML_POSTFIX = '</speak>';
const SHORT_BREAK = '<break time="0.5s"/>';
const MEDIUM_BREAK = '<break time="1s"/>';

const SHUTTER_SOUND_TAG = '**shutter**';
const SHUTTER_SOUND_SSML = '<audio src="https://storage.googleapis.com/smart-photobooth-93105.appspot.com/sounds/shutter.mp3" />';
const DIAL_UP_SOUND_TAG = '**dialup**';
const DIAL_UP_SOUND_SSML = '<audio src="https://storage.googleapis.com/smart-photobooth-93105.appspot.com/sounds/DialUp.mp3" />';

const DELAY_ADJUST = 1.0;

/**
 * Prompt fetching utility class.
 */
module.exports = class ResponseFetch {
  /*
   * Gets a random string from array of strings.
   *
   * @param {Array<string>} strings Array of strings.
   * @return {string} Randomly chosen string from array.
   */
  getRandomResponse_ (responses) {
    const index = Math.floor(Math.random() * responses.length);
    return responses[index];
  }
  /*
   * Takes a string and pre fixes and post fixes SSML tags
   *
   * @return {string} string containing response with SSML pre/post fix
   */
  addPrePostfix (string) {
    return SSML_PREFIX + string + SSML_POSTFIX;
  }
  /*
   * Takes a string and replaces punctuation with a SSML break
   *
   * @return {string} string containing response with SSML break in place of ,
   */
  replacePunctuationWithSsml (string) {
    string = string.split('...').join(MEDIUM_BREAK);
    string = string.split('.').join(SHORT_BREAK);
    string = string.split(',').join(SHORT_BREAK);
    string = string.split('!').join(SHORT_BREAK);
    string = string.split(';').join(SHORT_BREAK);
    string = string.split(':').join(SHORT_BREAK);
    return string;
  }
  /*
   * Takes a string and replaces **X** with SSML sound tags
   *
   * @return {string} SSML response
   */
  replaceTagsWithSsmlSounds (string) {
    string = string.split(SHUTTER_SOUND_TAG).join(SHUTTER_SOUND_SSML);
    string = string.split(DIAL_UP_SOUND_TAG).join(DIAL_UP_SOUND_SSML);
    return string;
  }
  /*
   * Gets a random string from one of the given general prompt types.
   *
   * @return {string} string containing response
   */
  getResponse (name, index) {
    let response;
    if (index === undefined) {
      response = this.getRandomResponse_(responses[name]);
    } else {
      response = responses[name][index];
    }
    response = this.replacePunctuationWithSsml(response);
    response = this.replaceTagsWithSsmlSounds(response);
    response = this.addPrePostfix(response);
    return response;
  }
  /*
   * Gets a welcome string from a combo of a welcome response
   * and a take picture response
   *
   * @return {string} string containing response
   */
  getWelcomeResponse () {
    // Initialize vars
    let response1;
    let response2;
    let response3;
    let responseDelay1;
    let responseDelay2;

    // Get responses
    [response1, responseDelay1] = this.getRandomResponse_(responses['WELCOME']);
    [response2, responseDelay2] = this.getRandomResponse_(responses['TAKE_PICTURE']);
    response3 = this.getRandomResponse_(responses['APPROVAL_INQUIRY']);

    // Compose response
    let response = response1 + ', ' + response2 + '... ... ' + response3;
    response = this.replacePunctuationWithSsml(response);
    response = this.replaceTagsWithSsmlSounds(response);
    response = this.addPrePostfix(response);

    // Calculate delay until shutter sound  (don't include approval inquiry)
    let delay = responseDelay1 + responseDelay2;

    return [response, delay * DELAY_ADJUST];
  }
  /*
   * Gets a take picture response
   *
   * @return {string} string containing response
   */
  getTakePictureResponse () {
    // Initialize vars
    let response1;
    let response2;
    let delay;

    // Get responses
    // Calculate delay until shutter sound (don't include approval inquiry)
    [response1, delay] = this.getRandomResponse_(responses['TAKE_PICTURE']);
    response2 = this.getRandomResponse_(responses['APPROVAL_INQUIRY']);

    // Compose response
    let response = response1 + '... ... ' + response2;
    response = this.replacePunctuationWithSsml(response);
    response = this.replaceTagsWithSsmlSounds(response);
    response = this.addPrePostfix(response);

    return [response, delay * DELAY_ADJUST];
  }
};
