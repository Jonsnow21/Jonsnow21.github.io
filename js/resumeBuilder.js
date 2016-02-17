//helper.js
var markers = [];

var HTMLheaderName = '<h1 id="name">%data%</h1>';
var HTMLheaderRole = '<span>%data%</span><hr/>';

var HTMLcontactGeneric = '<li class="flex-item"><span class="orange-text">%contact%</span><span class="white-text">%data%</span></li>';
var HTMLmobile = '<li class="flex-item"><span class="orange-text">mobile</span><span class="white-text">%data%</span></li>';
var HTMLemail = '<li class="flex-item"><span class="orange-text">email</span><span class="white-text">%data%</span></li>';
var HTMLtwitter = '<li class="flex-item"><span class="orange-text">twitter</span><span class="white-text">%data%</span></li>';
var HTMLgithub = '<li class="flex-item"><span class="orange-text">github</span><span class="white-text">%data%</span></li>';
var HTMLblog = '<li class="flex-item"><span class="orange-text">linkedIn</span><span class="white-text">%data%</span></li>';
var HTMLlocation = '<li class="flex-item"><span class="orange-text">location</span><span class="white-text">%data%</span></li>';

var HTMLbioPic = '<img src="%data%" class="biopic">';
var HTMLwelcomeMsg = '<span class="welcome-message">%data%</span>';

var HTMLskillsStart = '<h3 id="skills-h3">Skills at a Glance:</h3><ul id="skills" class="flex-box"></ul>';
var HTMLskills = '<li class="flex-item"><span class="white-text">%data%</span></li>';

var HTMLworkStart = '<div class="work-entry"></div>';
var HTMLworkEmployer = '<div>%data%';
var HTMLworkTitle = ' - %data%</div>';
var HTMLworkDates = '<div class="date-text">%data%</div>';
var HTMLworkLocation = '<div class="location-text">%data%</div>';
var HTMLworkDescription = '<p><br>%data%</p>';

var HTMLprojectStart = '<div class="project-entry"></div>';
var HTMLprojectTitle = '<a href="https://github.com/Jonsnow21/breakout" target = "_blank">%data%</a>';
var HTMLprojectDates = '<div class="date-text">%data%</div>';
var HTMLprojectDescription = '<p><br>%data%</p>';
var HTMLprojectImage = '<img src="%data%">';

var HTMLschoolStart = "<div class='education-entry'></div>";
var HTMLschoolName = "<br><div><br>%data%<div>";
var HTMLschoolDegree = "<div>%data%</div>";
var HTMLschoolDates = "<div class='date-text'><br>%data%<br></div>";
var HTMLschoolLocation = "<div class='location-text'><p>%data%</p></div>";
var HTMLschoolMajor = "<div><em>Major: %data%</em></div>";

var HTMLonlineClasses = '<h3><br>Online Classes</h3>';
var HTMLonlineTitle = "<br/><p><em>%data%</em></p>";
var HTMLonlineSchool = '<div>%data%</div>';
var HTMLonlineDates = '<div class="date-text">%data%</div><br>';
var HTMLonlineURL = '<br><a href="#">%data%</a>';

var googleMap = '<div id="map"></div>';

var map; 


/*
Start here! initializeMap() is called when page is loaded.
*/
function initializeMap() {

  var locations;

  var mapOptions = {
    disableDefaultUI: true,
    zoomControl: false,
    scaleControl: false,
    panControl: false
  };

  /* 
  For the map to be displayed, the googleMap var must be
  appended to #mapDiv in resumeBuilder.js. 
  */
  map = new google.maps.Map(document.querySelector('#map'), mapOptions);


  /*
  locationFinder() returns an array of every location string from the JSONs
  written for bio, education, and work.
  */
  function locationFinder() {

    // initializes an empty array
    var locations = [];

    // adds the single location property from bio to the locations array
    locations.push(bio.contacts.location);

    // iterates through school locations and appends each location to
    // the locations array
    for (var school in education.schools) {
      locations.push(education.schools[school].location);
    }

    // iterates through work locations and appends each location to
    // the locations array
    for (var job in work.jobs) {
      locations.push(work.jobs[job].location);
    }

    return locations;
  }

  /*
  createMapMarker(placeData) reads Google Places search results to create map pins.
  placeData is the object returned from search results containing information
  about a single location.
  */
  function createMapMarker(placeData) {

    // The next lines save location data from the search result object to local variables
    var lat = placeData.geometry.location.lat();  // latitude from the place service
    var lon = placeData.geometry.location.lng();  // longitude from the place service
    var name = placeData.formatted_address;   // name of the place from the place service
    var bounds = window.mapBounds;            // current boundaries of the map window

    // marker is an object with additional data about the pin for a single location
    var marker = new google.maps.Marker({
      map: map,
      position: placeData.geometry.location,
      title: name
    });

    marker.infowindow = infoWindow;

    // infoWindows are the little helper windows that open when you click
    // or hover over a pin on a map. They usually contain more information
    // about a location.
    var infoWindow = new google.maps.InfoWindow({
      content: name
    });

    // hmmmm, I wonder what this is about...
    google.maps.event.addListener(marker, 'click', function() {
      if (markers.length>0) {
        for (var i=0;i<markers.length;i++) {
           markers[i].infowindow.close();
        }        
      }
      infoWindow.open(map,marker);
    });

    // this is where the pin actually gets added to the map.
    // bounds.extend() takes in a map location object
    bounds.extend(new google.maps.LatLng(lat, lon));
    // fit the map to the new marker
    map.fitBounds(bounds);
    // center the map
    map.setCenter(bounds.getCenter());
    markers.push(marker);
  }

  /*
  callback(results, status) makes sure the search returned results for a location.
  If so, it creates a new map marker for that location.
  */
  function callback(results, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
      createMapMarker(results[0]);
    }

  }

  /*
  pinPoster(locations) takes in the array of locations created by locationFinder()
  and fires off Google place searches for each location
  */
  function pinPoster(locations) {

    // creates a Google place search service object. PlacesService does the work of
    // actually searching for location data.
    var service = new google.maps.places.PlacesService(map);

    // Iterates through the array of locations, creates a search object for each location
    for (var place in locations) {

      // the search request object
      var request = {
        query: locations[place]
      };

      // Actually searches the Google Maps API for location data and runs the callback
      // function with the search results after each search.
      service.textSearch(request, callback);
    }
  }

  // Sets the boundaries of the map based on pin locations
  window.mapBounds = new google.maps.LatLngBounds();

  // locations is an array of location strings returned from locationFinder()
  locations = locationFinder();

  // pinPoster(locations) creates pins on the map for each location in
  // the locations array
  pinPoster(locations);

}

/*
Uncomment the code below when you're ready to implement a Google Map!
*/

// Calls the initializeMap() function when the page loads
window.addEventListener('load', initializeMap);

// Vanilla JS way to listen for resizing of the window
// and adjust map bounds
window.addEventListener('resize', function(e) {
  //Make sure the map bounds get updated on page resize
  map.fitBounds(mapBounds);
});







var bio = {
	"name" : "Neeraj Kumar Jha",
	"role" : "Developer In Making",
	"welcomeMessage" : "hey, I am Neeraj ",
	"bioPic" : "images/fry.jpg",
	"contacts" : {
		"mobile" : "8010879484",
		"email" : "neeraj14.nj@gmail.com",
		"github" : "https://github.com/Jonsnow21",
		"twitter" : "https://twitter.com/neeraj_1994",
		"linkedIn" : "https://in.linkedin.com/in/neeraj-jha-9525a5b8",
		"location" : "E-170, St -7, Pandav Nagar, Delhi, India"
	},
	"skills" : ["Programming","C++","JavaScript","HTML","Awesomeness"]
}

var work = {
	"jobs" : [{
		"employer": "Bharat Heavy Electrical Ltd",
		"title": "Summer Intern",
		"dates": "3rd Aug, 2015 - 31st Aug, 2015",
		"location": "Film City, Sector 16A, Noida, Uttar Pradesh, India",
		"description": "Industrial training at BHEL-PEM, Noida in Control & Instrumentation department" 
	}]
}

var project = {
	"projects": [{
		"title" : "Breakout Game",
		"dates" : "Feb 2016 - Present",
		"description" : "An online version of Breakout game was created using HTML5 and JavaScript",
		"images" : ["images/proj1.png", "images/proj2.png"]
	}]
}

var education = {
 	"schools": [{
 		"name": "University School of Information and Communication Technology, GGSIPU",
 		"location" : "Sector 16C, Dwarka, New Delhi, Delhi 110078, India",
 		"degree": "Bachelor of Technology",
 		"major": "ECE",
 		"dates": "2013 - Present",
 		"url" : "http://ipu.ac.in/"
 	}, {
 		"name": "Ahlcon International School",
 		"location" : "Mayur vihar phase - 1, Delhi, India",
 		"degree" : "12th",
 		"major" : "Science",
 		"dates": "2008 - 2012",
 		"url" : "http://www.ahlconinternational.com/"
 	}],
 	"onlineCourses": [{
 		"title" : "Introduction to Computer Science",
 		"school" : "Harvard University",
 		"dates" : "Sept 2015 - Jan 2016",
 		"url" : "https://cs50.harvard.edu/"
 	},{
 		"title" : "Introduction to Linux",
 		"school" : "LinuxFoundationX",
 		"dates" : "Jan 2016 - Mar 2016",
 		"url" : "https://courses.edx.org/courses/course-v1:LinuxFoundationX+LFS101x.2+1T2015/info"
 	}]
}


bio.display = function() 
{
	var formattedName = HTMLheaderName.replace("%data%", bio.name);
	var formattedRole = HTMLheaderRole.replace("%data%", bio.role);
	var formattedWelcome = HTMLwelcomeMsg.replace("%data%", bio.welcomeMessage);
	var formattedBiopic = HTMLbioPic.replace("%data%", bio.bioPic);
	var formattedMobile = HTMLmobile.replace("%data%", bio.contacts.mobile);
	var formattedEmail = HTMLemail.replace("%data%", "<a class=\"contacts-link\" href=\"mailto:" + bio.contacts.email + "\">" + bio.contacts.email + "</a>");
	var formattedGithub = HTMLgithub.replace("%data%", "<a class=\"contacts-link\" href=\"" + bio.contacts.github + "\" target=\"_blank\">" + "Jonsnow21" + "</a>");
	var formattedLinkedIn = HTMLblog.replace("%data%", "<a class=\"contacts-link\" href=\"" + bio.contacts.linkedIn + "\" target=\"_blank\">" + "Neeraj Jha" + "</a>");
	var formattedtwitter = HTMLtwitter.replace("%data%", "<a class=\"contacts-link\" href=\"" + bio.contacts.twitter + "\" target=\"_blank\">" + "neeraj_1994" + "</a>");
	var formattedLocation = HTMLlocation.replace("%data%", bio.contacts.location);

	$("#header").prepend(formattedRole);
	$("#header").prepend(formattedName);
	$("#topContacts").append(formattedMobile);
	$("#topContacts").append(formattedLocation);
	$("#topContacts").append(formattedEmail);
	$("#topContacts").append(formattedGithub);
	$("#topContacts").append(formattedLinkedIn);
	$("#topContacts").append(formattedtwitter);
	$("#header").append(formattedWelcome);
	$("#header").append(formattedBiopic);

	if (bio.skills.length > 0) 
	{
		$("#header").append(HTMLskillsStart);
		var i = 0;
		var formattedSkill;
		while( i < bio.skills.length )
		{
			formattedSkill = HTMLskills.replace("%data%", bio.skills[i]);
			$("#skills-h3").append(formattedSkill);
			i++;
		}
	}
}
bio.display();


function displayWork()
{
	$("#workExperience").append(HTMLworkStart);
	var i = 0;
	for( i = 0; i < work.jobs.length; i++ ) 
	{
		var formattedWorkEmployer = HTMLworkEmployer.replace("%data%", work.jobs[i].employer);
		var formattedWorkTitle = HTMLworkTitle.replace("%data%", work.jobs[i].title );
		var formattedEmployerTitle = formattedWorkEmployer + formattedWorkTitle;
		var formattedWorkDates = HTMLworkDates.replace("%data%", work.jobs[i].dates);
		var formattedWorkLocation = HTMLworkLocation.replace("%data%", work.jobs[i].location);
		var formattedWorkDescription = HTMLworkDescription.replace("%data%", work.jobs[i].description);
		$(".work-entry:last").append(formattedEmployerTitle);
		$(".work-entry:last").append(formattedWorkDates);
		$(".work-entry:last").append(formattedWorkLocation);
		$(".work-entry:last").append(formattedWorkDescription);
	}
}

displayWork();


project.display = function()
{
	$("#projects").append(HTMLprojectStart);
	for( var i in project.projects )
	{
		if (project.projects.hasOwnProperty(i))
		{
			var formattedProjectTitle = HTMLprojectTitle.replace("%data%", project.projects[i].title);
			var formattedProjectDates = HTMLprojectDates.replace("%data%", project.projects[i].dates);
			var formattedProjectDescription = HTMLprojectDescription.replace("%data%", project.projects[i].description);
			$(".project-entry:last").append(formattedProjectTitle);
			$(".project-entry:last").append(formattedProjectDates);
			$(".project-entry:last").append(formattedProjectDescription);
			var projectImageUrl = HTMLprojectImage.replace("%data%", project.projects[i].images[0]);
			$(".project-entry:last").append(projectImageUrl);
			projectImageUrl = HTMLprojectImage.replace("%data%", project.projects[i].images[1]);
			$(".project-entry:last").append(projectImageUrl);
		}
	}	
}

project.display();


education.display = function () 
{
    var formattedHtml, edu;
    if (education.schools.length > 0 || education.onlineCourses.length > 0) 
    {
        $("#education").append(HTMLschoolStart);
        for (edu in education.schools) 
        {
            if (education.schools.hasOwnProperty(edu)) 
            {
                formattedHtml = HTMLschoolName.replace("%data%", education.schools[edu].name);
                $(".education-entry:last").append(HTMLschoolDates.replace("%data%", education.schools[edu].dates));
                $(".education-entry:last").append(formattedHtml);
                $(".education-entry:last").append(HTMLschoolLocation.replace("%data%", education.schools[edu].location));
                $(".education-entry:last").append(HTMLschoolDegree.replace("%data%", education.schools[edu].degree));
                $(".education-entry:last").append(HTMLschoolMajor.replace("%data%", education.schools[edu].major));
            }
        }
        $(".education-entry:last").append(HTMLonlineClasses);
        for (edu in education.onlineCourses) 
        {
            if (education.onlineCourses.hasOwnProperty(edu)) 
            {
                formattedHtml = HTMLonlineTitle.replace("%data%", education.onlineCourses[edu].title);
                $(".education-entry:last").append(formattedHtml);
                $(".education-entry:last").append(HTMLonlineSchool.replace('%data%', education.onlineCourses[edu].school));
                $(".education-entry:last").append(HTMLonlineDates.replace('%data%', education.onlineCourses[edu].dates));
            }
        }
    }
};

education.display();


$("#mapDiv").append(googleMap);

