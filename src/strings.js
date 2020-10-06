export const navigation = {
  about: "ABOUT",
  work: "WORK",
}

export const projects = [
  {
    title: "Lemmi",
    description: "An Android and iOS app that helps people with speech difficulties communicate with ease, and re-connect with others. Initially developed for the web, then converted to a hybrid application using Apache Cordova, I ported Lemmi to native SDKs to improve performance and make use of APIs not accessible otherwise. (Launching Q3 2020)",
    webImage: "lemmi-web",
    mobileImage: "lemmi-mobile",
    tools: {
      "Mobile": ["Swift", "Kotlin"],
      "Front-End": ["Svelte", "Rollup"],
      "Testing": ["XCTAssert"]
    },
    links: {
      "Website": "https://www.lemmichat.com",
      "Repo (web)": "https://github.com/willnix86/Lemmi"
    }
  },
  {
    title: "Get Your Beerings",
    description: "An app to find pubs, breweries, and beer-gardens nearby on in a place the user plans to visit. Get Your Beering began as a Progressive Web App before being developed for iOS.",
    webImage: "beerings-web",
    mobileImage: "beerings-mobile",
    iosLink: "https://apps.apple.com/us/app/get-your-beerings/id1484223930?ls=1",
    tools: {
      "Mobile": ["Swift", "ArcGIS"],
      "Front-End": ["Javascript", "jQuery"],
      "APIs": ["Google Places", "Google Maps", "Google Distance Matrix", "LocationIQ"]
    },
    links: {
      "Website": "https://beerings.now.sh/",
      "App Store": "https://apps.apple.com/us/app/get-your-beerings/id1484223930?ls=1",
      "Repo (web)": "https://github.com/willnix86/get-your-beerings",
      "Repo (mobile)": "https://github.com/willnix86/beerings-ios-public"
    }
  },
  {
    title: "English Rules",
    description: "A web-app for teachers, and students aged 8-10, to aid the learning of English grammar. Teachers can customize a variety of exercises to better match the content of their curriculum.",
    webImage: "english-web",
    mobileImage: "english-mobile",
    tools: {
      "Front-End": ["React", "Redux", "React Drag n Drop"],
      "Back-End": ["Node", "Express", "Mocha", "Chai", "REST", "MongoDB", "Mongoose", "Passport", "JWT Authentication"],
      "Testing": ["Enzyme", "Jest"]
    },
    links: {
      "Website": "https://english-rules.herokuapp.com/",
      "Repo (client)": "https://github.com/willnix86/english-rules-client",
      "Repo (api)": "https://github.com/willnix86/english-rules-server",
    }
  },
  {
    title: "Ppl",
    description: "Built to help users develop the people in their care, whether those people are a student, a client, a subordinate, or a member of the user's congregation. The focus is simple: set goals, track progress, and schedule regular face-time.",
    webImage: "ppl-web",
    mobileImage: "ppl-mobile",
    tools: {
      "Front-End": ["HTML5", "CSS", "JavaScript", "jQuery"],
      "Back-End": ["Node", "Express", "Mocha", "Chai", "REST", "MongoDB", "Mongoose", "Passport", "JWT Authentication"],
    },
    links: {
      "Website": "https://wheremypplat.herokuapp.com/",
      "Repo": "https://github.com/willnix86/ppl"
    }
  },
];

export const links = {
  twitter: { label: "TWITTER", url: "https://twitter.com/willnix86" },
  linkedin: { label: "LINKEDIN", url: "https://www.linkedin.com/in/willnixon1" },
  github: { label: "GITHUB", url: "https://github.com/willnix86" }
};

export const about = {
  email: { label: "Contact Me", url: "mailto:will_nixon@me.com?subject='Contact from Website'" }
}