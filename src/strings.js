export const navigation = {
  work: "WORK",
  about: "ABOUT",
}

export const projects = [
  {
    title: "Lemmi",
    description: "An Android and iOS app that helps people with speech difficulties communicate with ease, and re-connect with others. Initially developed for the web, then converted to a hybrid application using Apache Cordova, I ported Lemmi to native SDKs to improve performance and make use of APIs not accessible otherwise. (Launching Q3 2020)",
    webImage: "lemmi-web",
    mobileImage: "lemmi-mobile",
    links: {
      "Website": "https://www.lemmichat.com",
      // "App Store": ""
      // "Play Store": ""
    }
  },
];

export const staff = [
  {
    name: "Jemma Bowles",
    title: "Co-Founder",
    about: "Jemma is a serial entrepreneur experienced in all aspects of business formation, strategy and operations. She is an innovative product developer, that uses her creativity and problem solving skills to generate new enterprising business ideas. Her passion is to drive these ideas into existence, by creating successful business ventures that can then help others.",
    image: "jemma-bowles"
  },
  {
    name: "Will Nixon",
    title: "Co-Founder",
    about: "Will is a software engineer experienced in developing full-stack and mobile applications. He is passionate about building technology that improves the lives of others and has created applications for government and non-profit organizations across the world.",
    image: 'will-nixon'
  }
];

export const links = {
  twitter: { label: "TWITTER", url: "https://twitter.com/jenixtech" },
  instagram: { label: "INSTAGRAM", url: "https://www.instagram.com/jenixtech" },
  facebook: { label: "FACEBOOK", url: "https://www.facebook.com/jenixtech" }
};

export const about = {
  email: { label: "Contact Us", url: "mailto:info@jenixtech.com?subject='Contact from Website'" },
  cards: [{
    title: "Our Mission",
    text: "To create cutting edge applications that improve the lives of each and every user."
  }, {
    title: "Our Values",
    text: "We are proud problem solvers committed to: working with integrity, designing with boldness, and providing positive consumer experiences."
  }, {
    title: "Our Promise",
    text: "To provide thoughtful solutions to complex problems using innovative ideas, responsive designs, and our technical expertise."
  }]
}