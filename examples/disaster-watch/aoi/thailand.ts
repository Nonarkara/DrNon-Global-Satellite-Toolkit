// examples/disaster-watch/aoi/thailand.ts
// Country-level AOI for Thailand. Use as-is or narrow to a province during activation.

export const THAILAND_AOI = {
  name: "Thailand",
  center: [100.9925, 15.8700] as [number, number], // [lon, lat] — country centroid
  radiusKm: 800,
  bbox: [97.0, 5.5, 105.5, 20.5] as [number, number, number, number], // [minLon, minLat, maxLon, maxLat]
  provinces: [
    "Bangkok", "Chiang Mai", "Chiang Rai", "Lamphun", "Lampang", "Mae Hong Son",
    "Nan", "Phayao", "Phrae", "Uttaraddit", "Kamphaeng Phet", "Nakhon Sawan",
    "Phichit", "Phetchabun", "Phitsanulok", "Sukhothai", "Tak", "Uthai Thani",
    "Loei", "Nong Bua Lamphu", "Nong Khai", "Bueng Kan", "Mukdahan", "Nakhon Phanom",
    "Roi Et", "Sakon Nakhon", "Udon Thani", "Yasothon", "Amnat Charoen",
    "Kalasin", "Khon Kaen", "Chaiyaphum", "Maha Sarakham", "Nakhon Ratchasima",
    "Buriram", "Surin", "Si Sa Ket", "Ubon Ratchathani", "Chanthaburi", "Chachoengsao",
    "Chonburi", "Trat", "Rayong", "Prachinburi", "Sa Kaeo", "Nakhon Nayok",
    "Pathum Thani", "Nonthaburi", "Samut Prakan", "Samut Sakhon", "Nakhon Pathom",
    "Kanchanaburi", "Ratchaburi", "Suphanburi", "Phetchaburi", "Prachuap Khiri Khan",
    "Chumphon", "Ranong", "Surat Thani", "Nakhon Si Thammarat", "Phatthalung",
    "Songkhla", "Satun", "Trang", "Krabi", "Phang Nga", "Phuket", "Pattani",
    "Yala", "Narathiwat",
  ],
} as const;
