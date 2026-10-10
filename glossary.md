---
layout: default
title: Glossary
description: Shared definitions for the EE and RF lecture series.
permalink: /glossary/
---

# Glossary

One definition for each shared term. Modules link here the first time a term appears. The RF series will add its own terms to the same file.

{% assign terms = site.data.glossary | sort: "term" %}
<ul>
{% for t in terms %}
  <li><a href="#{{ t.id }}">{{ t.term }}</a></li>
{% endfor %}
</ul>

{% for t in terms %}
<h2 id="{{ t.id }}">{{ t.term }}</h2>
<p>{{ t.definition }}</p>
{% if t.units %}<p>Units: {{ t.units }}</p>{% endif %}
{% endfor %}
