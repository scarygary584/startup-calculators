(function () {
  const calculatorKey = document.body && document.body.dataset ? document.body.dataset.calculator : "";
  if (!calculatorKey) return;

  const h1 = document.querySelector("h1");
  const canonical = document.querySelector('link[rel="canonical"]');
  const pageName = h1 && h1.textContent ? h1.textContent.trim() : document.title.replace(/\s*\|\s*.*/, "").trim();
  const pageUrl = canonical && canonical.href ? canonical.href : window.location.href;
  const homeUrl = "https://startupprofitcalculators.com/";

  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Startup Profit Calculators",
        "item": homeUrl
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": pageName,
        "item": pageUrl
      }
    ]
  };

  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.text = JSON.stringify(schema);
  document.head.appendChild(script);
})();
