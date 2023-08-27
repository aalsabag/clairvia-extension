document.addEventListener('dblclick', getDomainCookies())
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
    var employeeDataBody = {
        "key": 11,
        "startDate": "08/20/2023",
        "endDate": "10/01/2023",
        "employeeOnly": false,
        "scheduleData": true,
        "requestsData": false
    }

    fetch("https://clairvia.prx.texashealth.org/ClairviaWeb/WebScheduling/emp/RequestEmpMultiweek.aspx?ScheduleOnlyMode=true", 
        {
        method: "GET",
        credentials: 'include'
        }
    ).then(response => {
        if (response.ok) {
        //return response.json(); // Parse the response data as JSON
        } else {
        throw new Error('API request failed');
        }
    })
    .then(data => {
        // Process the response data here
        console.log(data); // Example: Logging the data to the console
    })
    .catch(error => {
        // Handle any errors here
        console.error(error); // Example: Logging the error to the console
    });

    fetch(reqUrl, 
        {
        method: "POST",
        body: JSON.stringify(employeeDataBody),
        credentials: 'include',
        headers: {
            "Content-Type": "application/json; charset=UTF-8"
        }
        }
    ).then(response => {
        if (response.ok) {
        //return response.json(); // Parse the response data as JSON
        } else {
        throw new Error('API request failed');
        }
    })
    .then(data => {
        // Process the response data here
        console.log(data); // Example: Logging the data to the console
    })
    .catch(error => {
        // Handle any errors here
        console.error(error); // Example: Logging the error to the console
    });

    
  }