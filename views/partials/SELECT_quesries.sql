

  SELECT 
    b.id, b.asin, b.title, a.id, a.name
  FROM 
    books b
    INNER JOIN authors_books ON b.id = authors_books.book_id
    INNER JOIN authors a ON authors_books.author_id = a.id 
  WHERE b.asin = "B008D1OIGA"; 



SELECT 
    b.id, b.asin, b.title, b.origin_id, o.name, p.name, l.name, g.name, rl.name, a.id, a.name
  FROM 
    books b
    INNER JOIN authors_books ON b.id = authors_books.book_id
    INNER JOIN authors a ON authors_books.author_id = a.id 
    LEFT JOIN origins o ON b.origin_id = o.id
    LEFT JOIN publishers p ON b.publisher_id = p.id
    LEFT JOIN languages l ON b.language_id = l.id
    LEFT JOIN genres g ON b.genre_id = g.id
    LEFT JOIN read_levels rl ON b.read_level_id = rl.id
  WHERE
    l.name = "Ewe"
  ORDER BY
    title ASC

  SELECT 
    b.id, b.asin, b.title, o.name, p.name, l.name, g.name, rl.name, a.name
  FROM 
    books b
    INNER JOIN authors_books ON b.id = authors_books.book_id
    INNER JOIN authors a ON authors_books.author_id = a.id 
    LEFT JOIN origins o ON b.origin_id = o.id
    LEFT JOIN publishers p ON b.publisher_id = p.id
    LEFT JOIN languages l ON b.language_id = l.id
    LEFT JOIN genres g ON b.genre_id = g.id
    LEFT JOIN read_levels rl ON b.read_level_id = rl.id
  WHERE
    l.name = "Ewe"
  ORDER BY
    title ASC

SELECT o.created_at, o.project_id, p.name
FROM
  orders o
LEFT JOIN projects p ON o.project_id = p.id
WHERE 

