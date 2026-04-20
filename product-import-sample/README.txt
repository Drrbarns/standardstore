PRODUCT IMPORT - SAMPLE ZIP TEMPLATE
=====================================

This folder is a ready-to-zip template for bulk product imports.

HOW TO USE:
-----------
1. Replace the placeholder images in the "images/" folder with your real product photos.
2. Edit "products.csv" with your real product data. 
3. Make sure every filename in the CSV "images" column matches a file in the "images/" folder.
4. Select this entire folder's contents and create a ZIP file.
5. Upload the ZIP file in Admin > Products > Import.

FOLDER STRUCTURE:
-----------------
product-import-sample/
├── README.txt           ← You're reading this
├── products.csv         ← Your product data (edit this)
└── images/              ← Your product images (replace these)
    ├── earbuds-white.jpg
    ├── earbuds-case.jpg
    └── ... (all referenced images)

CSV COLUMNS:
------------
Required:
  - name              Product name
  - price             Price in GH₵

Optional:
  - description       Product description (max ~500 chars)
  - category          Category name (must match an existing active category)
  - compare_at_price  Original price for showing discounts
  - quantity          Stock quantity (ignored if variants are provided)
  - moq               Minimum order quantity (default: 1)
  - status            Active, Draft, or Archived (default: Draft)
  - featured          true or false (default: false)
  - seo_title         SEO page title
  - seo_description   SEO meta description
  - keywords          Comma-separated tags (e.g., "earbuds,wireless,bluetooth")
  - low_stock_threshold  Alert when stock is below this (default: 5)
  - preorder_shipping    Pre-order text (e.g., "Ships in 14 days"), leave empty if ships immediately
  - images            Semicolon-separated image filenames (e.g., "front.jpg;side.jpg")

Variant columns (for products with Color/Size options):
  - variant_color     Color name (e.g., "Black", "Red")
  - variant_color_hex Hex color code (e.g., "#000000") — auto-filled for preset colors
  - variant_size      Size value (e.g., "S", "M", "L", "42")
  - variant_price     Variant-specific price (defaults to product price)
  - variant_stock     Variant stock quantity

Note: SKU and slug are auto-generated. Do not include them in the CSV.

VARIANTS:
---------
For products with variants, repeat the product on multiple rows with the same
name but different variant_color/variant_size values. Example:

  name,price,variant_color,variant_size,variant_stock
  "T-Shirt",35.00,"Black","S",80
  "T-Shirt",35.00,"Black","M",100
  "T-Shirt",35.00,"White","M",90

This creates 1 product ("T-Shirt") with 3 variants.

TIPS:
-----
- Image filenames are case-sensitive. "Photo.JPG" ≠ "photo.jpg"
- Use lowercase filenames with hyphens for best results.
- Supported image formats: .jpg, .jpeg, .png, .webp, .gif
- Max recommended image size: 10MB per image.
- Products without a status default to "Draft" (won't be visible on the store).
- Products without variants default to quantity 0 if not specified.

CREATING THE ZIP:
-----------------
On Mac:
  1. Open the folder containing products.csv and images/
  2. Select both products.csv and the images folder
  3. Right-click > "Compress 2 Items"

On Windows:
  1. Open the folder containing products.csv and images/
  2. Select both products.csv and the images folder
  3. Right-click > "Send to" > "Compressed (zipped) folder"

IMPORTANT: The ZIP should contain products.csv and images/ at the root level,
NOT nested inside another folder.

Correct ZIP structure:
  my-import.zip
  ├── products.csv
  └── images/
      ├── photo1.jpg
      └── photo2.jpg

Incorrect (extra nesting):
  my-import.zip
  └── product-import-sample/
      ├── products.csv
      └── images/
          ├── photo1.jpg
          └── photo2.jpg
