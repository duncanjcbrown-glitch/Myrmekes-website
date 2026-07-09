(function () {
  "use strict";

  var params = new URLSearchParams(window.location.search);
  var initialQuery = params.get("q") || "";

  var input = document.getElementById("tech-search-input");
  var resultsEl = document.getElementById("tech-results");
  var countEl = document.getElementById("tech-result-count");

  function normalize(s) {
    return s.toLowerCase().trim();
  }

  function matches(vendor, query) {
    if (!query) return true;
    var q = normalize(query);
    if (normalize(vendor.name).indexOf(q) !== -1) return true;
    return vendor.categories.some(function (c) { return normalize(c).indexOf(q) !== -1; });
  }

  function techLink(name) {
    return "contact.html?tech=" + encodeURIComponent(name);
  }

  function escapeHtml(s) {
    var div = document.createElement("div");
    div.textContent = s;
    return div.innerHTML;
  }

  function renderVendorCard(vendor) {
    var tags = vendor.categories.length ? vendor.categories.join(", ") : "General";
    return (
      '<div class="tech-card">' +
      "<h4>" + escapeHtml(vendor.name) + "</h4>" +
      '<p class="tech-tags">' + escapeHtml(tags) + "</p>" +
      '<a href="' + techLink(vendor.name) + '" class="btn btn-primary">Get help with ' + escapeHtml(vendor.name) + "</a>" +
      "</div>"
    );
  }

  function groupByCategory(vendors) {
    var groups = {};
    var general = [];
    vendors.forEach(function (v) {
      if (!v.categories.length) {
        general.push(v);
        return;
      }
      v.categories.forEach(function (c) {
        groups[c] = groups[c] || [];
        groups[c].push(v);
      });
    });
    return { groups: groups, general: general };
  }

  function render(query) {
    var filtered = VENDORS.filter(function (v) { return matches(v, query); });

    if (query && filtered.length === 0) {
      countEl.textContent = "No confirmed match for “" + query + "”";
      resultsEl.innerHTML =
        '<div class="tech-no-results">' +
        "<p><strong>“" + escapeHtml(query) + "” isn't a listed specialism today.</strong></p>" +
        "<p>Tell us what you're dealing with and we'll check with our partner network for you.</p>" +
        '<a href="' + techLink(query) + '" class="btn btn-primary">Tell us about ' + escapeHtml(query) + "</a>" +
        "</div>";
      return;
    }

    if (query) {
      countEl.textContent = filtered.length + (filtered.length === 1 ? " match" : " matches") + " for “" + query + "”";
      resultsEl.innerHTML = '<div class="tech-grid">' + filtered.map(renderVendorCard).join("") + "</div>";
      return;
    }

    countEl.textContent = VENDORS.length + " technologies we work with";
    var grouped = groupByCategory(VENDORS);
    var html = "";
    Object.keys(grouped.groups).sort().forEach(function (category) {
      html += '<h3 class="tech-category-heading">' + escapeHtml(category) + "</h3>";
      html += '<div class="tech-grid">' + grouped.groups[category].map(renderVendorCard).join("") + "</div>";
    });
    if (grouped.general.length) {
      html += '<h3 class="tech-category-heading">General</h3>';
      html += '<div class="tech-grid">' + grouped.general.map(renderVendorCard).join("") + "</div>";
    }
    resultsEl.innerHTML = html;
  }

  input.value = initialQuery;
  render(initialQuery);
  input.addEventListener("input", function () { render(input.value); });
})();
