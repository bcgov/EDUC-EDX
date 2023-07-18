# EDX New User Onboarding Script

The purpose of this script is to help onboard existing staff onto the new EDX
platform.

## Setup

The following steps are required prior to running the onboarding scripts

### Make environment file with up-to-date environment variables.

Put the following information into the `.env` file at the project root and fill in
the missing strings:

```bash
SOAM_CLIENT_ID=""
SOAM_CLIENT_SECRET=""
SOAM_TOKEN_URL=""
INSTITUTE_SERVICE_URL=""
EDX_API_BASE_URL=""
ONBOARDING_INSTITUTE_TYPE=""
CHES_CLIENT_ID=""
CHES_CLIENT_SECRET=""
CHES_TOKEN_URL=""
CHES_EMAIL_URL=""
```

Make sure to set `ONBOARDING_INSTITUTE_TYPE` to either `SCHOOL` or `DISTRICT`,
depending on the type of institution you are on-boarding.  This is value is *case
sensitive*.

### A CSV file that contains the prospective EDX User Data.

A valid CSV file should have:
- A headers row as the first line to describe the column data
- Four columns in the following order: mincode, firstname, lastname and email
  address.

Put this CSV file in the project root and rename it to `user-records.csv`

### Install npm dependencies and build the script.

This tool was written with NodeJS 18, so you may want to use version 18 or
higher. The on-boarding tool is written in TypeScript.

Run `npm install && npm run build` from the root folder.

## Usage

Run `npm start` from the root folder after following the steps in the setup
instructions.
