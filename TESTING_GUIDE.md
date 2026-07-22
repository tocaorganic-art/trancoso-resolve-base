# Testing & Validation Guide — Trancoso Resolve

## 1. Lighthouse Audit

### Executar Lighthouse local
```bash
npm run build
npx lighthouse https://localhost:5173 --view
```

### Core Web Vitals Targets
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms (deprecated, use INP)
- **CLS (Cumulative Layout Shift)**: < 0.1
- **TTFB (Time to First Byte)**: < 600ms

### Performance Checklist
- [ ] LCP score > 90
- [ ] CLS score > 95
- [ ] Performance score > 85
- [ ] No render-blocking resources
- [ ] Images optimized (WebP)
- [ ] Code splitting active
- [ ] Unused CSS removed
- [ ] Critical CSS inlined

## 2. Accessibility Testing

### Automated Checks
```bash
npm run typecheck
npm run lint
```

### Manual Accessibility Audit
- [ ] Keyboard navigation (Tab, Enter, Escape)
- [ ] Screen reader testing (NVDA, JAWS, VoiceOver)
- [ ] Color contrast >= 4.5:1 for normal text
- [ ] Touch targets >= 44×44px
- [ ] Focus indicators visible
- [ ] Alt text present on images
- [ ] Form labels properly associated
- [ ] Heading hierarchy correct
- [ ] ARIA labels where needed

### WCAG 2.1 AA Compliance
- [ ] Criterion 1.4.3 (Contrast): All text >= 4.5:1
- [ ] Criterion 2.1.1 (Keyboard): All functions keyboard accessible
- [ ] Criterion 2.4.3 (Focus Order): Logical focus order
- [ ] Criterion 2.4.7 (Focus Visible): Clear focus indicator
- [ ] Criterion 4.1.2 (Name, Role, Value): Proper ARIA

## 3. Browser Compatibility

### Supported Browsers
- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Test Matrix
```
Browser          | Version | Status
Chrome           | Latest  | ✅
Chrome           | -1      | ✅
Firefox          | Latest  | ✅
Firefox          | -1      | ✅
Safari           | 14+     | ✅
Edge             | Latest  | ✅
Mobile Safari    | 14+     | ✅
Android Chrome   | Latest  | ✅
```

### Device Testing
- Desktop (1920×1080, 1366×768)
- Tablet (iPad, Android tablets)
- Mobile (iPhone 12+, Android flagship)

## 4. Performance Monitoring

### Metrics to Monitor (from Vercel Speed Insights)
- Page load time distribution
- Web Vitals per page
- Device type breakdown
- Geographic distribution
- Real user monitoring (RUM)

### Performance Regression Detection
- Run Lighthouse on each PR
- Compare against baseline
- Alert if any metric decreases > 10%

### Monitoring Tools
- Vercel Analytics (real user data)
- Vercel Speed Insights (Web Vitals)
- Google Analytics (custom events)
- Chrome DevTools (local testing)

## 5. Load Testing

### Simulate High Traffic
```bash
npm run build
npm install -g lighthouse
# Use WebPageTest.org or Locust for load testing
```

### Expected Under Load
- Page load time < 3s (P95)
- CLS < 0.1
- No timeouts or errors

## 6. Component Testing

### Image Optimization
- [ ] WebP served when supported
- [ ] JPG fallback provided
- [ ] Lazy loading active
- [ ] LazyImage component used for below-fold images

### Code Splitting
- [ ] LeadCaptureForm code-split
- [ ] Map components code-split
- [ ] Bundle size < 300KB (gzip)
- [ ] Chunk strategy optimized

### Analytics Events
- [ ] trackWhatsAppClick fires
- [ ] trackFormSubmit fires
- [ ] trackChatOpen fires
- [ ] Events appear in GA4 and Meta Pixel

## 7. Continuous Integration

### Pre-deployment Checks
```bash
npm run lint
npm run typecheck
npm run build
# Lighthouse CI
# Accessibility audit
```

### Performance Budget
- Bundle size: < 350KB (gzip)
- JS size: < 250KB (gzip)
- CSS size: < 50KB (gzip)
- LCP: < 2.5s
- CLS: < 0.1

## 8. Real User Monitoring

### Via Vercel Analytics
1. Check Performance page in Vercel dashboard
2. View Core Web Vitals distribution
3. Identify pages with issues
4. Track improvements over time

### Custom Events
- Monitor form submissions
- Track chat interactions
- Monitor search usage
- Track provider selection

## 9. Testing Checklist

### Functional Testing
- [ ] Hero slider works on all devices
- [ ] Form submissions complete
- [ ] Chat initializes without lag
- [ ] Maps load correctly
- [ ] Images load and display properly
- [ ] Analytics events fire

### Performance Testing
- [ ] LCP measured on pages
- [ ] CLS under 0.1 (no jumps)
- [ ] Images lazy-load on scroll
- [ ] Code splitting reduces main bundle

### Accessibility Testing
- [ ] Tab navigation works
- [ ] Screen reader announces all content
- [ ] Focus visible on all interactive elements
- [ ] All images have alt text
- [ ] Forms labeled correctly
- [ ] Color contrast adequate

### Browser Testing
- [ ] Chrome: All features work
- [ ] Firefox: All features work
- [ ] Safari: All features work
- [ ] Edge: All features work
- [ ] Mobile Chrome: All features work
- [ ] Mobile Safari: All features work

## 10. Deployment Verification

Post-deployment checks:
1. Run Lighthouse against production
2. Check Vercel Analytics for new data
3. Monitor error rates
4. Verify all analytics events firing
5. Check Core Web Vitals from real users
6. Perform smoke tests on critical paths

## Automation

### GitHub Actions (add to CI/CD)
```yaml
- name: Lighthouse CI
  uses: treosh/lighthouse-ci-action@v10
  with:
    configPath: './lighthouserc.json'
```

### Accessibility Audit (add to CI/CD)
```yaml
- name: Axe Accessibility Audit
  uses: dequelabs/axe-core-npm@develop
```

## Resources

- [Lighthouse Documentation](https://developers.google.com/web/tools/lighthouse)
- [Web Vitals Guide](https://web.dev/vitals/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Vercel Analytics Docs](https://vercel.com/docs/analytics)
- [WebPageTest](https://www.webpagetest.org/)
