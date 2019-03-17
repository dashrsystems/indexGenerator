const chromium = require("chrome-aws-lambda");
const puppeteer = require("puppeteer-core");
const fs = require("fs");
const handlebars = require("handlebars");
const html = require("./html");

export const index = async (event, context) => {
  // parse the body
  let body = null;
  let testingDate = null;
  let height = null;
  let weight = null;
  let wingSpan = null;
  let dash = null;
  let proAgility = null;
  let vertical = null;
  let dashTimeStamp = null;
  let proAgilityTimeStamp = null;
  let verticalTimeStamp = null;
  let position = null;
  let sport = null;
  let birthDate = null;
  let sex = null;
  let firstName = null;
  let middleName = null;
  let lastName = null;
  let reach = null;
  let tenIndex = null;
  let agilityIndex = null;
  let vertIndex = null;
  let overallIndex = null;
  try {
    body = JSON.parse(Buffer.from(event.body, "base64").toString());
    testingDate = new Date(body.testingDate);
    height = body.height;
    weight = body.weight;
    wingSpan = body.wingSpan;
    dash = body.dash;
    reach = body.reach;
    sex = body.sex.toLowerCase();
    proAgility = body.proAgility;
    vertical = body.vertical;
    dashTimeStamp = new Date(body.dashTimeStamp);
    proAgilityTimeStamp = new Date(body.proAgilityTimeStamp);
    verticalTimeStamp = new Date(body.verticalTimeStamp);
    birthDate = new Date(body.birthDate);
    firstName = body.firstName;
    middleName = body.middleName;
    lastName = body.lastName;
    tenIndex = body.dashIndex;
    agilityIndex = body.proAgilityIndex;
    vertIndex = body.verticalJumpIndex;
    overallIndex = body.totalIndex;

    if (
      testingDate == null ||
      height == null ||
      weight == null ||
      wingSpan == null ||
      dash == null ||
      proAgility == null ||
      vertical == null ||
      dashTimeStamp == null ||
      proAgilityTimeStamp == null ||
      verticalTimeStamp == null ||
      birthDate == null ||
      sex == null ||
      firstName == null ||
      middleName == null ||
      lastName == null ||
      reach == null ||
      tenIndex == null ||
      agilityIndex == null ||
      vertIndex == null ||
      overallIndex == null
    ) {
      throw "not enough parameters";
    }
    if (!sport) {
      sport = "N/A";
    }
    if (!position) {
      position = "N/A";
    }
    if (sex !== "male" && sex !== "female") {
      throw "not correct parameters";
    }
  } catch (err) {
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        message: "You do not have the correct body parameters"
      })
    };
  }

  // set time to 0 to compare dates
  testingDate.setHours(0, 0, 0, 0);
  dashTimeStamp.setHours(0, 0, 0, 0);
  proAgilityTimeStamp.setHours(0, 0, 0, 0);
  verticalTimeStamp.setHours(0, 0, 0, 0);

  // calculate height and age
  let age = calculate_age(birthDate);
  let name = `${firstName} ${middleName} ${lastName}`;
  let feet = Math.floor(height / 12);
  let inches = height - feet * 12;

  // check to see if the events match the testing date, if not then label it on the report
  if (testingDate.getTime() !== dashTimeStamp.getTime()) {
    dashTimeStamp = `(${dateTimeStamp.toDateString()})`;
  } else {
    dashTimeStamp = "";
  }

  if (testingDate.getTime() !== proAgilityTimeStamp.getTime()) {
    proAgilityTimeStamp = `(${proAgilityTimeStamp.toDateString()})`;
  } else {
    proAgilityTimeStamp = "";
  }

  if (testingDate.getTime() !== verticalTimeStamp.getTime()) {
    verticalTimeStamp = `(${verticalTimeStamp.toDateString()})`;
  } else {
    verticalTimeStamp = "";
  }

  const data = {
    name: name,
    sport: sport,
    position: position,
    age: age,
    feet: feet,
    inches: inches,
    weight: weight,
    wingSpan: wingSpan,
    reach: reach,
    ten: dash,
    agility: proAgility,
    vert: vertical,
    tenIndex: tenIndex,
    agilityIndex: agilityIndex,
    vertIndex: vertIndex,
    overallIndex: overallIndex,
    testingDate: testingDate.toDateString(),
    dashTimeStamp: dashTimeStamp,
    proAgilityTimeStamp: proAgilityTimeStamp,
    verticalTimeStamp: verticalTimeStamp
  };

  // inject data into tempalte
  const template = handlebars.compile(html.source, { strict: true });
  const result = template(data);

  // write report html to tmp folder ( AWS Lambda )
  fs.writeFileSync("/tmp/report.html", result);

  // generate pdf from report html
  let browser = await puppeteer.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath,
    headless: chromium.headless
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 800, height: 600, deviceScaleFactor: 3 });
  await page.goto("file:///tmp/report.html", {
    waitUntil: "networkidle0"
  });

  const buffer = await page.pdf({ format: "A4" });

  let response = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-type": "application/pdf"
    },
    body: buffer.toString("base64"),
    isBase64Encoded: true
  };
  return response;
};

function calculate_age(dob) {
  var diff_ms = Date.now() - dob.getTime();
  var age_dt = new Date(diff_ms);

  return Math.abs(age_dt.getUTCFullYear() - 1970);
}
