---
layout: page
title: Projects
permalink: /projects/
---
This is a contaner page for all projects.

{% for item in site.projects %}
  <!-- <h2>{{ item.title }}</h2> -->
  <!-- <p>{{ item.description }}</p> -->
  <p><a href="{{ item.url }}">{{ item.title }}</a></p>
{% endfor %}
