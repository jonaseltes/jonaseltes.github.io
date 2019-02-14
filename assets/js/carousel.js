---
---

{% if jekyll.environment == "production" %}
  console.log = function() {}
{% endif %}

console.log("init carousel");

$('.slick-carousel').slick({
  autoplay: true,
  fade: true,
  speed: 700,
  autoplaySpeed: 3000,
  arrows: false
  // adaptiveHeight: true
});
