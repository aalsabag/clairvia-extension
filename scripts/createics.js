document.addEventListener('dblclick', getDomainCookies())


const delay = ms => new Promise(res => setTimeout(res, ms));

async function getDomainCookies() {

    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    var domainurl = ""
    if (tab?.url) {
        try {
        let url = new URL(tab.url);
        domainurl = url.hostname;
        } catch {
        // ignore
        }
    }

    if (domainurl != "clairvia.prx.texashealth.org") {
        return "Please visit the clairvia page and login before executing this plugin."
    }
    const cookies = await chrome.cookies.getAll({domain: "clairvia.prx.texashealth.org"},)

    if (cookies.length === 0) {
    return 'No cookies found. Please login to the clairvia page before executing this plugin.';
    }
    document.getElementById("texttest2").innerText = domainurl;
    document.getElementById("texttest").innerText = JSON.stringify(cookies)
    getEmployeeData(domainurl, cookies)
    return "found cookies"
  }

  function getEmployeeData(domainurl, cookies) {
    var reqUrl = `https://${domainurl}/ClairviaWeb/WebScheduling/emp/RequestEmpMultiweek.aspx/GetEmployeeRequestEvents`
    var monthlyReqUrl = `https://${domainurl}/ClairviaWeb/WebScheduling/emp/monthly.aspx`
    var employeeDataBody = {
        "key": 11,
        "startDate": "08/20/2023",
        "endDate": "10/01/2023",
        "employeeOnly": false,
        "scheduleData": true,
        "requestsData": false
    }



    // fetch("https://clairvia.prx.texashealth.org/ClairviaWeb/WebScheduling/emp/RequestEmpMultiweek.aspx?ScheduleOnlyMode=true", 
    //     {
    //     method: "GET",
    //     credentials: 'include'
    //     }
    // ).then(response => {
    //     if (response.ok) {
    //     //return response.json(); // Parse the response data as JSON
    //     } else {
    //     throw new Error('API request failed');
    //     }
    // })
    // .then(async data => {
    //     // Process the response data here
    //     console.log(data); // Example: Logging the data to the console

    //     await delay(2000);

    //     fetch("https://clairvia.prx.texashealth.org/ClairviaWeb/WebScheduling/emp/RequestEmpMultiweek.aspx/UpdateScheduleRequestData", 
    //         {
    //         method: "POST",
    //         body: JSON.stringify(employeeDataBody),
    //         credentials: 'include',
    //         headers: {
    //             "Content-Type": "application/json; charset=UTF-8"
    //         }
    //         }
    //     ).then(response => {
    //         if (response.ok) {
    //         //return response.json(); // Parse the response data as JSON
    //         } else {
    //         throw new Error('API request failed');
    //         }
    //     })
    //     .then(data => {
    //         // Process the response data here
    //         console.log(data); // Example: Logging the data to the console
    //     })
    //     .catch(error => {
    //         // Handle any errors here
    //         console.error(error); // Example: Logging the error to the console
    //     });
    // })
    // .catch(error => {
    //     // Handle any errors here
    //     console.error(error); // Example: Logging the error to the console
    // });

    
    // ///////
    // var employeeDataBody2 = {
        
    //         "profileID": 798,
    //         "startDate": "08/27/2023",
    //         "endDate": "10/01/2023"
          
    // }
    // fetch(reqUrl, 
    //     {
    //     method: "POST",
    //     body: JSON.stringify(employeeDataBody2),
    //     credentials: 'include',
    //     headers: {
    //         "Content-Type": "application/json; charset=UTF-8"
    //     }
    //     }
    // ).then(response => {
    //     if (response.ok) {
    //     //return response.json(); // Parse the response data as JSON
    //     } else {
    //     throw new Error('API request failed');
    //     }
    // })
    // .then(data => {
    //     // Process the response data here
    //     console.log(data); // Example: Logging the data to the console
    // })
    // .catch(error => {
    //     // Handle any errors here
    //     console.error(error); // Example: Logging the error to the console
    // });
    // ////////////
    fetch(monthlyReqUrl, 
        {
        method: "Get",
        //body: JSON.stringify(employeeDataBody),
        credentials: 'include',
        headers: {
            "Content-Type": "application/json; charset=UTF-8"
        }
        }
    ).then(response => {
        if (response.ok) {
        //return response.json(); // Parse the response data as JSON
        return response.text()
        } else {
        throw new Error('API request failed');
        }
    })
    .then(html => {
        var parser = new DOMParser();

        // Parse the text
        var doc = parser.parseFromString(html, "text/html");

        // You can now even select part of that html as you would in the regular DOM 
        // Example:
        var grid = doc.getElementsByClassName('MonthlyScheduleGrid')[0];
        //var grid = doc.getElementById('ctl00_ctl00_ctl00_bodyPlaceHolder_MasterContentPlaceHolder_SchedulingMasterContentPlaceHolder_schedCalendar').innerHTML

        var employeeMap = new Map()
        var rowLength = grid.rows.length;

        //loops through rows    
        for (var i = 0; i < rowLength; i++){

            //gets cells of current row  
            var oCells = grid.rows.item(i).cells;

            //gets amount of cells of current row
            var cellLength = oCells.length;

            //loops through each cell in current row
            for(var j = 0; j < cellLength; j++){
                // get your cell info here

                var cellVal = oCells.item(j);
                //cellDate = oCells.item(j).getElementsByTagName('a')

				if (cellVal.innerHTML.length <= 4 || !cellVal.firstChild || cellVal.childNodes.length <= 5) continue;
                //console.log(cellVal.getElementsByTagName('a').getAttribute("title"))
                var schedNonFloat = cellVal.getElementsByClassName("schedNonFloat")
                var schedFloatIn = cellVal.getElementsByClassName("schedFloatIn")
                var currentDate = cellVal.querySelectorAll('[title]')[0].getAttribute("title")
                
                console.log("non float employees: " + schedNonFloat.length)
                console.log("float employees: " + schedFloatIn.length)
                
                for (var k=0; k< schedNonFloat.length; k++ ) {
                    var employeeInnerText = schedNonFloat[k].innerText
                    var employeeName = employeeInnerText.split(":")[0];
                    console.log(employeeName)
   
                    if (!employeeMap.has(employeeName)){
                        var dateArray = new Array()
                        dateArray.push(currentDate)
                        employeeMap.set(employeeName, dateArray);
                    } else {
                        var currentArray = employeeMap.get(employeeName)
                        currentArray.push(currentDate)
                        employeeMap.set(employeeName, currentArray)
                    }
                    
                	
                }
            }
        }
        console.log(employeeMap)

    })
    .catch(error => {
        // Handle any errors here
        console.error(error); // Example: Logging the error to the console
    });
    
  }
