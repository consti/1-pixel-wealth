// Fixed research snapshot. Update all values together from the same source/time.
// Source: https://www.forbes.com/real-time-billionaires/
// Verified September 11, 2026; source timestamp 1:50 p.m. EDT (17:50 UTC).
window.WEALTH_SNAPSHOT = Object.freeze({
  source: "https://www.forbes.com/real-time-billionaires/",
  asOf: "2026-09-11T13:50:00-04:00",
  dollarsPerPixel: 1000,
  people: [
    {
      id: "musk",
      name: "Elon Musk",
      company: "Tesla, SpaceX",
      billions: 922.7,
    },
    { id: "page", name: "Larry Page", company: "Google", billions: 279.8 },
    {
      id: "dell",
      name: "Michael Dell",
      company: "Dell Technologies",
      billions: 274.2,
    },
    { id: "bezos", name: "Jeff Bezos", company: "Amazon", billions: 273.2 },
    { id: "brin", name: "Sergey Brin", company: "Google", billions: 257.5 },
    {
      id: "zuckerberg",
      name: "Mark Zuckerberg",
      company: "Facebook",
      billions: 223.3,
    },
    {
      id: "ellison",
      name: "Larry Ellison",
      company: "Oracle",
      billions: 197.9,
    },
    {
      id: "huang",
      name: "Jensen Huang",
      company: "Semiconductors",
      billions: 189.9,
    },
  ],
});
