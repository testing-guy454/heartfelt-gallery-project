UPDATE chapters SET location_name = CASE slug
  WHEN 'first-meeting' THEN 'Udaipur, India'
  WHEN 'everyday-magic' THEN 'Jaipur, India'
  WHEN 'little-adventures' THEN 'Varanasi, India'
  WHEN 'the-slow-seasons' THEN 'Kochi, India'
  WHEN 'quiet-conversations' THEN 'Manali, India'
  WHEN 'collected-mornings' THEN 'Agra, India'
END,
latitude = CASE slug
  WHEN 'first-meeting' THEN 24.5854
  WHEN 'everyday-magic' THEN 26.9124
  WHEN 'little-adventures' THEN 25.3176
  WHEN 'the-slow-seasons' THEN 9.9312
  WHEN 'quiet-conversations' THEN 32.2432
  WHEN 'collected-mornings' THEN 27.1767
END,
longitude = CASE slug
  WHEN 'first-meeting' THEN 73.7125
  WHEN 'everyday-magic' THEN 75.7873
  WHEN 'little-adventures' THEN 83.0108
  WHEN 'the-slow-seasons' THEN 76.2673
  WHEN 'quiet-conversations' THEN 77.1892
  WHEN 'collected-mornings' THEN 78.0081
END
WHERE slug IN ('first-meeting', 'everyday-magic', 'little-adventures', 'the-slow-seasons', 'quiet-conversations', 'collected-mornings');