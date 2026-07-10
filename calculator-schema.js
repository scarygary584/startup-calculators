(function () {
  const calculatorId = document.body && document.body.dataset ? document.body.dataset.calculator : "";
  const hasCalculator = Boolean(calculatorId || document.querySelector("[data-calculator-form]") || document.querySelector("[data-calculator-results]"));

  if (!hasCalculator) return;
  if (document.querySelector('script[data-schema="calculator-web-application"]')) return;

  const canonical = document.querySelector('link[rel="canonical"]');
  const description = document.querySelector('meta[name="description"]');
  const h1 = document.querySelector("h1");
  const pageUrl = canonical ? canonical.href : window.location.href;
  const pageName = h1 ? h1.textContent.trim() : document.title.replace(/\s*\|\s*.*/, "").trim();
  const pageDescription = description ? description.content.trim() : "Free interactive business calculator for estimating startup costs, pricing, revenue, profit, and payback.";

  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "@id": pageUrl + "#calculator",
    "name": pageName,
    "url": pageUrl,
    "description": pageDescription,
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Any",
    "browserRequirements": "Requires JavaScript",
    "isAccessibleForFree": true,
    "inLanguage": "en-US",
    "publisher": {
      "@type": "Organization",
      "name": "Startup Profit Calculators",
      "url": "https://startupprofitcalculators.com/"
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": [
      "Interactive calculator inputs",
      "Live business profit estimates",
      "Startup cost and payback planning",
      "Editable assumptions"
    ]
  };

  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.dataset.schema = "calculator-web-application";
  script.text = JSON.stringify(schema);
  document.head.appendChild(script);
})();
