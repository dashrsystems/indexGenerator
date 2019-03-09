const chromium = require("chrome-aws-lambda");
const puppeteer = require("puppeteer-core");
const fs = require("fs");
const handlebars = require("handlebars");
const html = require("./html");
const sql = require("mssql");
const athleteindex = require("./athlete-index");

export const index = async (event, context) => {
  try {
    let config = {
      user: "admin",
      password: "Gators8290!",
      server: "dashrdb.chsbdpa8gsrd.us-east-1.rds.amazonaws.com",
      database: "DashrBackend"
    };

    let athleteID = event.pathParameters.athleteID;

    // connect to DB
    await sql.connect(config);

    // athlete query
    let athleteQuery = await sql.query`SELECT * FROM Athletes WHERE Id = ${athleteID}`;

    // if there are no athletes, then user has given invalid ID
    if (athleteQuery.recordset.length === 0) {
      sql.close();
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({
          message: "You have entered an invalid athleteID"
        })
      };
    }

    let errorMessage = "";

    // extract the required athlete parameters for the report
    let athleteQueryResult = athleteQuery.recordset[0];
    let athlete = {};
    athlete["name"] = `${athleteQueryResult.FirstName} ${
      athleteQueryResult.LastName
    }`;
    athlete["weight"] = athleteQueryResult.Weight;
    athlete["sport"] = athleteQueryResult.Sport;
    athlete["position"] = athleteQueryResult.Position;
    athlete["height"] = athleteQueryResult.Height;
    athlete["wingSpan"] = athleteQueryResult.WingSpan;
    athlete["reach"] = athleteQueryResult.Reach;
    athlete["birthDate"] = athleteQueryResult.BirthDate;
    athlete["sex"] = athleteQueryResult.Sex;

    // check to see if the athlete has every property
    for (var property in athlete) {
      if (athlete.hasOwnProperty(property)) {
        if (!athlete[property]) {
          errorMessage = `This athlete does not have a ${property} listed`;
          sql.close();
          return {
            statusCode: 400,
            headers: {
              "Access-Control-Allow-Origin": "*"
            },
            body: JSON.stringify({
              message: errorMessage
            })
          };
        }
      }
    }

    // retrieving dash
    let dashQuery = await sql.query`SELECT TOP 1 Events.Id, Events.Type, Events.[Date], FinalTime.Time AS 'FinalTime' FROM Events 
    INNER JOIN FinalTime ON Events.Id = FinalTime.EventId 
    LEFT JOIN SplitTime ON Events.Id = SplitTime.EventId 
    WHERE Events.AthleteId = ${athleteID}
    AND SplitTime.[Time] IS NULL
    AND FinalTime.Distance = 10
    AND Events.Type='Dash'
	  ORDER BY CONVERT(varchar,Events.Date, 1) DESC, FinalTime.[Time] ASC`;

    // if there is no dash
    if (dashQuery.recordset.length === 0) {
      sql.close();
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({
          message: "This athlete has not ran a 10 yard dash"
        })
      };
    }

    // retrieving proagility
    let proAgilityQuery = await sql.query`SELECT TOP 1 * FROM Events
    WHERE Events.[Type] = 'ProAgility'
    AND Events.AthleteId=${athleteID}
	  ORDER BY  CONVERT(varchar,Events.Date, 1) DESC, Events.FinalTime ASC;`;

    // if there is no proagility
    if (proAgilityQuery.recordset.length === 0) {
      sql.close();
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({
          message: "This athlete has not ran a pro agility today"
        })
      };
    }

    // retrieving vertical
    let verticalQuery = await sql.query`SELECT TOP 1 * FROM Events 
    WHERE Events.[Type] = 'Vertical' 
    AND Events.AthleteId=${athleteID}
    ORDER BY CONVERT(varchar,Events.Date, 1) DESC, Events.JumpDistance ASC;`;

    // if there is no vertical
    if (verticalQuery.recordset.length === 0) {
      sql.close();
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({
          message: "This athlete has not done a vertical jump today"
        })
      };
    }

    sql.close();

    // grab the event times
    let ten = dashQuery.recordset[0].FinalTime;
    let agility = proAgilityQuery.recordset[0].FinalTime;
    let vert = verticalQuery.recordset[0].JumpDistance;
    let [tenIndex, agilityIndex, vertIndex] = [0, 0, 0];

    const {
      name,
      sport,
      position,
      birthDate,
      weight,
      wingSpan,
      reach,
      sex
    } = athlete;

    let feet = Math.floor(athlete["height"] / 12);
    let inches = athlete["height"] - feet * 12;

    // calculate index based on sex
    if (sex.toLowerCase() === "male") {
      [tenIndex, agilityIndex, vertIndex] = athleteindex.calculateMaleIndex(
        weight,
        ten,
        agility,
        vert
      );
    } else if (sex.toLowerCase() === "female") {
      [tenIndex, agilityIndex, vertIndex] = athleteindex.calculateFemaleIndex(
        weight,
        ten,
        agility,
        vert
      );
    } else {
      sql.close();
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({
          message: "Gender can only be male or female"
        })
      };
    }

    let overallIndex = tenIndex + agilityIndex + vertIndex;

    if (overallIndex > 600) {
      overallIndex = 600;
    }

    // data for template
    const data = {
      name: name,
      sport: sport,
      position: position,
      age: birthDate,
      feet: feet,
      inches: inches,
      weight: weight,
      wingSpan: wingSpan,
      reach: reach,
      ten: ten,
      agility: agility,
      vert: vert,
      tenIndex: tenIndex,
      agilityIndex: agilityIndex,
      vertIndex: vertIndex,
      overallIndex: overallIndex
    };

    // inject data into tempalte
    const template = handlebars.compile(html.source, { strict: true });
    const result = template(data);

    // write report html to tmp folder
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
  } catch (err) {
    // report error if there is one
    console.log(err);
    sql.close();
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({
        message: err.message
      })
    };
  }
};
