module.exports = {
  extends: 'lighthouse:default',
  settings: {
    formFactor: 'mobile',
    screenEmulation: {
      mobile: true,
      width: 412,
      height: 823,
      deviceScaleFactor: 1.75,
    },
    throttling: {
      rttMs: 150,
      downstreamThroughputKbps: 1600,
      upstreamThroughputKbps: 750,
      cpuSlowdownMultiplier: 4,
    },
    skipAudits: [
      'uses-rel-preconnect',
      'uses-rel-preload',
    ],
  },
  onlyCategories: [
    'performance',
    'accessibility',
    'best-practices',
    'seo',
    'pwa',
  ],
};
