---
---
{% if jekyll.environment == "production" %}
  console.log = function() {}
{% endif %}

console.log("main.js");
